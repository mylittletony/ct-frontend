'use strict';

describe("Email Unit Tests", function() {

  beforeEach(module('myApp'));

  var $httpBackend;
  var Email;
  var email = 'sm@polkaspots.com';

  beforeEach(inject(function($injector, _Email_) {

    Email = _Email_;
    $httpBackend = $injector.get('$httpBackend');

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/emails')
      .respond(200, {});

   }));

  afterEach(function() {
   $httpBackend.verifyNoOutstandingExpectation();
   $httpBackend.verifyNoOutstandingRequest();
  });

  it('should have sent a GET request to location emails', function() {
    var result = Email.get({})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/emails')
    $httpBackend.flush();
  });


})

