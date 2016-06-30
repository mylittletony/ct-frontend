'use strict';

describe("Alert Unit Tests", function() {

  beforeEach(module('myApp'));

  var $httpBackend;
  var Distributor, Referral;

  beforeEach(inject(function($injector, _Distributor_, _Referral_) {

    Referral = _Referral_;
    Distributor = _Distributor_;
    $httpBackend = $injector.get('$httpBackend');

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/distributors/123')
      .respond(200, {id: 123});

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/referrals')
      .respond(200, [{}]);

   }));

  afterEach(function() {
   $httpBackend.verifyNoOutstandingExpectation();
   $httpBackend.verifyNoOutstandingRequest();
  });

  it('should have sent a GET request to get distro', function() {
    var result = Distributor.get({id:123})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/distributors/123')
    $httpBackend.flush();
  });

  it('should have sent a GET request to get referrals', function() {
    var result = Referral.get()
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/referrals')
    $httpBackend.flush();
  });

})

