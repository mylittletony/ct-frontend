'use strict';

describe('boxes', function () {

  var $scope, element, $routeParams, userFactory, boxFactory, q, deferred, $httpBackend, reportFactory, zoneFactory;

  beforeEach(module('templates'));

  beforeEach(module('myApp', function($provide) {
    boxFactory = {
      get: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      update: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      destroy: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
    };
    zoneFactory = {
      get: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
    };
    reportFactory = {
      clientstats: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
    };
    userFactory = {
      query: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
    };
    $provide.value("User", userFactory);
    $provide.value("Box", boxFactory);
    $provide.value("Report", reportFactory);
    $provide.value("Zone", zoneFactory);
  }));

  beforeEach(inject(function($injector) {
    $httpBackend = $injector.get('$httpBackend');
    $httpBackend.whenGET('/translations/en_GB.json').respond("");
  }));

  describe('displays a box', function() {
    beforeEach(inject(function($compile, $rootScope, $q, _$routeParams_, $injector) {
      $scope = $rootScope;
      q = $q;
      $routeParams = _$routeParams_;
      $routeParams.id = 111;
      $routeParams.period = '11h';
      var elem = angular.element('<client-chart><show-box></show-box></client-chart>');
      element = $compile(elem)($rootScope);
      element.scope().$digest();
    }));

    it("should set the default scope vars", function() {
      var boxScope = element.find('show-box').isolateScope()
      spyOn(boxFactory, 'get').and.callThrough()
      spyOn(reportFactory, 'clientstats').and.callThrough()
      expect(boxScope.streamingUpdates).toEqual(true)
      expect(boxScope.location.slug).toEqual(111)
      expect(boxScope.period).toEqual('11h')

      var box = { cucumber: true, id: 123 };
      deferred.resolve(box);
      $scope.$apply()

      expect(boxScope.menu.length).toBe(7);
      expect(boxScope.menu[0].type).toBe('edit');
      expect(boxScope.menu[0].name).toBe('Edit');
      expect(boxScope.menu[1].type).toBe('reboot');
      expect(boxScope.menu[1].name).toBe('Reboot');
      expect(boxScope.menu[2].type).toBe('payloads');
      expect(boxScope.menu[2].name).toBe('Payloads');
      expect(boxScope.menu[3].type).toBe('changelog');
      expect(boxScope.menu[3].name).toBe('Changelog');
      expect(boxScope.menu[4].type).toBe('delete');
      expect(boxScope.menu[4].name).toBe('Delete');
      expect(boxScope.menu[5].type).toBe('resync');
      expect(boxScope.menu[5].name).toBe('Resync');
      expect(boxScope.menu[6].type).toBe('reset');
      expect(boxScope.menu[6].name).toBe('Reset');
    });

    xit("should load the boxe, zones and chart", function() {
    });

    xit("set the preferences", function() {
    });

    xit("get the cookes to set the zone popup", function() {
    });

    xit("should mute the box", function() {
    });

    xit("should update the period", function() {
    });

    xit("should refresh the page", function() {
    });

    xit("should enable disable streaming updates", function() {
    });

  });

});

