'use strict';

var app = angular.module('myApp.jobs.controller', []);

app.controller('JobsCtrl', ['$scope', '$routeParams', 'Job',

  function($scope, $routeParams, Job) {

    $scope.loading = true;
    $scope.box = {
      slug: $routeParams.box_id
    };
    $scope.location_name = $routeParams.location_id;

    $scope.init = function() {
      Job.query({box_id: $routeParams.id}, function(data) {
        $scope.jobs = data;
        $scope.loading = false;
      });
    };

    $scope.init();


}]);

