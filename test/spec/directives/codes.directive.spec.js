'use strict';

describe('lists location codes', function () {

  var $scope;
  var element;
  var $location;
  var codeFactory;
  var locationFactory;
  var splashFactory;
  var q;
  var deferred;
  var $httpBackend;

  beforeEach(module('myApp', function($provide) {
    codeFactory = {
      query: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      get: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
    };
    $provide.value("Code", codeFactory);
  }));

  beforeEach(module('components/layouts/submit.html'));
  beforeEach(module('components/reports/codes/_index.html'));

  describe('new code tests', function() {
    beforeEach(inject(function($compile, $rootScope, $q, _$location_, $injector) {
      $httpBackend = $injector.get('$httpBackend');
      $httpBackend.whenGET('template/pagination/pagination.html').respond("");
      $scope = $rootScope;
      $location = _$location_;
      q = $q;
      $scope.voucher = {
        unique_id: 123
      }
      element = angular.element('<voucher-codes voucher_id="{{voucher.unique_id}}"></voucher-codes>');
      $compile(element)($rootScope)
      element.scope().$apply();
    }));

    it("should display the voucher codes", function() {
      spyOn(codeFactory, 'get').andCallThrough()
      expect(element.isolateScope().loading).toBe(true)

      var codes = {codes: [{ username: 'simons' }] }
      deferred.resolve(codes);
      $scope.$apply()

      expect(element.isolateScope().codes[0]).toBe(codes.codes[0]);
      expect(element.isolateScope().loading).toBe(undefined)
    });

    it("should not display the voucher codes", function() {
      spyOn(codeFactory, 'get').andCallThrough()
      expect(element.isolateScope().loading).toBe(true)

      deferred.reject();
      $scope.$apply()

      // needs error message ? //
      expect(element.isolateScope().loading).toBe(undefined)
    });

  });

  describe('viewing the codes', function() {
    beforeEach(inject(function($compile, $rootScope, $q, _$location_, $injector) {
      $httpBackend = $injector.get('$httpBackend');
      $httpBackend.whenGET('template/pagination/pagination.html').respond("");
      $scope = $rootScope;
      $location = _$location_;
      q = $q;
      $scope.voucher = {
        unique_id: 123
      }
      element = angular.element('<analytics><codes-list></codes-list></analytics>');
      $compile(element)($rootScope)
      element.scope().$apply();
    }));

    /// Cant test now nested ////
    xit("should display the voucher codes", function() {
      spyOn(codeFactory, 'get').andCallThrough()
      expect(element.isolateScope().loading).toBe(true)

      var codes = {codes: [{ username: 'simons' }], _links: {}, _stats: {} }
      deferred.resolve(codes);
      $scope.$apply()

      expect(element.isolateScope().codes[0]).toBe(codes.codes[0]);
      expect(element.isolateScope().loading).toBe(undefined)
      expect(element.isolateScope().predicate).toBe('-created_at')
      expect(element.isolateScope()._links).toBe(codes._links)
    });

  });

  describe('viewing a speficic codes', function() {
    beforeEach(inject(function($compile, $rootScope, $q, _$location_, $injector) {
      $scope = $rootScope;
      $location = _$location_;
      q = $q;
      $scope.voucher = {
        unique_id: 123
      }
      element = angular.element('<codes-show></codes-show>');
      $compile(element)($rootScope)
      element.scope().$apply();
    }));

    it("should display the voucher codes", function() {
      spyOn(codeFactory, 'query').andCallThrough()
      expect(element.isolateScope().loading).toBe(true)

      var code = { code: { username: 'simons' } }
      deferred.resolve(code);
      $scope.$apply()

      expect(element.isolateScope().code).toBe(code.code);
      expect(element.isolateScope().loading).toBe(undefined)
      // expect(element.isolateScope().predicate).toBe('-created_at')
      // expect(element.isolateScope()._links).toBe(codes._links)
    });

  });

});

