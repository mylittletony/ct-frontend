'use strict';

var app = angular.module('myApp.people.directives', []);

app.directive('listPeople', ['People', 'Location', '$routeParams', '$mdDialog', 'showToast', 'showErrors', '$q','pagination_labels', 'gettextCatalog', function(People,Location,$routeParams,$mdDialog,showToast,showErrors,$q, pagination_labels, gettextCatalog) {

  var link = function(scope, el, attrs, controller) {

    scope.currentNavItem = 'people';

    var getPeople = function() {
      People.get({location_id: $routeParams.id}, function(data) {
        scope.people = data.people;
      }, function(err){
        console.log(err);
      });
    };

    var init = function() {
      Location.get({id: $routeParams.id}, function(data) {
        scope.location = data;
        getPeople();
      }, function(err){
        console.log(err);
      });
    };

    init();

  };

  return {
    link: link,
    scope: {},
    templateUrl: 'components/locations/people/_index.html'
  };

}]);

app.directive('displayPerson', ['People', 'Location', '$routeParams', '$location', '$http', '$compile', '$rootScope', '$timeout', '$pusher', 'showToast', 'showErrors', 'menu', '$mdDialog', 'gettextCatalog', function(People, Location, $routeParams, $location, $http, $compile, $rootScope, $timeout, $pusher, showToast, showErrors, menu, $mdDialog, gettextCatalog) {

  var link = function(scope, element, attrs) {

    scope.currentNavItem = 'people';

    var getPerson = function() {
      People.query({location_id: scope.location.slug, id: $routeParams.person_id}).$promise.then(function(res) {
        scope.person = res;
      }, function(err) {
        console.log(err);
      });
    };

    var init = function() {
      Location.get({id: $routeParams.id}, function(data) {
        scope.location = data;
        getPerson();
      }, function(err){
        console.log(err);
      });
    };

    scope.back = function() {
      window.history.back();
    };

    init();

  };

  return {
    link: link,
    scope: {},
    templateUrl: 'components/locations/people/_show.html'
  };

}]);
