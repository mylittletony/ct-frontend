'use strict';

var app = angular.module('myApp.menu.filters', []);

app.filter('nospace', function () {
  return function (value) {
    return (!value) ? '' : value.replace(/ /g, '');
  };
});

app.filter('humanizeDoc', function () {
  return function (doc) {
    if (!doc) return;
    if (doc.type === 'directive') {
      return doc.name.replace(/([A-Z])/g, function ($1) {
        return '-' + $1.toLowerCase();
      });
    }

    return doc.label || doc.name;
  };
});

app.filter('startFrom',function () {
  return function (input,start) {
    start = +start;
    return input.slice(start);
  };
});
