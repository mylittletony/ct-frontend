'use strict';

describe("Heartbeat Unit Tests", function() {

  beforeEach(module('myApp'));

  var $httpBackend;
  var Heartbeat;

  beforeEach(inject(function($injector, _Heartbeat_) {

    Heartbeat = _Heartbeat_;
    $httpBackend = $injector.get('$httpBackend');

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/boxes/123/heartbeats')
      .respond(200, {} );

   }));

  afterEach(function() {
   $httpBackend.verifyNoOutstandingExpectation();
   $httpBackend.verifyNoOutstandingRequest();
  });

  it('should have sent a GET request to the heartbeats query API', function() {
    var result = Heartbeat.query({box_id: 123})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/boxes/123/heartbeats')
    $httpBackend.flush();
  });


})
