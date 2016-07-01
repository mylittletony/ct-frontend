'use strict';

describe("Apps Unit Tests", function() {

  beforeEach(module('myApp'));

  var $httpBackend;
  var App;
  var email = 'sm@polkaspots.com';

  beforeEach(inject(function($injector, _App_) {

    App = _App_;
    $httpBackend = $injector.get('$httpBackend');

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/apps')
      .respond(200, [{}]);

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/apps/123')
      .respond(200, {id: 123});

    $httpBackend.when('POST', 'http://mywifi.dev:8080/api/v1/apps')
      .respond(200, {});

    $httpBackend.when('PATCH', 'http://mywifi.dev:8080/api/v1/apps/123')
      .respond(200, {id: 123});

    $httpBackend.when('DELETE', 'http://mywifi.dev:8080/api/v1/apps/123')
      .respond(200, {id: 123});

    $httpBackend.whenGET('/translations/en_GB.json').respond("");

   }));

  afterEach(function() {
   $httpBackend.verifyNoOutstandingExpectation();
   $httpBackend.verifyNoOutstandingRequest();
  });

  it('should have sent a GET request to location codes', function() {
    var result = App.get({})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/apps')
    $httpBackend.flush();
  });

  it('should have sent a PATCH request to location show codes', function() {
    var result = App.update({id: 123})
    $httpBackend.expectPATCH('http://mywifi.dev:8080/api/v1/apps/123')
    $httpBackend.flush();
  });

  it('should have sent a GET request to location show codes', function() {
    var result = App.query({id: 123})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/apps/123')
    $httpBackend.flush();
  });

  it('should have sent a CREATE request to location show codes', function() {
    var result = App.create({})
    $httpBackend.expectPOST('http://mywifi.dev:8080/api/v1/apps')
    $httpBackend.flush();
  });

  it('should have sent a DELETE request to location show codes', function() {
    var result = App.destroy({id: 123})
    $httpBackend.expectDELETE('http://mywifi.dev:8080/api/v1/apps/123')
    $httpBackend.flush();
  });

})

