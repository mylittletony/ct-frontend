'use strict';

var app = angular.module('myApp.distros.services', ['ngResource',]);

app.factory('Distributor', ['$resource', 'API_END_POINT',
  function($resource, API_END_POINT){
    return $resource(API_END_POINT + '/distributors/:id',
      {
      },
      {
      get: {
        method: 'GET',
        isArray: false,
        dataType: 'json',
        params: {
          page: '@page',
          id: '@id'
        }
      },
    });
  }]);

app.factory('Referral', ['$resource', 'API_END_POINT',
  function($resource, API_END_POINT){
    return $resource(API_END_POINT + '/referrals/',
      {
      },
      {
      get: {
        method: 'GET',
        isArray: true,
        dataType: 'json',
        params: {
          page: '@page',
        }
      },
    });
  }]);

