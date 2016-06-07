'use strict';

describe('lists location networks', function () {

  var $scope;
  var element;
  var networkFactory;
  var zoneFactory;
  var $routeParams;
  var q;
  var deferred;
  var $httpBackend;

  beforeEach(module('myApp', function($provide) {
    zoneFactory = {
      get: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    };
    networkFactory = {
      update: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      get: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    };
    $provide.value("Zone", zoneFactory);
    $provide.value("Network", networkFactory);
  }));

  beforeEach(module('components/layouts/submit.html'));
  beforeEach(module('components/locations/networks/_index.html'));

  beforeEach(inject(function($compile, $rootScope, $q, _$routeParams_, $injector) {
    $httpBackend = $injector.get('$httpBackend');
    $httpBackend.when('GET', 'template/tooltip/tooltip-html-unsafe-popup.html')
      .respond(200, []);
    $scope = $rootScope;
    $routeParams = _$routeParams_;
    $routeParams.location_id = 123;
    q = $q;
    $scope.location = {
      slug: 123
    }
    element = angular.element('<list-networks></list-networks>');
    $compile(element)($rootScope)
    element.scope().$apply();
  }))

  it("should display the locations networks", function() {
    spyOn(networkFactory, 'get').andCallThrough()
    var network = { network_name: 123 };
    expect(element.isolateScope().loading).toBe(true)
    expect(element.isolateScope().location.slug).toBe(123)
    deferred.resolve([network]);
    $scope.$apply()
    expect(element.isolateScope().networks[0]).toBe(network);
    expect(element.isolateScope().loading).toBe(undefined);
  });

  it("should update a network", function() {
    spyOn(networkFactory, 'update').andCallThrough()
    var network = { network_name: 123, id: 123345 };

    deferred.resolve([network]);
    $scope.$apply()

    expect(element.isolateScope().loading).toBe(undefined)

    element.isolateScope().update(network.id);
    expect(element.isolateScope().networks[0].state).toBe('updating')

    deferred.resolve(network);
    $scope.$apply()

    expect(element.isolateScope().networks[0].state).toBe('updated')
  });

  it("should not update a network", function() {
    spyOn(networkFactory, 'update').andCallThrough()
    var network = { network_name: 123, id: 123345 };

    deferred.resolve([network]);
    $scope.$apply()

    expect(element.isolateScope().loading).toBe(undefined)

    element.isolateScope().update(network.id);
    expect(element.isolateScope().networks[0].state).toBe('updating')

    deferred.reject(network);
    $scope.$apply()

    expect(element.isolateScope().networks[0].state).toBe('failed')
  });

});

describe('resets the location networks', function () {

  var $scope;
  var element;
  var networkFactory;
  var q;
  var deferred;
  var $location;

  beforeEach(module('myApp', function($provide) {
    networkFactory = {
      reset: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    }
    $provide.value("Network", networkFactory);
  }));

  beforeEach(module('components/locations/networks/_index.html'));

  beforeEach(inject(function($compile, $rootScope, $q, _$location_) {
    $location = _$location_;
    $scope = $rootScope;
    q = $q;
    $scope.location = {
      slug: 123
    }
    element = angular.element('<reset-location-networks></reset-location-networks>');
    $compile(element)($rootScope)
    element.scope().$apply();
  }))

  it("should reset the locations networks", function() {
    spyOn(networkFactory, 'reset').andCallThrough()
    spyOn(window, 'confirm').andReturn(true);
    element.find('#reset-networks').click()
    deferred.resolve({location_id: 123});
    $scope.$apply()
    expect($scope.resetting_network).toBe(true)
    expect($location.path()).toBe('/locations/123/networks')
    expect($scope.notifications).toBe('Network Resync Initiated')
  });

  it("should NOT reset the locations networks", function() {
    spyOn(networkFactory, 'reset').andCallThrough()
    spyOn(window, 'confirm').andReturn(true);
    element.find('#reset-networks').click()
    deferred.reject({data: {message: "no" }});
    $scope.$apply()
    expect($scope.resetting_network).toBe(true)
    expect($scope.resetting_errors).toBe('no')
  });

  it("should NOT confirm the reset of the locations networks", function() {
    spyOn(networkFactory, 'reset').andCallThrough()
    spyOn(window, 'confirm').andReturn(false);
    element.find('#reset-networks').click()
    deferred.reject({data: {message: "no" }});
    $scope.$apply()
    expect($scope.resetting_network).toBe(undefined)
  });

});

