'use strict';

describe('speedtests creation', function () {

  var $scope,
      element,
      deferred,
      q,
      location,
      speedFactory;

  beforeEach(module('myApp', function($provide) {
    speedFactory = {
      create: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    };
    $provide.value("Speedtest", speedFactory);

  }));

  beforeEach(inject(function($compile, $rootScope, $q, $location) {
    $scope = $rootScope;
    q = $q;
    location = $location;
  }))

  describe("Speedtest creation", function() {

    beforeEach(inject(function($compile, $rootScope, $q) {
      $scope.box = {
        speedtest_running: false
      };
      element = angular.element('<div box="box" box-create-speedtest><p>RS</p></div>');
      $compile(element)($rootScope)
    }))

    it("should successfully create a speedtest for a box", function() {
      spyOn(speedFactory, 'create').andCallThrough()
      expect($scope.box.speedtest_running).toBe(false)
      element.find('p').click();
      expect($scope.box.speedtest_running).toBe(true)
      deferred.resolve({slug: 123, is_monitored: true});
      $scope.$apply()
      expect(speedFactory.create).toHaveBeenCalled();
    })

    it("should not create a speedtest for a box", function() {
      spyOn(speedFactory, 'create').andCallThrough()
      expect($scope.box.speedtest_running).toBe(false)
      element.find('p').click();
      expect($scope.box.speedtest_running).toBe(true)
      deferred.reject({data: {errors: { base: [123]}}});
      $scope.$apply()
      expect(speedFactory.create).toHaveBeenCalled();
      expect($scope.box.speedtest_running).toBe(undefined)
      expect($scope.box.errors[0]).toBe(123)
    })

    it("should add the right content to the page", function() {
      expect(element.html()).toBe('<p class="ng-scope">RS</p>');
    });

  })
})
