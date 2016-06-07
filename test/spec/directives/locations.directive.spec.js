'use strict';

describe('locations list LOGGED IN USER', function () {

  var $scope;
  var element;
  var locationFactory;
  var reportFactory;
  var settingsFactory;
  var $timeout;
  var $loc;
  var q;
  var deferred;
  var $httpBackend;

  beforeEach(module('components/locations/index/_index.html'));
  beforeEach(module('components/stats/clients/_index_brief.html'));

  beforeEach(module('myApp', function($provide) {
    settingsFactory = {
      get: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      update: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
    };
    locationFactory = {
      query: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      get: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      update: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
    };
    reportFactory = {
      get: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      clients: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      periscope: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    };
    $provide.value("Location", locationFactory);
    $provide.value("Report", reportFactory);
    $provide.value("UserSettings", settingsFactory);
  }));

  describe("location index", function() {

    beforeEach(inject(function($compile, $rootScope, $q, $injector) {
      $scope = $rootScope;
      $scope.loggedIn = true;
      q = $q;

      $httpBackend = $injector.get('$httpBackend');
      $httpBackend.whenGET('components/home/hello.html').respond("");
      $httpBackend.whenGET('template/pagination/pagination.html').respond("");
      $httpBackend.whenGET('components/locations/index/index.html').respond("");
      $httpBackend.whenGET('template/modal/backdrop.html').respond("");
      $httpBackend.whenGET('template/modal/window.html').respond("");
      $httpBackend.whenGET('template/tooltip/tooltip-popup.html').respond("");
    }));

    describe('location periscope', function() {

      beforeEach(inject(function($compile, $rootScope, $q, $injector) {
        element = angular.element('<periscope></periscope>');
        $compile(element)($rootScope);
        $scope.$apply();
      }));

      it("should get the periscope", function() {
        spyOn(reportFactory, 'periscope').andCallThrough();

        var stats = {_stats: {}, periscope: { devices: [1,2,3], throughput: [1,3,2] } } ;
        deferred.resolve(stats);
        $scope.$apply();

        expect(element.isolateScope().loading).toBe(undefined);
        expect(element.isolateScope()._stats).toBe(stats._stats);
        expect(element.isolateScope().charts).toBe(2);
      });

    });

    describe('periscope settings', function() {

      beforeEach(inject(function($compile, $rootScope, $q, $injector) {
        element = angular.element('<periscope-settings></periscope-settings>');
        $compile(element)($rootScope);
        $scope.$apply();
      }));

      it("should get the periscope user settings", function() {
        spyOn(settingsFactory, 'get').andCallThrough();

        element.isolateScope().fetch();
        expect(element.isolateScope().loading).toBe(true);
        var settings = { a: 123 };
        deferred.resolve(settings);
        $scope.$apply();

        expect(element.isolateScope().loading).toBe(undefined);
        expect(element.isolateScope().settings).toBe(settings);
      });

      it("should update the periscope user settings", function() {
        spyOn(settingsFactory, 'update').andCallThrough();

        element.isolateScope().update();
        // expect(element.isolateScope().loading).toBe(true);
        var settings = { a: 123 };
        deferred.resolve(settings);
        $scope.$apply();

        // expect(element.isolateScope().loading).toBe(undefined);
        // expect(element.isolateScope().settings).toBe(settings);
      });

    });

    describe('location listing', function() {

      beforeEach(inject(function($compile, $rootScope, $q, $injector) {
        element = angular.element('<list-locations></list-locations>');
        $compile(element)($rootScope);
        $scope.$apply();
      }));

      // Arg too many resolves :( ///
      xit("should list the locations", function() {
        spyOn(locationFactory, 'query').andCallThrough();
        expect(element.isolateScope().loading).toBe(true);
        var locations = { locations: [ {location_name: 'simon morley'}], _links: {}, _stats: {} };

        deferred.resolve(locations);
        $scope.$apply();

        // Resolve twice as we have a compile action in directive //
        deferred.resolve(locations);
        $scope.$apply();

        expect(element.isolateScope().loading).toBe(undefined);
        // expect(element.isolateScope()._links).toBe(locations._links);
        // expect(element.isolateScope().locations).toBe(locations.locations);
      });

      it("should get the location info by clicking the table row", function() {
        element.isolateScope().locations = [{ slug: 112312323}];
        element.isolateScope().filtered = [{ slug: 112312323}];
        spyOn(locationFactory, 'get').andCallThrough();

        expect(element.isolateScope().getLocation(0));
        expect(element.isolateScope().location.state).toBe('loading');
        var location = { location_name: 'simon', _info: {}}

        deferred.resolve(location);
        $scope.$apply();

        expect(element.isolateScope().location).toBe(location);
        expect(element.isolateScope()._info).toBe(location._info);
      });

      it("should update the location", function() {
        element.isolateScope().location = { } ;
        element.isolateScope().editDesc = true;
        spyOn(locationFactory, 'update').andCallThrough();

        expect(element.isolateScope().update());
        expect(element.isolateScope().location.state).toBe('updating');
        var location = { description: 'simon'}

        deferred.resolve(location);
        $scope.$apply();

        expect(element.isolateScope().location.description).toBe('simon');
        expect(element.isolateScope().location.state).toBe('updated');
        expect(element.isolateScope().editDesc).toBe(undefined);
      });

      it("should not update the location", function() {
        element.isolateScope().location = { } ;
        element.isolateScope().filtered = { } ;
        spyOn(locationFactory, 'update').andCallThrough();

        expect(element.isolateScope().update());
        expect(element.isolateScope().location.state).toBe('updating');
        var location = { description: 'simon'}

        deferred.reject();
        $scope.$apply();

        expect(element.isolateScope().location.description).toBe(undefined);
        expect(element.isolateScope().location.state).toBe('failed');
        expect(element.isolateScope().location.errors).toBe('There was a problem updating your location.');
      });
    });

    describe("location index - with the cookies for HG", function() {

      beforeEach(inject(function($compile, $rootScope, $q, $injector, _$routeParams_) {
        var $routeParams;
        $routeParams    = _$routeParams_;
        $routeParams.hg = true;

        element = angular.element('<list-locations></list-locations>');
        $compile(element)($rootScope);
        $scope.$apply();
      }));

      it("should save the hg val in the cookies", function() {
        // spyOn(locationFactory, 'query').andCallThrough();
        // expect(element.isolateScope().loading).toBe(true);
        // var locations = { locations: [ {location_name: 'simon'}], _links: {}, _stats: {} };

        // expect(element.isolateScope().hg).toBe(true);
        // element.isolateScope().toggleCharts();
        // expect(cookies to be set isnt work! )
      });

    });

    describe("Preview", function() {

      beforeEach(inject(function($compile, $rootScope, $q, $injector, _$timeout_, _$routeParams_, _$location_) {
        var $routeParams;
        $routeParams = _$routeParams_;
        $routeParams.preview = true;
        $loc = _$location_;

        element = angular.element('<list-locations></list-locations>');
        $compile(element)($rootScope);
        $scope.$apply();
      }));

      // Removing since we use periscope now //
      // it("should render the preview page etc and hide the charts", function() {
      //   spyOn(locationFactory, 'query').andCallThrough();
      //   expect(element.isolateScope().loading).toBe(true);
      //   var locations = { locations: [ {location_name: 'simon'}], _links: {}, _stats: {} };
      //   expect(element.isolateScope().preview).toBe(true);
      //   expect(element.isolateScope().hg).toBe(undefined);
      //   // expect($loc.search().hg).toBe(true);

      //   deferred.resolve(locations);
      //   $scope.$apply();
      //   expect(element.isolateScope().hg).toBe(true);
      //   // expect($loc.search().hg).toBe(undefined);

      //   // expect(cookies to be set isnt work! )
      // });

    });

  });


  describe("Dashing", function() {

    beforeEach(inject(function($compile, $rootScope, $q, $injector, _$timeout_) {
      $scope = $rootScope;
      $timeout = _$timeout_;
      q = $q;

      $httpBackend = $injector.get('$httpBackend');
      $httpBackend.whenGET('template/tooltip/tooltip-popup.html').respond("");
      element = angular.element('<dashing></dashing>');
      $compile(element)($rootScope);
      $scope.$apply();
    }));

    it("should list the locations", function() {
      spyOn(locationFactory, 'query').andCallThrough();
      $timeout.flush()
      expect(element.isolateScope().loading).toBe(true);
      var stats = { stats: { a: 123, boxes: { states: [] } } };

      deferred.resolve(stats);
      $scope.$apply();

      expect(element.isolateScope().loading).toBe(undefined);
      expect(element.isolateScope().stats).toBe(stats.stats);
    });
  });

  describe("changes the location token", function() {

    beforeEach(inject(function($compile, $rootScope, $q, $injector, _$timeout_) {
      $scope = $rootScope;
      $timeout = _$timeout_;
      q = $q;
      element = angular.element('<change-location-token></change-location-token>');
      $compile(element)($rootScope);
      $scope.$apply();
    }));

    it("should list the locations", function() {
      spyOn(window, 'confirm').andReturn(true);
      spyOn(locationFactory, 'update').andCallThrough();
      element.isolateScope().changeToken();
      expect(element.isolateScope().loading).toBe(true);
      var loc = { api_token: 123 };

      deferred.resolve(loc);
      $scope.$apply();

      expect(element.isolateScope().loading).toBe(undefined);
      expect(element.isolateScope().token).toBe(123);
    });
  });

});

