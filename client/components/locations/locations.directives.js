'use strict';

var app = angular.module('myApp.locations.directives', []);

app.directive('locationShow', ['Location', '$routeParams', '$location', 'showToast', 'menu', '$pusher', '$route', '$rootScope', 'gettextCatalog', 'snapshotDateTimePicker', function(Location, $routeParams, $location, showToast, menu, $pusher, $route, $rootScope, gettextCatalog, snapshotDateTimePicker) {

  var link = function(scope,element,attrs,controller) {

    var channel;
    scope.streamingUpdates = true;

    scope.favourite = function() {
      scope.location.is_favourite = !scope.location.is_favourite;
      updateLocation();
    };

    scope.streamingUpdater = function() {
      $rootScope.$broadcast('streaming', { enabled: scope.streamingUpdates });
    };

    function updateLocation() {
      Location.update({}, {
        id: $routeParams.id,
        location: {
          favourite: scope.location.is_favourite
        }
      }).$promise.then(function(results) {
        var val = scope.location.is_favourite ? gettextCatalog.getString('added to') : gettextCatalog.getString('removed from');
        showToast(gettextCatalog.getString('Location {{val}} favourites.', {val: val}));
      }, function(err) {
      });
    }

    scope.addDevice = function() {
      window.location.href = '/#/locations/' + scope.location.slug + '/boxes/new';
    };

    function durationToSeconds(duration) {
      switch(duration) {
        case '60m':
          return 3600
          break;
        case '6h':
          return 21600
          break;
        case '1d':
          return 86400
          break;
        case '7d':
          return 604800
          break;
        case '30d':
          return 2592000
          break;
        default:
          console.log('Whatchu talking \'bout Willis');
      }
    };

    scope.updateDuration = function(duration) {
      snapshotDateTimePicker.update(scope.snapshotDate, scope.snapshotTime, durationToSeconds(duration));
    };

  };

  return {
    scope: {
      objectToInject: '='
    },
    link: link,
    controller: 'LocationsCtrl',
    templateUrl: 'components/locations/show/_index.html'
  };

}]);


app.directive('locationDevices', ['Location', '$routeParams', '$location', 'showToast', 'menu', '$pusher', '$route', '$rootScope', 'gettextCatalog', function(Location, $routeParams, $location, showToast, menu, $pusher, $route, $rootScope, gettextCatalog) {

  var link = function(scope,element,attrs,controller) {

    var channel;
    scope.streamingUpdates = true;

    scope.favourite = function() {
      scope.location.is_favourite = !scope.location.is_favourite;
      updateLocation();
    };

    scope.streamingUpdater = function() {
      $rootScope.$broadcast('streaming', { enabled: scope.streamingUpdates });
    };

    function updateLocation() {
      Location.update({}, {
        id: $routeParams.id,
        location: {
          favourite: scope.location.is_favourite
        }
      }).$promise.then(function(results) {
        var val = scope.location.is_favourite ? gettextCatalog.getString('added to') : gettextCatalog.getString('removed from');
        showToast(gettextCatalog.getString('Location {{val}} favourites.', {val: val}));
      }, function(err) {
      });
    }

    scope.addDevice = function() {
      window.location.href = '/#/locations/' + scope.location.slug + '/boxes/new';
    };

  };

  return {
    scope: {
    },
    link: link,
    controller: 'LocationsCtrl',
    templateUrl: 'components/locations/show/_devices.html'
  };

}]);

app.directive('listLocations', ['Location', '$routeParams', '$rootScope', '$http', '$location', 'menu', 'locationHelper', '$q','Shortener', 'gettextCatalog', 'pagination_labels', function (Location, $routeParams, $rootScope, $http, $location, menu, locationHelper, $q, Shortener, gettextCatalog, pagination_labels) {

  var link = function(scope,element,attrs) {

    menu.isOpenLeft = false;
    menu.isOpen = false;
    menu.hideBurger = true;
    menu.sectionName = gettextCatalog.getString('Locations');

    if ($routeParams.user_id) {
      scope.user_id = parseInt($routeParams.user_id);
    }

    scope.options = {
      boundaryLinks: false,
      largeEditDialog: false,
      pageSelector: false,
      rowSelection: false
    };

    scope.pagination_labels = pagination_labels;
    scope.query = {
      order:      'updated_at',
      filter:     $routeParams.q,
      limit:      $routeParams.per || 25,
      page:       $routeParams.page || 1,
      options:    [5,10,25,50,100],
      direction:  $routeParams.direction || 'desc',
      sort:  $routeParams.sort || 'updated_at'
    };

    scope.sort = function(val, reverse) {
      if (scope.query.direction === 'asc') {
        scope.query.direction = 'desc';
      } else {
        scope.query.direction = 'asc';
      }
      var page = $routeParams.page || 1;
      var limit = $routeParams.per || 25;
      scope.onPaginate(page, limit, val);
    };

    scope.onPaginate = function (page, limit, val) {
      scope.query.page = page;
      scope.query.limit = limit;
      scope.query.sort = val || $routeParams.sort;
      scope.blur();
    };

    scope.blur = function() {
      var hash = {};
      hash.page = scope.query.page;
      hash.per = scope.query.limit;
      hash.sort = scope.query.sort;
      hash.direction = scope.query.direction;
      hash.q = scope.query.filter;
      if (scope.user_id) {
        hash.user_id = scope.user_id
      }
      $location.search(hash);
    };

    var filterLocationOwners = function() {
      if (scope.user_id && scope.locations.length > 0) {
        for (var i = 0, len = scope.locations.length; i < len; i++) {
          if (scope.locations[i].user_id === scope.user_id) {
            scope.locations[i].owner = true;
          }
        }
      }
    };

    var init = function() {
      Location.query({
        q: scope.query.filter,
        page: scope.query.page,
        per: scope.query.limit,
        sort: scope.query.sort,
        direction: scope.query.direction,
        user_id: scope.user_id
      }).$promise.then(function(results) {
        scope.total_locs  = results._links.total_entries;
        scope.locations   = results.locations;
        scope._links      = results._links;
        filterLocationOwners();
        scope.searching   = undefined;
        scope.loading     = undefined;
      }, function() {
        scope.loading   = undefined;
        scope.searching = undefined;
      });
    };

    init();
  };

  return {
    link: link,
    templateUrl: 'components/locations/index/_list.html',
    scope: {}
  };

}]);

app.directive('homeDashboard', ['Location', '$routeParams', '$rootScope', '$http', '$location', '$cookies', 'locationHelper', '$q','Shortener', '$timeout', 'Box', function (Location, $routeParams, $rootScope, $http, $location, $cookies, locationHelper, $q, Shortener, $timeout, Box) {

  var link = function(scope,element,attrs) {

    var load = function() {
      scope.querySearch        = querySearch;
      scope.selectedItemChange = selectedItemChange;
      scope.searchTextChange   = searchTextChange;

      if ($rootScope.loggedIn || (scope.$parent.loggedIn && scope.$parent.loggedOut === undefined)) {
        scope.loggedIn = true;
      }

      if ($routeParams.pinned) {
        scope.pinned = true;
      }

      scope.loading = undefined;
    };

    function querySearch (query) {
      var deferred = $q.defer();
      Location.query({q: query, aggs: true}).$promise.then(function(results) {
        deferred.resolve(results.results);
      }, function() {
        deferred.reject();
      });
      return deferred.promise;
    }

    function shortener () {
      Shortener.get({short: $routeParams.xtr}).$promise.then(function(results) {
        $location.path(results.url);
        $location.search({});
      }, function() {
        $location.search({});
      });
    }

    scope.create = function(name) {
      $location.path('/locations/new');
      $location.search({name: name});
    };

    function searchTextChange(id) {
    }

    var timer;
    function selectedItemChange(item) {
      timer = $timeout(function() {
        var hash = {};
        if (item && item._index) {
          switch(item._index) {
            case 'locations':
              goLocation(item._key);
            break;
          case 'devices':
            goDevice(item._key);
          break;
        default:
          console.log(item._index);
          }
        }
      }, 250);
    }

    var goLocation = function(query) {
      Location.query({location_name: query}).$promise.then(function(results) {
        $location.path('/locations/' + results.locations[0].slug);
      }, function(err) {
        console.log(err);
      });
    };

    var goDevice = function(query) {
      Box.query({description: query}).$promise.then(function(results) {
        $location.path('/locations/' + results.boxes[0].location_slug + '/devices/' + results.boxes[0].slug);
      }, function(err) {
        console.log(err);
      });

    };

    if ($routeParams.xtr) {
      shortener();
    } else {
      load();
    }

  };

  return {
    link: link,
    templateUrl: 'components/locations/index/_index.html',
    scope: {}
  };

}]);

