'use strict';

var app = angular.module('myApp.metrics.services', ['ngResource',]);

app.factory('Metric', ['$resource', '$localStorage', 'API_END_POINT',
  function($resource, $localStorage, API_END_POINT){
    var token;
    if ($localStorage && $localStorage.user && $localStorage.user.api_token) {
      token = $localStorage.user.api_token;
    }
    if (API_END_POINT === 'http://mywifi.test:8080/api/v1') {
      API_END_POINT = 'http://dashboard.ctapp:8000/api/v1';
    }
    return $resource(API_END_POINT + '/metrics',
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

// Remove this once we've moved the lambda into python...

app.factory('MetricLambda', ['$resource', '$localStorage', 'API_END_POINT_V2',
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
