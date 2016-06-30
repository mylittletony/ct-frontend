'use strict';

describe("Triggers Unit Tests", function() {

  beforeEach(module('myApp'));

  var $httpBackend;
  var Trigger;
  var TriggerHistory;

  beforeEach(inject(function($injector, _Trigger_) {

    Trigger = _Trigger_;
    $httpBackend = $injector.get('$httpBackend');

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/locations/345/triggers')
      .respond(200, {});

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/locations/345/triggers/111')
      .respond(200, {});

    $httpBackend.when('POST', 'http://mywifi.dev:8080/api/v1/locations/345/triggers')
      .respond(200, {});

    $httpBackend.when('DELETE', 'http://mywifi.dev:8080/api/v1/locations/345/triggers/123')
      .respond(200, [{}]);

   }));

  afterEach(function() {
   $httpBackend.verifyNoOutstandingExpectation();
   $httpBackend.verifyNoOutstandingRequest();
  });

  it('should have sent a GET request to the events query API', function() {
    var result = Trigger.query({location_id: 345})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/locations/345/triggers')
    $httpBackend.flush();
  });

  it('should have sent a GET request to the events query API', function() {
    var result = Trigger.get({location_id: 345, id: 111})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/locations/345/triggers/111')
    $httpBackend.flush();
  });

  it('should have sent a POST request to the events users API', function() {
    var result = Trigger.save({location_id: 345})
    $httpBackend.expectPOST('http://mywifi.dev:8080/api/v1/locations/345/triggers')
    $httpBackend.flush();
  });

  it('should have sent a DELETE request to the events users API', function() {
    var result = Trigger.destroy({id: 123, location_id: 345})
    $httpBackend.expectDELETE('http://mywifi.dev:8080/api/v1/locations/345/triggers/123')
    $httpBackend.flush();
  });

})

describe("Triggers History Unit Tests", function() {

  beforeEach(module('myApp'));

  var $httpBackend;
  var TriggerHistory;

  beforeEach(inject(function($injector, _TriggerHistory_) {

    TriggerHistory = _TriggerHistory_;
    $httpBackend = $injector.get('$httpBackend');

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/locations/345/triggers/123/trigger_history')
      .respond(200, {});

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/locations/345/triggers/123/trigger_history/111')
      .respond(200, {});

   }));

  afterEach(function() {
   $httpBackend.verifyNoOutstandingExpectation();
   $httpBackend.verifyNoOutstandingRequest();
  });

  it('should have sent a get request to the trigger history API', function() {
    var result = TriggerHistory.query({trigger_id: 123, location_id: 345})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/locations/345/triggers/123/trigger_history')
    $httpBackend.flush();
  });

  it('should have sent a get request to the trigger history show', function() {
    var result = TriggerHistory.get({trigger_id: 123, location_id: 345, id: 111})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/locations/345/triggers/123/trigger_history/111')
    $httpBackend.flush();
  });

})
