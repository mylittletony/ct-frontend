'use strict';

var app = angular.module('myApp.emails.services', ['ngResource']);

app.factory('Email', ['$resource', 'API_END_POINT',
  function($resource, API_END_POINT){
    return $resource(API_END_POINT + '/emails/:id/:action',
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
          location_id: '@location_id'
        }
      },
    });
  }]);

