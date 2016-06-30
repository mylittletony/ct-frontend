'use strict';

/* Filters */

var app = angular.module('myApp.heartbeats.filters', []);

app.filter('heartbeatOnline', ['gettextCatalog', function(gettextCatalog) {
  return function(input) {
    input = input || '';
    return input === 'true' ? gettextCatalog.getString('Online') : gettextCatalog.getString('Offline');
  };
}]);

app.filter('disconnectReason',['gettextCatalog', function(gettextCatalog) {
  return function(input) {
    input = input || '';
    if (input === '') {
      return gettextCatalog.getString('Unknown');
    } else {
      return input === 'connectivity' ? gettextCatalog.getString('Lost Connection') : gettextCatalog.getString('Lost Power');
    }
  };
}]);

