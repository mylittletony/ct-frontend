'use strict';

describe('splash codes directives', function () {

  var $scope,
      element,
      deferred,
      compile,
      q,
      location,
      $location,
      boxFactory,
      networkFactory,
      codeFactory,
      splashFactory,
      splashPageFactory,
      $httpBackend,
      routeParams,
      locationFactory;

  beforeEach(module('myApp', function($provide) {
    locationFactory = {
      get: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      update: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    };
    codeFactory = {
      generate_password: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    };
    splashPageFactory = {
      query: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    };
    splashFactory = {
      destroy: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      create: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      get: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      query: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      update: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    };
    $provide.value("SplashPage", splashPageFactory);
    $provide.value("SplashCode", splashFactory);
    $provide.value("Code", codeFactory);
    $provide.value("Location", locationFactory);
    $provide.value("Network", networkFactory);
  }));

  beforeEach(module('components/splash_codes/_index.html'));
  beforeEach(module('components/splash_codes/_show.html'));
  beforeEach(module('components/splash_codes/_edit.html'));
  beforeEach(module('components/locations/layouts/location-banner.html'));
  beforeEach(module('components/locations/layouts/sidebar.html'));

  describe('splash_pages creation, listing', function () {

    beforeEach(inject(function($compile, $rootScope, $q, $routeParams, $injector) {

      // $httpBackend = $injector.get('$httpBackend');
      // $httpBackend.whenGET('template/tooltip/tooltip-popup.html').respond("");

      $scope = $rootScope;
      routeParams = $routeParams;
      routeParams.location_id = 123
      q = $q;
      $scope.location = { slug: 456, id: 123 }
      $scope.loading = true;
      element = angular.element('<list-splash-codes></list-splash-codes>');
      $compile(element)($rootScope)
      element.scope().$apply();
    }))

    it("should list all the splash codes for a location", function() {
      expect(element.isolateScope().loading).toBe(true)
      spyOn(splashFactory, 'get').andCallThrough()
      var splash = { splash_codes: [ { network_id: '123'} ] }

      expect(element.isolateScope().location.slug).toBe(123)
      deferred.resolve(splash);
      $scope.$apply()
      expect(element.isolateScope().splash_codes).toBe(splash.splash_codes)
      expect(element.isolateScope().loading).toBe(undefined)
    });

  });

  describe('splash_pages creation, listing', function () {

    beforeEach(inject(function($compile, $rootScope, $q, $routeParams, $injector, _$location_) {

      $location = _$location_;
      $scope = $rootScope;
      routeParams = $routeParams;
      routeParams.location_id = 123
      q = $q;
      $scope.location = { slug: 456, id: 123 }
      $scope.loading = true;
      element = angular.element('<create-splash-code></create-splash-code>');
      $compile(element)($rootScope)
      element.scope().$apply();
    }))

    it("should create a code for a location", function() {
      expect(element.isolateScope().loading).toBe(true)
      spyOn(splashFactory, 'create').andCallThrough()
      spyOn(splashPageFactory, 'query').andCallThrough()
      var splash = { splash_pages: [ { network_id: '123'} ] }

      expect(element.isolateScope().location.slug).toBe(123)
      deferred.resolve(splash);
      $scope.$apply()
      expect(element.isolateScope().splash_pages).toBe(splash.splash_pages)
      expect(element.isolateScope().loading).toBe(undefined)

      var code = { id: 123456 }
      element.isolateScope().save()
      deferred.resolve(code);
      $scope.$apply()
      expect($location.path()).toBe('/locations/123/splash_codes/123456')
    });

  });

  describe('splash_pages listing', function () {

    beforeEach(inject(function($compile, $rootScope, $q, $routeParams, $injector, _$location_) {

      $location = _$location_;
      $scope = $rootScope;
      routeParams = $routeParams;
      routeParams.location_id = 123
      q = $q;
      $scope.location = { slug: 456, id: 123 }
      $scope.loading = true;
      element = angular.element('<show-splash-code></show-splash-code>');
      $compile(element)($rootScope)
      element.scope().$apply();
    }))

    it("should show the code", function() {
      spyOn(window, 'confirm').andReturn(true);
      expect(element.isolateScope().loading).toBe(true);
      spyOn(splashFactory, 'query').andCallThrough();
      spyOn(splashFactory, 'update').andCallThrough();
      var code = { network_id: '123'};

      expect(element.isolateScope().location.slug).toBe(123)
      deferred.resolve(code);
      $scope.$apply()
      expect(element.isolateScope().splash_code).toBe(code)
      expect(element.isolateScope().loading).toBe(undefined)

      var code = { id: 123456 }
      element.isolateScope().update()

      expect(element.isolateScope().updating).toBe(true)
      deferred.resolve(code);
      $scope.$apply()
      expect(element.isolateScope().updating).toBe(undefined)

      element.isolateScope().destroy()

      deferred.resolve(code);
      $scope.$apply()
      expect($location.path()).toBe('/locations/123/splash_codes')
    });

  });

})
