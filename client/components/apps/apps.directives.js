'use strict';

var app = angular.module('myApp.apps.directives', []);

app.directive('listApps', ['App', '$routeParams', function(App, $routeParams) {

  var link = function(scope) {

    scope.loading   = true;

    scope.init = function() {
      App.get({}).$promise.then(function(results) {
        scope.apps        = results;
        scope.loading     = undefined;
        scope.predicate   = '-created_at';
        // scope._links      = results._links;
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
    template:
      '<h1>Cucumber Apps</h1>' +
      '<p>Integration your favourite services with Tony or make your own application.</p>'+
      '<a href=\'/#/apps/new\' class=\'button\'>New Application</a>'+
      '<hr>'+
      '<div class=\'row apps\' ng-repeat=\'app in apps\'>' +
      '<div class=\'small-12 columns\'>' +
      '<div class=\'row\'>' +
      '<div class=\'small-12 medium-1 columns\'>' +
      '<i class="fa fa-rocket fa-3x app-icon"></i>'+
      // '<img src=\'{{ app.icon || "https://abs.twimg.com/a/1404172626/images/oauth_application.png" }}\'>' +
      '</div>'+
      '<div class=\'small-12 medium-11 columns\'>' +
      '<h3><a href=\'/#/apps/{{ app.id }}\'>{{ app.name }}</a></h3>' +
      '<p>{{ app.description }}</p>'+
      '<p>{{ app.created_at | humanTime }}</p>'+
      '</div>'+
      '</div>'+
      '</div>'+
      '</div>'

  };

}]);

app.directive('showApp', ['App', '$routeParams', function(App, $routeParams) {

  var link = function(scope) {

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

app.directive('editApp', ['App', '$routeParams', '$location', 'Notification', function(App, $routeParams, $location, Notification) {

  var link = function(scope) {

    scope.notificationMsg = Notification;
    scope.loading         = true;

    scope.init = function() {
      App.query({id: $routeParams.id}).$promise.then(function(results) {
        scope.app        = results;
        scope.loading     = undefined;
      }, function(err) {
        scope.loading = undefined;
      });
    };

    scope.create = function() {
      App.create({app: scope.app}).$promise.then(function(results) {
        $location.path('/apps/' + results.id).search({n: true});
        scope.notificationMsg.msg = 'Application created';
        scope.notificationMsg.err = undefined;
      }, function(err) {
        if ( err.data && err.data.message ) {
          formatErrors(err.data.message);
        }
      });

    };

    scope.update = function() {
      App.update({id: $routeParams.id, app: scope.app}).$promise.then(function(results) {
        $location.path('/apps/' + results.id).search({n: true});
        scope.notificationMsg.msg = 'Application updated';
        scope.notificationMsg.err = undefined;
      }, function(err) {
        if ( err.data && err.data.message ) {
          formatErrors(err.data.message);
        }
      });

    };

    scope.save = function() {
      if (scope.app && scope.app.id) {
        scope.update();
      } else {
        scope.create();
      }
    };

    function formatErrors(res) {
      var errors    = [];
      var keys      = Object.keys(res);
      angular.forEach(keys, function(v,k) {
        errors.push(v.split('_').join(' ')  + ' ' + res[v]);
      });
      scope.notificationMsg.msg = errors[0];
      scope.notificationMsg.err = true;
    }
    if ($routeParams.id) {
      scope.init();
    }

  };

  return {
    link: link,
    scope: {
    },
    template:
      '<h1>{{ scope.app.id ? "Edit" : "Create" }} App</h1>' +
      '<p>This is for developers. If you\'re not sure what an API is, it\'s best you forget this exists. <br>Developer documentation can be <a href=\'http://docs.polkaspots.apiary.io/#\'>found here</a>.</p>'+
      '<div>' +
      '<form name=\'myForm\' ng-submit=\'save()\'>' +
      '<div class=\'row\'>'+
      '<div class=\'small-12 medium-6 columns\'>'+
      '<label for=\'name\'>Application Name</label>'+
      '<input type=\'text\' ng-model=\'app.name\' ng-class="{ \'input-error\' : myForm.name.$error.required || myForm.name.$error.maxlength }" name=\'name\' placeholder=\'Your application name\' ng-maxlength=32 ng-minlength=5 required>'+
      '<p ng-show=\'myForm.name.$error.maxlength || myForm.name.$error.minlength\'><small>Min 5 and max 32 characters.</small></p>'+
      '<p ng-hide=\'myForm.name.$error.maxlength\' class=\'text-muted\'><small>This will be used on any user-facing authorisation screens. Max 32 characters.</small></p>'+
      '</div>'+
      '</div>'+
      '<div class=\'row\'>'+
      '<div class=\'small-12 medium-6 columns\'>'+
      '<label for=\'name\'>Callback URL</label>'+
      '<input type=\'url\' ng-model=\'app.redirect_uri\' ng-class="{ \'input-error\' : myForm.redirect_uri.$error.required || myForm.redirect_uri.$error.url }" name=\'redirect_uri\' placeholder=\'Your callback URL\' required>'+
      '<p ng-hide=\'myForm.name.$error.maxlength\' class=\'text-muted\'><small>Where should we return to after a successful authentication. Must be https.</small></p>'+
      '</div>'+
      '</div>'+
      '<div class=\'row\'>'+
      '<div class=\'small-12 medium-6 columns\'>'+
      '<label for=\'name\'>Application Website</label>'+
      '<input type=\'url\' ng-model=\'app.website\' ng-class="{ \'input-error\' : myForm.website.$error.required || myForm.website.$error.url }" name=\'website\' placeholder=\'Your website\' required>'+
      '<p class=\'text-muted\'><small>Your publicly available website where your users will go to find out about your application.</small></p>'+
      '</div>'+
      '</div>'+
      '<div class=\'row\'>'+
      '<div class=\'small-12 medium-6 columns\'>'+
      '<label for=\'name\'>Description</label>'+
      '<textarea ng-model=\'app.description\' ng-class="{ \'input-error\' : myForm.description.$error.required }" name=\'description\' placeholder=\'Tell us about your App\' rows=5 required></textarea>'+
      '<p class=\'text-muted\'><small>This won\'t be available to your users, it\'s just so we know what you\'re building</small></p>'+
      '</div>'+
      '</div>'+
      '<button ng-disabled="myForm.$invalid || myForm.$pristine" class="button" id="update">{{ app.id ? "Update" : "Create" }} <span ng-show="creating"> <i class="fa fa-cog fa-spin"></i></span> <span ng-show="created"> <i class="fa fa-check"></i></span><span ng-show="errors"> <i class="fa fa-frown"></i></span></button>'+
      '</form>'+
      '<p>By creating this application, you are agreeing to the developer agreement found <a href="https://cucumberwifi.io/developer-terms" target="_blank">here</a>.</p>'+
      '</div>'

  };

}]);

