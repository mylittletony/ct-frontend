'use strict';

var app = angular.module('myApp.bulk_message_activity.services', ['ngResource',]);

app.factory('BulkMessageActivity', ['$resource', 'API_END_POINT',
  function($resource, API_END_POINT){
    return $resource(API_END_POINT + '/locations/:location_id/bulk_message_activity',
      {
        q: '@q',
        location_id: '@location_id',
      },
      {
      index: {
        method: 'GET',
        isArray: false,
        dataType: 'json',
        params: {
          q: '@q',
          location_id: '@location_id'
        }
      },
    });
  }]);

