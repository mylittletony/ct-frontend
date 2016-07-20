'use strict';

var app = angular.module('myApp.client_filters.directives', []);

app.directive('listClientFilters', ['ClientFilter', '$routeParams', '$mdDialog', 'showToast', 'showErrors', '$q', 'gettextCatalog', 'Network', 'Zone', function(ClientFilter, $routeParams, $mdDialog, showToast, showErrors, $q, gettextCatalog, Network, Zone) {

  var link = function(scope,element,attrs) {

    scope.location  = { slug: $routeParams.id };
    scope.levels = [{key: 'All', value: 'all'}, {key: 'Network', value: 'network'}, {key: 'Zone', value: 'zone'}];

    // User permissions //
    // var createMenu = function() {
    //   scope.menu = [];
    //   scope.menu.push({
    //     name: gettextCatalog.getString('Edit Settings'),
    //     icon: 'settings',
    //     type: 'settings'
    //   });
    //   scope.menu.push({
    //     name: gettextCatalog.getString('Delete Zone'),
    //     icon: 'delete_forever',
    //     type: 'delete'
    //   });
    // };

    // scope.action = function(zone,type) {
    //   switch(type) {
    //     case 'delete':
    //       destroy(zone.id);
    //       break;
    //     case 'settings':
    //       edit(zone.id);
    //       break;
    //   }
    // };

    scope.create = function(data) {
      scope.creating = true;
      var deferred = $q.defer();
      scope.promise = deferred.promise;
      ClientFilter.create({location_id: scope.location.slug, client_filter: data}).$promise.then(function(results) {
        showToast('Client filter successfully created.');
        scope.creating = undefined;
        deferred.resolve();
      }, function(error) {
        scope.creating = undefined;
        showErrors(error);
        deferred.reject();
      });
      return deferred.promise;
    };

    scope.getZones = function() {
      var deferred = $q.defer();
      scope.promise = deferred.promise;
      Zone.get({location_id: scope.location.slug}).$promise.then(function(results) {
        scope.zones = results;
        scope.loadingLevels = undefined;
        deferred.resolve();
      }, function(error) {
        scope.loadingLevels = undefined;
        deferred.reject();
      });
      return deferred.promise;
    };

    scope.getNetworks = function() {
      var deferred = $q.defer();
      scope.promise = deferred.promise;
      Network.get({location_id: scope.location.slug}).$promise.then(function(results) {
        deferred.resolve(results);
      }, function(err) {
        deferred.reject(err);
      });
      return deferred.promise;
    };

    scope.addFilter = function(id) {
      $mdDialog.show({
        clickOutsideToClose: true,
        templateUrl: 'components/views/client_filters/_add.html',
        parent: angular.element(document.body),
        controller: DialogController,
        locals: {
          levels: scope.levels,
          networks: scope.networks,
          loadingLevels: scope.loadingLevels
        }
      });
    };

    function DialogController ($scope, levels, networks, loadingLevels) {
      $scope.cf = { level: 'all' };
      $scope.levels = levels;
      $scope.loadingLevels = loadingLevels;
      $scope.selectLevel = function(level) {
        $scope.loadingLevels = true;
        if (level === 'network') {
          scope.getNetworks().then(function(networks) {
            $scope.networks = networks;
            $scope.loadingLevels = undefined;
          }, function() {
            console.log('You have no networks');
            $scope.loadingLevels = undefined;
          });
        } else {
          scope.getZones();
        }
      };
      $scope.close = function() {
        $mdDialog.cancel();
      };
      $scope.save = function(zone) {
        // $location.search({});
        $mdDialog.cancel();
        // update(zone,$routeParams.box_id);
      };
    }
    DialogController.$inject = ['$scope', 'levels', 'networks', 'loadingLevels'];

    var init = function() {
      var deferred = $q.defer();
      scope.promise = deferred.promise;
      ClientFilter.get({location_id: scope.location.slug}).$promise.then(function(results) {
        scope.client_filters  = results.client_filters;
        scope._info = results._info;
        scope.loading = undefined;
      }, function(error) {
      });
    };

    init();
  };

  return {
    link: link,
    scope: {
      loading: '='
    },
    // templateUrl: 'components/boxes/show/_index.html'
    templateUrl: 'components/views/client_filters/_index.html'
  };

}]);
