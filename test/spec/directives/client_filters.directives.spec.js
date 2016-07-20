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
      $routeParams.q = 'my-filter';
      $routeParams.page = '10';
      $routeParams.per = '100';
      $scope.loading = true;
      var elem = angular.element('<list-client-filters loading="loading"></list-client-filters>');
      element = $compile(elem)($rootScope);
      element.scope().$digest();
    }));

    it("should set the default scopes vals", function() {
      spyOn(clientFilterFactory, 'get').and.callThrough();
      expect(element.isolateScope().location.slug).toBe('xxx');

      var results = { client_filters: [{ id: 123 }], _links: {} };
      deferred.resolve(results);
      $scope.$apply();

      var levels = [{key: 'All', value: 'all'}, {key: 'Network', value: 'network'}, {key: 'Zone', value: 'zone'}];
      expect(element.isolateScope().levels).toEqual(levels);
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

    it("should create the new filter and add to set", function() {
      spyOn(clientFilterFactory, 'create').and.callThrough()

      element.isolateScope().client_filters = [];
      var cf = { description: 'foo' };
      element.isolateScope().createUpdate(cf);
      expect(element.isolateScope().creating).toEqual(true);

      var results = [{ description: 'foo' }];
      deferred.resolve(results);
      $scope.$apply()

      expect(element.isolateScope().client_filters.length).toEqual(1);
    });

    it("should update the filter since it has an id", function() {
      spyOn(clientFilterFactory, 'update').and.callThrough()

      var cf = { description: 'foo', id: 123 };
      element.isolateScope().client_filters = [cf];
      element.isolateScope().createUpdate(cf);

      var results = [{ description: 'foo' }];
      deferred.resolve(results);
      $scope.$apply()

      expect(element.isolateScope().client_filters.length).toEqual(1);
    });

    it("should destroy the filter and remove from set", function() {
      spyOn(clientFilterFactory, 'destroy').and.callThrough()

      var cf = { id: 123 };
      element.isolateScope().client_filters = [cf];
      expect(element.isolateScope().client_filters.length).toEqual(1);

      element.isolateScope().destroy(cf.id);

      var results = [{ description: 'foo' }];
      deferred.resolve(results);
      $scope.$apply()

      expect(element.isolateScope().client_filters.length).toEqual(0);
    });

  });

});

