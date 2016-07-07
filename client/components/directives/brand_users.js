'use strict';

var app = angular.module('myApp.brand_users.directives', []);

app.directive('listBrandUsers', ['Referral', '$location', '$routeParams', function(Referral, $location, $routeParams) {

  var link = function(scope,element,attrs) {
  };

  return {
    link: link,
    scope: {}
  };
}]);


