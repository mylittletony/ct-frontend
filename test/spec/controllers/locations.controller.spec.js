'use strict';

describe('Controller: LocationsCtrlShort', function () {

  beforeEach(module('myApp'));

  var LocationsCtrlShort,
      scope,
      $location,
      $httpBackend,
      pristine,
      deferred,
      fakeFactory,
      q;

  beforeEach(function () {

  });

  beforeEach(inject(function ($controller, $rootScope, $q) {

    scope = $rootScope.$new();
    q = $q;

    fakeFactory = {
      shortquery: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    };

    spyOn(fakeFactory, 'shortquery').andCallThrough()

    LocationsCtrlShort = $controller('LocationsCtrlShort', {
      $scope: scope,
      Location: fakeFactory,
    });

  }));

  it("should search for a location on CT", function() {
    scope.getLocation()
    var response = {location_name: 'simon-home', unique_id: 123}
    deferred.resolve([response]);
    scope.$apply()
    expect(fakeFactory.shortquery).toHaveBeenCalled();
    expect(scope.locations[0].location_name).toBe('simon-home');
  });

  it("should set the data and selected location to item", function() {
    var item = { location: 123 }
    scope.data = {};
    scope.selectLocation(item);
    expect(scope.selected.item).toBe(item)
  });


})

describe('Controller: LocationsCtrlGet', function () {

  var LocationsCtrlGet,
      scope,
      locationFactory,
      boxFactory,
      $window,
      $httpBackend,
      deferred,
      fakeFactory,
      q;

  var routeParams = {};

  beforeEach(module('myApp', function($provide) {
    locationFactory = {
      get: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    },
    boxFactory = {
      update: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    }
    $provide.value("Location", locationFactory);
    $provide.value("Box", boxFactory);
  }));


  beforeEach(module('components/locations/show/new-location.html'));

  beforeEach(inject(function (_$httpBackend_, $controller, $rootScope, _$location_, $q) {

    var client = jasmine.createSpy();
    $httpBackend = _$httpBackend_;

    scope = $rootScope.$new();
    routeParams.id = 123;
    q = $q;

    LocationsCtrlGet = $controller('LocationsCtrlGet', {
      $scope: scope,
      $routeParams: routeParams
    });

  }));

  xit("should set the correct scope vals", function() {
    expect(scope.invalidNotification).toBe (false);
    expect(scope.notifications ).toBe (false);
    expect(scope.loading).toBe (true);
    expect(scope.location_header).toBe (undefined);
  })

  xit("should have called the locations#get method", function() {
    deferred.resolve({attr_generated: false, slug: 123})
    scope.$apply()
    expect(scope.loading).toBe (false);
    expect(scope.location_header).toBe (true);
  })

})

