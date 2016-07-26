'use strict';

describe("Connected Clients Unit Tests", function() {

  beforeEach(module('myApp'));

  var $httpBackend;
  var Client;

  beforeEach(inject(function($injector, _Client_) {

    Client = _Client_;
    $httpBackend = $injector.get('$httpBackend');

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/locations/123/clients')
      .respond(200, {});

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/locations/123/clients/123123')
      .respond(200, {});

    $httpBackend.when('PATCH', 'http://mywifi.dev:8080/api/v1/locations/123/clients/123123')
      .respond(200, {});

    $httpBackend.when('POST', 'http://mywifi.dev:8080/api/v1/locations/123/clients')
      .respond(200, {});

    $httpBackend.when('POST', 'http://mywifi.dev:8080/api/v1/locations/123/clients/123123/logout')
      .respond(200, {});

    $httpBackend.whenGET('/translations/en_GB.json').respond("");
   }));

  afterEach(function() {
   $httpBackend.verifyNoOutstandingExpectation();
   $httpBackend.verifyNoOutstandingRequest();
  });

  it('should have sent a GET request to the clients query API', function() {
    var result = Client.query({location_id: 123});
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/locations/123/clients');
    $httpBackend.flush();
  });

  it('should have sent a GET request to the clients query API', function() {
    var result = Client.get({location_id: 123, id: 123123});
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/locations/123/clients/123123');
    $httpBackend.flush();
  });

  it('should have sent a PATCH request to the clients query API', function() {
    var result = Client.update({location_id: 123, id: 123123});
    $httpBackend.expectPATCH('http://mywifi.dev:8080/api/v1/locations/123/clients/123123');
    $httpBackend.flush();
  });

  it('should have sent a POST request to disconnect the client', function() {
    var result = Client.logout({location_id: 123, id: 123123});
    $httpBackend.expectPOST('http://mywifi.dev:8080/api/v1/locations/123/clients/123123/logout');
    $httpBackend.flush();
  });

  it('should have sent a POST request to create the client', function() {
    var result = Client.create({location_id: 123});
    $httpBackend.expectPOST('http://mywifi.dev:8080/api/v1/locations/123/clients');
    $httpBackend.flush();
  });

});
