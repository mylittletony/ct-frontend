'use strict';

describe("PortForward Unit Tests", function() {

  beforeEach(module('myApp'));

  var $httpBackend;
  var PortForward;

  beforeEach(inject(function($injector, _PortForward_) {

    PortForward = _PortForward_;
    $httpBackend = $injector.get('$httpBackend');

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/boxes/123/port_forwards')
      .respond(200, [{}]);

    $httpBackend.when('PATCH', 'http://mywifi.dev:8080/api/v1/boxes/123')
      .respond(200, {});

   }));

  afterEach(function() {
   $httpBackend.verifyNoOutstandingExpectation();
   $httpBackend.verifyNoOutstandingRequest();
  });

  it('should have sent a GET request to the port_forwards query API', function() {
    var result = PortForward.query({box_id: 123})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/boxes/123/port_forwards')
    $httpBackend.flush();
  });

  it('should have sent a post req to create a port_forward', function() {
    var result = PortForward.update({box_id: 123})
    $httpBackend.expectPATCH('http://mywifi.dev:8080/api/v1/boxes/123')
    $httpBackend.flush();
  });

})
