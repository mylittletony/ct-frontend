'use strict';

var app = angular.module('myApp.brands.services', ['ngResource',]);

app.factory('BrandName', [function() {
  return { name: '', image: '', icon: '' };
}]);

app.factory('Brand', ['$resource', 'API_END_POINT',
  function($resource, API_END_POINT){
    return $resource(API_END_POINT + '/brands/:id',
      {
        id: '@id',
        cname: '@cname',
        type: '@type'
      },
      {
      query: {
        method: 'GET',
        isArray: false,
        cache: true,
        dataType: 'json',
      },
      get: {
        method: 'GET',
        isArray: false,
        dataType: 'json',
      },
      update: {
        method: 'PATCH'
      },
      create: {
        method: 'POST',
      }
    });
  }]);
