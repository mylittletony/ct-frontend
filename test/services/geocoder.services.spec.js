'use strict';

describe("Geocoder Unit Tests", function() {

  beforeEach(module('myApp'));

  var $httpBackend;
  var Geocoder;
  var scope;
  var store = {};
  var $window;
  var results;
  var $rootScope;

  beforeEach(inject(function($injector, _Geocoder_, _$window_, _$rootScope_) {

    Geocoder = _Geocoder_;
    $window = _$window_;
    $rootScope = _$rootScope_;

    $httpBackend = $injector.get('$httpBackend');

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/geocoder')
      .respond(200, [{results: { location: 123}}]);

    $httpBackend.when('POST', 'http://mywifi.dev:8080/api/v1/geocoder?lat=32&lon=96')
      .respond(200, [{}]);

    navigator.geolocation =
      {
        getCurrentPosition: function(callback) {
        // callback({ coords: { latitude: "40.714224", longitude: "-73.961452" } });
      }
    }

    spyOn(localStorage, 'getItem').andCallFake(function(key) {
      return store[key];
    });

    Object.defineProperty(sessionStorage, "setItem", { writable: true });

    spyOn(localStorage, 'setItem').andCallFake(function(key, value) {
      store[key] = value;
    });

   }));

   afterEach(function() {
     window.localStorage.clear()
   })

  it('should get the location and also clear locations from localstorage', function() {
    spyOn($window.navigator.geolocation,"getCurrentPosition").andCallFake(function() {
      var position = { coords: { latitude: 32, longitude: -96 } };
      arguments[0](position);
    });
    // window.localStorage.setItem('locations', JSON.stringify({simon: 'knows'}))
    Geocoder.getLocation().then(function(data){
      results = data;
    });
    $rootScope.$digest();
    expect(results).toEqual({ coords : { latitude : 32, longitude : -96 } });
    expect(Geocoder.cache()).toBe(undefined)
  });

  it('should hit ct to create the results', function() {
    var data = { latitude: 32, longitude: 96 }
    Geocoder.queue(data)
    $httpBackend.expectPOST('http://mywifi.dev:8080/api/v1/geocoder?lat=32&lon=96')
    $httpBackend.flush();
  })

  it('should not get the results from the cache', function() {
    expect(Geocoder.cache()).toBe(undefined)
  })

  it('should not get the results from the cache', function() {
    window.localStorage.setItem('locations', JSON.stringify({simon: 'says'}))
    expect(Geocoder.cache()).not.toBe(undefined)
  })

  it('should hit ct for the results', function() {
    Geocoder.get()
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/geocoder')
    $httpBackend.flush();
    expect(window.localStorage.getItem('locations')).not.toBe(undefined)
  })



  xit('should not obtain user location due to missing geolocation', function () {
    var results,old_navigator;
    spyOn($rootScope,'$broadcast').andCallThrough();
    old_navigator = $window.navigator;
    $window.navigator = {geolocation:false};
    Geocoder.getLocation().then(function(){},function(error) {
      results = error;
    });
    $rootScope.$digest();
    expect($rootScope.$broadcast).toHaveBeenCalledWith('error','Fuck OOOOFFF');
    $window.navigator = old_navigator;
  });

  xit('should not obtain user location due to missing permissions', function () {
    spyOn($rootScope, '$broadcast').andCallThrough();
    spyOn($window.navigator.geolocation,"getCurrentPosition").andCallFake(function() {
        var error = {code: 1};
        arguments[1](error);
    });
    Geocoder.getLocation().then(function(){},function(error) {
      results = error;
    });
    $rootScope.$digest();
    expect($rootScope.$broadcast).toHaveBeenCalledWith('error','FUCK OFF');
    // expect(results).toEqual(geolocation_msgs['errors.location.permissionDenied'])
  });

})
