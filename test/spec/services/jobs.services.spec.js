'use strict';

describe("Job Unit Tests", function() {

  beforeEach(module('myApp'));

  var $httpBackend;
  var Job;

  beforeEach(inject(function($injector, _Job_) {

    Job = _Job_;
    $httpBackend = $injector.get('$httpBackend');

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/boxes/123/jobs')
      .respond(200, [{}]);

   }));

  afterEach(function() {
   $httpBackend.verifyNoOutstandingExpectation();
   $httpBackend.verifyNoOutstandingRequest();
  });

  it('should have sent a GET request to the jobs query API', function() {
    var result = Job.query({box_id: 123})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/boxes/123/jobs')
    $httpBackend.flush();
  });


})
