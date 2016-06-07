'use strict';

describe("RESTful Tests", function() {

  beforeEach(module('myApp'));

  var $httpBackend;
  var InvoiceItem;

  beforeEach(inject(function($injector, _InvoiceItem_) {

    InvoiceItem = _InvoiceItem_;
    $httpBackend = $injector.get('$httpBackend');

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/invoice_items/123')
      .respond(200, {});

   }));

  afterEach(function() {
   $httpBackend.verifyNoOutstandingExpectation();
   $httpBackend.verifyNoOutstandingRequest();
  });

  it('should have sent a GET request to get the invoice', function() {
    var result = InvoiceItem.query({id: 123})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/invoice_items/123')
    $httpBackend.flush();
  });

});

