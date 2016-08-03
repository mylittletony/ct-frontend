'use strict';

describe('group_policies', function () {

  var $scope, element, $routeParams, groupPolicyFactory, q,
  deferred, $httpBackend, networkFactory, zoneFactory;

  beforeEach(module('templates'));

  beforeEach(module('myApp', function($provide) {
    groupPolicyFactory = {
      get: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      query: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      create: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      update: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      destroy: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
    };
    networkFactory = {
      get: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
    };
    zoneFactory = {
      get: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
    };
    $provide.value("Zone", zoneFactory);
    $provide.value("Network", networkFactory);
    $provide.value("GroupPolicy", groupPolicyFactory);
  }));

  beforeEach(inject(function($injector) {
    $httpBackend = $injector.get('$httpBackend');
    $httpBackend.whenGET('/translations/en_GB.json').respond("");
  }));

  describe('lists the group policies for a location', function() {
    beforeEach(inject(function($compile, $rootScope, $q, _$routeParams_, $injector) {
      $scope = $rootScope;
      q = $q;
      $routeParams = _$routeParams_;
      $routeParams.id = 'xxx';
      $routeParams.q = 'my-filter';
      $routeParams.page = '10';
      $routeParams.per = '100';
      $scope.loading = true;
      var elem = angular.element('<list-group-policies loading="loading"></list-group-policies>');
      element = $compile(elem)($rootScope);
      element.scope().$digest();
    }));

    it("should set the default scopes vals", function() {
      spyOn(groupPolicyFactory, 'get').and.callThrough();
      expect(element.isolateScope().location.slug).toEqual('xxx');

      var results = { group_policies: [{ id: 123 }], _links: {} };
      deferred.resolve(results);
      $scope.$apply();

      var layers = [{key: 'WiFi', value: 'layer2'}, {key: 'Firewall', value: 'layer3'}, {key: 'Splash', value: 'splash' }];
      var policies = [{key: 'Whitelist', value: 'allow'}, {key: 'Blacklist', value: 'block'}];
      expect(element.isolateScope().policies).toEqual(policies);
      expect(element.isolateScope().layers).toEqual(layers);
      expect(element.isolateScope().menu.length).toEqual(2);
      expect(element.isolateScope().menu[0].name).toEqual('Edit');
      expect(element.isolateScope().menu[0].type).toEqual('edit');
      expect(element.isolateScope().menu[1].name).toEqual('Delete');
      expect(element.isolateScope().menu[1].type).toEqual('delete');

      expect(element.isolateScope().query.page).toEqual('10');
      expect(element.isolateScope().query.limit).toEqual('100');
      expect(element.isolateScope().query.filter).toEqual('my-filter');
    });

    it("should display the filters for the index table", function() {
      spyOn(groupPolicyFactory, 'get').and.callThrough()
      expect(element.isolateScope().location.slug).toEqual('xxx')

      var results = { group_policies: [{ id: 123 }], _links: {} };
      deferred.resolve(results);
      $scope.$apply()

      expect(element.isolateScope().group_policies[0].id).toEqual(123);
      expect(element.isolateScope().loading).toEqual(undefined);
    });

    it("should create the new filter and add to set", function() {
      spyOn(groupPolicyFactory, 'create').and.callThrough()

      element.isolateScope().group_policies = [];
      var cf = { description: 'foo' };
      element.isolateScope().createUpdate(cf);
      expect(element.isolateScope().creating).toEqual(true);

      var results = [{ description: 'foo' }];
      deferred.resolve(results);
      $scope.$apply()

      expect(element.isolateScope().group_policies.length).toEqual(1);
    });

    it("should update the filter since it has an id", function() {
      spyOn(groupPolicyFactory, 'update').and.callThrough()

      var cf = { description: 'foo', id: 123 };
      element.isolateScope().group_policies = [cf];
      element.isolateScope().createUpdate(cf);

      var results = [{ description: 'foo' }];
      deferred.resolve(results);
      $scope.$apply()

      expect(element.isolateScope().group_policies.length).toEqual(1);
    });

    it("should destroy the filter and remove from set", function() {
      spyOn(groupPolicyFactory, 'destroy').and.callThrough()

      var cf = { id: 123 };
      element.isolateScope().group_policies = [cf];
      expect(element.isolateScope().group_policies.length).toEqual(1);

      element.isolateScope().destroy(cf.id);

      var results = [{ description: 'foo' }];
      deferred.resolve(results);
      $scope.$apply()

      expect(element.isolateScope().group_policies.length).toEqual(0);
    });

  });

  describe('displays the group filter for a location', function() {
    beforeEach(inject(function($compile, $rootScope, $q, _$routeParams_, $injector) {
      $scope = $rootScope;
      q = $q;
      $routeParams = _$routeParams_;
      $routeParams.id = 'xxx';
      $routeParams.q = 'my-filter';
      $routeParams.page = '10';
      $routeParams.per = '100';
      $scope.loading = true;
      var elem = angular.element('<group-policy loading="loading"></group-policy>');
      element = $compile(elem)($rootScope);
      element.scope().$digest();
    }));

    it("should set the default scopes vals", function() {
      spyOn(groupPolicyFactory, 'get').and.callThrough();
      expect(element.isolateScope().location.slug).toEqual('xxx');

      var results = { group_policy: { id: 123 }, networks: [{ network_id: 456 }] };
      deferred.resolve(results);
      $scope.$apply();

      expect(element.isolateScope().selected.length).toEqual(0);
      expect(element.isolateScope().query.order).toEqual('ssid');
      expect(element.isolateScope().options.rowSelect).toEqual(true);
      
      var network = { id: 456 };
      deferred.resolve([network]);
      $scope.$apply();

      expect(element.isolateScope().currentNetworks).toEqual([456]);
    });

    it("should retrieve the group policy and networks", function() {
      spyOn(groupPolicyFactory, 'query').and.callThrough();
      spyOn(networkFactory, 'get').and.callThrough();
      expect(element.isolateScope().location.slug).toEqual('xxx');

      var results = { group_policy: { id: 123 } };
      deferred.resolve(results);
      $scope.$apply();

      expect(element.isolateScope().group_policy.id).toEqual(123);
      expect(element.isolateScope().loading).toEqual(true);

      var network = { id: 456 };
      deferred.resolve([network]);
      $scope.$apply();
      expect(element.isolateScope().networks[0].id).toEqual(456);
      expect(element.isolateScope().loading).toEqual(undefined);
    });

    it("should mark selected the current networks in group", function() {
      spyOn(groupPolicyFactory, 'query').and.callThrough();
      spyOn(networkFactory, 'get').and.callThrough();

      var results = { group_policy: { id: 123 }, networks: [{network_id: 456}] };
      deferred.resolve(results);
      $scope.$apply();

      var networks = [{ id: 456 }, {id: 111}];
      deferred.resolve(networks);
      $scope.$apply();
      
      deferred.resolve();
      $scope.$apply();
      
      expect(element.isolateScope().policy_networks[0].network_id).toEqual(456);
      expect(element.isolateScope().selected[0].id).toEqual(456);
    });
    
    it("should update the networks and mark the _destroy for those removed", function() {
      spyOn(groupPolicyFactory, 'query').and.callThrough();
      spyOn(groupPolicyFactory, 'update').and.callThrough();
      spyOn(networkFactory, 'get').and.callThrough();

      var results = { group_policy: { id: 123 }, networks: [{network_id: 456}] };
      deferred.resolve(results);
      $scope.$apply();

      var networks = [{ id: 456 }, {id: 111}];
      deferred.resolve(networks);
      $scope.$apply();
      
      deferred.resolve();
      $scope.$apply();
      
      expect(element.isolateScope().policy_networks[0].network_id).toEqual(456);
      expect(element.isolateScope().selected[0].id).toEqual(456);

      // Remove a network
      element.isolateScope().selected = [];

      // Push new one one
      var network = { id: 999 };
      element.isolateScope().selected.push(network);
      element.isolateScope().update();

      expect(element.isolateScope().networkAttributes[0].id).toEqual(456);
      expect(element.isolateScope().networkAttributes[0]._destroy).toEqual(true);
      expect(element.isolateScope().networkAttributes[1].id).toEqual(999);
      expect(element.isolateScope().networkAttributes[1]._destroy === undefined).toEqual(true);
      
      deferred.resolve(results);
      $scope.$apply();
      // expect(element.isolateScope().currentNetworks).toEqual([999]);
    });
  });
});
