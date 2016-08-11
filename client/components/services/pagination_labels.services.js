'use strict';

var app = angular.module('myApp.pagination_labels.services', []);

app.factory('pagination_labels', ['gettextCatalog', function(gettextCatalog) {
  var pagination_labels = {
      page: gettextCatalog.getString('Page'),
      rowsPerPage: gettextCatalog.getString('Rows per page:'),
      of: gettextCatalog.getString('of')
    };
  return pagination_labels;
}]);