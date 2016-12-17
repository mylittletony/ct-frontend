'use strict';

var app = angular.module('myApp.themes.services', ['ngResource',]);

app.factory('Theme', [function() {
  return { primary: 'blue-grey', accent: 'blue' };
}]);

