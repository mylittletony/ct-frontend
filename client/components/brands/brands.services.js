'use strict';

var app = angular.module('myApp.brands.services', ['ngResource',]);

app.factory('BrandName', [function() {
  return { name: '', image: '', icon: '' };
}]);

app.factory('Brand', ['$resource', 'API_END_POINT',
  function($resource, API_END_POINT){
    return $resource(API_END_POINT + '/brands/:id',
      {
        id: '@id'
      },
      {
      query: {
        method: 'GET',
        isArray: false,
        // cache: true,
        dataType: 'json',
        params: {
          id: '@id',
          cname: '@cname'
        }
      },
      get: {
        method: 'GET',
        isArray: false,
        dataType: 'json',
        params: {
          q: '@q'
        }
      },
      update: {
        method: 'PATCH'
      },
      create: {
        method: 'POST',
        params: {
          brand: '@brand'
        }
      }
    });
  }]);
