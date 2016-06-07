'use strict';

describe("RESTful Tests", function() {

  beforeEach(module('myApp'));

  var $httpBackend;
  var Inventory;

  beforeEach(inject(function($injector, _Inventory_) {

    Inventory = _Inventory_;
    $httpBackend = $injector.get('$httpBackend');

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/inventories')
      .respond(200, {});

   }));

  afterEach(function() {
   $httpBackend.verifyNoOutstandingExpectation();
   $httpBackend.verifyNoOutstandingRequest();
  });

  it('should have sent a GET request to get the inventory', function() {
    var result = Inventory.get()
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/inventories')
    $httpBackend.flush();
  });

});

