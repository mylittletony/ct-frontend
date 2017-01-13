'use strict';

var app = angular.module('myApp.payloads.services', ['ngResource',]);

app.factory('Payload', ['$resource', 'API_END_POINT',
  function($resource, API_END_POINT){
    return $resource(API_END_POINT + '/:controller/:box_id/payloads/:id',
      {
        id: '@id',
        controller: '@controller',
        box_id: '@box_id',
        payload: '@payload',
        save: '@save'
      },
      {
      get: {
        method:'GET',
        isArray: false,
        params: {
          box_id: '@box_id',
          id: '@id',
          controller: 'boxes'
        }
      },
      destroy: {
        method: 'DELETE',
        isArray: false,
        params: {
          box_id: '@box_id',
          id: '@id',
          controller: 'boxes'
        }
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

