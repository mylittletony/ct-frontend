'use strict';

var app = angular.module('myApp.registrations.directives', []);

app.directive('createHolding', ['Holding', 'User', 'Brand', 'locationHelper', '$routeParams', '$location', '$cookies', 'menu', 'gettextCatalog', function(Holding, User, Brand, locationHelper, $routeParams, $location, $cookies, menu, gettextCatalog) {

  var link = function( scope, element, attrs ) {

    var domain = locationHelper.domain();
    var subdomain = locationHelper.subdomain();
    scope.loading = true;

    menu.hideToolbar = false;
    menu.hideBurger = true;
    menu.isOpenLeft = false;
    menu.isOpen = false;

    scope.brand_name = 'CT WiFi';
    scope.user = {};

    var brandCheck = function(id,cname) {
      Brand.query({
        id: id,
        type: 'showcase',
        cname: cname
      }).$promise.then(function(results) {
        if (results.reseller) {
          scope.brand = results;
        }
      }, function() {
      });
    };

    if (domain !== 'ctapp.io' && domain !== 'ctapp.test') {
      var cname;
      if (subdomain) {
        cname = subdomain + '.' + domain;
      } else {
        cname = domain;
      }
      brandCheck(cname, true);
    } else if (subdomain !== 'my' && subdomain !== 'dashboard') {
      brandCheck(subdomain);
    }

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
      if (scope.brand) {
        holding_account.brand = scope.brand.id;
      }
      $cookies.put('_cth', JSON.stringify(scope.cookies), { domain: domain, expires: expires } );
      Holding.create({},holding_account).$promise.then(function(data) {
      }, function() {
        scope.clearCookies();
      });
    };

    scope.clearCookies = function() {
      $location.search({});
      scope.loaded    = true;
      scope.email     = undefined;
      scope.loading   = undefined;
      scope.cookies   = undefined;
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

    scope.data = { cb1: true };
    scope.loading = true;

    var login = function(domain, loginArgs) {
      $cookies.remove('_cth', { domain: domain });
      $cookies.remove('_cttid', { domain: domain });
      $rootScope.$broadcast('login', loginArgs);
    };

    var getMe = function(data) {
      Me.get({}).$promise.then(function(res) {
        var search = {};
        var loginArgs = { data: res, search: search, path: '/locations/' + data.location_slug};
        var domain = locationHelper.domain();
        login(domain, loginArgs);
        $rootScope.$broadcast('login', loginArgs);
      });
    };

    var finalise = function(data) {
      var timer = $timeout(function() {
        $timeout.cancel(timer);
        getMe(data);
      }, 1000);
    };

    var fin = function(data) {
      for (var i = 1; i <= 4; i++) {
        setTimeout(function(x) { return function() {
          scope.data['cb' + x] = true;
          scope.$apply();
          if (x === 4) {
            finalise(data);
          }
        }; }(i), (1250)*(i));
      }
    };

    var save = function() {
      if (!scope.holding.username) {
        scope.holding.username = scope.holding.email;
      }
      Holding.update({}, {
        id: $routeParams.id,
        holding_account: scope.holding
      }).$promise.then(function(data) {
        $cookies.put('_cta', data.token, {domain: '.' + domain});
        scope.errors = undefined;
        fin(data);
      }, function(err) {
        showErrors(err);
        scope.updating = undefined;
      });
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
      scope.finalised = true;
      save();
    };

    var getGA = function() {
      var clientID = $cookies.get('_ga');
      init(clientID);
    };

    getGA();
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
