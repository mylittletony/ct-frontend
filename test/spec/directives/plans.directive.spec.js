'use strict';

describe('versions revert', function () {

  var $scope,
      element,
      deferred,
      client,
      $p,
      $pusher,
      routeParams,
      q,
      location,
      subFactory,
      authFactory,
      windowMock,
      planFactory;

  beforeEach(module('myApp', function($provide) {
    subFactory = {
      create: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    };
    authFactory = {
      currentUser: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    };
    planFactory = {
      query: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      get: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    };
    $provide.value("Plan", planFactory);
    $provide.value("Subscription", subFactory);
    $provide.value("Auth", authFactory);

    windowMock = {
      client: function () {
        // deferred = q.defer();
        // return {$promise: deferred.promise};
      }
    };
    // substitute all dependencies with mocks
    // $provide.value('$window', windowMock);

    // function FakeBaseChannel(channelName) {
    //   this.name = channelName;
    // }

    // function FakePusherClient(apiKey) {
    //   this.apiKey = apiKey;
    //   this.connection = { bind_all: jasmine.createSpy('bind_all') };
    //   this.channels = {};
    //   this.callbacks = {};
    //   this.global_callbacks = [];
    // }

    // FakePusherClient.prototype = {
    //   bind: jasmine.createSpy('bind').and.callFake(function (eventName, callback) {
    //     this.callbacks[eventName] = callback;
    //   }),
    //   bind_all: jasmine.createSpy('bind_all').and.callFake(function (callback) {
    //     this.global_callbacks.push(callback);
    //   }),
    //   channel: function (channelName) { return this.channels[channelName]; },
    //   allChannels: jasmine.createSpy('allChannels').and.callFake(function () { return this.channels; }),
    //   subscribe: jasmine.createSpy('subscribe').and.callFake(function (channelName) {
    //     var ch = new FakeBaseChannel(channelName);
    //     this.channels[channelName] = ch;
    //     return ch;
    //   }),
    //   unsubscribe: jasmine.createSpy('unsubscribe'),
    //   disconnect: jasmine.createSpy('disconnect'),
    //   handleEvent: function (eventName, data) { this.callbacks[eventName](data); },
    //   handleGlobalEvent: function (payload) {
    //     for (var i = 0; i < this.global_callbacks.length; i++) {
    //       this.global_callbacks[i](payload.eventName, payload.data);
    //     }
    //   }
    // }

    // client = new FakePusherClient('123456789');
    // $provide.value("client", FakePusherClient);
    // $p = $pusher(client);
  }));

  describe('plan lists', function () {

    beforeEach(inject(function($compile, $rootScope, $q, $routeParams, $location) {
      $scope = $rootScope;
      location = $location;
      q = $q;
      element = angular.element('<plans></plans>');
      $compile(element)($rootScope)
    }))

    xit("should get the plans", function() {
      var plan = { plans: [ { plan_name: 'large' } ] }
      spyOn(planFactory, 'query').andCallThrough()
      expect(element.isolateScope().loading).toBe(true);
      deferred.resolve(plan);
      $scope.$apply()
      expect(element.isolateScope().plans[0].plan_name).toBe(plan.plans[0].plan_name)
    })

    xit("should swap to monthly plans", function() {
      var plan = { plans: [ { plan_name: 'large' } ] }
      spyOn(planFactory, 'query').andCallThrough()
      expect(element.isolateScope().loading).toBe(true);
      deferred.resolve(plan);
      $scope.$apply()
      expect(element.isolateScope().plans[0].plan_name).toBe(plan.plans[0].plan_name)

      element.isolateScope().monthly()
      expect(element.isolateScope().period).toBe('monthly')

      element.isolateScope().yearly()
      expect(element.isolateScope().period).toBe('yearly')
    })

    xit("should add the plan to the cart and redirect to the payment page", function() {
      var plan = { plans: [ { plan_name: 'large' } ] }
      spyOn(planFactory, 'query').andCallThrough()
      spyOn(subFactory, 'create').andCallThrough()
      expect(element.isolateScope().loading).toBe(true);
      deferred.resolve(plan);
      $scope.$apply()
      expect(element.isolateScope().plans[0].plan_name).toBe(plan.plans[0].plan_name)

      element.isolateScope().choosePlan('someid')
      deferred.resolve();
      $scope.$apply()

      expect(location.path()).toBe('/plans/someid')
    })
  })

  describe('plan show and choose', function () {

    beforeEach(inject(function($compile, $rootScope, $q, $routeParams, $location, _$window_) {
      $scope = $rootScope;

      function FakeBaseChannel(channelName) {
        this.name = channelName;
        this.members = { me: { user_id: 1 } };
        this.callbacks = {};
      }

      function FakePusherClient(apiKey) {
        this.apiKey = apiKey;
        this.connection = { bind_all: jasmine.createSpy('bind_all') };
        this.channels = {};
        this.callbacks = {};
        this.global_callbacks = [];
      }

      FakePusherClient.prototype = {
        bind: jasmine.createSpy('bind').andCallThrough(),
        channel: function (channelName) { return this.channels[channelName]; },
        subscribe: jasmine.createSpy('subscribe').andCallFake(function (channelName) {
          var ch = new FakeBaseChannel(channelName);
          this.channels[channelName] = ch;
          return ch;
        }),
        unsubscribe: jasmine.createSpy('unsubscribe'),
        disconnect: jasmine.createSpy('disconnect'),
        handleEvent: function (eventName, data) { this.callbacks[eventName](data); },
        handleGlobalEvent: function (payload) {
          for (var i = 0; i < this.global_callbacks.length; i++) {
            this.global_callbacks[i](payload.eventName, payload.data);
          }
        }
      }

      FakeBaseChannel.prototype = {
        bind: jasmine.createSpy('bind').andCallFake(function (eventName, callback) {
          this.callbacks[eventName] = callback;
        }),
        trigger: jasmine.createSpy('trigger'),
        handleEvent: function (eventName, data) { this.callbacks[eventName](data); }
      }

      // var coupon = { description: 123, redeem_by: 1423326462 }
      $scope.user = {}
      $scope.user.active_coupons = 1423326462;
      window.client = new FakePusherClient('123');
      location = $location;
      q = $q;
      element = angular.element('<choose-plan></choose-plan>');
      $compile(element)($rootScope)

    }))

    xit("should get the plans", function() {
      spyOn(planFactory, 'get').andCallThrough()
      spyOn(subFactory, 'create').andCallThrough()
      var plan = { plan: { plan_name: 'large' }, user: { simon: 'says' } }
      deferred.resolve(plan);
      $scope.$apply()
      expect(element.isolateScope().plan).toBe(plan.plan)
      expect(element.isolateScope().user).toBe(plan.user)
    })

    xit("should submit the token to CT", function() {
      var plan = { plan: { plan_name: 'large' }, user: { simon: 'says' } }
      spyOn(subFactory, 'create').andCallThrough()
      deferred.resolve(plan);
      $scope.$apply()

      var code = 123;
      var result = {};
      element.isolateScope().stripeCallback(code, result);
      $scope.$apply()
      expect(element.isolateScope().user.subscribing).toBe(true);

      element.isolateScope().submit();
      $scope.$apply()
      deferred.resolve();
      $scope.$apply()
      // expect(element.isolateScope().user.subscribing).toBe(undefined);
    })

    xit("should NOT submit the token to CT - Stripe Failure", function() {
      var plan = { plan: { plan_name: 'large' }, user: { simon: 'says' } }
      spyOn(subFactory, 'create').andCallThrough()
      deferred.resolve(plan);
      $scope.$apply()

      var code = 123;
      var result = {error: { message:'Error Message'}};
      element.isolateScope().stripeCallback(code, result);
      $scope.$apply()
      expect(element.isolateScope().user.subscribing).toBe(undefined);
      expect(element.isolateScope().user.errors).toBe('Error Message');

    });

    it("should NOT submit the token to CT - CT Failure", function() {
      var coupon = { description: 123, redeem_by: 1423326462 }
      var plan = { plan: { plan_name: 'large' }, user: { simon: 'says'  } }
      spyOn(subFactory, 'create').andCallThrough()
      spyOn(authFactory, 'currentUser').andCallThrough()
      deferred.resolve(plan);
      $scope.$apply()

      var code = 123;
      var result = {};
      var errors = { data: { message: "Error Message" } }
      element.isolateScope().stripeCallback(code, result);
      $scope.$apply()
      expect(element.isolateScope().user.subscribing).toBe(true);

      element.isolateScope().submit();
      $scope.$apply()
      deferred.reject(errors);
      $scope.$apply()
      expect(element.isolateScope().user.subscribing).toBe(undefined);
      expect(element.isolateScope().user.errors).toBe('Error Message');
    });

  });

})