describe('locations form success', function () {

  var $scope;
  var element;

  beforeEach(module('myApp'));

  beforeEach(inject(function($compile, $rootScope) {
    $scope = $rootScope;
    element = angular.element("<form-success></form-success>");
    $compile(element)($rootScope)
  }));

  it("should add success message to the page", function() {
    expect(element.html()).toBe('<p class="text-success"><b>Settings Updated <i class="fa fa-check fa-fw"></i></b></p>');
  });

});

describe('locations network icon', function () {

  var $scope;
  var element;

  beforeEach(module('myApp'));

  beforeEach(inject(function($compile, $rootScope) {
    $scope = $rootScope;
    element = angular.element("<locations-network-icon name='polkaspots'></locations-network-icon>");
    $compile(element)($rootScope)
  }))

  it("should add a link to the advanced settings", function() {
    expect(element.html()).toBe('<img src="https://d3e9l1phmgx8f2.cloudfront.net/images/icons/logo-mini-{{ network_name }}.svg" width="{{ icon_size }}">');
  });

});

describe('reset dem logins homeboys!', function () {

  var $scope;
  var element;
  var locationFactory;
  var q;
  var deferred;

  beforeEach(module('myApp', function($provide) {
    locationFactory = {
      reset_layouts: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    }
    $provide.value("Location", locationFactory);
  }));

  beforeEach(inject(function($compile, $rootScope, $q) {
    $scope = $rootScope;
    q = $q;
    $scope.location = {

    }
    element = angular.element('<div reset-layouts><p>RS</p></div>');
    $compile(element)($rootScope)
  }))

  it("should reset the login pages", function() {
    spyOn(locationFactory, 'reset_layouts').andCallThrough()
    element.find("p").click()
    expect($scope.location.state).toBe('processing')
    deferred.resolve({slug: 123, is_monitored: true});
    $scope.$apply()
    expect(locationFactory.reset_layouts).toHaveBeenCalled();
    expect($scope.location.state).toBe('resetting')
  });

  it("should not reset the login pages", function() {
    spyOn(locationFactory, 'reset_layouts').andCallThrough()
    element.find("p").click()
    deferred.reject({data: {errors: { base: [123]}}});
    $scope.$apply()
    expect(locationFactory.reset_layouts).toHaveBeenCalled();
    expect($scope.location.state).toBe('failed')
  });

});

