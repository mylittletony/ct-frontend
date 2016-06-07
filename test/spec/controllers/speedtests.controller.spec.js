'use strict';

describe('Controller: SpeedtestsCtrl', function () {

  beforeEach(module('myApp'));

  var SpeedtestsCtrl,
      scope,
      $location,
      $httpBackend,
      deferred,
      q,
      routeParams = {},
      sFactory;

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

    sFactory = {
      get: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
    };

    SpeedtestsCtrl = $controller('SpeedtestsCtrl', {
      $scope: scope,
      Speedtest: sFactory,
      $routeParams: routeParams
    });
  }));

  it('should get the speedtests ctrl', function () {
    spyOn(sFactory, 'get').andCallThrough()

    expect(scope.loading).toBe(true);

    expect(scope.box.slug).toBe('123')
    expect(scope.location_name).toBe('derby-c')

    scope.init();
    deferred.resolve({box_id: 123});
    scope.$apply()
    expect(sFactory.get).toHaveBeenCalled();
    // expect(scope.box.connected_clients.length).toBe(1);
    // expect(scope.loading).toBe(false);
  });

});

