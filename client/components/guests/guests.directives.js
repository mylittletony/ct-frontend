'use strict';

var app = angular.module('myApp.guests.directives', []);

app.directive('guestShow', ['Guest', 'Session', '$routeParams', '$location', 'gettextCatalog', function(Guest,Session,$routeParams,$location, gettextCatalog) {

  var link = function( scope, element, attrs ) {

    scope.loading       = true;

    var guestQuery = function() {
      Guest.query({id: $routeParams.id}).$promise.then(function(results) {
        scope.guest          = results;
        scope.loading        = undefined;
        scope.details_loaded = true;
      }, function(err) {
        scope.details_loaded = true;
        scope.loading = undefined;
      });
    };

    scope.unregister = function() {
      var msg = gettextCatalog.getString('Unregistering a guest will not delete them. Instead, they will see the full registration page next time they login. Please use carefully.');
      if ( window.confirm(msg) ) {
        scope.updateGuest(true);
      }
    };

    scope.loadSessions = function() {
      scope.details_loaded = undefined;
      var params = { guest: $routeParams.id };
      if (scope.sessions && scope.sessions.length) {
        scope.notes_loaded = undefined;
        scope.details_loaded = undefined;
        scope.sessions_loaded = true;
      } else {
        Session.query(params).$promise.then(function(results) {
          scope.sessions    = results.sessions;
          scope._stats      = results._stats;
          scope.predicate   = '-starttime';
          scope._links      = results._links;
          scope.notes_loaded = undefined;
          scope.sessions_loaded = true;
        }, function(err) {
          scope.notes_loaded = undefined;
          scope.sessions_loaded = true;
        });
      }
    };

    scope.loadDetails = function() {
      scope.details_loaded  = true;
      scope.sessions_loaded = undefined;
      scope.notes_loaded    = undefined;
    };

    scope.loadNotes = function() {
      scope.details_loaded  = undefined;
      scope.sessions_loaded = undefined;
      scope.notes_loaded    = true;
    };

    scope.updateGuest = function(unregister) {
      var notes;
      if (scope.guest && scope.guest.guest && scope.guest.guest.notes) {
        notes = scope.guest.guest.notes;
      }
      Guest.update({id: $routeParams.id, guest: { notes: notes, unregister: unregister }}).$promise.then(function(results) {
        if (scope.guest) {
          if (scope.guest.notes === undefined) {
            scope.guest.notes = [];
          }
          if (scope.guest.guest && unregister) {
            scope.guest.guest.registered = false;
          }
        }
        if (results && results.notes) {
          scope.guest.notes.push(results.notes);
          scope.guest.guest.notes = undefined;
        }
      }, function(err) {
        scope.errors = true;
        // scope.details_loaded = true;
        // scope.loading = undefined;
      });

    };

    guestQuery();//.then(sessionsQuery);
  };

  return {
    scope: {
    },
    link: link,
    templateUrl: 'components/reports/guests/_show.html'
  };

}]);
