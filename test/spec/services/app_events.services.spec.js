'use strict';

describe("App Event Unit Tests", function() {

  beforeEach(module('myApp'));

  var $httpBackend;
  var AppEvent;
  var email = 'sm@polkaspots.com';

  beforeEach(inject(function($injector, _AppEvent_) {

    AppEvent = _AppEvent_;
    $httpBackend = $injector.get('$httpBackend');

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/app_events')
      .respond(200, {});

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/app_events/123')
      .respond(200, {id: 123});

   }));

  afterEach(function() {
   $httpBackend.verifyNoOutstandingExpectation();
   $httpBackend.verifyNoOutstandingRequest();
  });

  it('should have sent a GET request to location codes', function() {
    var result = AppEvent.get({})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/app_events')
    $httpBackend.flush();
  });

  it('should have sent a GET request to location show codes', function() {
    var result = AppEvent.query({id: 123})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/app_events/123')
    $httpBackend.flush();
  });

})

