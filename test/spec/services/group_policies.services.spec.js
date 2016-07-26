'use strict';

describe("GroupPolicy Unit Tests", function() {

  beforeEach(module('myApp'));

  var $httpBackend;
  var GroupPolicy;

  beforeEach(inject(function($injector, _GroupPolicy_) {

    GroupPolicy = _GroupPolicy_;
    $httpBackend = $injector.get('$httpBackend');

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/locations/123/group_policies')
    .respond(200, {});

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/locations/123/group_policies/456')
    .respond(200, {});

    $httpBackend.when('PATCH', 'http://mywifi.dev:8080/api/v1/locations/123/group_policies/456')
    .respond(200, {});

    $httpBackend.when('POST', 'http://mywifi.dev:8080/api/v1/locations/123/group_policies')
    .respond(200, {});

    $httpBackend.when('DELETE', 'http://mywifi.dev:8080/api/v1/locations/123/group_policies/546')
    .respond(200, {});

    $httpBackend.whenGET('/translations/en_GB.json').respond("");
  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should have sent a GET request to location group_policies', function() {
    var result = GroupPolicy.get({location_id: 123})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/locations/123/group_policies')
    $httpBackend.flush();
  });

  it('should have sent a GET request to location show group_policies', function() {
    var result = GroupPolicy.query({location_id: 123, id: 456})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/locations/123/group_policies/456')
    $httpBackend.flush();
  });

  it('should have sent a PATCH request to location group_policies', function() {
    var result = GroupPolicy.update({location_id: 123, id: 456})
    $httpBackend.expectPATCH('http://mywifi.dev:8080/api/v1/locations/123/group_policies/456')
    $httpBackend.flush();
  });

  it('should have sent a POST request to location group_policies', function() {
    var result = GroupPolicy.create({location_id: 123})
    $httpBackend.expectPOST('http://mywifi.dev:8080/api/v1/locations/123/group_policies')
    $httpBackend.flush();
  });

  it('should have sent a DELETE request to location group_policies', function() {
    var result = GroupPolicy.destroy({location_id: 123, id: 546})
    $httpBackend.expectDELETE('http://mywifi.dev:8080/api/v1/locations/123/group_policies/546')
    $httpBackend.flush();
  });

})


