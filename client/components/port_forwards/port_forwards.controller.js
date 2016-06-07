'use strict';

var app = angular.module('myApp.port_forwards.controller', []);

app.controller('PortForwardsCtrl', ['$scope', '$routeParams', 'PortForward',

  function($scope, $routeParams, PortForward) {

    $scope.loading = true;
    $scope.box = {
      slug: $routeParams.id
    };
    $scope.location =  { slug: $routeParams.location_id };
    $scope.port_forwards = {};

    $scope.init = function() {
      return PortForward.query({box_id: $routeParams.id}).$promise.then(function(data) {
        $scope.port_forwards = data;
        $scope.loading = false;
        $scope.pfView = true;
        if (!$scope.port_forwards.length) {
          $scope.port_forwards.push({source: '', destination_port: '', destination_ip: '', target: '', forward_to_ip: '', forward_to_port: '' });
        }
      }, function(a) {});
    };

    $scope.init();


}]);

