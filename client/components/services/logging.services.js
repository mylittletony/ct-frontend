'use strict';

var app = angular.module('myApp.logs.services', ['ngResource',]);

app.factory('Logs', ['$resource', '$localStorage', 'API_END_POINT_V2',
  function($resource, $localStorage, API_END_POINT_V2){
    var token;
    if ($localStorage && $localStorage.user && $localStorage.user.api_token) {
      token = $localStorage.user.api_token;
    }
    return $resource('https://api.ctapp.io/api/v2/logs',
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
