'use strict';

var app = angular.module('myApp.metrics.services', ['ngResource',]);

app.factory('Metric', ['$resource', '$localStorage', 'API_END_POINT_V2',
  function($resource, $localStorage, API_END_POINT_V2){
    var token;
    if ($localStorage && $localStorage.user && $localStorage.user.api_token) {
      token = $localStorage.user.api_token;
    }
    return $resource(API_END_POINT_V2 + '/metrics',
      {
        'access_token': token
      },
      {
      clientstats: {
        method:'GET',
        isArray: false,
      },
    });
  }]);
