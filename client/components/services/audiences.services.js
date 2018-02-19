'use strict';

var app = angular.module('myApp.audiences.services', ['ngResource',]);

app.factory('Audience', ['$resource', 'API_END_POINT',
  function($resource, API_END_POINT){
    return $resource(API_END_POINT + '/locations/:location_id/audiences/:audience_id',
      {
        location_id: '@location_id',
        audience_id: '@audience_id'
      },
      {
      create: {
        method: 'POST',
        isArray: false,
        dataType: 'json'
      },
      query: {
        method:'GET',
        isArray: false
      },
    });
  }]);
