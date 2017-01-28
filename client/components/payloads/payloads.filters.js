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

app.filter('translatablePayloadDescription', ['gettextCatalog', function(gettextCatalog) {
  return function(input) {
    if ( input === undefined || input === null || input === '') {
      return gettextCatalog.getString('N/A');
    } else {
      input = input.toString();
      switch(input) {
        case 'ifconfig':
          return 'ifconfig';
        case 'Disable My Login Screens':
          return gettextCatalog.getString('Disable My Login Screens');
        case 'Enable My Login Screens':
          return gettextCatalog.getString('Enable My Login Screens');
        case 'Runs the health check on a box':
          return gettextCatalog.getString('Runs the health check on a box');
        case 'Run iwinfo':
          return gettextCatalog.getString('Run iwinfo');
        case 'cat wireless':
          return gettextCatalog.getString('cat wireless');
        case 'process list':
          return gettextCatalog.getString('process list');
        case 'Configs dump':
          return gettextCatalog.getString('Configs dump');
        case 'Get Routes':
          return gettextCatalog.getString('Get Routes');
        case 'Get DHCP Config':
          return gettextCatalog.getString('Get DHCP Config');
      }
    }
  };
}]);