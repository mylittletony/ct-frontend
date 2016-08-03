'use strict';

describe('brands', function () {

  var $scope, element, $routeParams, userFactory, brandFactory, q, deferred, $httpBackend, reportFactory, zoneFactory, dd;

  beforeEach(module('templates'));

  beforeEach(module('myApp', function($provide) {
    brandFactory = {
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
    userFactory = {
      query: function () {
        dd = q.defer();
        return {$promise: dd.promise};
      },
    };
    $provide.value("User", userFactory);
    $provide.value("Brand", brandFactory);
  }));

  beforeEach(inject(function($injector) {
    $httpBackend = $injector.get('$httpBackend');
    $httpBackend.whenGET('/translations/en_GB.json').respond("");
  }));

  describe('displays a brand to a user', function() {
    beforeEach(inject(function($compile, $rootScope, $q, _$routeParams_, $injector) {
      $scope = $rootScope;
      q = $q;
      $routeParams = _$routeParams_;
      $routeParams.id = 1;
      var elem = angular.element('<user-brand></user-brand>');
      element = $compile(elem)($rootScope);
      element.scope().$digest();
    }));

    it("should set the default scope vars", function() {
      spyOn(brandFactory, 'get').and.callThrough();
      
      expect(element.isolateScope().brand.creating).toEqual(true);
      expect(element.isolateScope().brand.network_location).toEqual('eu-west');
      expect(element.isolateScope().locations.length).toEqual(4);
      expect(element.isolateScope().locations[0]).toEqual('eu-west');
      expect(element.isolateScope().locations[1]).toEqual('us-central');
      expect(element.isolateScope().locations[2]).toEqual('us-west');
      expect(element.isolateScope().locations[3]).toEqual('asia-east');

      var user = { id: 123 };
      dd.resolve(user);
      $scope.$digest();
      expect(element.isolateScope().user).toEqual(user);

      var brand = { url: 'cucumber', brand_name: 'simon' };
      deferred.resolve(brand);
      $scope.$digest();

      expect(element.isolateScope().brand).toEqual(brand);
      expect(element.isolateScope().originalUrl).toEqual(brand.url);
      expect(element.isolateScope().brandName.name).toEqual(brand.brand_name);
    });

    it("should create a brand", function() {
      spyOn(brandFactory, 'create').and.callThrough();
      var form = {
        $valid: true,
        $setPristine: function() {}
      };

      element.isolateScope().save(form)

      var brand = { url: 'cucumber', brand_name: 'simon' };
      deferred.resolve(brand);
      $scope.$digest();

      expect(element.isolateScope().brand).toEqual(brand);
    });

    // Not sure how to confirm the mdialog
    xit("should update a brand", function() {
      element.isolateScope().brand.id = 123;
      spyOn(brandFactory, 'update').and.callThrough();
      var form = {
        $valid: true,
        $setPristine: function() {}
      };

      element.isolateScope().save(form)

      var brand = { url: 'cucumber', brand_name: 'simon' };
      deferred.resolve(brand);
      $scope.$digest();

      expect(element.isolateScope().brand).toEqual(brand);
    });

  });

});

