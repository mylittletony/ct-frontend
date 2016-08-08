'use strict';

var app = angular.module('myApp.paginationLabels.services', []);

app.factory('paginationLabels', ['gettextCatalog', function(gettextCatalog) {
  var paginationLabels = {
      page: gettextCatalog.getString('Page'),
      rowsPerPage: gettextCatalog.getString('Rows per page:'),
      of: gettextCatalog.getString('of')
    };
  return paginationLabels;
}]);