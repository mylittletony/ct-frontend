'use strict';

var app = angular.module('myApp.sms.services', ['ngResource']);

app.factory('Sms', ['$resource', '$localStorage', 'API_END_POINT',
  function($resource, $localStorage, API_END_POINT){
    return $resource(API_END_POINT + '/locations/:location_id/sms',
      {
        location_id: '@location_id',
        person_id: '@person_id'
      },
      {
      query: {
        method:'GET',
        isArray: false
      }
    });
  }]);