app.directive('periscope', ['Report', '$routeParams', '$timeout', function (Report, $routeParams, $timeout) {

  var link = function(scope,element,attrs) {

    var chart = function(results) {

      function drawChart() {

        // devices throws an error, check what the backend is sending and imp a fix SM
        var data = new window.google.visualization.DataTable();
        var devices = JSON.parse(results.periscope.devices);
        var uniques = JSON.parse(results.periscope.splash_uniques);

        data.addColumn('date', 'Date');
        data.addColumn('number', 'Splash Users');
        data.addColumn('number', 'Wireless Clients');

        var start = new Date(results._stats.start * 1000);

        for(var i = 0; i < devices.length; i++) {
          var newDate = start.setDate(start.getDate() + 1);
          data.addRow([new Date(newDate), uniques[i], devices[i]]);
        }

        var options = {
          legend: {
            position: 'none'
          },
          lineWidth: 1.5,
          vAxis: {
            viewWindow: {
              min: 0
            }
          },
          hAxis: {
            format: 'dd MMM'
          },
          chartArea: {
            left: '10%',
            top: '3%',
            height: '74%',
            width: '87%'
          }
        };

        var chart = new window.google.visualization.LineChart(document.getElementById('line'));
        chart.draw(data, options);
      }

      window.google.charts.setOnLoadCallback(drawChart);

    };

    var init = function() {
      Report.periscope({}, { v: 2, periscope: true }).$promise.then(function(results) {
        if (results && results.periscope) {
          chart(results);
        }
      });
    };

    init();

  };

  return {
    link: link,
    scope: {},
    templateUrl: 'components/locations/show/_periscope.html',
  };

}]);

app.directive('changeLocationToken', ['Location', '$routeParams', 'showToast', 'showErrors', '$mdDialog', 'gettextCatalog', function (Location, $routeParams, showToast, showErrors, $mdDialog, gettextCatalog) {

  var link = function(scope,element,attrs) {

    scope.changeToken = function(box,ev) {
      var confirm = $mdDialog.confirm()
        .title(gettextCatalog.getString('Are you sure you want to change the API Token?'))
        .textContent(gettextCatalog.getString('This will revoke your existing credentials and cannot be reversed.'))
        .ariaLabel(gettextCatalog.getString('Revoke'))
        .targetEvent(ev)
        .ok(gettextCatalog.getString('Revoke it'))
        .cancel(gettextCatalog.getString('Cancel'));
      $mdDialog.show(confirm).then(function() {
        changeToken();
      });
    };

    var changeToken = function() {
      if (scope.loading === undefined) {
        updateLocation();
      }
    };

    function updateLocation() {
      Location.update({}, {
        id: $routeParams.id,
        location: {
          update_token: true
        }
      }).$promise.then(function(results) {
        scope.token = results.api_token;
        showToast(gettextCatalog.getString('Token successfully changed.'));
      }, function(err) {
        showErrors(err);
      });
    }

  };

  return {
    link: link,
    scope: {
      token: '='
    },
    templateUrl: 'components/locations/settings/_change_token.html',
  };

}]);

app.directive('dashing', ['Report', function (Report) {

  var link = function(scope,element,attrs) {

    scope.loading = true;

    var init = function() {

      Report.dashboard({dashing: true, v: 2}).$promise.then(function(results) {
        scope.stats     = results.stats;
        process();
        scope.loading   = undefined;
      });

    };

    function process () {
      angular.forEach(scope.stats.boxes.states, function(b) {
        if (b.state === 'offline') {
          scope.offline = b.total;
        } else if (b.state === 'online') {
          scope.online = b.total;
        } else if (b.state === 'online') {
          scope.online = b.total;
        } else if (b.state === 'splash_only') {
          scope.splash_only = b.total;
        }
      });
    }

    init();

  };

  return {
    link: link,
    scope: {
      locations: '@'
    },
    templateUrl: 'components/locations/show/_dashing.html',
  };

}]);

app.directive('locationShortlist', function() {
  return {
    templateUrl: 'components/locations/layouts/short-list.html'
  };
});

app.directive('newLocationForm', ['Location', 'Project', '$location', 'menu', 'showErrors', 'showToast', '$routeParams', 'gettextCatalog', 'BrandName', function(Location, Project, $location, menu, showErrors, showToast, $routeParams, gettextCatalog, BrandName) {

  var link = function( scope, element, attrs ) {

    scope.loading = true;
    menu.isOpen = false;
    menu.hideBurger = true;
    scope.brand = BrandName;
    scope.location  = {
      add_to_global_map: false,
      location_name: $routeParams.name
    };

    scope.save = function(form, location) {
      form.$setPristine();
      scope.location.creating = true;
      updateCT(location);
    };

    var updateCT = function(location) {
      location.brand_id = scope.brand.id;
      Location.save({
        location: location,
      }).$promise.then(function(results) {
        $location.path('/locations/' + results.slug);
        $location.search({gs: true});
        menu.isOpen = true;
        menu.hideBurger = false;
        showToast(gettextCatalog.getString('Location successfully created.'));
      }, function(err) {
        showErrors(err);
      });
    };

    scope.back = function() {
      if (scope.location.id) {
        window.location.href = '/#/locations/' + scope.location.slug;
      } else {
        $location.path('/');
        $location.search({});
      }
    };

    var project;
    var setProjects = function(projects) {
      for (var i = 0, len = projects.length; i < len; i++) {
        if (projects[i].type === 'rw' ) {
          scope.projects.push(projects[i]);
          if (project && projects[i].project_name === project) {
            scope.location.project_id = projects[i].id;
          }
        }
      }
    };

    var setProject = function(projects) {
      project = $routeParams.project;
      if (projects.length > 0) {
        scope.projects = [];
        setProjects(projects);
        if ((scope.projects.length === 1) ||
            (scope.projects.length > 1 && !scope.location.project_id)) {
          scope.location.project_id = scope.projects[0].id;
        }
      }
    };

    var init = function() {
      Project.get({}).$promise.then(function(results) {
        setProject(results.projects);
        scope.loading = undefined;
      }, function(err) {
        scope.loading = undefined;
      });
    };

    init();
  };

  return {
    link: link,
    restrict: 'E',
    scope: {
      // accountId: '@'
    },
    templateUrl: 'components/locations/new/_index.html'
  };

}]);

app.directive('newLocationCreating', ['Location', '$location', function(Location, $location) {

  var link = function( scope, element, attrs ) {
    scope.locationFinalised = function() {
      scope.location.attr_generated = true;
      $location.path('/locations/' + scope.location.slug);
      scope.newLocationModal();
    };
  };

  return {
    link: link,
    templateUrl: 'components/locations/show/attr-generated.html'
  };

}]);

