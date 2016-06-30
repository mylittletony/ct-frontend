'use strict';

describe("ProductOrder Unit Tests", function() {

  beforeEach(module('myApp'));

  var $httpBackend;
  var ProductOrder;

  beforeEach(inject(function($injector, _ProductOrder_) {

    ProductOrder = _ProductOrder_;
    $httpBackend = $injector.get('$httpBackend');

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/product_orders')
      .respond(200, [{}]);

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/product_orders/456')
      .respond(200, {});

    $httpBackend.when('PATCH', 'http://mywifi.dev:8080/api/v1/product_orders/123')
      .respond(200, {});


   }));

  afterEach(function() {
   $httpBackend.verifyNoOutstandingExpectation();
   $httpBackend.verifyNoOutstandingRequest();
  });

  it('should have sent a GET request to the product_orders query API', function() {
    var result = ProductOrder.query()
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/product_orders')
    $httpBackend.flush();
  });

  it('should have sent a GET request to the product_orders get API', function() {
    var result = ProductOrder.get({id: 456})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/product_orders/456')
    $httpBackend.flush();
  });

  // it('should have sent a delete request to the product_orders get API', function() {
  //   var result = ProductOrder.destroy({controller: 'boxes', box_id: 123, id: 456})
  //   $httpBackend.expectDELETE('http://mywifi.dev:8080/api/v1/boxes/123/product_orders/456')
  //   $httpBackend.flush();
  // });

  it('should have sent a post req to create a product_order', function() {
    var result = ProductOrder.update({id: 123})
    $httpBackend.expectPATCH('http://mywifi.dev:8080/api/v1/product_orders/123')
    $httpBackend.flush();
  });

})
