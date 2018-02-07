'use strict';

var app = angular.module('myApp.registrations.directives', []);

app.directive('createHolding', ['Holding', 'User', 'locationHelper', '$routeParams', '$location', '$cookies', 'menu', 'gettextCatalog', function(Holding, User, locationHelper, $routeParams, $location, $cookies, menu, gettextCatalog) {

  var link = function( scope, element, attrs ) {

    var domain = locationHelper.domain();
    var subdomain = locationHelper.subdomain();
    scope.loading = true;

    menu.hideToolbar = false;
    menu.hideBurger = true;
    menu.isOpenLeft = false;
    menu.isOpen = false;

    scope.brand_name = 'MIMO';
    scope.user = {};

    var cookies = $cookies.get('_cth', { domain: domain });
    if (cookies) {
      scope.cookies = JSON.parse(cookies);
    }

    scope.create = function() {
      var c = $cookies.get('_cth');
      if (c) {
        console.log('Preventing dup');
        return;
      }

      scope.invited   = true;
      scope.cookies   = { d: new Date().getTime(), u: scope.user };
      var now         = new Date();
      var ts          = now.setDate(now.getDate() + 1);
      var expires     = new Date(ts);
      var holding_account = {};
      holding_account.email = scope.user.email;
      $cookies.put('_cth', JSON.stringify(scope.cookies), { domain: domain, expires: expires } );
      Holding.create({},holding_account).$promise.then(function(data) {
      }, function() {
        scope.clearCookies();
      });
    };

    scope.clearCookies = function() {
      $location.search({});
      scope.loaded = true;
      scope.email = undefined;
      scope.loading = undefined;
      scope.cookies = undefined;
      $cookies.remove('_cth', { domain: domain });
    };

    if ($routeParams.email) {
      scope.email = true;
      scope.user.email = $routeParams.email;
      scope.create();
    } else {
      scope.loading = undefined;
      scope.loaded = true;
    }

  };

  return {
    link: link,
    scope: {},
    templateUrl: 'components/registrations/_create.html'
  };

}]);

app.directive('buildFlow', ['Holding', '$routeParams', '$location', '$rootScope', 'locationHelper', '$cookies', 'menu', 'Me', 'showErrors', 'showToast', 'gettextCatalog','$timeout', function(Holding, $routeParams, $location, $rootScope, locationHelper, $cookies, menu, Me, showErrors, showToast, gettextCatalog, $timeout) {

  var link = function( scope, element, attrs ) {

    var domain = locationHelper.domain();

    menu.hideToolbar = false;
    menu.hideBurger = true;
    menu.isOpenLeft = false;
    menu.isOpen = false;

    scope.stage = $location.hash();
    scope.loading = true;

    var setHeadings = function() {
      if (scope.stage === 'done') {
        scope.title = gettextCatalog.getString('The elves are making your MIMO dashboard.');
        scope.subhead = gettextCatalog.getString('Dance like nobody\'s watching you. Sing a little too.');
      } else if (scope.stage === 'user') {
        scope.title = gettextCatalog.getString('Step 2 - what\'s your name?');
        scope.subhead = gettextCatalog.getString('It\'s a pleasure to meet you!');
      } else if (scope.stage === 'confirm') {
        scope.title = gettextCatalog.getString('Step 3 - nearly done, phew!');
        scope.subhead = gettextCatalog.getString('By signing-up, you\'re agreeing to our terms of use. Read these at oh-mimo.com/terms');
      } else if (!scope.creatingAccount) {
        scope.title = gettextCatalog.getString('Step 1 (of 3) - create a location');
        scope.subhead = gettextCatalog.getString('MIMO organises everything into locations. Each location can have multiple access points. It\'s really quite simple. Go ahead and create your first one.');
      }
    };

    setHeadings();

    var login = function(domain, loginArgs) {
      $cookies.remove('_cth', { domain: domain });
      $cookies.remove('_cttid', { domain: domain });
      $rootScope.$broadcast('login', loginArgs);
    };

    var getMe = function(data) {
      Me.get({}).$promise.then(function(res) {
        var search = {};
        var loginArgs = { data: res, search: search, path: '/' + data.location_slug + '/guide'};

        var domain = locationHelper.domain();
        Holding.destroy({}, {
          id: scope.holding.token
        }).$promise.then(function(data) {
          login(domain, loginArgs);
        }, function() {
          login(domain, loginArgs);
        });
        $rootScope.$broadcast('login', loginArgs);
      });
    };

    var finalise = function(data) {
      if (scope.holding.finalised) {
        $cookies.put('_mta', data.token, {domain: '.' + domain});
        var timer = $timeout(function() {
          $timeout.cancel(timer);
          getMe(data);
        }, 3000);
      }
    };

    var save = function() {
      Holding.update({}, {
        id: $routeParams.id,
        holding_account: scope.holding
      }).$promise.then(function(data) {
        scope.errors = undefined;
        finalise(data);
      }, function(err) {
        setHeadings();
        showErrors(err);
        scope.updating = undefined;
      });
    };

    var setStage = function() {
      $location.hash(scope.stage);
      setHeadings();
    };

    var init = function(clientID) {
      Holding.get({}, {
        id: $routeParams.id,
        client_id: clientID
      }).$promise.then(function(results) {
        scope.holding = results;
        scope.loading = undefined;
      }, function(err) {
        $cookies.remove('_cth', { domain: domain });
        $cookies.remove('_cttid', { domain: domain });
        $location.path('/create');
      });
    };

    scope.update = function(stage) {
      scope.stage = stage;
      setStage();
      if (scope.stage === 'done') { scope.holding.finalised = true; }
      save();
    };

    scope.back = function() {
      window.history.back();
    };

    var getGA = function() {
      var clientID = $cookies.get('_ga');
      init(clientID);
    };

    if (!scope.holding) {
      let timer = $timeout(function() {
        $timeout.cancel(timer);
        getGA();
      }, 500);
    }
  };

  return {
    link: link,
    scope: {},
    templateUrl: 'components/registrations/_flow.html'
  };

}]);

app.directive('successSignup', ['Holding', '$routeParams', '$location', function(Holding, $routeParams, $location) {

  var link = function( scope, element, attrs ) {

  };

  return {
    link: link,
    scope: {}
  };

}]);
