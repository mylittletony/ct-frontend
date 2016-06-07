'use strict';

describe('Controller: MainCtrl', function () {

  beforeEach(module('myApp'));

  var UsersShowController,
      scope,
      $location,
      Auth,
      q,
      userFactory,
      deferred,
      $httpBackend,
      store = {};


  beforeEach(module('components/locations/index/index.html'));
  beforeEach(module('components/home/hello.html'));

  beforeEach(inject(function (_$httpBackend_, $controller, $rootScope, _$location_, _Auth_, $q) {
    $httpBackend = _$httpBackend_;

    scope = $rootScope.$new();
    $location = _$location_;
    q = $q;

    userFactory = {
      query: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      update: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
    };

    Auth = _Auth_;
    var user = { pss: true, username: 'Simon-Morley', slug: 1, authToken: 1123, role_id: 4 };
    Auth.saveUser(user);
    // var currUser = Auth.currentUser();

    UsersShowController = $controller('UsersShowController', {
      $scope: scope,
      User: userFactory
    });
  }));

  it('should load the users account', function () {
    var user = { slug: 123 }
    spyOn(userFactory, 'query').andCallThrough()
    scope.init()
    deferred.resolve(user);
    scope.$apply()
    expect(scope.user).toBe(user);
  });

  it('should create the currency hash', function () {
    var user = { slug: 123 }
    spyOn(userFactory, 'query').andCallThrough()
    var currencies = JSON.stringify({ 'US Dollars' : 'USD', 'UK Pounds': 'GBP' });
    expect(JSON.stringify(scope.currencies)).toBe(currencies);
  });

  it('should update a users account', function () {
    var user = { slug: 123 }
    spyOn(userFactory, 'query').andCallThrough()
    spyOn(userFactory, 'update').andCallThrough()
    scope.init()
    deferred.resolve(user);
    scope.$apply()
    expect(scope.user).toBe(user);

    // Set some vars to check if they clear //
    scope.user.updating = true;
    scope.errors = true;
    scope.changeCard = true;

    scope.update(user)
    scope.$apply()
    expect(scope.user.updating).toBe(true);

    deferred.resolve(user);
    scope.$apply()
    expect(scope.user.updating).toBe(undefined);
    expect(scope.errors).toBe(undefined);
    expect(scope.changeCard).toBe(undefined);
    expect(scope.success).toBe(true);

  });

  it('should NOT update a users account', function () {
    var user = { slug: 123 }
    spyOn(userFactory, 'query').andCallThrough()
    spyOn(userFactory, 'update').andCallThrough()
    scope.init()
    deferred.resolve(user);
    scope.$apply()
    expect(scope.user).toBe(user);

    // Set some vars to check if they clear //
    scope.user.updating = true;
    scope.errors = true;
    scope.changeCard = true;

    scope.update(user)
    scope.$apply()
    expect(scope.user.updating).toBe(true);

    deferred.reject({data: {message: [ { a: 123 }]  }});
    scope.$apply()
    expect(scope.user.updating).toBe(undefined);
    // expect(scope.errors).toBe(123);
    expect(scope.changeCard).toBe(undefined);
    expect(scope.success).toBe(undefined);

  });

});

describe('Controller: UserIntegrationsController', function () {

  beforeEach(module('myApp'));

  var UsersIntegrationsController,
      scope,
      $location,
      Auth,
      q,
      userFactory,
      integrationFactory,
      deferred,
      $httpBackend,
      store = {},
      routeParams = {};

  beforeEach(inject(function (_$httpBackend_, $controller, $rootScope, _$location_, _Auth_, $q) {
    $httpBackend = _$httpBackend_;

    scope = $rootScope.$new();
    $location = _$location_;
    q = $q;

    integrationFactory = {
      create: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
    };

    userFactory = {
      query: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      update: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
    };

    Auth = _Auth_;
    var user = { pss: true, username: 'Simon-Morley', slug: 1, authToken: 1123, role_id: 4 };
    Auth.saveUser(user);
    // var currUser = Auth.currentUser();

  }));

  describe('Passing integrations', function () {

    beforeEach(inject(function (_$httpBackend_, $controller, $rootScope, _$location_, _Auth_, $q) {
      $httpBackend = _$httpBackend_;

      routeParams.code = "123"
      routeParams.id = "slacker"

      UsersIntegrationsController = $controller('UsersIntegrationsController', {
        $scope: scope,
        User: userFactory,
        Integration: integrationFactory,
        $routeParams: routeParams
      });

    }));

    it('should load the integrations path with a code and post to CT, redirecting to the users path', function () {
      var user = { slug: 123 }
      deferred.resolve(user);
      scope.$apply()

      expect($location.path()).toBe('/users/1/integrations')
      expect($location.search().success).toBe(true)
      expect($location.search().type).toBe('slack')
    });

    it('should load the integrations path with a code and post to CT, redirecting to the users path = FAILED 422 from CT', function () {
      var user = { slug: 123 }
      deferred.reject(user);
      scope.$apply()

      expect($location.path()).toBe('/users/1/integrations')
      expect($location.search().success).toBe(false)
      expect($location.search().type).toBe('slack')
    });

  })

  describe('Access denied integrations', function () {

    beforeEach(inject(function (_$httpBackend_, $controller, $rootScope, _$location_, _Auth_, $q) {
      $httpBackend = _$httpBackend_;

      routeParams.code = "123"
      routeParams.id = "slacker"
      routeParams.error = true

      UsersIntegrationsController = $controller('UsersIntegrationsController', {
        $scope: scope,
        User: userFactory,
        Integration: integrationFactory,
        $routeParams: routeParams
      });

    }));

    it('should load the integrations and fail - access denied', function () {
      expect($location.path()).toBe('/users/1/integrations')
      expect($location.search().success).toBe(false)
      expect($location.search().error).toBe(true)
    });

  })

  describe('no node', function () {

    beforeEach(inject(function (_$httpBackend_, $controller, $rootScope, _$location_, _Auth_, $q) {
      $httpBackend = _$httpBackend_;

      routeParams.id = "slacker"
      routeParams.error = true

      UsersIntegrationsController = $controller('UsersIntegrationsController', {
        $scope: scope,
        User: userFactory,
        Integration: integrationFactory,
        $routeParams: routeParams
      });

    }));

    it('should load the integrations and fail - access denied', function () {
      expect($location.path()).toBe('/users/1/integrations')
      expect($location.search().success).toBe(false)
    });

  })

  describe('not slack', function () {

    beforeEach(inject(function (_$httpBackend_, $controller, $rootScope, _$location_, _Auth_, $q) {
      $httpBackend = _$httpBackend_;

      routeParams.code = "123"
      routeParams.id = "123"
      routeParams.error = true

      UsersIntegrationsController = $controller('UsersIntegrationsController', {
        $scope: scope,
        User: userFactory,
        Integration: integrationFactory,
        $routeParams: routeParams
      });

    }));

    it('should load the integrations and fail - access denied', function () {
      expect($location.path()).toBe('/users/1/integrations')
      expect($location.search().success).toBe(false)
    });

  })

})
