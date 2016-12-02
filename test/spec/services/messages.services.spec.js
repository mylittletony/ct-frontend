'use strict';

describe("Message Unit Tests", function() {

  beforeEach(module('myApp'));

  var $httpBackend;
  var Message;

  beforeEach(inject(function($injector, _Message_) {

    Message = _Message_;
    $httpBackend = $injector.get('$httpBackend');

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/boxes/123/messages')
    .respond(200, {});

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/boxes/123/messages/456')
    .respond(200, {});

    $httpBackend.when('DELETE', 'http://mywifi.dev:8080/api/v1/boxes/123/messages/456')
    .respond(200, {});

    $httpBackend.when('POST', 'http://mywifi.dev:8080/api/v1/boxes/123/messages')
    .respond(200, {});

    $httpBackend.whenGET('/translations/en_GB.json').respond("");
  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should have sent a GET request to location messages', function() {
    var result = Message.get({box_id: 123})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/boxes/123/messages')
    $httpBackend.flush();
  });

  it('should have sent a GET request to location show messages', function() {
    var result = Message.query({box_id: 123, id: 456})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/boxes/123/messages/456')
    $httpBackend.flush();
  });

  fit('should have sent a DELETE request to location show messages', function() {
    var result = Message.destroy({box_id: 123, id: 456})
    $httpBackend.expectDELETE('http://mywifi.dev:8080/api/v1/boxes/123/messages/456')
    $httpBackend.flush();
  });

  it('should have sent a POST request to location messages', function() {
    var result = Message.create({box_id: 123})
    $httpBackend.expectPOST('http://mywifi.dev:8080/api/v1/boxes/123/messages')
    $httpBackend.flush();
  });
})
