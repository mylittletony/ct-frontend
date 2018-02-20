'use strict';

var app = angular.module('myApp.people.directives', []);

app.directive('listPeople', ['People', 'Location', 'Audience', '$location', '$routeParams', '$mdDialog', 'showToast', 'showErrors', '$q','pagination_labels', 'gettextCatalog', function(People,Location,Audience,$location,$routeParams,$mdDialog,showToast,showErrors,$q, pagination_labels, gettextCatalog) {

  var link = function(scope, el, attrs, controller) {

    scope.currentNavItem = 'people';
    scope.location = {slug: $routeParams.id};
    scope.selected_audience = $routeParams.selected_audience;
    scope.new_audience = $routeParams.new_audience;
    scope.query = {
      limit:            $routeParams.per || 25,
      page:             $routeParams.page || 1,
      filter:           $routeParams.q,
      options:          [5,10,25,50,100],
      predicate_type:   $routeParams.predicate_type || 'and',
      predicates:       $routeParams.predicates || [],
    };

    scope.available_options = [];
    scope.available_options.push({value: 'created_at', name: 'First seen', desc: 'When the user first signed in through your WiFi network'});
    scope.available_options.push({value: 'last_seen', name: 'Last seen', desc: 'The last time they were seen on your network'});
    scope.available_options.push({value: 'logins_count', name: 'Number of logins', desc: 'Total number of logins through your network'});
    scope.available_options.push({value: 'email', name: 'Email Address', desc: 'Users associated with an email address on your network'});
    scope.available_options.push({value: 'username', name: 'Username', desc: 'Usernames on your network'});
    scope.available_options.push({value: 'first_name', name: 'First Name', desc: 'First names of users on your network'});
    scope.available_options.push({value: 'last_name', name: 'Last Name', desc: 'Last names of users on your network'});

    var removeFromList = function(person) {
      for (var i = 0, len = scope.people.length; i < len; i++) {
        if (scope.people[i].id === person.id) {
          scope.people.splice(i, 1);
          showToast(gettextCatalog.getString('Person successfully deleted.'));
          break;
        }
      }
    };

    scope.destroy = function(person) {
      People.destroy({location_id: scope.location.slug, id: person.id}).$promise.then(function(results) {
        removeFromList(person);
      }, function(err) {
        showErrors(err);
      });
    };

    scope.delete = function(person) {
      var confirm = $mdDialog.confirm()
      .title(gettextCatalog.getString('Delete Person'))
      .textContent(gettextCatalog.getString('Are you sure you want to delete this person?'))
      .ariaLabel(gettextCatalog.getString('Delete Person'))
      .ok(gettextCatalog.getString('Delete'))
      .cancel(gettextCatalog.getString('Cancel'));
      $mdDialog.show(confirm).then(function() {
        scope.destroy(person);
      }, function() {
      });
    };

    scope.newAudienceForm = function() {
      scope.query.predicates = [];
      scope.query.predicate_type = 'and';
      scope.selected_audience = undefined;
      scope.new_audience = true;
    };

    scope.filterByAudience = function(id) {
      if (id === undefined) {
        scope.selected_audience = undefined;
        scope.query.predicates = [];
      } else {
        var audience;
        for (var i = 0, len = scope.audiences.length; i < len; i++) {
          if (scope.audiences[i].id === id) {
            audience = scope.audiences[i];
          }
        }
        scope.query.predicates = audience.predicates;
        scope.query.predicate_type = audience.predicate_type;
        scope.selected_audience = audience.id;
      }
      scope.new_audience = undefined;
      scope.updatePage();
    };

    scope.onPaginate = function (page, limit) {
      scope.query.page = page;
      scope.query.limit = limit;
      scope.updatePage();
    };

    scope.cancelRule = function() {
      scope.showChooser = undefined;
      scope.focusedCard = undefined;
    };

    scope.onSelect = function(index) {
      scope.showChooser = undefined;
      var pred = { value: '', operator: 'gte', relative: true };
      switch(index) {
        case 0:
          pred.name = 'First seen';
          pred.attribute = 'created_at';
          pred.operator = 'lte';
          break;
        case 1:
          pred.name = 'Last seen';
          pred.attribute = 'last_seen';
          pred.operator = 'lte';
          break;
        case 2:
          pred.name = 'Number of logins';
          pred.attribute = 'login_count';
          pred.operator = 'gte';
          break;
        case 3:
          pred.name = 'Email Address';
          pred.attribute = 'email';
          pred.operator = 'eq';
          break;
        case 4:
          pred.name = 'Username';
          pred.attribute = 'username';
          pred.operator = 'eq';
          break;
        case 5:
          pred.name = 'First Name';
          pred.attribute = 'first_name';
          pred.operator = 'eq';
          break;
        case 6:
          pred.name = 'Last Name';
          pred.attribute = 'last_name';
          pred.operator = 'eq';
          break;
      }
      scope.query.predicates.push(pred);
    };

    scope.savePredicate = function() {
      scope.focusedCard = undefined;
      scope.updatePage();
    };

    var getAudiences = function() {
      var deferred = $q.defer();
      Audience.query({location_id: scope.location.slug}, function(data) {
        scope.audiences = data.audiences;
        deferred.resolve();
      }, function(err) {
        console.log(err);
        deferred.reject();
      });
      return deferred.promise;
    };

    var removeAudienceFromList = function(audience_id) {
      for (var i = 0, len = scope.audiences.length; i < len; i++) {
        if (scope.audiences[i].id === audience_id) {
          scope.audiences.splice(i, 1);
          showToast(gettextCatalog.getString('Audience successfully deleted.'));
          if (scope.selected_audience === audience_id) {
            scope.query.predicates = [];
            scope.selected_audience = undefined;
            scope.updatePage();
          }
          break;
        }
      }
    };

    scope.destroyAudience = function(audience_id) {
      Audience.destroy({location_id: scope.location.slug, id: audience_id}).$promise.then(function(results) {
        removeAudienceFromList(audience_id);
      }, function(err) {
        showErrors(err);
      });
    };

    scope.createAudience = function(name) {
      Audience.create({}, {
        location_id: scope.location.slug,
        audience: {
          name: name,
          predicate_type: scope.query.predicate_type,
          predicates: scope.query.predicates
        }
      }).$promise.then(function(data) {
        showToast(gettextCatalog.getString('Audience saved.'));
        getAudiences().then(function() {
          scope.selected_audience = data.id;
        });
        scope.new_audience = undefined;
        $mdDialog.cancel();
      }, function(error) {
        showErrors(error);
      });
    };

    function DialogController($scope, query) {
      $scope.location = location;
      $scope.query = query;
      $scope.close = function() {
        $mdDialog.cancel();
      };
      $scope.save = function() {
        scope.createAudience($scope.audience.name);
        $mdDialog.cancel();
      };
    }

    DialogController.$inject = ['$scope', 'query'];

    scope.openDialog = function() {
      $mdDialog.show({
        templateUrl: 'components/audiences/_create_audience.html',
        parent: angular.element(document.body),
        clickOutsideToClose: true,
        controller: DialogController,
        locals: {
          query: scope.query
        }
      });
    };

    var updateAudience = function(audience_id) {
      Audience.update({}, {
        location_id: $routeParams.id,
        id: audience_id,
        audience: {
          predicates: scope.query.predicates,
          predicate_type: scope.query.predicate_type
        }
      }).$promise.then(function(results) {
        showToast(gettextCatalog.getString('Campaign successfully updated.'));
        getAudiences().then(function() {
          scope.selected_audience = results.id;
        });
      }, function(err) {
        showErrors(err);
      });
    };

    scope.saveAudience = function() {
      if (scope.selected_audience) {
        updateAudience(scope.selected_audience);
      } else {
        scope.openDialog(scope.location, scope.query);
      }
    };

    scope.cancelAudience = function() {
      scope.query.predicates = [];
      scope.query.predicate_type = undefined;
      scope.focusedCard = undefined;
      scope.showChooser = undefined;
      scope.new_audience = undefined;
      scope.updatePage();
    };

    scope.addRule = function() {
      if (!scope.query.predicates) {
        scope.query.predicates = [];
      }
      scope.focusedCard = scope.query.predicates.length;
      scope.showChooser = true;
    };

    scope.removePredicate = function(index) {
      scope.query.predicates.splice(index, 1);
      scope.focusedCard = undefined;
      scope.updatePage();
    };

    var getPeople = function() {
      var params = {
        page: scope.query.page,
        per: scope.query.limit,
        location_id: scope.location.slug,
        q: scope.query.filter
      };
      if (scope.query.predicates.length > 0) {
        params.audience = {
          predicates: scope.query.predicates,
          predicate_type: scope.query.predicate_type
        };
      }
      People.get(params, function(data) {
        scope.people = data.people;
        scope._links = data._links;
        scope.loading  = undefined;
      }, function(err){
        scope.loading  = undefined;
        console.log(err);
      });
    };

    var checkForGuide = function() {
      var setup = scope.location.setup;
      if ($location.path().split('/')[2] !== 'people' && (setup.splash === false || setup.integrations === false || scope.location.paid === false)) {
        $location.path('/' + scope.location.slug + '/guide');
      } else {
        getAudiences();
        getPeople();
      }
    };

    var getLocation = function() {
      Location.get({id: $routeParams.id}, function(data) {
        scope.location = data;
        checkForGuide();
      }, function(err){
        console.log(err);
      });
    };

    var init = function() {
      getLocation();
    };

    scope.updatePage = function(item) {
      var hash    = {};
      hash.page   = scope.query.page;
      hash.q   = scope.query.filter;
      hash.predicate_type = scope.query.predicate_type;
      hash.predicates = scope.query.predicates;
      hash.selected_audience = scope.selected_audience;
      hash.new_audience = scope.new_audience;

      $location.search(hash);
      init();
    };

    init();
  };

  return {
    link: link,
    templateUrl: 'components/locations/people/_index.html'
  };

}]);

