'use strict';

var app = angular.module('myApp.commands.services', ['ngResource',]);

app.factory('Command', ['$resource', 'API_END_POINT',
  function($resource, API_END_POINT){
    return $resource(API_END_POINT + '/commands/:id',
      {
        id: '@id'
      },
      {
      query: {
        method:'GET',
        isArray: true
      }
    });
  }]);