describe('create location tests', function () {

  var $scope;
  var element;
  var locationFactory;
  var q;
  var $location;
  var deferred;
  var $httpBackend;

  beforeEach(module('myApp', function($provide) {
    locationFactory = {
      save: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    }
    $provide.value("Location", locationFactory);
  }));

  // beforeEach(module('components/locations/new/form.html')); // The external template file referenced by templateUrl

  beforeEach(inject(function($compile, $rootScope, $q, _$location_, $injector) {
    $httpBackend = $injector.get('$httpBackend');
    $httpBackend.whenGET('template/tooltip/tooltip-popup.html').respond("");
    $scope = $rootScope;
    $location = _$location_;
    q = $q;
    $scope.location = {}
    $scope.box = {};
    element = angular.element('<new-location-form></new-location-form>');
    $compile(element)($rootScope)
    element.scope().$apply();
  }))

  it("should put form on page and fill in correct fields with valid data", function() {

    spyOn(locationFactory, 'save').andCallThrough()
    var name = "Billys Location";
    var address = "1 Long Road";
    var cont;
    $scope.loading = false;

    cont = element.find('input[name*="location_name"]').controller('ngModel');
    cont.$setViewValue(name);
    // expect($scope.myForm.$pristine).toBe (false);
    // expect($scope.myForm.$invalid).toBe (true);
    expect(element.isolateScope().location.location_name).toBe(name);

    cont = element.find('input[name*="location_address"]').controller('ngModel');
    cont.$setViewValue(address);
    expect(element.isolateScope().location.location_address).toBe(address)

    // expect($scope.myForm.$invalid).toBe (false);

    // // element.find(':button').click()
    // // Chrome cant click //
    element.isolateScope().locationSave(element.isolateScope().location);
    expect(element.isolateScope().location.creating).toBe(true);
    deferred.resolve({slug: 123, is_monitored: true});
    $scope.$apply()
    expect($location.path()).toBe('/locations/123')
  });

  it("should put form on page and fill in correct fields with valid data but get 422 from CT", function() {
    spyOn(locationFactory, 'save').andCallThrough();
    var name = "Billys Location";
    var address = "1 Long Road";
    $scope.loading = false;

    var cont = element.find('input[name*="location_name"]').controller('ngModel');
    cont.$setViewValue(name);
    var cont = element.find('input[name*="location_address"]').controller('ngModel');
    cont.$setViewValue(address);

    // element.find(':button').click()
    // Chrome cant click //
    element.isolateScope().locationSave(element.isolateScope().location);
    expect(element.isolateScope().location.creating).toBe(true);
    expect(locationFactory.save).toHaveBeenCalled();
    deferred.reject({data: { message: [{ name: 'failed, mother fucker'}]}});
    $scope.$apply();
    expect(element.isolateScope().errors.length).toBe(1)
    expect(element.isolateScope().location.creating).toBe(undefined)
    // expect(element.isolateScope().myForm.$pristine).toBe (true);
  });

  it("should put form on page and fill in correct fields with valid data and add the ap_mac to the params too", function() {
    spyOn(locationFactory, 'save').andCallThrough()
    var name = "Billys Location";
    var address = "1 Long Road";

    window.localStorage.setItem("ap_mac", "macaddy");

    element.isolateScope().loading = false;

    var cont = element.find('input[name*="location_name"]').controller('ngModel');
    cont.$setViewValue(name);
    var cont = element.find('input[name*="location_address"]').controller('ngModel');
    cont.$setViewValue(address);

    // element.find(':button').click()
    // Chrome cant click //
    element.isolateScope().locationSave(element.isolateScope().location);
    expect(locationFactory.save).toHaveBeenCalled();
    deferred.resolve({slug: 123, is_monitored: true});
    $scope.$apply()
    expect($location.path()).toBe('/locations/123')
    expect(window.localStorage.ap_mac).toBe(undefined);
  });

});

