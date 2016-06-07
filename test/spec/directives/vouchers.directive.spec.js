'use strict';

describe('lists location vouchers', function () {

  var $scope;
  var element;
  var $location;
  var voucherFactory;
  var $httpBackend;
  var locationFactory;
  var routeParams;
  var splashFactory;
  var q;
  var deferred;

  beforeEach(module('myApp', function($provide) {
    voucherFactory = {
      create: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      get: function () {
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
      }
    };
    locationFactory = {
      shortquery: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    };
    splashFactory = {
      query: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    };
    $provide.value("Voucher", voucherFactory);
    $provide.value("Location", locationFactory);
    $provide.value("SplashPage", splashFactory);
  }));

  beforeEach(module('components/layouts/submit.html'));
  beforeEach(module('components/vouchers/_form.html'));
  beforeEach(module('components/locations/index/index.html'));
  beforeEach(module('components/vouchers/index.html'));

  describe('new voucher tests', function() {
    beforeEach(inject(function($compile, $rootScope, $q, _$location_, $injector, $routeParams) {
      $httpBackend = $injector.get('$httpBackend');
      $httpBackend.whenGET('template/tooltip/tooltip-popup.html').respond("");
      $scope = $rootScope;
      $location = _$location_;
      q = $q;

      routeParams = $routeParams;
      routeParams.location_id = '123'

      element = angular.element('<new-voucher></new-voucher>');
      $compile(element)($rootScope)
      element.scope().$apply();
    }))

    it("should have some default vars", function() {
      spyOn(voucherFactory, 'create').andCallThrough()
      var newVoucher = { voucher_name: 123, unique_id: 123192837 };

      // Has some default vars //
      expect(element.isolateScope().voucher.secure_password).toBe(true)
      expect(element.isolateScope().voucher.quantity).toBe(10)
      expect(element.isolateScope().voucher.validity_minutes).toBe(60)
      expect(element.isolateScope().voucher.validity_minutes).toBe(60)
      expect(element.isolateScope().voucher.download_speed).toBe(2048)
      expect(element.isolateScope().voucher.upload_speed).toBe(1024)

      expect(element.isolateScope().access_types).not.toBe(undefined)
    });

    it("should fetch the location and splash page for the vouchers", function() {
      spyOn(voucherFactory, 'create').andCallThrough()
      spyOn(locationFactory, 'shortquery').andCallThrough()
      spyOn(splashFactory, 'query').andCallThrough()

      var locations = [{location_name: 'simon', id: 111, slug: 'sluggy'}]
      var newVoucher = { voucher_name: 123, unique_id: 123192837 };

      expect(element.isolateScope().loading).toBe(true);

      var splash = {splash_pages: [{a: 123, id: 999 }] };
      deferred.resolve(splash);
      $scope.$apply();
      expect(element.isolateScope().splash_pages).toBe(splash.splash_pages);
      expect(element.isolateScope().voucher.splash_page_id).toBe(999);
      expect(element.isolateScope().loading).toBe(undefined);
      expect(element.isolateScope().location.slug).toBe('123');
    });

    it("should fetch the location and but find no splash pages setting the splash id to nil to clear form", function() {
      spyOn(voucherFactory, 'create').andCallThrough()
      spyOn(locationFactory, 'shortquery').andCallThrough()
      spyOn(splashFactory, 'query').andCallThrough()

      var locations = [{location_name: 'simon', id: 111, slug: 'sluggy'}]
      var newVoucher = { voucher_name: 123, unique_id: 123192837 };

      expect(element.isolateScope().loading).toBe(true);

      var splash = {splash_pages: [{a: 123, _id: 999 }] };
      deferred.resolve(splash);
      $scope.$apply();
      expect(element.isolateScope().loadingSplash).toBe(undefined);
      expect(element.isolateScope().voucher.splash_page_id).toBe(undefined);
    });

    it("should create the vouchers", function() {
      spyOn(voucherFactory, 'create').andCallThrough()
      var newVoucher = { voucher_name: 123, unique_id: 123192837 };

      element.isolateScope().createVoucher();
      expect(element.isolateScope().voucher.state).toBe('creating')

      deferred.resolve(newVoucher);
      $scope.$apply()

      expect($location.path()).toBe('/locations/123/vouchers/' + newVoucher.unique_id)
    });

    it("should not create the vouchers - 400 error", function() {
      spyOn(voucherFactory, 'create').andCallThrough();
      var voucher = { voucher_name: 123 };
      var newVoucher = { voucher_name: 123, unique_id: 123192837 };
      element.isolateScope().voucher = voucher;
      element.isolateScope().createVoucher();
      expect(element.isolateScope().voucher.state).toBe('creating');

      deferred.reject({data: {errors: {base: '123'}}});
      $scope.$apply();
      // expect(element.isolateScope().errors).toBe("There's been a problem creating your codes.");
      expect(element.isolateScope().voucher.state).toBe("failed");
    });
  });

  describe('show voucher tests', function() {
    beforeEach(inject(function($compile, $rootScope, $q, _$location_,$injector) {
      $httpBackend = $injector.get('$httpBackend');
      $httpBackend.whenGET('template/tooltip/tooltip-popup.html').respond("");
      $scope = $rootScope;
      $location = _$location_;
      q = $q;
      $scope.location = {
        slug: 123
      };
      element = angular.element('<show-voucher></new-voucher>');
      $compile(element)($rootScope);
      element.scope().$apply();
    }));

    it("should get the voucher", function() {
      spyOn(voucherFactory, 'get').andCallThrough();
      expect(element.isolateScope().loading).toBe(true);
      var voucher = { a: 123 };

      deferred.resolve(voucher);
      $scope.$apply();
      expect(element.isolateScope().voucher).toBe(voucher);
      expect(element.isolateScope().loading).toBe(undefined);
    });

    it("should not get the voucher", function() {
      spyOn(voucherFactory, 'get').andCallThrough();
      expect(element.isolateScope().loading).toBe(true);
      var voucher = { a: 123 };

      deferred.reject();
      $scope.$apply();
      // expect(element.isolateScope().errors).toBe(123);
      expect(element.isolateScope().loading).toBe(undefined);

    });

    it("should update the voucher", function() {
      spyOn(voucherFactory, 'update').andCallThrough();
      var voucher = { name: 'simon' };
      var newVoucher = { name: 'steve' };
      element.isolateScope().voucher = voucher;

      element.isolateScope().update();
      expect(element.isolateScope().voucher.state).toBe('updating')

      deferred.resolve(newVoucher);
      $scope.$apply();
      expect(element.isolateScope().voucher.state).toBe('updated')
      expect(element.isolateScope().voucher.name).toBe('steve')
    });

    it("should not update the voucher", function() {
      spyOn(voucherFactory, 'update').andCallThrough();
      var voucher = { name: 'simon' };
      var newVoucher = { name: 'steve' };
      element.isolateScope().voucher = voucher;

      element.isolateScope().update();
      expect(element.isolateScope().voucher.state).toBe('updating')

      deferred.reject(123);
      $scope.$apply();
      expect(element.isolateScope().voucher.state).toBe(undefined);
      expect(element.isolateScope().errors).toBe('There was a problem updating your voucher')
    });

    it("should delete the voucher", function() {
      spyOn(window, 'confirm').andReturn(true);
      spyOn(voucherFactory, 'destroy').andCallThrough();
      var voucher = { name: 'simon' };
      var newVoucher = { name: 'steve' };
      element.isolateScope().voucher = voucher;

      element.isolateScope().destroy();
      expect(element.isolateScope().voucher.state).toBe('destroying')

      deferred.resolve(newVoucher);
      $scope.$apply();
      expect($location.path()).toBe('/locations/undefined/vouchers');
    });

    it("should not delete the voucher", function() {
      spyOn(window, 'confirm').andReturn(true);
      spyOn(voucherFactory, 'destroy').andCallThrough();
      var voucher = { name: 'simon' };
      var newVoucher = { name: 'steve' };
      element.isolateScope().voucher = voucher;

      element.isolateScope().destroy();
      expect(element.isolateScope().voucher.state).toBe('destroying')

      deferred.reject(123);
      $scope.$apply();
      expect(element.isolateScope().voucher.state).toBe(undefined)
      expect(element.isolateScope().errors).toBe('There was a problem destroying your voucher')
    });

    it("should regenerate the link", function() {

      spyOn(voucherFactory, 'update').andCallThrough();
      var newVoucher = { name: 'steve', csv_link: 123, pdf_link: 456 };
      var voucher = { name: 'simon' };
      element.isolateScope().voucher = voucher;

      element.isolateScope().regenerateLink();
      expect(element.isolateScope().voucher.state).toBe('regenerating');

      deferred.resolve(newVoucher);
      $scope.$apply();
      expect(element.isolateScope().voucher.state).toBe('regenerated');
      expect(element.isolateScope().voucher.csv_link).toBe(newVoucher.csv_link);
      expect(element.isolateScope().voucher.pdf_link).toBe(newVoucher.pdf_link);
    });

    it("should not regenerate the link", function() {

      spyOn(voucherFactory, 'update').andCallThrough();
      var newVoucher = { name: 'steve', csv_link: 123, pdf_link: 456 };
      var voucher = { name: 'simon' };
      element.isolateScope().voucher = voucher;

      element.isolateScope().regenerateLink();
      expect(element.isolateScope().voucher.state).toBe('regenerating');

      deferred.reject({data: {errors: {base: '123'}}});
      $scope.$apply();
      // expect(element.isolateScope().errors).toBe("There was a problem regenerating your links");
      expect(element.isolateScope().voucher.state).toBe("regenFailed");
    });

  });

});

