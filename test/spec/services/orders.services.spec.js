'use strict';

describe("Order Unit Tests", function() {

  beforeEach(module('myApp'));

  var $httpBackend;
  var Order;
  var email = 'sm@polkaspots.com';

  beforeEach(inject(function($injector, _Order_) {

    Order = _Order_;
    $httpBackend = $injector.get('$httpBackend');

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/store_orders')
      .respond(200, {});

    // $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/orders/456')
    //   .respond(200, {});

    $httpBackend.when('PATCH', 'http://mywifi.dev:8080/api/v1/store_orders/123')
      .respond(200, {});

    // $httpBackend.when('POST', 'http://mywifi.dev:8080/api/v1/orders')
    //   .respond(200, {});

    // $httpBackend.when('DELETE', 'http://mywifi.dev:8080/api/v1/orders/546')
    //   .respond(200, {});

   }));

  afterEach(function() {
   $httpBackend.verifyNoOutstandingExpectation();
   $httpBackend.verifyNoOutstandingRequest();
  });

  it('should have sent a GET request to location orders', function() {
    var result = Order.get({})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/store_orders')
    $httpBackend.flush();
  });

  it('should have sent a PATCH request to location orders', function() {
    var result = Order.update({id: 123})
    $httpBackend.expectPATCH('http://mywifi.dev:8080/api/v1/store_orders/123')
    $httpBackend.flush();
  });

  // it('should have sent a GET request to location show orders', function() {
  //   var result = Order.query({id: 456})
  //   $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/orders/456')
  //   $httpBackend.flush();
  // });

})

