'use strict';

var app = angular.module('myApp.orders.services', ['ngResource',]);

app.factory('Order', ['$resource', '$localStorage', 'API_END_POINT',
  function($resource, $localStorage, API_END_POINT){
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
          q: '@q',
          page: '@page',
          client_mac: '@client_mac'
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

