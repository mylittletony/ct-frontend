'use strict';

describe("ClientFilter Unit Tests", function() {

  beforeEach(module('myApp'));

  var $httpBackend;
  var ClientFilter;

  beforeEach(inject(function($injector, _ClientFilter_) {

    ClientFilter = _ClientFilter_;
    $httpBackend = $injector.get('$httpBackend');

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/locations/123/client_filters')
    .respond(200, {});

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/locations/123/client_filters/456')
    .respond(200, {});

    $httpBackend.when('PATCH', 'http://mywifi.dev:8080/api/v1/locations/123/client_filters/456')
    .respond(200, {});

    $httpBackend.when('POST', 'http://mywifi.dev:8080/api/v1/locations/123/client_filters')
    .respond(200, {});

    $httpBackend.when('DELETE', 'http://mywifi.dev:8080/api/v1/locations/123/client_filters/546')
    .respond(200, {});

    $httpBackend.whenGET('/translations/en_GB.json').respond("");
  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should have sent a GET request to location client_filters', function() {
    var result = ClientFilter.get({location_id: 123})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/locations/123/client_filters')
    $httpBackend.flush();
  });

  it('should have sent a GET request to location show client_filters', function() {
    var result = ClientFilter.query({location_id: 123, id: 456})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/locations/123/client_filters/456')
    $httpBackend.flush();
  });

  it('should have sent a PATCH request to location client_filters', function() {
    var result = ClientFilter.update({location_id: 123, id: 456})
    $httpBackend.expectPATCH('http://mywifi.dev:8080/api/v1/locations/123/client_filters/456')
    $httpBackend.flush();
  });

  it('should have sent a POST request to location client_filters', function() {
    var result = ClientFilter.create({location_id: 123})
    $httpBackend.expectPOST('http://mywifi.dev:8080/api/v1/locations/123/client_filters')
    $httpBackend.flush();
  });

  it('should have sent a DELETE request to location client_filters', function() {
    var result = ClientFilter.destroy({location_id: 123, id: 546})
    $httpBackend.expectDELETE('http://mywifi.dev:8080/api/v1/locations/123/client_filters/546')
    $httpBackend.flush();
  });

})


