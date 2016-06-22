'use strict';

var app = angular.module('myApp.zones.directives', []);

app.directive('listZones', ['Zone', 'ZoneListing', 'Location', '$routeParams', '$mdDialog', 'showToast', 'showErrors', '$mdEditDialog', '$q', function(Zone, ZoneListing, Location, $routeParams, $mdDialog, showToast, showErrors, $mdEditDialog, $q) {

  var link = function(scope,element,attrs) {

    scope.location  = { slug: $routeParams.id };

    // User permissions //
    var createMenu = function() {
      scope.menu = [];
      scope.menu.push({
        name: 'Edit Settings',
        icon: 'settings',
        type: 'settings'
      });
      scope.menu.push({
        name: 'Delete Zone',
        icon: 'delete_forever',
        type: 'delete'
      });
    };

    scope.action = function(zone,type) {
      switch(type) {
        case 'delete':
          destroy(zone.id);
          break;
        case 'settings':
          edit(zone.id);
          break;
      }
    };

    var destroy = function(id) {
      var confirm = $mdDialog.confirm()
      .title('Delete Zone')
      .textContent('Are you sure you want to delete this zone?')
      .ariaLabel('Delete Zone')
      .ok('Delete')
      .cancel('Cancel');
      $mdDialog.show(confirm).then(function() {
        destroyZone(id);
      }, function() {
      });
    };

    var destroyZone = function(id) {
      Zone.destroy({location_id: scope.location.slug, id: id}).$promise.then(function(res) {
        removeFromList(id);
      }, function(err) {
        showErrors(err);
      });
    };

    var removeFromList = function(id) {
      for (var i = 0, len = scope.zones.length; i < len; i++) {
        if (scope.zones[i].id === id) {
          scope.zones.splice(i, 1);
          showToast('Zone successfully deleted');
          break;
        }
      }
    };

    scope.editName = function (event, zone) {

      var editDialog = {
        modelValue: zone.zone_name,
        placeholder: 'Edit name',
        save: function (input) {
          zone.zone_name = input.$modelValue;
          update(zone);
        },
        targetEvent: event,
        title: 'Edit zone name',
        validators: {
          'md-maxlength': 30,
          'md-minlength': 5
        }
      };

      var promise;
      promise = $mdEditDialog.small(editDialog);
      promise.then(function (ctrl) {
        var input = ctrl.getInput();
        input.$viewChangeListeners.push(function () {
          input.$setValidity('test', input.$modelValue !== 'test');
        });
      });

    };

    var update = function(zone,box_id) {

      var params = {
        zone_name: zone.zone_name,
        boxes: box_id,
      };
      Zone.update({location_id: scope.location.slug, id: zone.id, zone: params }).$promise.then(function(res) {
        if (box_id) {
          incrementBoxCount(zone);
        } else {
          showToast('Zone successfully updated');
        }
      }, function(err) {
        showErrors(err);
      });

    };

    var incrementBoxCount = function(zone) {
      for (var i = 0, len = scope.zones.length; i < len; i++) {
        if (scope.zones[i].id === zone.id) {
          if (!scope.zones[i].boxes || scope.zones[i].boxes.length === 0) {
            scope.zones[i].boxes = [];
          }
          scope.zones[i].boxes.push({ap_mac: $routeParams.ap_mac});
          showToast('Box successfully added to zone.');
        }
      }
    };

    var addBox = function(id) {
      $mdDialog.show({
        clickOutsideToClose: true,
        templateUrl: 'components/zones/_add.html',
        parent: angular.element(document.body),
        controller: DialogController,
        locals: {
          zones: scope.zones,
          ap_mac: $routeParams.ap_mac
        }
      });
    };

    function DialogController ($scope,$location,zones,ap_mac) {
      $scope.ap_mac = ap_mac;
      $scope.zones = zones;
      $scope.close = function() {
        $mdDialog.cancel();
      };
      $scope.save = function(zone) {
        $location.search({});
        $mdDialog.cancel();
        update(zone,$routeParams.box_id);
      };
    }
    DialogController.$inject = ['$scope','$location','zones','ap_mac'];

    var edit = function(id) {
      window.location.href = '/#/locations/' + scope.location.slug + '/zones/' + id;
    };

    scope.open = function(network) {
      $mdDialog.show({
        clickOutsideToClose: true,
        templateUrl: 'components/zones/_form.html',
        parent: angular.element(document.body),
        controller: NewDialogController
      });
    };

    function NewDialogController ($scope) {
      $scope.close = function() {
        $mdDialog.cancel();
      };

      $scope.save = function(zone) {
        $mdDialog.cancel();
        create(zone);
      };
    }
    NewDialogController.$inject = ['$scope'];

    var create = function(zone) {
      Zone.create({location_id: scope.location.slug, zone: zone}).$promise.then(function(results) {
        if (scope.zones && scope.zones.length === 0) {
          scope.zones = [];
        }
        scope.zones.push(results);
        if (scope.zones.length > 0) {
          showToast('Zone successfully created.');
        }
      }, function(err) {
        showErrors(err);
      });
    };

    var init = function() {
      var deferred = $q.defer();
      scope.promise = deferred.promise;
      Zone.get({location_id: scope.location.slug}).$promise.then(function(results) {
        createMenu();
        scope.zones         = results.zones;
        scope._info         = results._info;
        scope.loading       = undefined;
        if ($routeParams.box_id && scope.zones.length) {
          addBox();
        }
        deferred.resolve();
      }, function(error) {
        deferred.resolve();
      });
    };

    init();

    if ($routeParams.add) {
      scope.open();
    }
  };

  return {
    link: link,
    scope: {
      loading: '='
    },
    templateUrl: 'components/zones/_index.html'
  };

}]);

