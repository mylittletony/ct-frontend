'use strict';

describe('users directive tests', function () {

  var $scope,
      element,
      deferred,
      q,
      location,
      $httpBackend,
      routeParams,
      locationFactory,
      webhookFactory,
      subFactory,
      versionFactory,
      integrationFactory,
      userFactory;

  beforeEach(module('myApp', function($provide) {
    integrationFactory = {
      get: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      query: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      destroy: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      update: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    };
    versionFactory = {
      query: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    };
    locationFactory = {
      all: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    };
    userFactory = {
      sessions: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      query: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      password: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    };
    webhookFactory = {
      get: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      create: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      destroy: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    };
    subFactory = {
      destroy: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    };
    $provide.value("Subscription", subFactory);
    $provide.value("Webhook", webhookFactory);
    $provide.value("User", userFactory);
    $provide.value("Location", locationFactory);
    $provide.value("Integration", integrationFactory);
    $provide.value("Version", versionFactory);
  }));

  describe('listing users', function () {

    beforeEach(inject(function($compile, $rootScope, $q, $injector) {
      $scope = $rootScope;
      q = $q;
      $httpBackend = $injector.get('$httpBackend');
      $httpBackend.whenGET('template/pagination/pagination.html').respond("");
      element = angular.element('<list-users></list-users>');
      $compile(element)($rootScope)
      element.scope().$apply();
    }))

    it("should successfully list all users", function() {
      spyOn(userFactory, 'query').andCallThrough()
      expect(element.isolateScope().loading).toBe(true);
      var users = { users: [{password: 123, current_password: 456, slug: 123}]};
      // element.isolateScope().update(user);
      // $scope.$apply();
      // expect(element.isolateScope().loading).toBe(true);

      deferred.resolve(users);
      $scope.$apply();
      expect(element.isolateScope().loading).toBe(undefined);
      expect(element.isolateScope().users).toBe(users.users);
    })

  });

  describe('user sessions', function () {

    beforeEach(inject(function($compile, $rootScope, $q, $injector) {
      $scope = $rootScope;
      q = $q;
      // $httpBackend = $injector.get('$httpBackend');
      // $httpBackend.whenGET('template/pagination/pagination.html').respond("");
      element = angular.element('<user-sessions></user-sessions>');
      $compile(element)($rootScope)
      element.scope().$apply();
    }))

    it("should successfully list all user sessions", function() {
      spyOn(userFactory, 'sessions').andCallThrough()
      expect(element.isolateScope().loading).toBe(true);
      var sessions = { sessions: [{password: 123, current_password: 456, slug: 123}]};
      // element.isolateScope().update(user);
      // $scope.$apply();
      // expect(element.isolateScope().loading).toBe(true);

      deferred.resolve(sessions);
      $scope.$apply();
      expect(element.isolateScope().loading).toBe(undefined);
      expect(element.isolateScope().sessions).toBe(sessions.sessions);
    })

  });

  describe('user password changes', function () {

    beforeEach(inject(function($compile, $rootScope, $q) {
      $scope = $rootScope;
      q = $q;
      element = angular.element('<user-password></user-password>');
      $compile(element)($rootScope);
      element.scope().$apply();
    }))

    it("should successfully update a users password", function() {
      spyOn(userFactory, 'password').andCallThrough()
      var user = { password: 123, current_password: 456, slug: 123 };
      element.isolateScope().update(user);
      $scope.$apply();
      expect(element.isolateScope().loading).toBe(true);

      deferred.resolve(user);
      $scope.$apply();
      expect(element.isolateScope().loading).toBe(undefined);
    })

    it("should NOT successfully update a users password", function() {
      spyOn(userFactory, 'password').andCallThrough()
      var user = { password: 123, current_password: 456, slug: 123 };
      element.isolateScope().update(user);
      $scope.$apply();
      expect(element.isolateScope().loading).toBe(true);

      deferred.reject({data: {message: 123}});
      $scope.$apply();
      expect(element.isolateScope().loading).toBe(undefined);
      expect(element.isolateScope().errors).toBe(123)
    })
  })


  beforeEach(module('components/users/integrations/_integrations.html'));
  beforeEach(module('components/locations/index/index.html'));

  describe('webhooks', function () {


    beforeEach(inject(function($compile, $rootScope, $q) {
      $scope = $rootScope;
      q = $q;
      $scope.user = { slug: 123 }
      element = angular.element('<user-webhooks user-id="{{user.slug}}"></user-webhooks>');
      $compile(element)($rootScope)
      element.scope().$apply();
    }))

    it("should successfully list the webhooks init", function() {
      spyOn(webhookFactory, 'get').andCallThrough();
      var webhook = { password: 123, current_password: 456, slug: 123 };
      deferred.resolve([webhook]);
      $scope.$apply();
      expect(element.isolateScope().webhooks[0]).toBe(webhook);
    })

    it("should add another webhook", function() {
      spyOn(webhookFactory, 'create').andCallThrough();
      var webhook = { password: 123, current_password: 456, slug: 123 };
      element.isolateScope().webhooks = [];
      element.isolateScope().webhooks.push(webhook);

      element.isolateScope().create(webhook)
      $scope.$apply();
      expect(element.isolateScope().creating).toBe(true);

      deferred.resolve({webhook: webhook});
      $scope.$apply();
      expect(element.isolateScope().creating).toBe(undefined);
      expect(element.isolateScope().success).toBe(true);

      expect(element.isolateScope().webhooks.length).toBe(2);
      expect(element.isolateScope().webhook).toBe(undefined);
    })

    it("should NOT add another webhook", function() {
      spyOn(webhookFactory, 'create').andCallThrough();
      var webhook = { password: 123, current_password: 456, slug: 123 };

      element.isolateScope().create(webhook)
      $scope.$apply();
      expect(element.isolateScope().creating).toBe(true);

      deferred.reject({data: { message: 123 }});
      $scope.$apply();
      expect(element.isolateScope().creating).toBe(undefined);
      expect(element.isolateScope().success).toBe(undefined);
      expect(element.isolateScope().errors).toBe(true);
    });

    it("should remove a webhook", function() {
      spyOn(webhookFactory, 'destroy').andCallThrough();
      spyOn(window, 'confirm').andReturn(true);

      var webhook = { password: 123, current_password: 456, slug: 123 };
      element.isolateScope().webhooks = [];
      element.isolateScope().webhooks.push(webhook);

      element.isolateScope().destroy(0)
      $scope.$apply();
      expect(webhook.deleting).toBe(true)

      deferred.resolve();
      $scope.$apply();
      expect(element.isolateScope().webhooks.length).toBe(0);
    })

  })

  describe('user locations', function () {

    beforeEach(inject(function($compile, $rootScope, $q, $injector ) {
      $scope = $rootScope;
      $httpBackend = $injector.get('$httpBackend');
      $httpBackend.whenGET('template/tooltip/tooltip-popup.html').respond("");

      q = $q;
      element = angular.element('<user-locations></user-locations>');
      $compile(element)($rootScope)
      element.scope().$apply();
    }))

    it("should successfully list a users admin locs", function() {
      spyOn(locationFactory, 'all').andCallThrough()
      var loc = { owner: [{ password: 123, current_password: 456, slug: 123}], admin: [{ a: 123}] };
      expect(element.isolateScope().loading).toBe(true);

      deferred.resolve(loc);
      $scope.$apply();
      expect(element.isolateScope().loading).toBe(undefined);
      expect(element.isolateScope().owner).toBe(loc.owner);
      expect(element.isolateScope().admin).toBe(loc.admin);
    })

    it("should add the location create form to the page", function() {
      spyOn(locationFactory, 'all').andCallThrough()
      var loc = { owner: [{ password: 123, current_password: 456, slug: 123}], admin: [{ a: 123}] };
      expect(element.isolateScope().loading).toBe(true);

      deferred.resolve(loc);
      $scope.$apply();
      expect(element.isolateScope().loading).toBe(undefined);
      expect(element.isolateScope().owner).toBe(loc.owner);
      var el = element.html()

      element.isolateScope().newLocation();
      $scope.$apply();
      expect(el == element.html()).toBe(false);
    })

  })

  describe('user sub cancel', function () {

    beforeEach(inject(function($compile, $rootScope, $q) {
      $scope = $rootScope;
      q = $q;
      $scope.user = { slug: 123, account_id: "123"}
      element = angular.element('<user-cancel id="{{ user.account_id }}" slug="{{user.slug}}" state="user.cancelling" ></user-cancel>');
      $compile(element)($rootScope)
      element.scope().$apply();
    }))

    it("should successfully cancel a users account", function() {
      spyOn(subFactory, 'destroy').andCallThrough()
      element.isolateScope().cancel()
      expect(element.isolateScope().cancelling).toBe(true);

      element.isolateScope().confirm = 'cancel'
      element.isolateScope().processCancel()
      deferred.resolve();
      $scope.$apply();
      expect(element.isolateScope().state).toBe(undefined);

      element.isolateScope().confirm = $scope.user.account_id
      element.isolateScope().processCancel()
      deferred.resolve();
      $scope.$apply();
      expect(element.isolateScope().state).toBe(true);
    })

    it("should not successfully cancel a users account", function() {
      spyOn(subFactory, 'destroy').andCallThrough()
      element.isolateScope().cancel()
      expect(element.isolateScope().cancelling).toBe(true);

      element.isolateScope().processCancel()
      deferred.reject();
      $scope.$apply();
      expect(element.isolateScope().state).toBe(undefined);

      element.isolateScope().confirm = $scope.user.account_id
      element.isolateScope().processCancel()
      deferred.reject({data: { message: 123 }});
      $scope.$apply();
      expect(element.isolateScope().state).toBe(undefined);
      expect(element.isolateScope().errors).toBe(123);
    })

  })

  describe('user integrations', function () {

    beforeEach(inject(function($compile, $rootScope, $q) {
      $scope = $rootScope;
      q = $q;
      element = angular.element('<user-integrations></user-integrations>');
      $compile(element)($rootScope)
      element.scope().$apply();
    }))

    it("should list all the users integrations", function() {
      spyOn(integrationFactory, 'get').andCallThrough()
      expect(element.isolateScope().loading).toBe(true);
      var integ = [{name: 123}]
      deferred.resolve(integ);
      $scope.$apply();
      expect(element.isolateScope().loading).toBe(undefined);
      expect(element.isolateScope().integrations).toBe(integ);
    })

  })

  describe('user versions', function () {

    beforeEach(inject(function($compile, $rootScope, $q, $routeParams, $injector) {
      $scope = $rootScope;
      routeParams = $routeParams;
      routeParams.id = '123';
      $httpBackend = $injector.get('$httpBackend');
      $httpBackend.whenGET('template/pagination/pagination.html').respond("");
      q = $q;
      element = angular.element('<user-versions></user-versions>');
      $compile(element)($rootScope)
      element.scope().$apply();
    }))

    it("should list all the users change history", function() {
      spyOn(versionFactory, 'query').andCallThrough()
      expect(element.isolateScope().loading).toBe(true);
      var v = {versions: [{name: 123}]}
      deferred.resolve(v);
      $scope.$apply();
      expect(element.isolateScope().loading).toBe(undefined);
      expect(element.isolateScope().versions[0].name).toBe(123);
    })

  });

})
