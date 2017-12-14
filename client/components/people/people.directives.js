'use strict';

var app = angular.module('myApp.people.directives', []);

app.directive('listPeople', ['People', 'Network', 'Location', '$routeParams', '$mdDialog', 'showToast', 'showErrors', '$q','pagination_labels', 'gettextCatalog', function(People,Network,Location,$routeParams,$mdDialog,showToast,showErrors,$q, pagination_labels, gettextCatalog) {

  var link = function(scope, el, attrs, controller) {

    Location.get({id: $routeParams.id}, function(data) {
      scope.location = data;
    }, function(err){
      console.log(err);
    });

  };

  return {
    link: link,
    scope: {},
    templateUrl: 'components/locations/people/_index.html'
  };

}]);

app.directive('displayPerson', ['Network', 'Location', '$routeParams', '$location', '$http', '$compile', '$rootScope', '$timeout', '$pusher', 'showToast', 'showErrors', 'menu', '$mdDialog', 'gettextCatalog', function(Network, Location, $routeParams, $location, $http, $compile, $rootScope, $timeout, $pusher, showToast, showErrors, menu, $mdDialog, gettextCatalog) {

  var link = function(scope, element, attrs) {

    Location.get({id: $routeParams.id}, function(data) {
      scope.location = data;
    }, function(err){
      console.log(err);
    });

    scope.back = function() {
      window.history.back();
    };

  };

  return {
    link: link,
    scope: {},
    templateUrl: 'components/locations/people/_show.html'
  };

}]);
