'use strict';

var app = angular.module('myApp.emails.services', ['ngResource']);

app.factory('Email', ['$resource', 'API_END_POINT',
  function($resource, API_END_POINT){
    return $resource(API_END_POINT + '/emails/:id',
      {
        q: '@q',
        id: '@id'
      },
      {
      get: {
        method: 'GET',
        isArray: false,
        dataType: 'json',
        params: {
          q: '@q',
          location_id: '@location_id',
          start: '@start',
          end: '@end',
          per: '@per',
          page: '@page'
        }
      },
      update: {
        method: 'PATCH',
        isArray: false,
        params: {
          action: '@action',
          code: '@code'
        }
      }
    });
  }]);
