'use strict';

describe("Network type Unit Tests", function() {

  beforeEach(module('myApp'));

  var $httpBackend;
  var Networktype;

  beforeEach(inject(function($injector, _Networktype_) {

    Networktype = _Networktype_;
    $httpBackend = $injector.get('$httpBackend');

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/networktypes')
      .respond(200, [{}]);

   }));

  afterEach(function() {
   $httpBackend.verifyNoOutstandingExpectation();
   $httpBackend.verifyNoOutstandingRequest();
  });

  it('should have sent a GET request to the network types query API', function() {
    var result = Networktype.get();
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/networktypes')
    $httpBackend.flush();
  });


})
