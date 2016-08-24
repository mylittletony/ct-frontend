'use strict';

describe('users', function () {

  var $scope, element, $routeParams, userFactory, brandUserFactory, q, deferred, $httpBackend;

  beforeEach(module('templates'));

  beforeEach(module('myApp', function($provide) {
    brandUserFactory = {
      update: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      destroy: function () {
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
    $provide.value("BrandUser", brandUserFactory);
  }));

  beforeEach(inject(function($injector) {
    $httpBackend = $injector.get('$httpBackend');
    $httpBackend.whenGET('/translations/en_GB.json').respond("");
  }));

  describe('lists the users for a brand - with brand id', function() {
    beforeEach(inject(function($compile, $rootScope, $q, _$routeParams_, $injector) {
      $scope = $rootScope;
      q = $q;
      $routeParams = _$routeParams_;
      $routeParams.brand_id = 'xxx';
      $routeParams.q = 'my-search';
      var elem = angular.element('<list-users></list-users>');
      element = $compile(elem)($rootScope);
      element.scope().$digest();
    }));

    it("should display the users for the brand", function() {
      spyOn(userFactory, 'query').and.callThrough()
      expect(element.isolateScope().brand.id).toBe('xxx')

      var results = { users: [{ id: 123, role_id: 200 }], _links: {} };
      deferred.resolve(results);
      $scope.$apply()

      expect(element.isolateScope().users[0].role_id).toBe(200);
      expect(element.isolateScope().menu.length).toBe(2);
      expect(element.isolateScope().menu[0].type).toBe('edit');
      expect(element.isolateScope().menu[1].type).toBe('revoke');

      // Tests other scopes are set
      expect(element.isolateScope().query.order).toBe('created_at');
      expect(element.isolateScope().query.filter).toBe('my-search');
      expect(element.isolateScope().roles.length).toBe(2);
      expect(element.isolateScope().roles[0].role_id).toBe(205);
      expect(element.isolateScope().roles[0].name).toBe('Brand Ambassador');
      expect(element.isolateScope().roles[1].role_id).toBe(201);
      expect(element.isolateScope().roles[1].name).toBe('Member');
    });

  });

});

