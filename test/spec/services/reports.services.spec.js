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

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/reports?inventory=true')
      .respond(200, {});

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/reports?dashboard=true')
      .respond(200, {});

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/reports?v2=true&type=tx')
      .respond(200, {});

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/reports?tx=true')
      .respond(200, {});

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/reports?throughput=true')
      .respond(200, {});

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/reports?location_id=123&signal=true')
      .respond(200, {});

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/reports?bitrate=true&location_id=123')
      .respond(200, {});

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/reports?location_id=123&quality=true')
      .respond(200, {});

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/reports?location_id=123&speedtests=true')
      .respond(200, {});

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/reports?periscope=true')
      .respond(200, {});

    $httpBackend.when('POST', 'http://mywifi.dev:8080/api/v1/reports?interval=day&type=email')
      .respond(200, {});

    $httpBackend.whenGET('/translations/en_GB.json').respond("");
   }));

  it('should have sent a GET request to the reports query API', function() {
    var result = Report.clients({location_id: 123, clients: true})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/reports?clients=true&location_id=123')
    $httpBackend.flush();
  });

  it('should have sent a GET request to get the inventory API', function() {
    var result = Report.inventory({})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/reports?inventory=true')
    $httpBackend.flush();
  });

  it('should have sent a GET request to get the dashboard API', function() {
    var result = Report.dashboard({})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/reports?dashboard=true')
    $httpBackend.flush();
  });

  // it('should have sent a GET request to get the client stats API', function() {
  //   var result = Report.clientstats({type: 'tx'})
  //   $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/reports?v2=true&type=tx')
  //   $httpBackend.flush();
  // });

  it('should have sent a GET request to get the tx stats API', function() {
    var result = Report.tx({})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/reports?tx=true')
    $httpBackend.flush();
  });

  it('should have sent a GET request to get the tx stats API', function() {
    var result = Report.throughput({})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/reports?throughput=true')
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
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/reports?location_id=123&speedtests=true');
    $httpBackend.flush();
  });

  it('should have sent a GET request to the reports get API', function() {
    var result = Report.periscope({periscope: true})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/reports?periscope=true');
    $httpBackend.flush();
  });

  it('should have sent a POST request to the reports get API to create a download', function() {
    var result = Report.create({type: 'email'})
    $httpBackend.expectPOST('http://mywifi.dev:8080/api/v1/reports?interval=day&type=email');
    $httpBackend.flush();
  });

})
