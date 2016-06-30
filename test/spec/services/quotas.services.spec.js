'use strict';

describe("Quota Unit Tests", function() {

  beforeEach(module('myApp'));

  var $httpBackend;
  var Quota;

  beforeEach(inject(function($injector, _Quota_) {

    Quota = _Quota_;
    $httpBackend = $injector.get('$httpBackend');

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/users/123/quotas')
      .respond(200, {});

    $httpBackend.whenGET('/translations/en_GB.json').respond("");

   }));

  afterEach(function() {
   $httpBackend.verifyNoOutstandingExpectation();
   $httpBackend.verifyNoOutstandingRequest();
  });

  it('should have sent a GET request to location zones', function() {
    var result = Quota.get({user_id: 123})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/users/123/quotas')
    $httpBackend.flush();
  });

})

