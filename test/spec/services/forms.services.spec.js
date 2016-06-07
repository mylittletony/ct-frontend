'use strict';

describe("Form Unit Tests", function() {

  beforeEach(module('myApp'));

  var $httpBackend;
  var Form;

  beforeEach(inject(function($injector, _Form_) {

    Form = _Form_;
    $httpBackend = $injector.get('$httpBackend');

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/locations/123/registration_forms')
      .respond(200, {});

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/locations/123/registration_forms/456')
      .respond(200, {});

    $httpBackend.when('PATCH', 'http://mywifi.dev:8080/api/v1/locations/123/registration_forms/456')
      .respond(200, {});

    $httpBackend.when('POST', 'http://mywifi.dev:8080/api/v1/locations/123/registration_forms')
      .respond(200, {});

    $httpBackend.when('DELETE', 'http://mywifi.dev:8080/api/v1/locations/123/registration_forms/546')
      .respond(200, {});

   }));

  afterEach(function() {
   $httpBackend.verifyNoOutstandingExpectation();
   $httpBackend.verifyNoOutstandingRequest();
  });

  it('should have sent a GET request to location registration_forms', function() {
    var result = Form.get({location_id: 123})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/locations/123/registration_forms')
    $httpBackend.flush();
  });

  it('should have sent a GET request to location show registration_forms', function() {
    var result = Form.query({location_id: 123, id: 456})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/locations/123/registration_forms/456')
    $httpBackend.flush();
  });

  it('should have sent a PATCH request to location registration_forms', function() {
    var result = Form.update({location_id: 123, id: 456})
    $httpBackend.expectPATCH('http://mywifi.dev:8080/api/v1/locations/123/registration_forms/456')
    $httpBackend.flush();
  });

  it('should have sent a POST request to location registration_forms', function() {
    var result = Form.create({location_id: 123})
    $httpBackend.expectPOST('http://mywifi.dev:8080/api/v1/locations/123/registration_forms')
    $httpBackend.flush();
  });

  it('should have sent a DELETE request to location registration_forms', function() {
    var result = Form.destroy({location_id: 123, id: 546})
    $httpBackend.expectDELETE('http://mywifi.dev:8080/api/v1/locations/123/registration_forms/546');
    $httpBackend.flush();
  });

})

