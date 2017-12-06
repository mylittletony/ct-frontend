'use strict';

var app = angular.module('myApp.logs.services', ['ngResource',]);

app.factory('Logs', ['$resource', '$localStorage', 'API_END_POINT',
  function($resource, $localStorage, API_END_POINT){
    var token;
    if ($localStorage && $localStorage.user && $localStorage.user.api_token) {
      token = $localStorage.user.api_token;
    }
    return $resource(API_END_POINT + '/logs',
      {
        'access_token': token
      },
      {
      query: {
        method:'GET',
        isArray: false,
      },
    });
  }]);
