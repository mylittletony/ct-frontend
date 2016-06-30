'use strict';

describe("Connected Firmwares Unit Tests", function() {

  beforeEach(module('myApp'));

  var $httpBackend;
  var Firmware;

  beforeEach(inject(function($injector, _Firmware_) {

    Firmware = _Firmware_;
    $httpBackend = $injector.get('$httpBackend');

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/firmwares')
      .respond(200, [{}]);

   }));

  afterEach(function() {
   $httpBackend.verifyNoOutstandingExpectation();
   $httpBackend.verifyNoOutstandingRequest();
  });

  it('should have sent a GET request to the firmware query API', function() {
    var result = Firmware.query();
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/firmwares');
    $httpBackend.flush();
  });


});
