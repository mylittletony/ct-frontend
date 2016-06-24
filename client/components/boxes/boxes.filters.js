'use strict';

/* Filters */

var app = angular.module('myApp.boxes.filters', []);

app.filter('toString', function() {
  return function(input) {
    if (input === '' || input === undefined || input === null || !input.length) {
      return 'Not available';
    } else {
      return input.toString();
    }
  };
});

app.filter('bandSelection', function() {
  return function(input) {
    if (input === '' || input === undefined || input === null) {
      return 'All available bands';
    } else if ( input === 'two' ) {
      return '2.4Ghz only';
    } else if ( input === 'five' ) {
      return '5Ghz only';
    }
  };
});

app.filter('filterUptime', function() {
  return function(input) {
    if (input === '' || input === undefined || input === null) {
      return 'N/A';
    } else {
      return (input.split(',')[0].split('up')[1]);
    }
  };
});

app.filter('kbps', function() {
  return function(bytes) {
    if (bytes === undefined || bytes === null || bytes === '') {
      return 0;
    } else {
      return (bytes / 1024).toFixed(1);
    }
  };
});

app.filter('deviceStatus', function() {
  return function(state) {
    if (state === '' || state === undefined || state === null || !state.length) {
      return 'State Unavailable';
    } else {
      switch(state) {
        case 'online':
          return 'Device online';
        case 'processing':
          return 'Waiting for configs';
        case 'offline':
          return 'Device offline';
        case 'upgrading':
          return 'Device upgrading';
        case 'new':
          return 'New device';
        default:
          // default
      }}
  };
});

app.filter('statusColour', function() {
  return function(state) {
    if (state === '' || state === undefined || state === null || !state.length) {
      return '#607D8B';
    } else {
      switch(state) {
        case 'online':
          return '#16AC5B';
        case 'rebooting':
          return 'Device rebooting';
        case 'offline':
          return '#F44336';
        case 'splash_only':
          return '#009688';
        default:
          return '#607D8B';
      }}
  };
});

