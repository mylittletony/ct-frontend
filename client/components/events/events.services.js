'use strict';

var app = angular.module('myApp.events.services', ['ngResource']);

app.factory('Event', ['$resource', '$localStorage', 'API_END_POINT',
  function($resource, $localStorage, API_END_POINT){
    return $resource(API_END_POINT + '/events/:id',
      {
        id: '@id'
      },
      {
      query: {
        method:'GET',
        isArray: false,
        params: {
          id: '@id',
          location_id: '@location_id'
        }
      },
      get: {
        method:'GET',
        isArray: false,
        params: {
        }
      }
    });
  }]);

