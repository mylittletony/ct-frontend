'use strict';

/* Filters */

var app = angular.module('myApp.messages.filters', []);

app.filter('formatter', ['$sce', function($sce) {
  return function(input) {

    // var f  = window.hljs.highlight('bash', input).value;
    // var html = '<pre>' + f + '</pre>';

    var html = input;
    return $sce.trustAsHtml(html);
  };
}]);
