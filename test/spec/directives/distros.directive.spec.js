'use strict';

describe('zones creation, listing', function () {

  var $scope,
      element,
      deferred,
      q,
      $routeParams,
      location,
      referralFactory,
      $httpBackend,
      distroFactory;

  beforeEach(module('myApp', function($provide) {
    distroFactory = {
      get: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    };
    referralFactory = {
      get: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    };
    $provide.value("Referral", referralFactory);
    $provide.value("Distributor", distroFactory);
  }));

  // beforeEach(module('components/locations/networks/zones.html'));
  // beforeEach(module('components/zones/form.html'));
  // beforeEach(module('components/zones/details.html'));

  describe('referrals listing', function () {

    beforeEach(inject(function($compile, $rootScope, $q, _$routeParams_, $injector) {
      $scope = $rootScope;
      // $httpBackend = $injector.get('$httpBackend');
      // $httpBackend.whenGET('template/tooltip/tooltip-popup.html').respond("");
      // $routeParams = _$routeParams_;
      // $routeParams.location_id = 123123123;
      // $scope.box = {};
      q = $q;
      // $scope.location = { slug: 456, id: 123 }
      element = angular.element('<list-referrals></list-referrals>');
      $compile(element)($rootScope)
      element.scope().$digest();
    }))

    it("should list the referrals", function() {
      spyOn(referralFactory, 'get').andCallThrough();
      var r = [ { zone_name: 'lobby'} ];
      expect(element.isolateScope().loading).toBe(true)
      deferred.resolve(r);
      $scope.$digest()
      expect(element.isolateScope().referrals).toBe(r);
      // expect(element.isolateScope()._info).toBe(zone._info);
      expect(element.isolateScope().loading).toBe(undefined);
    })

  })

  describe('distros listing', function () {

    beforeEach(inject(function($compile, $rootScope, $q, _$routeParams_, $injector) {
      $scope = $rootScope;
      q = $q;
      element = angular.element('<distro></distro>');
      $compile(element)($rootScope)
      element.scope().$digest();
    }))

    it("should list the referrals", function() {
      spyOn(distroFactory, 'get').andCallThrough();
      var r = [ { zone_name: 'lobby'} ];
      expect(element.isolateScope().loading).toBe(true)
      deferred.resolve(r);
      $scope.$digest()
      expect(element.isolateScope().distro).toBe(r);
      // expect(element.isolateScope()._info).toBe(zone._info);
      expect(element.isolateScope().loading).toBe(undefined);
    })

  })

})
