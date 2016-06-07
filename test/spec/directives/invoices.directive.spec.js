'use strict';

describe('invoices directive tests', function () {

  var $scope,
      element,
      deferred,
      Auth,
      authFactory,
      q,
      location,
      invoiceFactory;

  beforeEach(module('myApp', function($provide) {
    authFactory = {
      currentUser: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
    };
    invoiceFactory = {
      email: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      get: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      refund: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    };
    $provide.value("Invoice", invoiceFactory);
    // $provide.value("Auth", authFactory);
  }));

  describe('invoice index', function () {

    beforeEach(inject(function($compile, $rootScope, $q) {
      $scope = $rootScope;
      q = $q;
      element = angular.element('<invoices></invoices>');
      $compile(element)($rootScope)
      element.scope().$apply();
    }))

    it("should successfully list the invoices", function() {
      spyOn(invoiceFactory, 'get').andCallThrough();
      var invoice = { password: 123, current_password: 456, slug: 123 };
      element.isolateScope().getInvoices();
      $scope.$apply();
      expect(element.isolateScope().loading).toBe(true);

      deferred.resolve([invoice]);
      $scope.$apply();
      expect(element.isolateScope().invoices[0]).toBe(invoice);
      expect(element.isolateScope().loading).toBe(undefined);
    })

    it("should not successfully list the invoices", function() {
      spyOn(invoiceFactory, 'get').andCallThrough();
      var invoice = { password: 123, current_password: 456, slug: 123 };
      element.isolateScope().getInvoices();
      $scope.$apply();
      expect(element.isolateScope().loading).toBe(true);

      deferred.reject({data: { message: 123 }});
      $scope.$apply();
      expect(element.isolateScope().errors).toBe(123);
      expect(element.isolateScope().loading).toBe(undefined);
    })

    it("should successfully select the invoices to email", function() {
      spyOn(invoiceFactory, 'get').andCallThrough();
      spyOn(invoiceFactory, 'email').andCallThrough();
      var invoice = { password: 123, current_password: 456, id: 123 };
      element.isolateScope().getInvoices();
      deferred.resolve([invoice]);
      $scope.$apply();
      expect(element.isolateScope().invoices[0]).toBe(invoice);
      expect(element.isolateScope().loading).toBe(undefined);

      element.isolateScope().selection = [invoice.id];
      $scope.$apply();
      element.isolateScope().emailInvoices();
      $scope.$apply();
      expect(element.isolateScope().processing).toBe(true);

      deferred.resolve();
      $scope.$apply();
      expect(element.isolateScope().processing).toBe(undefined);
    })

    it("should NOT successfully select the invoices to email", function() {
      spyOn(invoiceFactory, 'get').andCallThrough();
      spyOn(invoiceFactory, 'email').andCallThrough();
      var invoice = { password: 123, current_password: 456, id: 123 };
      element.isolateScope().getInvoices();
      deferred.resolve([invoice]);
      $scope.$apply();
      expect(element.isolateScope().invoices[0]).toBe(invoice);
      expect(element.isolateScope().loading).toBe(undefined);

      element.isolateScope().selection = [invoice.id];
      $scope.$apply();
      element.isolateScope().emailInvoices();
      $scope.$apply();
      expect(element.isolateScope().processing).toBe(true);

      deferred.reject({data: {message: 123}});
      $scope.$apply();
      expect(element.isolateScope().processing).toBe(undefined);
      expect(element.isolateScope().errors).toBe(123);
    })

  })

  describe('invoice index', function () {

    beforeEach(inject(function($compile, $rootScope, $q, _Auth_) {
      $scope = $rootScope;
      Auth = _Auth_;
      var user = { pss: true, username: 'Simon-Morley', slug: 1, authToken: 1123, role_id: 4 };
      Auth.saveUser(user);
      var currUser = Auth.currentUser();
      q = $q;
      $scope.invoice = { password: 123, current_password: 456, slug: 123 };
      element = angular.element('<refund-invoice id="{{invoice.id}}"></refund-invoice>');
      $compile(element)($rootScope)
      element.scope().$apply();
    }))

    it("should successfully refund an invoice", function() {
      spyOn(window, 'confirm').andReturn(true);
      spyOn(invoiceFactory, 'refund').andCallThrough();
      expect(element.find('#refund-amount').hasClass('ng-hide')).toBe(true);
      element.isolateScope().refund();
      $scope.$apply();
      expect(element.isolateScope().loading).toBe(true);
      expect(element.find('#refund-amount').hasClass('ng-hide')).toBe(false);

      var cont = element.find('input[name*="amount"]').controller('ngModel');
      cont.$setViewValue(10);
      $scope.$apply();
      expect(element.isolateScope().amount).toBe(10);

      element.isolateScope().processRefund();
      deferred.resolve();
      $scope.$apply();
      expect(element.isolateScope().loading).toBe(undefined);
      expect(element.isolateScope().success).toBe(true);
    })

    it("should not successfully refund an invoice", function() {
      spyOn(window, 'confirm').andReturn(true);
      spyOn(invoiceFactory, 'refund').andCallThrough();
      expect(element.find('#refund-amount').hasClass('ng-hide')).toBe(true);
      element.isolateScope().refund();
      $scope.$apply();
      expect(element.isolateScope().loading).toBe(true);
      expect(element.find('#refund-amount').hasClass('ng-hide')).toBe(false);

      var cont = element.find('input[name*="amount"]').controller('ngModel');
      cont.$setViewValue(10);
      $scope.$apply();
      expect(element.isolateScope().amount).toBe(10);

      element.isolateScope().processRefund();
      deferred.reject({data: {message: 123}});
      $scope.$apply();
      expect(element.isolateScope().loading).toBe(undefined);
      expect(element.isolateScope().success).toBe(undefined);
      expect(element.isolateScope().errors).toBe(123);
    })

  })
})
