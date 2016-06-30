'use strict';

describe("Events Unit Tests", function() {

  beforeEach(module('myApp'));

  var $httpBackend;
  var Event;

  beforeEach(inject(function($injector, _Event_) {

    Event = _Event_;
    $httpBackend = $injector.get('$httpBackend');

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/events')
      .respond(200, {});
    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/events/123')
      .respond(200, {id: 123});

    $httpBackend.whenGET('/translations/en_GB.json').respond("");

   }));

  afterEach(function() {
   $httpBackend.verifyNoOutstandingExpectation();
   $httpBackend.verifyNoOutstandingRequest();
  });

  it('should have sent a GET request to the events query API', function() {
    var result = Event.query({})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/events')
    $httpBackend.flush();
  });

  it('should have sent a GET request to the events query API', function() {
    var result = Event.get({id: 123})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/events/123')
    $httpBackend.flush();
  });

})
