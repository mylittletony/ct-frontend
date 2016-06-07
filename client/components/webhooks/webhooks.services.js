'use strict';

var app = angular.module('myApp.webhooks.services', ['ngResource',]);

app.factory('Webhook', ['$resource', 'API_END_POINT',
  function($resource, API_END_POINT){
    return $resource(API_END_POINT + '/webhooks/:id',
      {
        id: '@id'
      },
      {
      get: {
        method:'GET',
        isArray: true,
        params: {
        }
      },
      query: {
        method:'GET',
        isArray: false,
        params: {
          id: '@id'
        }
      },
      update: {
        method:'PATCH',
        isArray: false,
        params: {
          id: '@id',
          webhook: '@webhook'
        }
      },
      create: {
        method:'POST',
        isArray: false,
        params: {
          id: '@id',
          webhook: '@webhook'
        }
      },
      destroy: {
        method:'DELETE',
        isArray: false,
        params: {
          id: '@id'
        }
      },
    });
  }]);