app.directive('displayPerson', ['People', 'Location', 'Social', 'Guest', 'Email', 'Code', 'Client', '$routeParams', '$location', '$http', '$compile', '$rootScope', '$timeout', '$pusher', 'showToast', 'showErrors', 'menu', '$mdDialog', 'gettextCatalog', function(People, Location, Social, Guest, Email, Code, Client, $routeParams, $location, $http, $compile, $rootScope, $timeout, $pusher, showToast, showErrors, menu, $mdDialog, gettextCatalog) {

  var link = function(scope, element, attrs) {

    scope.currentNavItem = 'people';

    scope.editName = function(editState) {
      if (editState === true) {
        scope.edit_username = false;
      } else {
        scope.edit_username = true;
      }
    };

    var setProfilePhoto = function() {
      if (scope.person.social && scope.person.social[0].facebook_id) {
        scope.person.profile_photo = 'https://graph.facebook.com/' + scope.person.social[0].facebook_id + '/picture?type=large';
      } else {
        scope.person.profile_photo = 'https://s3-eu-west-1.amazonaws.com/mimo-labs/images/mimo-logo.svg';
      }
    };

    var getSocials = function() {
      Social.get({
        person_id: scope.person.id,
        location_id: scope.location.id
      }).$promise.then(function(results) {
        scope.person.social = results.social;
        setProfilePhoto();
      }, function(err) {
      });
    };

    var getGuests = function() {
      Guest.get({
        person_id: scope.person.id,
        location_id: scope.location.id
      }).$promise.then(function(results) {
        scope.person.guests = results.guests;
      }, function(err) {
      });
    };

    var getEmails = function() {
      Email.get({
        person_id: scope.person.id,
        location_id: scope.location.id
      }).$promise.then(function(results) {
        scope.person.emails = results.emails;
      }, function(err) {
      });
    };

    var getCodes = function() {
      Code.get({
        person_id: scope.person.id,
        location_id: scope.location.slug
      }).$promise.then(function(results) {
        scope.person.codes = results.codes;
      }, function(err) {
      });
    };

    var getClients = function() {
      Client.query({
        person_id: scope.person.id,
        location_id: scope.location.id
      }).$promise.then(function(results) {
        scope.person.clients = results.clients;
      }, function(err) {
      });
    };

    var getRelations = function() {
      getSocials();
      getGuests();
      getEmails();
      getCodes();
      getClients();
    };

    scope.saveUsername = function() {
      People.update({}, {
        location_id: scope.location.slug,
        id: scope.person.id,
        person: {
          username: scope.person.username
        }
      }).$promise.then(function(results) {
        scope.person = results;
        getRelations();
        scope.edit_username = false;
      }, function(error) {
        showErrors(error);
      });
    };

    var getPerson = function() {
      People.query({location_id: scope.location.slug, id: $routeParams.person_id}).$promise.then(function(res) {
        scope.person = res;
        getRelations();
        scope.loading  = undefined;
      }, function(err) {
        scope.loading  = undefined;
        console.log(err);
      });
    };

    var init = function() {
      Location.get({id: $routeParams.id}, function(data) {
        scope.location = data;
        getPerson();
      }, function(err){
        console.log(err);
      });
    };

    scope.back = function() {
      window.history.back();
    };

    init();

  };

  return {
    link: link,
    scope: {
      loading: '='
    },
    templateUrl: 'components/locations/people/_show.html'
  };

}]);

app.directive('peopleNav', [function() {

  var link = function(scope, element, attrs) {
  };

  return {
    link: link,
    templateUrl: 'components/locations/people/_nav.html'
  };

}]);

app.directive('peopleReports', ['People', 'Location', '$routeParams', '$location', '$http', '$compile', '$rootScope', '$timeout', '$pusher', 'showToast', 'showErrors', 'menu', '$mdDialog', 'gettextCatalog', function(People, Location, $routeParams, $location, $http, $compile, $rootScope, $timeout, $pusher, showToast, showErrors, menu, $mdDialog, gettextCatalog) {

  var link = function(scope, element, attrs) {

    scope.currentNavItem = 'reports';

    scope.period = $routeParams.period || '7d';

    var init = function() {
      Location.get({id: $routeParams.id}, function(data) {
        scope.location = data;
        scope.loading = undefined;
      }, function(err){
        console.log(err);
      });
    };

    scope.changePeriod = function() {
      var hash    = {};
      hash.period   = scope.period;

      $location.search(hash);
      init();
    };

    init();

  };

  return {
    link: link,
    scope: {
      loading: '='
    },
    templateUrl: 'components/locations/people/_reports.html'
  };

}]);
