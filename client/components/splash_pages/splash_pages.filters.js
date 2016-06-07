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

