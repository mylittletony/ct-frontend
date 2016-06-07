'use strict';

describe('Controller: MainCtrl', function () {

  beforeEach(module('myApp'));

  var SplashPagesCtrlShow,
      locationFactory,
      SplashPagesCtrl,
      splashFactory,
      scope,
      $location,
      $httpBackend,
      deferred,
      q,
      store = {};


  beforeEach(module('myApp', function($provide) {
    locationFactory = {
      get: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    },
    splashFactory = {
      update: function () {
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
      }
    }
    $provide.value("Location", locationFactory);
    $provide.value("SplashPage", splashFactory);
  }));

  describe('Controller: Show', function () {

    beforeEach(inject(function (_$httpBackend_, $controller, $rootScope, _$location_, $q) {
      $httpBackend = _$httpBackend_;
      q = $q;
      scope = $rootScope.$new();
      $location = _$location_;

      SplashPagesCtrl = $controller('SplashPagesCtrlShow', {
        $scope: scope,
      });
    }));

    it('should get the location and the splash_page, why not', function () {
      spyOn(locationFactory, 'get').andCallThrough();
      spyOn(splashFactory, 'query').andCallThrough();
      expect(scope.loading).toBe(true);
      var location = { location_name: "simon"}
      var splash_page = { splash_page: { splash_page_name: 'lobby'}, access_types: [{ name: "password"}]}
      deferred.resolve(location)
      scope.$apply()
      expect(scope.location).toBe(location)
    });

  });

  describe('Controller: NewCtrl', function () {

    beforeEach(inject(function (_$httpBackend_, $controller, $rootScope, _$location_, $q) {
      $httpBackend = _$httpBackend_;
      q = $q;
      scope = $rootScope.$new();
      $location = _$location_;

      SplashPagesCtrl = $controller('SplashPagesCtrlNew', {
        $scope: scope,
      });
    }));

    it('should get the location and all the splash_pages, why not', function () {
      spyOn(locationFactory, 'get').andCallThrough();
      spyOn(splashFactory, 'get').andCallThrough();
      expect(scope.loading).toBe(true);
      var location = { location_name: "simon"}
      var splash_page = { splash_page_name: 'Lobby' }
      deferred.resolve(location)
      scope.$apply()
      expect(scope.location).toBe(location)
    });
  });

});

