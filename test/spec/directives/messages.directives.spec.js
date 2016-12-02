'use strict';

describe('message', function () {

  var $scope, element, $routeParams, messageFactory, q, location, $location,
  deferred, $httpBackend, boxFactory;

  beforeEach(module('templates'));

  beforeEach(module('myApp', function($provide) {
    messageFactory = {
      get: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      query: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      create: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    };
    boxFactory = {
      get: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    };
    $provide.value("Message", messageFactory);
    $provide.value("Box", boxFactory);
  }));

  beforeEach(inject(function($injector) {
    $httpBackend = $injector.get('$httpBackend');
    $httpBackend.whenGET('/translations/en_GB.json').respond("");
  }));

  describe('lists the messages', function() {
    beforeEach(inject(function($compile, $rootScope, $q, _$routeParams_, $injector, _$location_) {
      $scope = $rootScope;
      q = $q;
      $location = _$location_;
      $routeParams = _$routeParams_;
      $routeParams.id = 'xxx';
      $routeParams.box_id = 'yyy';
      var elem = angular.element('<list-messages></list-messages>');
      element = $compile(elem)($rootScope);
      element.scope().$digest();
    }));

    fit("should set the variables", function() {
      spyOn(boxFactory, 'get').and.callThrough();
      var box = { id: 123 };
      deferred.resolve(box);
      $scope.$digest()

      spyOn(messageFactory, 'query').and.callThrough();
      expect(element.isolateScope().query.order).toBe('-created_at');
      expect(element.isolateScope().box.slug).toBe('yyy');
      expect(element.isolateScope().location.slug).toBe('xxx');
    });

    fit("should list the messages", function() {
      spyOn(messageFactory, 'query').and.callThrough();
      expect(element.isolateScope().loading).toBe(true);

      var links = { total: 999 };
      var vals = { _links: links, messages: [{a: 123}] }
      deferred.resolve(vals);
      $scope.$digest()

      expect(element.isolateScope().loading).toBe(undefined);
      expect(element.isolateScope().messages.length).toBe(1);
      expect(element.isolateScope()._links).toBe(links);
    });
  });

  describe('creates the messages', function() {
    beforeEach(inject(function($compile, $rootScope, $q, _$routeParams_, $injector, _$location_) {
      $scope = $rootScope;
      q = $q;
      $location = _$location_;
      $routeParams = _$routeParams_;
      $routeParams.id = 'xxx';
      $routeParams.box_id = 'yyy';
      var elem = angular.element('<create-message></create-message>');
      element = $compile(elem)($rootScope);
      element.scope().$digest();
    }));

    fit("should add the messages to the list", function() {
      // expect(element.isolateScope().loading).toBe(true);
      // spyOn(messageFactory, 'create').and.callThrough();
      // expect(element.isolateScope().query.order).toBe('-created_at');
      // expect(element.isolateScope().box.slug).toBe('yyy');
      // expect(element.isolateScope().location.slug).toBe('xxx');
    });
  });
});
