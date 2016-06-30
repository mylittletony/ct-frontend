'use strict';

describe("Zone Unit Tests", function() {

  beforeEach(module('myApp'));

  var $httpBackend;
  var Zone;

  beforeEach(inject(function($injector, _Zone_) {

    Zone = _Zone_;
    $httpBackend = $injector.get('$httpBackend');

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/locations/123/zones')
      .respond(200, {});

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/locations/123/zones/456')
      .respond(200, {});

    $httpBackend.when('PATCH', 'http://mywifi.dev:8080/api/v1/locations/123/zones/456')
      .respond(200, {});

    $httpBackend.when('POST', 'http://mywifi.dev:8080/api/v1/locations/123/zones')
      .respond(200, {});

    $httpBackend.when('DELETE', 'http://mywifi.dev:8080/api/v1/locations/123/zones/546')
      .respond(200, {});

   }));

  afterEach(function() {
   $httpBackend.verifyNoOutstandingExpectation();
   $httpBackend.verifyNoOutstandingRequest();
  });

  it('should have sent a GET request to location zones', function() {
    var result = Zone.get({location_id: 123})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/locations/123/zones')
    $httpBackend.flush();
  });

  it('should have sent a GET request to location show zones', function() {
    var result = Zone.query({location_id: 123, id: 456})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/locations/123/zones/456')
    $httpBackend.flush();
  });

  it('should have sent a PATCH request to location zones', function() {
    var result = Zone.update({location_id: 123, id: 456})
    $httpBackend.expectPATCH('http://mywifi.dev:8080/api/v1/locations/123/zones/456')
    $httpBackend.flush();
  });

  it('should have sent a POST request to location zones', function() {
    var result = Zone.create({location_id: 123})
    $httpBackend.expectPOST('http://mywifi.dev:8080/api/v1/locations/123/zones')
    $httpBackend.flush();
  });

  it('should have sent a DELETE request to location zones', function() {
    var result = Zone.destroy({location_id: 123, id: 546})
    $httpBackend.expectDELETE('http://mywifi.dev:8080/api/v1/locations/123/zones/546')
    $httpBackend.flush();
  });

})

