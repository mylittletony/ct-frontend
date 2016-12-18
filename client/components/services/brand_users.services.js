'use strict';

var app = angular.module('myApp.brand_users.services', ['ngResource',]);

app.factory('BrandUser', ['$resource', 'API_END_POINT',
  function($resource, API_END_POINT){
    return $resource(API_END_POINT + '/brands/:brand_id/brand_users/:id',
      {
        q: '@q',
        id: '@id',
        brand_user: '@brand_user',
        brand_id: '@brand_id'
      },
      {
      update: {
        method: 'PATCH',
        isArray: false,
        dataType: 'json'
      },
      destroy: {
        method: 'DELETE',
        isArray: false,
        dataType: 'json',
        params: {
          id: '@id',
          brand_user: '@brand_user',
          brand_id: '@brand_id'
        }
      }
    });
  }]);


