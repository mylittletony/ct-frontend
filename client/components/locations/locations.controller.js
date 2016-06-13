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

app.controller('LocationsCtrl', ['$scope', '$routeParams', 'Location', '$location', 'Box', '$filter', '$pusher', '$rootScope', '$route', 'menu', '$mdSidenav', '$cookies', 'LocationCache',
  function($scope, $routeParams, Location, $location, Box, $filter, $pusher, $rootScope, $route, menu, $mdSidenav, $cookies, LocationCache) {

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

    var createMenu = function() {
      // menu.header = $scope.location.location_name;

      menu.sections.push({
        name: 'Devices',
        link: '/#/locations/' + $scope.location.slug,
        type: 'link',
        icon: 'router',
        active: isActive('dashboard')
      });

      menu.sections.push({
        name: 'Networks',
        type: 'link',
        link: '/#/locations/' + $scope.location.slug + '/networks',
        icon: 'wifi',
        active: isActive('networks')
      });

      menu.sections.push({
        name: 'Clients',
        type: 'link',
        link: '/#/locations/' + $scope.location.slug + '/clients',
        icon: 'devices',
        active: isActive('clients')
      });

      menu.sections.push({
        name: 'Zones',
        type: 'link',
        link: '/#/locations/' + $scope.location.slug + '/zones',
        icon: 'layers',
        active: isActive('zones')
      });

      menu.sections.push({
        name: 'Triggers',
        type: 'link',
        link: '/#/locations/' + $scope.location.slug + '/triggers',
        icon: 'notifications_active',
        active: isActive('triggers')
      });

      menu.sections.push({
        type: 'divider',
      });

      menu.sections.push({
        name: 'Guest Access',
        type: 'subhead',
      });

      menu.sections.push({
        name: 'Splash',
        type: 'link',
        link: '/#/locations/' + $scope.location.slug + '/splash_pages',
        icon: 'web',
        active: isActive('splash_pages')
      });

      menu.sections.push({
        name: 'vouchers',
        type: 'link',
        link: '/#/locations/' + $scope.location.slug + '/vouchers',
        icon: 'receipt',
        active: isActive('vouchers')
      });

      menu.sections.push({
        name: 'Codes',
        type: 'link',
        link: '/#/locations/' + $scope.location.slug + '/splash_codes',
        icon: 'vpn_key',
        active: isActive('splash_codes')
      });

      menu.sections.push({
        type: 'divider',
      });

      menu.sections.push({
        name: 'History',
        type: 'link',
        link: '/#/locations/' + $scope.location.slug + '/versions',
        icon: 'history',
        active: isActive('versions')
      });

      menu.sections.push({
        name: 'Users',
        type: 'link',
        link: '/#/locations/' + $scope.location.slug + '/users',
        icon: 'people',
        active: isActive('users')
      });

      menu.sections.push({
        name: 'Settings',
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

      var id, slug;
      Location.get({id: $routeParams.id}, function(data) {
        if (id % 1 === 0) {
          $location.path('/locations/' + data.slug).replace().notify(false);
        }
        // menu.sectionName = data.location_name;
        menu.header = data.location_name;
        menu.sectionName = 'Location';
        if (data.archived) {
          menu.archived = data.archived;
          // menu.header = 'Location Archived';
        }
        $scope.location = data;
        // Used to check for location name change
        // Will refresh the page if a change is detected
        slug = $scope.location.slug;
        $scope.$broadcast('locationLoaded');
      });
    };

    init();
    createMenu();

}]);

app.controller('HomeCtrl', ['$scope', 'menu', '$mdSidenav',
  function($scope, menu, $mdSidenav) {

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
    menu.sectionName = 'Home';

    var createMenu = function() {

      menu.sections.push({
        name: 'Locations',
        link: '/#/locations/',
        type: 'link',
        icon: 'business',
      });

      menu.sections.push({
        name: 'Reports',
        link: '/#/reports/',
        type: 'link',
        icon: 'timeline',
      });

      menu.sections.push({
        name: 'Audit',
        link: '/#/audit/',
        type: 'link',
        icon: 'assignment',
      });

      menu.sections.push({
        name: 'Events',
        link: '/#/events/',
        type: 'link',
        icon: 'warning'
      });

    };

    createMenu();

}]);
