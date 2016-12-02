'use strict';

var app = angular.module('myApp.messages.services', ['ngResource',]);

app.factory('MessageListing', [function() {
  return { messages: [] };
}]);

app.factory('Message', ['$resource', '$localStorage', 'API_END_POINT',
  function($resource, $localStorage, API_END_POINT){
    return $resource(API_END_POINT + '/boxes/:box_id/messages/:id',
      {
        q: '@q',
        box_id: '@box_id',
        id: '@id'
      },
      {
      get: {
        method: 'GET',
        isArray: false,
        dataType: 'json',
        params: {
          box_id: '@box_id'
        }
      },
      query: {
        method: 'GET',
        isArray: false,
        dataType: 'json',
        params: {
          q: '@q'

        }
      },
      create: {
        method: 'POST',
        isArray: false,
        dataType: 'json',
        params: {
          box_id: '@box_id',
          message: '@message'
        }
      }
    });
  }]);

