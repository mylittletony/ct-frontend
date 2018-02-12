'use strict';

var app = angular.module('myApp.social.services', ['ngResource',]);

app.factory('Social', ['$resource', '$localStorage', 'API_END_POINT',
  function($resource, $localStorage, API_END_POINT){
    return $resource(API_END_POINT + '/social/:id',
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
          q: '@q'
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
      update: {
        method: 'PATCH',
        params: {
          id: '@id',
          social: '@social'
        }
      }
    });
  }]);

