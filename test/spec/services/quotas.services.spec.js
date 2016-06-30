'use strict';

describe("Quota Unit Tests", function() {

  beforeEach(module('myApp'));

  var $httpBackend;
  var Quota;

  beforeEach(inject(function($injector, _Quota_) {

    Quota = _Quota_;
    $httpBackend = $injector.get('$httpBackend');

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/users/123/quotas')
      .respond(200, {});

    // $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/locations/123/zones/456')
    //   .respond(200, {});

    // $httpBackend.when('PATCH', 'http://mywifi.dev:8080/api/v1/locations/123/zones/456')
    //   .respond(200, {});

    // $httpBackend.when('POST', 'http://mywifi.dev:8080/api/v1/locations/123/zones')
    //   .respond(200, {});

    // $httpBackend.when('DELETE', 'http://mywifi.dev:8080/api/v1/locations/123/zones/546')
    //   .respond(200, {});

   }));

  afterEach(function() {
   $httpBackend.verifyNoOutstandingExpectation();
   $httpBackend.verifyNoOutstandingRequest();
  });

  it('should have sent a GET request to location zones', function() {
    var result = Quota.get({user_id: 123})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/users/123/quotas')
    $httpBackend.flush();
  });

})

