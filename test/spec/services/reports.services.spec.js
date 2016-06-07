'use strict';

describe("Report Unit Tests", function() {

  beforeEach(module('myApp'));

  var $httpBackend;
  var Report;

  beforeEach(inject(function($injector, _Report_) {

    Report = _Report_;
    $httpBackend = $injector.get('$httpBackend');

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/reports?clients=true&location_id=123')
      .respond(200, {});

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/reports?location_id=123&signal=true')
      .respond(200, {});

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/reports?bitrate=true&location_id=123')
      .respond(200, {});

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/reports?location_id=123&quality=true')
      .respond(200, {});

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/reports?location_id=123&speedtests=true')
      .respond(200, {});

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/reports?sessions=true')
      .respond(200, {});

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/reports?periscope=true')
      .respond(200, {});

    $httpBackend.when('POST', 'http://mywifi.dev:8080/api/v1/reports')
      .respond(200, {});

   }));

  it('should have sent a POST request to the reports query API', function() {
    var result = Report.create({location_id: 123, clients: true})
    $httpBackend.expectPOST('http://mywifi.dev:8080/api/v1/reports')
    $httpBackend.flush();
  });

  it('should have sent a GET request to the reports query API', function() {
    var result = Report.clients({location_id: 123, clients: true})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/reports?clients=true&location_id=123')
    $httpBackend.flush();
  });

  it('should have sent a GET request to the reports query API, interface stats', function() {
    var result = Report.signal({signal: true, location_id: 123})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/reports?location_id=123&signal=true')
    $httpBackend.flush();
  });

  it('should have sent a GET request to the reports query API, ibitrate stats', function() {
    var result = Report.bitrate({location_id: 123, bitrate: true})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/reports?bitrate=true&location_id=123')
    $httpBackend.flush();
  });

  it('should have sent a GET request to the reports query API, interface stats', function() {
    var result = Report.quality({location_id: 123, quality: true})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/reports?location_id=123&quality=true')
    $httpBackend.flush();
  });

  it('should have sent a GET request to the reports query API, speedtests stats', function() {
    var result = Report.speedtests({location_id: 123, speedtests: true})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/reports?location_id=123&speedtests=true')
    $httpBackend.flush();
  });

  it('should have sent a GET request to the reports get API', function() {
    var result = Report.get({sessions: true})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/reports?sessions=true')
    $httpBackend.flush();
  });

  it('should have sent a GET request to the reports get API', function() {
    var result = Report.periscope({periscope: true})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/reports?periscope=true')
    $httpBackend.flush();
  });

})
