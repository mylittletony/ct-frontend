'use strict';

describe('Controller: MainCtrl', function () {

  beforeEach(module('myApp'));

  var VouchersController,
      locationFactory,
      voucherFactory,
      scope,
      $location,
      $httpBackend,
      deferred,
      q,
      store = {};


  beforeEach(module('myApp', function($provide) {
    locationFactory = {
      get: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    },
    voucherFactory = {
      update: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      get: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      query: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      destroy: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    }
    $provide.value("Location", locationFactory);
    $provide.value("Voucher", voucherFactory);
  }));

  describe('Controller: MainCtrl', function () {

    beforeEach(inject(function (_$httpBackend_, $controller, $rootScope, _$location_, $q) {
      $httpBackend = _$httpBackend_;
      q = $q;
      scope = $rootScope.$new();
      $location = _$location_;

      VouchersController = $controller('VouchersController', {
        $scope: scope,
      });
    }));

    it('should get the vouchers, why not', function () {
      spyOn(voucherFactory, 'get').andCallThrough();
      expect(scope.loading).toBe(true);
      var voucher = {vouchers: [{ voucher_name: 'Lobby' }]};
      deferred.resolve(voucher);
      scope.$apply();
      expect(JSON.stringify(scope.vouchers)).toBe(JSON.stringify(voucher.vouchers));
      expect(scope.loading).toBe(undefined);
    });

    it('should not get the vouchers - 404 error', function () {
      spyOn(voucherFactory, 'get').andCallThrough();
      expect(scope.loading).toBe(true);
      var voucher = {vouchers: [{ voucher_name: 'Lobby' }]}
      deferred.reject({data: { errors: '123'}})
      scope.$apply();
      expect(scope.loading).toBe(undefined);
      expect(scope.errors).toBe('123');
    });
  });

  describe('Controller: ShowCtrl', function () {

    // beforeEach(inject(function (_$httpBackend_, $controller, $rootScope, _$location_, $q, $routeParams) {
    //   $httpBackend = _$httpBackend_;
    //   var routeParams = {};
    //   routeParams = $routeParams
    //   routeParams.location_id = 123
    //   q = $q;
    //   scope = $rootScope.$new();
    //   $location = _$location_;
    //   VouchersCtrlShow = $controller('VouchersCtrlShow', {
    //     $scope: scope,
    //   });
    // }));

    // it('should delete a voucher', function () {
    //   var voucher = { unique_id: 123 }
    //   spyOn(voucherFactory, 'destroy').andCallThrough();
    //   spyOn(window, 'confirm').andReturn(true);
    //   scope.deleteVoucher(voucher.unique_id)
    //   deferred.resolve(location)
    //   scope.$apply()
    //   expect(voucherFactory.destroy).toHaveBeenCalled();
    //   expect($location.path()).toBe('/locations/123/vouchers')
    //   expect(scope.notifications).toBe('Voucher Deleted Successfully')
    // });

    // it('should cancel delete a voucher', function () {
    //   var voucher = { unique_id: 123 }
    //   spyOn(voucherFactory, 'destroy').andCallThrough();
    //   spyOn(window, 'confirm').andReturn(false);
    //   scope.deleteVoucher(voucher.unique_id)
    //   deferred.resolve(location)
    //   scope.$apply()
    //   expect(voucherFactory.destroy).not.toHaveBeenCalled();
    // });

  });

});

