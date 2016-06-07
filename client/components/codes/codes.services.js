'use strict';

var app = angular.module('myApp.codes.services', ['ngResource',]);

app.factory('Code', ['$resource', 'API_END_POINT',
  function($resource, API_END_POINT){
    return $resource(API_END_POINT + '/:locations/:location_id/:vouchers/:voucher_id/codes/:code_id/:action',
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
          location_id: '@location_id',
          voucher_id: '@voucher_id',
          locations: 'locations',
          vouchers: '@vouchers', // changed this from vouchers - added the @!!
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
      generate_password: {
        method: 'POST',
        params: {
          action: 'generate_password'
        }
      }
    });
  }]);