describe('lists location network - show action', function () {

  var $scope;
  var element;
  var networkFactory;
  var locationFactory;
  var q;
  var deferred;
  var $httpBackend;
  var $routeParams;

  beforeEach(module('myApp', function($provide) {
    locationFactory = {
      get: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    },
    networkFactory = {
      query: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      update: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    };
    $provide.value("Network", networkFactory);
    $provide.value("Location", locationFactory);
  }));

  // beforeEach(module('components/locations/networks/zones.html'));
  beforeEach(module('components/locations/networks/_show.html'));
  beforeEach(module('components/layouts/submit.html'));

  beforeEach(inject(function($compile, $rootScope, $q, $injector, _$routeParams_) {

    $routeParams = _$routeParams_;
    $routeParams.location_id = 123;
    $routeParams.id = 123456;
    $httpBackend = $injector.get('$httpBackend');

    $httpBackend.whenGET('template/tooltip/tooltip-popup.html').respond("");
    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/locations/123/zones')
      .respond(200, [{}]);

    $scope = $rootScope;
    q = $q;
    $scope.location = {
      slug: 123
    }
    $scope.network = {};
    element = angular.element('<display-network></display-network>');
    $compile(element)($rootScope);
    element.scope().$apply();
  }));

  it("should display the locations network details", function() {
    var location = {location_name: 'lllllocationnn', slug: 123, is_monitored: true}
    var network = {network_name: 123123, interface_ipaddr: "192.167.1.1"};
    spyOn(networkFactory, 'query').andCallThrough()
    expect(element.isolateScope().location.slug).toBe(123)
    deferred.resolve(network);
    $scope.$apply()
    expect(element.isolateScope().network).toBe(network)
  });

  it("should have the correct scope params set", function() {
    var enc = {'None': 'none', 'WPA2': 'psk2'};
    var cf = ['Danger', 'Adult', 'Security', 'Family', 'Off'];
    expect(JSON.stringify(element.isolateScope().encryptions)).toBe(JSON.stringify(enc))
    expect(JSON.stringify(element.isolateScope().content_filters)).toBe(JSON.stringify(cf))
  })

  it("should submit the form successfully", function() {

    var location = {location_name: 'lllllocationnn', slug: 123, is_monitored: true}
    var network = {network_name: 123123, interface_ipaddr: "192.167.1.1"};

    $scope.network = {};

    spyOn(networkFactory, 'query').andCallThrough();
    spyOn(networkFactory, 'update').andCallThrough();

    deferred.resolve(network);
    $scope.$apply();
    expect(element.isolateScope().network).toBe(network);

    // element.isolateScope().myForm.$pristine = false
    element.isolateScope().myForm.$invalid = false;

    // expect(element.isolateScope().myForm.$pristine).toBe (false);
    expect(element.isolateScope().myForm.$invalid).toBe (false);

    $scope.$apply();

    element.isolateScope().network.errors = 123;

    /// Chrome won't notice the fucking #update button //
    element.isolateScope().saveNetwork();
    deferred.resolve(network);

    $scope.$apply();
    expect(element.isolateScope().network.updated).toBe(true);
    expect(element.isolateScope().network.errors).toBe(undefined);

    // expect(element.isolateScope().notifications).toBe('Network Updated Successfully');
    expect(element.isolateScope().network.state).toBe('updated');
    expect(element.isolateScope().myForm.$pristine).toBe(true);

  });

  it("should submit the form UNsuccessfully", function() {

    var location = {location_name: 'lllllocationnn', slug: 123, is_monitored: true}
    var network = {network_name: 123123, interface_ipaddr: "192.167.1.1"};

    $scope.network = {};

    spyOn(networkFactory, 'query').andCallThrough();
    spyOn(networkFactory, 'update').andCallThrough();

    deferred.resolve(network);
    $scope.$apply();
    expect(element.isolateScope().network).toBe(network);

    element.isolateScope().myForm.$pristine = false;
    element.isolateScope().myForm.$invalid = false;

    expect(element.isolateScope().myForm.$pristine).toBe (false);
    expect(element.isolateScope().myForm.$invalid).toBe (false);

    $scope.$apply();

    element.isolateScope().saveNetwork();
    deferred.reject({data: {errors: { base: [123]}}});

    $scope.$apply();
    expect(element.isolateScope().network.state).toBe('failed');
    expect(element.isolateScope().network.errors).toBe(123);
    expect(element.isolateScope().submitting).toBe(undefined)

  });

});

