'use strict';

describe('location tests', function () {

  var $scope, element, $routeParams, locationFactory, q, deferred, $httpBackend;

  beforeEach(module('templates'));

  beforeEach(module('myApp', function($provide) {
    locationFactory = {
      query: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      users: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    };
    $provide.value("Location", locationFactory);
  }));

  beforeEach(inject(function($injector) {
    $httpBackend = $injector.get('$httpBackend');
    $httpBackend.whenGET('/translations/en_GB.json').respond("");
  }));

  describe('creation of users for a location', function() {
    beforeEach(inject(function($compile, $rootScope, $q, _$routeParams_, $injector) {
      $scope = $rootScope;
      q = $q;

      $routeParams = _$routeParams_;
      $routeParams.page = 10;
      $routeParams.per = 5;

      $scope.location = {}
      $scope.loading = true;
      var elem = angular.element('<location-admins location="location" loading="loading"></location-admins>');
      element = $compile(elem)($rootScope);
      element.scope().$digest();
    }));

    it("should display the users for the brand", function() {
      element.isolateScope().location = {};

      spyOn(locationFactory, 'users').and.callThrough()
      expect(element.isolateScope().users.length).toEqual(0)

      var email = 'foo@bar.com';
      var results = [{ email: email }];
      deferred.resolve(results);
      $scope.$digest();

      expect(element.isolateScope().users[0].email).toBe(email);
      expect(element.isolateScope().allowed).toBe(true);
      expect(element.isolateScope().menu.length).toBe(2);
      expect(element.isolateScope().menu[0].type).toBe('view');
      expect(element.isolateScope().menu[1].type).toBe('revoke');
      expect(element.isolateScope().query.order).toBe('state');
      expect(element.isolateScope().query.limit).toBe(5);
      expect(element.isolateScope().query.page).toBe(10);
      expect(element.isolateScope().loading).toBe(undefined);

      expect(element.isolateScope().roles.length).toBe(1);
      expect(element.isolateScope().roles[0].role_id).toBe(100);
      expect(element.isolateScope().roles[0].name).toBe('Location Admin');
    });

  });

});

