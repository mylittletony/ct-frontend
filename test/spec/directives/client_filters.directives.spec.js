'use strict';

describe('client_filters', function () {

  var $scope, element, $routeParams, clientFilterFactory, q, deferred, $httpBackend;

  beforeEach(module('templates'));

  beforeEach(module('myApp', function($provide) {
    clientFilterFactory = {
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
    $provide.value("ClientFilter", clientFilterFactory);
  }));

  beforeEach(inject(function($injector) {
    $httpBackend = $injector.get('$httpBackend');
    $httpBackend.whenGET('/translations/en_GB.json').respond("");
  }));

  describe('lists the client filters for a location', function() {
    beforeEach(inject(function($compile, $rootScope, $q, _$routeParams_, $injector) {
      $scope = $rootScope;
      q = $q;
      $routeParams = _$routeParams_;
      $routeParams.id = 'xxx';
      $scope.loading = true;
      var elem = angular.element('<list-client-filters loading="loading"></list-client-filters>');
      element = $compile(elem)($rootScope);
      element.scope().$digest();
    }));

    it("should display the filters", function() {
      spyOn(clientFilterFactory, 'get').and.callThrough()
      expect(element.isolateScope().location.slug).toBe('xxx')

      var results = { client_filters: [{ id: 123 }], _links: {} };
      deferred.resolve(results);
      $scope.$apply()

      expect(element.isolateScope().client_filters[0].id).toBe(123);
      expect(element.isolateScope().loading).toBe(undefined);
      // expect(element.isolateScope().menu.length).toBe(2);
      // expect(element.isolateScope().menu[0].type).toBe('edit');
      // expect(element.isolateScope().menu[1].type).toBe('revoke');

      // // Tests other scopes are set
      // expect(element.isolateScope().query.order).toBe('created_at');
      // expect(element.isolateScope().query.filter).toBe('my-search');
      // expect(element.isolateScope().roles.length).toBe(2);
      // expect(element.isolateScope().roles[0].role_id).toBe(200);
      // expect(element.isolateScope().roles[0].name).toBe('Brand Admin');
      // expect(element.isolateScope().roles[1].role_id).toBe(201);
      // expect(element.isolateScope().roles[1].name).toBe('Location Admin');
    });

  });

});

