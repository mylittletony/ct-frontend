'use strict';

var app = angular.module('myApp.splash_integrations.services', ['ngResource',]);

app.factory('SplashIntegration', ['$resource', '$localStorage', 'API_END_POINT',
  function($resource, $localStorage, API_END_POINT){
    return $resource(API_END_POINT + '/splash_integrations/:id',
      {
      },
      {
      query: {
        method: 'GET',
        isArray: false,
        dataType: 'json',
        params: {
        }
      },
      create: {
        method: 'POST',
        isArray: false,
        params: {
          location_id: '@location_id',
          splash_integration: '@splash_integration'
        }
      },
      update: {
        method: 'PATCH',
        isArray: false,
        params: {
          location_id: '@location_id',
          id: '@id',
          splash_integration: '@splash_integration'
        }
      },
    });
  }]);