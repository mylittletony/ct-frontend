'use strict';

var app = angular.module('myApp.firmwares.services', ['ngResource',]);

app.factory('Firmware', ['$resource', 'API_END_POINT',
  function($resource, API_END_POINT){
    return $resource(API_END_POINT + '/firmwares',
      {
        location_id: '@location_id'
      },
      {
      query: {
        method:'GET',
        isArray: true
      }
    });
  }]);

