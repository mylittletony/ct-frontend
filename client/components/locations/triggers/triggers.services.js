'use strict';

var app = angular.module('myApp.triggers.services', ['ngResource']);

app.factory('Trigger', ['$resource', '$localStorage', 'API_END_POINT',
  function($resource, $localStorage, API_END_POINT){
    return $resource(API_END_POINT + '/locations/:location_id/triggers/:id',
      {
        id: '@id'
      },
      {
      destroy: {
        method: 'DELETE',
        isArray: true,
        dataType: 'json',
        params: {
          location_id: '@location_id'
        }
      },
      save: {
        method:'POST',
        isArray: false,
        params: {
          location_id: '@location_id'
        }},
      get: {
        method:'GET',
        isArray: false,
        params: {
          location_id: '@location_id',
          id: '@id'
        }
      },
      query: {
        method:'GET',
        isArray: false,
        params: {
          location_id: '@location_id'
        }
      },
      update: {
        method:'PATCH',
        isArray: false,
        params: {
          location_id: '@location_id',
          id: '@id'
        }
      }
    });
  }]);

app.factory('TriggerHistory', ['$resource', '$localStorage', 'API_END_POINT',
  function($resource, $localStorage, API_END_POINT){
    return $resource(API_END_POINT + '/locations/:location_id/triggers/:trigger_id/trigger_history/:id',
      {
        id: '@id'
      },
      {
      get: {
        method:'GET',
        isArray: false,
        params: {
          location_id: '@location_id',
          trigger_id: '@trigger_id',
          id: '@id'
        }
      },
      query: {
        method:'GET',
        isArray: false,
        params: {
          location_id: '@location_id',
          trigger_id: '@trigger_id',
          page: '@page'
        }
      }
    });
  }]);
