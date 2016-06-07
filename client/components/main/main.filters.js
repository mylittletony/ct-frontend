'use strict';

/* Filters */

var app = angular.module('myApp.main.filters', []);

app.filter('sanitize', ['$sce', function($sce) {
  return function(htmlCode){
    if (htmlCode !== null && htmlCode !== '' && htmlCode !== undefined) {
      return $sce.trustAsHtml(htmlCode.replace(/\r?\n/g, '<br />'));
    } else {
      return htmlCode;
    }
  };
}]);

app.filter('truncate', function() {

  return function (text, length, end) {

    if (isNaN(length)) {
        length = 10;
    }

    if (end === undefined) {
        end = '...';
    }

    if (text === undefined || text === '' || text === null || (text.length <= length || text.length - end.length <= length)) {
        return text;
    }

    else {
        return String(text).substring(0, length-end.length) + end;
    }

  };

});

app.filter('toMins', function() {

  return function (seconds) {
    if (seconds === undefined || seconds === null || seconds === '') {
      return '0';
    } else {
      var t = seconds / 60;
      if (t < 1) {
        return Math.round(t,2);
      } else {
        return parseInt(t);
      }
    }
  };

});
