'use strict';

describe('lists location brands', function () {

  var $scope;
  var element;
  var $location;
  var brandFactory;
  var locationFactory;
  var splashFactory;
  var q;
  var deferred;
  var $httpBackend;

  beforeEach(module('myApp', function($provide) {
    brandFactory = {
      update: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      create: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      get: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
    };
    $provide.value("Brand", brandFactory);
  }));

  beforeEach(module('components/users/branding/_form.html'));

  describe('new brand tests', function() {
    beforeEach(inject(function($compile, $rootScope, $q, _$location_, $injector) {
      $httpBackend = $injector.get('$httpBackend');
      $httpBackend.whenGET('template/pagination/pagination.html').respond("");
      $scope = $rootScope;
      $location = _$location_;
      q = $q;
      element = angular.element('<user-brand></user-brand>');
      $compile(element)($rootScope)
      element.scope().$apply();
    }));

    it("should display a brands", function() {
      spyOn(brandFactory, 'get').andCallThrough();
      expect(element.isolateScope().loading).toBe(true);

      var brands = { username: 'simons' };
      deferred.resolve(brands);
      $scope.$apply();

      expect(element.isolateScope().brand).toBe(brands);
      expect(element.isolateScope().loading).toBe(undefined);
    });

    it("should create a brand", function() {
      spyOn(brandFactory, 'create').andCallThrough();
      var brand = { brand_name: 'simons', url: 'polkaspots' };

      element.isolateScope().create(brand);
      expect(element.isolateScope().creating).toBe(true);

      deferred.resolve(brand);
      $scope.$apply();

      expect(element.isolateScope().brand).toBe(brand);
      expect(element.isolateScope().creating).toBe(undefined);
    });

    it("should not create a brand", function() {
      spyOn(brandFactory, 'create').andCallThrough();
      var brand = { brand_name: 'simons', url: 'polkaspots' };

      element.isolateScope().create(brand);
      expect(element.isolateScope().creating).toBe(true);

      deferred.reject({data: { url: ['invalid']}});
      $scope.$apply();

      expect(element.isolateScope().creating).toBe(undefined);
      // Fix this //
      // expect(element.isolateScope().errors[0]).toBe('url invalid');
      expect(element.isolateScope().notificationMsg.msg).toBe('url invalid');
    });

    it("should update a brand", function() {
      spyOn(window, 'confirm').andReturn(true);
      spyOn(brandFactory, 'update').andCallThrough();
      var brand = { brand_name: 'simons', url: 'polkaspots' };
      element.isolateScope().brand = brand;

      element.isolateScope().update(brand);
      expect(element.isolateScope().updating).toBe(true);

      deferred.resolve(brand);
      $scope.$apply();

      expect(element.isolateScope().brand).toBe(brand);
      expect(element.isolateScope().updating).toBe(undefined);
    });

    it("should not update a brand", function() {
      spyOn(window, 'confirm').andReturn(true);
      spyOn(brandFactory, 'update').andCallThrough();
      var brand = { brand_name: 'simons', url: 'polkaspots' };
      element.isolateScope().brand = brand;

      element.isolateScope().update(brand);
      expect(element.isolateScope().updating).toBe(true);

      deferred.reject({data: { url: [123]}});
      $scope.$apply();

      expect(element.isolateScope().updating).toBe(undefined);
      // expect(element.isolateScope().errors[0]).toBe('url 123');
    });

    // it("should switch brands", function() {
    //   // spyOn(brandFactory, 'update').andCallThrough();
    //   var brand = { brand_name: 'simons', url: 'polkaspots' };
    //   element.isolateScope().brand = brand;

    //   element.isolateScope().switchBrand();
    //   // expect(element.isolateScope().updating).toBe(true);

    //   // deferred.reject({data: {errors: { base: [123]}}});
    //   // $scope.$apply();

    //   // expect(element.isolateScope().updating).toBe(undefined);
    //   // expect(element.isolateScope().errors[0]).toBe(123);
    // });

  });

});