describe('location creation shit, redirect and display the loading page then go to ppopup after sockets', function () {

  var $scope;
  var element;
  var locationFactory;
  var q;
  var $location;
  var deferred;
  var newLocationModal;

  beforeEach(module('myApp', function($provide) {
    locationFactory = {
      query: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    }
    $provide.value("Location", locationFactory);
  }));

  beforeEach(module('components/locations/show/attr-generated.html'));

  beforeEach(inject(function($compile, $rootScope, $q, _$location_) {
    $scope = $rootScope;
    q = $q;
    $location = _$location_;
    $scope.box = {}
    $scope.location = {}
    element = angular.element('<new-location-creating></new-location-creating>');
    $compile(element)($rootScope)
    element.scope().$apply();

    $scope.newLocationModal = function() {
      return true;
    };

  }))

  it("should finalise the location and display home page", function() {
    spyOn($scope, 'newLocationModal').andCallThrough();

    $scope.location.attr_generated = false;
    expect($scope.location.attr_generated).toBe(false)
    expect(element.find('#finalising-location').hasClass('ng-show')).toBe(false);

    $scope.locationFinalised()
    $scope.$apply();
    expect($scope.location.attr_generated).toBe(true)
    expect(element.find('#finalising-location').hasClass('ng-hide')).toBe(true);

  })

});

describe('goes and grabs the location stats', function () {

  var $scope;
  var element;
  var locationFactory;
  var boxFactory;
  var q;
  var $httpBackend;
  var $location;
  var deferred;
  var $compile;
  var $cookies;

  beforeEach(module('myApp', function($provide) {
    locationFactory = {
      stats: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    }
    boxFactory = {
      update: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    }
    $provide.value("Box", boxFactory);
    $provide.value("Location", locationFactory);
  }));

  beforeEach(module('components/locations/show/location-dash.html'));
  beforeEach(module('components/locations/show/location-dash-table.html'));

  beforeEach(inject(function($compile, $rootScope, $q, _$location_, $injector, _$cookies_) {
    var eventMethods = [
      'Ga',
      'Ke',
      'Nj',
      'Og',
      'T',
      'addDomListener',
      'addDomListenerOnce',
      'addListener',
      'addListenerOnce',
      'bind',
      'clearInstanceListeners',
      'clearListeners',
      'forward',
      'removeListener',
      'trigger'
    ]

    var latLngMethods = [
      'b',
      'contains',
      'equals',
      'extend',
      'getCenter',
      'getNorthEast',
      'getSouthWest',
      'intersects',
      'isEmpty',
      'toSpan',
      'toString',
      'toUrlValue',
      'union'
    ]

    var mapClasses = [
      'BicyclingLayer',
      'Circle',
      'DirectionsRenderer',
      'DirectionsService',
      'DistanceMatrixService',
      'ElevationService',
      'FusionTablesLayer',
      'Geocoder',
      'GroundOverlay',
      'ImageMapType',
      'InfoWindow',
      'KmlLayer',
      'LatLng',
      'MVCArray',
      'MVCObject',
      'MapTypeRegistry',
      'Marker',
      'MarkerImage',
      'MaxZoomService',
      'OverlayView',
      'Point',
      'Polygon',
      'Polyline',
      'Rectangle',
      'Size',
      'StreetViewPanorama',
      'StreetViewService',
      'StyledMapType',
      'TrafficLayer',
      'TransitLayer',
      '__gjsload__'
    ]

    window.google = {
      maps: {
        event: jasmine.createSpyObj('google.maps.event', eventMethods),
        LatLng: function() {
          return jasmine.createSpyObj('google.maps.LatLng', latLngMethods);
        },
        LatLngBounds: function() {
          return jasmine.createSpyObj('google.maps.LatLngBounds', latLngMethods);
        },
        InfoWindow: function() {
          return jasmine.createSpyObj('google.maps.InfoWindow', mapClasses);
        },
      }
    };

    $httpBackend = $injector.get('$httpBackend');
    $httpBackend.when('GET', 'template/tooltip/tooltip-html-unsafe-popup.html')
      .respond(200, [{location_name: 'derby-council'}]);
    $httpBackend.whenGET('template/tooltip/tooltip-popup.html').respond("");
    $scope = $rootScope;
    $compile = $compile;
    q = $q;
    $cookies = _$cookies_;
    $location = _$location_;
    $scope.location = {setup_fin: false, access_fin: false}
    element = angular.element('<location-stats></location-stats>');
    $compile(element)($rootScope)
    element.scope().$apply();
  }))

  it("add the stats to the page", function() {
    spyOn(locationFactory, 'stats').andCallThrough()

    expect(element.isolateScope().loading_stats).toBe(true)
    var results = {boxes: [{id: 123}], location: {name: 123}, summary: {a: 456}, timeline: {aa: 123}, _stats: {}}
    deferred.resolve(results);
    $scope.$apply()
    expect(element.isolateScope().loading_stats).toBe(undefined)
    expect(element.isolateScope()._stats).toBe(results._stats)
    expect(element.isolateScope().boxes).toBe(results.boxes)
    expect(element.isolateScope().location).toBe(results.location)
    expect(element.isolateScope().timeline).toBe(results.timeline)
    expect(element.isolateScope().quantity).toBe(5)
    expect(element.isolateScope().predicate).toBe('-sessions')
  })

  it("should swap between the map and the stats and set a cookie", function() {
    spyOn(locationFactory, 'stats').andCallThrough()
    expect(element.isolateScope().loading_stats).toBe(true)

    var results = {boxes: [{id: 123}], location: {name: 123}, summary: {a: 456}, timeline: {aa: 123}, _stats: {}}
    deferred.resolve(results);
    $scope.$apply()
    expect(element.isolateScope().loading_stats).toBe(undefined)

    expect(element.isolateScope().load_map).toEqual(true);
    expect($cookies.get('ctLocView')).toEqual(undefined)

    element.isolateScope().switchView();
    var c = $cookies.get('ctLocView')
    expect(JSON.parse(c).view).toEqual('stats')

    element.isolateScope().switchView();
    var c = $cookies.get('ctLocView')
    expect(JSON.parse(c).view).toEqual('map')
  });

  it("should hide the panel and set a cookie", function() {
    $cookies.remove('ctLocView')
    expect($cookies.get('ctLocView')).toEqual(undefined)

    element.isolateScope().togglePanel();
    expect(element.isolateScope().hidePanel).toEqual(true)
    var c = $cookies.get('ctLocView')
    expect(JSON.parse(c).panel).toEqual('closed')

    element.isolateScope().togglePanel();
    expect(element.isolateScope().hidePanel).toEqual(false)
    var c = $cookies.get('ctLocView')
    expect(JSON.parse(c).panel).toEqual('open')
  });

  it("should update the nas lat lng", function() {

    var vars = {
      slug: 123,
      lat: 50,
      lng: 10,
      zoom: 10
    }

    var opts = {}
    spyOn(boxFactory, 'update').andCallThrough()
    element.isolateScope().updateCT(opts)
    expect(boxFactory.update).toHaveBeenCalled();
  });


});

