'use strict';

describe('passwords creation, listing', function () {

  var $scope,
      element,
      deferred,
      q,
      $location,
      routeParams,
      passwordFactory;

  beforeEach(module('myApp', function($provide) {
    passwordFactory = {
      create: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      update: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    };
    $provide.value("Password", passwordFactory);
  }));

  // beforeEach(module('components/locations/index/index.html'));
  // beforeEach(module('components/home/hello.html'));

  describe('passwords creation, listing', function () {

    beforeEach(inject(function($compile, $rootScope, $q, $routeParams, _$location_) {
      $scope = $rootScope;
      $location = _$location_
      routeParams = $routeParams;
      q = $q;
      element = angular.element('<password-reset></password-reset>');
      $compile(element)($rootScope)
      element.scope().$apply();
    }))

    it("should request a reset for a password", function() {
      spyOn(passwordFactory, 'create').andCallThrough()
      var email = 'simon'
      element.isolateScope().reset(email)
      expect(element.isolateScope().resetting).toBe(true)
      deferred.resolve();
      $scope.$apply()
      expect(element.isolateScope().resetting).toBe(undefined)
    })

  });

  describe('passwords creation, listing', function () {

    beforeEach(inject(function($compile, $rootScope, $q, $routeParams, _$location_) {
      $scope = $rootScope;
      $location = _$location_
      routeParams = $routeParams;
      q = $q;
      element = angular.element('<password-update></password-update>');
      $compile(element)($rootScope)
      element.scope().$apply();
    }))

    it("should reset a password", function() {
      spyOn(passwordFactory, 'update').andCallThrough()
      var p = { password: 'simon', password_confirmation: 'simon', token: 'a' }
      element.isolateScope().update(p)
      expect(element.isolateScope().updating).toBe(true)
      deferred.resolve();
      $scope.$apply()
      expect(element.isolateScope().updating).toBe(undefined)
      expect($location.path()).toBe('/login')
    })

  })
})
