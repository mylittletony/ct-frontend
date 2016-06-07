'use strict';

var app = angular.module('myApp.reports.controller', []);

app.controller('ReportsCtrl', ['$scope', '$routeParams', 'Location', '$location', 'Box', '$filter', '$pusher', '$rootScope', '$route', 'menu', '$mdSidenav', '$q',
  function($scope, $routeParams, Location, $location, Box, $filter, $pusher, $rootScope, $route, menu, $mdSidenav, $q) {

    $scope.loading = true;

    // $scope.location = { id: $routeParams.location_id };

    var vm = this;

    menu.isOpen = false;
    menu.hideBurger = true;
    menu.sections = [{}];

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

    menu.sections = [];

    var createMenu = function() {

      menu.sections.push({
        name: 'Settings',
        type: 'link',
        link: '/#/locations/',
        icon: 'settings',
        active: isActive('settings')
      });
    };

    // $scope.loadLocations = function() {
    //   Location.favourites({per: 15}).$promise.then(function(results) {
    //     $scope.locations = results.locations;
    //   }, function() {
    //     $scope.loading = undefined;
    //   });
    // };

    // $scope.addDevice = function() {
    //   window.location.href = '/#/locations/' + $scope.location.slug + '/boxes/new';
    // };

    function querySearch (query) {
      var deferred = $q.defer();
      Location.query({q: query}).$promise.then(function(results) {
        deferred.resolve(results.locations);
      }, function() {
        deferred.reject();
      });
      return deferred.promise;
    }

    function searchTextChange(text) {
    }
    function selectedItemChange(item) {
    }

    $scope.querySearch   = querySearch;
    $scope.selectedItemChange = selectedItemChange;
    $scope.searchTextChange   = searchTextChange;

    // var init = function() {
    //   Location.favourites({per: 15}).$promise.then(function(results) {
    //     $scope.locations = results.locations;
    //   }, function() {
    //     $scope.loading = undefined;
    //   });
    //   // scope.loading = true;
    //   // var id, slug;
    //   // Location.get({id: $routeParams.id}, function(data) {
    //   //   if (id % 1 === 0) {
    //   //     $location.path('/locations/' + data.slug).replace().notify(false);
    //   //   }
    //   //   menu.header = data.location_name;
    //   //   $scope.location = data;
    //   //   slug = $scope.location.slug; // used to check for location name change
    //   //   $scope.$broadcast('locationLoaded');
    //   // });
    // };

    // init();
    createMenu();

}]);