app.directive('locationAdmins', ['Location', 'Invite', '$routeParams', '$mdDialog', 'showToast', 'showErrors', '$pusher', '$rootScope', '$timeout', 'gettextCatalog', 'pagination_labels', function(Location, Invite, $routeParams, $mdDialog, showToast, showErrors, $pusher, $rootScope, $timeout, gettextCatalog, pagination_labels) {

  var link = function( scope, element, attrs ) {

    scope.users = [];
    scope.roles = [
      { role_id: 110, name: gettextCatalog.getString('Administrator') },
      { role_id: 120, name: gettextCatalog.getString('Editor') },
      { role_id: 130, name: gettextCatalog.getString('Supporter') },
      { role_id: 140, name: gettextCatalog.getString('Observer') }
    ];

    scope.pagination_labels = pagination_labels;
    scope.query = {
      order:      'username',
      limit:      $routeParams.per || 25,
      page:       $routeParams.page || 1,
      options:    [5,10,25,50,100],
      // direction:  $routeParams.direction || 'desc'
    };

    // scope.onPaginate = function (page, limit) {
    //   scope.query.page = page;
    //   scope.query.limit = limit;
    //   scope.updatePage();
    // };

    // scope.updatePage = function(item) {

    // };

    var channel;
    function loadPusher(key) {
      if (scope.pusherLoaded === undefined && typeof client !== 'undefined') {
        scope.pusherLoaded = true;
        var pusher = $pusher(client);
        channel = pusher.subscribe('private-' + key);
        channel.bind('invites', function(data) {
          console.log('Message recvd.', data);
          if (data.message.success === true) {
            showToast(data.message.msg);
          } else {
            // Someone should fix the showErrors service so we can send an object in
            showErrors({message: data.message.msg });
          }
        });
      }
    }

    // User Permissions //
    var createMenu = function() {
      scope.allowed = true;
      scope.menu = [];

      scope.menu.push({
        name: gettextCatalog.getString('View'),
        type: 'view',
        icon: 'pageview'
      });

      scope.menu.push({
        name: gettextCatalog.getString('Edit'),
        type: 'edit',
        icon: 'settings'
      });

      scope.menu.push({
        name: gettextCatalog.getString('Revoke'),
        type: 'revoke',
        icon: 'delete_forever'
      });
    };

    scope.action = function(type,user) {
      switch(type) {
        case 'view':
          view(user);
        break;
      case 'revoke':
        revoke(user);
      break;
    case 'edit':
      edit(user);
    break;
      }
    };

    scope.options = {
      autoSelect: true,
      boundaryLinks: false,
      pageSelector: false,
    };

    scope.query = {
      order: 'state',
      limit: $routeParams.per || 50,
      page: $routeParams.page || 1
    };

    function allowedEmail(email) {
      var truth = true;
      for (var i = 0, len = scope.users.length; i < len; i++) {
        if (scope.users[i].email === email) {
          truth = false;
          break;
        }
      }
      return truth;
    }

    scope.invite = function() {
      $mdDialog.show({
        templateUrl: 'components/locations/users/_invite.html',
        clickOutsideToClose: true,
        parent: angular.element(document.body),
        controller: DialogController,
        locals: {
          roles: scope.roles
        }
      });
    };

    function DialogController ($scope, roles) {
      $scope.roles = roles;
      $scope.user = { role_id: roles[0].role_id };
      $scope.close = function() {
        $mdDialog.cancel();
      };
      $scope.invite = function(user) {
        $mdDialog.cancel();
        inviteUser(user);
      };
    }
    DialogController.$inject = ['$scope', 'roles'];

    var inviteUser = function(invite) {
      if (allowedEmail(invite.email)) {
        Invite.create({
          location_id: scope.location.slug,
          invite: invite
        }).$promise.then(function(results) {
          scope.users.push(results);
        }, function(err) {
          showErrors(err);
        });
      } else {
        showErrors({message: gettextCatalog.getString('This email has already been added') });
      }
    };

    var revoke = function(user) {
      $mdDialog.show({
        templateUrl: 'components/locations/users/_revoke.html',
        parent: angular.element(document.body),
        controller: RevokeController,
        clickOutsideToClose: true,
        locals: {
          user: user,
        }
      });
      // var confirm = $mdDialog.confirm()
      // .title(gettextCatalog.getString('Remove User'))
      // .textContent(gettextCatalog.getString('Removing a user will prevent them from accessing this location.'))
      // .ariaLabel(gettextCatalog.getString('Remove'))
      // .ok(gettextCatalog.getString('remove'))
      // .cancel(gettextCatalog.getString('Cancel'));
      // $mdDialog.show(confirm).then(function() {
      //   revokeAdmin(user);
      // });
    };

    function RevokeController ($scope, user) {
      $scope.user = user;
      $scope.update = function() {
        $mdDialog.cancel();
        revokeAdmin($scope.user);
      };
      $scope.close = function() {
        $mdDialog.cancel();
      };
    }
    RevokeController.$inject = ['$scope', 'user'];

    var revokeAdmin = function(invite) {
      invite.state = 'revoking';
      Invite.destroy({location_id: scope.location.slug, invite: invite}).$promise.then(function(results) {
        removeFromList(invite.email);
      }, function(err) {
        showErrors(err);
      });
    };

    var removeFromList = function(email) {
      for (var i = 0, len = scope.users.length; i < len; i++) {
        if (scope.users[i].email === email) {
          scope.users.splice(i, 1);
          break;
        }
      }
    };

    var edit = function(user) {
      $mdDialog.show({
        templateUrl: 'components/locations/users/_edit.html',
        parent: angular.element(document.body),
        controller: EditRoleController,
        clickOutsideToClose: true,
        locals: {
          user: user,
          roles: scope.roles
        }
      });
    };

    function EditRoleController ($scope, user, roles) {
      $scope.user = user;
      $scope.roles = roles;
      $scope.update = function() {
        $mdDialog.cancel();
        updateRole(user);
      };
      $scope.close = function() {
        $mdDialog.cancel();
      };
    }
    EditRoleController.$inject = ['$scope', 'user', 'roles'];

    var updateRole = function(user) {
      Invite.update({
        location_id: scope.location.slug,
        email: user.email,
        role_id: user.role_id
      }).$promise.then(function(results) {
        showToast('User successfully updated.');
      }, function(err) {
        showErrors(err);
        scope.loading = undefined;
      });
    };

    var init = function() {
      Location.users({id: scope.location.slug}).$promise.then(function(results) {
        scope.users = results;
        createMenu();
        scope.loading = undefined;
      }, function(err) {
        scope.loading = undefined;
        console.log(err);
      });
    };

    var view = function(user) {
      window.location.href = '/#/users/' + user.slug;
    };

    init();

    var timer = $timeout(function() {
      loadPusher(scope.location.pubsub_token);
      $timeout.cancel(timer);
    }, 500);

  };

  return {
    link: link,
    scope: {
      id: '@',
      loading: '=',
      location: '='
    },
    templateUrl: 'components/locations/users/_index.html'
  };
}]);

app.directive('locationMap', ['Location', 'Box', '$routeParams', '$mdDialog', 'showToast', 'showErrors', '$pusher', '$q', function(Location, Box, $routeParams, $mdDialog, showToast, showErrors, $pusher, $q) {

  var link = function( scope, element, attrs ) {

    scope.updateCT = function(opts) {
      scope.box = {
        latitude: opts.lat,
        longitude: opts.lng
      };
      Box.update({id: opts.slug, box: scope.box}).$promise.then(function(data) {

      });
    };

    var init = function() {
      scope.deferred = $q.defer();
      Box.query({
        location_id: scope.location.slug,
        metadata: true
      }).$promise.then(function(results) {
        scope.boxes           = results.boxes;
        scope.loading         = undefined;
        scope.deferred.resolve();
      }, function(err) {
        scope.loading = undefined;
      });
    };

    init();

  };

  return {
    link: link,
    scope: {
      location: '='
    },
    templateUrl: 'components/locations/show/_map.html'
  };
}]);

