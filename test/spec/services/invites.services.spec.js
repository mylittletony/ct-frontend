'use strict';

describe("RESTful Tests", function() {

  beforeEach(module('myApp'));

  var $httpBackend;
  var Invite;

  beforeEach(inject(function($injector, _Invite_) {

    Invite = _Invite_;
    $httpBackend = $injector.get('$httpBackend');

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/invites')
      .respond(200, [{}]);

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/invites/123')
      .respond(200, {});

    $httpBackend.when('DELETE', 'http://mywifi.dev:8080/api/v1/invites')
      .respond(200, {});

    $httpBackend.when('PATCH', 'http://mywifi.dev:8080/api/v1/invites')
      .respond(200, {});

    $httpBackend.when('POST', 'http://mywifi.dev:8080/api/v1/invites')
      .respond(200, {});

    $httpBackend.whenGET('/translations/en_GB.json').respond("");
   }));

  afterEach(function() {
   $httpBackend.verifyNoOutstandingExpectation();
   $httpBackend.verifyNoOutstandingRequest();
  });

  it('should have sent a GET request to get the invite', function() {
    var result = Invite.get()
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/invites')
    $httpBackend.flush();
  });

  it('should have sent a delete request to delete the invite', function() {
    var result = Invite.destroy()
    $httpBackend.expectDELETE('http://mywifi.dev:8080/api/v1/invites')
    $httpBackend.flush();
  });

  it('should have sent a post request to create an invite', function() {
    var result = Invite.create()
    $httpBackend.expectPOST('http://mywifi.dev:8080/api/v1/invites')
    $httpBackend.flush();
  });

  it('should have sent a post request to create an invite', function() {
    var result = Invite.update()
    $httpBackend.expectPATCH('http://mywifi.dev:8080/api/v1/invites')
    $httpBackend.flush();
  });

  it('should have sent a get request to get an invite', function() {
    var result = Invite.query({id: 123})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/invites/123')
    $httpBackend.flush();
  });

});

