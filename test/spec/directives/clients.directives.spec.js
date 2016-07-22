'use strict';

describe('client', function () {

  var $scope, element, $routeParams, clientFactory, q,
  deferred, $httpBackend, networkFactory, zoneFactory, reportFactory;

  beforeEach(module('templates'));

  beforeEach(module('myApp', function($provide) {
    clientFactory = {
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
    reportFactory = {
      clientstats: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
    };
    networkFactory = {
      get: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
    };
    zoneFactory = {
      get: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
    };
    $provide.value("Report", reportFactory);
    $provide.value("Zone", zoneFactory);
    $provide.value("Network", networkFactory);
    $provide.value("Client", clientFactory);
  }));

  beforeEach(inject(function($injector) {
    $httpBackend = $injector.get('$httpBackend');
    $httpBackend.whenGET('/translations/en_GB.json').respond("");
  }));

  describe('displays the client', function() {
    beforeEach(inject(function($compile, $rootScope, $q, _$routeParams_, $injector) {
      $scope = $rootScope;
      q = $q;
      $routeParams = _$routeParams_;
      $routeParams.id = 'xxx';
      $routeParams.period = 'my-period';
      $routeParams.fn = 'my-fn';
      $routeParams.ap_mac = 'ap-mac';
      $scope.loading = true;
      var elem = angular.element('<client-chart><client-detail loading="loading"></client-detail></client-chart>');
      element = $compile(elem)($rootScope);
      element.scope().$digest();
    }));

    it("should set the default scopes vals", function() {
      var clientScope = element.find('client-detail').isolateScope()
      spyOn(clientFactory, 'get').and.callThrough();
      expect(clientScope.location.slug).toEqual('xxx');
      expect(clientScope.ap_mac).toEqual('ap-mac');
      expect(clientScope.fn).toEqual('my-fn');
      expect(clientScope.period).toEqual('my-period');

      var client = { id: 123 };
      deferred.resolve(client);
      $scope.$apply();

      expect(clientScope.client.id).toEqual(123);
    });

    it("should update a client", function() {
      // var clientScope = element.find('client-detail').isolateScope()
      // spyOn(clientFactory, 'update').and.callThrough();

      // clientScope.update();
      // expect(clientScope.client.updating).toEqual(true);
      // var client = { id: 123 };
      // deferred.resolve(client);
      // $scope.$apply();

      // expect(clientScope.client.updating).toEqual(undefined);
    });

  });

});
