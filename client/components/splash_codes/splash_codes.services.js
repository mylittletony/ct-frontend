'use strict';

var app = angular.module('myApp.splash_codes.services', ['ngResource',]);

app.factory('SplashCode', ['$resource', '$localStorage', 'API_END_POINT',
  function($resource, $localStorage, API_END_POINT){
    return $resource(API_END_POINT + '/locations/:location_id/splash_codes/:id/:action',
      {
        q: '@q',
        location_id: '@location_id',
        id: '@id',
        copy_to: '@copy_to'
      },
      {
      get: {
        method: 'GET',
        isArray: false,
        dataType: 'json',
        params: {
          location_id: '@location_id'
        }
      },
      query: {
        method: 'GET',
        isArray: false,
        dataType: 'json',
        params: {
          q: '@q',
          id: '@id',
          location_id: '@location_id'
        }
      },
      update: {
        method: 'PATCH',
        isArray: false,
        params: {
          id: '@id',
          location_id: '@location_id'
        }
      },
      destroy: {
        method: 'DELETE',
        isArray: false,
        params: {
          id: '@id',
          location_id: '@location_id'
        }
      },
      create: {
        method: 'POST',
        isArray: false,
        params: {
          location_id: '@location_id'
        }
      }
    });
  }]);

