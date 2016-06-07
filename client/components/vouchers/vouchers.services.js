'use strict';

var app = angular.module('myApp.vouchers.services', ['ngResource',]);

app.factory('Voucher', ['$resource', '$localStorage', 'API_END_POINT',
  function($resource, $localStorage, API_END_POINT){
    return $resource(API_END_POINT + '/locations/:location_id/vouchers/:id',
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
          location_id: '@location_id'
        }
      },
      query: {
        method: 'GET',
        isArray: false,
        dataType: 'json',
        params: {
          q: '@q',
          location_id: '@location_id'
        }
      },
      update: {
        method: 'PATCH',
        isArray: false,
        params: {
          voucher: '@voucher',
          location_id: '@location_id'
        }
      },
      create: {
        method: 'POST',
        isArray: false,
        params: {
          voucher: '@voucher',
          location_id: '@location_id'
        }
      },
      destroy: {
        method: 'DELETE',
        isArray: false,
        params: {
          location_id: '@location_id'
        }
      }
    });
  }]);

