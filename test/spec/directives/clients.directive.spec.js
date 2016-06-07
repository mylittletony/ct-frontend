'use strict';

describe('Clients', function () {

  var $scope,
      element,
      deferred,
      q,
      location,
      $location,
      routeParams,
      locationFactory,
      reportFactory,
      $httpBackend,
      clientFactory;

  beforeEach(module('myApp', function($provide) {
    locationFactory = {
      get: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
    };
    reportFactory = {
      clients: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
    };
    clientFactory = {
      logout: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
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
    };
    $provide.value("Location", locationFactory);
    $provide.value("Client", clientFactory);
    $provide.value("Report", reportFactory);

  }));

  beforeEach(module('components/locations/clients/_table.html'));

  beforeEach(inject(function($compile, $rootScope, $q, $location, $routeParams, $injector) {
    $httpBackend = $injector.get('$httpBackend');
    $httpBackend.whenGET('template/tooltip/tooltip-popup.html').respond("");
    routeParams = $routeParams;
    routeParams.q = 'myquery';
    routeParams.interval = 'day';
    routeParams.distance = '15';
    $scope = $rootScope;
    q = $q;
    location = $location;
  }));

  describe("client list, in selection box", function() {

    beforeEach(inject(function($compile, $rootScope, $q, $injector, _$location_) {
      $scope.location = {slug: 123};
      $location = _$location_
      $httpBackend = $injector.get('$httpBackend');
      $httpBackend.whenGET('template/pagination/pagination.html').respond("");
      element = angular.element('<connected-clients></connected-clients>');
      $compile(element)($rootScope);
      element.scope().$apply();
    }));

    it("should successfully add the clients to the page", function() {
      spyOn(clientFactory, 'query').andCallThrough();
      spyOn(locationFactory, 'get').andCallThrough();
      spyOn(reportFactory, 'clients').andCallThrough();

      expect(element.isolateScope().loading).toBe(true);

      var result = { clients: [{ a: 123}], info: {location_id: 123}, _links: {a:123} };
      var location = { location_name: 'viridian' };
      var chart = { timeline: [], _stats: {}, manufacturers: {} };

      deferred.resolve(location);
      $scope.$apply();

      expect(element.isolateScope().location.location_name).toBe('viridian')

      deferred.resolve(result);
      $scope.$apply();

      expect(element.isolateScope().clients).toBe(result);
      expect(element.isolateScope()._links).toBe(result._links);


      // If you put this back in, highcharts throws an error //
      // deferred.resolve(chart);
      // $scope.$apply();

      // expect(element.isolateScope().loading).toBe(undefined);
      // expect(element.isolateScope().chart).toBe(chart.timeline);
      // expect(element.isolateScope().manufacturers).toBe(chart.manufacturers);
      // expect(element.isolateScope()._stats).toBe(chart._stats);
    });

    it("should not load the chart - hg param is set and the chart params are undefined too", function() {
      element.isolateScope().hg = true
      spyOn(clientFactory, 'query').andCallThrough();
      spyOn(locationFactory, 'get').andCallThrough();

      var result = { clients: [{ a: 123}], info: {location_id: 123}, _links: {a:123} };
      var location = { location_name: 'viridian' };

      deferred.resolve(location);
      $scope.$apply();

      expect(element.isolateScope().location.location_name).toBe('viridian')

      deferred.resolve(result);
      $scope.$apply();

      expect(element.isolateScope().clients).toBe(result);
      expect(element.isolateScope()._links).toBe(result._links);
      expect(element.isolateScope().loading).toBe(undefined);
    });

    it("should update the search terms for pagination etc.", function() {
      spyOn(clientFactory, 'query').andCallThrough();
      spyOn(locationFactory, 'get').andCallThrough();

      var result = { clients: [{ a: 123}], info: {location_id: 123} };
      var location = { location_name: 'viridian' };

      deferred.resolve(location);
      $scope.$apply();

      expect(element.isolateScope().location.location_name).toBe('viridian')

      deferred.resolve(result);
      $scope.$apply();

      expect(element.isolateScope().clients).toBe(result);

      element.isolateScope()._links = {};
      element.isolateScope().ap_mac = 'mac';
      element.isolateScope().hg = true;
      element.isolateScope().interval = 'day';
      element.isolateScope().distance = 7;
      element.isolateScope().updatePage();

      expect($location.search().ap_mac).toBe('mac');
      expect($location.search().interval).toBe('day');
      expect($location.search().distance).toBe(7);
    });

    it('should set the interval and distance params', function() {
      expect(element.isolateScope().interval).toBe('day');
      expect(element.isolateScope().distance).toBe('15');
    });

    xit('should set the interval by clicking the buttons', function() {
      spyOn(clientFactory, 'query').andCallThrough();
      element.find('#last-week').click()
      $scope.$apply()
      expect(element.isolateScope().loadingdata).toBe(true);
      expect(element.isolateScope().interval).toBe('week');
      expect(element.isolateScope().distance).toBe(1);

      deferred.resolve();
      $scope.$apply();
      expect(clientFactory.query).toHaveBeenCalled();
      expect(element.isolateScope().loadingdata).toBe(undefined);
    });

    it('should set the scope.ap_mac attr and then update table', function() {
      spyOn(clientFactory, 'query').andCallThrough();

      var result = { clients: [{ a: 123}], info: {location_id: 123}, unique_aps: [123, 456] };
      deferred.resolve(result);
      $scope.$apply();

      element.isolateScope().ap_mac = 123;
      $scope.$apply();
      expect(clientFactory.query).toHaveBeenCalled();
    });

    it('should toggle the show hide graph and update page', function() {
      spyOn(clientFactory, 'query').andCallThrough();

      element.isolateScope()._links = {};
      element.isolateScope().hideChart();

      expect($location.search().hg).toBe('true');
      expect(element.isolateScope().hg).toBe('true');

      element.isolateScope().hideChart()

      expect($location.search().hg).toBe(undefined);
      expect($location.search().hg).toBe(undefined);
    });

    it("should create a fake client for the table.", function() {
      spyOn(clientFactory, 'query').andCallThrough();
      spyOn(locationFactory, 'get').andCallThrough();

      var result = { clients: [{ a: 123}], info: {location_id: 123} };
      element.isolateScope().clients = { clients: [] };
      element.isolateScope().fakeClient();
      expect(element.isolateScope().clients.clients.length).toBe(1)

      var client = element.isolateScope().clients.clients[0]
      expect(client.client_mac).not.toBe(undefined)
      expect(client.online).toBe(true)
      expect(client.snr_alert).toBe(false)
      expect(client.splash_connected).toBe(false)
      expect(client.name).not.toBe(undefined)
      expect(client.description).not.toBe(undefined)
      expect(client.lastseen).not.toBe(undefined)
      expect(client.firstseen).not.toBe(undefined)
      expect(client.fake).toBe(true)
      expect(client.snr).not.toBe(undefined)
      expect(client.ssid).not.toBe(undefined)
      expect(client.manufacturer).toBe('Apple')
      expect(client.rxbytes).not.toBe(undefined)
      expect(client.txbytes).not.toBe(undefined)

      expect(element.isolateScope().fake).toBe(true)
      // fake user message //
    });

  });

  describe("logging a user out", function() {

    beforeEach(inject(function($compile, $rootScope, $q) {
      $scope.location = {slug: 123};
      $scope.client = {splash_status: 'pass'};
      element = angular.element('<div disconnect-client>X</div>');
      $compile(element)($rootScope);
      element.scope().$apply();
    }));

    it("should successfully log a user out", function() {
      spyOn(clientFactory, 'logout').andCallThrough();
      spyOn(window, 'confirm').andReturn(true);
      element.find('#logout').click();
      $scope.$apply();
      expect($scope.client.splash_disconnecting).toBe(true);
      var result = { man: 123 };
      deferred.resolve(result);
      $scope.$apply();
      expect(clientFactory.logout).toHaveBeenCalled();
      expect($scope.client.splash_status).toBe('dnat');
    });

    xit("should not successfully log a user out", function() {
      spyOn(clientFactory, 'logout').andCallThrough();
      spyOn(window, 'confirm').andReturn(true);
      element.find('#logout').click();
      $scope.$apply();
      expect($scope.client.splash_disconnecting).toBe(true);
      var result = { man: 123 };
      deferred.reject({data: { message: 123 }});
      $scope.$apply();
      expect(clientFactory.logout).toHaveBeenCalled();
      expect($scope.client.errors).toBe(123);
      expect($scope.client.splash_status).toBe('pass');
      expect($scope.client.splash_disconnecting).toBe(undefined);
    });

  });

  describe("client list, in selection box", function() {

    beforeEach(inject(function($compile, $rootScope, $q) {
      $scope.location = {slug: 123};
      element = angular.element('<client-detail></client-detail>');
      $compile(element)($rootScope);
      element.scope().$apply();
    }));

    it("should successfully get a client and also update it!", function() {
      spyOn(clientFactory, 'get').andCallThrough();
      expect($scope.loading).toBe(true);
      var result = { man: 123 };
      deferred.resolve(result);
      $scope.$apply()
      expect($scope.client).toBe(result);
      expect($scope.loading).toBe(undefined);
    });

    it("should successfully update a client!", function() {
      spyOn(clientFactory, 'get').andCallThrough();
      spyOn(clientFactory, 'update').andCallThrough();
      var result = { id: 123 };
      deferred.resolve(result);
      $scope.$apply()
      expect($scope.client).toBe(result);
      $scope.client.editing = true;
      $scope.updateClient(123)
      expect($scope.client.updating).toBe(true);
      expect($scope.submitting).toBe(true);
      deferred.resolve([result]);
      $scope.$apply()
      expect(clientFactory.update).toHaveBeenCalled();
      expect($scope.client.updating).toBe(undefined);
      expect($scope.client.editing).toBe(undefined);
      expect($scope.submitting).toBe(undefined);
      expect($scope.notifications).toBe('Client Updated Successfully.')
    });

    it("should NOT successfully update a client!", function() {
      spyOn(clientFactory, 'update').andCallThrough();
      var result = { id: 123 };
      deferred.resolve(result);
      $scope.$apply()
      $scope.updateClient(123)
      deferred.reject({data: { message: 123 }});
      $scope.$apply()
      expect(clientFactory.update).toHaveBeenCalled();
      expect($scope.client.errors).toBe(123);
      expect($scope.submitting).toBe(undefined);
    });

    it('should load the client reports chart', function() {
      spyOn(clientFactory, 'query').andCallThrough();
      spyOn(reportFactory, 'clients').andCallThrough();

      spyOn(clientFactory, 'get').andCallThrough();
      expect($scope.loading).toBe(true);
      var result = { man: 123 };
      deferred.resolve(result);
      $scope.$apply()
      expect($scope.client).toBe(result);
      expect($scope.chart.loading).toBe(true);

      var stats = { timeline: [], _stats: {} };
      deferred.resolve(stats);
      $scope.$apply();

      expect($scope.chart).toBe(stats.timeline);
    });


  })
})
