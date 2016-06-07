'use strict';

var app = angular.module('myApp.guests.directives', []);

app.directive('guestsList', ['Guest', '$routeParams', '$location', '$modal', '$rootScope', function(Guest,$routeParams,$location,$modal, $rootScope) {

  var link = function( scope, element, attrs ) {

    scope.loading       = true;
    scope.page          = $routeParams.page;
    if ($routeParams.splash_page_id) {
      scope.splash = { id: $routeParams.splash_page_id };
    }

    var spid;
    if ($location.search().splash_page_id) {
      spid = $location.search().splash_page_id;
    }

    scope.init = function() {
      Guest.get({page: scope.page, splash_page_id: spid }).$promise.then(function(results) {
        scope.guests        = results.guests;
        scope.fields        = results.fields;
        if ( scope.fields ) {
          scope.fields.push({name: 'created_at'});
        }
        injectFields();
        scope.predicate     = ['-js', '-created_at'];
        scope._links        = results._links;
        scope.splash_pages  = results.splash_pages;
        scope.more          = results.more;
        scope.loading       = undefined;
      }, function(err) {
        scope.loading = undefined;
      });
    };

    scope.updatePage = function(page) {
      var hash          = {};
      scope.page        = scope._links.current_page;
      hash.page         = scope.page;

      $location.search(hash);
      scope.init();
    };

    var injectFields = function() {
      if ( scope.guests === undefined ) {
        scope.guests = [];
      }
      if (scope.guest && scope.guest.length > 25) {
        for (var i = 0; i < 25; i++) { 
          scope.guests.push({username: '●●●●●●●●●●●●●●●●', js: true });
        }
      }
    };

    scope.fakeDownload = function() {
      scope.openModal();
    };

    scope.updateSplash = function() {
      $location.search({splash_page_id: scope.splash.id});
    };

    var modalOpen;

    scope.openModal = function () {
      modalOpen = true;
      scope.modalInstance = $modal.open({
        size: 'md',
        scope: scope,
        resolve: {
          items: function () {
            return scope;
          }
        },
        template:
          '<div>'+
          '<div class="modal-header">'+
          '<h2 class="modal-title">Download your report.</h2>'+
          '<hr>'+
          '</div>'+
          '<div class="modal-body">'+
          '<div ng-show=\'errors\'>'+
          '<p>CSV {{ errors }}</p>'+
          '</div>'+
          '<div ng-show=\'notifications\'>'+
          '<p>Success! Your CSV will be emailed to you shortly.</p>'+
          '<p ng-show=\'notifications\'><a href=\'\' ng-click=\'close()\' class=\'button success\'>Done</a></p>'+
          '</div>'+
          '<div ng-hide=\'errors || notifications\'>'+
          '<p>You can download your guests on paid plans. Please upgrade <a href="/#/plans">here</a>.</p>'+
          // '<form name=\'myForm\' ng-submit=\'createReport()\'>'+
          // '<div class=\'row\'>'+
          // '<div class=\'row\'>'+
          // '<div class=\'small-12 medium-6 columns\'>'+
          // '<label for=\'email\'>Email Address</label>'+
          // '<input type=\'email\' name=\'email\' placeholder=\'Enter an alternative email\' ng-model=\'reports.email\'>'+
          // '<p class="text text-muted small" ng-hide="myForm.$error.email"><b><small>Leave it empty and we\'ll send the csv to you.</small></b></p>'+
          // '<p class="text text-danger small" ng-show="myForm.$error.email"><b><small>That\'s not an email.</small></b></p>'+
          // '<p><button ng-disabled="myForm.$invalid" class="btn btn-primary" id="update">Download</button></p>'+
          // '</div>'+
          // '</div>'+
          // '</form>'+
          // '<p>Download your {{ type }}s as a CSV. It might take a few minutes to prepare. We\'ll email you when it\'s done.</p>'+
          '</div>'+
          '</div>'+
          '<hr>'+
          '<p ng-hide=\'notifications\'><a href=\'\' ng-click=\'close()\' class=\'button alert\'>Cancel</a></p>'+
          '</div>' +
          '</div>'
      });
    };

    scope.close = function() {
      scope.modalInstance.close();
    };

    $rootScope.$on('$routeChangeStart', function (event, next, current) {
      if ( modalOpen === true ) {
        scope.close();
      }
    });

    scope.init();
  };

  return {
    scope: {
    },
    link: link,
    templateUrl: 'components/reports/guests/_index.html'
  };

}]);

app.directive('guestShow', ['Guest', 'Session', '$routeParams', '$location', function(Guest,Session,$routeParams,$location) {

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
      var msg = 'Unregistering a guest will not delete them. Instead, they will see the full registration page next time they login. Please use carefully.';
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

