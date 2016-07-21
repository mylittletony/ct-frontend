'use strict';

describe('networks', function () {

  var $scope, element, $routeParams, q, deferred, $httpBackend, networkFactory, zoneFactory;

  beforeEach(module('templates'));

  beforeEach(module('myApp', function($provide) {
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
  });

});

