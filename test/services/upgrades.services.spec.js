'use strict';

describe("Upgrade Unit Tests", function() {

  beforeEach(module('myApp'));

  var $httpBackend;
  var Upgrade;

  beforeEach(inject(function($injector, _Upgrade_) {

    Upgrade = _Upgrade_;
    $httpBackend = $injector.get('$httpBackend');

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/upgrades')
      .respond(200, {});

    $httpBackend.when('DELETE', 'http://mywifi.dev:8080/api/v1/upgrades/token_destroy')
      .respond(200, {});

    $httpBackend.when('PATCH', 'http://mywifi.dev:8080/api/v1/upgrades/token_update')
      .respond(200, {});

   }));

  afterEach(function() {
   $httpBackend.verifyNoOutstandingExpectation();
   $httpBackend.verifyNoOutstandingRequest();
  });

  it('should have sent a GET request to the upgrades query API', function() {
    var result = Upgrade.get({});
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/upgrades');
    $httpBackend.flush();
  });

  it('should have sent a DELETE request to the upgrades query API', function() {
    var result = Upgrade.token_destroy({});
    $httpBackend.expectDELETE('http://mywifi.dev:8080/api/v1/upgrades/token_destroy');
    $httpBackend.flush();
  });

  it('should have sent a PATCH request to the upgrades query API', function() {
    var result = Upgrade.token_update({});
    $httpBackend.expectPATCH('http://mywifi.dev:8080/api/v1/upgrades/token_update');
    $httpBackend.flush();
  });

})
