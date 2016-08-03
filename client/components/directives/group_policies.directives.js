'use strict';

var app = angular.module('myApp.group_policies.directives', []);

app.directive('listGroupPolicies', ['GroupPolicy', '$routeParams', '$mdDialog', 'showToast', 'showErrors', '$q', 'gettextCatalog', 'Network', 'Zone', '$location', function(GroupPolicy, $routeParams, $mdDialog, showToast, showErrors, $q, gettextCatalog, Network, Zone, $location) {

  var link = function(scope,element,attrs) {

    scope.location  = { slug: $routeParams.id };
    scope.layers = [
      {key: gettextCatalog.getString('WiFi'), value: 'layer2'},
      {key: gettextCatalog.getString('Firewall'), value: 'layer3'},
      {key: gettextCatalog.getString('Splash'), value: 'splash'}
    ];

    scope.policies = [
      {key: gettextCatalog.getString('Whitelist'), value: 'allow'},
      {key: gettextCatalog.getString('Blacklist'), value: 'block'}
      // {key: gettextCatalog.getString('Filter'), value: 'filter'}
    ];

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

    scope.action = function(gp,type) {
      switch(type) {
        case 'delete':
          destroy(gp.id);
          break;
        case 'edit':
          scope.addFilter(gp);
          break;
      }
    };

    scope.query = {
      order:      '-created_at',
      filter:     $routeParams.q,
      limit:      $routeParams.per || 25,
      page:       $routeParams.page || 1,
      options:    [5,10,25,50,100],
      direction:  $routeParams.direction || 'desc'
    };

    scope.onPaginate = function (page, limit) {
      var hash = $location.search();
      hash.page = page;
      hash.per = limit;
      $location.search(hash);
    };

    var addToSet = function(gp) {
      if (!scope.group_policies) {
        scope.group_policies = [];
      }
      scope.group_policies.push(gp);
    };

    var create = function(data) {
      GroupPolicy.create({
        location_id: scope.location.slug,
        group_policy: data
      }).$promise.then(function(results) {
        addToSet(results.group_policy);
        showToast(gettextCatalog.getString('Policy successfully created.'));
        scope.creating = undefined;
      }, function(error) {
        scope.creating = undefined;
        showErrors(error);
      });
    };

    var update = function(data) {
      GroupPolicy.update({
        location_id: scope.location.slug,
        id: data.id,
        group_policy: data
      }).$promise.then(function(results) {
        showToast(gettextCatalog.getString('Client filter successfully updated.'));
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
      for (var i = 0, len = scope.group_policies.length; i < len; i++) {
        if (scope.group_policies[i].id === id) {
          scope.group_policies.splice(i, 1);
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
      GroupPolicy.destroy({
        location_id: scope.location.slug,
        id: id
      }).$promise.then(function(results) {
        removeFromList(id);
        showToast(gettextCatalog.getString('Successfully deleted policy'));
      }, function(err) {
        showErrors(err);
      });
    };

    scope.addFilter = function(gp) {
      $mdDialog.show({
        clickOutsideToClose: true,
        templateUrl: 'components/views/group_policies/_add.html',
        parent: angular.element(document.body),
        controller: DialogController,
        locals: {
          layers: scope.layers,
          policies: scope.policies,
          gp: gp
        }
      });
    };

    function DialogController ($scope, layers, policies, gp) {
      if (gp && gp.id) {
        $scope.gp = gp;
      }
      $scope.layers = layers;
      $scope.policies = policies;
      $scope.close = function() {
        $mdDialog.cancel();
      };
      $scope.save = function(zone) {
        $mdDialog.cancel();
        scope.createUpdate($scope.gp);
      };
    }
    DialogController.$inject = ['$scope', 'layers', 'policies', 'gp'];

    var init = function() {
      var params = {
        location_id: scope.location.slug,
        page: scope.query.page,
        per: scope.query.limit
      };
      var deferred = $q.defer();
      scope.promise = deferred.promise;
      GroupPolicy.get(params).$promise.then(function(results) {
        scope.group_policies = results.group_policies;
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
    templateUrl: 'components/views/group_policies/_index.html'
  };

}]);

app.directive('groupPolicy', ['GroupPolicy', '$routeParams', '$mdDialog', 'showToast', 'showErrors', '$q', 'gettextCatalog', 'Network', 'Zone', '$location', function(GroupPolicy, $routeParams, $mdDialog, showToast, showErrors, $q, gettextCatalog, Network, Zone, $location) {

  var link = function(scope,element,attrs) {

    scope.selected = [];
    scope.currentNetworks = [];
    scope.location = { slug: $routeParams.id };

    scope.options = {
      rowSelect:  true,
    };

    scope.query = {
      order:      'ssid',
      limit:      $routeParams.per || 25,
      page:       $routeParams.page || 1,
      options:    [5,10,25,50,100],
    };

    var i, j;
    scope.update = function() {
      scope.networkAttributes = [];
      for (i = 0; i < scope.currentNetworks.length; i++) {
        scope.networkAttributes.push({id: scope.currentNetworks[i], _destroy: true});
        for (j = 0; j < scope.selected.length; j++) {
          if (scope.selected[j].id === scope.currentNetworks[i]) {
            scope.networkAttributes[i]._destroy = undefined;
          }
        }
      }

      for (j = 0; j < scope.selected.length; j++) {
        scope.networkAttributes.push({id: scope.selected[j].id});
      }

      scope.group_policy.networks_attributes = scope.networkAttributes;
      var params = {
        id: $routeParams.group_policy_id,
        location_id: scope.location.slug,
        group_policy: scope.group_policy
      };

      GroupPolicy.update(params).$promise.then(function(results) {
        scope.group_policy = results.group_policy;
        scope.policy_networks = results.networks;
        showToast(gettextCatalog.getString('Successfully updated policy'));
      }, function(err) {
        showErrors(err);
      });
    };

    var updateSelected = function() {
      angular.forEach(scope.policy_networks, function (value, id) {
        if (value.network_id !== null) {
          scope.currentNetworks.push(value.network_id);
          angular.forEach(scope.networks, function(val, id) {
            if (val.id === value.network_id) {
              scope.selected.push(scope.networks[id]);
            }
          });
        }
      });
    };

    var init = function() {
      var deferred = $q.defer();
      var params = {
        location_id: scope.location.slug,
        id: $routeParams.group_policy_id
      };
      GroupPolicy.query(params).$promise.then(function(results) {
        scope.group_policy = results.group_policy;
        scope.policy_networks = results.networks;
        deferred.resolve();
      }, function(error) {
        deferred.reject();
      });
      return deferred.promise;
    };

    var getNetworks = function() {
      var deferred = $q.defer();
      Network.get({location_id: scope.location.slug}).$promise.then(function(results) {
        scope.networks = results;
        scope.loading = undefined;
        deferred.resolve();
      });
      return deferred.promise;
    };

    init().then(getNetworks).then(function() {
      updateSelected();
    });
  };

  return {
    link: link,
    scope: {
      loading: '='
    },
    templateUrl: 'components/views/group_policies/_show.html'
  };

}]);
