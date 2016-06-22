'use strict';

var app = angular.module('myApp.locations.directives', []);

app.directive('locationShow', ['Location', '$routeParams', '$location', 'showToast', 'menu', function(Location, $routeParams, $location, showToast, menu) {

  var link = function(scope,element,attrs,controller) {

    var channel;
    scope.streamingUpdates = true;

    scope.favourite = function() {
      scope.location.is_favourite = !scope.location.is_favourite;
      updateLocation();
    };

    scope.streamingUpdater = function() {
      if (scope.streamingUpdates) {
        console.log('Not implemented, add pusher');
        showToast('Streaming updates enabled');
      } else {
        if (channel) {
          channel.unbind();
        }
        console.log('Not implemented, add pusher');
        showToast('Streaming updates disabled');
      }
    };

    function updateLocation() {
      Location.update({id: $routeParams.id, location: { favourite: scope.location.is_favourite }} ).$promise.then(function(results) {
        var val = scope.location.is_favourite ? 'added to' : 'removed from';
        showToast('Location ' + val + ' favourites.');
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
    templateUrl: 'components/locations/show/_index.html'
  };

}]);

app.directive('listLocations', ['Location', '$routeParams', '$rootScope', '$http', '$location', 'menu', 'locationHelper', '$q','Shortener', function (Location, $routeParams, $rootScope, $http, $location, menu, locationHelper, $q, Shortener) {

  var link = function(scope,element,attrs) {

    menu.isOpenLeft = false;
    menu.isOpen = false;
    menu.sectionName = 'Locations';

    if ($routeParams.user_id) {
      scope.user_id = parseInt($routeParams.user_id);
    }

    scope.options = {
      boundaryLinks: false,
      largeEditDialog: false,
      pageSelector: false,
      rowSelection: false
    };

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

    scope.blur = function() {
      if (!scope.user_id) {
        var hash = {};
        hash.page = scope.query.page;
        hash.per = scope.query.limit;
        hash.q = scope.query.filter;
        $location.search(hash);
      }
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
      Location.query({q: scope.query.filter, page: scope.query.page, user_id: scope.user_id}).$promise.then(function(results) {
        scope.total_locs  = results._links.total_entries;
        scope.locations   = results.locations;
        scope._links      = results._links;
        scope.predicate   = '-updated_at';
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

      // window.google.charts.load('44', {'packages':['corechart']});

      function drawChart() {

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
      Report.periscope({v: 2}).$promise.then(function(results) {
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
    template:
        '<md-card>'+
        '<md-card-title>'+
        '<md-card-title-text>'+
        '<span class="md-headline">'+
        // '<md-icon md-font-icon="arrow_back">timeline</md-icon>'+
        'Usage Statistics'+
        '</span>'+
        '<span class="md-subhead">Showing the last 7 days activity</span>'+
        '</md-card-title-text>'+
        '</md-card-title>'+
        '<md-card-content>'+
        '<div id="line"></div>'+
        '</md-card-content>'+
        '<md-divider></md-divider>'+
        '<md-card-actions layout="row" layout-align="end center">'+
        '<md-button href=\'/#/reports/radius\'>Reports</md-button>'+
        '</md-card-actions>'+
        '</md-card>'
  };

}]);

app.directive('changeLocationToken', ['Location', '$routeParams', 'showToast', 'showErrors', '$mdDialog', function (Location, $routeParams, showToast, showErrors, $mdDialog) {

  var link = function(scope,element,attrs) {

    scope.changeToken = function(box,ev) {
      var confirm = $mdDialog.confirm()
      .title('Are you sure you want to change the API Token?')
      .textContent('This will revoke your existing credentials and cannot be reversed.')
      .ariaLabel('Revoke')
      .targetEvent(ev)
      .ok('Revoke it')
      .cancel('Cancel');
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
      Location.update({id: $routeParams.id, location: { update_token: true }} ).$promise.then(function(results) {
        scope.token = results.api_token;
        showToast('Token successfully changed.');
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
    template:
      '<span>'+
      '<md-button ng-click=\'changeToken()\'>Change Token</md-button>'+
      '</span>'
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

    // $timeout(function() {
    //   scope.init();
    // }, 500);

  };

  return {
    link: link,
    scope: {
      locations: '@'
    },
    template:
        '<md-card>'+
        '<md-card-title>'+
        '<md-card-title-text>'+
        '<span class="md-headline">'+
        'Network Stats'+
        '</span>'+
        '</md-card-title-text>'+
        '</md-card-title>'+
        '<md-card-content>'+
        '<md-list-item class="md-2-line">'+
        '<md-icon md-font-icon="">router</md-icon>'+
        '<div class="md-list-item-text">'+
        '<h3>Boxes</h3>'+
        '<span ng-if=\'loading\'><small>Loading stats</small></span>'+
        '<p ng-if=\'!loading\'>{{ ::online || 0 }} Online, {{ ::offline || 0 }} Offline. <span ng-if=\'splash_only > 0\'>{{ ::splash_only }} Splash Only</span></p>'+
        '<md-tooltip>{{ ::stats.boxes.stats.total }} Total boxes </md-tooltip>'+
        '</div>'+
        '</md-list-item>'+
        '<md-list-item class="md-2-line">'+
        '<md-icon md-font-icon="">devices</md-icon>'+
        '<div class="md-list-item-text">'+
        '<h3>Clients Connected</h3>'+
        '<p>{{ ::stats.online }} connected</p>'+
        '</div>'+
        '</md-list-item>'+
        '<md-list-item class="md-2-line" href=\'/#/locations\'>'+
        '<md-icon md-font-icon="">business</md-icon>'+
        '<div class="md-list-item-text">'+
        '<h3>Locations</h3>'+
        '<span ng-if=\'loading\'><small>Loading stats</small></span>'+
        '<p ng-if=\'!loading\'>{{ ::stats.locations }} location<span ng-if=\'stats.locations != 1\'>s</span></p>'+
        '</div>'+
        '</md-list-item>'+
        '<md-list-item class="md-2-line">'+
        '<md-icon md-font-icon="">web</md-icon>'+
        '<div class="md-list-item-text">'+
        '<h3>Splash Views</h3>'+
        '<p>{{ ::stats.splash_views }} this period</p>'+
        '</div>'+
        '</md-list-item>'+
        '</md-card-content>'+
        '<md-divider></md-divider>'+
        '<md-card-actions layout="row" layout-align="end center" >'+
        '<md-button ng-href=\'/#/alerts\'>Alerting Devices</md-button>'+
        '</md-card-actions>'+
        '</md-card-content>'+
        '</md-card>'
  };

}]);

app.directive('locationShortlist', function() {
  return {
    templateUrl: 'components/locations/layouts/short-list.html'
  };
});

app.directive('newLocationForm', ['Location', '$location', 'menu', 'showErrors', 'showToast', '$routeParams', function(Location, $location, menu, showErrors, showToast, $routeParams) {

  var link = function( scope, element, attrs ) {

    menu.isOpen = false;
    menu.hideBurger = true;
    scope.location = { add_to_global_map: false, location_name: $routeParams.name };


    scope.save = function(form) {
      form.$setPristine();
      scope.location.creating = true;
      updateCT(location);
    };

    var updateCT = function(location) {
      location.account_id = attrs.accountId;
      Location.save({location: scope.location}).$promise.then(function(results) {
        $location.path('/locations/' + results.slug);
        $location.search({gs: true});
        showToast('Location successfully created.');
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

  };

  return {
    link: link,
    restrict: 'E',
    scope: {
      accountId: '@'
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

app.directive('locationAdmins', ['Location', 'Invite', '$routeParams', '$mdDialog', 'showToast', 'showErrors', '$pusher', '$rootScope', '$timeout', function(Location, Invite, $routeParams, $mdDialog, showToast, showErrors, $pusher, $rootScope, $timeout) {

  var link = function( scope, element, attrs ) {

    scope.location = { slug: $routeParams.id };

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
        name: 'View',
        type: 'view',
        icon: 'pageview'
      });

      scope.menu.push({
        name: 'Revoke',
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
        case 'delete':
          revoke(user);
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
      limit: 50,
      page: 1
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
      });
    };

    function DialogController ($scope) {
      $scope.close = function() {
        $mdDialog.cancel();
      };
      $scope.invite = function(user) {
        $mdDialog.cancel();
        inviteUser(user);
      };
    }
    DialogController.$inject = ['$scope'];

    var inviteUser = function(invite) {
      if (allowedEmail(invite.email)) {
        Invite.create({location_id: scope.location.slug, invite: invite}).$promise.then(function(results) {
          scope.users.push(results);
        }, function(err) {
          showErrors(err);
        });
      } else {
        showErrors({message: 'This email has already been added' });
      }
    };

    var revoke = function(user) {
      var confirm = $mdDialog.confirm()
      .title('Remove User')
      .textContent('Removing a user will prevent them from accessing this location.')
      .ariaLabel('Remove')
      .ok('remove')
      .cancel('Cancel');
      $mdDialog.show(confirm).then(function() {
        revokeAdmin(user);
      });
    };

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

    var init = function() {
      Location.users({id: scope.location.slug}).$promise.then(function(results) {
        scope.users = results;
        createMenu();
        scope.loading = undefined;
        scope.location.api_token = attrs.locationToken;
      });
    };

    var view = function(user) {
      window.location.href = '/#/users/' + user.slug;
    };

    init();

    var timer = $timeout(function() {
      loadPusher(scope.location.api_token);
      $timeout.cancel(timer);
    }, 500);

  };

  return {
    link: link,
    scope: {
      id: '@',
      loading: '=',
      locationToken: '@'
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

app.directive('locationBoxes', ['Location', '$location', 'Box', '$routeParams', '$mdDialog', '$mdMedia', 'Payload', 'showToast', 'showErrors', '$q', '$mdEditDialog', 'Zone', function(Location, $location, Box, $routeParams, $mdDialog, $mdMedia, Payload, showToast, showErrors, $q, $mdEditDialog, Zone) {

  var link = function( scope, element, attrs ) {

    scope.selected = [];
    scope.location = {
      slug: $routeParams.id
    };

    // User Permissions //
    var createMenu = function() {

      scope.menuItems = [];

      scope.menuItems.push({
        name: 'Edit',
        type: 'edit',
        icon: 'settings'
      });

      scope.menuItems.push({
        name: 'Reboot',
        type: 'reboot',
        icon: 'autorenew'
      });

      scope.menuItems.push({
        name: 'Run Payload',
        type: 'payload',
        icon: 'present_to_all'
      });

      scope.menuItems.push({
        name: 'Edit Zones',
        type: 'zones',
        icon: 'layers'
      });

      scope.menuItems.push({
        name: 'Resync',
        type: 'resync',
        icon: 'settings_backup_restore'
      });

      scope.menuItems.push({
        name: 'Delete',
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
      .title('Would you like to reboot this device?')
      .textContent('Rebooting will disconnect your clients.\nA reboot takes about 60 seconds to complete')
      .ariaLabel('Lucky day')
      .targetEvent(ev)
      .ok('Reboot it')
      .cancel('Cancel');
      $mdDialog.show(confirm).then(function() {
        rebootBox(box);
      });
    };

    var rebootBox = function(box) {
      box.state = 'processing';
      box.allowed_job = false;

      Box.reboot({id: box.slug}).$promise.then(function(results) {
        box.state = 'rebooting';
        showToast('Box successfully rebooted.');
      }, function(errors) {
        showToast('Failed to reboot box, please try again.');
        console.log('Could not reboot box:', errors);
        box.state = 'online';
        box.processing = undefined;
      });
    };

    var resync = function(box,ev) {
      var confirm = $mdDialog.confirm()
      .title('Resync The Configs for this Device?')
      .textContent('This will disconnect your clients temporarily.')
      .ariaLabel('Lucky day')
      .targetEvent(ev)
      .ok('Resync it')
      .cancel('Cancel');
      $mdDialog.show(confirm).then(function() {
        resyncBox(box);
      });
    };

    var resyncBox = function(box) {
      box.state = 'processing';
      Box.update({location_id: scope.location.slug, id: box.slug, box: { resync: true}}).$promise.then(function(res) {
        showToast('Access point resynced successfully.');
      }, function(errors) {
        box.state = 'failed';
        showToast('Failed to resync box, please try again.');
        console.log('Could not resync box:', errors);
      });
    };

    var destroy = function(box,ev) {
      var confirm = $mdDialog.confirm()
      .title('Delete This Device Permanently?')
      .textContent('Please becareful, this cannot be reversed.')
      .ariaLabel('Lucky day')
      .targetEvent(ev)
      .ok('Delete it')
      .cancel('Cancel');
      $mdDialog.show(confirm).then(function() {
        deleteBox(box);
        showToast('Deleted device with mac ' + box.calledstationid);
      });
    };

    var deleteBox = function(box) {
      box.processing  = true;
      box.allowed_job = false;
      Box.destroy({id: box.slug}).$promise.then(function(results) {
        removeFromList(box);
      }, function(errors) {
        box.processing  = undefined;
        showToast('Failed to delete this box, please try again.');
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

    var runCommand = function(command) {
      formatIds();
      if (selection.length > 0) {
        Payload.create({
          payload: {
            save:       command.save,
            box_ids:    selection,
            command_id: command.selected,
            upgrade:    command.upgrade
          }
        }).$promise.then(function() {
          closeDialog();
          selection = [];
          scope.selected = [];
          showToast('Payload sent successfully.');
        }, function(errors) {
          closeDialog();
          showToast('Payload could not be sent.');
        });
      } else {
        closeDialog();
      }
    };

    scope.deleteDevices = function() {
      var confirm = $mdDialog.confirm()
      .title('Are you sure you want to delete these devices?')
      .textContent('This cannot be undone.')
      .ariaLabel('Delete')
      .ok('delete')
      .cancel('Cancel');
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
        showToast('Deleted '+ scope.selected.length + ' ' + devices);
      }
    };

    var removeFromList = function(box) {
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
          var z = {id: 'remove', zone_name: 'No Zone'};

          results.zones.unshift(z);

          // Loop through the zones so we can set the zone_id for display //
          for(var i = 0, l = $scope.selected.length; i < l; ++i){
            var n, id;
            if ($scope.selected[i].metadata && $scope.selected[i].metadata.zone_name) {
              n  = $scope.selected[i].metadata.zone_name;
              id = $scope.selected[i].metadata.zone_id;
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
        if (box.metadata === undefined) {
          box.metadata = {};
        }
        box.metadata.zone_name = zone_name;
        box.zone_id = zone_id;
        updateZone(box);
      }

      // Write a message to the screen, yeah //
      var devices = 'device zones';
      if (scope.selected.length === 1) {
        devices = 'device zone';
      }
      showToast(scope.selected.length + ' ' + devices + ' updated.');
      scope.selected = [];
    };

    var edit = function(slug) {
      window.location.href = '/#/locations/' + scope.location.slug + '/boxes/' + slug + '/edit';
    };

    var view = function(slug) {
      window.location.href = '/#/locations/' + scope.location.slug + '/boxes/' + slug;
    };

    var updateZone = function(box) {
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
        showToast('Device description updated.');
      }, function(errors) {
        showErrors(errors);
      });
    };

    scope.online = 0;
    var countOnline = function() {
      if (scope.boxes.length) {
        for (var i = 0, len = scope.boxes.length; i < len; i++) {
          if (scope.boxes[i].metadata) {
            scope.online += scope.boxes[i].metadata.online;
          }
        }
      }
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
      filter: '=',
      loading: '='
    },
    templateUrl: 'components/locations/boxes/_table.html'
  };

}]);

app.directive('locationSettings', ['Location', '$location', '$routeParams', '$mdDialog', 'showToast', 'showErrors', 'moment', function(Location, $location, $routeParams, $mdDialog, showToast, showErrors, moment) {

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
      myform.$setPristine();
      Location.update({id: $scope.location.slug, location: $scope.location}, function(data) {
        if (slug !== data.slug) {
          $location.path('/locations/' + data.slug + '/settings');
        }
        showToast('Successfully updated location.');
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

app.directive('locationSettingsMain', ['moment', function(moment) {

  var link = function( scope, element, attrs, controller ) {

    scope.timezones = moment.tz.names();

    scope.update = function (form) {
      controller.update(form);
    };

    scope.back = function() {
      controller.back();
    };

  };

  return {
    link: link,
    templateUrl: 'components/locations/settings/_main.html',
    require: '^locationSettings'
  };

}]);

app.directive('locationSettingsNotifications', [function() {

  var link = function( scope, element, attrs, controller ) {

    scope.update = function (form) {
      var emails = [];
      for (var i = 0, len = scope.ctrl.emails.length; i < len; i++) {
        emails.push(scope.ctrl.emails[i]);
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

app.directive('locationSettingsDevices', ['menu', function(menu) {

  var link = function( scope, element, attrs, controller ) {

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

app.directive('locationSettingsMenu', ['Location', '$location', '$routeParams', '$mdDialog', 'showToast', 'showErrors', 'moment', '$pusher', '$rootScope', function(Location, $location, $routeParams, $mdDialog, showToast, showErrors, moment, $pusher, $rootScope) {

  var link = function( scope, element, attrs ) {

    scope.location = { slug: $routeParams.id };

    // User Permissions //
    var createMenu = function() {

      scope.menu = [];

      scope.menu.push({
        name: 'Notifications',
        type: 'notifications',
        icon: 'add_alert'
      });

      scope.menu.push({
        name: 'Devices',
        type: 'devices',
        icon: 'router'
      });

      scope.menu.push({
        name: 'Splash',
        type: 'splash',
        icon: 'web'
      });

      scope.menu.push({
        name: 'Analytics',
        type: 'analytics',
        icon: 'trending_up'
      });

      scope.menu.push({
        name: 'Transfer',
        type: 'transfer',
        icon: 'transform'
      });

      scope.menu.push({
        name: scope.location.archived ? 'Unarchive' : 'Archive',
        type: 'archive',
        icon: 'archive'
      });

      scope.menu.push({
        name: 'Delete',
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
        msg = 'Are you sure you want to restore this location';
        msg2 = 'Your splash pages and networks will be activated.';
      } else {
        msg = 'Are you sure you want to archive this location';
        msg2 = 'This will prevent users from logging in.';
      }
      var confirm = $mdDialog.confirm()
      .title(msg)
      .textContent(msg2)
      .ariaLabel('Archive')
      .targetEvent(ev)
      .ok('CONFIRM')
      .cancel('Cancel');
      $mdDialog.show(confirm).then(function() {
        if (scope.location.archived) {
          unArchiveLocation();
        } else {
          archiveLocation();
        }
      });
    };

    var archiveLocation = function() {
      Location.archive({id: scope.location.slug}).$promise.then(function(results) {
        scope.location.archived = true;
        showToast('Location successfully archived.');
      }, function(err) {
        showErrors(err);
      });
    };

    var unArchiveLocation = function() {
      Location.unarchive({id: scope.location.slug}).$promise.then(function(results) {
        scope.location.archived = false;
        showToast('Location successfully restored.');
      }, function(err) {
        showErrors(err);
      });
    };

    var destroy = function(ev) {
      var confirm = $mdDialog.confirm()
      .title('Are you sure you want to delete this location?')
      .textContent('You cannot delete a location with session data.')
      .ariaLabel('Archive')
      .targetEvent(ev)
      .ok('delete')
      .cancel('Cancel');
      $mdDialog.show(confirm).then(function() {
        destroyLocation();
      });
    };

    var destroyLocation = function(id) {
      Location.destroy({id: scope.location.id}).$promise.then(function(results) {
        $location.path('/locations');
        showToast('Successfully deleted location.');
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
        showToast('Location successfully transferred.');
      }, function(err) {
        showErrors(err);
      });
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
    template:
        '<md-menu ng-if="menu.length">'+
        '<md-button aria-label="Open Tools" class="md-icon-button" ng-click="$mdOpenMenu($event)">'+
        '<md-icon>more_vert</md-icon>'+
        '</md-button>'+
        '<md-menu-content width="4">'+
        '<md-menu-item ng-repeat="item in menu">'+
        '<md-button ng-disabled="item.disabled" ng-click="action(item.type)">'+
        '<md-icon ng-if="item.icon" md-menu-origin md-font-icon="{{ item.icon }}">{{ item.icon }}</md-icon>'+
        '{{item.name}}'+
        '</md-button>'+
        '</md-menu-item>'+
        '</md-menu-content>'+
        '</md-menu>'
  };

}]);


app.directive('appStatus', ['statusPage', function(statusPage) {

  var link = function(scope) {

    var init = function() {

      var id, slug;
      statusPage.get({}, function(data) {
        scope.status = data;
        if (scope.status.incidents.length === 0) {
          if (scope.status.status.indicator === 'none') {
            scope.color = 'rgb(76,175,80)';
            scope.incidents = 'All systems operational.';
          } else {
            scope.color = 'rgb(255,152,0)';
            scope.incidents = 'Partially degraded service.';
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
    template:
      '<md-card>'+
      '<div class="md-card-image" style=\'height: 5px; background-color: {{ color }};\'></div>'+
      '<md-card-title>'+
      '<md-card-title-text>'+
      '<span class="md-headline">'+
      'Cucumber Status'+
      '</span>'+
      '</md-card-title-text>'+
      '</md-card-title>'+
      '<md-card-content>'+
      '<div ng-if=\'!status\'>'+
      'Loading status'+
      '</div>'+
      '<div ng-if=\'status\'>'+
      '<p ng-if=\'status.incidents.length == 0\'>{{ incidents }}</p>'+
      '<span ng-if=\'status.incidents.length > 0\'>'+
      '<md-list-item class="md-2-line" ng-repeat=\'i in status.incidents\'>'+
      '<div class="md-list-item-text">'+
      '<h3>{{ i.name }}</h3>'+
      '<p>{{ i.incident_updates[0].body }}</p>'+
      '</div>'+
      '</md-list-item>'+
      '</span>'+
      '</div>'+
      '</md-card-content>'+
      '<md-divider></md-divider>'+
      '<md-card-actions layout="row" layout-align="end center">'+
      '<md-button target=\'_blank\' href=\'{{ url}}\'>VIEW</md-button>'+
      '</md-card-actions>'+
      '</md-card>'
  };

}]);

app.directive('warnings', ['Event', 'Shortener', '$location', function(Event,Shortener,$location) {

  var link = function(scope) {

    scope.loading = true;

    var init = function() {
      Event.query({warning: true, per: 5}).$promise.then(function(results) {
        scope.events            = results.events;
        scope.loading           = undefined;
      }, function(error) {
        scope.loading           = undefined;
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
    template:
      '<md-card>'+
      '<div class="md-card-image" style=\'height: 5px; background-color: {{ color }};\'></div>'+
      '<md-card-title>'+
      '<md-card-title-text>'+
      '<span class="md-headline">'+
      'Warnings'+
      '</span>'+
      '</md-card-title-text>'+
      '</md-card-title>'+
      '<md-card-content>'+
      '<span ng-if=\'loading\'>'+
      'Loading.'+
      '</span>'+
      '<span ng-if=\'!events.length && !loading\'>'+
      'No warnings found.'+
      '</span>'+
      '<md-list-item class="md-2-line" href="" ng-click="visitBox(event.short_url)" ng-repeat=\'event in events\'>'+
      '<div class="md-list-item-text">'+
      '<h3 ng-class="event.event_type == \'box.online\' ? \'muted\' : \'offline\'">{{ event.data.description }} {{ event.event_type == \'box.online\' ? \'Reconnected\' : \'Disconnected\' }}</h3>'+
      '<md-tooltip>{{ event.data.ap_mac }}</md-tooltip>'+
      '<p>Last seen {{ event.data.last_heartbeat | mysqlTime }}</p>'+
      '</div>'+
      '</md-list-item>'+
      '</md-card-content>'+
      '<md-divider></md-divider>'+
      '<md-card-actions layout="row" layout-align="end center">'+
      '<md-button href=\'/#/events\'>events</md-button>'+
      '</md-card-actions>'+
      '</md-card>'
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
    template:
      '<md-card>'+
      '<div class="md-card-image" style=\'height: 5px; background-color: {{ color }};\'></div>'+
      '<md-card-title>'+
      '<md-card-title-text>'+
      '<span class="md-headline">'+
      // '<md-icon md-font-icon="arrow_back">favorite</md-icon>'+
      'Favourites'+
      '</span>'+
      '</md-card-title-text>'+
      '</md-card-title>'+
      '<md-card-content>'+
      '<span ng-if=\'loading\'>'+
      'Loading.'+
      '</span>'+
      '<span ng-if=\'!loading\'>'+
      '<span ng-if=\'!locations.length\'>'+
      'You have no favourite locations.'+
      '</span>'+
      '<md-list>'+
      '<md-list-item class="md-3-line" ng-repeat=\'item in locations\' href=\'/#/locations/{{ ::item.slug }}\'>'+
      '<div class="md-list-item-text">'+
      '<h3>{{ ::item.location_name }}</h3>'+
      '<h4>{{ ::item.location_address | truncate:20 }}.</h4>'+
      '<p>{{ ::item.boxes_count }} boxes. {{ ::item.clients_online }} client<span ng-if=\'item.clients_online != 1\'>s</span> online.</p>'+
      '</div>'+
      '</md-list-item>'+
      '</md-list>'+
      '</span>'+
      '</md-card-content>'+
      '<md-divider></md-divider>'+
      '<md-card-actions layout="row" layout-align="end center" >'+
      '<md-button target=\'_blank\' ng-disabled=\'!locations\' ng-click=\'all()\'>VIEW ALL</md-button>'+
      '</md-card-actions>'+
      '</md-card>'
  };

}]);

app.directive('favouritesExtended', ['Location', '$location', '$routeParams', 'showToast', 'showErrors', '$mdDialog', function(Location, $location, $routeParams, showToast, showErrors, $mdDialog) {

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
        name: 'View',
        type: 'view',
        icon: 'pageview'
      });

      scope.menu.push({
        name: 'Unfavourite',
        type: 'remove',
        icon: 'favorite_border'
      });

    };

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
      .title('Remove From Favourites?')
      .textContent('Are you sure you want to remove this location?')
      .ariaLabel('Remove Location')
      .ok('Ok')
      .cancel('Cancel');
      $mdDialog.show(confirm).then(function() {
        removeFav(id);
      });
    };

    var removeFav = function(id) {
      updateLocation(id);
    };

    function updateLocation(id) {
      Location.update({id: id, location: { favourite: false }} ).$promise.then(function(results) {
        removeFromList(id);
      }, function(err) {
        showErrors(err);
      });
    }

    var removeFromList = function(id) {
      for (var i = 0, len = scope.locations.length; i < len; i++) {
        if (scope.locations[i].slug === id) {
          scope.locations.splice(i, 1);
          showToast('Location removed from favourites.');
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

app.directive('boxesAlerting', ['Location', '$location', '$routeParams', 'showToast', 'showErrors', '$mdDialog', 'Box', 'menu', function(Location, $location, $routeParams, showToast, showErrors, $mdDialog, Box, menu) {

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
        var val = box.ignored ? 'muted' : 'unmuted';
        showToast('Box successfully ' + val + '.');
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
    template:
      '<md-card>'+
      '<div class="md-card-image" style=\'height: 5px; background-color: {{ color }};\'></div>'+
      '<md-card-title>'+
      '<md-card-title-text>'+
      '<span class="md-headline">'+
      'Inventory'+
      '</span>'+
      '</md-card-title-text>'+
      '</md-card-title>'+
      '<md-card-content>'+
      '<div ng-if=\'loading\'>'+
      'Loading'+
      '</div>'+
      '<div ng-if=\'!loading\'>'+
      '<md-list-item class="md-3-line" href=\'/#/users/{{ user.slug }}/inventory\'>'+
      '<md-icon md-font-icon="">devices</md-icon>'+
      '<div class="md-list-item-text">'+
      '<h3>New Boxes</h3>'+
      '<p>{{ stats.new }} added this period. {{ stats.active }} existing boxes.</p>'+
      '</div>'+
      '</md-list-item>'+
      '</div>'+
      '</md-card-content>'+
      '<md-divider></md-divider>'+
      '<md-card-actions layout="row" layout-align="end center">'+
      '<md-button href=\'/#/locations/new\'>NEW LOCATION</md-button>'+
      '</md-card-actions>'+
      '</md-card>'
  };

}]);