app.directive('locationBoxes', ['Location', '$location', 'Box', '$routeParams', '$mdDialog', '$mdMedia', 'LocationPayload', 'showToast', 'showErrors', '$q', '$mdEditDialog', 'Zone', '$pusher', '$rootScope', 'gettextCatalog', 'pagination_labels', '$timeout', function(Location, $location, Box, $routeParams, $mdDialog, $mdMedia, LocationPayload, showToast, showErrors, $q, $mdEditDialog, Zone, $pusher, $rootScope, gettextCatalog, pagination_labels, $timeout) {

  var link = function( scope, element, attrs ) {
    scope.selected = [];
    scope.location = {
      slug: $routeParams.id
    };

    // User Permissions //
    var createMenu = function() {

      scope.menuItems = [];

      scope.menuItems.push({
        name: gettextCatalog.getString('Edit'),
        type: 'edit',
        icon: 'settings'
      });

      scope.menuItems.push({
        name: gettextCatalog.getString('Reboot'),
        type: 'reboot',
        icon: 'autorenew'
      });

      scope.menuItems.push({
        name: gettextCatalog.getString('Run Payload'),
        type: 'payload',
        icon: 'present_to_all'
      });

      scope.menuItems.push({
        name: gettextCatalog.getString('Edit Zones'),
        type: 'zones',
        icon: 'layers'
      });

      scope.menuItems.push({
        name: gettextCatalog.getString('Resync'),
        type: 'resync',
        icon: 'settings_backup_restore'
      });

      scope.menuItems.push({
        name: gettextCatalog.getString('Delete'),
        type: 'delete',
        icon: 'delete_forever'
      });
    };

    createMenu();

    scope.options = {
      boundaryLinks: false,
      pageSelector: false,
      rowSelection: true
    };

    scope.pagination_labels = pagination_labels;
    scope.query = {
      order:          '-last_heartbeat',
      limit:          $routeParams.per || 25,
      page:           $routeParams.page || 1,
      options:        [5,10,25,50,100],
      direction:      $routeParams.direction || 'desc'
    };

    scope.onPaginate = function (page, limit) {
      scope.query.page = page;
      scope.query.limit = limit;
      search();
    };

    var search = function() {
      var hash            = {};
      hash.page           = scope.query.page;
      hash.per            = scope.query.limit;
      $location.search(hash);
      init();
    };

    scope.disabled = function(box,type) {
      if (type === 'edit' || type === 'delete' || type === 'view' || type === 'zones') {
        return false;
      } else if (type === 'ignore' && !box.allowed_job) {
        return false;
      } else {
        return !box.allowed_job;
      }
    };

    scope.action = function(box,type) {
      switch(type) {
        case 'reboot':
          reboot(box, 1);
          break;
        case 'payload':
          payload(box);
          break;
        case 'zones':
          zones(box);
          break;
        case 'resync':
          resync(box);
          break;
        case 'delete':
          destroy(box);
          break;
        case 'edit':
          edit(box.slug);
          break;
        default:
      }
    };

    scope.allowedMenu = function(box) {
      return !box.allowed_job;
    };

    var reboot = function(box,ev) {
      var confirm = $mdDialog.confirm()
        .title(gettextCatalog.getString('Would you like to reboot this device?'))
        .textContent(gettextCatalog.getString('Rebooting will disconnect your clients.\nA reboot takes about 60 seconds to complete'))
        .ariaLabel(gettextCatalog.getString('Lucky day'))
        .targetEvent(ev)
        .ok(gettextCatalog.getString('Reboot it'))
        .cancel(gettextCatalog.getString('Cancel'));
      $mdDialog.show(confirm).then(function() {
        rebootBox(box);
      });
    };

    var rebootBox = function(box) {
      box.state = 'processing';
      box.allowed_job = false;

      Box.update({id: box.slug, box: {action: 'reboot'}}).$promise.then(function(results) {
        box.state = 'rebooting';
        showToast(gettextCatalog.getString('Box successfully rebooted.'));
      }, function(errors) {
        showToast(gettextCatalog.getString('Failed to reboot box, please try again.'));
        console.log('Could not reboot box:', errors);
        box.state = 'online';
        box.processing = undefined;
      });
    };

    var resync = function(box,ev) {
      var confirm = $mdDialog.confirm()
        .title(gettextCatalog.getString('Resync The Configs for this Device?'))
        .textContent(gettextCatalog.getString('This will disconnect your clients temporarily.'))
        .ariaLabel(gettextCatalog.getString('Lucky day'))
        .targetEvent(ev)
        .ok(gettextCatalog.getString('Resync it'))
        .cancel(gettextCatalog.getString('Cancel'));
      $mdDialog.show(confirm).then(function() {
        resyncBox(box);
      });
    };

    var resyncBox = function(box) {
      box.state = 'processing';
      Box.update({
        location_id: scope.location.slug,
        id: box.slug,
        box: {
          action: 'resync'
        }
      }).$promise.then(function(res) {
        showToast(gettextCatalog.getString('Device resynced successfully.'));
      }, function(errors) {
        box.state = 'failed';
        showToast(gettextCatalog.getString('Failed to resync device, please try again.'));
        console.log('Could not resync device:', errors);
      });
    };

    var destroy = function(box,ev) {
      var confirm = $mdDialog.confirm()
        .title(gettextCatalog.getString('Delete This Device Permanently?'))
        .textContent(gettextCatalog.getString('Please be careful, this cannot be reversed.'))
        .ariaLabel(gettextCatalog.getString('Lucky day'))
        .targetEvent(ev)
        .ok(gettextCatalog.getString('Delete it'))
        .cancel(gettextCatalog.getString('Cancel'));
      $mdDialog.show(confirm).then(function() {
        deleteBox(box);
        showToast(gettextCatalog.getString('Deleted device with mac {{address}}', {address: box.calledstationid}));
      });
    };

    var deleteBox = function(box) {
      box.processing  = true;
      box.allowed_job = false;
      Box.destroy({id: box.slug}).$promise.then(function(results) {
        removeFromList(box);
      }, function(errors) {
        box.processing  = undefined;
        showToast(gettextCatalog.getString('Failed to delete this box, please try again.'));
        console.log('Could not delete this box:', errors);
      });
    };

    var payload = function(box,event) {
      scope.selected.push(box);
      scope.showPayloadDialog(event);
    };

    var closeDialog = function() {
      $mdDialog.cancel();
    };

    function DialogController($scope, items) {
      $scope.items = items;
      $scope.cancel = function() {
        $mdDialog.cancel();
      };
      $scope.runCommand = function(command) {
        runCommand(command);
      };
    }
    DialogController.$inject = ['$scope', 'items'];

    scope.showPayloadDialog = function(ev) {
      $mdDialog.show({
        templateUrl: 'components/locations/boxes/dialog.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose:true,
        locals: {
          items: scope.selected // not working
        },
        controller: DialogController
      });
    };

    var selection = [];
    var formatIds = function() {
      angular.forEach(scope.selected, function(k,v) {
        selection.push(k.slug);
        k.processing = true;
      });
    };

    var createPayload = function(ids, command) {
      LocationPayload.create({}, {
        location_id: scope.location.slug,
        payload: {
          save:       command.save,
          box_ids:    ids,
          command_id: command.selected,
          upgrade:    command.upgrade
        }
      }).$promise.then(function() {
        closeDialog();
        selection = [];
        scope.selected = [];
        showToast(gettextCatalog.getString('Payload sent successfully.'));
      }, function(errors) {
        closeDialog();
        showToast(gettextCatalog.getString('Payload could not be sent.'));
      });
    };

    var runCommand = function(command) {
      formatIds();
      if (selection.length > 0) {
        createPayload(selection, command);
      } else {
        closeDialog();
      }
    };

    scope.deleteDevices = function() {
      var confirm = $mdDialog.confirm()
        .title(gettextCatalog.getString('Are you sure you want to delete these devices?'))
        .textContent(gettextCatalog.getString('This cannot be undone.'))
        .ariaLabel(gettextCatalog.getString('Delete'))
        .ok(gettextCatalog.getString('delete'))
        .cancel(gettextCatalog.getString('Cancel'));
      $mdDialog.show(confirm).then(function() {
        deleteDevices();
      });

    };

    var deleteDevices = function(ev) {
      for (var i = 0, len = scope.selected.length; i < len; i++) {
        deleteBox(scope.selected[i]);
        var devices = 'devices';
        if (scope.selected.length === 1) {
          devices = 'device';
        }
        showToast(gettextCatalog.getPlural(scope.selected.length,'Deleted 1 device', 'Deleted {{$count}} devices', {}));
      }
    };

    var removeFromList = function(box) {
      scope.selected = [];
      for (var i = 0, len = scope.boxes.length; i < len; i++) {
        if (scope.boxes[i].id === box.id) {
          if (!scope.selected.length) {
          }
          scope.boxes.splice(i, 1);
          break;
        }
      }
    };

    var zones = function(box) {
      scope.selected.push(box);
      scope.showZonesDialog();
    };

    scope.showZonesDialog = function(ev) {
      $mdDialog.show({
        templateUrl: 'components/locations/boxes/zones.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose:true,
        controller: ZonesDialogController,
        locals: {
          selected: scope.selected
        }
      });
    };

    function ZonesDialogController($scope,selected) {

      $scope.loading = true;
      $scope.selected = selected;
      var t = {}, a = [];

      Zone.get({location_id: scope.location.slug}).$promise.then(function(results) {

        $scope.zones = results.zones;

        if (results.zones.length) {
          // Must be called remove !! //
          var z = { id: 'remove', zone_name: gettextCatalog.getString('No Zone') };

          results.zones.unshift(z);

          // Loop through the zones so we can set the zone_id for display //
          for(var i = 0, l = $scope.selected.length; i < l; ++i){
            var n, id;
            if ($scope.selected[i].zone_name) {
              n  = $scope.selected[i].metadata.zone_name;
              id = $scope.selected[i].zone_id;
            } else {
              n = 'null';
              id = 'remove';
            }

            if (t[n] !== 1) {
              t[n] = 1;
              a.push(id);
            }
          }

          if (a.length === 1) {
            $scope.zone_id = a[0];
          }
        }

        $scope.loading = undefined;

      }, function() {
        $scope.loading = undefined;
      });

      $scope.createZone = function() {
        $mdDialog.cancel();
        window.location.href = '/#/locations/' + scope.location.slug + '/zones?add=true';
      };

      $scope.cancel = function() {
        $mdDialog.cancel();
      };

      $scope.execute = function(zone_id) {
        $mdDialog.cancel();
        editZones($scope.zones,zone_id);
      };

    }
    ZonesDialogController.$inject = ['$scope', 'selected'];

    var editZones = function(zones,zone_id) {

      // Loop through the zones so we can update the metadata //
      var len, zone_name, i;
      if (zone_id !== 'remove') {
        for (i = 0, len = zones.length; i < len; i++) {
          if (zones[i].id === zone_id) {
            zone_name = zones[i].zone_name;
            break;
          }
        }
      }

      // Loop through the selected boxes and update //
      for (i = 0, len = scope.selected.length; i < len; i++) {
        var box = scope.selected[i];
        // if (box.metadata === undefined) {
        //   box.metadata = {};
        // }
        box.zone_name = zone_name;
        box.zone_id = zone_id;
        updateZone(box);
      }

      // Write a message to the screen, yeah //
      var devices = gettextCatalog.getString('device zones'),
        selectedLength = scope.selected.length;
      if (scope.selected.length === 1) {
        devices = gettextCatalog.getString('device zone');
      }
      showToast(gettextCatalog.getPlural(scope.selected.length, '1 device zone', '{{$count}} device zones'));
      scope.selected = [];
    };

    var edit = function(slug) {
      window.location.href = '/#/locations/' + scope.location.slug + '/boxes/' + slug + '/edit';
    };

    var view = function(slug) {
      window.location.href = '/#/locations/' + scope.location.slug + '/boxes/' + slug;
    };

    var updateZone = function(box) {
      if (box.zone_id === 'remove') {
        box.zone_id = ''; // Must not be undefined
      }
      Box.update({
        location_id: scope.location.slug,
        id: box.slug,
        box: {
          zone_id: box.zone_id
        }
      }).$promise.then(function(res) {
      }, function(errors) {
        // showErrors(errors);
      });
    };

    var update = function(box) {
      Box.update({
        location_id: scope.location.slug,
        id: box.slug,
        box: {
          description: box.description
        }
      }).$promise.then(function(res) {
        showToast(gettextCatalog.getString('Device description updated.'));
      }, function(errors) {
        showErrors(errors);
      });
    };

    var countOnline = function() {
      scope.online = 0;
      if (scope.boxes.length) {
        for (var i = 0, len = scope.boxes.length; i < len; i++) {
          if (scope.boxes[i].metadata) {
            scope.online += scope.boxes[i].metadata.online;
          }
        }
      }
    };

    var channel;
    function loadPusher() {
      if (scope.pusherLoaded === undefined && typeof client !== 'undefined') {
        scope.pusherLoaded = true;
        var pusher = $pusher(client);
        channel = pusher.subscribe('private-' + attrs.token);
        console.log('Binding to:', channel.name);
        for( var i = 0; i < scope.boxes.length; ++i ) {
          channelBind(i);
        }
      }
    }

    var channelBind = function(i) {
      channel.bind('boxes_' + scope.boxes[i].pubsub_token, function(data) {
        updateBox(data.message);
      });
    };

    var updateBox = function(data) {
      data = JSON.parse(data);
      angular.forEach(scope.boxes, function(value, key) {
        if (parseInt(data.id) === value.id) {
          var box = scope.boxes[key];
          box.calledstationid = data.calledstationid;
          // box.wan_proto       = data.wan_proto;
          box.description     = data.description;
          box.last_heartbeat  = data.last_heartbeat;
          box.state           = data.state;
          box.wan_ip          = data.wan_ip;
          scope.boxes[key]    = box;
          console.log('Updated', box.pubsub_token + ' at ' + new Date().getTime());
        }
      });
    };

    var init = function() {
      scope.deferred = $q.defer();
      Box.query({
        location_id: scope.location.slug,
        page: scope.query.page,
        per:  scope.query.limit,
        metadata: true
      }).$promise.then(function(results) {
        scope.boxes           = results.boxes;
        scope._links          = results._links;
        scope.loading         = undefined;
        countOnline();
        poll();
        scope.deferred.resolve();
      }, function(err) {
        scope.loading = undefined;
      });
      return scope.deferred.promise;
    };

    // We've remove the pusher notifications since the volume was getting too high
    var poller;
    var poll = function() {
      poller = $timeout(function() {
        console.log('Refreshing devices');
        init();
      }, 30000);
    };

    $rootScope.$on('streaming', function(args,res) {
      if (res.enabled) {
        loadPusher();
        showToast(gettextCatalog.getString('Streaming updates enabled'));
      } else {
        scope.pusherLoaded = undefined;
        if (channel) {
          channel.unbind();
        }
        showToast(gettextCatalog.getString('Streaming updates disabled'));
      }
    });

    init().then(loadPusher);

    $rootScope.$on('$routeChangeStart', function (event, next, current) {
      if (channel) {
        channel.unbind();
      }
      $timeout.cancel(poller);
    });

  };
  return {
    link: link,
    scope: {
      filter: '=',
      loading: '=',
      token: '@',
      streaming: '='
    },
    templateUrl: 'components/locations/boxes/_table.html'
  };

}]);

