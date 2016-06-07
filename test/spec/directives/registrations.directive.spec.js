'use strict';

describe('registrations creation, listing', function () {

  var $scope,
      element,
      deferred,
      q,
      $location,
      holdingFactory,
      $cookies,
      inviteFactory,
      brandFactory,
      routeParams,
      registrationFactory;

  beforeEach(module('components/registrations/_flow.html'));

  beforeEach(module('myApp', function($provide) {
    brandFactory = {
      return: { name: 1231231 }
      // name: function () {
      //   return:
      // }
    };
    inviteFactory = {
      query: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    };
    holdingFactory = {
      destroy: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      get: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      update: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      create: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    };
    registrationFactory = {
      create: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    };
    $provide.value("BrandName", brandFactory);
    $provide.value("Registration", registrationFactory);
    $provide.value("Holding", holdingFactory);
    $provide.value("Invite", inviteFactory);
  }));

  // beforeEach(module('components/registrations/details.html'));

  describe('registrations creation, listing', function () {


    beforeEach(inject(function($compile, $rootScope, $q, $location, $routeParams) {
      $scope = $rootScope;
      routeParams = $routeParams;
      q = $q;
      element = angular.element('<register-user></register-user>');
      $compile(element)($rootScope)
      element.scope().$apply();
    }))

    it("should list the registrations for a location", function() {
      spyOn(registrationFactory, 'create').andCallThrough()
      // spyOn(meFactory, 'get').andCallThrough()
      var user = { username: 'simon', rdir: 777 }
      element.isolateScope().register(user)
      expect(element.isolateScope().creating).toBe(true)
      deferred.resolve(user);
      $scope.$apply()
      // expect(element.isolateScope().user.username).toBe('simon')
    })

  })

  describe('registrations creation, listing', function () {

    beforeEach(inject(function($compile, $rootScope, $q, $location, $routeParams) {
      $scope = $rootScope;
      routeParams = $routeParams;
      routeParams.invite_token = 'regtoken'; // <------------------------------
      q = $q;
      element = angular.element('<register-user></register-user>');
      $compile(element)($rootScope)
      element.scope().$apply();
    }));

    it("should find a token in the url and check with ct if valid", function() {
      spyOn(registrationFactory, 'create').andCallThrough()
      spyOn(inviteFactory, 'query').andCallThrough()

      var invite = { email: 'simon@ps.com' };
      expect(element.isolateScope().invite_token).toBe('regtoken');
      expect(element.isolateScope().checking).toBe(true);

      deferred.resolve(invite);
      $scope.$apply();
      expect(element.isolateScope().invite).toBe('simon@ps.com');
      expect(element.isolateScope().user.email).toBe('simon@ps.com');
      expect(element.isolateScope().checking).toBe(undefined);
    })

    it("should not find a token in the url and check with ct if valid", function() {
      spyOn(registrationFactory, 'create').andCallThrough()
      spyOn(inviteFactory, 'query').andCallThrough()

      var invite = { email: 'simon@ps.com' }
      expect(element.isolateScope().invite_token).toBe('regtoken');
      expect(element.isolateScope().checking).toBe(true);

      deferred.reject(invite);
      $scope.$apply();
      expect(element.isolateScope().checking).toBe(undefined);
      expect(element.isolateScope().inviteerrors).toBe(true);
    })

    it("should send the invitation token to CT", function() {
      spyOn(registrationFactory, 'create').andCallThrough();
      var user = { username: 'simon', rdir: 777 };
      element.isolateScope().register(user);
      expect(user.invite_token).toBe('regtoken');
      expect(element.isolateScope().creating).toBe(true);
      deferred.resolve(user);
      $scope.$apply();
      expect(element.isolateScope().creating).toBe(undefined);
    });

    it("should fail to invite - 422", function() {
      spyOn(registrationFactory, 'create').andCallThrough();
      var user = { username: 'simon', rdir: 777 };
      element.isolateScope().register(user);
      expect(user.invite_token).toBe('regtoken');
      expect(element.isolateScope().creating).toBe(true);
      deferred.reject({data: [{username: 123123}]});
      $scope.$apply();
      expect(element.isolateScope().creating).toBe(undefined);
      expect(element.isolateScope().errors.length).toBe(1);
    })

  })
  describe('registrations creation, listing from new customer callback', function () {


    beforeEach(inject(function($compile, $rootScope, $q, $location, $routeParams) {
      $scope = $rootScope;
      routeParams = $routeParams;
      routeParams.customer_token = 'regtoken'; // <------------------------------
      q = $q;
      element = angular.element('<register-user></register-user>');
      $compile(element)($rootScope)
      element.scope().$apply();
    }))

    it("should find the new customer token in the url", function() {
      spyOn(registrationFactory, 'create').andCallThrough()
      var user = { username: 'simon', rdir: 777 }
      element.isolateScope().register(user)
      expect(user.customer_token).toBe('regtoken')
      expect(element.isolateScope().creating).toBe(true)
      deferred.resolve(user);
      $scope.$apply()
      expect(element.isolateScope().creating).toBe(undefined)
    })

  })

  describe('fancy sign-up process - creates the invite', function () {

    beforeEach(inject(function($compile, $rootScope, $q, $location, $routeParams, _$cookies_) {
      $scope = $rootScope;
      $cookies = _$cookies_;
      routeParams = $routeParams;
      routeParams.token = 'regtoken'; // <------------------------------
      q = $q;
      element = angular.element('<create-holding></create-holding>');
      $compile(element)($rootScope)
      element.scope().$apply();
    }))

    it("should create a new holding account", function() {
      spyOn(holdingFactory, 'create').andCallThrough()

      var account = { email: 'simon@ps.com' };
      element.isolateScope().create(account.email)
      expect(element.isolateScope().creating).toBe(true);

      deferred.resolve();
      $scope.$apply();
      expect(element.isolateScope().invited).toBe(true);
      expect(element.isolateScope().creating).toBe(undefined);
      expect(element.isolateScope().cookies).not.toBe(undefined);
    })
  })

  describe('fancy sign-up process - uses the token and updates the flow etc.', function () {

    beforeEach(inject(function($compile, $rootScope, $q, $routeParams, _$location_) {
      $scope = $rootScope;
      $scope.holding = { company_name: 123 };
      $location = _$location_;
      routeParams = $routeParams;
      routeParams.token = 'regtoken'; // <------------------------------
      q = $q;
      element = angular.element('<build-flow></build-flow>');
      $compile(element)($rootScope);
      element.scope().$apply();
    }));

    it("should get a holding account", function() {
      spyOn(holdingFactory, 'get').andCallThrough();

      expect(element.isolateScope().loading).toBe(true);

      deferred.resolve({stage: 1});
      $scope.$apply();
      expect(element.isolateScope().loading).toBe(undefined);
      expect(element.isolateScope().holding.stage).toBe(1);
    });

    it("should not get a holding account and redirect to create", function() {
      spyOn(holdingFactory, 'get').andCallThrough();
      spyOn(holdingFactory, 'update').andCallThrough();

      expect(element.isolateScope().loading).toBe(true);

      deferred.reject();
      $scope.$apply();
      expect($location.path()).toBe('/create');
    });

    it("should update a holding account", function() {
      spyOn(holdingFactory, 'update').andCallThrough();
      element.isolateScope().holding = {};
      element.isolateScope().update();
      expect(element.isolateScope().updating).toBe(true);
      element.isolateScope().holding = {};

      var h = { stage: 2 }
      deferred.resolve(h);
      $scope.$apply();
      expect(element.isolateScope().updating).toBe(undefined);
      expect(element.isolateScope().holding.stage).toBe(2);
    });

    it("should not update a holding account", function() {
      spyOn(holdingFactory, 'update').andCallThrough();
      element.isolateScope().holding = {};
      element.isolateScope().update();
      expect(element.isolateScope().updating).toBe(true);

      deferred.reject({data: {errors: [123]} });
      $scope.$apply();
      expect(element.isolateScope().updating).toBe(undefined);
      expect(element.isolateScope().errors[0]).toBe('errors 123');
    });

  });

  // describe('fancy sign-up process - loads the success page and also deletes the token.', function () {

  //   beforeEach(inject(function($compile, $rootScope, $q, $routeParams, _$location_) {
  //     $scope = $rootScope;
  //     $location = _$location_;
  //     routeParams = $routeParams;
  //     routeParams.token = 'regtoken'; // <------------------------------
  //     q = $q;
  //     element = angular.element('<success-signup></success-signup>');
  //     $compile(element)($rootScope);
  //     element.scope().$apply();
  //   }));

  //   it("should delete a holding account", function() {
  //     spyOn(holdingFactory, 'destroy').andCallThrough();
  //     deferred.resolve({data: {errors: [123]} });
  //     $scope.$apply();
  //     expect(element.isolateScope().deleted).toBe(true);
  //   });
  // });

});
