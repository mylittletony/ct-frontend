'use strict';

describe('lists location orders', function () {

  var $scope;
  var element;
  var $location;
  var orderFactory;
  var locationFactory;
  var splashFactory;
  var q;
  var deferred;
  var $httpBackend;

  beforeEach(module('myApp', function($provide) {
    orderFactory = {
      query: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      update: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      get: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
    };
    $provide.value("Order", orderFactory);
  }));

  beforeEach(module('components/layouts/submit.html'));

  describe('new order tests', function() {
    beforeEach(inject(function($compile, $rootScope, $q, _$location_, $injector) {
      $httpBackend = $injector.get('$httpBackend');
      $httpBackend.whenGET('template/pagination/pagination.html').respond("");
      $scope = $rootScope;
      $location = _$location_;
      q = $q;
      element = angular.element('<store-orders></store-orders>');
      $compile(element)($rootScope)
      element.scope().$apply();
    }));

    it("should display the voucher orders", function() {
      spyOn(orderFactory, 'get').andCallThrough()
      expect(element.isolateScope().loading).toBe(true)

      var orders = {orders: [{ username: 'simons' }] }
      deferred.resolve(orders);
      $scope.$apply()

      expect(element.isolateScope().orders[0]).toBe(orders.orders[0]);
      expect(element.isolateScope().loading).toBe(undefined)
    });

    it("should not display the voucher orders", function() {
      spyOn(orderFactory, 'get').andCallThrough()
      expect(element.isolateScope().loading).toBe(true)

      deferred.reject();
      $scope.$apply()

      expect(element.isolateScope().loading).toBe(undefined)
    });

  });

  describe('viewing the orders', function() {
    beforeEach(inject(function($compile, $rootScope, $q, _$location_, $injector) {
      $scope = $rootScope;
      $location = _$location_;
      q = $q;
      $scope.voucher = {
        unique_id: 123
      }
      element = angular.element('<orders-show></orders-show>');
      $compile(element)($rootScope)
      element.scope().$apply();
    }));

    it("should display the store orders", function() {
      spyOn(orderFactory, 'query').andCallThrough()
      expect(element.isolateScope().loading).toBe(true)

      var order = { username: 'simons' }
      deferred.resolve(order);
      $scope.$apply()

      expect(element.isolateScope().order).toBe(order);
      expect(element.isolateScope().loading).toBe(undefined)
    });

    it("should display the store orders and the refuned it", function() {
      spyOn(orderFactory, 'query').andCallThrough()
      spyOn(orderFactory, 'update').andCallThrough()
      spyOn(window, 'confirm').andReturn(true);
      var order = { username: 'simons' }

      expect(element.isolateScope().loading).toBe(true)

      deferred.resolve(order);
      $scope.$apply()

      expect(element.isolateScope().order).toBe(order);
      expect(element.isolateScope().loading).toBe(undefined)

      element.isolateScope().update()
      expect(element.isolateScope().order.state).toBe('refunding');

      var order = { state: 'refunded' }
      deferred.resolve(order);
      $scope.$apply()
      expect(element.isolateScope().order.state).toBe('refunded');
    });

    it("should display the store orders and then NOT refuned it", function() {
      spyOn(orderFactory, 'query').andCallThrough()
      spyOn(orderFactory, 'update').andCallThrough()
      spyOn(window, 'confirm').andReturn(true);
      var order = { username: 'simons', state: 'success' }

      expect(element.isolateScope().loading).toBe(true)

      deferred.resolve(order);
      $scope.$apply()

      expect(element.isolateScope().order).toBe(order);
      expect(element.isolateScope().loading).toBe(undefined)

      element.isolateScope().update()
      expect(element.isolateScope().order.state).toBe('refunding');

      var order = { state: 'refunded' }
      deferred.reject("123") //{data: {errors: {base: 123 }}});
      $scope.$apply()
      expect(element.isolateScope().order.state).toBe('success');
      expect(element.isolateScope().errors).toBe('There was a problem refunding this order.');
    });

  });

});

