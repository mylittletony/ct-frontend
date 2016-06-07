'use strict';

var app = angular.module('myApp.versions.services', ['ngResource',]);

app.factory('Version', ['$resource', '$localStorage', 'API_END_POINT',
  function($resource, $localStorage, API_END_POINT){
    return $resource(API_END_POINT + '/:resource/:resource_id/versions/:id/:action',
      {
        id: '@id'
      },
      {
      query: {
        method:'GET',
        isArray: false,
        params: {
          resource_id: '@resource_id',
          resource: '@resource'
        }
      },
      revert: {
        method:'POST',
        isArray: false,
        params: {
          resource_id: '@resource_id',
          id: '@id',
          action: 'revert',
          resource: '@resource'
        }
      }
    });
  }]);

