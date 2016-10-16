'use strict';

var app = angular.module('myApp.plans.services', ['ngResource',]);

app.factory('Plan', ['$resource', '$localStorage', 'API_END_POINT',
  function($resource, $localStorage, API_END_POINT){
    return $resource(API_END_POINT + '/plans/:id',
      {
        id: '@id',
        enterprise: '@enterprise'
      },
      {
      get: {
        method: 'GET',
        isArray: false,
        dataType: 'json',
        params: {
          q: '@q',
          period: '@period',
          enterprise: '@enterprise'
        }
      },
      query: {
        method: 'GET',
        isArray: false,
        dataType: 'json',
        params: {
          id: '@id',
          enterprise: '@enterprise'
        }
      },
    });
  }]);

