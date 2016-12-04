'use strict';

/* Filters */

var app = angular.module('myApp.messages.filters', []);

app.filter('formatter', ['$sce', function($sce) {
  return function(input, cmd) {
    if (input === null || input === '' || input === undefined) {
      return input;
    }

    var type = 'bash';
    if (input === 'DNE') {
      input = 'command not found: ' + cmd;
      type = 'json';
    }

    if (cmd === 'speedtest') {
      var s = (input / (131072)).toFixed(2);
      input = s.toString() + 'Mb/s';
    }

    var f  = window.hljs.highlight(type, input).value;
    var html = '<pre>' + f + '</pre>';
    return $sce.trustAsHtml(html);
  };
}]);
