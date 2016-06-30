'use strict';

describe("Integration Unit Tests", function() {

  beforeEach(module('myApp'));

  var $httpBackend;
  var Integration;

  beforeEach(inject(function($injector, _Integration_) {

    Integration = _Integration_;
    $httpBackend = $injector.get('$httpBackend');

    $httpBackend.when('POST', 'http://mywifi.dev:8080/api/v1/integrations?integration=123')
      .respond(200, {code: 123});

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/integrations')
      .respond(200, [{}]);

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/integrations/123')
      .respond(200, {});

    $httpBackend.when('DELETE', 'http://mywifi.dev:8080/api/v1/integrations/123')
      .respond(200, {id: 123});

    $httpBackend.when('PATCH', 'http://mywifi.dev:8080/api/v1/integrations/123')
      .respond(200, {id: 123});

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/integrations/123?slack.channels=true')
      .respond(200, [{}]);

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/integrations/123?chimp.lists=true')
      .respond(200, [{}]);

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/integrations/123?twillio.numbers=true')
      .respond(200, [{}]);

   }));

  afterEach(function() {
   $httpBackend.verifyNoOutstandingExpectation();
   $httpBackend.verifyNoOutstandingRequest();
  });

  it('should have sent a POST request to create the integration', function() {
    var result = Integration.create({integration: 123})
    $httpBackend.expectPOST('http://mywifi.dev:8080/api/v1/integrations?integration=123')
    $httpBackend.flush();
  });

  it('should have sent a delete request to delete an integration', function() {
    var result = Integration.destroy({id: 123})
    $httpBackend.expectDELETE('http://mywifi.dev:8080/api/v1/integrations/123')
    $httpBackend.flush();
  });

  it('should have sent a PATCH request to update an integration', function() {
    var result = Integration.update({id: 123})
    $httpBackend.expectPATCH('http://mywifi.dev:8080/api/v1/integrations/123')
    $httpBackend.flush();
  });

  it('should have sent a get request to get an integration', function() {
    var result = Integration.query({id: 123})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/integrations/123')
    $httpBackend.flush();
  });

  it('should get the slack channels', function() {
    var result = Integration.slack_channels({id: 123})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/integrations/123?slack.channels=true')
    $httpBackend.flush();
  });

  it('should get the chimp lists', function() {
    var result = Integration.chimp_lists({id: 123})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/integrations/123?chimp.lists=true')
    $httpBackend.flush();
  });

  it('should get the twillio numbers', function() {
    var result = Integration.twillio({id: 123})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/integrations/123?twillio.numbers=true')
    $httpBackend.flush();
  });

})

