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
      .respond(200, {name: name, email: email, success: true});

    $httpBackend.when('POST', 'http://mywifi.dev:8080/api/v1/locations/123/users')
      .respond(200, {name: name, email: email, success: true});

    $httpBackend.when('DELETE', 'http://mywifi.dev:8080/api/v1/locations/123/users')
      .respond(200, {name: name, email: email, success: true});

    $httpBackend.when('POST', 'http://mywifi.dev:8080/api/v1/locations/123/watchers')
      .respond(200, {name: name, email: email, success: true});

    $httpBackend.when('POST', 'http://mywifi.dev:8080/api/v1/locations/123/sense')
      .respond(200, {name: name, email: email, success: true});

    $httpBackend.when('DELETE', 'http://mywifi.dev:8080/api/v1/locations/123/sense')
      .respond(200, {name: name, email: email, success: true});

    $httpBackend.when('POST', 'http://mywifi.dev:8080/api/v1/locations/123/archive')
      .respond(200, {name: name, email: email, success: true});

    $httpBackend.when('POST', 'http://mywifi.dev:8080/api/v1/locations/123/unarchive')
      .respond(200, {name: name, email: email, success: true});

    $httpBackend.when('PATCH', 'http://mywifi.dev:8080/api/v1/locations/123')
      .respond(200, {name: name, email: email, success: true});

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/locations/123/firewall_rules')
      .respond(200, [{name: name, email: email, success: true}]);

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/locations/123/walledgardens')
      .respond(200, [{name: name, email: email, success: true}]);

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/locations/123/location_events')
      .respond(200, [{name: name, email: email, success: true}]);

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/locations/123/networks')
      .respond(200, {name: name, email: email, success: true});

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/locations/123/blacklists')
      .respond(200, [{name: name, email: email, success: true}]);

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/locations/123')
      .respond(200, {name: name, email: email, success: true});

    $httpBackend.when('POST', 'http://mywifi.dev:8080/api/v1/locations')
      .respond(200, {name: name, email: email, success: true});

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/locations/123/layout')
      .respond(200, {name: name, email: email, success: true});

    $httpBackend.when('POST', 'http://mywifi.dev:8080/api/v1/locations/123/duplicate_logins')
      .respond(200, {name: name, email: email, success: true});

    $httpBackend.when('POST', 'http://mywifi.dev:8080/api/v1/locations/123/reset_logins')
      .respond(200, {name: name, email: email, success: true});

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/locations/123/access')
      .respond(200, {name: name, email: email, success: true});

    $httpBackend.when('PATCH', 'http://mywifi.dev:8080/api/v1/locations/123/access')
      .respond(200, {name: name, email: email, success: true});

    $httpBackend.when('POST', 'http://mywifi.dev:8080/api/v1/locations/123/fb_verify_page')
      .respond(200, {name: name, email: email, success: true});

    $httpBackend.when('POST', 'http://mywifi.dev:8080/api/v1/locations/123/fb_get_pages')
      .respond(200, {name: name, email: email, success: true});

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/locations/123/stats')
      .respond(200, {name: name, email: email, success: true});

    $httpBackend.when('POST', 'http://mywifi.dev:8080/api/v1/locations/123/transfer')
      .respond(200, {});

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

  it('should have sent a POST request to create a location user', function() {
    var result = Location.watch({id: 123})
    $httpBackend.expectPOST('http://mywifi.dev:8080/api/v1/locations/123/watchers')
    $httpBackend.flush();
  });

  it('should have sent a POST request to enable sense at location', function() {
    var result = Location.enable_sense({id: 123})
    $httpBackend.expectPOST('http://mywifi.dev:8080/api/v1/locations/123/sense')
    $httpBackend.flush();
  });

  it('should have sent a POST request to disable sense location user', function() {
    var result = Location.disable_sense({id: 123})
    $httpBackend.expectDELETE('http://mywifi.dev:8080/api/v1/locations/123/sense')
    $httpBackend.flush();
  });

  it('should have sent a POST request to archive a location', function() {
    var result = Location.archive({id: 123})
    $httpBackend.expectPOST('http://mywifi.dev:8080/api/v1/locations/123/archive')
    $httpBackend.flush();
  });

  it('should have sent a POST request to enable sense at a location', function() {
    var result = Location.unarchive({id: 123})
    $httpBackend.expectPOST('http://mywifi.dev:8080/api/v1/locations/123/unarchive')
    $httpBackend.flush();
  });

  it('should have sent a PATCH request to update the location', function() {
    var result = Location.update({id: 123})
    $httpBackend.expectPATCH('http://mywifi.dev:8080/api/v1/locations/123')
    $httpBackend.flush();
  });

  it('should have sent a GET request to location#firewalls', function() {
    var result = Location.firewall({id: 123})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/locations/123/firewall_rules')
    $httpBackend.flush();
  });

  it('should have sent a GET request to location#walledgardens', function() {
    var result = Location.walledgardens({id: 123})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/locations/123/walledgardens')
    $httpBackend.flush();
  });

  it('should have sent a GET request to location#events', function() {
    var result = Location.events({id: 123})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/locations/123/location_events')
    $httpBackend.flush();
  });

  it('should have sent a GET request to location#networks', function() {
    var result = Location.networks({id: 123})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/locations/123/networks')
    $httpBackend.flush();
  });

  it('should have sent a GET request to location#blacklists', function() {
    var result = Location.blacklists({id: 123})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/locations/123/blacklists')
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

  // Layouts //

  it('should have sent a GET request to location#show', function() {
    var result = Location.layouts({id: 123})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/locations/123/layout')
    $httpBackend.flush();
  });

  it('should have sent a POST request to location#duplicate_logins', function() {
    var result = Location.clone_layouts({id: 123})
    $httpBackend.expectPOST('http://mywifi.dev:8080/api/v1/locations/123/duplicate_logins')
    $httpBackend.flush();
  });

  it('should have sent a POST request to location#reset_logins', function() {
    var result = Location.reset_layouts({id: 123})
    $httpBackend.expectPOST('http://mywifi.dev:8080/api/v1/locations/123/reset_logins')
    $httpBackend.flush();
  });

  // Access //

  it('should have sent a GET request to location#access', function() {
    var result = LocationAccess.get({id: 123})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/locations/123/access')
    $httpBackend.flush();
  });

  it('should have sent a UPDATE request to location#access', function() {
    var result = LocationAccess.update({id: 123})
    $httpBackend.expectPATCH('http://mywifi.dev:8080/api/v1/locations/123/access')
    $httpBackend.flush();
  });

  it('should have sent a POST request to location#facebook_verify_page', function() {
    var result = LocationAccess.fb_verify_page({id: 123})
    $httpBackend.expectPOST('http://mywifi.dev:8080/api/v1/locations/123/fb_verify_page')
    $httpBackend.flush();
  });

  it('should have sent a POST request to location#facebook_get_pages', function() {
    var result = LocationAccess.fb_get_pages({id: 123})
    $httpBackend.expectPOST('http://mywifi.dev:8080/api/v1/locations/123/fb_get_pages')
    $httpBackend.flush();
  });

  it('should get the location stats', function() {
    var result = Location.stats({id: 123})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/locations/123/stats')
    $httpBackend.flush();
  });

  // Transfer //

  it('should transfer the location', function() {
    var result = Location.transfer({id: 123})
    $httpBackend.expectPOST('http://mywifi.dev:8080/api/v1/locations/123/transfer')
    $httpBackend.flush();
  });

})

