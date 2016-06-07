'use strict';

describe('lists location app_events', function () {

  var $scope;
  var element;
  var $location;
  var appFactory;
  var locationFactory;
  var splashFactory;
  var q;
  var deferred;
  var $httpBackend;

  beforeEach(module('myApp', function($provide) {
    appFactory = {
      query: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      get: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
    };
    $provide.value("AppEvent", appFactory);
  }));

  // beforeEach(module('components/layouts/submit.html'));
  // beforeEach(module('components/reports/app_events/_index.html'));

  describe('new app_event tests', function() {
    beforeEach(inject(function($compile, $rootScope, $q, _$location_, $injector) {
      // $httpBackend = $injector.get('$httpBackend');
      // $httpBackend.whenGET('template/pagination/pagination.html').respond("");
      $scope = $rootScope;
      $location = _$location_;
      q = $q;
      $scope.voucher = {
        unique_id: 123
      }
      element = angular.element('<aes></aes>');
      $compile(element)($rootScope)
      element.scope().$apply();
    }));

    it("should display the app_events", function() {
      spyOn(appFactory, 'get').andCallThrough()
      expect(element.isolateScope().loading).toBe(true)

      var aes = { simon: "smorley" }
      var app_events =  [aes]

      deferred.resolve(app_events);
      $scope.$apply()

      // expect(element.isolateScope().app_events[0]).toBe(app_events.app_events[0]);
      expect(element.isolateScope().loading).toBe(undefined)
    });

    // it("should display the app_events", function() {
    //   spyOn(appFactory, 'query').andCallThrough()
    //   expect(element.isolateScope().loading).toBe(true)

    //   var aes = { simon: "smorley" }
    //   var app_events =  [aes]

    //   deferred.resolve(app_events);
    //   $scope.$apply()

    //   // expect(element.isolateScope().app_events[0]).toBe(app_events.app_events[0]);
    //   expect(element.isolateScope().loading).toBe(undefined)
    // });

    // it("should not display the voucher app_events", function() {
    //   spyOn(app_eventFactory, 'get').andCallThrough()
    //   expect(element.isolateScope().loading).toBe(true)

    //   deferred.reject();
    //   $scope.$apply()

    //   // needs error message ? //
    //   expect(element.isolateScope().loading).toBe(undefined)
    // });

  });

});

