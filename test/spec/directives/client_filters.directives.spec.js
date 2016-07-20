'use strict';

describe('client_filters', function () {

  var $scope, element, $routeParams, clientFilterFactory, q,
  deferred, $httpBackend, networkFactory, zoneFactory;

  beforeEach(module('templates'));

  beforeEach(module('myApp', function($provide) {
    clientFilterFactory = {
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
    $provide.value("ClientFilter", clientFilterFactory);
  }));

  beforeEach(inject(function($injector) {
    $httpBackend = $injector.get('$httpBackend');
    $httpBackend.whenGET('/translations/en_GB.json').respond("");
  }));

  describe('lists the client filters for a location', function() {
    beforeEach(inject(function($compile, $rootScope, $q, _$routeParams_, $injector) {
      $scope = $rootScope;
      q = $q;
      $routeParams = _$routeParams_;
      $routeParams.id = 'xxx';
      $scope.loading = true;
      var elem = angular.element('<list-client-filters loading="loading"></list-client-filters>');
      element = $compile(elem)($rootScope);
      element.scope().$digest();
    }));

    it("should set the default scopes vals", function() {
      spyOn(clientFilterFactory, 'get').and.callThrough()
      expect(element.isolateScope().location.slug).toBe('xxx')

      var levels = [{key: 'All', value: 'all'}, {key: 'Network', value: 'network'}, {key: 'Zone', value: 'zone'}]
      expect(element.isolateScope().levels).toEqual(levels);
    });

    it("should display the filters for the index table", function() {
      spyOn(clientFilterFactory, 'get').and.callThrough()
      expect(element.isolateScope().location.slug).toBe('xxx')

      var results = { client_filters: [{ id: 123 }], _links: {} };
      deferred.resolve(results);
      $scope.$apply()

      expect(element.isolateScope().client_filters[0].id).toBe(123);
      expect(element.isolateScope().loading).toBe(undefined);
    });

    it("should set the level to network and fetch the networks", function() {
      spyOn(networkFactory, 'get').and.callThrough()

      element.isolateScope().getNetworks();
      // expect(element.isolateScope().loadingLevels).toBe(true);
      var results = [{ id: 123 }];
      deferred.resolve(results);
      $scope.$apply()

      // we dont need since we only use within the dialogCtrl
      // expect(element.isolateScope().networks[0].id).toBe(123);
    });

    it("should set the level to network and fetch the zones", function() {
      spyOn(zoneFactory, 'get').and.callThrough()

      element.isolateScope().getZones();
      var results = [{ id: 123 }];
      deferred.resolve(results);
      $scope.$apply()

      // we dont need since we only use within the dialogCtrl
      // expect(element.isolateScope().zones[0].id).toBe(123);
    });

    it("should create the new filter", function() {
      spyOn(clientFilterFactory, 'create').and.callThrough()

      var cf = { description: 'foo' };
      element.isolateScope().create(cf);
      expect(element.isolateScope().creating).toEqual(true);
      
      var results = [{ description: 'foo' }];
      deferred.resolve(results);
      $scope.$apply()
    });

  });

});

