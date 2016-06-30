'use strict';

var app = angular.module('myApp.firmwares.directives', []);

app.directive('firmwares', ['Firmware', '$routeParams', function(Firmware,$routeParams) {

  var link = function(scope) {

    scope.loading   = true;
    scope.predicate = '-created_at';

    var init = function() {
      Firmware.query({}).$promise.then(function(results) {
        scope.firmwares = results;
        scope.loading = undefined;
      }, function(error) {
      });
    };

    init();
  };

  return {
    link: link,
    scope: {},
    templateUrl: 'components/firmwares/_index.html'
  };

}]);

