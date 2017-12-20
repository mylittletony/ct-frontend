'use strict';

var app = angular.module('myApp.reports.v2.directives', []);

app.factory('Locations', [function() {
  return { current: '', all: '' };
}]);

