'use strict';

/* Filters */

var app = angular.module('myApp.splash_pages.filters', []);

app.filter('periodicFilter', function() {

  return function (text) {
    if (text === 'daily' ) {
      return 'day';
    } else if ( text === 'weekly' ) {
      return 'week';
    } else { return 'month'; }
  };

});

app.filter('translateAccessTypeName', ['gettextCatalog', function(gettextCatalog) {
  return function(input) {
    switch(input) {
      case 1:
        return gettextCatalog.getString('Password');
      case 2:
        return gettextCatalog.getString('Vouchers');
      case 3:
        return gettextCatalog.getString('Clickthrough');
      case 7:
        return gettextCatalog.getString('Social');
      case 8:
        return gettextCatalog.getString('Registration');
      case 9:
        return gettextCatalog.getString('QuickCodes');
      default:
        return gettextCatalog.getString('N/A');
    }
  };
}]);

app.filter('translatablePrimaryAccess', ['gettextCatalog', function(gettextCatalog) {
  return function(input) {
    switch(input) {
      case 'Password':
        return gettextCatalog.getString('Password');
      case 'Vouchers':
        return gettextCatalog.getString('Vouchers');
      case 'Clickthrough':
        return gettextCatalog.getString('Clickthrough');
      case 'Social':
        return gettextCatalog.getString('Social');
      case 'Registration':
        return gettextCatalog.getString('Registration');
      case 'QuickCodes':
        return gettextCatalog.getString('QuickCodes');
      default:
        return gettextCatalog.getString('N/A');
    }
  };
}]);

app.filter('translatableAccessRestrict', ['gettextCatalog', function(gettextCatalog) {
  return function(input) {
    switch(input) {
      case 'daily':
        return gettextCatalog.getString('daily');
      case 'weekly':
        return gettextCatalog.getString('weekly');
      case 'monthly':
        return gettextCatalog.getString('monthly');
    }
  };
}]);