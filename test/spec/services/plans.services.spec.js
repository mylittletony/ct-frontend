'use strict';

describe("Plan Unit Tests", function() {

  beforeEach(module('myApp'));

  var $httpBackend;
  var Plan;

  beforeEach(inject(function($injector, _Plan_) {

    Plan = _Plan_;
    $httpBackend = $injector.get('$httpBackend');

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/plans/123?v=2')
      .respond(200, {});

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/plans?v=2')
      .respond(200, {});

   }));

  afterEach(function() {
   $httpBackend.verifyNoOutstandingExpectation();
   $httpBackend.verifyNoOutstandingRequest();
  });

  it('should have sent a GET request to get the plans', function() {
    var result = Plan.query({v:2});
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/plans?v=2');
    $httpBackend.flush();
  });

  it('should have sent a GET request to get the plans', function() {
    var result = Plan.get({id: 123, v: 2});
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/plans/123?v=2');
    $httpBackend.flush();
  });

});

