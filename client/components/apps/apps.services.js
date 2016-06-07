'use strict';

var app = angular.module('myApp.apps.services', ['ngResource',]);

app.factory('App', ['$resource', 'API_END_POINT',
  function($resource, API_END_POINT){
    return $resource(API_END_POINT + '/apps/:id/',
      {
        q: '@q',
        id: '@id'
      },
      {
      get: {
        method: 'GET',
        isArray: true,
        dataType: 'json',
        params: {
          q: '@q'
        }
      },
      update: {
        method: 'PATCH',
        isArray: false,
        dataType: 'json',
        params: {
          id: '@id',
          app: '@app'
        }
      },
      create: {
        method: 'POST',
        isArray: false,
        dataType: 'json',
        params: {
          id: '@id'
        }
      },
      query: {
        method: 'GET',
        isArray: false,
        dataType: 'json',
        params: {
          id: '@id'
        }
      },
      destroy: {
        method: 'DELETE',
        isArray: false,
        dataType: 'json',
        params: {
          id: '@id'
        }
      }
    });
  }]);

