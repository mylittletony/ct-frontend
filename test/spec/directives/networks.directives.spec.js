'use strict';

describe('networks', function () {

  var $scope, element, $routeParams, q, deferred, $httpBackend, networkFactory, zoneFactory, $location;

  beforeEach(module('templates'));

  beforeEach(module('myApp', function($provide) {
    networkFactory = {
      query: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      get: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      destroy: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      update: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    };
    zoneFactory = {
      get: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
    };
    $provide.value("Zone", zoneFactory);
    $provide.value("Network", networkFactory);
  }));

  beforeEach(inject(function($injector) {
    $httpBackend = $injector.get('$httpBackend');
    $httpBackend.whenGET('/translations/en_GB.json').respond("");
  }));

  describe('lists the networks for a location', function() {
    beforeEach(inject(function($compile, $rootScope, $q, _$routeParams_, $injector) {
      $scope = $rootScope;
      q = $q;
      $routeParams = _$routeParams_;
      $routeParams.id = 'xxx';
      $routeParams.q = 'my-filter';
      $routeParams.page = '10';
      $routeParams.per = '100';
      $scope.loading = true;
      var elem = angular.element('<list-networks loading="loading"></list-networks>');
      element = $compile(elem)($rootScope);
      element.scope().$digest();
    }));

    it("should set the default scopes vals", function() {
      spyOn(networkFactory, 'get').and.callThrough();
      expect(element.isolateScope().location.slug).toEqual('xxx');

      var results = [{ id: 123 }];
      deferred.resolve(results);
      $scope.$apply();

      expect(element.isolateScope().menu.length).toEqual(3);
      expect(element.isolateScope().menu[0].name).toEqual('Edit Settings');
      expect(element.isolateScope().menu[0].type).toEqual('settings');
      expect(element.isolateScope().menu[1].name).toEqual('Change SSID');
      expect(element.isolateScope().menu[1].type).toEqual('ssid');
      expect(element.isolateScope().menu[2].name).toEqual('Delete Network');
      expect(element.isolateScope().menu[2].type).toEqual('delete');

      expect(element.isolateScope().query.page).toEqual('10');
      expect(element.isolateScope().query.limit).toEqual('100');
    });

    it("should get the networks and save to scope", function() {
      spyOn(networkFactory, 'get').and.callThrough();
      var results = [{ id: 123 }];
      deferred.resolve(results);
      $scope.$apply();
      expect(element.isolateScope().networks[0].id).toEqual(123);
    });

    it("should update the band to 2.4Ghz or 5Ghz", function() {
      element.isolateScope().updateBand('two');
      expect(element.isolateScope().band).toEqual('2.4Ghz');

      element.isolateScope().updateBand('five');
      expect(element.isolateScope().band).toEqual('5Ghz');

      element.isolateScope().updateBand();
      expect(element.isolateScope().band).toEqual('');
    });

    it("should delete a network and remove from array", function() {
      spyOn(networkFactory, 'destroy').and.callThrough();
      var network = { id: 123 };
      element.isolateScope().networks = [network];

      element.isolateScope().destroy(network)
      deferred.resolve();
      $scope.$apply();
      expect(element.isolateScope().networks.length).toEqual(0);
    });

    // To fix - breaks since we need to sort the errors popup
    xit("should not delete a network and not remove from array", function() {
      spyOn(networkFactory, 'destroy').and.callThrough();
      var network = { id: 123 };
      element.isolateScope().networks = [network];

      element.isolateScope().destroy(network)
      deferred.reject({errors: {data: [{a: 123}]}});
      $scope.$apply();
      expect(element.isolateScope().networks.length).toEqual(1);
    });

    it("should update a network", function() {
      spyOn(networkFactory, 'update').and.callThrough();
      var network = { id: 123, state: 'foo' };
      element.isolateScope().networks = [network];

      element.isolateScope().update(network)
      deferred.resolve();
      $scope.$apply();
      expect(element.isolateScope().networks[0].state).toEqual(undefined);
    });

    // To fix - breaks since we need to sort the errors popup
    xit("should fail to update a network", function() {
      spyOn(networkFactory, 'update').and.callThrough();
      var network = { id: 123, state: 'foo' };
      element.isolateScope().networks = [network];

      element.isolateScope().update(network)
      deferred.reject();
      $scope.$apply();
      expect(element.isolateScope().networks[0].state).toEqual(undefined);
    });

  });

  describe('creates new network for a location', function() {
    beforeEach(inject(function($compile, $rootScope, $q, _$routeParams_, $injector) {
      $scope = $rootScope;
      q = $q;
      $routeParams = _$routeParams_;
      $routeParams.id = 'xxx';
      $routeParams.q = 'my-filter';
      $routeParams.page = '10';
      $routeParams.per = '100';
      $scope.loading = true;
      var elem = angular.element('<new-network loading="loading"></new-network>');
      element = $compile(elem)($rootScope);
      element.scope().$digest();
    }));

    it("should set the default scopes vals", function() {
      spyOn(networkFactory, 'get').and.callThrough();
      expect(element.isolateScope().location.slug).toEqual('xxx');

      // Would prefer to not use a scope //
      element.isolateScope().init();

      var cf = ['Danger', 'Adult', 'Security', 'Family', 'Off'];
      expect(element.isolateScope().content_filters).toEqual(cf);
      var network = element.isolateScope().network
      expect(network.ssid).toEqual('My WiFi Network')
      expect(network.access_type).toEqual('password')
      expect(network.encryption_type).toEqual('psk2')
      expect(network.band_steering).toEqual(true)
      expect(network.active).toEqual(true)
      expect(network.interface_ipaddr === '').toEqual(false)
      expect(network.dhcp_enabled).toEqual(true)
      expect(network.dns_1).toEqual('8.8.8.8')
      expect(network.dns_2).toEqual('8.8.4.4')
      expect(network.interface_netmask).toEqual(24)
      expect(network.use_ps_radius).toEqual(true)
      expect(network.captive_portal_ps).toEqual(true)
      expect(network.content_filter).toEqual('Security')
      expect(network.captive_portal_enabled).toEqual(false)
    });

  });

  describe('displays the network for a location', function() {
    beforeEach(inject(function($compile, $rootScope, $q, _$routeParams_, $injector, _$location_) {
      $scope = $rootScope;
      q = $q;
      $location = _$location_
      $routeParams = _$routeParams_;
      $routeParams.id = 'xxx';
      $routeParams.q = 'my-filter';
      $routeParams.page = '10';
      $routeParams.per = '100';
      $scope.loading = true;
      var elem = angular.element('<display-network loading="loading"></display-network>');
      element = $compile(elem)($rootScope);
      element.scope().$digest();
    }));

    it("should set the default vars for the network", function() {
      spyOn(networkFactory, 'query').and.callThrough();
      expect(element.isolateScope().location.slug).toEqual('xxx');

      var network = { id: '123' };
      deferred.resolve(network);
      $scope.$apply();

      var cf = [
        { key: 'Off', value: 'off' },
        { key: 'Allow White-listed Clients', value: 'allow'},
        { key: 'Block Banned Clients', value: 'deny'}
      ];

      expect(element.isolateScope().client_filters[0].key).toEqual('Off');
      expect(element.isolateScope().client_filters[0].value).toEqual('off');
      expect(element.isolateScope().client_filters[1].key).toEqual('Allow White-listed Clients');
      expect(element.isolateScope().client_filters[1].value).toEqual('allow');
      expect(element.isolateScope().client_filters[2].key).toEqual('Block Banned Clients');
      expect(element.isolateScope().client_filters[2].value).toEqual('deny');

      expect(element.isolateScope().menu.length).toEqual(3);
      expect(element.isolateScope().menu[0].name).toEqual('Delete Network');
      expect(element.isolateScope().menu[0].type).toEqual('delete');
      expect(element.isolateScope().menu[1].name).toEqual('View Zones');
      expect(element.isolateScope().menu[1].type).toEqual('zones');
      expect(element.isolateScope().menu[2].name).toEqual('Test Radius');
      expect(element.isolateScope().menu[2].type).toEqual('radius');
    });

    it("should show the network", function() {
      spyOn(networkFactory, 'query').and.callThrough();

      var network = { id: '123', ssid_hidden: '1' };
      deferred.resolve(network);
      $scope.$apply();

      expect(element.isolateScope().network.id).toEqual('123');
      expect(element.isolateScope().network.ssid_hidden).toEqual(false);
      expect(element.isolateScope().short_ip).toEqual('10.168.210.');
    });

    it("should destroy the network", function() {
      spyOn(networkFactory, 'destroy').and.callThrough();

      var network = { id: '123', ssid_hidden: '1' };
      element.isolateScope().network = network;
      element.isolateScope().destroy();
      deferred.resolve(network);
      $scope.$apply();
      expect($location.path()).toEqual('/locations/xxx/networks');
    });
  });
});