describe('creating networks', function () {

  var $scope;
  var element;
  var networkFactory;
  var zoneFactory;
  var locationFactory;
  var q;
  var deferred;
  var $httpBackend;
  var $location;
  var routeParams = {};

  beforeEach(module('myApp', function($provide) {
    zoneFactory = {
      get: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    };
    locationFactory = {
      get: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    };
    networkFactory = {
      destroy: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      create: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    }
    $provide.value("Network", networkFactory);
    $provide.value("Location", locationFactory);
    $provide.value("Zone", zoneFactory);
  }));

  beforeEach(module('components/locations/networks/_show.html'));
  beforeEach(module('components/layouts/submit.html'));

  beforeEach(inject(function($compile, $rootScope, $q, $injector, _$location_, $routeParams ) {

    // $httpBackend = $injector.get('$httpBackend');

    // $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/locations/123/zones')
    //   .respond(200, [{}]);

    // $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/locations/123123')
    //   .respond(200, [{}]);

    $scope = $rootScope;
    q = $q;
    $location = _$location_;
    routeParams = $routeParams;
    routeParams.location_id = 123123
    $scope.location = {
      slug: 123,
      location_name: 'Simon'
    }
    $scope.new_record = true;
    element = angular.element('<new-network location-name="{{ location.location_name }}" ></new-network>');
    $compile(element)($rootScope)
    element.scope().$apply();
  }))

  it("checks the attrs are set correctly", function() {
    var network = {
      ssid: 'Simon Wi-Fi',
      access_type: 'password',
      encryption_type: 'psk2',
      band_steering: true,
      active: true,
      interface_ipaddr: '192.168.220.1',
      dhcp_enabled: true,
      dns_1: '8.8.8.8',
      dns_2: '8.8.4.4',
      interface_netmask: 24,
      use_ps_radius: true,
      captive_portal_ps: true,
      content_filter: 'Security'
    };

    var location = { location_name: '123' }
    deferred.resolve(location);
    $scope.$apply()

    expect(element.isolateScope().network.ssid).toBe('My Wi-Fi Network')
    expect(element.isolateScope().network.band_steering).toBe(true)
  });

//   it("should not let them create more than 16 networks", function() {
//   })

  it("should create a network successfully", function() {
    var network = {network_name: 123123, interface_ipaddr: "192.167.1.1", id: 123456};
    element.isolateScope().network = network;
    spyOn(networkFactory, 'create').andCallThrough();
    spyOn(locationFactory, 'get').andCallThrough();
    spyOn(zoneFactory, 'get').andCallThrough()

    var result = { zones: [ { zone_name: '123' } ] }
    deferred.resolve(result);
    $scope.$apply()

    expect(element.isolateScope().zones[0].zone_name).toBe("123")
    element.isolateScope().saveNetwork();
    expect(element.isolateScope().network.state).toBe('creating');
    deferred.resolve(network);
    $scope.$apply();
    expect($location.path()).toBe('/locations/123123/networks/123456');
  });

  it("should create a network via fast method!", function() {
    var network = {network_name: 123123, interface_ipaddr: "192.167.1.1", id: 123456};
    element.isolateScope().network = network;
    spyOn(networkFactory, 'create').andCallThrough()
    spyOn(zoneFactory, 'get').andCallThrough()
    element.isolateScope().saveNetwork()
    expect(element.isolateScope().network.state).toBe('creating')
    deferred.resolve(network);
    $scope.$apply()
    expect($location.path()).toBe('/locations/123123/networks/123456')
  });

});

