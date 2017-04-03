'use strict';

/* Filters */

var app = angular.module('myApp.boxes.filters', []);

app.filter('toString', ['gettextCatalog', function(gettextCatalog) {
  return function(input) {
    if (input === '' || input === undefined || input === null || !input.length) {
      return gettextCatalog.getString('Not available');
    } else {
      return input.toString();
    }
  };
}]);

app.filter('bandSelection', ['gettextCatalog', function(gettextCatalog) {
  return function(input) {
    if (input === '' || input === undefined || input === null) {
      return gettextCatalog.getString('All available bands');
    } else if ( input === 'two' ) {
      return gettextCatalog.getString('2.4Ghz only');
    } else if ( input === 'five' ) {
      return gettextCatalog.getString('5Ghz only');
    }
  };
}]);

app.filter('filterUptime', ['gettextCatalog', function(gettextCatalog) {
  return function(input) {
    if (input === '' || input === undefined || input === null) {
      return gettextCatalog.getString('N/A');
    } else {
      return (input.split(',')[0].split('up')[1]);
    }
  };
}]);

app.filter('ssidFilter', ['gettextCatalog', function(gettextCatalog) {
  return function(ssids) {
    if (ssids === undefined || ssids === null || ssids === '') {
      return gettextCatalog.getString('N/A');
    } else {
      var formatted = ssids.join(',');
      return formatted;
    }
  };
}]);

app.filter('kbps', function() {
  return function(bytes) {
    if (bytes === undefined || bytes === null || bytes === '') {
      return 0;
    } else {
      return (bytes / 1024).toFixed(1);
    }
  };
});

app.filter('deviceStatus',['gettextCatalog', function(gettextCatalog) {
  return function(state) {
    if (state === '' || state === undefined || state === null || !state.length) {
      return gettextCatalog.getString('State Unavailable');
    } else {
      switch(state) {
        case 'online':
          return gettextCatalog.getString('Device online');
        case 'processing':
          return gettextCatalog.getString('Waiting for configs');
        case 'offline':
          return gettextCatalog.getString('Device offline');
        case 'upgrading':
          return gettextCatalog.getString('Device upgrading');
        case 'new':
          return gettextCatalog.getString('New device');
        default:
          // default
      }}
  };
}]);

app.filter('statusColour',['gettextCatalog', function(gett) {
  return function(state) {
    if (state === '' || state === undefined || state === null || !state.length) {
      return '#607D8B';
    } else {
      switch(state) {
        case 'online':
          return '#16AC5B';
        case 'rebooting':
          return gettextCatalog.getString('Device rebooting');
        case 'offline':
          return '#F44336';
        case 'splash_only':
          return '#009688';
        default:
          return '#607D8B';
      }}
  };
}]);

app.filter('translatableChartTitle', ['gettextCatalog', function(gettextCatalog) {
  return function(input) {
    if ( input === undefined || input === null || input === '') {
      return gettextCatalog.getString('N/A');
    } else {
      switch(input) {
        case 'snr':
          return gettextCatalog.getString('snr');
        case 'quality':
          return gettextCatalog.getString('quality');
        case 'signal':
          return gettextCatalog.getString('signal');
        case 'noise':
          return gettextCatalog.getString('noise');
      }
    }
  };
}]);
