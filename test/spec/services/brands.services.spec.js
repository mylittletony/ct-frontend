'use strict';

describe("Brand Unit Tests", function() {

  beforeEach(module('myApp'));

  var $httpBackend;
  var Brand;
  var email = 'sm@polkaspots.com';

  beforeEach(inject(function($injector, _Brand_) {

    Brand = _Brand_;
    $httpBackend = $injector.get('$httpBackend');

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/brands')
      .respond(200, {});

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/brands/simon')
      .respond(200, {id: 'simon'});

    $httpBackend.when('POST', 'http://mywifi.dev:8080/api/v1/brands')
      .respond(200, {});

    $httpBackend.when('PATCH', 'http://mywifi.dev:8080/api/v1/brands/123')
      .respond(200, {id: 123});

    $httpBackend.whenGET('/translations/en_GB.json').respond("");

   }));

  afterEach(function() {
   $httpBackend.verifyNoOutstandingExpectation();
   $httpBackend.verifyNoOutstandingRequest();
  });

  it('should have sent a GET request to location brands', function() {
    var result = Brand.get({})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/brands')
    $httpBackend.flush();
  });

  it('should have sent a GET request to location show brands', function() {
    var result = Brand.query({id: 'simon'})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/brands/simon')
    $httpBackend.flush();
  });

  it('should have sent a POST request to location brands', function() {
    var result = Brand.create({})
    $httpBackend.expectPOST('http://mywifi.dev:8080/api/v1/brands')
    $httpBackend.flush();
  });

  it('should have sent a PACTH request to location brands', function() {
    var result = Brand.create({})
    $httpBackend.expectPOST('http://mywifi.dev:8080/api/v1/brands')
    $httpBackend.flush();
  });

})

