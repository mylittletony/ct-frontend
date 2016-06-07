'use strict';

describe('Controller: JobsCtrl', function () {

  beforeEach(module('myApp'));

  var JobsCtrl,
      scope,
      $location,
      $httpBackend,
      deferred,
      q,
      routeParams = {},
      jobFactory;

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

    jobFactory = {
      query: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
    };

    JobsCtrl = $controller('JobsCtrl', {
      $scope: scope,
      Job: jobFactory,
      $routeParams: routeParams
    });
  }));

  it('should get the jobs ctrl', function () {
    spyOn(jobFactory, 'query').andCallThrough()

    expect(scope.loading).toBe(true);

    scope.init();
    deferred.resolve({box_id: 123});
    scope.$apply()
    expect(jobFactory.query).toHaveBeenCalled();
  });

});

