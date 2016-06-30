'use strict';

describe("Authentications Unit Tests", function() {

  beforeEach(module('myApp'));

  var $httpBackend;
  var Authentication;

  beforeEach(inject(function($injector, _Authentication_) {

    Authentication = _Authentication_;
    $httpBackend = $injector.get('$httpBackend');

    $httpBackend.when('POST', 'http://mywifi.dev:8080/api/v1/auth')
      .respond(200, {});

   }));

  afterEach(function() {
   $httpBackend.verifyNoOutstandingExpectation();
   $httpBackend.verifyNoOutstandingRequest();
  });

  it('should have sent a post req to create a user', function() {
    var result = Authentication.create();
    $httpBackend.expectPOST('http://mywifi.dev:8080/api/v1/auth');
    $httpBackend.flush();
  });

})

