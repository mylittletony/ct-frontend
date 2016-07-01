'use strict';

describe("SplashPage Unit Tests", function() {

  beforeEach(module('myApp'));

  var $httpBackend;
  var SplashPage;

  beforeEach(inject(function($injector, _SplashPage_) {

    SplashPage = _SplashPage_;
    $httpBackend = $injector.get('$httpBackend');

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/locations/123/splash_pages')
      .respond(200, {});

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/locations/123/splash_pages/456')
      .respond(200, {});

    $httpBackend.when('PATCH', 'http://mywifi.dev:8080/api/v1/locations/123/splash_pages/456')
      .respond(200, {});

    $httpBackend.when('POST', 'http://mywifi.dev:8080/api/v1/locations/123/splash_pages')
      .respond(200, {});

    $httpBackend.when('DELETE', 'http://mywifi.dev:8080/api/v1/locations/123/splash_pages/546')
      .respond(200, {});

    $httpBackend.when('POST', 'http://mywifi.dev:8080/api/v1/locations/123/splash_pages/546/duplicate')
      .respond(200, {});

    $httpBackend.when('POST', 'http://mywifi.dev:8080/api/v1/locations/123/splash_pages/546/stores')
      .respond(200, {});

    $httpBackend.when('PATCH', 'http://mywifi.dev:8080/api/v1/locations/123/splash_pages/546/stores')
      .respond(200, {});

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/locations/123/splash_pages/46/stores')
      .respond(200, {});

    $httpBackend.whenGET('/translations/en_GB.json').respond("");
   }));

  afterEach(function() {
   $httpBackend.verifyNoOutstandingExpectation();
   $httpBackend.verifyNoOutstandingRequest();
  });

  it('should have sent a GET request to location splash_pages', function() {
    var result = SplashPage.get({location_id: 123})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/locations/123/splash_pages')
    $httpBackend.flush();
  });

  it('should have sent a GET request to location show splash_pages', function() {
    var result = SplashPage.query({location_id: 123, id: 456})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/locations/123/splash_pages/456')
    $httpBackend.flush();
  });

  it('should have sent a PATCH request to location splash_pages', function() {
    var result = SplashPage.update({location_id: 123, id: 456})
    $httpBackend.expectPATCH('http://mywifi.dev:8080/api/v1/locations/123/splash_pages/456')
    $httpBackend.flush();
  });

  it('should have sent a POST request to location splash_pages', function() {
    var result = SplashPage.create({location_id: 123})
    $httpBackend.expectPOST('http://mywifi.dev:8080/api/v1/locations/123/splash_pages')
    $httpBackend.flush();
  });

  it('should have sent a POST request to duplicate the location splash_pages', function() {
    var result = SplashPage.duplicate({location_id: 123, id: 546})
    $httpBackend.expectPOST('http://mywifi.dev:8080/api/v1/locations/123/splash_pages/546/duplicate')
    $httpBackend.flush();
  });

  it('should have sent a DELETE request to location splash_pages', function() {
    var result = SplashPage.destroy({location_id: 123, id: 546})
    $httpBackend.expectDELETE('http://mywifi.dev:8080/api/v1/locations/123/splash_pages/546')
    $httpBackend.flush();
  });

  it('should have sent a POST request to location splash_pages to create a store', function() {
    var result = SplashPage.create_store({location_id: 123, splash_id: 546})
    $httpBackend.expectPOST('http://mywifi.dev:8080/api/v1/locations/123/splash_pages/546/stores')
    $httpBackend.flush();
  });

  it('should have sent a PATCH request to location splash_pages to create a store', function() {
    var result = SplashPage.update_store({location_id: 123, splash_id: 546})
    $httpBackend.expectPATCH('http://mywifi.dev:8080/api/v1/locations/123/splash_pages/546/stores')
    $httpBackend.flush();
  });

  it('should have sent a PATCH request to location splash_pages to create a store', function() {
    var result = SplashPage.store({location_id: 123, id: 46})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/locations/123/splash_pages/46/stores')
    $httpBackend.flush();
  });

})

