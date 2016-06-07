'use strict';

var app = angular.module('myApp.plans.services', ['ngResource',]);

app.factory('Plan', ['$resource', '$localStorage', 'API_END_POINT',
  function($resource, $localStorage, API_END_POINT){
    return $resource(API_END_POINT + '/plans/:id',
      {
        id: '@id'
      },
      {
      get: {
        method: 'GET',
        isArray: false,
        dataType: 'json',
        params: {
          q: '@q',
          period: '@period',
          v: 2
        }
      },
      query: {
        method: 'GET',
        isArray: false,
        dataType: 'json',
        params: {
          id: '@id',
          v: 2
        }
      },
    });
  }]);

