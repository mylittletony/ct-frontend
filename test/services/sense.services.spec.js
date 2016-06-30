'use strict';

describe("Sense Unit Tests", function() {

  beforeEach(module('myApp'));

  var $httpBackend;
  var Sense;

  beforeEach(inject(function($injector, _Sense_) {

    Sense = _Sense_;
    $httpBackend = $injector.get('$httpBackend');

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/sense')
      .respond(200, {});
   }));

  afterEach(function() {
   $httpBackend.verifyNoOutstandingExpectation();
   $httpBackend.verifyNoOutstandingRequest();
  });

  it('should have sent a GET request to the senses query API', function() {
    var result = Sense.query({})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/sense')
    $httpBackend.flush();
  });

})
