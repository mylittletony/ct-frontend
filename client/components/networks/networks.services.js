'use strict';

var app = angular.module('myApp.networks.services', ['ngResource',]);

app.factory('Network', ['$resource', '$localStorage', 'API_END_POINT',
  function($resource, $localStorage, API_END_POINT){
    return $resource(API_END_POINT + '/locations/:location_id/networks/:id/:action',
      {
        q: '@q',
        location_id: '@location_id',
        id: '@id',
        splash: '@splash'
      },
      {
      get: {
        method: 'GET',
        isArray: true,
        dataType: 'json',
        params: {
          q: '@q',
          location_id: '@location_id',
          splash: '@splash',
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
      create: {
        method: 'POST',
        isArray: false,
        params: {
          location_id: '@location_id',
          network: '@network',
        }
      },
      destroy: {
        method: 'DELETE',
        isArray: false,
        params: {
          location_id: '@location_id',
        }
      },
      reset: {
        method: 'POST',
        isArray: false,
        params: {
          location_id: '@location_id',
          id: 'reset',
        }
      },
      radtest: {
        method: 'POST',
        isArray: false,
        params: {
          id: '@id',
          action: 'radtest'
        }
      }
    });
  }]);

