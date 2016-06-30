'use strict';

describe("Speedtests Unit Tests", function() {

  beforeEach(module('myApp'));

  var $httpBackend;
  var Speedtest;

  beforeEach(inject(function($injector, _Speedtest_) {

    Speedtest = _Speedtest_;
    $httpBackend = $injector.get('$httpBackend');

    $httpBackend.when('POST', 'http://mywifi.dev:8080/api/v1/boxes/123/speedtests')
      .respond(200, {});

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/boxes/123/speedtests')
      .respond(200, [{}]);

   }));

  afterEach(function() {
   $httpBackend.verifyNoOutstandingExpectation();
   $httpBackend.verifyNoOutstandingRequest();
  });

  it('should have sent a POST request to boxes / speedtests get', function() {
    var result = Speedtest.query({box_id: 123})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/boxes/123/speedtests')
    $httpBackend.flush();
  });

  it('should have sent a POST request to boxes / speedtests create', function() {
    var result = Speedtest.create({box_id: 123})
    $httpBackend.expectPOST('http://mywifi.dev:8080/api/v1/boxes/123/speedtests')
    $httpBackend.flush();
  });

})

