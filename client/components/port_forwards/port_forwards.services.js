'use strict';

var app = angular.module('myApp.port_forwards.services', ['ngResource',]);

app.factory('PortForward', ['$resource', '$localStorage', 'API_END_POINT',
  function($resource, $localStorage, API_END_POINT){
    return $resource(API_END_POINT + '/boxes/:box_id/:action/:id',
      {
        id: '@id'
      },
      {
      update: {
        method: 'PATCH',
        isArray: false,
        params: {
          box_id: '@box_id',
          id: '@id',
          box: '@box'
        }
      },
      query: {
        method:'GET',
        isArray: true,
        params: {
          box_id: '@box_id',
          action: 'port_forwards'
        }
      },
    });
  }]);

