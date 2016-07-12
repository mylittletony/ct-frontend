'use strict';

describe("Location Service Unit Tests", function() {

  beforeEach(module('myApp'));

  var $httpBackend;
  var name = 'Josh Bavari';
  var email = 'sm@polkaspots.com';
  var Location;
  var LocationAccess;

  beforeEach(inject(function($injector, _Location_, _LocationAccess_) {

    Location = _Location_;
    LocationAccess = _LocationAccess_;
    $httpBackend = $injector.get('$httpBackend');

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/locations')
      .respond(200, {name: name, email: email, success: true});

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/locations?short=true')
      .respond(200, [{name: name, email: email, success: true}]);

    $httpBackend.when('DELETE', 'http://mywifi.dev:8080/api/v1/locations/123')
      .respond(200, {name: name, email: email, success: true});

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/locations/123/users')
      .respond(200, [{name: name, email: email, success: true}]);

    $httpBackend.when('POST', 'http://mywifi.dev:8080/api/v1/locations/123/users')
      .respond(200, {name: name, email: email, success: true});

    $httpBackend.when('DELETE', 'http://mywifi.dev:8080/api/v1/locations/123/users')
      .respond(200, {name: name, email: email, success: true});

    $httpBackend.when('PATCH', 'http://mywifi.dev:8080/api/v1/locations/123')
      .respond(200, {name: name, email: email, success: true});

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/locations/123/networks')
      .respond(200, {name: name, email: email, success: true});

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/locations/123')
      .respond(200, {name: name, email: email, success: true});

    $httpBackend.when('POST', 'http://mywifi.dev:8080/api/v1/locations')
      .respond(200, {name: name, email: email, success: true});

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/locations/123/stats')
      .respond(200, {name: name, email: email, success: true});

    $httpBackend.whenGET('/translations/en_GB.json').respond("");
   }));

  afterEach(function() {
   $httpBackend.verifyNoOutstandingExpectation();
   $httpBackend.verifyNoOutstandingRequest();
  });

  it('should have sent a GET request to the location query API', function() {
    var result = Location.query({})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/locations')
    $httpBackend.flush();
  });

  it('should have sent a GET request to the location query API', function() {
    var result = Location.shortquery({short: true})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/locations?short=true')
    $httpBackend.flush();
  });

  it('should have sent a delete request to the location query API', function() {
    var result = Location.destroy({id: 123})
    $httpBackend.expectDELETE('http://mywifi.dev:8080/api/v1/locations/123')
    $httpBackend.flush();
  });

  it('should have sent a GET request to the location users API', function() {
    var result = Location.users({id: 123})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/locations/123/users')
    $httpBackend.flush();
  });

  it('should have sent a POST request to the add users API', function() {
    var result = Location.add_user({id: 123})
    $httpBackend.expectPOST('http://mywifi.dev:8080/api/v1/locations/123/users')
    $httpBackend.flush();
  });

  it('should have sent a DELETE request to delete a lcoation users API', function() {
    var result = Location.del_user({id: 123})
    $httpBackend.expectDELETE('http://mywifi.dev:8080/api/v1/locations/123/users')
    $httpBackend.flush();
  });

  it('should have sent a PATCH request to update the location', function() {
    var result = Location.update({id: 123})
    $httpBackend.expectPATCH('http://mywifi.dev:8080/api/v1/locations/123')
    $httpBackend.flush();
  });

  it('should have sent a GET request to location#networks', function() {
    var result = Location.networks({id: 123})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/locations/123/networks')
    $httpBackend.flush();
  });

  it('should have sent a GET request to location#show', function() {
    var result = Location.get({id: 123})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/locations/123')
    $httpBackend.flush();
  });

  it('should have sent a POST request to location#create', function() {
    var result = Location.save()
    $httpBackend.expectPOST('http://mywifi.dev:8080/api/v1/locations')
    $httpBackend.flush();
  });

  it('should get the location stats', function() {
    var result = Location.stats({id: 123})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/locations/123/stats')
    $httpBackend.flush();
  });

})

