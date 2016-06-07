'use strict';

describe('Controller: MainCtrl', function () {

  beforeEach(module('myApp'));

  var ZonesCtrl,
      ZonesCtrlShow,
      locationFactory,
      zoneFactory,
      scope,
      $location,
      $httpBackend,
      deferred,
      q,
      store = {};


  beforeEach(module('myApp', function($provide) {
    locationFactory = {
      get: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    },
    zoneFactory = {
      update: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      get: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      query: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      destroy: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    }
    $provide.value("Location", locationFactory);
    $provide.value("Zone", zoneFactory);
  }));

  // describe('Controller: MainCtrl', function () {

  //   beforeEach(inject(function (_$httpBackend_, $controller, $rootScope, _$location_, $q) {
  //     $httpBackend = _$httpBackend_;
  //     q = $q;
  //     scope = $rootScope.$new();
  //     $location = _$location_;

  //     ZonesCtrl = $controller('ZonesCtrl', {
  //       $scope: scope,
  //     });
  //   }));

  //   it('should get the location and all the zones, why not', function () {
  //     spyOn(locationFactory, 'get').andCallThrough();
  //     spyOn(zoneFactory, 'get').andCallThrough();
  //     expect(scope.loading).toBe(true);
  //     var location = { location_name: "simon"}
  //     var zone = { zone_name: 'Lobby' }
  //     deferred.resolve(location)
  //     scope.$apply()
  //     expect(scope.location).toBe(location)
  //     deferred.resolve([zone])
  //     scope.$apply()
  //     expect(scope.zones[0]).toBe(zone)
  //     expect(scope.loading).toBe(undefined)
  //   });
  // });

  describe('Controller: ShowCtrl', function () {

    beforeEach(inject(function (_$httpBackend_, $controller, $rootScope, _$location_, $q, $routeParams) {
      $httpBackend = _$httpBackend_;
      var routeParams = {};
      routeParams = $routeParams
      routeParams.location_id = 123
      q = $q;
      scope = $rootScope.$new();
      $location = _$location_;
      ZonesCtrlShow = $controller('ZonesCtrlShow', {
        $scope: scope,
      });
    }));

    // it('should delete a zone', function () {
    //   var zone = { unique_id: 123 }
    //   spyOn(zoneFactory, 'destroy').andCallThrough();
    //   spyOn(window, 'confirm').andReturn(true);
    //   scope.deleteZone(zone.unique_id)
    //   deferred.resolve(location)
    //   scope.$apply()
    //   expect(zoneFactory.destroy).toHaveBeenCalled();
    //   expect($location.path()).toBe('/locations/123/zones')
    //   expect(scope.notifications).toBe('Zone Deleted Successfully')
    // });

    // it('should cancel delete a zone', function () {
    //   var zone = { unique_id: 123 }
    //   spyOn(zoneFactory, 'destroy').andCallThrough();
    //   spyOn(window, 'confirm').andReturn(false);
    //   scope.deleteZone(zone.unique_id)
    //   deferred.resolve(location)
    //   scope.$apply()
    //   expect(zoneFactory.destroy).not.toHaveBeenCalled();
    // });

  });

});

