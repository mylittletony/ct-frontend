'use strict';

var app = angular.module('myApp.clients.services', ['ngResource',]);

// Used by client clients show directive to control when the charts load, yeah //
app.factory('ClientDetails', [function() {
  return { client: {} };
}]);

app.factory('Client', ['$resource', 'API_END_POINT',
  function($resource, API_END_POINT){
    return $resource(API_END_POINT + '/locations/:location_id/clients/:id/:action/:action_id',
      {
        location_id: '@location_id'
      },
      {
      query: {
        method:'GET',
        isArray: false,
        params: {
          location_id: '@location_id',
          interval: '@interval',
          distance: '@distance',
          start: '@start',
          end: '@end',
        }
      },
      get: {
        method:'GET',
        isArray: false,
        params: {
          location_id: '@location_id',
          q: '@q',
          id: '@id'
        }
      },
      codes: {
        method:'GET',
        isArray: false,
        params: {
          location_id: '@location_id',
          id: '@id',
          action: 'codes'
        }
      },
      update_code: {
        method:'PATCH',
        isArray: false,
        params: {
          location_id: '@location_id',
          id: '@id',
          action_id: '@id',
          code: '@code',
          action: 'codes',
        }
      },
      update: {
        method:'PATCH',
        isArray: false,
        params: {
          location_id: '@location_id',
          id: '@id',
          logout: '@logout',
          client: '@client'
        }
      },
      logout: {
        method:'POST',
        isArray: false,
        params: {
          location_id: '@location_id',
          id: '@id',
          logout: '@logout',
          client: '@client',
          action: 'logout'
        }
      },
      create: {
        method:'POST',
        isArray: false,
        params: {
          location_id: '@location_id',
          client: '@client',
        }
      }
    });
  }]);

