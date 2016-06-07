'use strict';

describe('Reports', function () {

  var $scope,
      element,
      deferred,
      q,
      location,
      $httpBackend,
      routeParams,
      reportFactory;

  beforeEach(module('myApp', function($provide) {
    reportFactory = {
      create: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      get: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      clients: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
    };
    $provide.value("Report", reportFactory);

  }));

  beforeEach(module('components/locations/clients/_table.html'));

  beforeEach(inject(function($compile, $rootScope, $q, $location, $routeParams, $injector) {
    $httpBackend = $injector.get('$httpBackend');
    $httpBackend.whenGET('template/modal/backdrop.html').respond("");
    routeParams = $routeParams;
    routeParams.q = 'myquery';
    routeParams.interval = 'day';
    routeParams.distance = '15';
    $scope = $rootScope;
    q = $q;
    location = $location;
  }));

  describe("reports creation", function() {

    beforeEach(inject(function($compile, $rootScope, $q) {
      $scope.location = {slug: 123, id: 1};
      element = angular.element('<create-report type=\'email\'><create-report>');
      $compile(element)($rootScope);
      element.scope().$apply();
    }));

    it("should successfully create a report for the client!", function() {
      spyOn(reportFactory, 'create').andCallThrough();
      element.isolateScope().create();
      expect(element.isolateScope().report.type).toBe('email');
      element.isolateScope().report.email = 'simon@polkaspots.com';
      element.isolateScope().report.type = 'simon@polkaspots.com';
      element.isolateScope().createReport();
      expect(element.isolateScope().loading).toBe(true);

      // deferred.resolve();
      // $scope.$apply()
      // expect(element.isolateScope().loading).toBe(undefined);
    });
  });

  describe("client list, in selection box", function() {

    beforeEach(inject(function($compile, $rootScope, $q) {
      $scope.location = {slug: 123, id: 1};
      element = angular.element('<analytics><reports-clients></reports-clients></analytics>');
      $compile(element)($rootScope);
      element.scope().$apply();
    }));

    xit("should successfully list the clients!", function() {
      // spyOn(reportFactory, 'clients').andCallThrough();
      // expect(element.isolateScope().loading).toBe(true);
      // deferred.resolve();
      // $scope.$apply()
      // var results = { sessions: [ 0,0], _stats: {}, info: {}, uniques: [] };
      // deferred.resolve(results);
      // $scope.$apply()
      // expect(element.isolateScope().chart_series.Sessions).toBe(results.sessions);
      // expect(element.isolateScope()._stats).toBe(results._stats);
      // expect(element.isolateScope().chart_series.Uniques).toBe(results.uniques);
      // expect(element.isolateScope().info).toBe(results.info);
      // expect(element.isolateScope().loading).toBe(undefined);
    });
  });

  describe("sessions list, in selection box", function() {

    beforeEach(inject(function($compile, $rootScope, $q) {
      $scope.location = {slug: 123, id: 1};
      element = angular.element('<analytics><reports-sessions></reports-sessions></analytics>');
      $compile(element)($rootScope);
      element.scope().$apply();
    }));


    // Removed cos I dont know how to test a nested directive //
    xit("should list the sessions!", function() {
      spyOn(reportFactory, 'get').andCallThrough();
      expect(element.isolateScope().loading).toBe(true);
      var results = { timeline: { sessions: [ 0,0], uniques: [] }, _stats: {}, info: {}, uniques: [] };
      deferred.resolve(results);
      $scope.$apply()
      // expect(element.isolateScope().chart_series.Sessions).toBe(results.sessions);
      // expect(element.isolateScope()._stats).toBe(results._stats);
      // expect(element.isolateScope().chart_series.Uniques).toBe(results.uniques);
      // expect(element.isolateScope().info).toBe(results.info);
      // expect(element.isolateScope().loading).toBe(undefined);
    });

  });

  describe("impressions charts", function() {

    beforeEach(inject(function($compile, $rootScope, $q) {
      $scope.location = {slug: 123, id: 1};
      element = angular.element('<analytics><reports-impressions></reports-impressions></analytics>');
      $compile(element)($rootScope);
      element.scope().$apply();
    }));


    // Removed cos I dont know how to test a nested directive //
    xit("should list the sessions!", function() {
      spyOn(reportFactory, 'get').andCallThrough();
      expect(element.isolateScope().loading).toBe(true);
      var results = { timeline: { sessions: [ 0,0], uniques: [] }, _stats: {}, info: {}, uniques: [] };
      deferred.resolve(results);
      $scope.$apply()
      // expect(element.isolateScope().chart_series.Sessions).toBe(results.sessions);
      // expect(element.isolateScope()._stats).toBe(results._stats);
      // expect(element.isolateScope().chart_series.Uniques).toBe(results.uniques);
      // expect(element.isolateScope().info).toBe(results.info);
      // expect(element.isolateScope().loading).toBe(undefined);
    });

  });
})
