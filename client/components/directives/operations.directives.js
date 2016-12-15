'use strict';

var app = angular.module('myApp.operations.directives', []);

app.directive('operations', ['Operation', 'Location', '$routeParams', 'gettextCatalog', 'pagination_labels', '$pusher', '$rootScope', '$location', function(Operation, Location, $routeParams, gettextCatalog, pagination_labels, $pusher, $rootScope, $location) {

  var link = function(scope,element,attrs,controller) {

    scope.loading  = true;
    scope.box      = { slug: $routeParams.box_id };
    scope.location = { slug: $routeParams.id };

    scope.pagination_labels = pagination_labels;
    scope.query = {
      order:   '-created_at',
      limit:   $routeParams.per || 100,
      page:    $routeParams.page || 1,
      options: [5,10,25,50,100],
    };

    scope.onPaginate = function (page, limit) {
      scope.query.page = page;
      scope.query.limit = limit;
      updatePage();
    };

    var updatePage = function(page) {
      var hash  = {};
      hash.page = scope.query.page;
      hash.per  = scope.query.limit;
      $location.search(hash);
      // init();
    };

    var init = function() {
      Operation.query({box_id: scope.box.slug, page: scope.query.page, per: scope.query.limit }).$promise.then(function(res) {
        scope.operations = res.operations;
        scope._links = res._links;
        console.log(res._links);
        scope.loading = undefined;
      }, function() {
        scope.loading = undefined;
      });
    };

    scope.back = function() {
      window.location.href = '/#/locations/' + scope.location.slug + '/boxes/' + scope.box.slug;
    };

    init();
  };

  return {
    link: link,
    scope: {
      loading: '='
    },
    templateUrl: 'components/views/operations/_index.html'
  };

}]);

app.directive('showOperation', ['Operation', 'Location', '$routeParams', 'gettextCatalog', 'pagination_labels', '$pusher', '$rootScope', function(Operation, Location, $routeParams, gettextCatalog, pagination_labels, $pusher, $rootScope) {

  var link = function(scope, element, attrs, controller) {

    scope.loading   = true;
    scope.box       = { slug: $routeParams.box_id };
    scope.location  = { slug: $routeParams.id };
    scope.operation = { id: $routeParams.operation_id };

    var statusIcon = function() {
      switch(scope.operation.status) {
        case 'NEW':
          scope.operation.statusIcon = 'cached';
          break;
        case 'SUCCESS':
          scope.operation.statusIcon = 'check_circle';
          break;
        case 'FAIL':
          scope.operation.statusIcon = 'error';
          break;
        case 'PENDING':
          scope.operation.statusIcon = 'query_builder';
          break;
        default:
          break;
      }
    };

    var init = function() {
      Operation.get({box_id: scope.box.slug, id: scope.operation.id }).$promise.then(function(res) {
        scope.operation = res;
        statusIcon();
        scope.loading = undefined;
      }, function() {
        scope.loading = undefined;
      });
    };

    scope.back = function() {
      window.location.href = '/#/locations/' + scope.location.slug + '/devices/' + scope.box.slug + '/operations';
    };

    init();
  };

  return {
    link: link,
    scope: {},
    templateUrl: 'components/views/operations/_show.html'
  };

}]);
