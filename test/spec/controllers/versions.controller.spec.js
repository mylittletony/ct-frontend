'use strict';

describe('Controller: VersionsCtrl', function () {

  beforeEach(module('myApp'));

  var VersionsCtrl,
      scope,
      $location,
      $httpBackend,
      deferred,
      q,
      routeParams = {},
      versionFactory;

  afterEach(function() {
   $httpBackend.verifyNoOutstandingExpectation();
   $httpBackend.verifyNoOutstandingRequest();
  });

  beforeEach(inject(function (_$httpBackend_, $controller, $rootScope, _$location_, $q) {
    $httpBackend = _$httpBackend_;

    scope = $rootScope.$new();
    $location = _$location_;

    q = $q;
    routeParams.location_id = 'derby-c';
    routeParams.box_id = '123';

    versionFactory = {
      query: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
    };

    VersionsCtrl = $controller('VersionsCtrl', {
      $scope: scope,
      Version: versionFactory,
      $routeParams: routeParams
    });
  }));

  it('should get the versions ctrl', function () {
    spyOn(versionFactory, 'query').andCallThrough()

    expect(scope.loading).toBe(true);

    scope.init();
    deferred.resolve({box_id: 123});
    scope.$apply()
    expect(versionFactory.query).toHaveBeenCalled();
  });

});

describe('Controller: VersionsCtrlLocations', function () {

  beforeEach(module('myApp'));

  var VersionsCtrlLocations,
      scope,
      $location,
      $httpBackend,
      deferred,
      q,
      routeParams = {},
      versionFactory;

  afterEach(function() {
   $httpBackend.verifyNoOutstandingExpectation();
   $httpBackend.verifyNoOutstandingRequest();
  });

  beforeEach(inject(function (_$httpBackend_, $controller, $rootScope, _$location_, $q) {
    $httpBackend = _$httpBackend_;

    scope = $rootScope.$new();
    $location = _$location_;

    q = $q;
    routeParams.location_id = 'derby-c';
    routeParams.box_id = '123';

    versionFactory = {
      query: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
    };

    VersionsCtrlLocations = $controller('VersionsCtrlLocations', {
      $scope: scope,
      Version: versionFactory,
      $routeParams: routeParams
    });
  }));

  it('should get the versions ctrl', function () {
    spyOn(versionFactory, 'query').andCallThrough()

    expect(scope.loading).toBe(true);

    scope.init();
    deferred.resolve({box_id: 123});
    scope.$apply()
    expect(versionFactory.query).toHaveBeenCalled();
  });

});

