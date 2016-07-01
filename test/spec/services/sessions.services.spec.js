'use strict';

describe("Session Unit Tests", function() {

  beforeEach(module('myApp'));

  var $httpBackend;
  var Session;

  beforeEach(inject(function($injector, _Session_) {

    Session = _Session_;
    $httpBackend = $injector.get('$httpBackend');

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/sessions')
    .respond(200, {});

    $httpBackend.whenGET('/translations/en_GB.json').respond("");

  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should have sent a GET request to the sessions query API', function() {
    var result = Session.query({})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/sessions')
    $httpBackend.flush();
  });

})