describe('showing the networks', function () {

  var $scope;
  var element;
  var networkFactory;
  var locationFactory;
  var q;
  var deferred;
  var $httpBackend;
  var $location;
  var $routeParams;

  beforeEach(module('myApp', function($provide) {
    networkFactory = {
      query: function () {
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
      radtest: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      create: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    }
    $provide.value("Network", networkFactory);
  }));

  beforeEach(module('components/locations/networks/_show.html'));
  beforeEach(module('components/layouts/submit.html'));

  beforeEach(inject(function($compile, $rootScope, $q, $injector, _$location_, _$routeParams_ ) {

    $httpBackend = $injector.get('$httpBackend');

    $httpBackend.whenGET('template/tooltip/tooltip-popup.html').respond("");

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/locations/123123/zones')
      .respond(200, [{}]);

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/locations/123/zones')
      .respond(200, [{}]);

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/locations/123123')
      .respond(200, [{}]);

    $scope = $rootScope;
    q = $q;
    $location = _$location_;

    $routeParams = _$routeParams_;
    $routeParams.location_id = 123;
    $routeParams.id = 123456;

    $scope.location = {
      slug: 123,
      location_name: 'Simon'
    }
    $scope.new_record = true;
    element = angular.element('<display-network new-record="{{ new_record }}"></display-network>');
    $compile(element)($rootScope)
    element.scope().$apply();
  }))


  it("should not let them create more than 16 networks", function() {
  })

  xit("should set the route params because the network has a job id", function() {
    // Out cos I cant find the rootScope
    var network = {network_name: 123123, interface_ipaddr: "192.167.1.1", slug: 123456, job_id: 123};
    element.isolateScope().network = network;
    expect($scope.banneralert).toBe(123)
  })

  it("should go about creating a job", function() {
    spyOn(networkFactory, 'update').andCallThrough()
    spyOn(window, 'confirm').andReturn(true);
    var network = {network_name: 123123, interface_ipaddr: "192.167.1.1", slug: 123456, job_id: 123};
    element.isolateScope().network = network;
    element.isolateScope().sync();
    expect(element.isolateScope().network.state).toBe('syncing');

    deferred.resolve(network);
    $scope.$apply()
    expect(element.isolateScope().network.job_id).toBe(123);
    expect(element.isolateScope().network.state).toBe(undefined);
  })

  it("should go about NOT creating a job", function() {
    spyOn(window, 'confirm').andReturn(true);
    spyOn(networkFactory, 'update').andCallThrough()
    var network = {network_name: 123123, interface_ipaddr: "192.167.1.1", slug: 123456, job_id: 123};
    element.isolateScope().network = network;
    element.isolateScope().sync();
    expect(element.isolateScope().network.state).toBe('syncing');

    var errors = { base: { message: 123 }}
    deferred.reject(errors);
    $scope.$apply()
    expect(element.isolateScope().network.errors).toBe(123);
  })

  it("should go about cancelling a job", function() {
    spyOn(window, 'confirm').andReturn(true);
    spyOn(networkFactory, 'update').andCallThrough()
    var network = {network_name: 123123, interface_ipaddr: "192.167.1.1", slug: 123456, job_id: 123};
    element.isolateScope().network = network;
    element.isolateScope().cancelJob();
    expect(element.isolateScope().network.state).toBe('cancelling');

    deferred.resolve({networks: [network]});
    $scope.$apply()
    expect(element.isolateScope().network.job_id).toBe(undefined);
    expect(element.isolateScope().network.state).toBe(undefined);
  })

  it("should not go about cancelling a job", function() {
    spyOn(window, 'confirm').andReturn(true);
    spyOn(networkFactory, 'update').andCallThrough()
    var network = {network_name: 123123, interface_ipaddr: "192.167.1.1", slug: 123456, job_id: 123};
    element.isolateScope().network = network;
    element.isolateScope().cancelJob();
    expect(element.isolateScope().network.state).toBe('cancelling');

    deferred.reject({ base: { message: '123' } });
    $scope.$apply()
    expect(element.isolateScope().network.job_id).toBe(undefined);
    expect(element.isolateScope().network.state).toBe('failed');
    expect(element.isolateScope().network.errors).toBe('123');
  })

  it("should delete a network successfully", function() {
    spyOn(networkFactory, 'destroy').andCallThrough()
    spyOn(window, 'confirm').andReturn(true);
    var network = {network_name: 123123, interface_ipaddr: "192.167.1.1", slug: 123456};
    element.isolateScope().network = network;
    element.isolateScope().destroyNetwork(network.slug)
    expect(networkFactory.destroy).toHaveBeenCalled();
    deferred.resolve({networks: [network]});
    $scope.$apply()
    expect($location.path()).toBe('/locations/123/networks')
  });

  it("should NOT delete a network successfully", function() {
    spyOn(networkFactory, 'destroy').andCallThrough()
    spyOn(window, 'confirm').andReturn(true);
    var network = {network_name: 123123, interface_ipaddr: "192.167.1.1", slug: 123456};
    element.isolateScope().network = network;
    element.isolateScope().destroyNetwork(network.slug)
    expect(networkFactory.destroy).toHaveBeenCalled();
    deferred.reject({data: {errors: { base: [123]}}});
    $scope.$apply()
    expect(element.isolateScope().delete_errors[0]).toBe(123)
  });

  it("should cancel deleting a network", function() {
    spyOn(networkFactory, 'destroy').andCallThrough()
    spyOn(window, 'confirm').andReturn(false);
    var network = {network_name: 123123, interface_ipaddr: "192.167.1.1", slug: 123456};
    element.isolateScope().network = network;
    element.isolateScope().destroyNetwork(network.slug)
    expect(networkFactory.destroy).not.toHaveBeenCalled();
  });

  describe("radtest test", function() {

    beforeEach(inject(function($compile, $rootScope, $q, $injector, _$location_, _$routeParams_ ) {

      var network = {radius_8021x_host_1: '1.2.3.4', radius_8021x_secret_1: 'secret'};
      $scope.network = network

      element = angular.element('<network-radtest host=\'{{ network.radius_8021x_host_1 }}\' secret=\'{{ network.radius_8021x_secret_1 }}\' testing=\'network.running_radtest\'></network-radtest>');
      $compile(element)($rootScope)
      element.scope().$apply();
    }))


    it("should run the freaking radius test", function() {
      spyOn(networkFactory, 'radtest').andCallThrough()
      element.isolateScope().runRadtest('username', 'passy')
      expect(element.isolateScope().testing).toEqual(undefined)
      expect(element.isolateScope().loading).toEqual(true)

      deferred.resolve(true);
      $scope.$apply()
      expect(element.isolateScope().loading).toEqual(undefined)
      expect(element.isolateScope().testing).toEqual(true)
      expect($scope.network.running_radtest).toEqual(true)
    })

    it("should fail to run the freaking radius test", function() {
      spyOn(networkFactory, 'radtest').andCallThrough()
      element.isolateScope().runRadtest('username', 'passy')
      expect(element.isolateScope().loading).toEqual(true)

      deferred.reject();
      $scope.$apply()
      expect(element.isolateScope().loading).toEqual(undefined)
      expect(element.isolateScope().failed).toEqual(true)
    })

  })

});
