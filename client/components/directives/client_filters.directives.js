'use strict';

var app = angular.module('myApp.client_filters.directives', []);

app.directive('listClientFilters', ['ClientFilter', '$routeParams', '$mdDialog', 'showToast', 'showErrors', '$q', 'gettextCatalog', 'Network', 'Zone', '$location', function(ClientFilter, $routeParams, $mdDialog, showToast, showErrors, $q, gettextCatalog, Network, Zone, $location) {

  var link = function(scope,element,attrs) {

    scope.location  = { slug: $routeParams.id };
    scope.levels = [{key: 'Network', value: 'network'}, {key: 'Zone', value: 'zone'}];

    // User permissions //
    var createMenu = function() {
      scope.menu = [];
      scope.menu.push({
        name: gettextCatalog.getString('Edit'),
        icon: 'edit',
        type: 'edit'
      });
      scope.menu.push({
        name: gettextCatalog.getString('Delete'),
        icon: 'delete_forever',
        type: 'delete'
      });
    };

    scope.action = function(cf,type) {
      switch(type) {
        case 'delete':
          destroy(cf.id);
          break;
        case 'edit':
          scope.addFilter(cf);
          break;
      }
    };

    scope.query = {
      order:          '-created_at',
      filter:         $routeParams.q,
      limit:          $routeParams.per || 25,
      page:           $routeParams.page || 1,
      options:        [5,10,25,50,100],
      direction:      $routeParams.direction || 'desc'
    };

    scope.onPaginate = function (page, limit) {
      var hash = $location.search();
      hash.page = page;
      hash.per = limit;
      $location.search(hash);
    };

    var addToSet = function(cf) {
      if (!scope.client_filters) {
        scope.client_filters = [];
      }
      scope.client_filters.push(cf);
    };

    var create = function(data) {
      console.log(data)

      ClientFilter.create({
        location_id: scope.location.slug,
        client_filter: data
      }).$promise.then(function(results) {
        addToSet(results);
        // Simon Toni translate
        showToast('Client filter successfully created.');
        // Simon Toni translate
        scope.creating = undefined;
      }, function(error) {
        scope.creating = undefined;
        showErrors(error);
      });
    };

    var update = function(data) {
      ClientFilter.update({
        location_id: scope.location.slug,
        id: data.id,
        client_filter: data
      }).$promise.then(function(results) {
        // Simon Toni translate
        showToast('Client filter successfully updated.');
        // Simon Toni translate
        scope.creating = undefined;
      }, function(error) {
        scope.creating = undefined;
        showErrors(error);
      });
    };

    scope.createUpdate = function(data) {
      scope.creating = true;
      if (data.id) {
        update(data);
      } else {
        create(data);
      }
    };

    var removeFromList = function(id) {
      for (var i = 0, len = scope.client_filters.length; i < len; i++) {
        if (scope.client_filters[i].id === id) {
          scope.client_filters.splice(i, 1);
          break;
        }
      }
    };

    var destroy = function(id) {
      var confirm = $mdDialog.confirm()
      .title(gettextCatalog.getString('Delete Filter'))
      .textContent(gettextCatalog.getString('Are you sure you want to delete this filter?'))
      .ariaLabel(gettextCatalog.getString('Delete Filter'))
      .ok(gettextCatalog.getString('Delete'))
      .cancel(gettextCatalog.getString('Cancel'));
      $mdDialog.show(confirm).then(function() {
        scope.destroy(id);
      }, function() {
      });
    };

    scope.destroy = function(id) {
      ClientFilter.destroy({
        location_id: scope.location.slug,
        id: id
      }).$promise.then(function(results) {
        removeFromList(id);
        // SM translate
        showToast('Successfully deleted filter');
      }, function(err) {
        showErrors(err);
      });
    };

    scope.getZones = function() {
      var deferred = $q.defer();
      scope.promise = deferred.promise;
      Zone.get({location_id: scope.location.slug}).$promise.then(function(results) {
        if (results.length > 0) {
          deferred.resolve(results);
        } else {
          deferred.reject();
        }
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
        if (results.length > 0) {
          deferred.resolve(results);
        } else {
          deferred.reject();
        }
      }, function(err) {
        deferred.reject(err);
      });
      return deferred.promise;
    };

    scope.addFilter = function(cf) {
      $mdDialog.show({
        clickOutsideToClose: true,
        templateUrl: 'components/views/client_filters/_add.html',
        parent: angular.element(document.body),
        controller: DialogController,
        locals: {
          levels: scope.levels,
          networks: scope.networks,
          loadingLevels: scope.loadingLevels,
          cf: cf
        }
      });
    };

    function DialogController ($scope, levels, networks, loadingLevels, cf) {
      if (cf && cf.id) {
        $scope.cf = cf;
      }
      $scope.levels = levels;
      $scope.loadingLevels = loadingLevels;
      $scope.selectLevel = function(level) {
        $scope.errors = undefined;
        getLevels(level);
      };
      $scope.close = function() {
        $mdDialog.cancel();
      };
      $scope.save = function(zone) {
        $mdDialog.cancel();
        scope.createUpdate($scope.cf);
      };

      var getNetworks = function() {
        $scope.zones = undefined;
        if (!$scope.networks) {
          scope.getNetworks().then(function(networks) {
            $scope.networks = networks;
            $scope.loadingLevels = undefined;
          }, function() {
            $scope.errors = true;
            $scope.loadingLevels = undefined;
          });
        } else {
          $scope.loadingLevels = undefined;
        }
      };

      var getZones = function() {
        $scope.networks = undefined;
        if (!$scope.zones) {
          scope.getZones().then(function(zones) {
            $scope.zones = zones;
            $scope.loadingLevels = undefined;
          }, function() {
            $scope.errors = true;
            $scope.loadingLevels = undefined;
          });
        } else {
          $scope.loadingLevels = undefined;
        }
      };

      var getLevels = function(level) {
        $scope.loadingLevels = true;
        if (level === 'network') {
          getNetworks();
        } else {
          getZones();
        }
      };
    }
    DialogController.$inject = ['$scope', 'levels', 'networks', 'loadingLevels', 'cf'];

    var init = function() {
      var params = {
        location_id: scope.location.slug,
        page: scope.query.page,
        per: scope.query.limit
      };
      var deferred = $q.defer();
      scope.promise = deferred.promise;
      ClientFilter.get(params).$promise.then(function(results) {
        scope.client_filters  = results.client_filters;
        scope._links = results._links;
        scope.loading = undefined;
        createMenu();
        deferred.resolve();
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
