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

app.directive('buildFlow', ['Holding', '$routeParams', '$location', '$rootScope', 'BrandName', 'locationHelper', '$cookies', 'menu', 'Me', 'showErrors', 'showToast', 'Brand', 'gettextCatalog','$timeout', function(Holding, $routeParams, $location, $rootScope, BrandName, locationHelper, $cookies, menu, Me, showErrors, showToast, Brand, gettextCatalog, $timeout) {

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
        scope.title = gettextCatalog.getString('Your dashboard is being created.');
        scope.subhead = gettextCatalog.getString('You\'ll be on your way soon, please wait.');
      } else if (scope.stage === 'brand') {
        scope.title = gettextCatalog.getString('What web address do you want for your dashboard?');
        scope.subhead = gettextCatalog.getString('Choose the address you\'ll use to sign-in.');
      } else if (scope.stage === 'user') {
        scope.title = gettextCatalog.getString('What should we call you?');
        scope.subhead = gettextCatalog.getString('You can call me Alice. Nice to meet you.');
      } else if (scope.stage === 'confirm') {
        scope.title = gettextCatalog.getString('Last Stage');
        scope.subhead = gettextCatalog.getString('By clicking create dashboard, you\'re agreeing to our terms of use. You can read these at cucumberwifi.io/terms');
      } else if (!scope.creatingAccount) {
        scope.title = gettextCatalog.getString('What do you want to call your first network?');
        scope.subhead = gettextCatalog.getString('This is usually the name of the place you want to install your access points. Something descriptive like \'London Office\' or \'Beach House.\'');
      }
    };

    setHeadings();

    var setStage = function(stage) {
      scope.stage = stage;
      $location.hash(stage);
      setHeadings();
    };

    var init = function() {
      Holding.get({}, {id: $routeParams.id}).$promise.then(function(data) {
        scope.holding = data;
        scope.loading = undefined;
      }, function(err) {
        $cookies.remove('_cth', { domain: domain });
        $cookies.remove('_cttid', { domain: domain });
        $location.path('/create');
      });
    };

    scope.update = function(stage) {
      scope.stage = stage;
      setStage(stage);
      if (scope.stage === 'done') { scope.holding.finalised = true; }
      save();
    };

    var finalised = function(data) {
      if (scope.holding.finalised) {
        $cookies.put('_cta', data.token, {domain: '.' + domain});
        var timer = $timeout(function() {
          $timeout.cancel(timer);
          getMe(data);
        }, 3000);
      }
    }

    var save = function() {
      Holding.update({}, {
        id: $routeParams.id,
        holding_account: scope.holding
      }).$promise.then(function(data) {
        scope.errors = undefined;
        finalised(data);
      }, function(err) {
        setHeadings();
        showErrors(err);
        scope.updating = undefined;
      });
    };

    var getMe = function(data) {
      Me.get({}).$promise.then(function(res) {
        var search = {};
        var loginArgs = { data: res, search: search, path: '/locations/' + data.location_slug + '/devices'};
        var domain = locationHelper.domain();
        Holding.destroy({id: data.id}).$promise.then(function(data) {
          login(domain, loginArgs);
        }, function() {
          login(domain, loginArgs);
        });
        $rootScope.$broadcast('login', loginArgs);
      });
    };

    var login = function(domain, loginArgs) {
      $cookies.remove('_cth', { domain: domain });
      $rootScope.$broadcast('login', loginArgs);
    };

    scope.back = function() {
      window.history.back();
    };

    init();
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
