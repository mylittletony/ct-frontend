'use strict';

describe('lists location socials', function () {

  var $scope;
  var element;
  var $location;
  var socialFactory;
  var locationFactory;
  var splashFactory;
  var q;
  var deferred;
  var $httpBackend;

  beforeEach(module('myApp', function($provide) {
    socialFactory = {
      query: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      get: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      update: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
    };
    $provide.value("Social", socialFactory);
  }));

  beforeEach(module('components/reports/social/_show.html'));

  describe('new social tests', function() {
    beforeEach(inject(function($compile, $rootScope, $q, _$location_, $injector) {
      $httpBackend = $injector.get('$httpBackend');
      $httpBackend.whenGET('template/pagination/pagination.html').respond("");
      $scope = $rootScope;
      $location = _$location_;
      q = $q;
      $scope.voucher = {
        unique_id: 123
      };
      element = angular.element('<analytics><list-social></list-social></analytics>');
      $compile(element)($rootScope)
      element.scope().$apply();
    }));

    // Arg, the bloody require directive //
    xit("should display the voucher socials", function() {
      spyOn(socialFactory, 'get').andCallThrough()
      expect(element.isolateScope().loading).toBe(true)

      var socials = {social: [{ username: 'simons' }] }
      deferred.resolve(socials);
      $scope.$apply()

      expect(element.isolateScope().socials[0]).toBe(socials.social[0]);
      expect(element.isolateScope().loading).toBe(undefined)
    });

  });

  describe('new social show', function() {
    beforeEach(inject(function($compile, $rootScope, $q, _$location_, $injector) {
      $scope = $rootScope;
      $location = _$location_;
      q = $q;
      $scope.voucher = {
        unique_id: 123
      }
      $scope.social = {}
      element = angular.element('<show-social></show-social>');
      $compile(element)($rootScope)
      element.scope().$apply();
    }));

    it("should display the socials details", function() {
      spyOn(socialFactory, 'query').andCallThrough()
      expect(element.isolateScope().loading).toBe(true)

      var social = { social: { username: 'simons' }, clients: [{ man: 123 }]}
      deferred.resolve(social);
      $scope.$apply()

      expect(element.isolateScope().social).toBe(social.social);
      expect(element.isolateScope().clients).toBe(social.clients);
      expect(element.isolateScope().loading).toBe(undefined)
    });

    it("should update the socials details", function() {
      spyOn(socialFactory, 'update').andCallThrough()
      element.isolateScope().social = { state: 'xxx' };
      element.isolateScope().update()
      expect(element.isolateScope().social.state).toBe('updating')
      var social = { social: { username: 'simons' }, client: { man: 123 } }
      deferred.resolve(social);
      $scope.$apply()
      expect(element.isolateScope().social.state).toBe('updated')
    });

    it("should not update the socials details", function() {
      spyOn(socialFactory, 'update').andCallThrough()
      element.isolateScope().social = { state: 'xxx' };
      element.isolateScope().update()
      expect(element.isolateScope().social.state).toBe('updating')
      var social = { social: { username: 'simons' }, client: { man: 123 } }
      deferred.reject(social);
      $scope.$apply()
      expect(element.isolateScope().social.state).toBe(undefined)
      expect(element.isolateScope().social.errors).toBe('There was a problem updating this user.')
    });


  });

});

