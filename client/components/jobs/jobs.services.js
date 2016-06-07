'use strict';

var app = angular.module('myApp.jobs.services', ['ngResource',]);

app.factory('Job', ['$resource', 'API_END_POINT',
  function($resource, API_END_POINT){
    return $resource(API_END_POINT + '/boxes/:box_id/jobs',
      {
        id: '@id'
      },
      {
      query: {
        method:'GET',
        isArray: true,
        params: {
          box_id: '@box_id'
        }
      },
    });
  }]);

