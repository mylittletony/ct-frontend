'use strict';

describe("Product Unit Tests", function() {

  beforeEach(module('myApp'));

  var $httpBackend;
  var Product;
  var product = 'sm@polkaspots.com';

  beforeEach(inject(function($injector, _Product_) {

    Product = _Product_;
    $httpBackend = $injector.get('$httpBackend');

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/products')
      .respond(200, {});

   }));

  afterEach(function() {
   $httpBackend.verifyNoOutstandingExpectation();
   $httpBackend.verifyNoOutstandingRequest();
  });

  it('should have sent a GET request to location products', function() {
    var result = Product.get({})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/products')
    $httpBackend.flush();
  });


})

