'use strict';

describe("Project Unit Tests", function() {

  beforeEach(module('myApp'));

  var $httpBackend;
  var Project;
  var email = 'sm@polkaspots.com';

  beforeEach(inject(function($injector, _Project_) {

    Project = _Project_;
    $httpBackend = $injector.get('$httpBackend');

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/projects')
      .respond(200, {});

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/projects/123')
      .respond(200, {id: 123});

    $httpBackend.when('PATCH', 'http://mywifi.dev:8080/api/v1/projects/123')
      .respond(200, {id: 123});

    $httpBackend.when('DELETE', 'http://mywifi.dev:8080/api/v1/projects/123')
      .respond(200, {id: 123});

    $httpBackend.whenGET('/translations/en_GB.json').respond("");

   }));

  afterEach(function() {
   $httpBackend.verifyNoOutstandingExpectation();
   $httpBackend.verifyNoOutstandingRequest();
  });

  it('should have sent a GET request to list the projects', function() {
    var result = Project.get({})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/projects')
    $httpBackend.flush();
  });

  it('should have sent a GET request to get a project', function() {
    var result = Project.query({id: 123})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/projects/123')
    $httpBackend.flush();
  });

  it('should have sent a PATCH request to update a projects', function() {
    var result = Project.update({id: 123})
    $httpBackend.expectPATCH('http://mywifi.dev:8080/api/v1/projects/123')
    $httpBackend.flush();
  });

  it('should have sent a DELETE request to delete a project', function() {
    var result = Project.destroy({id: 123})
    $httpBackend.expectDELETE('http://mywifi.dev:8080/api/v1/projects/123')
    $httpBackend.flush();
  });


})

describe("Project User Unit Tests", function() {

  beforeEach(module('myApp'));

  var $httpBackend;
  var ProjectUser;
  var email = 'sm@polkaspots.com';

  beforeEach(inject(function($injector, _ProjectUser_) {

    ProjectUser = _ProjectUser_;
    $httpBackend = $injector.get('$httpBackend');

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/projects/123/project_users')
      .respond(200, {});

    $httpBackend.when('PATCH', 'http://mywifi.dev:8080/api/v1/projects/123/project_users/123456')
      .respond(200, {id: 123456, project_id: 123});

    $httpBackend.when('DELETE', 'http://mywifi.dev:8080/api/v1/projects/123/project_users/123456')
      .respond(200, {id: 123456, project_id: 123});

    $httpBackend.whenGET('/translations/en_GB.json').respond("");

   }));

  afterEach(function() {
   $httpBackend.verifyNoOutstandingExpectation();
   $httpBackend.verifyNoOutstandingRequest();
  });

  it('should have sent a GET request to list the project users', function() {
    var result = ProjectUser.get({project_id: 123})
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/projects/123/project_users')
    $httpBackend.flush();
  });

  it('should have sent a PATCH request to update a projects', function() {
    var result = ProjectUser.update({id: 123456, project_id: 123})
    $httpBackend.expectPATCH('http://mywifi.dev:8080/api/v1/projects/123/project_users/123456')
    $httpBackend.flush();
  });

  it('should have sent a DELETE request to delete a project', function() {
    var result = ProjectUser.destroy({id: 123456, project_id: 123})
    $httpBackend.expectDELETE('http://mywifi.dev:8080/api/v1/projects/123/project_users/123456')
    $httpBackend.flush();
  });


})

