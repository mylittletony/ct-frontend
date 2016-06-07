'use strict';

describe('versions revert', function () {

  var $scope,
      element,
      deferred,
      q,
      location,
      versionFactory;

  beforeEach(module('myApp', function($provide) {
    versionFactory = {
      revert: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    };
    $provide.value("Version", versionFactory);

  }));

  beforeEach(inject(function($compile, $rootScope, $q) {
    $scope = $rootScope;
    $scope.box = {};
    q = $q;
    $scope.version = { id: 123 }
    $scope.versions = [{ id: 123 }]
    element = angular.element('<div class="btn btn-danger" model="box" versions="versions" version="version" index="$index" revert-box><p>Rollback</p></div>');
    $compile(element)($rootScope)
  }))

  it("should successfully revert a box", function() {
    spyOn(versionFactory, 'revert').andCallThrough()
    spyOn(window, 'confirm').andReturn(true);
    element.find('p').click();
    expect($scope.box.state).toBe('reverting')
    deferred.resolve({slug: 123, is_monitored: true});
    $scope.$apply()
    expect(versionFactory.revert).toHaveBeenCalled();
    expect($scope.box.state).toBe('reverted')
    expect($scope.versions.length).toBe(0)
  })

  it("should not revert a box", function() {
    spyOn(versionFactory, 'revert').andCallThrough()
    spyOn(window, 'confirm').andReturn(true);
    element.find('p').click();
    expect($scope.box.state).toBe('reverting')
    deferred.reject({data: { response: 123}});
    $scope.$apply()
    expect(versionFactory.revert).toHaveBeenCalled();
    expect($scope.box.errors).toBe(123)
    expect($scope.box.state).toBe(undefined)
    expect($scope.versions.length).toBe(1)
  })

  it("should cancel the revert a box", function() {
    spyOn(window, 'confirm').andReturn(false);
    element.find('p').click();
    expect($scope.box.state).toBe(undefined)
    expect($scope.versions.length).toBe(1)
  })

})
