'use strict';

var app = angular.module('myApp.boxes.services', ['ngResource',]);

app.factory('Box', ['$resource', 'API_END_POINT',
  function($resource, API_END_POINT){
    return $resource(API_END_POINT + '/boxes/:id/:action',
      {
        q: '@q',
        id: '@id',
        action: '@action'
      },
      {
      geodata: {
        method: 'GET',
        isArray: true,
        dataType: 'json',
        params: {
          q: '@q',
          geodata: 'true'
        }
      },
      get: {
        method: 'GET',
        isArray: false,
        dataType: 'json',
        params: {
          q: '@q',
          location_id: '@location_id'
        }
      },
      save: {
        method: 'POST',
        isArray: false,
        dataType: 'json'
      },
      query: {
        method: 'GET',
        isArray: false,
        dataType: 'json',
        params: {
          q: '@q',
          machine_type: '@machine_type'
        }
      },
      status: {
        method: 'GET',
        isArray: false,
        params: {
          id: '@id',
          action: 'status'
        }
      },
      update: {
        method: 'PATCH',
        isArray: false
      },
      destroy: {
        method: 'DELETE',
        params: {
        }
      },
      payload: {
        method: 'POST',
        isArray: false,
        dataType: 'json',
        params: {
          q: '@q',
          payload_id: '@payload_id',
          box_ids: '@box_ids',
          action: 'payloads'
        }
      },
      speedtests: {
        method: 'GET',
        isArray: true,
        dataType: 'json',
        params: {
          q: '@q',
          id: '@id',
          action: 'speedtests'
        }
      },
      create_speedtests: {
        method: 'POST',
        isArray: false,
        dataType: 'json',
        params: {
          q: '@q',
          id: '@id',
          action: 'speedtests'
        }
      },
      detect: {
        method: 'POST',
        isArray: true,
        dataType: 'json',
        params: {
          action: 'detect'
        }
      }
    });
  }]);
