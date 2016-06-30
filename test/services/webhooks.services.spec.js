'use strict';

describe("RESTful Tests", function() {

  beforeEach(module('myApp'));

  var $httpBackend;
  var Webhook;

  beforeEach(inject(function($injector, _Webhook_) {

    Webhook = _Webhook_;
    $httpBackend = $injector.get('$httpBackend');

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/webhooks')
      .respond(200, [{}]);

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/webhooks/123')
      .respond(200, {});

    $httpBackend.when('POST', 'http://mywifi.dev:8080/api/v1/webhooks')
      .respond(200, {});

    $httpBackend.when('DELETE', 'http://mywifi.dev:8080/api/v1/webhooks/123')
      .respond(200, {});

   }));

  afterEach(function() {
   $httpBackend.verifyNoOutstandingExpectation();
   $httpBackend.verifyNoOutstandingRequest();
  });

  it('should have sent a GET request to get the webhook', function() {
    var result = Webhook.get()
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/webhooks')
    $httpBackend.flush();
  });

  it('should have sent a GET request to get the webhook', function() {
    var result = Webhook.query({id: 123})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/webhooks/123')
    $httpBackend.flush();
  });

  it('should have sent a patch req. to update the password', function() {
    var result = Webhook.create()
    $httpBackend.expectPOST('http://mywifi.dev:8080/api/v1/webhooks')
    $httpBackend.flush();
  });

  it('should have sent a delete req. to update the password', function() {
    var result = Webhook.destroy({id: 123})
    $httpBackend.expectDELETE('http://mywifi.dev:8080/api/v1/webhooks/123')
    $httpBackend.flush();
  });


});