app.directive('locationZoneShow', ['$compile', 'Zone', 'LocationBox', 'Network', '$routeParams', '$location', '$timeout', 'showToast', 'showErrors', '$mdDialog', function($compile, Zone, LocationBox, Network, $routeParams, $location, $timeout, showToast, showErrors, $mdDialog) {

  var link = function(scope, element, attrs) {

    scope.selected = [];
    scope.location = { slug: $routeParams.id };
    scope.network = { id: $routeParams.network_id };
    scope.zone = { id: $routeParams.zone_id };

    scope.options = {
      rowSelect:  true,
    };

    scope.query = {
      order:      'ssid',
      limit:      $routeParams.per || 25,
      page:       $routeParams.page || 1,
      options:    [5,10,25,50,100],
      // direction:  $routeParams.direction || 'desc'
    };

    var getZone = function() {
      return Zone.query({location_id: scope.location.slug, id: scope.zone.id}).$promise.then(function(res) {
        scope.zone          = res.zone;
        scope.zone_boxes    = res.boxes;
        scope.zone_networks = res.networks;
      });
    },
    getBoxes = function() {
      return LocationBox.get({location_id: scope.location.slug, short: true, per: 100}).$promise.then(function(results) {
        scope.boxes = results.boxes;
      });
    },
    getNetworks = function() {
      return Network.get({location_id: scope.location.slug}).$promise.then(function(res) {
        scope.networks = res;
        scope.loading = undefined;
      });
    },
    findActive = function() {
      updateCheckboxes();
      // createMenu();
    };

    scope.logItem = function() {
      alert(123)
    };

    function updateCheckboxes() {

      angular.forEach(scope.zone_networks, function (value, id) {
        if (value.network_id !== null) {
          angular.forEach(scope.networks, function(val, id) {
            if (val.id === value.network_id) {
              scope.selected.push(scope.networks[id]);
            }
          });
        }
      });

    }

    // scope.updateBox = function(box) {
    //   var params = {box: box};
    //   if (box.in_the_zone === true) {
    //     // update(params);
    //   } else {
    //     // destroy(params);
    //   }
    // };

    scope.updateNetwork = function(network) {
      var params = {network: network};
      if (network.in_the_zone === true) {
        // update(params);
      } else {
        // destroy(params);
      }
    };

    scope.update = function() {
      var confirm = $mdDialog.confirm()
        .title('Confirm Update')
        .textContent('This will resync all associated devices.')
        .ariaLabel('Update Zone')
        .ok('Continue')
        .cancel('Cancel');
      $mdDialog.show(confirm).then(function() {
        update();
      }, function() {
      });
    };

    var update = function(params) {

      var networks = [];

      for (var i = 0, len = scope.selected.length; i < len; i++) {
        networks.push(scope.selected[i].id);
      }

      networks = networks.join(',');

      var opts = {
        zone_name:          scope.zone.zone_name,
        zone_description:   scope.zone.zone_description,
        networks:           networks
      };

      Zone.update({
        location_id: scope.location.slug,
        id: scope.zone.id, zone: opts
      }).$promise.then(function(res) {
        showToast('Successfully updated zone.');
      }, function(err) {
        showErrors(err);
      });
    };

    // User permissions
    scope.allowed = true;

    scope.destroy = function() {
      confirmDestroy();
    };

    var confirmDestroy = function(id) {
      var confirm = $mdDialog.confirm()
      .title('Delete Zone')
      .textContent('Are you sure you want to delete this zone?')
      .ariaLabel('Delete Zone')
      .ok('Delete')
      .cancel('Cancel');
      $mdDialog.show(confirm).then(function() {
        deleteZone();
      }, function() {
      });
    };

    var deleteZone = function() {
      return Zone.destroy({location_id: scope.location.slug, id: scope.zone.id}).$promise.then(function(res) {
        $location.path('/locations/' + scope.location.slug + '/zones');
        showToast('Successfully deleted zone');
      }, function(err) {
        showErrors(err);
      });
    };

    var edit = function(network) {
      $mdDialog.show({
        clickOutsideToClose: true,
        templateUrl: 'components/zones/_form.html',
        parent: angular.element(document.body),
        controller: DialogController,
        locals: {
          zone: scope.zone
        }
      });
    };

    var DialogController = function($scope,zone) {
      $scope.zone = zone;
      $scope.close = function() {
        $mdDialog.cancel();
      };

      $scope.save = function(zone) {
        $mdDialog.cancel();
        update();
      };
    };

    scope.view = function(id) {
      window.location.href = '/#/locations/' + scope.location.slug + '/networks/' + id;
    };

    scope.back = function() {
      window.location.href = '/#/locations/' + scope.location.slug + '/zones';
    };

    getZone().then(getBoxes).then(getNetworks).then(findActive);
  };

  return {
    link: link,
    restrict: 'A',
    transclude: true,
    scope: {
      loading: '=',
      slug: '@'
    },
    templateUrl: 'components/zones/_show.html'
  };

}]);

