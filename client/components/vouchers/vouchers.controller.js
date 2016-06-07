'use strict';

var app = angular.module('myApp.vouchers.controller', []);

app.controller('VouchersController', ['$scope', '$routeParams', 'Voucher', '$location',

  function($scope, $routeParams, Voucher, $location) {

    // $scope.loading  = true;
    // $scope.location = { slug: $routeParams.location_id };
    // $scope.query    = $routeParams.q;
    // $scope.page     = $routeParams.page;

    // $scope.init = function() {
    //   return Voucher.get({location_id: $scope.location.slug, q: $routeParams.q, page: $scope.page}).$promise.then(function(data) {
    //     $scope.vouchers   = data.vouchers;
    //     $scope._links     = data._links;
    //     $scope.loading    = undefined;
    //     $scope.searching  = undefined;
    //     $scope.predicate  = '-created_at';
    //   }, function(err) {
    //     $scope.errors     = err.data.errors;
    //     $scope.loading    = undefined;
    //   });
    // };

    // $scope.init();

    // $scope.$watch('query', function (nv) {

    //   if ($scope.filtered !== undefined && $scope.filtered.length === 0 && $scope.query) {

    //     if ($scope.query.length > 5) {
    //       $scope.searching = true;
    //       $location.search({q: $scope.query});
    //       $scope.init();
    //     } else {
    //       clear();
    //     }
    //   }

    // });

    // $scope.clearSearch = function() {
    //   $scope.query = undefined;
    //   clear();
    // };

    // $scope.updatePage = function(page) {
    //   $scope.page = $scope._links.current_page;
    //   var hash = {};
    //   hash.q = $scope.query;
    //   hash.page = $scope.page;
    //   $location.search(hash);
    //   $scope.init();
    // };

    // function clear () {
    //   $scope.searching = false;
    //   $location.search({});
    //   $scope.init();
    // }

}]);

app.controller('VouchersNewController', ['$scope', '$routeParams', 'Voucher', '$location',

  function($scope, $routeParams, Voucher, $location) {


}]);
