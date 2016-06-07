'use strict';

describe('triggers creation, listing', function () {

  var $scope,
      element,
      deferred,
      q,
      $routeParams,
      location,
      locationFactory,
      $httpBackend,
      triggerFactory;

  beforeEach(module('myApp', function($provide) {
    locationFactory = {
      get: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    };
    triggerFactory = {
      destroy: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
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
      create: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    };
    $provide.value("Trigger", triggerFactory);
    $provide.value("Location", locationFactory);
  }));

  beforeEach(module('components/locations/triggers/_new.html'));
  beforeEach(module('components/locations/triggers/list.html'));

  describe('triggers listing', function () {

    beforeEach(inject(function($compile, $rootScope, $q, _$routeParams_, $injector) {
      $scope = $rootScope;
      $routeParams = _$routeParams_;
      $routeParams.location_id = 123123123;
      $scope.box = {};
      q = $q;
      $scope.location = { slug: 456, id: 123 }
      element = angular.element('<list-triggers></list-triggers>');
      $compile(element)($rootScope)
      element.scope().$digest();
    }))

    it("should list the triggers for a location", function() {
      spyOn(triggerFactory, 'query').andCallThrough();
      var trigger = { triggers: [ { trigger_name: 'lobby'} ], _info: {} };
      expect(element.isolateScope().loading).toBe(true)
      deferred.resolve(trigger);
      $scope.$digest()
      expect(element.isolateScope().triggers[0].trigger_name).toBe(trigger.triggers[0].trigger_name);
      expect(element.isolateScope().loading).toBe(undefined);
    })

  })

  describe('triggers creation', function () {

    beforeEach(inject(function($compile, $rootScope, $q, _$routeParams_, $injector) {
      $scope = $rootScope;
      $routeParams = _$routeParams_;
      $routeParams.location_id = 123123123;
      $scope.box = {};
      q = $q;
      $scope.location = { slug: 456, id: 123 }
      element = angular.element('<new-trigger></new-trigger>');
      $compile(element)($rootScope)
      element.scope().$digest();
    }))

    it("should create the triggers for a location", function() {
      spyOn(triggerFactory, 'get').andCallThrough();
      var triggers = { 'All': 'all', 'Boxes' : 'box', 'Clients': 'client', 'Email': 'email', 'Guests': 'guest', 'Locations': 'location', 'Networks': 'network', 'Splash': 'splash', 'Social': 'social', 'Vouchers': 'voucher', 'Zones': 'zone' };
      expect(element.isolateScope().trigger.type).toBe('all');
      expect(JSON.stringify(element.isolateScope().triggers)).toBe(JSON.stringify(triggers));
    });

  })
})

describe('trigger history', function () {

  var $scope,
      element,
      deferred,
      q,
      $routeParams,
      location,
      locationFactory,
      $httpBackend,
      triggerHistoryFactory;

  beforeEach(module('myApp', function($provide) {
    locationFactory = {
      get: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    };
    triggerHistoryFactory = {
      query: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      get: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
    };
    $provide.value("TriggerHistory", triggerHistoryFactory);
    $provide.value("Location", locationFactory);
  }));

  describe('trigger history listing', function () {

    beforeEach(inject(function($compile, $rootScope, $q, _$routeParams_, $injector) {
      $scope = $rootScope;
      $routeParams = _$routeParams_;
      $routeParams.location_id = 123123123;
      $httpBackend = $injector.get('$httpBackend');
      $httpBackend.whenGET('template/pagination/pagination.html').respond("");
      $scope.box = {};
      q = $q;
      $scope.location = { slug: 456, id: 123 }
      element = angular.element('<list-trigger-history></list-trigger-history>');
      $compile(element)($rootScope)
      element.scope().$digest();
    }))

    it("should list the triggers for a location", function() {
      spyOn(triggerHistoryFactory, 'query').andCallThrough();
      var h = { history: [ { success: true } ], _info: {} };
      expect(element.isolateScope().loading).toBe(true)
      deferred.resolve(h);
      $scope.$digest()
      expect(element.isolateScope().histories[0].success).toBe(true);
      expect(element.isolateScope().loading).toBe(undefined);
    })

  })

  describe('trigger history show', function () {

    beforeEach(inject(function($compile, $rootScope, $q, _$routeParams_, $injector) {
      $scope = $rootScope;
      $routeParams = _$routeParams_;
      $routeParams.location_id = 123123123;
      $scope.box = {};
      q = $q;
      $scope.location = { slug: 456, id: 123 }
      element = angular.element('<show-trigger-history></show-trigger-history>');
      $compile(element)($rootScope)
      element.scope().$digest();
    }));

    it("should show the history", function() {

      window.hljs = {
        highlight: function() {
          return jasmine.createSpy();
        }
      };

      spyOn(triggerHistoryFactory, 'get').andCallThrough();
      var h = { success: true };
      expect(element.isolateScope().loading).toBe(true)
      deferred.resolve(h);
      $scope.$digest();
      expect(element.isolateScope().loading).toBe(undefined);
    })

  })

})
