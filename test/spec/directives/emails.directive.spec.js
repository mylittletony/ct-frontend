'use strict';

describe('lists location emails', function () {

  var $scope;
  var element;
  var $location;
  var emailFactory;
  var locationFactory;
  var splashFactory;
  var q;
  var deferred;
  var $httpBackend;

  beforeEach(module('myApp', function($provide) {
    emailFactory = {
      query: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      get: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
    };
    $provide.value("Email", emailFactory);
  }));

  beforeEach(module('components/layouts/submit.html'));
  // beforeEach(module('components/reports/emails/_index.html'));

  describe('new email tests', function() {
    beforeEach(inject(function($compile, $rootScope, $q, _$location_, $injector) {
      $httpBackend = $injector.get('$httpBackend');
      $httpBackend.whenGET('template/pagination/pagination.html').respond("");
      $scope = $rootScope;
      $location = _$location_;
      q = $q;
      $scope.voucher = {
        unique_id: 123
      }
      element = angular.element('<emails-list></emails-list>');
      $compile(element)($rootScope)
      element.scope().$apply();
    }));

    it("should display the emails", function() {
      spyOn(emailFactory, 'get').andCallThrough()
      expect(element.isolateScope().loading).toBe(true)

      var emails = {emails: [{ username: 'simons' }], _stats: {} }
      deferred.resolve(emails);
      $scope.$apply()

      expect(element.isolateScope().emails[0]).toBe(emails.emails[0]);
      expect(element.isolateScope().loading).toBe(undefined)
    });

    it("should not display the emails", function() {
      spyOn(emailFactory, 'get').andCallThrough()
      expect(element.isolateScope().loading).toBe(true)

      deferred.reject();
      $scope.$apply()

      // needs error message ? //
      expect(element.isolateScope().loading).toBe(undefined)
    });

  });


});

