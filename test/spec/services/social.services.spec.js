'use strict';

describe("Social Unit Tests", function() {

  beforeEach(module('myApp'));

  var $httpBackend;
  var Social;
  var email = 'sm@polkaspots.com';

  beforeEach(inject(function($injector, _Social_) {

    Social = _Social_;
    $httpBackend = $injector.get('$httpBackend');

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/social')
      .respond(200, {});

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/social/123')
      .respond(200, {});

    $httpBackend.when('PATCH', 'http://mywifi.dev:8080/api/v1/social/123')
      .respond(200, {id: 123});

    $httpBackend.whenGET('/translations/en_GB.json').respond("");

   }));

  afterEach(function() {
   $httpBackend.verifyNoOutstandingExpectation();
   $httpBackend.verifyNoOutstandingRequest();
  });

  it('should have sent a GET request to location socials', function() {
    var result = Social.get({})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/social')
    $httpBackend.flush();
  });

  it('should have sent a GET request to location socials', function() {
    var result = Social.query({id: 123})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/social/123')
    $httpBackend.flush();
  });

  it('should have sent a PATCH request to location socials', function() {
    var result = Social.update({id: 123})
    $httpBackend.expectPATCH('http://mywifi.dev:8080/api/v1/social/123')
    $httpBackend.flush();
  });


})

