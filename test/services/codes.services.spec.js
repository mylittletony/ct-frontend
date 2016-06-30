'use strict';

describe("Code Unit Tests", function() {

  beforeEach(module('myApp'));

  var $httpBackend;
  var Code;
  var email = 'sm@polkaspots.com';

  beforeEach(inject(function($injector, _Code_) {

    Code = _Code_;
    $httpBackend = $injector.get('$httpBackend');

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/locations/123/vouchers/456/codes')
      .respond(200, {});

    $httpBackend.when('POST', 'http://mywifi.dev:8080/api/v1/codes/generate_password')
      .respond(200, {name: name, email: email, success: true});

    // $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/codes/456')
    //   .respond(200, {});

    // $httpBackend.when('PATCH', 'http://mywifi.dev:8080/api/v1/codes/456')
    //   .respond(200, {});

    // $httpBackend.when('POST', 'http://mywifi.dev:8080/api/v1/codes')
    //   .respond(200, {});

    // $httpBackend.when('DELETE', 'http://mywifi.dev:8080/api/v1/codes/546')
    //   .respond(200, {});

   }));

  afterEach(function() {
   $httpBackend.verifyNoOutstandingExpectation();
   $httpBackend.verifyNoOutstandingRequest();
  });

  it('should have sent a GET request to location codes', function() {
    var result = Code.get({location_id: 123, voucher_id: 456})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/locations/123/vouchers/456/codes')
    $httpBackend.flush();
  });

  it('should have sent a GET request to the location users API', function() {
    var result = Code.generate_password()
    $httpBackend.expectPOST('http://mywifi.dev:8080/api/v1/codes/generate_password')
    $httpBackend.flush();
  });


  // it('should have sent a GET request to location show codes', function() {
  //   var result = Code.query({id: 456})
  //   $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/codes/456')
  //   $httpBackend.flush();
  // });

})

