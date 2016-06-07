'use strict';

describe('zones creation, listing', function () {

  var $scope,
      element,
      deferred,
      q,
      $routeParams,
      location,
      locationFactory,
      $httpBackend,
      boxFactory,
      networkFactory,
      zoneFactory;

  beforeEach(module('myApp', function($provide) {
    locationFactory = {
      get: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    };
    networkFactory = {
      get: function () {
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
    zoneFactory = {
      destroy: function () {
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
      },
      create: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    };
    $provide.value("Zone", zoneFactory);
    $provide.value("LocationBox", boxFactory);
    $provide.value("Network", networkFactory);
    $provide.value("Location", locationFactory);
  }));

  // beforeEach(module('components/locations/networks/zones.html'));
  beforeEach(module('components/zones/form.html'));
  beforeEach(module('components/zones/details.html'));

  describe('zones creation, listing', function () {

    beforeEach(inject(function($compile, $rootScope, $q, _$routeParams_, $injector) {
      $scope = $rootScope;
      $httpBackend = $injector.get('$httpBackend');
      $httpBackend.whenGET('template/tooltip/tooltip-popup.html').respond("");
      $routeParams = _$routeParams_;
      $routeParams.location_id = 123123123;
      $scope.box = {};
      q = $q;
      $scope.location = { slug: 456, id: 123 }
      element = angular.element('<list-zones></list-zones>');
      $compile(element)($rootScope)
      element.scope().$digest();
    }))

    it("should list the zones for a location", function() {
      spyOn(zoneFactory, 'get').andCallThrough();
      spyOn(locationFactory, 'get').andCallThrough();
      var zone = { zones: [ { zone_name: 'lobby'} ], _info: {} };
      expect(element.isolateScope().loading).toBe(true)
      deferred.resolve(zone);
      $scope.$digest()
      expect(element.isolateScope().location.slug).toBe(123123123);
      expect(element.isolateScope().zone.zones[0].zone_name).toBe(zone.zones[0].zone_name);
      expect(element.isolateScope()._info).toBe(zone._info);
      expect(element.isolateScope().loading).toBe(undefined);
    })

  })

  describe('zones creation, listing', function () {

    beforeEach(inject(function($compile, $rootScope, $q) {
      $scope = $rootScope;
      q = $q;
      $scope.location = { slug: 456, id: 123 }
      element = angular.element('<create-zone></create-zone>');
      $compile(element)($rootScope)
      element.scope().$digest();
    }))

    it("should create a zone and add to the list", function() {
      spyOn(zoneFactory, 'get').andCallThrough();
      var zone = {zone_name: 'simon'};
      element.isolateScope().zone = zone;
      element.isolateScope().zones = { zones: [zone] };
      element.isolateScope().createZone();
      expect(element.isolateScope().creating).toBe(true);
      deferred.resolve(zone);
      $scope.$digest()
      expect(element.isolateScope().zones.zones.length).toBe(2);
      expect(element.isolateScope().creating).toBe(undefined);
      expect(element.isolateScope().zone.zone_name).toBe(undefined);
    })

    it("should not create a zone and add to the list", function() {
      spyOn(zoneFactory, 'get').andCallThrough();
      spyOn(locationFactory, 'get').andCallThrough();
      var zone = {zone_name: 'simon'};
      element.isolateScope().zones = { zones: [zone] };
      element.isolateScope().createZone();
      expect(element.isolateScope().creating).toBe(true);
      var errors = { data: { errors: { base: [123] } } };
      deferred.reject(errors);
      $scope.$digest()
      expect(element.isolateScope().creating).toBe(undefined);
      expect(element.isolateScope().errors).toBe(123);
    })

  });

  describe('updating the zones from the networks', function () {

    beforeEach(inject(function($compile, $rootScope, $q, _$routeParams_) {
      $scope = $rootScope;
      $routeParams = _$routeParams_;
      $routeParams.id = 111;
      q = $q;
      $scope.location = { slug: 456, id: 123 }
      element = angular.element('<network-zones></network-zones>');
      $compile(element)($rootScope)
      element.scope().$digest();
    }))

    it("should list the zones", function() {
    });

    it("should update the active ids for the zones based on network zone ids", function() {
      spyOn(zoneFactory, 'get').andCallThrough();
      expect(element.isolateScope().loading).toBe(true);
      var zones = { zones: [{ zone_name: 'lobby', id: '144'}, {zone_name: 'pantry', id: '55'}] };
      deferred.resolve(zones);
      $scope.$digest();

      expect(element.isolateScope().loading).toBe(undefined);
      expect(element.isolateScope().loading).toBe(undefined);
    });

    it("should update the active ids scope with the selected ids for the zones based on network zone ids", function() {
      var zones =  { zones: [{ zone_name: 'lobby', id: '144', networks: [111]}, {zone_name: 'pantry', id: '55'}] };
      element.isolateScope().zones = zones;
      element.isolateScope().network = {id: 111};

      deferred.resolve(zones);
      $scope.$digest();

      expect(element.isolateScope().zones.length).toBe(2);
      expect(element.isolateScope().zones[0].active).toBe(true);
      expect(element.isolateScope().zones[1].active).toBe(undefined);
      expect(element.isolateScope().in_the_zone['144']).toBe(1);

      // This will update the zone as we have the in the zone as 1 //
      element.isolateScope().update(0)
      expect(element.isolateScope().zone).toBe(zones.zones[0]);
      expect(element.isolateScope().zone.loading).toBe(true);

      deferred.resolve();
      $scope.$digest()
      expect(element.isolateScope().zone.loading).toBe(undefined);

      // This will delete network from the zone as the in the zone check is 0

      element.isolateScope().in_the_zone['144'] = 0;
      element.isolateScope().update(0)
      expect(element.isolateScope().zone).toBe(zones.zones[0]);
      expect(element.isolateScope().zone.loading).toBe(true);

      deferred.resolve();
      $scope.$digest()
      expect(element.isolateScope().zone.loading).toBe(undefined);
    });

    it("should NOT update the active ids 422 from CT", function() {
      var zones =  { zones: [{ zone_name: 'lobby', id: '144', networks: [111]}, {zone_name: 'pantry', id: '55'}] };
      element.isolateScope().zones = zones;
      element.isolateScope().network = {id: 111};

      deferred.resolve(zones);
      $scope.$digest();

      expect(element.isolateScope().zones.length).toBe(2);
      expect(element.isolateScope().zones[0].active).toBe(true);
      expect(element.isolateScope().zones[1].active).toBe(undefined);
      expect(element.isolateScope().in_the_zone['144']).toBe(1);

      // This will update the zone as we have the in the zone as 1 //
      element.isolateScope().update(0)
      expect(element.isolateScope().zone).toBe(zones.zones[0]);
      expect(element.isolateScope().zone.loading).toBe(true);

      deferred.reject();
      $scope.$digest()
      expect(element.isolateScope().zone.loading).toBe(undefined);
      expect(element.isolateScope().zone.errors).toBe(true);

      // This will delete network from the zone as the in the zone check is 0

      element.isolateScope().in_the_zone['144'] = 0;
      element.isolateScope().update(0)
      expect(element.isolateScope().zone).toBe(zones.zones[0]);
      expect(element.isolateScope().zone.loading).toBe(true);

      deferred.reject();
      $scope.$digest();
      expect(element.isolateScope().zone.loading).toBe(undefined);
      expect(element.isolateScope().zone.errors).toBe(true);
    });
  });

  describe('zones show and addition of networks', function () {

    var routeParams = {};

    beforeEach(inject(function($compile, $rootScope, $q, $routeParams) {
      $scope = $rootScope;
      $scope.box = {};
      q = $q;
      routeParams = $routeParams;
      routeParams.location_id = 123456;
      $scope.location = { slug: 456, id: 123 }
      $scope.zones = [];
      // $scope.myForm = {}
      $scope.loading = true;
      element = angular.element('<div location-zone-show loading="loading"></div>');
      $compile(element)($rootScope)
      element.scope().$digest();
    }))

    it("should get the location and the zone", function() {
      $scope.zone = { location_id: 123456 }
      spyOn(zoneFactory, 'query').andCallThrough()
      spyOn(locationFactory, 'get').andCallThrough()

      var zone = {zone: { zone_name: '123', id: 465}, boxes: [{mac: 'mac'}], networks: [{network_id: '789'}]}
      var box = {calledstationid: 'mac', id: 456}
      var network = {ssid: 'polka', id: '789'}

      expect(element.isolateScope().loading).toBe(true)
      deferred.resolve(zone);
      $scope.$digest()
      expect(element.isolateScope().zone).toBe(zone.zone)
      expect(element.isolateScope().zone_boxes).toBe(zone.boxes)
      expect(element.isolateScope().zone_networks).toBe(zone.networks)

      deferred.resolve({boxes: [box]});
      $scope.$digest()
      expect(element.isolateScope().boxes[0]).toBe(box)

      deferred.resolve([network]);
      $scope.$digest()
      expect(element.isolateScope().networks[0]).toBe(network)

      // And update the checkboxes too //
      expect(element.isolateScope().boxes[0].in_the_zone).toBe(true)
      expect(element.isolateScope().networks[0].in_the_zone).toBe(true)
    });

    it("should add a box to the zone by clicking the checkbox", function() {
      $scope.zone = { location_id: 123456 }
      spyOn(zoneFactory, 'update').andCallThrough()
      spyOn(zoneFactory, 'destroy').andCallThrough()

      var zone = {zone: { zone_name: 123, id: 465, boxes: [{mac: 'mac'}], networks: [{network_id: '789'}]} }
      var box = {calledstationid: 'mac', id: 456, in_the_zone: true}
      var network = {ssid: 'polka', id: '789', in_the_zone: true}

      element.isolateScope().boxes                = [box]
      element.isolateScope().networks             = [network]

      // Adds a box //

      element.isolateScope().updateBox(0)
      $scope.$digest()
      expect(element.isolateScope().boxes[0].loading).toBe(true)

      deferred.resolve(box);
      $scope.$digest()

      expect(element.isolateScope().boxes[0].loading).toBe(undefined)

      element.isolateScope().updateNetwork(0)
      $scope.$digest()
      expect(element.isolateScope().networks[0].loading).toBe(true)

      deferred.resolve(network);
      $scope.$digest()

      expect(element.isolateScope().networks[0].loading).toBe(undefined)
    });

    it("should not add a box to the zone by clicking the checkbox", function() {
      $scope.zone = { location_id: 123456 }
      spyOn(zoneFactory, 'update').andCallThrough()
      spyOn(zoneFactory, 'destroy').andCallThrough()

      var zone = {zone: { zone_name: 123, id: 465, boxes: [{mac: 'mac'}], networks: [{network_id: '789'}]} }
      var box = {calledstationid: 'mac', id: 456, in_the_zone: true}
      var network = {ssid: 'polka', id: '789', in_the_zone: true}

      element.isolateScope().boxes                = [box]
      element.isolateScope().networks             = [network]

      // Adds a box //

      element.isolateScope().updateBox(0)
      $scope.$digest()
      expect(element.isolateScope().boxes[0].loading).toBe(true)

      deferred.reject(box);
      $scope.$digest()

      expect(element.isolateScope().boxes[0].loading).toBe(undefined)
      expect(element.isolateScope().boxes[0].errors).toBe(true)

      element.isolateScope().updateNetwork(0)

      deferred.reject(network);
      $scope.$digest()

      expect(element.isolateScope().networks[0].loading).toBe(undefined)
      expect(element.isolateScope().networks[0].errors).toBe(true)
    });

    it("should remove a box to the zone by clicking the checkbox", function() {
      $scope.zone = { location_id: 123456 }
      spyOn(zoneFactory, 'update').andCallThrough()
      spyOn(zoneFactory, 'destroy').andCallThrough()

      var zone = {zone_name: 123, id: 465, boxes: [{mac: 'mac'}], networks: [{network_id: '789'}]}
      var box = {calledstationid: 'mac', id: 456, in_the_zone: false} // <---------------------------------
      var network = {ssid: 'polka', id: '789', in_the_zone: false} // <------------------------------------

      element.isolateScope().boxes                = [box]
      element.isolateScope().networks             = [network]

      element.isolateScope().updateBox(0)
      $scope.$digest()
      expect(element.isolateScope().boxes[0].loading).toBe(true)

      deferred.resolve(box);
      $scope.$digest()

      expect(element.isolateScope().boxes[0].loading).toBe(undefined)

      element.isolateScope().updateNetwork(0)
      $scope.$digest()
      expect(element.isolateScope().networks[0].loading).toBe(true)

      deferred.resolve(network);
      $scope.$digest()

      expect(element.isolateScope().networks[0].loading).toBe(undefined)
    });

  })
})