app.directive('locationSettings', ['Location', '$location', '$routeParams', '$mdDialog', 'showToast', 'showErrors', 'moment', 'gettextCatalog', function(Location, $location, $routeParams, $mdDialog, showToast, showErrors, moment, gettextCatalog) {

  var controller = function($scope) {
    this.$scope = $scope;

    var slug;

    // User Permissions //
    var allowedUser = function() {
      $scope.allowed = true;
    };

    var id = $routeParams.id;
    var init = function() {
      $scope.loading  = undefined;
      slug = $scope.location.slug; // used to check for location name change
      allowedUser();
    };

    this.update = function (myform) {
      // Doesn't work since we display the form via a template
      // myform.$setPristine();
      Location.update({}, {
        id: $scope.location.slug,
        location: $scope.location
      }, function(data) {
        if (slug !== data.slug) {
          $location.path('/locations/' + data.slug + '/settings');
        }
        showToast(gettextCatalog.getString('Successfully updated location.'));
      }, function(err) {
        showErrors(err);
      });
    };

    this.back = function() {
      window.location.href = '/#/locations/' + slug + '/settings';
    };

    init();

  };

  controller.$inject = ['$scope'];

  return {
    restrict: 'AE',
    scope: {
      loading: '=',
      location: '='
    },
    controller: controller
  };

}]);

app.directive('locationSettingsMain', ['moment', 'Project', function(moment, Project) {

  var link = function( scope, element, attrs, controller ) {

    scope.timezones = moment.tz.names();

    scope.update = function (form) {
      controller.update(form);
    };

    scope.back = function() {
      controller.back();
    };

    // var setProjectName = function() {
    //   if (scope.projects.length > 0 && scope.location.project_id) {
    //     for (var i = 0, len = scope.projects.length; i < len; i++) {
    //       if (scope.location.project_id === scope.projects[i].id) {
    //         scope.location.project_name = scope.projects[i].project_name;
    //         break;
    //       }
    //     }
    //   }
    // };

    // Needs test
    var init = function() {
      Project.get({}).$promise.then(function(results) {
        scope.projects = results.projects;
        // setProjectName();
      });
    };

    init();
  };

  return {
    link: link,
    templateUrl: 'components/locations/settings/_main.html',
    require: '^locationSettings'
  };

}]);

app.directive('locationSettingsNotifications', ['$timeout', function($timeout) {

  var link = function( scope, element, attrs, controller ) {

    function validateEmail(email) {
      var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }

    scope.update = function (form) {
      var emails = [];
      for (var i = 0, len = scope.ctrl.emails.length; i < len; i++) {
        if (validateEmail(scope.ctrl.emails[i])) {
          emails.push(scope.ctrl.emails[i]);
        }
      }
      scope.location.reports_emails = emails.join(',');
      controller.update(form);
    };

    scope.ctrl = {};
    scope.ctrl.emails = [];

    var populateEmails = function() {
      if (scope.location.reports_emails) {
        var emails = scope.location.reports_emails.split(',');
        for (var i = 0, len = emails.length; i < len; i++) {
          scope.ctrl.emails.push(emails[i]);
        }
      }
    };

    // Prefer to watch atm //
    var timer = $timeout(function() {
      populateEmails();
      $timeout.cancel(timer);
    }, 250);

    scope.back = function() {
      controller.back();
    };

  };

  return {
    link: link,
    templateUrl: 'components/locations/settings/_notifications.html',
    require: '^locationSettings'
  };

}]);

app.directive('locationSettingsSecurity', ['$timeout', function($timeout) {

  var link = function( scope, element, attrs, controller ) {


    scope.update = function (form) {
      controller.update(form);
    };

    scope.ctrl = {};
    scope.ctrl.levels = [1,2,3];

    scope.back = function() {
      controller.back();
    };

  };

  return {
    link: link,
    templateUrl: 'components/locations/settings/_security.html',
    require: '^locationSettings'
  };

}]);

app.directive('locationSettingsDevices', ['menu', '$timeout', function(menu, $timeout) {

  var link = function( scope, element, attrs, controller ) {

    scope.environments = [{key: 'Beta', value: 'Beta'}, {key: 'Production', value: 'Production'}];

    scope.update = function (form) {
      controller.update(form,scope.location);
    };

    scope.testVsz = function(form) {
      form.$setPristine();
      scope.location.vsg_testing = true;
      scope.location.run_vsg_test = true;
      controller.$scope.update(form,scope.location);
    };

    scope.toggle = function(section) {
      menu.toggleSelectSection(section);
    };

    scope.isOpen = function(section) {
      return menu.isSectionSelected(section);
    };

    scope.back = function() {
      controller.back();
    };

    var timer = $timeout(function() {
      if (scope.location.experimental === true) {
        scope.environments.push({key: 'Experimental', value: 'Experimental' });
      }
      $timeout.cancel(timer);
    }, 250);

  };

  return {
    link: link,
    templateUrl: 'components/locations/settings/_devices.html',
    require: '^locationSettings'
  };

}]);

app.directive('locationSettingsAnalytics', [function() {

  var link = function( scope, element, attrs, controller ) {

    scope.update = function (form) {
      controller.update(form);
    };

    scope.back = function() {
      controller.back();
    };

  };

  return {
    link: link,
    templateUrl: 'components/locations/settings/_analytics.html',
    require: '^locationSettings'
  };

}]);

app.directive('locationSettingsSplash', [function() {

  var link = function( scope, element, attrs, controller ) {

    scope.update = function (form) {
      controller.update(form,scope.location);
    };

    scope.back = function() {
      controller.back();
    };

  };

  return {
    link: link,
    templateUrl: 'components/locations/settings/_splash.html',
    require: '^locationSettings'
  };

}]);

