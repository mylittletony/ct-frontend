'use strict';

var app = angular.module('myApp.guests.services', ['ngResource',]);

app.factory('Guest', ['$resource', 'API_END_POINT',
  function($resource, API_END_POINT){
    return $resource(API_END_POINT + '/guests/:id',
      {
        id: '@id'
      },
      {
      get: {
        method:'GET',
        isArray: false,
        params: {}
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
          guest: '@guest'
        }
      }
    });
  }]);

