'use strict';

var app = angular.module('myApp.social.directives', []);

app.directive('showSocial', ['Social', '$routeParams', '$timeout', '$location', 'gettextCatalog', function(Social, $routeParams, $timeout, $location, gettextCatalog) {

  var link = function(scope) {

    scope.page      = $routeParams.page;
    scope.client    = { id: $routeParams.client_id };
    scope.location  = { slug: $routeParams.id };

    var init = function() {
      Social.query({id: $routeParams.social_id}).$promise.then(function(results) {
        scope.social     = results.social;
        scope.clients    = results.clients;
        scope.locations  = results.locations;
        scope.loading    = undefined;
      }, function(err) {
        scope.loading = undefined;
      });
    };

    scope.update = function() {
      scope.social.state = 'updating';
      Social.update({id: $routeParams.id, social: { notes: scope.social.notes }}).$promise.then(function(results) {
        scope.social.notes  = results.social.notes;
        scope.social.state  = 'updated';
      }, function(err) {
        scope.social.errors  = gettextCatalog.getString('There was a problem updating this user.');
        scope.social.state  = undefined;
      });
    };

    scope.back = function() {
      window.location.href = '/#/locations/' + scope.location.slug + '/clients/' + scope.client.id;
    };

    init();

  };

  return {
    link: link,
    scope: {
      loading: '='
    },
    templateUrl: 'components/reports/social/_show.html'
  };

}]);
