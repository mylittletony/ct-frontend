'use strict';

var app = angular.module('myApp.payloads.services', ['ngResource',]);

app.factory('Payload', ['$resource', 'API_END_POINT',
  function($resource, API_END_POINT){
    return $resource(API_END_POINT + '/locations/:location_id/boxes/:box_id/payloads/:id',
      {
        id: '@id',
        controller: '@controller',
        box_ids: '@box_ids',
        box_id: '@box_id',
        payload: '@payload',
        location_id: '@location_id',
        save: '@save',
      },
      {
      get: {
        method:'GET',
        isArray: false,
      },
      destroy: {
        method: 'DELETE',
        isArray: false
      },
      create: {
        method:'POST',
        isArray: false
      },
      query: {
        method:'GET',
        isArray: true,
        params: {
          box_id: '@box_id',
          controller: '@controller'
        }
      },
    });
  }]);

app.factory('LocationPayload', ['$resource', 'API_END_POINT',
  function($resource, API_END_POINT){
    return $resource(API_END_POINT + '/locations/:location_id/payloads',
      {
        id: '@id',
        box_ids: '@box_ids',
        payload: '@payload',
        location_id: '@location_id',
        save: '@save',
      },
      {
      create: {
        method:'POST',
        isArray: false
      },
    });
  }]);

