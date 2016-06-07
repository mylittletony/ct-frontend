'use strict';

describe('Guests', function () {

  var $scope,
      element,
      deferred,
      q,
      location,
      routeParams,
      $httpBackend,
      sessionFactory,
      guestFactory;

  beforeEach(module('myApp', function($provide) {
    sessionFactory = {
      query: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    };
    guestFactory = {
      update: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      query: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      get: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
    };
    $provide.value("Guest", guestFactory);
    $provide.value("Session", sessionFactory);

  }));

  beforeEach(module('components/reports/guests/_index.html'));
  beforeEach(module('components/reports/guests/_show.html'));
  beforeEach(module('components/reports/sessions/_shared_table.html'));

  describe("guests list", function() {

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

    describe("guest list", function() {

      beforeEach(inject(function($compile, $rootScope, $q) {
        $scope.location = {slug: 123, id: 1};
        element = angular.element('<guests-list></guests-list>');
        $compile(element)($rootScope);
        element.scope().$apply();
      }));

      it("should successfully retrieve. the guests", function() {
        spyOn(guestFactory, 'query').andCallThrough();
        expect(element.isolateScope().loading).toBe(true)
        var guests = { guests: [{username: 'simon'} ], _stats: {}}
        deferred.resolve(guests);
        $scope.$apply()
        expect(element.isolateScope().loading).toBe(undefined);
        expect(element.isolateScope().guests).toBe(guests.guests);
        expect(element.isolateScope().predicate.length).toBe(2);
      });

    });

    describe("guest show", function() {

      beforeEach(inject(function($compile, $rootScope, $q) {
        $scope.location = {slug: 123, id: 1};
        element = angular.element('<guest-show></guest-show>');
        $compile(element)($rootScope);
        element.scope().$apply();
      }));

      it("should successfully retrieve. the guests", function() {
        spyOn(guestFactory, 'get').andCallThrough();
        spyOn(sessionFactory, 'query').andCallThrough();
        expect(element.isolateScope().loading).toBe(true)
        var guest = {username: 'simon'}
        deferred.resolve(guest);
        $scope.$apply();
        expect(element.isolateScope().loading).toBe(undefined);
        expect(element.isolateScope().guest).toBe(guest);
        expect(element.isolateScope().details_loaded).toBe(true);
      });

      it("should successfully retrieve the guest's session data! FUCK YEA", function() {
        spyOn(guestFactory, 'get').andCallThrough();
        expect(element.isolateScope().loading).toBe(true);
        var guest = {username: 'simon'};
        deferred.resolve(guest);
        $scope.$apply();
        expect(element.isolateScope().loading).toBe(undefined);
        expect(element.isolateScope().guest).toBe(guest);

        element.isolateScope().loadSessions();
        var sessions = { sessions: [{username: 'simon'} ], _stats: {}};
        deferred.resolve(sessions);
        $scope.$apply();
        expect(element.isolateScope().sessions).toBe(sessions.sessions);
        expect(element.isolateScope().loading).toBe(undefined);
        expect(element.isolateScope().details_loaded).toBe(undefined);
        expect(element.isolateScope().sessions_loaded).toBe(true);
      });

      it("should hide the session and display the details and also the notes", function() {
        spyOn(guestFactory, 'get').andCallThrough();
        expect(element.isolateScope().loading).toBe(true);
        var guest = {username: 'simon'};
        deferred.resolve(guest);
        $scope.$apply();
        expect(element.isolateScope().loading).toBe(undefined);
        expect(element.isolateScope().details_loaded).toBe(true);

        element.isolateScope().loadSessions();
        deferred.reject();
        $scope.$apply();
        expect(element.isolateScope().details_loaded).toBe(undefined);
        expect(element.isolateScope().notes_loaded).toBe(undefined);
        expect(element.isolateScope().sessions_loaded).toBe(true);

        element.isolateScope().loadDetails();
        expect(element.isolateScope().details_loaded).toBe(true);
        expect(element.isolateScope().sessions_loaded).toBe(undefined);

        element.isolateScope().loadNotes();
        expect(element.isolateScope().notes_loaded).toBe(true);
        expect(element.isolateScope().details_loaded).toBe(undefined);
        expect(element.isolateScope().sessions_loaded).toBe(undefined);
      });

      it("should update the guests", function() {
        spyOn(guestFactory, 'get').andCallThrough();
        spyOn(guestFactory, 'update').andCallThrough();
        expect(element.isolateScope().loading).toBe(true);
        var guest = {username: 'simon'};
        deferred.resolve(guest);
        $scope.$apply();

        element.isolateScope().updateGuest();
        deferred.resolve();
        $scope.$apply();
      });

      it("should unregister the guest", function() {
        spyOn(window, 'confirm').andReturn(true);
        spyOn(guestFactory, 'get').andCallThrough();
        spyOn(guestFactory, 'update').andCallThrough();
        expect(element.isolateScope().loading).toBe(true);
        var guest = {username: 'simon'};
        deferred.resolve(guest);
        $scope.$apply();

        element.isolateScope().unregister();
        deferred.resolve();
        $scope.$apply();
      });

      it("should successfully retrieve. the guests but not the session data, 404", function() {
        spyOn(guestFactory, 'get').andCallThrough();
        expect(element.isolateScope().loading).toBe(true)
        var guest = {username: 'simon'}
        deferred.resolve(guest);
        $scope.$apply()
        expect(element.isolateScope().loading).toBe(undefined);
        expect(element.isolateScope().guest).toBe(guest);

        var sessions = { sessions: [{username: 'simon'} ], _stats: {}}
        deferred.reject();
        $scope.$apply()
        expect(element.isolateScope().sessions).toBe(undefined);
        // expect(element.isolateScope().loading).toBe(undefined);
      });

    });
  })

})
