'use strict';

describe('Controller: PayloadsController', function () {

  beforeEach(module('myApp'));

  var PayloadsController,
      scope,
      $location,
      $httpBackend,
      deferred,
      q,
      routeParams = {},
      boxFactory,
      payloadFactory;

  afterEach(function() {
   $httpBackend.verifyNoOutstandingExpectation();
   $httpBackend.verifyNoOutstandingRequest();
  });

  beforeEach(inject(function (_$httpBackend_, $controller, $rootScope, _$location_, $q) {
    $httpBackend = _$httpBackend_;

    scope = $rootScope.$new();
    $location = _$location_;

    q = $q;
    routeParams.box_id = '123';

    payloadFactory = {
      query: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
    };

    boxFactory = {
      get: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
    };

    PayloadsController = $controller('PayloadsController', {
      $scope: scope,
      Box: boxFactory,
      Payload: payloadFactory,
      $routeParams: routeParams
    });
  }));

  it('should get the payloads ctrl', function () {
    spyOn(payloadFactory, 'query').andCallThrough()
    spyOn(boxFactory, 'get').andCallThrough()

    expect(scope.loading).toBe(true);

    scope.init();
    deferred.resolve({box_id: 123});
    scope.$apply()
    expect(payloadFactory.query).toHaveBeenCalled();
  });

});