app.directive('locationSettingsMenu', ['Location', '$location', '$routeParams', '$mdDialog', 'showToast', 'showErrors', 'moment', '$pusher', '$rootScope', 'gettextCatalog', 'menu', function(Location, $location, $routeParams, $mdDialog, showToast, showErrors, moment, $pusher, $rootScope, gettextCatalog, menu) {

  var link = function( scope, element, attrs ) {

    // scope.location = { slug: $routeParams.id };

    // User Permissions //
    var createMenu = function() {

      scope.menu = [];

      scope.menu.push({
        name: gettextCatalog.getString('Notifications'),
        type: 'notifications',
        icon: 'add_alert'
      });

      scope.menu.push({
        name: gettextCatalog.getString('Devices'),
        type: 'devices',
        icon: 'router'
      });

      scope.menu.push({
        name: gettextCatalog.getString('Security'),
        type: 'security',
        icon: 'security'
      });

      scope.menu.push({
        name: gettextCatalog.getString('Splash'),
        type: 'splash',
        icon: 'web'
      });

      scope.menu.push({
        name: gettextCatalog.getString('Analytics'),
        type: 'analytics',
        icon: 'trending_up'
      });

      scope.menu.push({
        name: gettextCatalog.getString('Transfer'),
        type: 'transfer',
        icon: 'transform'
      });

      scope.menu.push({
        name: scope.location.archived ? gettextCatalog.getString('Unarchive') : gettextCatalog.getString('Archive'),
        type: 'archive',
        icon: 'archive'
      });

      scope.menu.push({
        name: gettextCatalog.getString('Delete'),
        type: 'delete',
        icon: 'delete_forever'
      });
    };

    scope.action = function(type) {
      switch(type) {
        case 'delete':
          destroy();
          break;
        case 'transfer':
          transfer();
          break;
        case 'archive':
          archive();
          break;
        case 'security':
          security();
          break;
        case 'notifications':
          notifications();
          break;
        case 'devices':
          devices();
          break;
        case 'splash':
          splash();
          break;
        case 'analytics':
          analytics();
          break;
      }
    };

    var archive = function(ev) {
      var msg, msg2;
      if (scope.location.archived) {
        msg = gettextCatalog.getString('Are you sure you want to restore this location');
        msg2 = gettextCatalog.getString('Your splash pages and networks will be activated.');
      } else {
        msg = gettextCatalog.getString('Are you sure you want to archive this location');
        msg2 = gettextCatalog.getString('This will prevent users from logging in.');
      }
      var confirm = $mdDialog.confirm()
        .title(msg)
        .textContent(msg2)
        .ariaLabel(gettextCatalog.getString('Archive'))
        .targetEvent(ev)
        .ok(gettextCatalog.getString('CONFIRM'))
        .cancel(gettextCatalog.getString('Cancel'));
      $mdDialog.show(confirm).then(function() {
        updateLocation(scope.location.archived);
      });
    };

    var updateLocation = function(state) {
      var s = 'active';
      if (state === false) {
        s = 'archived';
      }
      Location.update({}, {
        id: scope.location.slug,
        location: {
          state: s
        }
      }).$promise.then(function(results) {
        scope.location.archived = true;
        var msg;
        if (s === 'active') {
          menu.archived = false;
          msg = gettextCatalog.getString('Location successfully restored.');
          menu.locationStateIcon = undefined;
        } else {
          menu.archived = true;
          msg = gettextCatalog.getString('Location successfully archived.');
          menu.locationStateIcon = 'archived';
        }
        showToast(msg);
      }, function(err) {
        showErrors(err);
      });
    };

    // var unArchiveLocation = function() {
    //   Location.unarchive({id: scope.location.slug}).$promise.then(function(results) {
    //     scope.location.archived = false;
    //     menu.archived = undefined;
    //     showToast(gettextCatalog.getString('Location successfully restored.'));
    //   }, function(err) {
    //     showErrors(err);
    //   });
    // };

    var destroy = function(ev) {
      var confirm = $mdDialog.confirm()
        .title(gettextCatalog.getString('Are you sure you want to delete this location?'))
        .textContent(gettextCatalog.getString('You cannot delete a location with session data.'))
        .ariaLabel(gettextCatalog.getString('Archive'))
        .targetEvent(ev)
        .ok(gettextCatalog.getString('delete'))
        .cancel(gettextCatalog.getString('Cancel'));
      $mdDialog.show(confirm).then(function() {
        destroyLocation();
      });
    };

    var destroyLocation = function(id) {
      Location.destroy({id: scope.location.id}).$promise.then(function(results) {
        $location.path('/');
        showToast(gettextCatalog.getString('Successfully deleted location.'));
      }, function(err) {
        showErrors(err);
      });
    };

    var transfer = function() {
      $mdDialog.show({
        templateUrl: 'components/locations/settings/_transfer.html',
        clickOutsideToClose: true,
        parent: angular.element(document.body),
        controller: TransferController,
      });
    };

    var TransferController = function($scope){
      $scope.transfer = function(account_id) {
        $mdDialog.cancel();
        transferLocation(account_id);
      };
      $scope.close = function() {
        $mdDialog.cancel();
      };
    };
    TransferController.$inject = ['$scope'];

    var transferLocation = function(accountId) {
      Location.transfer({accountId: accountId, id: scope.location.slug}).$promise.then(function(results) {
        $location.path('/').search('tfer=true');
        showToast(gettextCatalog.getString('Location successfully transferred.'));
      }, function(err) {
        showErrors(err);
      });
    };

    var security = function() {
      window.location.href = '/#/locations/' + scope.location.slug + '/settings/security';
    };

    var notifications = function() {
      window.location.href = '/#/locations/' + scope.location.slug + '/settings/notifications';
    };

    var devices = function() {
      window.location.href = '/#/locations/' + scope.location.slug + '/settings/devices';
    };

    var splash = function() {
      window.location.href = '/#/locations/' + scope.location.slug + '/settings/splash';
    };

    var analytics = function() {
      window.location.href = '/#/locations/' + scope.location.slug + '/settings/analytics';
    };

    // user permissions //
    scope.$watch('location',function(nv){
      if (nv !== undefined) {
        createMenu();
      }
    });

  };

  return {
    link: link,
    scope: {
      location: '='
    },
    templateUrl: 'components/locations/settings/_settings_menu.html',
  };

}]);


app.directive('appStatus', ['statusPage', 'gettextCatalog', function(statusPage, gettextCatalog) {

  var link = function(scope) {

    var init = function() {

      var id, slug;
      statusPage.get({}, function(data) {
        scope.status = data;
        if (scope.status.incidents.length === 0) {
          if (scope.status.status.indicator === 'none') {
            scope.color = 'rgb(76,175,80)';
            scope.incidents = gettextCatalog.getString('All systems operational.');
          } else {
            scope.color = 'rgb(255,152,0)';
            scope.incidents = gettextCatalog.getString('Partially degraded service.');
          }
        } else {
          scope.color = 'rgb(244,67,54)';
        }
        scope.url   = scope.status.incidents.length === 0 ? 'http://status.ctapp.io' : scope.status.incidents[0].shortlink;
      });
    };

    init();

  };

  return {
    scope: {
      loading: '=',
    },
    link: link,
    templateUrl: 'components/locations/show/_app_status.html',
  };

}]);

app.directive('warnings', ['Event', 'Shortener', '$location', function(Event,Shortener,$location) {

  var link = function(scope) {

    scope.loading = true;

    var init = function() {
      Event.query({object: 'box', level: 2, per: 5}).$promise.then(function(results) {
        scope.events = results.events;
        scope.loading = undefined;
      }, function(error) {
        scope.loading = undefined;
      });
    };

    scope.visitBox = function(s) {
      Shortener.get({short: s}).$promise.then(function(results) {
        $location.path(results.url);
        $location.search({});
      }, function() {
        $location.search({});
      });
    };

    init();

  };

  return {
    scope: {
    },
    link: link,
    templateUrl: 'components/locations/show/_warnings.html',
  };

}]);

app.directive('favourites', ['Location', '$location', function(Location, $location) {

  var link = function(scope) {

    scope.loading = true;

    scope.all = function() {
      $location.search({pinned: true});
    };

    var init = function() {
      Location.favourites({per: 5}).$promise.then(function(results) {
        scope.locations = results.locations;
        scope.loading = undefined;
      }, function() {
        scope.loading = undefined;
      });
    };

    init();

  };

  return {
    scope: {
    },
    link: link,
    templateUrl: 'components/locations/show/_favourites.html',
  };

}]);

