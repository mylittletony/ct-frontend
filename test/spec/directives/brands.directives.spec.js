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
    $provide.value("Brand", brandFactory);
  }));

  beforeEach(inject(function($injector) {
    $httpBackend = $injector.get('$httpBackend');
    $httpBackend.whenGET('/translations/en_GB.json').respond("");
  }));

  // afterEach(function(){
  //   $scope.$apply();
  // });

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

    fit("should set the default scope vars", function() {
      spyOn(brandFactory, 'get').and.callThrough();
      var brand= { url: 'cucumber', brand_name: 'simon' };
      deferred.resolve(brand);
      $scope.$digest();

      expect(element.isolateScope().brand).toEqual(brand);
      expect(element.isolateScope().originalUrl).toEqual(brand.url);
      expect(element.isolateScope().brandName.name).toEqual(brand.brand_name);
    });

    fit("should create a brand if Cucumber", function() {

    });

    fit("should update a brand if theirs", function() {

    });

    fit("should not show a brand if not theirs", function() {

    });

  });

});

