'use strict';

var app = angular.module('myApp.bulk_message_activity.directives', []);

app.directive('bulkMessageActivity', ['$routeParams', 'BulkMessageActivity', 'People', 'Location', '$mdDialog', '$location', function($routeParams,BulkMessageActivity,People, Location,$mdDialog,$location) {

  var link = function( scope, element, attrs ) {

    scope.location = {slug: $routeParams.id};
    scope.person = {id: $routeParams.person_id};
    scope.currentNavItem = 'activity';

    var fetchMessageActivity = function() {
      BulkMessageActivity.index({}, {
        location_id:  scope.location.slug,
        start:        $routeParams.start,
        end:          $routeParams.end,
        message_id:   $routeParams.message_id,
        person_id:    scope.person.id
      }).$promise.then(function(results) {
        scope.loading = undefined;
        scope.activity = results.activity;
      });
    };

    var fetchPerson = function() {
      People.query({}, {
          location_id: scope.location.slug,
          id: $routeParams.person_id
        }).$promise.then(function(res) {
        scope.person = res;
        fetchMessageActivity();
      }, function(err) {
        console.log(err);
      });
      Location.get({id: $routeParams.id}, function(data) {
        scope.location = data;
      }, function(err){
        console.log(err);
      });
    };

    if ($routeParams.person_id) {
      fetchPerson();
      scope.currentNavItem = 'people';
    } else {
      fetchMessageActivity();
    }

  };

  return {
    link: link,
    scope: {
      loading: '='
    },
    templateUrl: 'components/views/bulk_message_activity/_index.html'
  };

}]);
