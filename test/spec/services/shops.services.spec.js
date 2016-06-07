'use strict';

describe("Shop Unit Tests", function() {

  beforeEach(module('myApp'));

  var $httpBackend;
  var Cart;
  var Product;

  describe("getting the products list", function() {
    beforeEach(inject(function($injector, _Product_) {

      Product = _Product_;
      $httpBackend = $injector.get('$httpBackend');

      $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/products')
        .respond(200, [{}]);

     }));

    afterEach(function() {
     $httpBackend.verifyNoOutstandingExpectation();
     $httpBackend.verifyNoOutstandingRequest();
    });

    it('should have sent a GET request to location shops', function() {
      var result = Product.query({})
      $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/products')
      $httpBackend.flush();
    });
  });

  describe("getting and updating the cart", function() {

    beforeEach(inject(function($injector, _Cart_) {

      Cart = _Cart_;
      $httpBackend = $injector.get('$httpBackend');

      $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/carts/123')
        .respond(200, {});

      $httpBackend.when('PATCH', 'http://mywifi.dev:8080/api/v1/carts/123')
        .respond(200, {});

      $httpBackend.when('POST', 'http://mywifi.dev:8080/api/v1/carts')
        .respond(200, {});

      $httpBackend.when('DELETE', 'http://mywifi.dev:8080/api/v1/carts/123')
        .respond(200, {});

     }));

    afterEach(function() {
     $httpBackend.verifyNoOutstandingExpectation();
     $httpBackend.verifyNoOutstandingRequest();
    });

    it('should have sent a GET request and get the cart', function() {
      var result = Cart.get({id: 123})
      $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/carts/123')
      $httpBackend.flush();
    });

    it('should have sent a PATCH request and update the cart', function() {
      var result = Cart.update({id: 123})
      $httpBackend.expectPATCH('http://mywifi.dev:8080/api/v1/carts/123')
      $httpBackend.flush();
    });

    it('should have sent a POST request and create the cart', function() {
      var result = Cart.create({})
      $httpBackend.expectPOST('http://mywifi.dev:8080/api/v1/carts')
      $httpBackend.flush();
    });

    it('should have sent a DELETE request and DELETE the cart', function() {
      var result = Cart.destroy({id: 123})
      $httpBackend.expectDELETE('http://mywifi.dev:8080/api/v1/carts/123')
      $httpBackend.flush();
    });
  });


})

