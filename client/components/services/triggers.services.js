'use strict';

var app = angular.module('myApp.triggers.services', ['ngResource']);

app.factory('Trigger', ['$resource', '$localStorage', 'API_END_POINT',
  function($resource, $localStorage, API_END_POINT){
    return $resource(API_END_POINT + '/locations/:location_id/triggers/:id',
      {
        id: '@id',
        location_id: '@location_id'
      },
      {
      destroy: {
        method: 'DELETE',
        isArray: true,
        dataType: 'json'
      },
      save: {
        method:'POST',
        isArray: false,
      },
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
        isArray: false
      },
      update: {
        method:'PATCH',
        isArray: false
      }
    });
  }]);

app.factory('BrandTrigger', ['$resource', '$localStorage', 'API_END_POINT',
  function($resource, $localStorage, API_END_POINT){
    return $resource(API_END_POINT + '/brands/:brand_id/triggers/:id',
      {
        id: '@id',
        brand_id: '@brand_id'
      },
      {
      destroy: {
        method: 'DELETE',
        isArray: true,
        dataType: 'json'
      },
      save: {
        method:'POST',
        isArray: false,
      },
      get: {
        method:'GET',
        isArray: false,
      },
      query: {
        method:'GET',
        isArray: false
      },
      update: {
        method:'PATCH',
        isArray: false
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
