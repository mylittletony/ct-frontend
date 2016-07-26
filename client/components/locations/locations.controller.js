'use strict';

var app = angular.module('myApp.locations.controller', []);

app.controller('LocationsCtrlShort', ['$scope', '$routeParams', '$filter', 'Location', 'Data',
  function($scope, $routeParams, $filter, Location, Data) {

    $scope.location = {};

    $scope.getLocation = function(val) {
      return Location.shortquery({q: val}).$promise.then(function (res) {
        $scope.locations = res;
      });
    };

    $scope.selectLocation = function(item) {
      $scope.selected = {};
      $scope.selected.item = item;
      $scope.data.selected = item;
      $scope.data = Data;
    };

    $scope.getLocation();

  }

]);

app.controller('LocationsCtrl', ['$scope', '$routeParams', 'Location', '$location', 'Box', '$filter', '$pusher', '$rootScope', '$route', 'menu', '$mdSidenav', '$cookies', 'LocationCache', 'gettextCatalog',
  function($scope, $routeParams, Location, $location, Box, $filter, $pusher, $rootScope, $route, menu, $mdSidenav, $cookies, LocationCache, gettextCatalog) {

    $scope.loading = true;
    $scope.location = { slug: $routeParams.id };

    function isOpen(section) {
      return menu.isSectionSelected(section);
    }

    function toggleOpen(section) {
      menu.toggleSelectSection(section);
    }

    var isActive = function(path) {
      var split = $location.path().split('/');
      if (split.length >= 4) {
        return ($location.path().split('/')[3] === path);
      } else if (path === 'dashboard') {
        return true;
      }
    };

    var vm = this;

    if ($cookies.get('_ctm') === 'true') {
      menu.isOpenLeft = false;
      menu.isOpen = false;
    } else {
      menu.isOpen = true;
    }

    menu.hideBurger = false;

    menu.sections = [];
    //fixme translations: check if the menu names are used in the logic
    var createMenu = function() {
      // menu.header = $scope.location.location_name;

      menu.sections.push({
        name: gettextCatalog.getString('Devices'),
        link: '/#/locations/' + $scope.location.slug,
        type: 'link',
        icon: 'router',
        active: isActive('dashboard')
      });

      menu.sections.push({
        name: gettextCatalog.getString('Networks'),
        type: 'link',
        link: '/#/locations/' + $scope.location.slug + '/networks',
        icon: 'wifi',
        active: isActive('networks')
      });

      menu.sections.push({
        name: gettextCatalog.getString('Clients'),
        type: 'link',
        link: '/#/locations/' + $scope.location.slug + '/clients',
        icon: 'devices',
        active: isActive('clients')
      });

      menu.sections.push({
        name: gettextCatalog.getString('Zones'),
        type: 'link',
        link: '/#/locations/' + $scope.location.slug + '/zones',
        icon: 'layers',
        active: isActive('zones')
      });

      menu.sections.push({
        name: gettextCatalog.getString('Policies'),
        type: 'link',
        link: '/#/locations/' + $scope.location.slug + '/group_policies',
        icon: 'group_work',
        active: isActive('group_policies')
      });

      menu.sections.push({
        name: gettextCatalog.getString('Triggers'),
        type: 'link',
        link: '/#/locations/' + $scope.location.slug + '/triggers',
        icon: 'notifications_active',
        active: isActive('triggers')
      });

      menu.sections.push({
        type: 'divider',
      });

      menu.sections.push({
        name: gettextCatalog.getString('Guest Access'),
        type: 'subhead',
      });

      menu.sections.push({
        name: gettextCatalog.getString('Splash'),
        type: 'link',
        link: '/#/locations/' + $scope.location.slug + '/splash_pages',
        icon: 'web',
        active: isActive('splash_pages')
      });

      menu.sections.push({
        name: gettextCatalog.getString('vouchers'),
        type: 'link',
        link: '/#/locations/' + $scope.location.slug + '/vouchers',
        icon: 'receipt',
        active: isActive('vouchers')
      });

      menu.sections.push({
        name: gettextCatalog.getString('Codes'),
        type: 'link',
        link: '/#/locations/' + $scope.location.slug + '/splash_codes',
        icon: 'vpn_key',
        active: isActive('splash_codes')
      });

      menu.sections.push({
        type: 'divider',
      });

      menu.sections.push({
        name: gettextCatalog.getString('History'),
        type: 'link',
        link: '/#/locations/' + $scope.location.slug + '/versions',
        icon: 'history',
        active: isActive('versions')
      });

      menu.sections.push({
        name: gettextCatalog.getString('Users'),
        type: 'link',
        link: '/#/locations/' + $scope.location.slug + '/users',
        icon: 'people',
        active: isActive('users')
      });

      menu.sections.push({
        name: gettextCatalog.getString('Settings'),
        type: 'link',
        link: '/#/locations/' + $scope.location.slug + '/settings',
        icon: 'settings',
        active: isActive('settings')
      });

    };

    $scope.addDevice = function() {
      window.location.href = '/#/locations/' + $scope.location.slug + '/boxes/new';
    };

    var init = function() {

      var id = $routeParams.id;
      var slug;

      Location.get({id: id}, function(data) {
        if (id % 1 === 0) {
          $location.path('/locations/' + data.slug).replace();
        }
        menu.header = data.location_name;
        menu.sectionName = gettextCatalog.getString('Location');
        if (data.archived) {
          menu.archived = data.archived;
        } else {
          menu.archived = undefined;
        }
        $scope.location = data;
        console.log('Setting TZ to', $scope.location.timezone);
        window.moment.tz.setDefault($scope.location.timezone);

        var params = {id: data.id, location_name: data.location_name};
        var json = JSON.stringify(params);
        $cookies.put('_ctlid', json);

        // Used to check for location name change
        // Will refresh the page if a change is detected

        slug = $scope.location.slug;
        $scope.$broadcast('locationLoaded');
      });
    };

    $rootScope.$on('$locationChangeStart', function (event, next, current) {
      menu.archived = undefined;
    });

    init();
    createMenu();

}]);

app.controller('HomeCtrl', ['$scope', 'menu', '$mdSidenav', 'gettextCatalog',
  function($scope, menu, $mdSidenav, gettextCatalog) {

    $scope.loading = true;

    function isOpen(section) {
      return menu.isSectionSelected(section);
    }

    function toggleOpen(section) {
      menu.toggleSelectSection(section);
    }

    var vm = this;

    menu.isOpen = false;
    menu.hideBurger = false;
    menu.sections = [{}];
    menu.sectionName = gettextCatalog.getString('Home');
    //fixme translations: check if the names are used in the logic
    var createMenu = function() {

      menu.sections.push({
        name: gettextCatalog.getString('Locations'),
        link: '/#/locations/',
        type: 'link',
        icon: 'business',
      });

      menu.sections.push({
        name: gettextCatalog.getString('Reports'),
        link: '/#/reports/',
        type: 'link',
        icon: 'timeline',
      });

      menu.sections.push({
        name: gettextCatalog.getString('Audit'),
        link: '/#/audit/',
        type: 'link',
        icon: 'assignment',
      });

      menu.sections.push({
        name: gettextCatalog.getString('Events'),
        link: '/#/events/',
        type: 'link',
        icon: 'warning'
      });

    };

    createMenu();

}]);