describe('should add the bottom nav banner to page', function () {

  var $scope;
  var element;
  var locationFactory;
  var q;
  var $location;
  var deferred;

  beforeEach(module('myApp', function($provide) {
    locationFactory = {
      stats: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    }
    $provide.value("Location", locationFactory);
  }));

  beforeEach(module('components/locations/layouts/location-banner.html'));

  beforeEach(inject(function($compile, $rootScope, $q, _$location_) {
    $scope = $rootScope;
    q = $q;
    $location = _$location_;
    $scope.location = {setup_fin: false, access_fin: false, archived: true}
    element = angular.element('<location-banner></location-banner>');
    $compile(element)($rootScope)
    element.scope().$apply();
  }))

  it("add the banner to the page", function() {
    var html = element.html()
    expect(html == undefined).toBe(false)
  })

  it("add the alert css to the banner when archived", function() {
    expect(element.find('#location-banner').hasClass('bottom-nav-archived')).toBe(true);
  })

});

describe('display the number of boxes online and alerting', function () {

  var $scope;
  var element;
  var locationFactory;
  var q;
  var $location;
  var compile;
  var deferred;

  beforeEach(module('myApp', function($provide) {
    locationFactory = {
      stats: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    }
    $provide.value("Location", locationFactory);
  }));

  beforeEach(inject(function($compile, $rootScope, $q, _$location_) {
    $scope = $rootScope;
    compile = $compile;
    q = $q;
    $location = _$location_;
    $scope.location = {setup_fin: false, access_fin: false, archived: true}
  }))

  it("add the boxes with probls to the page", function() {
    element = angular.element('<location-boxes-online></location-boxes-online>');
    compile(element)($scope)
    element.scope().$apply();
    expect(element.find('#location-box-states').hasClass('ng-show')).toBe(false)

    $scope.location.stats = {
      boxes: [{state: 'Online'}]
    }
    compile(element)($scope)
    element.scope().$apply();
    expect(element.find('#location-box-states').hasClass('ng-hide')).toBe(false)
    expect($scope.location.boxes_online).toBe (1)
    expect($scope.location.boxes_alerting).toBe (0)
  })

});