app.directive('networkZones', ['Zone', 'ZoneListing', 'Location', '$routeParams', function(Zone, ZoneListing, Location, $routeParams) {
  var link = function(scope, element, attrs) {

    scope.loading     = true;
    var network       = { id: $routeParams.network_id };
    scope.location    = { slug: $routeParams.id };
    scope.in_the_zone = {};

    var updateActiveZones = function(zones) {
      scope.zones = [];
      angular.forEach(zones, function(z,i) {
        if (z.networks && z.networks.length) {
          angular.forEach(z.networks, function(id) {
            if (id === network.id) {
              scope.zones.push(z);
              // scope.zones[i].active = true;
              // scope.in_the_zone[scope.zones[i].id] = 1;
            }
          });
        }
      });
      scope.loading       = undefined;
    };

    var init = function() {
      Zone.get({location_id: scope.location.slug, network_id: network.id}).$promise.then(function(results) {
        var zones = results.zones;
        if (zones.length) {
          updateActiveZones(zones);
        }
      });
    };

    init();

  };

  return {
    link: link,
    scope: {},
    template:
        '<div ng-if=\'loading\'>'+
        '<md-progress-linear md-mode="query"></md-progress-linear>'+
        '</div>'+
        '<div ng-if=\'!loading && zones.length === 0\'>'+
        '<p>Network not associated with a zone. </p>'+
        '</div>'+
        '<div ng-if=\'!loading && zones.length\'>'+
        '<span>This network is associated with the following zone<span ng-if="zones.length != 1">s</span>.</span>'+
        '<md-list-item class="md-3-line" ng-repeat=\'zone in zones\'>'+
        '<div class="md-list-item-text">'+
        '<h3><a href="/#/locations/{{location.slug}}/zones/{{ zone.id }}">{{ zone.zone_name | titleCase }} Zone</a></h3>'+
        '<p>{{ zone.boxes.length }} box<span ng-if="zones.boxes.length != 1">es</span>. {{ zone.networks.length }} network<span ng-if="zones.networks.length != 1">s</span>.</p>'+
        '</div>'+
        '</md-list-item>'+
        '</div>'
  };

}]);
