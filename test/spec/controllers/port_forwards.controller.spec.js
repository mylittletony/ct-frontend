'use strict';

describe('Controller: PortForwardsCtrl', function () {

  beforeEach(module('myApp'));

  var PortForwardsCtrl,
      scope,
      $location,
      $httpBackend,
      deferred,
      q,
      routeParams = {},
      portForwardFactory;

  // afterEach(function() {
  //  $httpBackend.verifyNoOutstandingExpectation();
  //  $httpBackend.verifyNoOutstandingRequest();
  // });

  beforeEach(inject(function (_$httpBackend_, $controller, $rootScope, _$location_, $q) {
    $httpBackend = _$httpBackend_;

    scope = $rootScope.$new();
    $location = _$location_;

    q = $q;
    routeParams.box_id = '123';

    portForwardFactory = {
      query: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
    };

    PortForwardsCtrl = $controller('PortForwardsCtrl', {
      $scope: scope,
      PortForward: portForwardFactory,
      $routeParams: routeParams
    });
  }));

  it('should get the port_forwards ctrl and ensure there is at least one pf', function () {
    spyOn(portForwardFactory, 'query').andCallThrough()
    expect(scope.loading).toBe(true);

    scope.init();
    deferred.resolve([]);
    scope.$apply()
    expect(portForwardFactory.query).toHaveBeenCalled();
    expect(scope.loading).toBe(false);

    expect(JSON.stringify(scope.port_forwards)).toBe (JSON.stringify([{source: '', destination_port: '', destination_ip: '', target: '', forward_to_ip: '', forward_to_port: '' }]))

  });

});

