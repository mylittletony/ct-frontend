'use strict';

var app = angular.module('myApp.audit.services', ['ngResource',]);

app.factory('Session', ['$resource', '$localStorage', 'API_END_POINT',
  function($resource, $localStorage, API_END_POINT){
    return $resource(API_END_POINT + '/sessions',
      {
        id: '@id'
      },
      {
      query: {
        method:'GET',
        isArray: false,
        params: {
          box_id: '@box_id',
          location_id: '@location_id',
          id: '@id'
        }
      }
    });
  }]);

