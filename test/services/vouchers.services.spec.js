'use strict';

describe("Voucher Unit Tests", function() {

  beforeEach(module('myApp'));

  var $httpBackend;
  var Voucher;

  beforeEach(inject(function($injector, _Voucher_) {

    Voucher = _Voucher_;
    $httpBackend = $injector.get('$httpBackend');

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/locations/123/vouchers')
      .respond(200, {});

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/locations/123/vouchers/456')
      .respond(200, {});

    $httpBackend.when('PATCH', 'http://mywifi.dev:8080/api/v1/locations/123/vouchers/456')
      .respond(200, {});

    $httpBackend.when('POST', 'http://mywifi.dev:8080/api/v1/locations/123/vouchers')
      .respond(200, {});

    $httpBackend.when('DELETE', 'http://mywifi.dev:8080/api/v1/locations/123/vouchers/546')
      .respond(200, {});

   }));

  afterEach(function() {
   $httpBackend.verifyNoOutstandingExpectation();
   $httpBackend.verifyNoOutstandingRequest();
  });

  it('should have sent a GET request to location vouchers', function() {
    var result = Voucher.get({location_id: 123})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/locations/123/vouchers')
    $httpBackend.flush();
  });

  it('should have sent a GET request to location show vouchers', function() {
    var result = Voucher.query({location_id: 123, id: 456})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/locations/123/vouchers/456')
    $httpBackend.flush();
  });

  it('should have sent a PATCH request to location vouchers', function() {
    var result = Voucher.update({location_id: 123, id: 456})
    $httpBackend.expectPATCH('http://mywifi.dev:8080/api/v1/locations/123/vouchers/456')
    $httpBackend.flush();
  });

  it('should have sent a POST request to location vouchers', function() {
    var result = Voucher.create({location_id: 123})
    $httpBackend.expectPOST('http://mywifi.dev:8080/api/v1/locations/123/vouchers')
    $httpBackend.flush();
  });

  it('should have sent a DELETE request to location vouchers', function() {
    var result = Voucher.destroy({location_id: 123, id: 546})
    $httpBackend.expectDELETE('http://mywifi.dev:8080/api/v1/locations/123/vouchers/546')
    $httpBackend.flush();
  });

})

