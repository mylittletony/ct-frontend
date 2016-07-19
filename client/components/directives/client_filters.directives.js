'use strict';

var app = angular.module('myApp.client_filters.directives', []);

app.directive('listClientFilters', ['ClientFilter', '$routeParams', '$mdDialog', 'showToast', 'showErrors', '$q', 'gettextCatalog', function(ClientFilter, $routeParams, $mdDialog, showToast, showErrors, $q, gettextCatalog) {

  var link = function(scope,element,attrs) {
    
    scope.location  = { slug: $routeParams.id };

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

    // var destroy = function(id) {
    //   var confirm = $mdDialog.confirm()
    //   .title(gettextCatalog.getString('Delete Zone'))
    //   .textContent(gettextCatalog.getString('Are you sure you want to delete this zone?'))
    //   .ariaLabel(gettextCatalog.getString('Delete Zone'))
    //   .ok(gettextCatalog.getString('Delete'))
    //   .cancel(gettextCatalog.getString('Cancel'));
    //   $mdDialog.show(confirm).then(function() {
    //     destroyZone(id);
    //   }, function() {
    //   });
    // };

    // var destroyZone = function(id) {
    //   Zone.destroy({location_id: scope.location.slug, id: id}).$promise.then(function(res) {
    //     removeFromList(id);
    //   }, function(err) {
    //     showErrors(err);
    //   });
    // };

    // var removeFromList = function(id) {
    //   for (var i = 0, len = scope.zones.length; i < len; i++) {
    //     if (scope.zones[i].id === id) {
    //       scope.zones.splice(i, 1);
    //       showToast(gettextCatalog.getString('Zone successfully deleted'));
    //       break;
    //     }
    //   }
    // };

    // var update = function(zone,box_id) {

    //   var params = {
    //     zone_name: zone.zone_name,
    //     boxes: box_id,
    //   };
    //   Zone.update({location_id: scope.location.slug, id: zone.id, zone: params }).$promise.then(function(res) {
    //     if (box_id) {
    //       incrementBoxCount(zone);
    //     } else {
    //       showToast(gettextCatalog.getString('Zone successfully updated'));
    //     }
    //   }, function(err) {
    //     showErrors(err);
    //   });

    // };

    // var incrementBoxCount = function(zone) {
    //   for (var i = 0, len = scope.zones.length; i < len; i++) {
    //     if (scope.zones[i].id === zone.id) {
    //       if (!scope.zones[i].boxes || scope.zones[i].boxes.length === 0) {
    //         scope.zones[i].boxes = [];
    //       }
    //       scope.zones[i].boxes.push({ap_mac: $routeParams.ap_mac});
    //       showToast(gettextCatalog.getString('Box successfully added to zone.'));
    //     }
    //   }
    // };

    scope.addFilter = function(id) {
      $mdDialog.show({
        clickOutsideToClose: true,
        templateUrl: 'components/views/client_filters/_add.html',
        parent: angular.element(document.body),
        controller: DialogController,
        locals: {
        }
      });
    };

    function DialogController ($scope) {
      $scope.close = function() {
        $mdDialog.cancel();
      };
      $scope.save = function(zone) {
        // $location.search({});
        // $mdDialog.cancel();
        // update(zone,$routeParams.box_id);
      };
    }
    DialogController.$inject = ['$scope'];

    // var edit = function(id) {
    //   window.location.href = '/#/locations/' + scope.location.slug + '/zones/' + id;
    // };

    // scope.open = function(network) {
    //   $mdDialog.show({
    //     clickOutsideToClose: true,
    //     templateUrl: 'components/zones/_form.html',
    //     parent: angular.element(document.body),
    //     controller: NewDialogController
    //   });
    // };

    // function NewDialogController ($scope) {
    //   $scope.close = function() {
    //     $mdDialog.cancel();
    //   };

    //   $scope.save = function(zone) {
    //     $mdDialog.cancel();
    //     createUpdate(zone);
    //   };
    // }
    // NewDialogController.$inject = ['$scope'];

    // // This also updates the zone ok //
    // var createUpdate = function(zone) {
    //   Zone.create({location_id: scope.location.slug, zone: zone}).$promise.then(function(results) {
    //     if (scope.zones && scope.zones.length === 0) {
    //       scope.zones = [];
    //     }
    //     scope.zones.push(results);
    //     if (scope.zones.length > 0) {
    //       showToast(gettextCatalog.getString('Zone successfully created.'));
    //     }
    //   }, function(err) {
    //     showErrors(err);
    //   });
    // };

    var init = function() {
      var deferred = $q.defer();
      scope.promise = deferred.promise;
      ClientFilter.get({location_id: scope.location.slug}).$promise.then(function(results) {
        scope.client_filters  = results.client_filters;
        scope._info           = results._info;
        scope.loading         = undefined;
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
