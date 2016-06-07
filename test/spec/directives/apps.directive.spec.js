'use strict';

describe('lists location apps', function () {

  var $scope;
  var element;
  var $location;
  var appFactory;
  var locationFactory;
  var splashFactory;
  var q;
  var deferred;
  var $httpBackend;

  beforeEach(module('myApp', function($provide) {
    appFactory = {
      create: function () {
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
    };
    $provide.value("App", appFactory);
  }));

  // beforeEach(module('components/layouts/submit.html'));
  // beforeEach(module('components/reports/apps/_index.html'));

  describe('list app tests', function() {
    beforeEach(inject(function($compile, $rootScope, $q, _$location_, $injector) {
      $scope = $rootScope;
      $location = _$location_;
      q = $q;
      element = angular.element('<list-apps></list-apps>');
      $compile(element)($rootScope)
      element.scope().$apply();
    }));

    it("should display the apps", function() {
      spyOn(appFactory, 'get').andCallThrough()
      expect(element.isolateScope().loading).toBe(true)

      var app = { simon: "smorley" }
      var apps =  [app]

      deferred.resolve(apps);
      $scope.$apply()

      expect(element.isolateScope().apps[0]).toBe(apps[0]);
      expect(element.isolateScope().loading).toBe(undefined)
    });

  });

  describe('show app tests', function() {

    beforeEach(inject(function($compile, $rootScope, $q, _$location_, $injector) {
      $scope = $rootScope;
      $location = _$location_;
      q = $q;
      element = angular.element('<show-app></show-app>');
      $compile(element)($rootScope)
      element.scope().$apply();
    }));

    it("should display the app", function() {
      spyOn(appFactory, 'query').andCallThrough()
      expect(element.isolateScope().loading).toBe(true)

      var app = { simon: "smorley" }

      deferred.resolve(app);
      $scope.$apply()

      expect(element.isolateScope().app).toBe(app);
      expect(element.isolateScope().loading).toBe(undefined)
    });

  });

  describe('create edit app tests', function() {

    beforeEach(inject(function($compile, $rootScope, $q, _$location_, $injector) {
      $scope = $rootScope;
      $location = _$location_;
      q = $q;
      $scope.app = {}
      element = angular.element('<edit-app></edit-app>');
      $compile(element)($rootScope)
      element.scope().$apply();
    }));

    it("should create the app", function() {
      spyOn(appFactory, 'create').andCallThrough()
      expect(element.isolateScope().loading).toBe(true)

      var app = { id: 123 }

      element.isolateScope().save();
      deferred.resolve(app);
      $scope.$apply()

      expect($location.path()).toBe('/apps/123')
      // expect(element.isolateScope().app).toBe(app);
      // expect(element.isolateScope().loading).toBe(undefined)
    });

  });

  describe('updated app tests', function() {

    beforeEach(inject(function($compile, $rootScope, $q, _$location_, $injector) {
      $scope = $rootScope;
      $location = _$location_;
      q = $q;
      $scope.app = {id: 123}
      element = angular.element('<edit-app></edit-app>');
      $compile(element)($rootScope)
      element.scope().$apply();
    }));

    it("should create the app", function() {
      spyOn(appFactory, 'create').andCallThrough()
      expect(element.isolateScope().loading).toBe(true)

      var app = { id: 123 }

      element.isolateScope().save();
      deferred.resolve(app);
      $scope.$apply()

      expect($location.path()).toBe('/apps/123')
      // expect(element.isolateScope().app).toBe(app);
      // expect(element.isolateScope().loading).toBe(undefined)
    });

  });

});

