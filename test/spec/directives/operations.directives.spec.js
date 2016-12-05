'use strict';

describe('operation', function () {

  var $scope, element, $routeParams, operationFactory, q, location, $location,
  deferred, $httpBackend, boxFactory;

  beforeEach(module('templates'));

  beforeEach(module('myApp', function($provide) {
    operationFactory = {
      get: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      query: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    };
    boxFactory = {
      get: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    };
    $provide.value("Operation", operationFactory);
    $provide.value("Box", boxFactory);
  }));

  beforeEach(inject(function($injector) {
    $httpBackend = $injector.get('$httpBackend');
    $httpBackend.whenGET('/translations/en_GB.json').respond("");
  }));

  describe('lists the operations', function() {
    beforeEach(inject(function($compile, $rootScope, $q, _$routeParams_, $injector, _$location_) {
      $scope = $rootScope;
      q = $q;
      $scope.loading = true;
      $location = _$location_;
      $routeParams = _$routeParams_;
      $routeParams.id = 'xxx';
      $routeParams.box_id = 'yyy';
      var elem = angular.element('<operations loading="loading"></operations>');
      element = $compile(elem)($rootScope);
      element.scope().$digest();
    }));

    it("should set the variables", function() {
      spyOn(operationFactory, 'query').and.callThrough();
      expect(element.isolateScope().query.order).toBe('-created_at');
      expect(element.isolateScope().box.slug).toBe('yyy');
    });

    it("should list the operations", function() {
      spyOn(operationFactory, 'query').and.callThrough();
      expect(element.isolateScope().loading).toBe(true);

      var links = { total: 999 };
      var vals = { _links: links, operations: [{a: 123}] }
      deferred.resolve(vals);
      $scope.$digest()

      expect(element.isolateScope().loading).toBe(undefined);
      expect(element.isolateScope().operations.length).toBe(1);
      expect(element.isolateScope()._links).toBe(links);
    });
  });

  describe('displays the operations', function() {
    beforeEach(inject(function($compile, $rootScope, $q, _$routeParams_, $injector, _$location_) {
      $scope = $rootScope;
      q = $q;
      $location = _$location_;
      $routeParams = _$routeParams_;
      $routeParams.id = 'xxx';
      $routeParams.box_id = 'yyy';
      var elem = angular.element('<show-operation></show-operation>');
      element = $compile(elem)($rootScope);
      element.scope().$digest();
    }));

    it("should display the operation", function() {
      expect(element.isolateScope().loading).toBe(true);
      spyOn(operationFactory, 'get').and.callThrough();
      expect(element.isolateScope().box.slug).toBe('yyy');
      expect(element.isolateScope().location.slug).toBe('xxx');
    });
  });
});
