'use strict';

var app = angular.module('myApp.operations.services', ['ngResource',]);

app.factory('Operation', ['$resource', '$localStorage', 'API_END_POINT',
  function($resource, $localStorage, API_END_POINT){
    return $resource(API_END_POINT + '/boxes/:box_id/operations/:id',
      {
        q: '@q',
        box_id: '@box_id',
        id: '@id'
      },
      {
      get: {
        method: 'GET',
        isArray: false,
        dataType: 'json',
        params: {
          box_id: '@box_id'
        }
      },
      query: {
        method: 'GET',
        isArray: false,
        dataType: 'json',
        params: {
          q: '@q',
          page: '@page',
          per: '@per'
        }
      }
    });
  }]);

