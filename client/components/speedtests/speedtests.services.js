'use strict';

var app = angular.module('myApp.speedtests.services', ['ngResource',]);

app.factory('Speedtest', ['$resource', '$localStorage', 'API_END_POINT',
  function($resource, $localStorage, API_END_POINT){
    return $resource(API_END_POINT + '/boxes/:box_id/speedtests',
      {
        id: '@id'
      },
      {
      create: {
        method:'POST',
        isArray: false,
        params: {
          box_id: '@box_id'
        }
      }
    });
  }]);

