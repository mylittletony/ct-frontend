'use strict';

var app = angular.module('myApp.subscriptions.services', ['ngResource',]);

app.factory('Subscription', ['$resource', '$localStorage', 'API_END_POINT',
  function($resource, $localStorage, API_END_POINT){
    return $resource(API_END_POINT + '/subscriptions',
      {
        id: '@id'
      },
      {
      create: {
        method:'POST',
        params: {
          plan_id: '@plan_id',
        }
      },
      update: {
        method:'PATCH',
        params: {
          card: '@card',
        }
      },
      destroy: {
        method:'DELETE',
        params: {
          user_id: '@user_id'
        }
      },
    });
  }]);

