'use strict';

describe("Operation Unit Tests", function() {

  beforeEach(module('myApp'));

  var $httpBackend;
  var Operation;

  beforeEach(inject(function($injector, _Operation_) {

    Operation = _Operation_;
    $httpBackend = $injector.get('$httpBackend');

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/boxes/123/operations')
    .respond(200, {});

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/boxes/123/operations/456')
    .respond(200, {});

    $httpBackend.whenGET('/translations/en_GB.json').respond("");
  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should have sent a GET request to location operations', function() {
    var result = Operation.get({box_id: 123})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/boxes/123/operations')
    $httpBackend.flush();
  });

  it('should have sent a GET request to location show operations', function() {
    var result = Operation.query({box_id: 123, id: 456})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/boxes/123/operations/456')
    $httpBackend.flush();
  });
})
