'use strict';

var app = angular.module('myApp.quotas.services', ['ngResource',]);

app.factory('Quota', ['$resource', '$localStorage', 'API_END_POINT',
  function($resource, $localStorage, API_END_POINT){
    return $resource(API_END_POINT + '/users/:user_id/quotas',
      {},
      {
      get: {
        method: 'GET',
        isArray: false,
        params: {
          user_id: '@user_id'
        }
      }
    });
  }]);