describe('location admins', function () {

  var $scope;
  var element;
  var locationFactory;
  var inviteFactory;
  var q;
  var deferred;

  beforeEach(module('components/locations/settings/admin-users.html'));

  beforeEach(module('myApp', function($provide) {
    inviteFactory = {
      destroy: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    };
    locationFactory = {
      users: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      del_user: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      add_user: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    }
    $provide.value("Location", locationFactory);
    $provide.value("Invite", inviteFactory);
  }));

  beforeEach(inject(function($compile, $rootScope, $q) {
    $scope = $rootScope;
    q = $q;
    $scope.location = {}
    $scope.location.slug = 123
    element = angular.element('<location-admins slug="{{location.slug}}"></location-admins>');
    $compile(element)($rootScope)
    element.scope().$apply();
  }))

  describe('location admin users', function () {

    it("gets a list of all the admins users", function() {
      var admin = { email: 's@ps.com' }
      spyOn(locationFactory, 'users').andCallThrough()
      expect(element.isolateScope().admins.loading).toBe(true)
      deferred.resolve({admin_users: [admin]});
      $scope.$apply()
      expect(element.isolateScope().admins[0]).toBe(admin)
      expect(element.isolateScope().admins.loading).toBe(undefined)
    });

    it("doesnt get a list of all the admins users", function() {
      var admin = { admin_users: { email: 's@ps.com' } }
      spyOn(locationFactory, 'users').andCallThrough()
      expect(element.isolateScope().admins.loading).toBe(true)
      deferred.reject({data: {errors: { base: [123]}}});
      $scope.$apply()
      expect(element.isolateScope().admins.loading).toBe(undefined)
      expect(element.isolateScope().admins.errors[0]).toBe(123)
    });

    it("should successfully revoke an invite", function() {
      spyOn(window, 'confirm').andReturn(true);
      var invite = { password: 123, current_password: 456, slug: 123 };
      element.isolateScope().admins = {};
      element.isolateScope().admins.invitesV2 = [];
      element.isolateScope().admins.invitesV2.push(invite)

      element.isolateScope().revokeInvite(0)
      expect(element.isolateScope().revoking).toBe(true);
      expect(element.isolateScope().admins.invitesV2[0].state).toBe('revoking');

      deferred.resolve(invite);
      $scope.$apply();
      expect(element.isolateScope().admins.invitesV2.length).toBe(0);
      expect(element.isolateScope().revoking).toBe(undefined);
    })

    it("should not successfully revoke an invite", function() {
      spyOn(window, 'confirm').andReturn(true);
      var invite = { password: 123, current_password: 456, slug: 123, state: 'pending' };
      element.isolateScope().admins = {};
      element.isolateScope().admins.invitesV2 = [];
      element.isolateScope().admins.invitesV2.push(invite)

      element.isolateScope().revokeInvite(0)
      expect(element.isolateScope().revoking).toBe(true);
      expect(element.isolateScope().admins.invitesV2[0].state).toBe('revoking');

      deferred.reject({data: { message: 123}});
      $scope.$apply();
      expect(element.isolateScope().admins.invitesV2[0].state).toBe('pending');
      expect(element.isolateScope().revoking).toBe(undefined);
    })

    it("should successfully revoke an admin", function() {
      spyOn(window, 'confirm').andReturn(true);
      var invite = { password: 123, current_password: 456, slug: 123 };
      element.isolateScope().admins = {};
      element.isolateScope().admins.admins = [];
      element.isolateScope().admins.admins.push(invite)

      element.isolateScope().revokeAdmin(0)
      expect(element.isolateScope().revoking).toBe(true);
      expect(element.isolateScope().admins.admins[0].state).toBe('revoking');

      deferred.resolve(invite);
      $scope.$apply();
      expect(element.isolateScope().admins.admins.length).toBe(0);
      expect(element.isolateScope().revoking).toBe(undefined);
    })

  });


});


describe('location cloning', function () {

  var $scope;
  var element;
  var locationFactory;
  var q;
  var deferred;

  beforeEach(module('components/locations/settings/clone.html'));

  beforeEach(module('myApp', function($provide) {
    locationFactory = {
      clone: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    }
    $provide.value("Location", locationFactory);
  }));

  beforeEach(inject(function($compile, $rootScope, $q) {
    $scope = $rootScope;
    q = $q;
    $scope.location = {}
    $scope.location.slug = 123
    element = angular.element("<location-clone></location-clone>");
    $compile(element)($rootScope)
    element.scope().$apply();
  }))

  describe('cloning locations', function () {

    it("Clones a location to another one", function() {
      spyOn(locationFactory, 'clone').andCallThrough()
      expect(element.find('#clone-form').hasClass('ng-hide')).toBe(true);
      element.find('#clone-location').click();
      $scope.$apply();
      expect($scope.cloning).toBe(true);
      expect(element.find('#clone-form').hasClass('ng-hide')).toBe(false);

      // filling in form
      var name = "Simons Hut"
      var address = "1 Long Road"
      var cont = element.find('input[name*="location_name"]').controller('ngModel');
      cont.$setViewValue(name);
      var cont = element.find('input[name*="address"]').controller('ngModel');
      cont.$setViewValue(address);
      $scope.myForm.$pristine = false;

      $scope.$apply();
      expect($scope.clone.location_name).toBe(name)
      expect($scope.clone.address).toBe(address)

      // Chrome cant click //
      // element.find('#clone-process').click();
      $scope.clone($scope.clone);
      expect($scope.clone.processing).toBe(true)

      expect(locationFactory.clone).toHaveBeenCalled();
      deferred.resolve();
      $scope.$apply()

      expect($scope.clone.processing).toBe(undefined)
      expect($scope.clone.completed).toBe(true)
    });

    it("WONT Clones a location to another one", function() {
      spyOn(locationFactory, 'clone').andCallThrough()
      expect(element.find('#clone-form').hasClass('ng-hide')).toBe(true);
      element.find('#clone-location').click();
      $scope.$apply();

      // filling in form
      var name = "Simons Hut"
      var address = "1 Long Road"
      var cont = element.find('input[name*="location_name"]').controller('ngModel');
      cont.$setViewValue(name);
      var cont = element.find('input[name*="address"]').controller('ngModel');
      cont.$setViewValue(address);

      $scope.$apply();

      // Chrome cant click //
      // element.find('#clone-process').click();
      $scope.clone($scope.clone);
      deferred.reject({data: [123]});
      $scope.$apply()

      expect($scope.clone.processing).toBe(undefined)
      expect($scope.clone.errors[0]).toBe(123)
    });

  });

});

