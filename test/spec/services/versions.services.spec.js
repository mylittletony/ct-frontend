'use strict';

describe("Versions Unit Tests", function() {

  beforeEach(module('myApp'));

  var $httpBackend;
  var Version;

  beforeEach(inject(function($injector, _Version_) {

    Version = _Version_;
    $httpBackend = $injector.get('$httpBackend');

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/boxes/123/versions')
    .respond(200, {});

    $httpBackend.when('POST', 'http://mywifi.dev:8080/api/v1/boxes/123/versions/1/revert')
    .respond(200, {});

    $httpBackend.whenGET('/translations/en_GB.json').respond("");
  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should have sent a GET request to boxes versions', function() {
    var result = Version.query({resource_id: 123, resource: 'boxes'});
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/boxes/123/versions');
    $httpBackend.flush();
  });

  // We cant rollback because of paper trail //
  xit('should have sent a GET request to request specific version', function() {
    var result = Version.revert({resource_id: 123, id: 1, resource: 'boxes'});
    $httpBackend.expectPOST('http://mywifi.dev:8080/api/v1/boxes/123/versions/1/revert')
    $httpBackend.flush();
  });

})

