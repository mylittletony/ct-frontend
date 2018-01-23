'use strict';

var app = angular.module('myApp.bulk_message_activity.directives', []);

app.directive('bulkMessageActivity', ['$routeParams', 'BulkMessageActivity', 'People', '$mdDialog', '$location', function($routeParams,BulkMessageActivity,People,$mdDialog,$location) {

  var link = function( scope, element, attrs ) {

    scope.location = {slug: $routeParams.id};
    scope.person = {slug: $routeParams.person_slug};

    BulkMessageActivity.index({}, {
      location_id:  scope.location.slug,
      start:        $routeParams.start,
      end:          $routeParams.end,
      message_id:   $routeParams.message_id,
      person_id:    $routeParams.person_slug
    }).$promise.then(function(results) {
      scope.loading = undefined;
      scope.activity = results.activity;
    });
    scope.loading = undefined;

  };

  return {
    link: link,
    scope: {
      loading: '='
    },
    templateUrl: 'components/views/bulk_message_activity/_index.html'
  };

}]);
