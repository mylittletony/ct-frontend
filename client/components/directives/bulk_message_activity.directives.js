'use strict';

var app = angular.module('myApp.bulk_message_activity.directives', []);

app.directive('bulkMessageActivity', ['$routeParams', 'BulkMessageActivity', 'People', '$mdDialog', '$location', function($routeParams,BulkMessageActivity,People,$mdDialog,$location) {

  var link = function( scope, element, attrs ) {

    // var person = {};
    //
    // var fetchPerson = function() {
    //   People.query({location_id: $routeParams.id, id: $routeParams.person_id}).$promise.then(function(res) {
    //     person = res;
    //     fetchMessages();
    //   }, function(err) {
    //     console.log(err);
    //   });
    // };
    //
    // var fetchMessages = function() {
    //
    //   BulkMessage.index({}, {
    //     person_id:    person.id || $routeParams.person_id,
    //     location_id:  $routeParams.id,
    //     start:        $routeParams.start,
    //     end:          $routeParams.end
    //   }).$promise.then(function(results) {
    //     scope.loading = undefined;
    //     scope.messages = results.messages;
    //   });
    // };
    //
    // scope.query = function(person_id) {
    //   var hash            = {};
    //   hash.person_id      = person_id;
    //   hash.per            = $routeParams.per || 100;
    //   hash.start          = $routeParams.start;
    //   hash.end            = $routeParams.end;
    //   $location.search(hash);
    //   fetchMessages();
    // };
    //
    // if ($routeParams.person_slug) {
    //   fetchPerson();
    // } else {
    //   fetchMessages();
    // }

    BulkMessageActivity.index({}, {
      location_id:  $routeParams.id,
      start:        $routeParams.start,
      end:          $routeParams.end
    }).$promise.then(function(results) {
      scope.loading = undefined;
      console.log(results)
      scope.activity = results.message_activity;
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
