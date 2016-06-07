'use strict';

describe('Sessions', function () {

  var $scope,
      element,
      deferred,
      q,
      location,
      routeParams,
      $httpBackend,
      sessionFactory;

  beforeEach(module('myApp', function($provide) {
    sessionFactory = {
      query: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
    };
    $provide.value("Session", sessionFactory);

  }));

  beforeEach(module('components/locations/clients/_table.html'));
  beforeEach(module('components/reports/sessions/_index.html'));
  beforeEach(module('components/reports/sessions/_shared_table.html'));

  describe("sessions list", function() {

    beforeEach(inject(function($compile, $rootScope, $q, $location, $routeParams, $injector) {
      $httpBackend = $injector.get('$httpBackend');
      $httpBackend.whenGET('template/pagination/pagination.html').respond("");
      $httpBackend.whenGET('template/tooltip/tooltip-html-unsafe-popup.html').respond("");
      routeParams = $routeParams;
      routeParams.q = 'myquery';
      routeParams.interval = 'day';
      routeParams.username = 'simon';
      routeParams.page = 2
      $scope = $rootScope;
      q = $q;
      location = $location;
    }));

    describe("client list, in selection box", function() {

      beforeEach(inject(function($compile, $rootScope, $q) {
        $scope.location = {slug: 123, id: 1};
        element = angular.element('<sessions-list username="simon"></sessions-list>');
        $compile(element)($rootScope);
        element.scope().$apply();
      }));

      it("should successfully retrieve. the sessions for a username", function() {
        spyOn(sessionFactory, 'query').andCallThrough();
        expect(element.isolateScope().loading).toBe(true)
        var sessions = { sessions: [{username: 'simon'} ], _stats: {}}
        deferred.resolve(sessions);
        $scope.$apply()
        expect(element.isolateScope().loading).toBe(undefined);
        expect(element.isolateScope().sessions).toBe(sessions.sessions);
      });

      it("should set the filter params for the sessions", function() {
        spyOn(sessionFactory, 'query').andCallThrough();
        var start = 1419638400
        var end = 1426953556
        expect(element.isolateScope().loading).toBe(true)
        var sessions = { sessions: [{username: 'simon'} ], _stats: { start: start, end: end }, _links: {} }
        deferred.resolve(sessions);
        $scope.$apply()
        expect(element.isolateScope().loading).toBe(undefined);
        expect(element.isolateScope().sessions).toBe(sessions.sessions);

        expect(element.isolateScope().page).toBe(2);
        expect(element.isolateScope().username).toBe('simon');
        expect(element.isolateScope().predicate).toBe('-starttime');
        expect(element.isolateScope()._stats).toBe(sessions._stats);
        // expect(element.isolateScope().start).toBe(start);

        element.isolateScope().updatePage();
      });

      it("should set the filter username for the sessions", function() {
        spyOn(sessionFactory, 'query').andCallThrough();
        var start = 1419638400
        var end = 1426953556
        expect(element.isolateScope().loading).toBe(true)
        var sessions = { sessions: [{username: 'simon'} ], _stats: { start: start, end: end }, _links: {} }
        deferred.resolve(sessions);
        $scope.$apply()
        expect(element.isolateScope().loading).toBe(undefined);
        expect(element.isolateScope().sessions).toBe(sessions.sessions);

        expect(element.isolateScope().page).toBe(2);
        expect(element.isolateScope().username).toBe('simon');
        expect(element.isolateScope().predicate).toBe('-starttime');
        expect(element.isolateScope()._stats).toBe(sessions._stats);
        // expect(element.isolateScope().start).toBe(start);

        element.isolateScope().filterUser('lydia');
        expect(element.isolateScope().username).toBe('lydia');
      });


    })
  })

  describe("sessions online", function() {

    beforeEach(inject(function($compile, $rootScope, $q, $location, $routeParams, $injector) {
      $httpBackend = $injector.get('$httpBackend');
      $httpBackend.whenGET('template/pagination/pagination.html').respond("");
      $httpBackend.whenGET('template/tooltip/tooltip-html-unsafe-popup.html').respond("");
      routeParams = $routeParams;
      routeParams.q = 'myquery';
      routeParams.interval = 'day';
      routeParams.username = 'simon';
      routeParams.page = 2
      $scope = $rootScope;
      q = $q;
      location = $location;
    }));

    describe("client list, in selection box", function() {

      beforeEach(inject(function($compile, $rootScope, $q) {
        $scope.location = {slug: 123, id: 1};
        element = angular.element('<sessions-online username="simon"></sessions-online>');
        $compile(element)($rootScope);
        element.scope().$apply();
      }));

      it("should successfully retrieve. the sessions for a username", function() {
        spyOn(sessionFactory, 'query').andCallThrough();
        expect(element.isolateScope().loading).toBe(true)
        var sessions = { online: [{username: 'simon'} ], _stats: {}}
        deferred.resolve(sessions);
        $scope.$apply()
        expect(element.isolateScope().loading).toBe(undefined);
        expect(element.isolateScope().online).toBe(sessions.online);
      });

    });

  });

})
