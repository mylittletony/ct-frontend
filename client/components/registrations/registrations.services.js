'use strict';

var app = angular.module('myApp.registrations.services', ['ngResource',]);

app.factory('Registration', ['$resource', 'API_END_POINT',
  function($resource, API_END_POINT){
    return $resource(API_END_POINT + '/registrations',
      {
        user: '@user',
        brand: 'mimo'
      },
      {
      create: {
        method: 'POST',
        isArray: false
      }
    });
  }]);

app.factory('Holding', ['$resource', 'API_END_POINT',
  function($resource, API_END_POINT){
    return $resource(API_END_POINT + '/holding_accounts/:id',
      {
        id: '@id',
        holding_account: '@holding_account',
        brand: 'mimo',
        client_id: '@client_id'
      },
      {
      create: {
        method: 'POST',
        isArray: false,
      },
      get: {
        method: 'GET',
        isArray: false
      },
      update: {
        method: 'PATCH',
        isArray: false
      },
      destroy: {
        method: 'DELETE',
        isArray: false
      }
    });
  }]);
