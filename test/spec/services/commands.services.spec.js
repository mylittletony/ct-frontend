'use strict';

describe("Command Unit Tests", function() {

  beforeEach(module('myApp'));

  var $httpBackend;
  var Command;

  beforeEach(inject(function($injector, _Command_) {

    Command = _Command_;
    $httpBackend = $injector.get('$httpBackend');

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/commands')
      .respond(200, [{}]);

   }));

  afterEach(function() {
   $httpBackend.verifyNoOutstandingExpectation();
   $httpBackend.verifyNoOutstandingRequest();
  });

  it('should have sent a GET request to the commands query API', function() {
    var result = Command.query()
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/commands')
    $httpBackend.flush();
  });


})
