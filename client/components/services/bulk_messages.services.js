'use strict';

var app = angular.module('myApp.bulk_messages.services', ['ngResource',]);

app.factory('BulkMessage', ['$resource', 'API_END_POINT',
  function($resource, API_END_POINT){
    return $resource(API_END_POINT + '/locations/:location_id/bulk_messages',
      {
        q: '@q',
        location_id: '@location_id',
      },
      {
      create: {
        method: 'POST',
        isArray: false,
        dataType: 'json'
      }
    });
  }]);

