'use strict';

var app = angular.module('myApp.heartbeats.services', ['ngResource',]);

app.factory('Heartbeat', ['$resource', 'API_END_POINT',
  function($resource, API_END_POINT){
    return $resource(API_END_POINT + '/boxes/:box_id/heartbeats',
      {
        id: '@id'
      },
      {
      query: {
        method:'GET',
        isArray: false,
        params: {
          box_id: '@box_id'
        }
      },
    });
  }]);

