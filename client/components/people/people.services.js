'use strict';

var app = angular.module('myApp.people.services', ['ngResource',]);

app.factory('People', ['$resource', '$localStorage', 'API_END_POINT',
  function($resource, $localStorage, API_END_POINT){
    return $resource(API_END_POINT + '/locations/:location_id/people/:id',
      {
        q: '@q',
        location_id: '@location_id',
        id: '@id'
      },
      {
      get: {
        method: 'GET',
        // isArray: true,
        dataType: 'json',
        params: {
          q: '@q',
          location_id: '@location_id',
        }
      },
      query: {
        method: 'GET',
        isArray: false,
        dataType: 'json',
        params: {
          q: '@q',
        }
      },
      update: {
        method: 'PATCH',
        isArray: false
      },
      destroy: {
        method: 'DELETE',
        isArray: false,
        params: {
          location_id: '@location_id',
        }
      }
    });
  }]);
