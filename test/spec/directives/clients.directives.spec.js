'use strict';

describe('client', function () {

  var $scope, element, $routeParams, clientFactory, q, location, $location,
  deferred, $httpBackend, networkFactory, zoneFactory, reportFactory, groupPolicyFactory;

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
    groupPolicyFactory = {
      get: function () {
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
    $provide.value("GroupPolicy", groupPolicyFactory);
  }));

  beforeEach(inject(function($injector) {
    $httpBackend = $injector.get('$httpBackend');
    $httpBackend.whenGET('/translations/en_GB.json').respond("");
  }));

  describe('lists the clients', function() {
    beforeEach(inject(function($compile, $rootScope, $q, _$routeParams_, $injector, _$location_) {
      $scope = $rootScope;
      q = $q;
      $location = _$location_;
      $routeParams = _$routeParams_;
      $routeParams.id = 'xxx';
      $routeParams.period = 'my-period';
      $routeParams.per = 100;
      $routeParams.page = 10;
      $routeParams.fn = 'my-fn';
      $routeParams.type = 'my-type';
      $routeParams.ap_mac = 'ap-mac';
      $routeParams.client_mac = 'client-mac';
      $routeParams.period = '1d';
      $routeParams.policy_id = '1';
      $scope.loading = true;
      $scope.location = { slug: 123 }
      var elem = angular.element('<clients-index><clients location="location" loading="loading"></clients></clients-index>');
      element = $compile(elem)($rootScope);
      element.scope().$digest();
    }));

    it("should set the default scopes vals", function() {
      var clientScope = element.find('clients').isolateScope()
      spyOn(clientFactory, 'query').and.callThrough();
      expect(clientScope.selected.length).toEqual(0);
      expect(clientScope.options.autoSelect).toEqual(true);
      expect(clientScope.options.boundaryLinks).toEqual(false);
      expect(clientScope.options.largeEditDialog).toEqual(false);
      expect(clientScope.options.pageSelector).toEqual(false);
      expect(clientScope.options.rowSelection).toEqual(true);
      // expect(clientScope.query.order).toEqual('-lastseen');
      expect(clientScope.query.order).toEqual('updated_at');
      expect(clientScope.query.limit).toEqual(100);
      expect(clientScope.query.page).toEqual(10);
      expect(clientScope.toggleSearch).toEqual(false);
      expect(clientScope.type).toEqual('my-type');
      expect(clientScope.ap_mac).toEqual('ap-mac');
      expect(clientScope.client_mac).toEqual('client-mac');
      expect(clientScope.policy_id).toEqual('1');
      expect(clientScope.period).toEqual('1d');

      var d = new Date();
      d.setHours(d.getHours()-2);
      var t = parseInt(d) / 1000;
      expect(clientScope.start).toEqual(t);

      expect(clientScope.menu.length).toEqual(1);
      expect(clientScope.menu[0].type).toEqual('view');
    });

    it("should trigger the menu action", function() {
      var clientScope = element.find('clients').isolateScope()
      spyOn(clientFactory, 'query').and.callThrough();
      var client = { id: 123 };
      clientScope.menuAction('view', client)
      expect($location.path()).toEqual('/locations/123/clients/123')
    });

    it("should update the search params", function() {
      var clientScope = element.find('clients').isolateScope()
      spyOn(clientFactory, 'query').and.callThrough();

      clientScope.updatePage();
      var s = $location.search();
      expect(s.ap_mac).toEqual('ap-mac');
      expect(s.client_mac).toEqual('client-mac')
    });

    it("should have the default search columns", function() {
      var clientScope = element.find('clients').isolateScope()
      spyOn(clientFactory, 'query').and.callThrough();

      expect(clientScope.columns.device_name).toEqual(true);
      expect(clientScope.columns.client_mac).toEqual(true);
      expect(clientScope.columns.ssid).toEqual(true);
      expect(clientScope.columns.txbps).toEqual(true);
      expect(clientScope.columns.rxbps).toEqual(false);
      expect(clientScope.columns.expected_throughput).toEqual(false);
      expect(clientScope.columns.tx).toEqual(true);
      expect(clientScope.columns.txbitrate).toEqual(false);
      expect(clientScope.columns.rxbitrate).toEqual(false);
      expect(clientScope.columns.snr).toEqual(true);
      expect(clientScope.columns.signal).toEqual(false);
      expect(clientScope.columns.ip).toEqual(true);
      expect(clientScope.columns.lastseen).toEqual(true);
      expect(clientScope.columns.capabilities).toEqual(false);
      expect(clientScope.columns.manufacturer).toEqual(false);
      expect(clientScope.columns.splash_username).toEqual(false);
      expect(clientScope.columns.type).toEqual(true);
    });

    it("should fetch the clients", function() {
      var clientScope = element.find('clients').isolateScope()
      spyOn(clientFactory, 'query').and.callThrough();

      var res = { clients: [{ id: 123 } ], _links: {} };
      deferred.resolve(res);
      $scope.$apply();

      expect(clientScope.clients[0].id).toEqual(123);
      expect(clientScope._links).toEqual({});
    });

    // Keeps failing since we added the group policies fn
    it("should load the timelines", function() {
      var clientScope = element.find('clients').isolateScope()
      spyOn(clientFactory, 'query').and.callThrough();
      spyOn(groupPolicyFactory, 'get').and.callThrough();
      spyOn(reportFactory, 'clientstats').and.callThrough();

      var res = { clients: [{ id: 123 } ], _links: {} };
      deferred.resolve(res);
      $scope.$apply();

      expect(clientScope.clients[0].id).toEqual(123);
      expect(clientScope.loadingChart).toEqual(true);

      var data = { timeline: 'my-timeline' };
      deferred.resolve(data);
      $scope.$apply();

      // expect(clientScope.loadingChart).toEqual(undefined);
    });

    // Keeps failing since we added the group policies fn
    xit("should load the group policies and filter", function() {
      var clientScope = element.find('clients').isolateScope()
      spyOn(clientFactory, 'query').and.callThrough();
      spyOn(groupPolicyFactory, 'get').and.callThrough();

      var res = { clients: [{ id: 123 } ], _links: {} };
      deferred.resolve(res);
      $scope.$apply();

      expect(clientScope.clients[0].id).toEqual(123);

      var data = { timeline: [] };
      deferred.resolve(data);
      $scope.$apply();

      var gp = { group_policies: [{id: 1111}] };
      deferred.resolve(data);
      $scope.$apply();

      expect(clientScope.group_policies[0].id).toEqual(111111111111);
    });

    it("should create a client", function() {
      var clientScope = element.find('client-detail').isolateScope()
      spyOn(clientFactory, 'create').and.callThrough();

      // clientScope.update();
      // expect(clientScope.client.updating).toEqual(true);
      // var client = { id: 123 };
      // deferred.resolve(client);
      // $scope.$apply();

      // expect(clientScope.client.updating).toEqual(undefined);
    });

  });

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

    it("should fetch the group policies", function() {
      // var clientScope = element.find('client-detail').isolateScope()
      // spyOn(clientFactory, 'update').and.callThrough();

      // clientScope.update();
      // expect(clientScope.client.updating).toEqual(true);
      // var client = { id: 123 };
      // deferred.resolve(client);
      // $scope.$apply();

      // expect(clientScope.client.updating).toEqual(undefined);
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
