'use strict';

describe("SplashCode Unit Tests", function() {

  beforeEach(module('myApp'));

  var $httpBackend;
  var SplashCode;

  beforeEach(inject(function($injector, _SplashCode_) {

    SplashCode = _SplashCode_;
    $httpBackend = $injector.get('$httpBackend');

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/locations/123/splash_codes')
      .respond(200, { location_id: 123 });

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/locations/123/splash_codes/456')
      .respond(200, {});

    $httpBackend.when('PATCH', 'http://mywifi.dev:8080/api/v1/locations/123/splash_codes/456')
      .respond(200, {});

    $httpBackend.when('POST', 'http://mywifi.dev:8080/api/v1/locations/123/splash_codes')
      .respond(200, {});

    $httpBackend.when('DELETE', 'http://mywifi.dev:8080/api/v1/locations/123/splash_codes/546')
      .respond(200, {});

   }));

  afterEach(function() {
   $httpBackend.verifyNoOutstandingExpectation();
   $httpBackend.verifyNoOutstandingRequest();
  });

  it('should have sent a GET request to location splash_codes', function() {
    var result = SplashCode.get({location_id: 123})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/locations/123/splash_codes')
    $httpBackend.flush();
  });

  it('should have sent a GET request to location show splash_codes', function() {
    var result = SplashCode.query({location_id: 123, id: 456})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/locations/123/splash_codes/456')
    $httpBackend.flush();
  });

  it('should have sent a PATCH request to location splash_codes', function() {
    var result = SplashCode.update({location_id: 123, id: 456})
    $httpBackend.expectPATCH('http://mywifi.dev:8080/api/v1/locations/123/splash_codes/456')
    $httpBackend.flush();
  });

  it('should have sent a POST request to location splash_codes', function() {
    var result = SplashCode.create({location_id: 123})
    $httpBackend.expectPOST('http://mywifi.dev:8080/api/v1/locations/123/splash_codes')
    $httpBackend.flush();
  });

  it('should have sent a delete request to location splash_codes', function() {
    var result = SplashCode.destroy({location_id: 123, id: 546})
    $httpBackend.expectDELETE('http://mywifi.dev:8080/api/v1/locations/123/splash_codes/546')
    $httpBackend.flush();
  });

})

