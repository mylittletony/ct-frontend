'use strict';

describe("LocationEvents Unit Tests", function() {

  beforeEach(module('myApp'));

  var $httpBackend;
  var LocationEvent;

  beforeEach(inject(function($injector, _LocationEvent_) {

    LocationEvent = _LocationEvent_;
    $httpBackend = $injector.get('$httpBackend');

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/locations/345/location_events')
      .respond(200, [{}]);

    $httpBackend.when('POST', 'http://mywifi.dev:8080/api/v1/locations/345/location_events')
      .respond(200, {});

    $httpBackend.when('DELETE', 'http://mywifi.dev:8080/api/v1/locations/345/location_events/123')
      .respond(200, [{}]);

   }));

  afterEach(function() {
   $httpBackend.verifyNoOutstandingExpectation();
   $httpBackend.verifyNoOutstandingRequest();
  });

  it('should have sent a GET request to the events query API', function() {
    var result = LocationEvent.get({parent_id: 345})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/locations/345/location_events')
    $httpBackend.flush();
  });

  it('should have sent a POST request to the events users API', function() {
    var result = LocationEvent.save({parent_id: 345})
    $httpBackend.expectPOST('http://mywifi.dev:8080/api/v1/locations/345/location_events')
    $httpBackend.flush();
  });

  it('should have sent a DELETE request to the events users API', function() {
    var result = LocationEvent.destroy({id: 123, parent_id: 345})
    $httpBackend.expectDELETE('http://mywifi.dev:8080/api/v1/locations/345/location_events/123')
    $httpBackend.flush();
  });


})