describe('location destroy & archive', function () {

  var $scope;
  var element;
  var locationFactory;
  var q;
  var deferred;

  beforeEach(module('components/locations/settings/danger.html'));

  beforeEach(module('myApp', function($provide) {
    locationFactory = {
      destroy: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      archive: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      unarchive: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    }
    $provide.value("Location", locationFactory);
  }));

  var $location;

  beforeEach(inject(function($compile, $rootScope, $q, _$location_) {
    $scope = $rootScope;
    $location = _$location_;
    q = $q;
    $scope.location = {}
    $scope.location.slug = 123
    $scope.location.archived = false;
    $scope.location.location_name = "Simon"
    element = angular.element("<location-danger></location-danger>");
    $compile(element)($rootScope)
    element.scope().$apply();
  }))

  describe('archiving locations', function () {

    it("archives a location", function() {
      spyOn(locationFactory, 'archive').andCallThrough()
      expect($scope.location.archived).toBe(false)
      element.find('#archive').click()
      $scope.$apply
      expect($scope.location.archiving).toBe(true)
      expect(locationFactory.archive).toHaveBeenCalled();

      deferred.resolve();
      $scope.$apply()
      expect($scope.location.archiving).toBe(undefined)
      expect($scope.location.archived).toBe(true)
    });

    it("fails to archive a location", function() {
      spyOn(locationFactory, 'archive').andCallThrough()
      expect($scope.location.archived).toBe(false)
      element.find('#archive').click()
      $scope.$apply
      expect($scope.location.archiving).toBe(true)
      expect(locationFactory.archive).toHaveBeenCalled();

      deferred.reject({data: {errors: { base: [123]}}});
      $scope.$apply()
      expect($scope.location.archiving).toBe(undefined)
      expect($scope.location.errors[0]).toBe(123)
    });

    it("unarchives a location", function() {
      $scope.location.archived = true
      spyOn(locationFactory, 'unarchive').andCallThrough()
      expect($scope.location.archived).toBe(true)
      element.find('#unarchive').click()
      $scope.$apply
      expect($scope.location.archiving).toBe(true)
      expect(locationFactory.unarchive).toHaveBeenCalled();

      deferred.resolve();
      $scope.$apply()
      expect($scope.location.archiving).toBe(undefined)
      expect($scope.location.archived).toBe(false)
    });

    it("fails to unarchive a location", function() {
      spyOn(locationFactory, 'unarchive').andCallThrough()
      expect($scope.location.archived).toBe(false)
      element.find('#unarchive').click()
      $scope.$apply
      expect($scope.location.archiving).toBe(true)
      expect(locationFactory.unarchive).toHaveBeenCalled();

      deferred.reject({data: {errors: { base: [123]}}});
      $scope.$apply()
      expect($scope.location.archiving).toBe(undefined)
      expect($scope.location.errors[0]).toBe(123)
    });

    it("should delete a location", function() {
      spyOn(locationFactory, 'destroy').andCallThrough()
      expect(element.find('#delete').hasClass('ng-hide')).toBe(true);

      $scope.location.can_delete = true;
      $scope.$apply()

      expect(element.find('#delete').hasClass('ng-hide')).toBe(false);
      element.find('#delete').click()
      $scope.$apply()
      expect($scope.deleting).toBe(true)

      // Location name != delete name //
      expect(element.find('#delete-process').hasClass('ng-hide')).toBe(true);

      var cont = element.find('input[name*="delete_name"]').controller('ngModel');
      $scope.delete_name = $scope.location.location_name
      $scope.$apply()
      expect(element.find('#delete-process').hasClass('ng-hide')).toBe(false);
      element.find('#delete-process').click()
      $scope.$apply()

      expect($scope.location.destroying).toBe(true)

      deferred.resolve();
      $scope.$apply()

      // It's done //
      expect($location.path()).toBe('/locations')
      expect($scope.notifications).toBe('Location Deleted Successfully.')
    });

    it("should NOT delete a location", function() {
      $scope.deleting = true;
      spyOn(locationFactory, 'destroy').andCallThrough()

      $scope.destroy(location.slug)
      deferred.reject({data: {errors: { base: [123]}}});
      $scope.$apply()

      expect($scope.location.destroyin).toBe(undefined)
      expect($scope.deleting).toBe(undefined)
      expect($scope.location.errors[0]).toBe(123)
    });
  });

});

