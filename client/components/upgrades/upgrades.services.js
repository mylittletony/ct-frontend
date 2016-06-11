'use strict';

var app = angular.module('myApp.upgrades.services', ['ngResource',]);

app.factory('Upgrade', ['$resource', '$localStorage', 'API_END_POINT',
  function($resource, $localStorage, API_END_POINT){
    return $resource(API_END_POINT + '/:resource/:box_id/upgrades/:action',
      {
        id: '@id'
      },
      {
      get: {
        method: 'GET',
        dataType: 'json'
      },
      update: {
        method: 'PATCH',
        isArray: false,
        params: {
          box_id: '@box_id',
          resource: 'boxes',
          when: '@when'
        }
      },
      destroy: {
        method: 'DELETE',
        isArray: false,
        params: {
          box_id: '@box_id',
          resource: 'boxes'
        }
      }
    });
  }]);

