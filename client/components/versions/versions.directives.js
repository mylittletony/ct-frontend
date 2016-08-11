'use strict';

var app = angular.module('myApp.versions.directives', []);


app.directive('listLocationVersions', ['Location', '$routeParams', 'Version', '$location', 'pagination_labels', function(Location, $routeParams, Version, $location, pagination_labels) {

  var link = function( scope, element, attrs ) {

    scope.location = { slug: $routeParams.id };

    scope.options = {
      autoSelect: true,
      boundaryLinks: false,
      largeEditDialog: false,
      pageSelector: true,
      rowSelection: false
    };

    scope.pagination_labels = pagination_labels;
    scope.query = {
      filter:     $routeParams.q,
      order:      '-created_at',
      limit:      $routeParams.per || 25,
      page:       $routeParams.page || 1,
      options:    [5,10,25,50,100],
      direction:  $routeParams.direction || 'desc'
    };

    scope.onPaginate = function (page, limit) {
      scope.query.page = page;
      scope.query.limit = limit;
      scope.updatePage();
    };

    scope.updatePage = function(item) {
      var hash            = {};
      hash.page           = scope.query.page;
      hash.predicate      = scope.predicate;
      hash.direction      = scope.query.direction;
      hash.per            = scope.query.limit;
      hash.q              = scope.query.filter;
      $location.search(hash);
      scope.init();
    };

    scope.init = function() {
      Version.query({resource_id: $routeParams.id, resource: 'locations'}, function(data) {
        scope.versions = data.versions;
        scope._links   = data._links;
        scope.loading = undefined;
      }, function() {
        scope.loading = undefined;
      });
    };

    scope.init();

  };

  return {
    link: link,
    scope: {
      loading: '='
    },
    templateUrl: 'components/locations/versions/_index.html'
  };

}]);


app.directive('deviceVersions', ['Version', '$routeParams', '$location', 'pagination_labels', function(Version, $routeParams, $location, pagination_labels) {

  var link = function( scope, element, attrs ) {

    scope.options = {
      autoSelect: true,
      boundaryLinks: false,
      largeEditDialog: false,
      pageSelector: false,
      rowSelection: true
    };

    scope.pagination_labels = pagination_labels;
    scope.query = {
      order:      'updated_at',
      limit:      $routeParams.per || 25,
      page:       $routeParams.page || 1,
      options:    [5,10,25,50,100],
      direction:  $routeParams.direction || 'desc'
    };

    scope.onPaginate = function (page, limit) {
      scope.query.page = page;
      scope.query.limit = limit;
      updatePage();
    };

    var updatePage = function(page) {
      var hash            = {};
      hash.page           = scope.query.page;
      hash.per            = scope.query.limit;
      $location.search(hash);
      init();
    };

    var init = function() {
      Version.query({
        resource_id: $routeParams.box_id,
        resource: 'boxes',
        per: scope.query.limit,
        page: scope.query.page
      }).$promise.then(function(results) {
        scope.versions    = results.versions;
        scope.loading     = undefined;
        scope._links      = results._links;
      }, function(err) {
        scope.loading = undefined;
      });

    };

    scope.back = function() {
      window.location.href = '/#/locations/' + $routeParams.id + '/boxes/' + $routeParams.box_id;
    };

    init();

  };

  return {
    link: link,
    scope: {
      loading: '='
    },
    templateUrl: 'components/boxes/versions/_index.html'
  };

}]);

