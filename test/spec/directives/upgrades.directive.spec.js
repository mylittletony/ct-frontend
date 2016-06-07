'use strict';

describe('upgrades directives', function () {

  var $scope,
      element,
      deferred,
      q,
      routeParams,
      upgradeFactory;

  beforeEach(module('myApp', function($provide) {
    upgradeFactory = {
      get: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      token_update: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      token_destroy: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      update: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      destroy: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    };
    $provide.value("Upgrade", upgradeFactory);
  }));

  // beforeEach(module('components/locations/networks/zones.html'));

  describe('fetching the token from ct', function () {

    beforeEach(inject(function($compile, $rootScope, $q, $routeParams) {
      $scope = $rootScope;
      routeParams = $routeParams;
      routeParams.token = 123;
      q = $q;
      element = angular.element('<fetch-token-upgrade><fetch-token-upgrade>');
      $compile(element)($rootScope);
      element.scope().$digest();
    }));

    it("should query ct with the token and return ok, rendering the next template", function() {
      spyOn(upgradeFactory, 'get').andCallThrough();
      expect($scope.loading).toBe(true);
      var res = { ap_mac: 123, description: 456, scheduled: 111 };
      deferred.resolve(res);
      $scope.$digest();
      expect($scope.loading).toBe(undefined);
      expect(element.scope().ap_mac).toBe(123);
      expect(element.scope().description).toBe(456);
      expect(element.scope().scheduled).toBe(111);
    });

    it("should query ct with the token and return not true", function() {
      spyOn(upgradeFactory, 'get').andCallThrough()
      expect($scope.loading).toBe(true);
      deferred.reject();
      $scope.$digest()
      expect($scope.loading).toBe(undefined);
      // expect(element.html()).toBe('<div class="ng-scope">Oh</div>');
    });

  })

  describe('cancelling and rescheduling an event from non-logged in page', function () {

    beforeEach(inject(function($compile, $rootScope, $q, $routeParams) {
      $scope = $rootScope;
      routeParams = $routeParams;
      routeParams.token = 123;
      q = $q;
      element = angular.element('<edit-upgrade token="123456"><edit-upgrade>');
      $compile(element)($rootScope);
      element.scope().$digest();
    }));

    it("should reschedule an event", function() {
      spyOn(upgradeFactory, 'token_update').andCallThrough();
      $scope.$digest();
      // expect(element.find('#update-upgrade').hasClass('ng-hide')).toBe(true);

      var result = {message: 123};
      var cont = element.find('input').controller('ngModel');

      cont.$setViewValue('today at 1pm');
      $scope.$digest();
      expect(element.find('#update-upgrade').hasClass('ng-hide')).toBe(false);

      element.find('#update-upgrade').click();

      deferred.resolve(result);
      $scope.$digest()
      expect(element.find('.update-delete').hasClass('ng-hide')).toBe(true);
    });

    it("should delete an event", function() {
      spyOn(upgradeFactory, 'token_destroy').andCallThrough();
      $scope.$digest();

      element.find('#delete-upgrade').click();
      deferred.resolve();
      $scope.$digest()

      expect(element.find('.update-delete').hasClass('ng-hide')).toBe(true);
    });
  });

  describe('cancelling and rescheduling an event from Logged in page', function () {

    beforeEach(inject(function($compile, $rootScope, $q, $routeParams) {
      $scope = $rootScope;
      routeParams = $routeParams;
      routeParams.token = 123;
      $scope.box = {};
      $scope.box.upgrade_scheduled = { when: 1421615944 };
      q = $q;
      element = angular.element('<edit-upgrade-box slug="{{box.slug}}" upgrade="box.upgrade_scheduled" scheduled="box.upgrade_scheduled"><edit-upgrade-box>');
      $compile(element)($rootScope);
      element.scope().$digest();
    }));

    it("should reschedule an event", function() {
      spyOn(upgradeFactory, 'update').andCallThrough();
      $scope.$digest();
      // expect(element.find('#update-upgrade').hasClass('ng-hide')).toBe(true);

      var result = {message: 1421615944};
      var cont = element.find('input').controller('ngModel');

      cont.$setViewValue('today at 1pm');
      $scope.$digest();
      expect(element.find('#update-upgrade').hasClass('ng-hide')).toBe(false);

      element.find('#update-upgrade').click();

      deferred.resolve(result);
      $scope.$digest()
      expect(element.find('.update-delete').hasClass('ng-hide')).toBe(true);
      expect($scope.box.upgrade_scheduled.when).toBe(1421615944)
    });

    it("should not reschedule an event", function() {
      spyOn(upgradeFactory, 'update').andCallThrough();
      $scope.$digest();
      // expect(element.find('#update-upgrade').hasClass('ng-hide')).toBe(true);

      var result = {data: {message: 123}};
      var cont = element.find('input').controller('ngModel');

      cont.$setViewValue('today at 1pm');
      $scope.$digest();
      expect(element.find('#update-upgrade').hasClass('ng-hide')).toBe(false);

      element.find('#update-upgrade').click();

      deferred.reject(result);
      $scope.$digest()
      expect($scope.box.upgrade_scheduled.when).toBe(1421615944)
    });

    it("should delete an event", function() {
      spyOn(upgradeFactory, 'destroy').andCallThrough();
      $scope.$digest();

      element.find('#delete-upgrade').click();
      deferred.resolve();
      $scope.$digest()

      expect(element.find('.update-delete').hasClass('ng-hide')).toBe(true);

      expect($scope.box.upgrade_scheduled).toBe(undefined);
    });

  });
});
