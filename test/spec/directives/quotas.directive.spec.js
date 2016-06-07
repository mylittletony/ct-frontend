'use strict';

describe('quotas creation, listing', function () {

  var $scope,
      element,
      deferred,
      q,
      location,
      quotaFactory;

  beforeEach(module('myApp', function($provide) {
    quotaFactory = {
      get: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    };
    $provide.value("Quota", quotaFactory);
  }));

  // beforeEach(module('components/quotas/detail.html'));

  describe('quotas listing', function () {

    beforeEach(inject(function($compile, $rootScope, $q) {
      $scope = $rootScope;
      $scope.box = {};
      q = $q;
      $scope.user = { slug: 456, id: 123 }
      element = angular.element('<quotas slug="{{ user.slug }}"></quotas>');
      $compile(element)($rootScope)
      element.scope().$apply();
    }))

    it("should list the quotas for a user", function() {
      spyOn(quotaFactory, 'get').andCallThrough()
      var quota = { quota_name: 'lobby'}
      deferred.resolve({quota: quota});
      $scope.$apply()
      expect(element.isolateScope().quota).toBe(quota)
    })

  })
})
