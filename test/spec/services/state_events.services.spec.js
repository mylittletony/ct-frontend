'use strict';

describe("StateEvent Unit Tests", function() {

  beforeEach(module('myApp'));

  var $httpBackend;
  var StateEvent;

  beforeEach(inject(function($injector, _StateEvent_) {

    StateEvent = _StateEvent_;
    $httpBackend = $injector.get('$httpBackend');

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/boxes/123/state_events')
      .respond(200, [{}]);

   }));

  afterEach(function() {
   $httpBackend.verifyNoOutstandingExpectation();
   $httpBackend.verifyNoOutstandingRequest();
  });

  it('should have sent a GET request to the state_events query API', function() {
    var result = StateEvent.query({box_id: 123})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/boxes/123/state_events')
    $httpBackend.flush();
  });


})
