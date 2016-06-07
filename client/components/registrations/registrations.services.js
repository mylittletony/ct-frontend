'use strict';

var app = angular.module('myApp.registrations.services', ['ngResource',]);

app.factory('Registration', ['$resource', 'API_END_POINT',
  function($resource, API_END_POINT){
    return $resource(API_END_POINT + '/registrations',
      {},
      {
      create: {
        method: 'POST',
        isArray: false,
        params: {
          user: '@user',
        }
      }
    });
  }]);

app.factory('Holding', ['$resource', 'API_END_POINT',
  function($resource, API_END_POINT){
    return $resource(API_END_POINT + '/holding_accounts/:id',
      {},
      {
      create: {
        method: 'POST',
        isArray: false,
        params: {
        }
      },
      get: {
        method: 'GET',
        isArray: false,
        params: {
          id: '@id'
        }
      },
      update: {
        method: 'PATCH',
        isArray: false,
        params: {
          id: '@id',
          holding_account: '@holding_account'
        }
      },
      destroy: {
        method: 'DELETE',
        isArray: false,
        params: {
          id: '@id'
        }
      }
    });
  }]);


