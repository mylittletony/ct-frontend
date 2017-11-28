'use strict';

var app = angular.module('myApp.bonus_splash_views.services', ['ngResource',]);

app.factory('BonusSplashViews', ['$resource', '$localStorage', 'API_END_POINT',
  function($resource, $localStorage, API_END_POINT){
    return $resource(API_END_POINT + '/bonus_splash_views',
      {
      },
      {
      create: {
        method: 'POST',
        isArray: false,
        params: {
        }
      }
    });
  }]);