app.directive('favouritesExtended', ['Location', '$location', '$routeParams', 'showToast', 'showErrors', '$mdDialog', 'gettextCatalog', 'pagination_labels', function(Location, $location, $routeParams, showToast, showErrors, $mdDialog, gettextCatalog, pagination_labels) {

  var link = function(scope) {

    scope.loading = true;

    scope.options = {
      boundaryLinks: false,
      largeEditDialog: false,
      pageSelector: false,
      rowSelection: false
    };

    var createMenu = function() {
      scope.menu = [];
      scope.menu.push({
        name: gettextCatalog.getString('View'),
        type: 'view',
        icon: 'pageview'
      });

      scope.menu.push({
        name: gettextCatalog.getString('Unfavourite'),
        type: 'remove',
        icon: 'favorite_border'
      });

    };

    scope.pagination_labels = pagination_labels;
    scope.query = {
      order:      'updated_at',
      limit:      $routeParams.per || 25,
      page:       $routeParams.page || 1,
      options:    [5,10,25,50,100],
      direction:  $routeParams.direction || 'desc'
    };

    scope.action = function(location,type) {
      switch(type) {
        case 'view':
          view(location.slug);
        break;
      case 'remove':
        remove(location.slug);
      break;
      }
    };

    scope.onPaginate = function (page, limit) {
      scope.query.page = page;
      scope.query.limit = limit;
      scope.updatePage();
    };

    var init = function() {
      Location.favourites({}).$promise.then(function(results) {
        scope.locations = results.locations;
        scope._links = results._links;
        createMenu();
        scope.loading = undefined;
      }, function() {
        scope.loading = undefined;
      });
    };

    var remove = function(id) {
      var confirm = $mdDialog.confirm()
        .title(gettextCatalog.getString('Remove From Favourites?'))
        .textContent(gettextCatalog.getString('Are you sure you want to remove this location?'))
        .ariaLabel(gettextCatalog.getString('Remove Location'))
        .ok(gettextCatalog.getString('Ok'))
        .cancel(gettextCatalog.getString('Cancel'));
      $mdDialog.show(confirm).then(function() {
        removeFav(id);
      });
    };

    var removeFav = function(id) {
      updateLocation(id);
    };

    function updateLocation(id) {
      Location.update({}, {
        id: id,
        location: {
          favourite: false
        }
      }).$promise.then(function(results) {
        removeFromList(id);
      }, function(err) {
        showErrors(err);
      });
    }

    var removeFromList = function(id) {
      for (var i = 0, len = scope.locations.length; i < len; i++) {
        if (scope.locations[i].slug === id) {
          scope.locations.splice(i, 1);
          showToast(gettextCatalog.getString('Location removed from favourites.'));
          break;
        }
      }
    };

    scope.back = function() {
      $location.search({});
    };

    var view = function(id) {
      window.location.href = '/#/locations/' + id;
    };

    init();

  };

  return {
    scope: {
      loading: '='
    },
    link: link,
    templateUrl: 'components/locations/index/_favourites.html'
  };

}]);

app.directive('boxesAlerting', ['Location', '$location', '$routeParams', 'showToast', 'showErrors', '$mdDialog', 'Box', 'menu', 'gettextCatalog', 'pagination_labels', function(Location, $location, $routeParams, showToast, showErrors, $mdDialog, Box, menu, gettextCatalog, pagination_labels) {

  var link = function(scope) {

    scope.loading = true;
    scope.state = 'offline';
    menu.isOpen = false;
    menu.hideBurger = true;

    scope.options = {
      boundaryLinks: false,
      largeEditDialog: false,
      pageSelector: false,
      rowSelection: false
    };

    scope.pagination_labels = pagination_labels;
    scope.query = {
      order:      'updated_at',
      filter:     $routeParams.q,
      limit:      $routeParams.per || 25,
      page:       $routeParams.page || 1,
      options:    [5,10,25,50,100],
      direction:  $routeParams.direction || 'desc'
    };

    scope.onPaginate = function (page, limit) {
      scope.query.page = page;
      scope.query.limit = limit;
      scope.blur();
    };

    // User permissions //
    scope.allowed = true;

    var init = function() {

      Box.query({
        state: scope.state,
        q: scope.query.filter,
        page: scope.query.page,
        per: scope.query.limit,
      }).$promise.then(function(results) {
        scope.boxes           = results.boxes;
        scope._links          = results._links;
        scope.loading         = undefined;
      }, function(err) {
        scope.loading = undefined;
      });
    };

    scope.ignore = function(box) {
      box.ignored = !box.ignored;
      Box.update({
        location_id: box.location_slug,
        id: box.slug,
        box: {
          ignored: box.ignored
        }
      }).$promise.then(function(res) {
        var val = box.ignored ? gettextCatalog.getString('muted') : gettextCatalog.getString('unmuted');
        showToast(gettextCatalog.getString('Box successfully {{val}}.', {val: val}));
      }, function(errors) {
      });
    };

    scope.blur = function() {
      var hash = {};
      hash.page = scope.query.page;
      hash.per = scope.query.limit;
      hash.q = scope.query.filter;
      $location.search(hash);
    };

    init();

  };

  return {
    scope: {
      // loading: '='
    },
    link: link,
    templateUrl: 'components/locations/index/_alerts.html'
  };

}]);

app.directive('dashInventory', ['Report', 'Auth', function(Report, Auth) {

  var link = function(scope) {

    scope.loading = true;
    scope.stats = { new: 0, active: 0 };

    scope.user = Auth.currentUser();

    var init = function() {
      Report.inventory({}).$promise.then(function(results) {
        createStats(results.stats);
        scope.loading     = undefined;
      }, function(err) {
        scope.loading = undefined;
      });
    };

    var createStats = function(stats) {
      for(var i = 0; i < stats.length; i++) {
        Object.keys(stats[i]).forEach(function (key) {
          if (key === 'new') {
            scope.stats.new = stats[i][key];
          } else if (key === 'active') {
            scope.stats.active = stats[i][key];
          }
        });
      }
    };

    init();

  };

  return {
    scope: {
    },
    link: link,
    templateUrl: 'components/locations/show/_inventory.html',
  };

}]);

app.directive('locationUsageChart', ['$http', '$routeParams', 'Location', 'snapshotDateTimePicker', function($http, $routeParams, Location, snapshotDateTimePicker) {

  return {
    link: function(scope) {

      scope.snapshotTime = snapshotDateTimePicker;
      scope.$watch('snapshotTime.snapshotStartTime', chart);

      window.google.charts.setOnLoadCallback(chart);

      $(window).resize(function() {
        chart(true);
      });

      var dataTable;
      var options;

      function chart() {

        if (resize !== true) {
          var metricUrl = [
            'https://api.ctapp.io/api/v2/metrics?',
            'location_id=',
            '&start_time=',
            '&end_time=',
            '&metric_type=device.tx',
            '&access_token=access_token',
            '&ap_mac=DC-9F-DB-98-0B-ED'
          ];

          if (scope.snapshotTime != undefined && scope.snapshotTime.snapshotStartTime != null) {
            var start = scope.snapshotTime.snapshotStartTime;
            var end = scope.snapshotTime.snapshotEndTime;
          } else {
            var now = Date.now();
            var end = Math.floor(now / 1000);
            var start = (end - 86400);
          }

          Location.get({id: $routeParams.id}, function(result) {
            metricUrl[1] += scope.$parent.location.id;
            metricUrl[2] += start;
            metricUrl[3] += end;

            var url = metricUrl.join('');
            metricUrl[4] = '&metric_type=device.rx'
            var rxUrl = metricUrl.join('');

            var req = {
              method: 'GET',
              url: url
            };

            $http(req).then(function successCallback(response) {
              var req = {
                method: 'GET',
                url: rxUrl
              };

              var txJson = response.data.data;
              var data = [];

              $http(req).then(function successCallback(response) {

                var rxJson = response.data.data;

                var len = txJson.length;

                for(var i = 0; i < len; i++) {
                  data[i] = [ new Date(txJson[i].timestamp),
                              null,
                              (txJson[i].value / 1000000),
                              (rxJson[i].value / 1000000)];
                }

                dataTable = new google.visualization.DataTable();

                dataTable.addColumn('datetime', 'Time');
                dataTable.addColumn('number', 'dummySeries');
                dataTable.addColumn('number', 'tx');
                dataTable.addColumn('number', 'rx');
                dataTable.addRows(data);

                options = {
                  vAxis: { minValue: 0, gridlines: { color: "#EEEEEE"} , baselineColor: '#BDBDBD'},
                  legend: 'none',
                  areaOpacity: 0.1,
                  colors: ['#26C6DA', '#5C6BC0'],
                  lineWidth: 3,
                  crosshair: { orientation: 'vertical', trigger: 'both', color: "#BDBDBD" },
                  chartArea: {width:"80%"},
                  series: {
                      0: { targetAxisIndex: 0, },
                      1: { targetAxisIndex: 1, },
                      2: { targetAxisIndex: 1, }
                  },
                  vAxes: {
                      0: { textPosition: 'none' },
                      1: {},
                      2: {}
                  }
                };

                var chart = new google.visualization.AreaChart(document.getElementById('chart1'));
                chart.draw(dataTable, options);

              }, function errorCallback(response) {
              });

            }, function errorCallback(response) {
            });
          });
        } else {
          var chart = new google.visualization.AreaChart(document.getElementById('chart1'));
          chart.draw(dataTable, options);
        }
      }
    },
    scope: {
      mac: '@',
      loc: '@'
    },
    templateUrl: 'components/locations/show/_data_usage_chart.html',
  };
}]);

