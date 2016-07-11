'use strict';

describe("Box Unit Tests", function() {

  beforeEach(module('myApp'));

  var $httpBackend;
  var Box;

  beforeEach(inject(function($injector, _Box_) {

    Box = _Box_;
    $httpBackend = $injector.get('$httpBackend');

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/boxes')
    .respond(200, {});

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/boxes?q=derby')
    .respond(200, {});

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/boxes/123')
    .respond(200, {});

    $httpBackend.when('POST', 'http://mywifi.dev:8080/api/v1/boxes')
    .respond(200, {});

    $httpBackend.when('PATCH', 'http://mywifi.dev:8080/api/v1/boxes/123')
    .respond(200, {});

    $httpBackend.when('DELETE', 'http://mywifi.dev:8080/api/v1/boxes/123')
    .respond(200, {});

    $httpBackend.when('POST', 'http://mywifi.dev:8080/api/v1/boxes/123/payloads')
    .respond(200, {});

    $httpBackend.when('POST', 'http://mywifi.dev:8080/api/v1/boxes')
    .respond(200, {});

    $httpBackend.when('POST', 'http://mywifi.dev:8080/api/v1/boxes/detect')
    .respond(200, [{}]);

    $httpBackend.when('DELETE', 'http://mywifi.dev:8080/api/v1/boxes/123')
    .respond(200, {});

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/boxes/123/status')
    .respond(200, {});

    $httpBackend.whenGET('/translations/en_GB.json').respond("");

  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should have sent a GET request to the boxes status API', function() {
    var result = Box.status({id: 123})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/boxes/123/status')
    $httpBackend.flush();
  });

  it('should have sent a GET request to the boxes query API', function() {
    var result = Box.get()
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/boxes')
    $httpBackend.flush();
  });

  it('should have sent a GET request with search to the boxes query API', function() {
    var result = Box.get({q: 'derby'})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/boxes?q=derby')
    $httpBackend.flush();
  });

  it('should have sent a GET request boxes api and get single nas', function() {
    var result = Box.get({id: 123})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/boxes/123')
    $httpBackend.flush();
  });

  it('should have sent a POST request boxes api', function() {
    var result = Box.save({nasname: '10.0.0.0'})
    $httpBackend.expectPOST('http://mywifi.dev:8080/api/v1/boxes')
    $httpBackend.flush();
  });

  it('should have sent a PATCH request boxes api', function() {
    var result = Box.update({nasname: '10.0.0.0', id: 123})
    $httpBackend.expectPATCH('http://mywifi.dev:8080/api/v1/boxes/123')
    $httpBackend.flush();
  });

  it('should have sent a DELETE request boxes api', function() {
    var result = Box.destroy({id: 123})
    $httpBackend.expectDELETE('http://mywifi.dev:8080/api/v1/boxes/123')
    $httpBackend.flush();
  });

  it('should have sent a POST request boxes api for a payload', function() {
    var result = Box.payload({id: 123})
    $httpBackend.expectPOST('http://mywifi.dev:8080/api/v1/boxes/123/payloads')
    $httpBackend.flush();
  });

  it('should have sent a DELETE request boxes api TO delete', function() {
    var result = Box.destroy({id: 123})
    $httpBackend.expectDELETE('http://mywifi.dev:8080/api/v1/boxes/123')
    $httpBackend.flush();
  });

  it('should have sent a POST request boxes api TO create', function() {
    var result = Box.save({calledstationid: 123})
    $httpBackend.expectPOST('http://mywifi.dev:8080/api/v1/boxes')
    $httpBackend.flush();
  });

  it('should have sent a POST request boxes api TO detect', function() {
    var result = Box.detect()
    $httpBackend.expectPOST('http://mywifi.dev:8080/api/v1/boxes/detect')
    $httpBackend.flush();
  });

})

describe("Location Box Unit Tests", function() {

  beforeEach(module('myApp'));

  var $httpBackend;
  var LocationBox;

  beforeEach(inject(function($injector, _LocationBox_) {

    LocationBox = _LocationBox_;
    $httpBackend = $injector.get('$httpBackend');

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/locations/123/boxes')
    .respond(200, {});

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/locations/123/boxes/456')
    .respond(200, {});

    $httpBackend.when('POST', 'http://mywifi.dev:8080/api/v1/locations/123/boxes')
    .respond(200, {});

    $httpBackend.when('PATCH', 'http://mywifi.dev:8080/api/v1/locations/123/boxes/456')
    .respond(200, [{}]);

    $httpBackend.when('DELETE', 'http://mywifi.dev:8080/api/v1/locations/123/boxes/456')
    .respond(200, {});

    $httpBackend.whenGET('/translations/en_GB.json').respond("");

  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should have sent a GET request to the boxes query API', function() {
    var result = LocationBox.get({location_id: 123})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/locations/123/boxes')
    $httpBackend.flush();
  });

  it('should have sent a GET request boxes api and get single nas', function() {
    var result = LocationBox.get({location_id: 123, id: 456})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/locations/123/boxes/456')
    $httpBackend.flush();
  });

  it('should have sent a POST request boxes api', function() {
    var result = LocationBox.save({location_id: 123, nasname: '10.0.0.0'})
    $httpBackend.expectPOST('http://mywifi.dev:8080/api/v1/locations/123/boxes')
    $httpBackend.flush();
  });

  it('should have sent a PATCH request boxes api', function() {
    var result = LocationBox.update({nasname: '10.0.0.0', id: 456, location_id: 123})
    $httpBackend.expectPATCH('http://mywifi.dev:8080/api/v1/locations/123/boxes/456')
    $httpBackend.flush();
  });

  it('should have sent a DELETE request boxes api', function() {
    var result = LocationBox.destroy({id: 456, location_id: 123})
    $httpBackend.expectDELETE('http://mywifi.dev:8080/api/v1/locations/123/boxes/456')
    $httpBackend.flush();
  });

})
