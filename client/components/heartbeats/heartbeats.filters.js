'use strict';

/* Filters */

var app = angular.module('myApp.heartbeats.filters', []);

app.filter('heartbeatOnline', function() {
  return function(input) {
    input = input || '';
    return input === 'true' ? 'Online' : 'Offline';
  };
});

app.filter('disconnectReason', function() {
  return function(input) {
    input = input || '';
    if (input === '') {
      return 'Unknown';
    } else {
      return input === 'connectivity' ? 'Lost Connection' : 'Lost Power';
    }
  };
});

