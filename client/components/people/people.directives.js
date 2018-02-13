'use strict';

var app = angular.module('myApp.people.directives', []);

app.directive('listPeople', ['People', 'Location', '$location', '$routeParams', '$mdDialog', 'showToast', 'showErrors', '$q','pagination_labels', 'gettextCatalog', function(People,Location,$location,$routeParams,$mdDialog,showToast,showErrors,$q, pagination_labels, gettextCatalog) {

  var link = function(scope, el, attrs, controller) {

    scope.currentNavItem = 'people';
    scope.location = {slug: $routeParams.id};
    scope.query = {
      limit:      $routeParams.per || 25,
      page:       $routeParams.page || 1,
      options:    [5,10,25,50,100]
    };

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

    scope.onPaginate = function (page, limit) {
      scope.query.page = page;
      scope.query.limit = limit;
      scope.updatePage();
    };

    var getPeople = function() {
      var params = {
        page: scope.query.page,
        per: scope.query.limit,
        location_id: scope.location.slug
      };
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
      scope.page  = scope._links.current_page;
      hash.page   = scope.query.page;

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
