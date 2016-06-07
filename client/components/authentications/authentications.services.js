'use strict';

var app = angular.module('myApp.authentications.services', ['ngResource',]);

app.factory('Authentication', ['$resource', 'API_END_POINT',
  function($resource, API_END_POINT){
    return $resource(API_END_POINT + '/auth',
      {},
      {
      create: {
        method: 'POST',
        isArray: false,
        params: {
          username: '@username',
          password: '@password'
        }
      }
    });
  }]);


