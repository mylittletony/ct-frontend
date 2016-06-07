'use strict';

var app = angular.module('myApp.speedtests.controller', []);

app.controller('SpeedtestsCtrl', ['$scope', '$routeParams', 'Speedtest',

  function($scope, $routeParams, Speedtest) {

    $scope.loading = true;
    $scope.box = {
      slug: $routeParams.box_id
    };
    $scope.location_name = $routeParams.location_id;

    $scope.init = function() {
      Speedtest.get({box_id: $routeParams.id}, function(data) {
        $scope.speedtests = data;
        $scope.loading = false;
      });
    };

    $scope.init();


}]);

