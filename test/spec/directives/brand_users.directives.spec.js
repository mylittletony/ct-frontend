'use strict';

describe('brand users', function () {

  var $scope;
  var element;
  var $routeParams;
  var brandUserFactory;
  var q;
  var deferred;
  var $httpBackend;

  beforeEach(module('templates'));

  beforeEach(module('myApp', function($provide) {
    brandUserFactory = {
      query: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      get: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      destroy: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
    };
    $provide.value("BrandUser", brandUserFactory);
  }));

  beforeEach(inject(function($injector) {
    $httpBackend = $injector.get('$httpBackend');
    $httpBackend.whenGET('/translations/en_GB.json').respond("");
  }));

  describe('lists the brand users', function() {
    beforeEach(inject(function($compile, $rootScope, $q, _$routeParams_, $injector) {
      $scope = $rootScope;
      q = $q;
      $routeParams = _$routeParams_;
      $routeParams.brand_id = 'xxx';
      var elem = angular.element('<list-brand-users></list-brand-users>');
      element = $compile(elem)($rootScope);
      element.scope().$digest();
    }));

    it("should display the users for the brand", function() {
      spyOn(brandUserFactory, 'get').and.callThrough()
      expect(element.isolateScope().brand.id).toBe('xxx')

      var brand_users = { id: 123, role_id: 200 };
      deferred.resolve([brand_users]);
      $scope.$apply()

      expect(element.isolateScope().brand_users[0].role_id).toBe(200);
      expect(element.isolateScope().menu.length).toBe(2);
      expect(element.isolateScope().menu[0].type).toBe('edit');
      expect(element.isolateScope().menu[1].type).toBe('revoke');
    });

  });

});

