'use strict';

var app = angular.module('myApp.locations.directives', []);

app.directive('locationShow', ['Location', '$routeParams', '$location', '$localStorage', 'showToast', 'menu', '$timeout', '$pusher', '$route', '$rootScope', 'gettextCatalog', function(Location, $routeParams, $location, $localStorage, showToast, menu, $timeout, $pusher, $route, $rootScope, gettextCatalog) {

  var link = function(scope,element,attrs,controller) {

    scope.currentNavItem = 'devices';
    var channel;

    scope.favourite = function() {
      scope.location.is_favourite = !scope.location.is_favourite;
      updateLocation();
    };

    if ($localStorage.mimo_user) {
      scope.white_label = $localStorage.mimo_user.custom;
    }

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

    var timer = $timeout(function() {
      scope.loading = undefined;
      $timeout.cancel(timer);
    },1500);

    controller.fetch().then(function(integration) {
      scope.integration = integration;
    }, function(err) { console.log(err); });

    scope.addBoxes = function() {
      controller.addBoxes(scope.integration).then(function() {
        $route.reload();
      });
    };
  };

  return {
    require: '^integrations',
    link: link,
    loading: '=',
    templateUrl: 'components/locations/show/_index.html'
  };

}]);

app.directive('newLocationForm', ['Location', '$location', 'menu', 'showErrors', 'showToast', '$timeout', 'gettextCatalog', function(Location, $location, menu, showErrors, showToast, $timeout, gettextCatalog) {

  var link = function( scope, element, attrs ) {

    menu.isOpen = false;
    menu.hideBurger = true;
    scope.location  = {
      add_to_global_map: false,
    };

    scope.save = function(form, location) {
      form.$setPristine();
      scope.location.creating = true;
      updateCT(location);
    };

    var complete = function(slug) {
      var timer = $timeout(function() {
        $timeout.cancel(timer);
        $location.path('/' + slug + '/guide');
        showToast(gettextCatalog.getString('Location successfully created.'));
      }, 2000);
    };

    var updateCT = function(location) {
      scope.loading = true;
      Location.save({
        location: location,
      }).$promise.then(function(results) {
        menu.isOpen = true;
        menu.hideBurger = false;
        complete(results.slug);
      }, function(err) {
        var msg = err.data.message[0];
        scope.loading = undefined;
        if (msg === 'Over free quota') {
          scope.over_quota = 'Hey, you\'re going to need a paid plan to do that.';
        } else if (msg === 'Over quota') {
          scope.over_quota = 'Please drop us a line and ask for a quota increase.';
        } else {
          showErrors(err);
        }
      });
    };
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

app.directive('locationBoxes', ['Location', '$location', 'Box', '$routeParams', '$mdDialog', '$mdMedia', 'showToast', 'showErrors', '$q', '$mdEditDialog', '$pusher', '$rootScope', 'gettextCatalog', 'pagination_labels', '$timeout', function(Location, $location, Box, $routeParams, $mdDialog, $mdMedia, showToast, showErrors, $q, $mdEditDialog, $pusher, $rootScope, gettextCatalog, pagination_labels, $timeout) {

  var link = function( scope, element, attrs ) {
    scope.selected = [];
    scope.location = {
      slug: $routeParams.id
    };

    // User Permissions //
    var createMenu = function() {

      scope.menuItems = [];

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

    scope.action = function(box,type) {
      switch(type) {
        case 'delete':
          destroy(box);
          break;
        default:
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
        scope.deferred.resolve();
      }, function(err) {
        scope.loading = undefined;
      });
      return scope.deferred.promise;
    };

    var search = function() {
      var hash            = {};
      hash.page           = scope.query.page;
      hash.per            = scope.query.limit;
      $location.search(hash);
      init();
    };

    scope.onPaginate = function (page, limit) {
      scope.query.page = page;
      scope.query.limit = limit;
      search();
    };

    init();

  };
  return {
    link: link,
    scope: {
      filter: '=',
      loading: '=',
      token: '@'
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

app.directive('locationSettingsMain', ['Location', '$location', '$routeParams', 'moment', '$mdDialog', 'showToast', 'showErrors', 'gettextCatalog', function(Location, $location, $routeParams, moment, $mdDialog, showToast, showErrors, gettextCatalog) {

  var link = function( scope, element, attrs, controller ) {

    scope.timezones = moment.tz.names();
    scope.currentNavItem = 'location';

    scope.update = function (form) {
      controller.update(form);
    };

    scope.back = function() {
      controller.back();
    };

    scope.destroy = function(ev) {
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

app.directive('locationSettingsSecurity', ['$timeout', '$localStorage', function($timeout, $localStorage) {

  var link = function( scope, element, attrs, controller ) {

    scope.update = function (form) {
      controller.update(form);
    };

    scope.ctrl = {};
    scope.ctrl.levels = [1,2,3];
    if ($localStorage.mimo_user) {
      scope.white_label = $localStorage.mimo_user.custom;
    }

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
          scope.destroy();
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

app.directive('integrationSelect', ['Location', '$routeParams', '$location', '$http', '$mdDialog', 'showToast', 'showErrors', 'gettextCatalog', function(Location, $routeParams, $location, $http, $mdDialog, showToast, showErrors, gettextCatalog) {

  var link = function(scope, element, attrs, controller) {

    scope.loading = true;

    scope.save = function(type) {
      if (scope.location.paid) {
        $location.path($routeParams.id + '/integration/' + type + '/auth');
      }
    };

    controller.fetch().then(function(integration) {
      if (integration && integration.active) {
        $location.path('/' + $routeParams.id + '/settings/integrations');
      } else {
        scope.loading = undefined;
      }
    });
  };

  return {
    require: '^integrations',
    link: link,
    scope: {
      location: '=',
      loading: '='
    },
    templateUrl: 'components/locations/new/_create_integration.html'
  };

}]);

app.directive('integrations', ['Location', '$routeParams', '$location', '$http', '$mdDialog', 'showToast', 'showErrors', 'SplashIntegration', '$q', function(Location, $routeParams, $location, $http, $mdDialog, showToast, showErrors, SplashIntegration, $q) {

  var link = function(scope, element, attrs) {

    scope.integSelected = function() {
      scope.integration.host = undefined;
      scope.integration.username = undefined;
      scope.integration.password = undefined;
    };

  };

  var controller = function($scope) {

    this.scope = $scope;

    this.fetch = function() {
      var deferred = $q.defer();
      SplashIntegration.query({location_id: $routeParams.id}).$promise.then(function(results) {
        deferred.resolve(results);
      });
      return deferred.promise;
    };

    this.save = function(integration) {
      var deferred = $q.defer();
      SplashIntegration.create({}, {
        location_id: $routeParams.id,
        splash_integration: integration
      }).$promise.then(function(results) {
        // $scope.validated = true;
        showToast('Successfully validated integration');
        deferred.resolve(results);
      }, function(error) {
        deferred.reject();
        showErrors(error);
      });

      return deferred.promise;
    };

    this.update = function(integration) {
      var deferred = $q.defer();
      SplashIntegration.update({}, {
        id: integration.id,
        location_id: $routeParams.id,
        splash_integration: integration
      }).$promise.then(function(results) {
        showToast('Successfully updated and validated integration');
        deferred.resolve(results);
      }, function(error) {
        deferred.reject();
        console.log(error);
      });
      return deferred.promise;
    };

    this.fetchSites = function(integration) {
      var deferred = $q.defer();
      SplashIntegration.integration_action({
        id: integration.id,
        location_id: $routeParams.id,
        action: 'fetch_settings'
      }).$promise.then(function(results) {
        deferred.resolve(results);
      });
      return deferred.promise;
    };

    this.addBoxes = function(integration) {
      var deferred = $q.defer();
      SplashIntegration.update({},{
        id: integration.id,
        location_id: $routeParams.id,
        splash_integration: {
          action: 'import_boxes'
        }
      }, function(results) {
        if (results.success > 0) {
          showToast(results.success + ' boxes imported. ' + results.failed.length + ' failed to import (added to another location).');
          deferred.resolve();
        } else if (results.success === 0 && results.failed === 0) {
          showToast('Couldn\'nt import any boxes!!!');
          deferred.reject();
        } else if (results.success === 0 ) {
          showToast(results.failed.length + ' boxes failed to import - already added to a location.');
          deferred.reject();
        }
      }, function(error) {
        showErrors(error);
        deferred.reject();
      });
      return deferred.promise;
    };
  };

  return {
    controller: controller
  };

}]);

app.directive('unifiAuth', ['Location', '$routeParams', '$location', '$http', '$mdDialog', 'showToast', 'showErrors', 'gettextCatalog', function(Location, $routeParams, $location, $http, $mdDialog, showToast, showErrors, gettextCatalog) {

  var link = function(scope, element, attrs, controller) {

    scope.location = {slug: $routeParams.id};

    var locationName = function() {
      Location.get({id: scope.location.slug}, function(data) {
        scope.location = data;
      }, function(err){
        console.log(err);
      });
    };

    var create = function() {
      controller.save(scope.integration).then(function() {
        scope.validated = true;
      });
    };

    var update = function() {
      controller.update(scope.integration).then(function() {
        scope.validated = true;
      });
    };

    scope.save = function(form) {
      scope.myForm.$setPristine();
      scope.integration.action = 'validate';
      if (scope.integration.new_record) {
        create();
      } else {
        update();
      }
    };

    scope.next = function(results) {
      $location.path($routeParams.id + '/integration/unifi/setup');
    };

    controller.fetch().then(function(integration) {
      scope.integration = integration;
      if (integration && integration.active) {
        $location.path('/' + $routeParams.id + '/settings/integrations');
        return;
      }
      scope.integration.type = 'unifi';
    }, function(err) { console.log(err); })

    locationName();

  };

  return {
    require: '^integrations',
    link: link,
    scope: {},
    templateUrl: 'components/locations/new/_unifi_auth.html'
  };

}]);

app.directive('unifiSetup', ['Location', '$routeParams', '$location', '$http', '$mdDialog', 'showToast', 'showErrors', 'gettextCatalog', 'SplashIntegration', function(Location, $routeParams, $location, $http, $mdDialog, showToast, showErrors, gettextCatalog, SplashIntegration) {

  var link = function(scope, element, attrs, controller) {

    scope.location = {slug: $routeParams.id};

    var locationName = function() {
      Location.get({id: scope.location.slug}, function(data) {
        scope.location = data;
      }, function(err){
        console.log(err);
      });
    };

    scope.save = function(form,site,ssid) {
      scope.myForm.$setPristine();
      site = JSON.parse(site);
      SplashIntegration.update({},{
        id: scope.integration.id,
        location_id: $routeParams.id,
        splash_integration: {
          metadata: {
            unifi_site_name:  site.name,
            unifi_site_id:    site.id,
            ssid:             ssid
          },
          action: 'create_setup'
        }
      }, function(results) {
        showToast('Successfully created UniFi setup');
        // @zak create the landing page
        $location.path($routeParams.id + '/integration/completed');
      }, function(error) {
        showErrors(error);
      });
    };

    var fetchSites = function() {
      controller.fetchSites(scope.integration).then(function(sites) {
        scope.unifi_sites = sites;
      });
    };

    controller.fetch().then(function(integration) {
      if(integration.new_record) {
        $location.path($routeParams.id + '/integration/unifi/auth');
      } else if (integration.active) {
        $location.path('/' + $routeParams.id + '/settings/integrations');
      } else {
        scope.integration = integration;
        fetchSites();
      }
    });

    locationName();

  };

  return {
    require: '^integrations',
    link: link,
    scope: {},
    templateUrl: 'components/locations/new/_unifi_setup.html'
  };

}]);

app.directive('vszAuth', ['Location', '$routeParams', '$location', '$http', '$mdDialog', 'showToast', 'showErrors', 'gettextCatalog', function(Location, $routeParams, $location, $http, $mdDialog, showToast, showErrors, gettextCatalog) {

  var link = function(scope, element, attrs, controller) {

    scope.location = {slug: $routeParams.id};

    var locationName = function() {
      Location.get({id: scope.location.slug}, function(data) {
        scope.location = data;
      }, function(err){
        console.log(err);
      });
    };

    var create = function() {
      controller.save(scope.integration).then(function() {
        scope.validated = true;
      });
    };

    var update = function() {
      controller.update(scope.integration).then(function() {
        scope.validated = true;
      });
    };

    scope.save = function(form) {
      scope.myForm.$setPristine();
      scope.integration.action = 'validate';
      if (scope.integration.new_record) {
        create();
      } else {
        update();
      }
    };

    scope.next = function(results) {
      $location.path($routeParams.id + '/integration/vsz/setup');
    };

    controller.fetch().then(function(integration) {
      if (integration.active) {
        $location.path('/' + $routeParams.id + '/settings/integrations');
      }
      scope.integration = integration;
      scope.integration.type = 'vsz';
    }, function(err) { console.log(err); });

    locationName();

  };

  return {
    require: '^integrations',
    link: link,
    scope: {
    },
    templateUrl: 'components/locations/new/_vsz_auth.html'
  };

}]);

app.directive('vszSetup', ['Location', '$routeParams', '$location', '$http', '$mdDialog', 'showToast', 'showErrors', 'gettextCatalog', 'SplashIntegration', function(Location, $routeParams, $location, $http, $mdDialog, showToast, showErrors, gettextCatalog, SplashIntegration) {

  var link = function(scope, element, attrs, controller) {

    scope.location = {slug: $routeParams.id};

    var locationName = function() {
      Location.get({id: scope.location.slug}, function(data) {
        scope.location = data;
      }, function(err){
        console.log(err);
      });
    };

    scope.save = function(form,site,ssid) {
      scope.myForm.$setPristine();
      site = JSON.parse(site);
      SplashIntegration.update({},{
        id: scope.integration.id,
        location_id: $routeParams.id,
        splash_integration: {
          metadata: {
            vsz_zone_name:  site.name,
            zoneUUID:       site.id,
            ssid:           ssid
          },
          action: 'create_setup'
        }
      }, function(results) {
        showToast('Successfully created Ruckus VSZ setup');
        console.log(results)
        // @zak create the landing page
        $location.path($routeParams.id + '/integration/completed');
      }, function(error) {
        showErrors(error);
      });
    };

    var fetchSites = function() {
      controller.fetchSites(scope.integration).then(function(sites) {
        scope.vsz_zones = sites;
      });
    };

    controller.fetch().then(function(integration) {
      if(integration.new_record) {
        $location.path($routeParams.id + '/integration/vsz/auth');
      } else if (integration.active) {
        $location.path('/' + $routeParams.id + '/settings/integrations');
      } else {
        scope.integration = integration;
        fetchSites();
      }
    });

    locationName();

  };

  return {
    require: '^integrations',
    link: link,
    scope: {
    },
    templateUrl: 'components/locations/new/_vsz_setup.html'
  };

}]);

app.directive('merakiAuth', ['Location', '$routeParams', '$location', '$http', '$mdDialog', 'showToast', 'showErrors', 'gettextCatalog', function(Location, $routeParams, $location, $http, $mdDialog, showToast, showErrors, gettextCatalog) {

  var link = function(scope, element, attrs, controller) {

    scope.location = {slug: $routeParams.id};

    var locationName = function() {
      Location.get({id: scope.location.slug}, function(data) {
        scope.location = data;
      }, function(err){
        console.log(err);
      });
    };

    var create = function() {
      controller.save(scope.integration).then(function() {
        scope.validated = true;
      });
    };

    var update = function() {
      controller.update(scope.integration).then(function() {
        scope.validated = true;
      });
    }

    scope.save = function(form) {
      scope.myForm.$setPristine();
      scope.integration.action = 'validate';
      if (scope.integration.new_record) {
        create();
      } else {
        update();
      }
    };

    scope.next = function(results) {
      $location.path($routeParams.id + '/integration/meraki/setup');
    };

    controller.fetch().then(function(integration) {
      scope.integration = integration;
      scope.integration.type = 'meraki';
    }, function(err) { console.log(err); });

    locationName();

  };

  return {
    require: '^integrations',
    link: link,
    scope: {
    },
    templateUrl: 'components/locations/new/_meraki_auth.html'
  };

}]);

app.directive('merakiSetup', ['Location', '$routeParams', '$location', '$http', '$mdDialog', 'showToast', 'showErrors', 'gettextCatalog', 'SplashIntegration', function(Location, $routeParams, $location, $http, $mdDialog, showToast, showErrors, gettextCatalog, SplashIntegration) {

  var link = function(scope, element, attrs, controller) {

    scope.location = {slug: $routeParams.id};

    var locationName = function() {
      Location.get({id: scope.location.slug}, function(data) {
        scope.location = data;
      }, function(err){
        console.log(err);
      });
    };

    scope.save = function(meraki) {
      SplashIntegration.update({},{
        id: scope.integration.id,
        location_id: $routeParams.id,
        splash_integration: {
          metadata: {
            ssid:         meraki.ssid,
            organisation: scope.meraki.org,
            network:      scope.meraki.network
          },
          action: 'create_setup'
        }
      }, function(results) {
        showToast('Successfully created Meraki setup');
        $location.path('/' + $routeParams.id + '/integration/completed');
      }, function(error) {
        showErrors(error);
      });
    };

    var update = function(cb) {
      SplashIntegration.update({}, {
        id: scope.integration.id,
        location_id: $routeParams.id,
        splash_integration: scope.integration
      }).$promise.then(function(results) {
        return cb();
      }, function(error) {
        console.log(error);
        return cb();
      });
    };

    var fetchSites = function() {
      controller.fetchSites(scope.integration).then(function(results) {
        scope.meraki = {};
        scope.integration.metadata = {};
        scope.meraki.ssid = undefined;
        scope.meraki_ssids = [];
        scope.meraki.network = undefined;
        scope.meraki_networks = [];
        scope.meraki_orgs = results;
      });
    };

    var fetchNetworks = function() {
      SplashIntegration.integration_action({
        id: scope.integration.id,
        location_id: $routeParams.id,
        action: 'meraki_networks'
      }).$promise.then(function(results) {
        scope.meraki_networks = results;
        }
      );
    };

    scope.orgSelected = function(org) {
      scope.meraki.ssid = undefined;
      scope.meraki_ssids = [];
      scope.meraki.network = undefined;
      scope.meraki_networks = [];
      scope.integration.metadata.organisation = org;
      update(function() {
        fetchNetworks();
      });
    };

    var fetchSsid = function() {
      SplashIntegration.integration_action({
        id: scope.integration.id,
        location_id: $routeParams.id,
        action: 'meraki_ssids'
      }).$promise.then(function(results) {
        scope.meraki_ssids = results;
        }
      );
    };

    scope.netSelected = function(network) {
      scope.meraki.ssid = undefined;
      scope.meraki_ssids = [];
      scope.integration.metadata.network = network;
      update(function() {
        fetchSsid();
      });
    };

    controller.fetch().then(function(integration) {
      if(integration.new_record) {
        $location.path($routeParams.id + '/integration/meraki/auth');
      } else if (integration.active) {
        $location.path('/' + $routeParams.id + '/settings/integrations');
      } else {
        scope.integration = integration;
        fetchSites();
      }
    });

    locationName();

  };

  return {
    require: '^integrations',
    link: link,
    scope: {
    },
    templateUrl: 'components/locations/new/_meraki_setup.html'
  };

}]);

app.directive('gettingStarted', ['Location', '$routeParams', '$location', '$http', '$mdDialog', 'showToast', 'showErrors', 'gettextCatalog', function(Location, $routeParams, $location, $http, $mdDialog, showToast, showErrors, gettextCatalog) {

  var link = function(scope, element, attrs, controller) {

    scope.loading = true;

    scope.visitSplash = function(paid) {
      $location.path('/' + scope.location.slug + '/splash_pages' + (paid ? '' : '/guide'));
    };
    scope.currentNavItem = 'guide';

    scope.$watch('location',function(nv){
      if (nv !== undefined && scope.location.setup) {
        if (scope.location.setup && scope.location.setup.splash && scope.location.setup.integrations) {
          $location.path('/' + scope.location.slug);
        } else {
          scope.loading = undefined;
        }
      }
    });
  };

  return {
    link: link,
    scope: {
      location: '='
    },
    templateUrl: 'components/locations/welcome/_index.html'
  };

}]);

app.directive('getWithThePlan', ['Location', '$routeParams', '$location', 'Subscription', '$mdDialog', '$timeout', '$pusher', 'gettextCatalog', 'STRIPE_KEY', 'Auth', function(Location, $routeParams, $location, Subscription, $mdDialog, $timeout, $pusher, gettextCatalog, STRIPE_KEY, Auth) {

  var link = function(scope, element, attrs, controller) {

    var key = Auth.currentUser().key;
    scope.label = attrs.label || 'Free Trial';

    scope.signUp = function(ev) {

      if (!scope.location) {
        console.log('Kindly send a location in bromie');
        return;
      }

      if (STRIPE_KEY && window.Stripe) {
        console.log('Setting Stripe Token');
        window.Stripe.setPublishableKey(STRIPE_KEY);
      } else {
        console.log('Could not set stripe token');
        return;
      }

      $mdDialog.show({
        controller: DialogController,
        templateUrl: 'components/locations/_signup.tmpl.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose: false
      }).then(function(answer) {
      }, function() {
      });
    };

    var convertToPaid = function() {
      scope.location.paid = true;
    };

    var channel;

    function DialogController($scope, $mdDialog) {
      $scope.selectedIndex = 0;
      $scope.plan = 'engage-20180130';

      $scope.hide = function() {
        $mdDialog.hide();
      };

      $scope.cancel = function() {
        $mdDialog.cancel();
      };

      $scope.back = function() {
        $scope.errors = undefined;
        if ($scope.selectedIndex > 0) {
          $scope.selectedIndex--;
        }
      };

      $scope.next = function() {
        if ($scope.selectedIndex < 4) {
          $scope.selectedIndex++;
        }
      };

      var subscribe = function() {
        if (typeof client !== 'undefined') {
          var pusher = $pusher(client);
          if (!key) {
            return;
          }

          channel = pusher.subscribe(key);
          channel.bind('sub_completed', function(data) {
            if (data.message.success === true) {
              convertToPaid();
              $scope.success = true;
              $scope.selectedIndex = 4;
              var timer = $timeout(function() {
                $mdDialog.cancel();
                $timeout.cancel(timer);
              },2500);
            } else {
              $scope.errors = data.message.message;
            }
          });
        }
      };

      var upgrade = function(card) {
        subscribe();
        Subscription.create({plan_id: $scope.plan, card: card}).$promise.then(function(data) {
          $scope.selectedIndex = 3;
        }, function(err) {
          $scope.subscribing = undefined;
          $scope.errors = err.data.message;
        });
      };

      var createSubscription = function(card) {
        upgrade(card);
      };

      $scope.stripeCallback = function (code, result) {
        if (result.error) {
          showErrors({data: result.error.message});
        } else {
          $scope.next();
          createSubscription(result.id);
        }
      };
    }
  };

  var template =
    '<md-button type="submit" class="md-raised md-primary" ng-click="signUp()">' +
    '{{ label }}' +
    '</md-button>';


  return {
    link: link,
    scope: {
      message: '@',
      location: '='
    },
    template: template
  };
}]);

app.directive('integrationComplete', ['Location', '$routeParams', '$location', '$http', '$mdDialog', 'showToast', 'showErrors', 'gettextCatalog', function(Location, $routeParams, $location, $http, $mdDialog, showToast, showErrors, gettextCatalog) {

  var link = function(scope, element, attrs, controller) {

    scope.loading = true;
    scope.location = { slug: $routeParams.id };

    var setType = function() {
      switch (scope.integration.type) {
        case 'unifi':
          scope.type = 'UniFi';
          break;
        case 'meraki':
          scope.type = 'Meraki';
          break;
        case 'vsz':
          scope.type = 'Ruckus VSZ';
          break;
      }
    };

    controller.fetch().then(function(integration) {
      scope.integration = integration;
      setType();
      scope.loading = undefined;
    }, function(err) { console.log(err); });
  };

  return {
    require: '^integrations',
    link: link,
    scope: {
    },
    templateUrl: 'components/locations/new/_integration_complete.html'
  };
}]);

app.directive('integrationSettings', ['Location', '$routeParams', '$location', '$http', '$mdDialog', 'showToast', 'showErrors', 'gettextCatalog', function(Location, $routeParams, $location, $http, $mdDialog, showToast, showErrors, gettextCatalog) {

  var link = function(scope, element, attrs, controller) {

    scope.location = {slug: $routeParams.id};
    scope.currentNavItem = 'integrations';

    scope.openDoc = function(){
      window.open('http://google.com');
    };

    var locationName = function() {
      Location.get({id: scope.location.slug}, function(data) {
        scope.location = data;
      }, function(err){
        console.log(err);
      });
    };

    var create = function() {
      controller.save(scope.integration).then(function() {
        scope.validated = true;
      });
    };

    var update = function() {
      controller.update(scope.integration).then(function() {
        scope.validated = true;
      });
    };

    scope.save = function(form) {
      scope.myForm.$setPristine();
      scope.integration.action = 'validate';
      if (scope.integration.new_record) {
        create();
      } else {
        update();
      }
    };

    controller.fetch().then(function(integration) {
      scope.integration = integration;
    }, function(err) { console.log(err); })

    locationName();

  };

  return {
    require: '^integrations',
    link: link,
    scope: {
    },
    templateUrl: 'components/locations/settings/_integration.html'
  };

}]);

// app.directive('locationSidebar', ['Location', '$routeParams', '$rootScope', '$http', '$location', 'menu', 'locationHelper', '$q','Shortener', 'gettextCatalog', 'pagination_labels', function (Location, $routeParams, $rootScope, $http, $location, menu, locationHelper, $q, Shortener, gettextCatalog, pagination_labels) {
//
//   var link = function(scope,element,attrs) {
//
//     menu.isOpenLeft = false;
//     menu.isOpen = false;
//     menu.hideBurger = true;
//     menu.sectionName = gettextCatalog.getString('Locations');
//
//     if ($routeParams.user_id) {
//       scope.user_id = parseInt($routeParams.user_id);
//     }
//
//     scope.options = {
//       boundaryLinks: false,
//       largeEditDialog: false,
//       pageSelector: false,
//       rowSelection: false
//     };
//
//     scope.pagination_labels = pagination_labels;
//     scope.query = {
//       order:      'updated_at',
//       filter:     $routeParams.q,
//       limit:      $routeParams.per || 25,
//       page:       $routeParams.page || 1,
//       options:    [5,10,25,50,100],
//       direction:  $routeParams.direction || 'desc',
//       sort:  $routeParams.sort || 'updated_at'
//     };
//
//     scope.sort = function(val, reverse) {
//       if (scope.query.direction === 'asc') {
//         scope.query.direction = 'desc';
//       } else {
//         scope.query.direction = 'asc';
//       }
//       var page = $routeParams.page || 1;
//       var limit = $routeParams.per || 25;
//       scope.onPaginate(page, limit, val);
//     };
//
//     scope.onPaginate = function (page, limit, val) {
//     };
//
//     scope.blur = function() {
//     };
//
//     var filterLocationOwners = function() {
//       if (scope.user_id && scope.locations.length > 0) {
//         for (var i = 0, len = scope.locations.length; i < len; i++) {
//           if (scope.locations[i].user_id === scope.user_id) {
//             scope.locations[i].owner = true;
//           }
//         }
//       }
//     };
//
//     scope.newLocation = function() {
//       window.location.href = '/#/new-location';
//     };
//
//     var init = function() {
//       Location.query({
//         q: scope.query.filter,
//         page: scope.query.page,
//         per: scope.query.limit,
//         sort: scope.query.sort,
//         direction: scope.query.direction,
//         user_id: scope.user_id
//       }).$promise.then(function(results) {
//         scope.total_locs  = results._links.total_entries;
//         scope.locations   = results.locations;
//         scope._links      = results._links;
//         // filterLocationOwners();
//         scope.searching   = undefined;
//         scope.loading     = undefined;
//       }, function() {
//         scope.loading   = undefined;
//         scope.searching = undefined;
//       });
//     };
//
//     // simon removed
//     // init();
//   };
//
//   return {
//     link: link,
//     templateUrl: 'components/locations/show/_location_sidebar.html',
//     scope: {}
//   };
//
// }]);

app.directive('locationSettingsNav', ['Location', function(Location) {

  var link = function(scope, element, attrs, controller) {
    scope.loading = true;
  };

  return {
    link: link,
    templateUrl: 'components/locations/settings/_nav.html'
  };
}]);

app.directive('locationAudit', ['Session', 'Email', 'Location', 'Report', '$routeParams', '$rootScope', '$location', '$timeout', '$q', '$localStorage', 'Locations', '$mdDialog', 'showToast', 'showErrors', 'gettextCatalog', function(Session, Email, Location, Report, $routeParams, $rootScope, $location, $timeout, $q, $localStorage, Locations, $mdDialog, showToast, showErrors, gettextCatalog) {

  var link = function(scope,element,attrs,controller) {

    var params = {};

    scope.startDate = moment().utc().subtract(6, 'days').startOf('day').toDate();
    scope.endDate = moment().utc().toDate();

    var weekAgoEpoch = Math.floor(scope.startDate.getTime() / 1000);
    var nowEpoch = Math.floor(scope.endDate.getTime() / 1000);

    scope.audit_models = ['Radius Sessions', 'Emails'];

    var mailerType = {
      'Radius Sessions': 'radius',
      'Emails': 'email'
    };

    scope.selected = 'Radius Sessions' || $routeParams.type;

    scope.query = {
      page: $routeParams.page || 1,
      limit: $routeParams.per || 25,
      start: $routeParams.start || weekAgoEpoch,
      end: $routeParams.end || nowEpoch
    };

    var getParams = function() {
      params = {
        location_id: scope.location.id,
        page: scope.query.page,
        per: scope.query.limit,
        start: scope.query.start,
        end: scope.query.end,
        interval: 'day'
      };
    };

    var clearTable = function() {
      scope.results = [];
      scope.links = undefined;
      $location.search();
      if (scope.query.end - scope.query.start > 604800 && $localStorage.user && !localStorage.user.paid_plan) {
        showToast(gettextCatalog.getString('Please ensure you are permitted to see audits in this date range.'));
      }
    };

    var findSessions = function() {
      getParams();
      params.client_mac = scope.query.client_mac;
      Session.query(params).$promise.then(function(data, err) {
        scope.selected = 'Radius Sessions';
        scope.results = data.sessions;
        scope.links = data._links;
        $location.search();
      }, function(err) {
        console.log(err);
        clearTable();
      });
    };

    var findEmails = function() {
      getParams();
      Email.get(params).$promise.then(function(data, err) {
        scope.selected = 'Emails';
        scope.results = data.emails;
        scope.links = data._links;
        $location.search();
      }, function(err) {
        console.log(err);
        clearTable();
      });
    };

    var downloadReport = function() {
      var params = {
        start: scope.query.start,
        end: scope.query.end,
        location_id: scope.location.id,
        type: mailerType[scope.selected]
      };
      Report.create(params).$promise.then(function(results) {
        showToast(gettextCatalog.getString('Your report will be emailed to you soon'));
      }, function(err) {
        showErrors(err);
      });
    };

    scope.updateAudit = function(selected) {
      switch(selected) {
        case 'Emails':
          findEmails();
          break;
        default:
          findSessions();
          break;
      }
    };

    scope.setStart = function() {
      scope.query.start = new Date(scope.startDate).getTime() / 1000;
      scope.updateAudit(scope.selected);
    };

    scope.setEnd = function() {
      scope.query.end = new Date(scope.endDate).getTime() / 1000;
      scope.updateAudit(scope.selected);
    };

    scope.filterSessionsByClient = function(mac) {
      scope.query.client_mac = mac;
      findSessions();
    };

    scope.clearClientFilter = function() {
      scope.query.client_mac = undefined;
      findSessions();
    };

    scope.onPaginate = function(page, limit) {
      scope.query.page = page;
      scope.query.limit = limit;
      scope.updateAudit(scope.selected);
    };

    scope.downloadAudit = function() {
      var confirm = $mdDialog.confirm()
      .title(gettextCatalog.getString('Download Report'))
      .textContent(gettextCatalog.getString('Please note this is a beta feature. Reports are sent via email.'))
      .ariaLabel(gettextCatalog.getString('Email Report'))
      .ok(gettextCatalog.getString('Download'))
      .cancel(gettextCatalog.getString('Cancel'));
      $mdDialog.show(confirm).then(function() {
        downloadReport();
      });
    };

    var getLocation = function() {
      var deferred = $q.defer();
      Location.get({id: $routeParams.id}).$promise.then(function(results) {
        scope.location = results;
        deferred.resolve(results.results);
      }, function() {
        deferred.reject();
      });
      return deferred.promise;
    };

    var init = function() {
      getLocation().then(function() {
        getParams();
        scope.updateAudit(scope.selected);
      });
    };

    init();

  };

  return {
    link: link,
    scope: {
      loading: '='
    },
    templateUrl: 'components/locations/audit/_index.html'
  };

}]);
