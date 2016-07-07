'use strict';

var app = angular.module('myApp.brand_users.directives', []);

app.directive('listBrandUsers', ['BrandUser', '$location', '$routeParams', function(BrandUser, $location, $routeParams) {

  var link = function(scope,element,attrs) {
    scope.loading = true;
    scope.brand   = { id: $routeParams.brand_id };
    
    var init = function() {
      BrandUser.get({brand_id: scope.brand.id}).$promise.then(function(results) {
        scope.brand_users = results;
        scope.loading = undefined;
      }, function(err) {
        scope.loading = undefined;
      });
    };

    init();

  };

  return {
    link: link,
    scope: {}
  };
}]);


