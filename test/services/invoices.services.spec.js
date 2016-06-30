'use strict';

describe("RESTful Tests", function() {

  beforeEach(module('myApp'));

  var $httpBackend;
  var Invoice;

  beforeEach(inject(function($injector, _Invoice_) {

    Invoice = _Invoice_;
    $httpBackend = $injector.get('$httpBackend');

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/invoices')
      .respond(200, [{}]);

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/invoices/123')
      .respond(200, {});

    $httpBackend.when('POST', 'http://mywifi.dev:8080/api/v1/invoices/email?ids=2222')
      .respond(200, {});

    $httpBackend.when('POST', 'http://mywifi.dev:8080/api/v1/invoices/123/refund')
      .respond(200, {});

   }));

  afterEach(function() {
   $httpBackend.verifyNoOutstandingExpectation();
   $httpBackend.verifyNoOutstandingRequest();
  });

  it('should have sent a GET request to get the invoice', function() {
    var result = Invoice.get()
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/invoices')
    $httpBackend.flush();
  });

  it('should have sent a GET request to get the invoice', function() {
    var result = Invoice.query({id: 123})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/invoices/123')
    $httpBackend.flush();
  });

  it('should have sent a patch req. to update the password', function() {
    var result = Invoice.email({ids: 2222})
    $httpBackend.expectPOST('http://mywifi.dev:8080/api/v1/invoices/email?ids=2222')
    $httpBackend.flush();
  });

  it('should have sent a post req. to refund the invoice', function() {
    var result = Invoice.refund({id: 123})
    $httpBackend.expectPOST('http://mywifi.dev:8080/api/v1/invoices/123/refund')
    $httpBackend.flush();
  });

});

