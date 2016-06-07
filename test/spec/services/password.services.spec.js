'use strict';

describe("Password Unit Tests", function() {

  beforeEach(module('myApp'));

  var $httpBackend;
  var Password;

  beforeEach(inject(function($injector, _Password_) {

    Password = _Password_;
    $httpBackend = $injector.get('$httpBackend');

    $httpBackend.when('PATCH', 'http://mywifi.dev:8080/api/v1/passwords')
      .respond(200, {});

    $httpBackend.when('POST', 'http://mywifi.dev:8080/api/v1/passwords')
      .respond(200, {});

   }));

  afterEach(function() {
   $httpBackend.verifyNoOutstandingExpectation();
   $httpBackend.verifyNoOutstandingRequest();
  });

  it('should have sent a post req to create a password reset', function() {
    var result = Password.create();
    $httpBackend.expectPOST('http://mywifi.dev:8080/api/v1/passwords');
    $httpBackend.flush();
  });

  it('should have sent a patch req to update a user pass', function() {
    var result = Password.update();
    $httpBackend.expectPATCH('http://mywifi.dev:8080/api/v1/passwords');
    $httpBackend.flush();
  });

})

