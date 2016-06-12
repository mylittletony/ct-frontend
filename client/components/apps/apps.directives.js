'use strict';

var app = angular.module('myApp.apps.directives', []);

app.directive('listApps', ['App', '$routeParams', 'menu', function(App, $routeParams, menu) {

  var link = function(scope) {

    menu.isOpen = false;
    menu.hideBurger = true;

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
    scope.appId     = '●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●';
    scope.appSecret = '●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●';

    scope.init = function() {
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

    scope.showAppId = function() {
      scope.showId = !scope.showId;
      scope.appId = scope.showId ? scope.app.uid : '●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●';
    };

    scope.showAppSecret = function() {
      scope.showSecret = !scope.showSecret;
      scope.appSecret = scope.showSecret ? scope.app.secret : '●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●';
    };


    scope.init();

  };

  return {
    link: link,
    scope: {
    },
    template:
      '<h1>{{ app.name }}</h1>'+
      '<h4>{{ app.description || "No description" }}</h4>'+
      '<hr>'+
      '<h3>Scopes</h3>'+
      '<p>{{ app.scopes.length ? app.scopes : \'None\' }}</p>'+
      '<hr>'+
      '<ul class="no-bullet">'+
      '<h3>Callback URLs:</h3>'+
      '<ul ng-repeat=\'a in uris\'>'+
      '<li ng-if=\'a\'>{{ a }}</li>'+
      '</ul>'+
      '<hr>'+
      '<h3>Application URLs:</h3>'+
      '<ul>'+
      '<li>https://id.ctapp.io/oauth/authorize</li>'+
      '<li>https://id.ctapp.io/oauth/token</li>'+
      '<li>https://id.ctapp.io/oauth/revoke</li>'+
      '</ul>'+
      '<hr>'+
      '<h3>Credentials</h3>'+
      '<div class=\'row\'>' +
      '<div class=\'small-12 medium-7 columns\'>' +
      '<label>App ID <a ng-click=\'showAppId()\'>({{ showId ? "Hide" : "Show" }})</a></label>'+
      '<input ng-disabled=\'true\' type=\'text\' ng-model="appId"></input></li>'+
      '</div>'+
      '</div>'+
      '<div class=\'row\'>' +
      '<div class=\'small-12 medium-7 columns\'>' +
      '<label>App Secret <a ng-click=\'showAppSecret()\'>({{ showSecret ? "Hide" : "Show" }})</a></label>'+
      '<input ng-disabled=\'true\' type=\'text\' ng-model="appSecret"></input></li>'+
      '</div>'+
      '</div>'+
      '<hr>'+
      '<div class=\'row\'>' +
      '<div class=\'small-12 medium-7 columns\'>' +
      '<a href=\'/#/apps/{{app.id}}/edit\' class=\'button\'>Edit</a>'+
      '</div>'+
      '</div>'+
      '</ul>'+
      '</div>'

  };

}]);

app.directive('editApp', ['App', '$routeParams', '$location', 'menu', 'showErrors', function(App, $routeParams, $location, menu, showErrors) {

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
      }, function(err) {
        showErrors(err);
      });
    };

    var update = function() {
      // App.update({id: $routeParams.id, app: scope.app}).$promise.then(function(results) {
      //   $location.path('/apps/' + results.id).search({n: true});
      // }, function(err) {
      //   if ( err.data && err.data.message ) {
      //     formatErrors(err.data.message);
      //   }
      // });
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

