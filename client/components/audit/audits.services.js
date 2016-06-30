'use strict';

var app = angular.module('myApp.audit.services', ['ngResource',]);

app.factory('Session', ['$resource', 'API_END_POINT',
  function($resource, API_END_POINT){
    return $resource(API_END_POINT + '/sessions',
      {
        id: '@id'
      },
      {
      query: {
        method:'GET',
        isArray: false,
        params: {
          box_id: '@box_id',
          location_id: '@location_id',
          id: '@id',
          client_mac: '@client_mac'
        }
      }
    });
  }]);

app.factory('Order', ['$resource', 'API_END_POINT',
  function($resource, API_END_POINT){
    return $resource(API_END_POINT + '/store_orders/:id/:action',
      {
        q: '@q',
        id: '@id'
      },
      {
      get: {
        method: 'GET',
        isArray: false,
        dataType: 'json',
        params: {
          q: '@q'
        }
      },
      query: {
        method: 'GET',
        isArray: false,
        dataType: 'json',
        params: {
          id: '@id'
        }
      },
      update: {
        method: 'PATCH',
        isArray: false,
        dataType: 'json',
        params: {
          id: '@id',
          store_order: '@store_order'
        }
      }
    });
  }]);
