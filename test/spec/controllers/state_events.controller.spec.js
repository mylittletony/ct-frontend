'use strict';

describe('Controller: StateEventsCtrl', function () {

  beforeEach(module('myApp'));

  var StateEventsCtrl,
      scope,
      $location,
      $httpBackend,
      deferred,
      q,
      routeParams = {},
      state_eventFactory;

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

    state_eventFactory = {
      query: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
    };

    StateEventsCtrl = $controller('StateEventsCtrl', {
      $scope: scope,
      StateEvent: state_eventFactory,
      $routeParams: routeParams
    });
  }));

  it('should get the state_events ctrl', function () {
    spyOn(state_eventFactory, 'query').andCallThrough()

    expect(scope.loading).toBe(true);

    scope.init();
    deferred.resolve({box_id: 123});
    scope.$apply()
    expect(state_eventFactory.query).toHaveBeenCalled();
  });

});

