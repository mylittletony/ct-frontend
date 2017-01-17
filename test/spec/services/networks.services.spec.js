'use strict';

describe("Networks Unit Tests", function() {

  beforeEach(module('myApp'));

  var $httpBackend;
  var Network;

  beforeEach(inject(function($injector, _Network_) {

    Network = _Network_;
    $httpBackend = $injector.get('$httpBackend');

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/locations/345/networks')
      .respond(200, [{}]);

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/locations/345/networks/123')
      .respond(200, {});

    $httpBackend.when('PATCH', 'http://mywifi.dev:8080/api/v1/locations/345/networks/123')
      .respond(200, {});

    $httpBackend.when('POST', 'http://mywifi.dev:8080/api/v1/locations/345/networks')
      .respond(200, {});

    $httpBackend.when('DELETE', 'http://mywifi.dev:8080/api/v1/locations/345/networks/567')
      .respond(200, {});

    $httpBackend.when('POST', 'http://mywifi.dev:8080/api/v1/locations/345/networks/reset')
      .respond(200, {});

    $httpBackend.when('POST', 'http://mywifi.dev:8080/api/v1/locations/345/networks/888/radtest')
      .respond(200, {});

    $httpBackend.whenGET('/translations/en_GB.json').respond("");

   }));

  afterEach(function() {
   $httpBackend.verifyNoOutstandingExpectation();
   $httpBackend.verifyNoOutstandingRequest();
  });

  it('should have sent a GET request to the networks query API', function() {
    var result = Network.get({location_id: 345})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/locations/345/networks')
    $httpBackend.flush();
  });

  it('should have sent a GET request to the networks users API', function() {
    var result = Network.query({id: 123, location_id: 345})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/locations/345/networks/123')
    $httpBackend.flush();
  });

  it('should have sent a UPDATE request to the networks users API', function() {
    var result = Network.update({id: 123, location_id: 345})
    $httpBackend.expectPATCH('http://mywifi.dev:8080/api/v1/locations/345/networks/123')
    $httpBackend.flush();
  });

  it('should have sent a POST request to the networks users API', function() {
    var result = Network.create({location_id: 345})
    $httpBackend.expectPOST('http://mywifi.dev:8080/api/v1/locations/345/networks')
    $httpBackend.flush();
  });

  it('should have sent a DELETE request to the networks users API', function() {
    var result = Network.destroy({location_id: 345, id: 567})
    $httpBackend.expectDELETE('http://mywifi.dev:8080/api/v1/locations/345/networks/567')
    $httpBackend.flush();
  });

  it('should have sent a POST request to the networks users API', function() {
    var result = Network.reset({location_id: 345})
    $httpBackend.expectPOST('http://mywifi.dev:8080/api/v1/locations/345/networks/reset')
    $httpBackend.flush();
  });

  it('should have sent a POST request to the networks radtest API', function() {
    var result = Network.radtest({id: 888, location_id: 345})
    $httpBackend.expectPOST('http://mywifi.dev:8080/api/v1/locations/345/networks/888/radtest')
    $httpBackend.flush();
  });


})
