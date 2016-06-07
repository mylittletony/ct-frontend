'use strict';

/* Filters */

var app = angular.module('myApp.payloads.filters', []);

app.filter('breakFilter', function() {
  return function (text) {
    if (text !== undefined) {
      return text.replace(/\n/g, '<br />');
    }
  };
});
