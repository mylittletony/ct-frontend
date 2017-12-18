'use strict';

var app = angular.module('myApp.campaigns.services', ['ngResource']);

app.factory('Campaign', ['$resource', '$localStorage', 'API_END_POINT',
  function($resource, $localStorage, API_END_POINT){
    return $resource(API_END_POINT + '/locations/:location_id/campaigns/:id',
      {
        id: '@id',
        location_id: '@location_id'
      },
      {
      destroy: {
        method: 'DELETE',
        isArray: false,
        dataType: 'json'
      },
      save: {
        method:'POST',
        isArray: false,
      },
      get: {
        method:'GET',
        isArray: false,
        params: {
          location_id: '@location_id',
          id: '@id'
        }
      },
      query: {
        method:'GET',
        isArray: false
      },
      update: {
        method:'PATCH',
        isArray: false
      }
    });
  }]);