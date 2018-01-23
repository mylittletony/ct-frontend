'use strict';

var app = angular.module('myApp.bulk_message_activity.services', ['ngResource',]);

app.factory('BulkMessageActivity', ['$resource', 'API_END_POINT',
  function($resource, API_END_POINT){
    return $resource(API_END_POINT + '/locations/:location_id/bulk_message_activity',
      {
        q: '@q',
        location_id: '@location_id',
        person_id: '@person_id',
        message_id: '@message_id'
      },
      {
      index: {
        method: 'GET',
        isArray: false,
        dataType: 'json'
      }
    });
  }]);
