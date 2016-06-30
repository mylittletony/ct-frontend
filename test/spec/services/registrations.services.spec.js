'use strict';

describe("Registration Unit Tests", function() {

  beforeEach(module('myApp'));

  var $httpBackend;
  var Registration;
  var Holding;

  beforeEach(inject(function($injector, _Registration_, _Holding_) {

    Registration  = _Registration_;
    Holding       = _Holding_;
    $httpBackend = $injector.get('$httpBackend');

    $httpBackend.when('POST', 'http://mywifi.dev:8080/api/v1/registrations')
    .respond(200, {});

    $httpBackend.when('POST', 'http://mywifi.dev:8080/api/v1/holding_accounts')
    .respond(200, {});

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/holding_accounts/123')
    .respond(200, {id: 123});

    $httpBackend.when('PATCH', 'http://mywifi.dev:8080/api/v1/holding_accounts/123')
    .respond(200, {id: 123});

    $httpBackend.when('DELETE', 'http://mywifi.dev:8080/api/v1/holding_accounts/123')
    .respond(200, {id: 123});

    $httpBackend.whenGET('/translations/en_GB.json').respond("");

  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should have sent a post req to create a user', function() {
    var result = Registration.create();
    $httpBackend.expectPOST('http://mywifi.dev:8080/api/v1/registrations');
    $httpBackend.flush();
  });

  it('should have sent a post req to create a holding account', function() {
    var result = Holding.create();
    $httpBackend.expectPOST('http://mywifi.dev:8080/api/v1/holding_accounts');
    $httpBackend.flush();
  });

  it('should have sent a get req to get a holding account', function() {
    var result = Holding.get({id: 123});
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/holding_accounts/123');
    $httpBackend.flush();
  });

  it('should have sent a patch req to get a holding account', function() {
    var result = Holding.update({id: 123});
    $httpBackend.expectPATCH('http://mywifi.dev:8080/api/v1/holding_accounts/123');
    $httpBackend.flush();
  });

  it('should have sent a delete req to wipe a holding account', function() {
    var result = Holding.destroy({id: 123});
    $httpBackend.expectDELETE('http://mywifi.dev:8080/api/v1/holding_accounts/123');
    $httpBackend.flush();
  });

})

