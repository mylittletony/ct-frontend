'use strict';

describe('audit', function () {

  var $scope, element, $routeParams, sessionFactory, q, deferred, $httpBackend,
  $location, emailFactory, reportsFactory, guestFactory;

  beforeEach(module('templates'));

  beforeEach(module('myApp', function($provide) {
    reportsFactory = {
      create: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    };
    sessionFactory = {
      query: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    };
    guestFactory = {
      get: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    };
    emailFactory = {
      get: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    };
    $provide.value("Session", sessionFactory);
    $provide.value("Email", emailFactory);
    $provide.value("Guest", guestFactory);
    $provide.value("Report", reportsFactory);
  }));

  beforeEach(inject(function($injector) {
    $httpBackend = $injector.get('$httpBackend');
    $httpBackend.whenGET('/translations/en_GB.json').respond("");
  }));

  describe('audit sessions test, requires audit', function() {
    beforeEach(inject(function($compile, $rootScope, $q, _$routeParams_, $injector, _$location_) {
      $scope = $rootScope;
      q = $q;
      $routeParams = _$routeParams_;
      $routeParams.start = '111';
      $routeParams.end = '222';
      $routeParams.client_mac = 'my-mac';
      $routeParams.location_name = 'my-location';
      $routeParams.username = 'my-user';
      $routeParams.q = 'my-filter';
      $routeParams.per = 100;
      $routeParams.page = 5;
      $location = _$location_;
      var elem = angular.element('<audit><audit-sessions></audit-sessions></audit>');
      element = $compile(elem)($rootScope);
      element.scope().$digest();
    }));

    it("should set the required scope vars", function() {
      spyOn(sessionFactory, 'query').and.callThrough()
      var auditScope = element.find('audit-sessions').isolateScope()

      expect(auditScope.client_mac).toEqual('my-mac');
      expect(auditScope.username).toEqual('my-user');
      expect(auditScope.location_name).toEqual('my-location');

      expect(auditScope.selectedItem).toEqual('my-location');

      // Because we send a q param //
      expect(auditScope.options.rowSelection).toEqual(false);

      expect(auditScope.query.order).toEqual('-acctstarttime');
      expect(auditScope.query.start).toEqual('111');
      expect(auditScope.query.end).toEqual('222');
      expect(auditScope.query.filter).toEqual('my-filter');
      expect(auditScope.query.limit).toEqual(100);
      expect(auditScope.query.page).toEqual(5);
    });

    it("should load the sessions API", function() {
      spyOn(sessionFactory, 'query').and.callThrough()
      var auditScope = element.find('audit-sessions').isolateScope()

      expect(auditScope.loading).toEqual(true);

      var results = { _links: { start: 111, end: 222 }, sessions: [123] };
      deferred.resolve(results);
      $scope.$apply()

      expect(auditScope.loading).toEqual(undefined);

      expect(auditScope.sessions).toEqual([123]);
      expect(auditScope._links.start).toEqual(111);
      expect(auditScope.query.start).toEqual('111');
      expect(auditScope.query.end).toEqual('222');
    });
  });

  describe('audit emails test, requires audit', function() {
    beforeEach(inject(function($compile, $rootScope, $q, _$routeParams_, $injector, _$location_) {
      $scope = $rootScope;
      q = $q;
      $routeParams = _$routeParams_;
      $routeParams.start = '111';
      $routeParams.end = '222';
      $routeParams.email = 'my-email';
      $routeParams.location_name = 'my-location';
      $routeParams.q = 'my-filter';
      $routeParams.per = 100;
      $routeParams.page = 5;
      $location = _$location_;
      var elem = angular.element('<audit><audit-emails></audit-emails></audit>');
      element = $compile(elem)($rootScope);
      element.scope().$digest();
    }));

    it("should set the required scope vars", function() {
      spyOn(emailFactory, 'get').and.callThrough()
      var auditScope = element.find('audit-emails').isolateScope()

      expect(auditScope.email).toEqual('my-email');
      expect(auditScope.location_name).toEqual('my-location');

      // Because we send an email in
      expect(auditScope.selectedItem).toEqual('my-email');

      expect(auditScope.query.order).toEqual('-created_at');
      expect(auditScope.query.start).toEqual('111');
      expect(auditScope.query.end).toEqual('222');
      expect(auditScope.query.filter).toEqual('my-filter');
      expect(auditScope.query.limit).toEqual(100);
      expect(auditScope.query.page).toEqual(5);
    });

    it("should load the emails API", function() {
      spyOn(emailFactory, 'get').and.callThrough()
      var auditScope = element.find('audit-emails').isolateScope()

      var results = { _links: { start: 111, end: 222 }, emails: [123], locations: [ { id: 1 }] };
      deferred.resolve(results);
      $scope.$apply()

      expect(auditScope.loading).toEqual(undefined);

      expect(auditScope.emails).toEqual([123]);
      expect(auditScope._links.start).toEqual(111);
      expect(auditScope.location.id).toEqual(1);
      expect(auditScope.query.start).toEqual('111');
      expect(auditScope.query.end).toEqual('222');
    });
  });

  describe('audit guests test, requires audit', function() {
    beforeEach(inject(function($compile, $rootScope, $q, _$routeParams_, $injector, _$location_) {
      $scope = $rootScope;
      q = $q;
      $routeParams = _$routeParams_;
      $routeParams.start = '111';
      $routeParams.end = '222';
      $routeParams.email = 'my-email';
      $routeParams.location_name = 'my-location';
      $routeParams.q = 'my-filter';
      $routeParams.per = 100;
      $routeParams.page = 5;
      $location = _$location_;
      var elem = angular.element('<audit><audit-guests></audit-guests></audit>');
      element = $compile(elem)($rootScope);
      element.scope().$digest();
    }));

    it("should set the required scope vars", function() {
      spyOn(guestFactory, 'get').and.callThrough()
      var auditScope = element.find('audit-guests').isolateScope()

      expect(auditScope.email).toEqual('my-email');
      expect(auditScope.location_name).toEqual('my-location');

      // Because we send an email in
      expect(auditScope.selectedItem).toEqual('my-email');

      expect(auditScope.query.order).toEqual('-created_at');
      expect(auditScope.query.start).toEqual('111');
      expect(auditScope.query.end).toEqual('222');
      expect(auditScope.query.filter).toEqual('my-filter');
      expect(auditScope.query.limit).toEqual(100);
      expect(auditScope.query.page).toEqual(5);
    });

    it("should load the guests API", function() {
      spyOn(guestFactory, 'get').and.callThrough()
      var auditScope = element.find('audit-guests').isolateScope()

      var results = { _links: {start: 111, end: 222}, guests: [{id: 123, location_id: 1}], locations: [ { id: 1 }] };
      deferred.resolve(results);
      $scope.$apply();

      expect(auditScope.loading).toEqual(undefined);

      expect(auditScope.guests[0].id).toEqual(123);
      expect(auditScope._links.start).toEqual(111);
      // expect(auditScope.location.id).toEqual(1);
      expect(auditScope.query.start).toEqual('111');
      expect(auditScope.query.end).toEqual('222');
    });
  });

  describe('range filter directive', function() {
    beforeEach(inject(function($compile, $rootScope, $q, _$routeParams_, $injector, _$location_) {
      $scope = $rootScope;
      q = $q;
      var elem = angular.element('<range-filter></range-filter>');
      element = $compile(elem)($rootScope);
      element.scope().$digest();
    }));

    // Not sure what to test here //
    it("should set the required scope vars", function() {
    });
  });

  describe('reports downloads directive', function() {
    beforeEach(inject(function($compile, $rootScope, $q, _$routeParams_, $injector, _$location_) {
      $scope = $rootScope;
      q = $q;
      var elem = angular.element('<audit-downloads></audit-downloads>');
      element = $compile(elem)($rootScope);
      element.scope().$digest();
    }));

    it("should set the required scope vars", function() {
      spyOn(reportsFactory, 'create').and.callThrough()
      var results = { a: 123 };
      deferred.resolve(results);
      $scope.$apply()

      // Also not sure what to test :|
      // expect(element.isolatedScope().test).toEqual(123)
    });
  });

});

