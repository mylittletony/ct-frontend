'use strict';

describe('invites directive tests', function () {

  var $scope,
      element,
      deferred,
      $httpBackend,
      Auth,
      authFactory,
      q,
      location,
      inviteFactory;

  beforeEach(module('myApp', function($provide) {
    authFactory = {
      currentUser: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
    };
    inviteFactory = {
      destroy: function () {
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
    $provide.value("Invite", inviteFactory);
    // $provide.value("Auth", authFactory);
  }));

  beforeEach(module('components/users/users/invitesModal.html')); // The external template file referenced by templateUrl

  describe('invite index', function () {

    beforeEach(inject(function($compile, $rootScope, $q, $injector) {
      $httpBackend = $injector.get('$httpBackend');
      $httpBackend.when('GET', 'invitesModal.html')
        .respond(200, [{location_name: 'derby-council'}]);

      $scope = $rootScope;
      q = $q;
      $scope.admins = 123;
      element = angular.element('<invites admins="{{ admins }}"></invites>');
      $compile(element)($rootScope)
      element.scope().$apply();
    }))

    it("should successfully list the invites", function() {
      spyOn(inviteFactory, 'get').andCallThrough();
      var invite = { password: 123, current_password: 456, slug: 123 };
      deferred.resolve([invite]);
      $scope.$apply();
      expect(element.isolateScope().invites[0]).toBe(invite);
    })

    it("should successfully create a new invite", function() {
      spyOn(inviteFactory, 'create').andCallThrough();
      var invite = { email: 'adsf', state: 'pending' };
      var email = 's@o.com'

      element.isolateScope().createInvite(email)
      $scope.$apply();

      expect(element.isolateScope().creating).toBe(true);
      deferred.resolve(invite);
      $scope.$apply();
      expect(element.isolateScope().invites.length).toBe(1);
      expect(element.isolateScope().creating).toBe(undefined);
    })

    it("should not successfully create a new invite", function() {
      spyOn(inviteFactory, 'create').andCallThrough();
      var invite = { email: 'adsf', state: 'pending' };
      var email = 's@o.com'

      element.isolateScope().createInvite(email)
      $scope.$apply();

      expect(element.isolateScope().creating).toBe(true);
      deferred.reject({data: {message: 123 }});
      $scope.$apply();
      expect(element.isolateScope().creating).toBe(undefined);
      expect(element.isolateScope().errors).toBe(123);
    })

    it("should successfully revoke an invite", function() {
      spyOn(window, 'confirm').andReturn(true);
      spyOn(inviteFactory, 'destroy').andCallThrough();
      var invite = { email: 'adsf', state: 'pending' };
      var i = element.isolateScope().invites = [];
      i.push(invite)
      var email = 's@o.com'

      element.isolateScope().revokeInvite(0)
      $scope.$apply();

      expect(element.isolateScope().revoking).toBe(true);
      expect(element.isolateScope().invites[0].state).toBe('revoking');
      deferred.resolve();
      $scope.$apply();
      expect(element.isolateScope().revoking).toBe(undefined);
      expect(element.isolateScope().invites[0].state).toBe('revoked');
    })

    it("should not successfully revoke an invite", function() {
      element.isolateScope().invitee = {};
      spyOn(window, 'confirm').andReturn(true);
      spyOn(inviteFactory, 'destroy').andCallThrough();
      var invite = { email: 'adsf', state: 'pending' };
      var i = element.isolateScope().invites = [];
      i.push(invite)
      var email = 's@o.com'

      element.isolateScope().revokeInvite(0)
      $scope.$apply();

      expect(element.isolateScope().revoking).toBe(true);
      expect(element.isolateScope().invites[0].state).toBe('revoking');
      deferred.reject({data: {message: 123 }});
      $scope.$apply();
      expect(element.isolateScope().revoking).toBe(undefined);
      expect(element.isolateScope().invites.length).toBe(1);
      expect(element.isolateScope().invites[0].state).toBe('pending');
    })

    it("should show an invite record fuck off", function() {
      spyOn(inviteFactory, 'query').andCallThrough();
      var invite = { email: 'adsf', state: 'pending' };
      var id = '123';
      element.isolateScope().showInvite(123)

      deferred.resolve(invite);
      $scope.$apply();

      expect(element.isolateScope().invite).toBe(invite);
    });

  });

  describe('location invites', function () {

    beforeEach(inject(function($compile, $rootScope, $q, $injector) {
      $scope = $rootScope;
      q = $q;
      $scope.location = {id: 123};
      $scope.invites = [];
      element = angular.element('<location-invites status="creating" id="location.id" model="invites"></location-invites>');
      $compile(element)($rootScope)
      element.scope().$apply();
    }));

    it("should successfully create an invite", function() {
      spyOn(inviteFactory, 'get').andCallThrough();
      var invite = { password: 123, current_password: 456, slug: 123 };
      element.isolateScope().invitee = {};

      element.isolateScope().createInvite(invite)
      expect(element.isolateScope().creating).toBe(true);
      deferred.resolve(invite);
      $scope.$apply();
      expect(element.isolateScope().model[0]).toBe(invite);
      expect(element.isolateScope().status).toBe(undefined);
    });

    it("should not successfully create an invites", function() {
      spyOn(inviteFactory, 'get').andCallThrough();
      var invite = { password: 123, current_password: 456, slug: 123 };

      element.isolateScope().invitee = invite;
      element.isolateScope().createInvite()
      expect(element.isolateScope().creating).toBe(true);
      deferred.reject({data: { message: 123}});
      $scope.$apply();
      expect(element.isolateScope().creating).toBe(undefined);
      expect(element.isolateScope().status).toBe(undefined);
    })

  });

})
