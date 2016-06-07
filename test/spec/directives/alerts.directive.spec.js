'use strict';

describe('alerts creation, listing', function () {

  var $scope,
      element,
      deferred,
      q,
      $routeParams,
      location,
      $httpBackend,
      alertFactory;

  beforeEach(module('myApp', function($provide) {
    alertFactory = {
      get: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
    };
    $provide.value("Alert", alertFactory);
  }));

  // beforeEach(module('components/locations/networks/alerts.html'));
  // beforeEach(module('components/alerts/form.html'));
  // beforeEach(module('components/alerts/details.html'));

  describe('alerts creation, listing', function () {

    beforeEach(inject(function($compile, $rootScope, $q, _$routeParams_, $injector) {
      $scope = $rootScope;
      $httpBackend = $injector.get('$httpBackend');
      $httpBackend.whenGET('template/tooltip/tooltip-popup.html').respond("");
      $httpBackend.whenGET('template/pagination/pagination.html').respond("");
      $routeParams = _$routeParams_;
      $routeParams.location_id = 123123123;
      $scope.box = {};
      q = $q;
      $scope.location = { slug: 456, id: 123 }
      element = angular.element('<list-alerts></list-alerts>');
      $compile(element)($rootScope)
      element.scope().$digest();
    }))

    it("should list the alerts for a user", function() {
      spyOn(alertFactory, 'get').andCallThrough();
      expect(element.isolateScope().loading).toBe(true);
      var alert = { alerts: [ { alert_name: 'lobby'} ], _links: {} };
      expect(element.isolateScope().loading).toBe(true)
      deferred.resolve(alert);
      $scope.$digest()
      expect(element.isolateScope().alerts[0].alert_name).toBe(alert.alerts[0].alert_name);
      expect(element.isolateScope()._links).toBe(alert._links);
      expect(element.isolateScope().loading).toBe(undefined);
    })

  })
})
