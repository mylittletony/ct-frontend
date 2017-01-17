'use strict';

describe('brands', function () {

  var $scope, element, $routeParams, userFactory, brandFactory, q, deferred, $httpBackend, reportFactory, zoneFactory, dd;

  beforeEach(module('templates'));

  beforeEach(module('myApp', function($provide) {
    brandFactory = {
      query: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      get: function () {
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
    userFactory = {
      query: function () {
        dd = q.defer();
        return {$promise: dd.promise};
      },
    };
    $provide.value("User", userFactory);
    $provide.value("Brand", brandFactory);
  }));

  beforeEach(inject(function($injector) {
    $httpBackend = $injector.get('$httpBackend');
    $httpBackend.whenGET('/translations/en_GB.json').respond("");
  }));

  describe('displays the brands', function() {
    beforeEach(inject(function($compile, $rootScope, $q, _$routeParams_, $injector) {
      $scope = $rootScope;
      q = $q;
      $routeParams = _$routeParams_;
      $routeParams.id = 1;
      $scope.loading = true;
      var elem = angular.element('<list-brands loading="loading"></list-brands>');
      element = $compile(elem)($rootScope);
      element.scope().$digest();
    }));

    it("should set the default scope vars", function() {
      spyOn(brandFactory, 'query').and.callThrough();
      expect(element.isolateScope().loading).toEqual(true);

      var params = {};
      var brand = { url: 'cucumber', brand_name: 'simon' };
      params.brands = [brand];

      deferred.resolve(params);
      $scope.$digest();

      expect(element.isolateScope().brands[0]).toEqual(brand);
      expect(element.isolateScope().loading).toEqual(undefined);
    });
  });

  describe('displays the brands', function() {
    beforeEach(inject(function($compile, $rootScope, $q, _$routeParams_, $injector) {
      $scope = $rootScope;
      q = $q;
      $routeParams = _$routeParams_;
      $routeParams.id = 1;
      $scope.loading = true;
      var elem = angular.element('<list-brands loading="loading"></list-brands>');
      element = $compile(elem)($rootScope);
      element.scope().$digest();
    }));

    it("should set the default scope vars", function() {
      spyOn(brandFactory, 'query').and.callThrough();
      expect(element.isolateScope().loading).toEqual(true);

      var params = {};
      var brand = { url: 'cucumber', brand_name: 'simon' };
      params.brands = [brand];

      deferred.resolve(params);
      $scope.$digest();

      expect(element.isolateScope().brands[0]).toEqual(brand);
      expect(element.isolateScope().loading).toEqual(undefined);
    });
  });

  describe('creates a new brand', function() {
    beforeEach(inject(function($compile, $rootScope, $q, _$routeParams_, $injector) {
      $scope = $rootScope;
      q = $q;
      $routeParams = _$routeParams_;
      $routeParams.id = 1;
      var elem = angular.element('<new-brand loading="loading"></new-brand>');
      element = $compile(elem)($rootScope);
      element.scope().$digest();
    }));

    it("should set the default scope vars", function() {
      spyOn(brandFactory, 'create').and.callThrough();

      var brand = { locale: 'en-GB', network_location: 'eu-west', brand_name: 'Acme Inc' };

      element.isolateScope().save();

      deferred.resolve(brand);
      $scope.$digest();

      expect(element.isolateScope().brand).toEqual(brand);
    });
  });
});