describe('location events', function () {

  var $scope;
  var element;
  var eventFactory;
  var commandFactory;
  var locationFactory;
  var q;
  var deferred;

  beforeEach(module('components/locations/events/events.html'));

  beforeEach(module('myApp', function($provide) {
    commandFactory = {
      query: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    }
    eventFactory = {
      save: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      destroy: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
    },
    locationFactory = {
      events: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
    }
    $provide.value("Location", locationFactory);
    $provide.value("LocationEvent", eventFactory);
    $provide.value("Command", commandFactory);
  }));

  var $location;

  beforeEach(inject(function($compile, $rootScope, $q, _$location_) {
    $scope = $rootScope;
    $location = _$location_;
    q = $q;
    $scope.location = {}
    $scope.location.slug = 123
    element = angular.element("<location-events></location-events>");
    $compile(element)($rootScope)
    element.scope().$apply();
  }))

  describe('creating location events', function () {

    it("lists the events for a location", function() {
      spyOn(locationFactory, 'events').andCallThrough()
      var event = { event_name: 'reboot'}
      deferred.resolve([event]);
      $scope.$apply()
      expect($scope.events[0]).toBe(event);
    });

    it("gets the payloads and creates an event", function() {
      spyOn(eventFactory, 'save').andCallThrough()
      spyOn(locationFactory, 'events').andCallThrough()
      spyOn(commandFactory, 'query').andCallThrough()
      var payload = {id: 123, payload_name: "reboot"}
      var event = { event_name: 'reboot'}
      deferred.resolve([event]);
      $scope.$apply()

      expect($scope.events[0]).toBe(event);
      expect(element.find('#create-events').hasClass('ng-hide')).toBe(true);
      element.find('#event-new').click()
      $scope.$apply()
      expect($scope.loading_payloads).toBe(true)
      expect($scope.event_creating).toBe(true)
      expect(element.find('#create-events').hasClass('ng-hide')).toBe(true);

      deferred.resolve([payload]);
      $scope.$apply()
      expect($scope.payloads[0]).toBe(payload)
      expect($scope.event).not.toBe(undefined)
      expect($scope.loading_payloads).toBe(undefined)

      $scope.event.payload_id = payload.id
      $scope.$apply()
      expect(element.find('#create-events').hasClass('ng-hide')).toBe(false);

      // // create event //
      // element.find('submit').click()
      // element.find('#create-event').click();
      $scope.createEvent()
      $scope.$apply()
      expect($scope.event.creating).toBe(true);

      var event = {active: true, description: 'reboot', event_frequency: "Daily", event_hour: "14:00", unique_id: 999 }
      deferred.resolve(event);
      $scope.$apply()
      expect(eventFactory.save).toHaveBeenCalled();

      expect($scope.event_creating).toBe(undefined)
      expect($scope.event).toBe(undefined)

    });

    it("WONT create an event - 422", function() {
      spyOn(eventFactory, 'save').andCallThrough()
      spyOn(locationFactory, 'events').andCallThrough()
      spyOn(commandFactory, 'query').andCallThrough()
      var payload = {id: 123, payload_name: "reboot"}
      var event = { event_name: 'reboot'}
      deferred.resolve([event]);
      $scope.$apply()

      element.find('#event-new').click()
      $scope.$apply()

      deferred.resolve([payload]);
      $scope.$apply()

      $scope.event.payload_id = payload.id
      $scope.$apply()

      // element.find('submit').click()
      // element.find('#create-event').click();
      $scope.createEvent()
      $scope.$apply()

      deferred.reject({data: {errors: { base: [123]}}});
      $scope.$apply()
      expect(eventFactory.save).toHaveBeenCalled();

      expect($scope.event_creating).toBe(undefined)
      expect($scope.events.errors[0]).toBe(123)
    });

    it("will delete an event from the events", function() {
      spyOn(eventFactory, 'destroy').andCallThrough()

      var event = {active: true, description: 'reboot', event_frequency: "Daily", event_hour: "14:00", unique_id: 999 }
      $scope.events = []
      $scope.events.push(event)
      $scope.$apply()

      $scope.deleteEvent(0)
      $scope.$apply()

      deferred.resolve();
      $scope.$apply()
      expect($scope.events.length).toBe(0);
      expect(eventFactory.destroy).toHaveBeenCalled();
    });

    it("will fail to delete an event from the events", function() {
      spyOn(eventFactory, 'destroy').andCallThrough()

      var event = {active: true, description: 'reboot', event_frequency: "Daily", event_hour: "14:00", unique_id: 999 }
      $scope.events = []
      $scope.events.push(event)
      $scope.$apply()

      // element.find('#event_destroy_0').click();
      $scope.deleteEvent(0)
      $scope.$apply()
      deferred.reject({data: {errors: { base: [123]}}});
      $scope.$apply()
      expect(eventFactory.destroy).toHaveBeenCalled();
      expect($scope.events.errors[0]).toBe(123)
      expect($scope.events[0].deleting).toBe(undefined);
    });

  });

});

describe('location transfer', function () {

  var $scope;
  var element;
  var locationFactory;
  var q;
  var $location;
  var deferred;
  var newLocationModal;

  beforeEach(module('myApp', function($provide) {
    locationFactory = {
      transfer: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    }
    $provide.value("Location", locationFactory);
  }));

  // beforeEach(module('components/locations/show/attr-generated.html'));

  beforeEach(inject(function($compile, $rootScope, $q, _$location_) {
    $scope = $rootScope;
    q = $q;
    $location = _$location_;
    $scope.box = {}
    $scope.location = {slug: 123}
    element = angular.element('<location-transfer state="location.state" slug="{{ location.slug }}"></location-transfer>');
    $compile(element)($rootScope)
    element.scope().$apply();

    $scope.newLocationModal = function() {
      return true;
    };

  }))

  it("should transfer the location", function() {
    spyOn(window, 'confirm').andReturn(true);
    spyOn(locationFactory, 'transfer').andCallThrough()

    element.isolateScope().transfer('abc')
    $scope.$apply()
    expect($scope.location.state).toBe('processing')

    deferred.resolve()
    $scope.$apply()
    expect($scope.location.state).toBe('tfer')

  })

  it("should fail to transfer the location", function() {
    spyOn(window, 'confirm').andReturn(true);
    spyOn(locationFactory, 'transfer').andCallThrough()

    element.isolateScope().transfer('abc')
    $scope.$apply()
    expect($scope.location.state).toBe('processing')

    deferred.reject({data: { message: ['123'] }})
    $scope.$apply()
    expect($scope.location.state).toBe('failed')
    expect(element.isolateScope().errors).toBe('123')

  })

});

