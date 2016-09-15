'use strict';

describe('location tests', function () {

  var $scope, element, $routeParams, projectFactory, locationFactory, q, deferred, $httpBackend, $location;

  beforeEach(module('templates'));

  beforeEach(module('myApp', function($provide) {
    projectFactory = {
      get: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
    };
    locationFactory = {
      save: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      query: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      users: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    };
    $provide.value("Location", locationFactory);
    $provide.value("Project", projectFactory);
  }));

  beforeEach(inject(function($injector) {
    $httpBackend = $injector.get('$httpBackend');
    $httpBackend.whenGET('/translations/en_GB.json').respond("");
  }));

  describe('creation of a location', function() {
    beforeEach(inject(function($compile, $rootScope, $q, _$routeParams_, $injector, _$location_) {
      $location = _$location_;
      $scope = $rootScope;
      q = $q;

      $routeParams = _$routeParams_;
      $routeParams.name    = 'cheese balls';
      $routeParams.project = 'cheesy-balls';

      $scope.location = {}
      var elem = angular.element('<new-location-form></new-location-form>');
      element = $compile(elem)($rootScope);
      element.scope().$digest();
    }));

    it("should set up a default location", function() {
      expect(element.isolateScope().loading).toEqual(true);
      expect(element.isolateScope().location.add_to_global_map).toEqual(false);
      expect(element.isolateScope().location.location_name).toEqual('cheese balls');
    });

    it("should fetch the user's projects yeah", function() {
      spyOn(locationFactory, 'users').and.callThrough();
    });

    it("should load the correct projects", function() {
      expect(element.isolateScope().loading).toEqual(true);
      spyOn(projectFactory, 'get').and.callThrough();

      var results = {
        projects:
          [
            {
              project_name: 'cheesy-puffs', id: 1, type: 'ro'
            },
            {
              project_name: 'cheesy-balls', id: 2, type: 'rw'
            }
          ]
      };
      deferred.resolve(results);
      $scope.$digest();

      expect(element.isolateScope().loading).toEqual(undefined);
      expect(element.isolateScope().projects[0].project_name).toEqual('cheesy-balls');
      expect(element.isolateScope().projects.length).toEqual(1);
      expect(element.isolateScope().location.project_id).toEqual(2);
    });

    it("should set the project_id to the only project available", function() {
      expect(element.isolateScope().loading).toEqual(true);
      spyOn(projectFactory, 'get').and.callThrough();

      var results = {
        projects:
          [
            {
              project_name: 'cheesy-sticks', id: 1, type: 'ro'
            },
            {
              project_name: 'cheesy-biscuits', id: 2, type: 'rw'
            }
          ]
      };
      deferred.resolve(results);
      $scope.$digest();

      expect(element.isolateScope().loading).toEqual(undefined);
      expect(element.isolateScope().projects[0].project_name).toEqual('cheesy-biscuits');
      expect(element.isolateScope().projects.length).toEqual(1);
      expect(element.isolateScope().location.project_id).toEqual(2);
    });

    it("should set the project id to the first one if none selected", function() {
      expect(element.isolateScope().loading).toEqual(true);
      spyOn(projectFactory, 'get').and.callThrough();

      var results = {
        projects:
          [
            {
              project_name: 'cheesy-sticks', id: 1, type: 'rw'
            },
            {
              project_name: 'cheesy-biscuits', id: 2, type: 'rw'
            }
          ]
      };
      deferred.resolve(results);
      $scope.$digest();

      expect(element.isolateScope().loading).toEqual(undefined);
      expect(element.isolateScope().projects[0].project_name).toEqual('cheesy-sticks');
      expect(element.isolateScope().projects.length).toEqual(2);
      expect(element.isolateScope().location.project_id).toEqual(1);
    });

  });

  describe('creation of users for a location', function() {
    beforeEach(inject(function($compile, $rootScope, $q, _$routeParams_, $injector) {
      $scope = $rootScope;
      q = $q;

      $routeParams = _$routeParams_;
      $routeParams.page = 10;
      $routeParams.per = 5;

      $scope.location = {}
      $scope.loading = true;
      var elem = angular.element('<location-admins location="location" loading="loading"></location-admins>');
      element = $compile(elem)($rootScope);
      element.scope().$digest();
    }));

    it("should display the users for the brand", function() {
      element.isolateScope().location = {};

      spyOn(locationFactory, 'users').and.callThrough()
      expect(element.isolateScope().users.length).toEqual(0)

      var email = 'foo@bar.com';
      var results = [{ email: email }];
      deferred.resolve(results);
      $scope.$digest();

      expect(element.isolateScope().users[0].email).toBe(email);
      expect(element.isolateScope().allowed).toBe(true);
      expect(element.isolateScope().menu.length).toBe(3);
      expect(element.isolateScope().menu[0].type).toBe('view');
      expect(element.isolateScope().menu[1].type).toBe('edit');
      expect(element.isolateScope().menu[2].type).toBe('revoke');
      expect(element.isolateScope().query.order).toBe('state');
      expect(element.isolateScope().query.limit).toBe(5);
      expect(element.isolateScope().query.page).toBe(10);
      expect(element.isolateScope().loading).toBe(undefined);

      expect(element.isolateScope().roles.length).toBe(4);
      expect(element.isolateScope().roles[0].role_id).toBe(110);
      expect(element.isolateScope().roles[0].name).toBe('Administrator');
      expect(element.isolateScope().roles[1].role_id).toBe(120);
      expect(element.isolateScope().roles[1].name).toBe('Editor');
      expect(element.isolateScope().roles[2].role_id).toBe(130);
      expect(element.isolateScope().roles[2].name).toBe('Supporter');
      expect(element.isolateScope().roles[3].role_id).toBe(140);
      expect(element.isolateScope().roles[3].name).toBe('Observer');
    });

  });

});

