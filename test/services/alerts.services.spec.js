'use strict';

describe("Alert Unit Tests", function() {

  beforeEach(module('myApp'));

  var $httpBackend;
  var Alert;

  beforeEach(inject(function($injector, _Alert_) {

    Alert = _Alert_;
    $httpBackend = $injector.get('$httpBackend');

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/alerts')
      .respond(200, {});

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/alerts?count=true')
      .respond(200, {});

   }));

  afterEach(function() {
   $httpBackend.verifyNoOutstandingExpectation();
   $httpBackend.verifyNoOutstandingRequest();
  });

  it('should have sent a GET request to location alerts', function() {
    var result = Alert.count()
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/alerts?count=true')
    $httpBackend.flush();
  });

  it('should have sent a GET request to location alerts', function() {
    var result = Alert.get()
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/alerts')
    $httpBackend.flush();
  });

})

