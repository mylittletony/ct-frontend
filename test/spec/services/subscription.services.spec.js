'use strict';

describe("Subscription Unit Tests", function() {

  beforeEach(module('myApp'));

  var $httpBackend;
  var Subscription;

  beforeEach(inject(function($injector, _Subscription_) {

    Subscription = _Subscription_;
    $httpBackend = $injector.get('$httpBackend');

    $httpBackend.when('POST', 'http://mywifi.dev:8080/api/v1/subscriptions')
      .respond(200, {});

    $httpBackend.when('PATCH', 'http://mywifi.dev:8080/api/v1/subscriptions')
      .respond(200, {});

    $httpBackend.when('DELETE', 'http://mywifi.dev:8080/api/v1/subscriptions')
      .respond(200, {});

   }));

  afterEach(function() {
   $httpBackend.verifyNoOutstandingExpectation();
   $httpBackend.verifyNoOutstandingRequest();
  });

  it('should have sent a POST request to create a sub', function() {
    var result = Subscription.create()
    $httpBackend.expectPOST('http://mywifi.dev:8080/api/v1/subscriptions')
    $httpBackend.flush();
  });

  it('should have sent a PATCH request to checkout', function() {
    var result = Subscription.update()
    $httpBackend.expectPATCH('http://mywifi.dev:8080/api/v1/subscriptions')
    $httpBackend.flush();
  });

  it('should have sent a DELETE request to checkout', function() {
    var result = Subscription.destroy()
    $httpBackend.expectDELETE('http://mywifi.dev:8080/api/v1/subscriptions')
    $httpBackend.flush();
  });

});