app.directive('locationCapabilitiesChart', ['$http', '$routeParams', 'Location', 'snapshotDateTimePicker', function($http, $routeParams, Location, snapshotDateTimePicker) {

  return {
    link: function(scope) {

      scope.snapshotTime = snapshotDateTimePicker;
      scope.$watch('snapshotTime.snapshotStartTime', chart);

      window.google.charts.setOnLoadCallback(chart);

      $(window).resize(function() {
        chart(true);
      });

      var dataTable;
      var options;

      function chart(resize=false) {

        if (resize !== true) {
          var metricUrl = [
            'https://api.ctapp.io/api/v2/metrics?',
            'location_id=',
            '&start_time=',
            '&end_time=',
            '&metric_type=device.caps',
            '&access_token=access_token',
            '&ap_mac=DC-9F-DB-98-0B-ED'
          ];

          if (scope.snapshotTime != undefined && scope.snapshotTime.snapshotStartTime != null) {
            var start = scope.snapshotTime.snapshotStartTime;
            var end = scope.snapshotTime.snapshotEndTime;
          } else {
            var now = Date.now();
            var end = Math.floor(now / 1000);
            var start = (end - 86400);
          }

          Location.get({id: $routeParams.id}, function(result) {
            metricUrl[1] += result.id;
            metricUrl[2] += start;
            metricUrl[3] += end;

            var url = metricUrl.join('');

            var req = {
              method: 'GET',
              url: url
            };

            $http(req).then(function successCallback(response) {
              var json = response.data.stats;
              var data = json.map(function(x) {
                var row = Object.values(x);
                if (row[0] == 'two') {
                  row[0] = '2.4Ghz'
                } else if (row[0] == 'five') {
                  row[0] = '5Ghz'
                }
                return row
              });

              dataTable = new google.visualization.DataTable();

              dataTable.addColumn('string', 'Band');
              dataTable.addColumn('number', 'Percent');
              dataTable.addRows(data);

              options = {
                pieHole: 0.7,
                pieSliceText: "none",
                colors: [`#5C6BC0`,`#26C6DA`],
                legend: { position: 'bottom' },
                chartArea: {top:10, width:"100%", height:"80%"},
                pieSliceBorderColor: "transparent"
              };


              var chart = new google.visualization.PieChart(document.getElementById('chart2'));
              chart.draw(dataTable, options)

            }, function errorCallback(response) {
            });
          });
        } else {
          var chart = new google.visualization.PieChart(document.getElementById('chart2'));
          chart.draw(dataTable, options)
        }
      }
    },
    scope: {
      mac: '@',
      loc: '@',
      objectToInject: '='
    },
    require: '^locationShow',
    templateUrl: 'components/locations/show/_location_capabilities_chart.html',
  };
}]);

app.directive('locationHealthReport', function() {

  return {
    scope: {
      mac: '@',
      loc: '@'
    },
    templateUrl: 'components/locations/show/_health_report.html',
  };
});

app.directive('locationClients', ['$http', '$routeParams', 'Location', 'snapshotDateTimePicker', function($http, $routeParams, Location, snapshotDateTimePicker) {

  return {
    link: function(scope, element, attrs, controller) {

      scope.snapshotTime = snapshotDateTimePicker;
      scope.$watch('snapshotTime.snapshotStartTime', chart);

      window.google.charts.setOnLoadCallback(chart);

      $(window).resize(function() {
        chart(true);
      });

      var dataTable;
      var options;

      function chart(resize=false) {

        if (resize !== true) {
          var metricUrl = [
            'https://api.ctapp.io/api/v2/metrics?',
            'location_id=',
            '&start_time=',
            '&end_time=',
            '&metric_type=client.uniques',
            '&access_token=access_token',
            '&ap_mac=DC-9F-DB-98-0B-ED'
          ];

          if (scope.snapshotTime != undefined && scope.snapshotTime.snapshotStartTime != null) {
            var start = scope.snapshotTime.snapshotStartTime;
            var end = scope.snapshotTime.snapshotEndTime;
          } else {
            var now = Date.now();
            var end = Math.floor(now / 1000);
            var start = (end - 86400);
          }

          Location.get({id: $routeParams.id}, function(result) {
            metricUrl[1] += result.id;
            metricUrl[2] += start;
            metricUrl[3] += end;

            var url = metricUrl.join('');

            var req = {
              method: 'GET',
              url: url
            };

            $http(req).then(function successCallback(response) {
              var json = response.data.data;
              var data = json.map(function(x) {
                var row = Object.values(x);
                row[0] = new Date(row[0]);
                row[2] = row[1];
                row[1] = null
                return row
              });

              dataTable = new google.visualization.DataTable();

              dataTable.addColumn('datetime', 'Time');
              dataTable.addColumn('number', 'dummySeries');
              dataTable.addColumn('number', 'Clients');
              dataTable.addRows(data);

              options = {
                vAxis: {
                  minValue: 0,
                  gridlines: { color: "#EEEEEE"},
                  baselineColor: '#BDBDBD'
                },
                hAxis: {
                  gridlines: { color: 'transparent'},
                  baselineColor: '#BDBDBD'
                },
                colors: ['#26C6DA'],
                lineWidth: 3,
                crosshair: { orientation: 'vertical', trigger: 'both', color: "#BDBDBD"},
                legend: 'none',
                chartArea: {width:"80%"},
                series: {
                    0: { targetAxisIndex: 0, },
                    1: { targetAxisIndex: 1, }
                },
                vAxes: {
                    0: { textPosition: 'none' },
                    1: {}
                }
              };

              var chart = new google.visualization.LineChart(document.getElementById('chart8'));
              chart.draw(dataTable, options);

            }, function errorCallback(response) {
            });
          });
        } else {
          var chart = new google.visualization.LineChart(document.getElementById('chart8'));
          chart.draw(dataTable, options);
        }
      }
    },
    scope: {
      mac: '@',
      loc: '@',
      objectToInject: '='
    },
    require: '^locationShow',
    templateUrl: 'components/locations/show/_unique_clients_graph.html',
  };
}]);

app.directive('locationBoxHealth', ['$http', '$routeParams', 'Location', 'snapshotDateTimePicker', function($http, $routeParams, Location, snapshotDateTimePicker) {

  return {
    link: function(scope) {

      window.google.charts.setOnLoadCallback(chart);

      $(window).resize(function() {
        chart();
      });

      function chart() {

        // var metricUrl = [
        //   'https://api.ctapp.io/api/v2/metrics?',
        //   'location_id=',
        //   '&start_time=',
        //   '&end_time=',
        //   '&metric_type=clients.uniques',
        //   '&access_token=access_token'
        // ];
        //
        // if (scope.snapshotTimeData != undefined && scope.snapshotTimeData.snapshot != undefined) {
        //   var start = scope.snapshotTimeData.snapshot.date;
        //   var startTime = scope.snapshotTimeData.snapshot.time;
        //   start.setHours(startTime.getHours());
        //   start.setMinutes(startTime.getMinutes());
        //   start = Math.floor(Date.parse(start) / 1000);
        //   var end = start + scope.snapshotTimeData.snapshot.duration;
        // } else {
        //   var now = Date.now();
        //   var end = Math.floor(now / 1000);
        //   var start = (end - 86400);
        // }
        //
        // Location.get({id: $routeParams.id}, function(result) {
        //   metricUrl[1] += result.id;
        //   metricUrl[2] += start;
        //   metricUrl[3] += end;
        //
        //   var url = metricUrl.join('');
        //
        //   var req = {
        //     method: 'GET',
        //     url: url
        //   };
        //
        //   $http(req).then(function successCallback(response) {
        //     var json = response.data;
        //
        //     var dataTable = google.visualization.arrayToDataTable(json);
        //
        //   }, function errorCallback(response) {
        //   });
        // });
        var data = google.visualization.arrayToDataTable([
          ['Status', 'Number'],
          ['Online', 47],
          ['Offline', 7],
          ['New', 3]
        ]);

        var options = {
          pieHole: 0.7,
          pieSliceText: "none",
          colors: [ `#66BB6A`, `#EC407A`, `#78909C`],
          legend: { position: 'bottom' },
          chartArea: {top:10, width:"100%", height:"80%"},
          pieSliceBorderColor: "transparent"
        };

        var chart = new google.visualization.PieChart(document.getElementById('chart9'));
        chart.draw(data, options);
      }
    },
    scope: {
      mac: '@',
      loc: '@',
      objectToInject: '='
    },
    require: '^locationShow',
    templateUrl: 'components/locations/show/_location_box_health.html',
  };
}]);

app.factory('snapshotDateTimePicker', function() {
  return {
    snapshotStartTime: null,
    snapshotEndTime: null,
    update: function(date, time, duration) {
      var start = date;
      var startTime = time;
      start.setHours(startTime.getHours());
      start.setMinutes(startTime.getMinutes());
      start = Math.floor(Date.parse(start) / 1000);
      var end = start + duration;
      this.snapshotStartTime = start;
      this.snapshotEndTime = end;
    },
    clear: function() {
      this.snapshotStartTime = null;
      this.snapshotEndTime = null;
    }
  }
});
