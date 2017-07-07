'use strict';

var app = angular.module('myApp.resellers.services', ['ngResource',]);

app.factory('Reseller', ['$resource', '$localStorage', 'API_END_POINT',
  function($resource, $localStorage, API_END_POINT){
    return $resource(API_END_POINT + '/resellers',
      {
      },
      {
      create: {
        method: 'POST',
        isArray: false,
        params: {
        }
      }
    });
  }]);
