'use strict';

describe("Guest Unit Tests", function() {

  beforeEach(module('myApp'));

  var $httpBackend;
  var Guest;

  beforeEach(inject(function($injector, _Guest_) {

    Guest = _Guest_;
    $httpBackend = $injector.get('$httpBackend');

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/guests')
      .respond(200, {});

    $httpBackend.when('PATCH', 'http://mywifi.dev:8080/api/v1/guests/123')
      .respond(200, {});

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/guests/123')
      .respond(200, {id: 123});
   }));

  afterEach(function() {
   $httpBackend.verifyNoOutstandingExpectation();
   $httpBackend.verifyNoOutstandingRequest();
  });

  it('should have sent a GET request to the guests query API', function() {
    var result = Guest.get({})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/guests')
    $httpBackend.flush();
  });

  it('should have sent a GET request to the guests query API', function() {
    var result = Guest.query({id: 123})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/guests/123')
    $httpBackend.flush();
  });

  it('should have sent a PATCH request to the guests query API', function() {
    var result = Guest.update({id: 123})
    $httpBackend.expectPATCH('http://mywifi.dev:8080/api/v1/guests/123')
    $httpBackend.flush();
  });

})
