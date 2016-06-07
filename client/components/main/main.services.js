'use strict';

var app = angular.module('myApp.main.services', ['ngResource',]);

app.factory('locationHelper', ['$resource', '$localStorage', '$location',
  function($resource, $localStorage, $location){

    var domain = function() {
      var uri = new window.URI(window.location.href);
      var host = uri.domain();
      return host;
    };

    var subdomain = function() {
      var uri = new window.URI(window.location.href);
      var subdomain = uri.subdomain();
      return subdomain;
    };

    var reconstructed = function(url) {
      var protocol  = window.location.protocol;
      var full      = window.location.host;
      var parts     = full.split('.');
      var domain    = parts[1];
      var type      = parts[2];
      var reconstructed = protocol + '//' + url + '.' + domain + '.' + type;
      return reconstructed;
    };

    return {
      domain: domain,
      subdomain: subdomain,
      reconstructed: reconstructed
    };
  }]);

app.factory('statusPage', ['$resource', '$location',
  function($resource, $location){

    var id = 'lrlkfrhrjrpk';

    return $resource('https://' + id + '.statuspage.io/api/v2/summary.json', {}, {
      get: {
        params: {
        }
      }
    });
  }]);

app.factory('Shortener', ['$resource', '$localStorage', 'API_END_POINT',
  function($resource, $localStorage, API_END_POINT){

    return $resource(API_END_POINT + '/shortener',
      {
        short: '@q',
      },
      {
      get: {
        method: 'GET',
        isArray: false,
        dataType: 'json',
        params: {
          short: '@short',
        }
      }
    });
  }]);
