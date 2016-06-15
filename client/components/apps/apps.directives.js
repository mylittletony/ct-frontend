'use strict';

var app = angular.module('myApp.apps.directives', []);

app.directive('listApps', ['App', '$routeParams', 'menu', function(App, $routeParams, menu) {

  var link = function(scope) {

    menu.isOpen = false;
    menu.hideBurger = true;
    menu.sectionName = 'Developer';

    scope.loading   = true;

    scope.init = function() {
      App.get({}).$promise.then(function(results) {
        scope.apps        = results;
        scope.loading     = undefined;
        scope.predicate   = '-created_at';
      }, function(err) {
        scope.loading = undefined;
      });
    };


    scope.init();

  };

  return {
    link: link,
    scope: {
    },
    templateUrl: 'components/apps/_index.html'
  };

}]);

app.directive('showApp', ['App', '$routeParams', 'menu', function(App, $routeParams, menu) {

  var link = function(scope) {

    menu.isOpen = false;
    menu.hideBurger = true;
    scope.loading   = true;

    var init = function() {
      App.query({id: $routeParams.id}).$promise.then(function(results) {
        scope.app        = results;
        redirectUris();
        scope.loading     = undefined;
      }, function(err) {
        scope.loading = undefined;
      });
    };

    var redirectUris = function() {
      if ( scope.app.redirect_uri !== undefined && scope.app.redirect_uri !== '' ) {
        var uris = scope.app.redirect_uri;
        scope.uris = uris.split('\r\n');
      }
    };

    init();

  };

  return {
    link: link,
    scope: {},
    templateUrl: 'components/apps/_show.html'
  };

}]);

app.directive('editApp', ['App', '$routeParams', '$location', 'menu', 'showErrors', 'showToast', function(App, $routeParams, $location, menu, showErrors, showToast) {

  var link = function(scope) {

    menu.isOpen = false;
    menu.hideBurger = true;

    scope.loading         = true;

    var init = function() {
      App.query({id: $routeParams.id}).$promise.then(function(results) {
        scope.app        = results;
        scope.loading     = undefined;
      }, function(err) {
        scope.loading = undefined;
      });
    };

    var create = function() {
      App.create({app: scope.app}).$promise.then(function(results) {
        $location.path('/apps/' + results.id).search({n: true});
        showToast('Application successfully created');
      }, function(err) {
        showErrors(err);
      });
    };

    var update = function() {
      App.update({id: scope.app.id, app: scope.app}).$promise.then(function(results) {
        $location.path('/apps/' + results.id).search({n: true});
        showToast('Application successfully updated');
      }, function(err) {
        showErrors(err);
      });
    };

    scope.save = function() {
      if (scope.app && scope.app.id) {
        update();
      } else {
        create();
      }
    };
    
    if ($routeParams.id) {
      init();
    }

  };

  return {
    link: link,
    scope: {
    },
    templateUrl: 'components/apps/_new.html'
  };

}]);

