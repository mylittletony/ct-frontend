'use strict';

var app = angular.module('myApp.registrations.directives', []);

app.directive('createHolding', ['Holding', 'locationHelper', '$routeParams', '$cookies', 'menu', function(Holding, locationHelper, $routeParams, $cookies, menu) {

  var link = function( scope, element, attrs ) {

    var domain = locationHelper.domain();

    menu.hideToolbar = false;
    menu.hideBurger = true;
    menu.isOpenLeft = false;
    menu.isOpen = false;

    scope.brand_name = 'Cucumber WiFi';

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
      $cookies.put('_cth', JSON.stringify(scope.cookies), { domain: domain, expires: expires } );
      Holding.create({email: scope.user.email}).$promise.then(function(data) {
      }, function() {
        scope.clearCookies();
      });
    };

    scope.clearCookies = function() {
      scope.cookies = undefined;
      $cookies.remove('_cth', { domain: domain });
    };
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

    scope.loading = true;
    scope.stage = $location.hash();

    var setStage = function(stage) {
      if (stage === 1) {
        $location.hash('brand');
        scope.checkBrand();
      } else if (stage === 2) {
        $location.hash('user');
      } else if (stage === 3) {
        $location.hash('confirm');
      } else if (stage === 'fin') {
        save();
      }
      setHeadings();
    };

    var setHeadings = function() {
      if ($location.hash() === 'done') {
        scope.title = gettextCatalog.getString('Your dashboard is being created.');
        scope.subhead = gettextCatalog.getString('You\'ll be on your way soon, please wait.');
      } else if ($location.hash() === 'brand') {
        scope.title = gettextCatalog.getString('What web address do you want use for your dashboard?');
        scope.subhead = gettextCatalog.getString('This is the address you\'ll use to sign-in.');
      } else if ($location.hash() === 'user') {
        scope.title = gettextCatalog.getString('What should we call you?');
        scope.subhead = gettextCatalog.getString('You can call me Alice. Nice to meet you.');
      } else if ($location.hash() === 'confirm') {
        scope.title = gettextCatalog.getString('Hello. Confirm your choices.');
        scope.subhead = gettextCatalog.getString('You can change all these later if you need.');
      } else if (!scope.creatingAccount) {
        scope.title = gettextCatalog.getString('What do you want to call your first network?');
        scope.subhead = gettextCatalog.getString('This is usually the name of the place you want to install your access points. Something descriptive like \'London Office\' or \'Beach House.\'');
      }
    };

    var cookies = $cookies.get('_cth', { domain: domain });
    if (cookies) {
      scope.holding = JSON.parse(cookies);
    } else {
      scope.holding = {};
    }
    setStage();

    scope.brandName = BrandName;
    if (scope.brandName.name === 'Cucumber WiFi') {
      scope.brandName.name = gettextCatalog.getString('My Awesome Company');
    }

    scope.checkBrand = function(form) {
      scope.invalid_brand = undefined;
      if (scope.holding.url) {
        Brand.query({
          id: scope.holding.url,
          type: 'showcase',
          check: true
        }).$promise.then(function(results) {
          scope.invalid_brand = true;
          showToast(gettextCatalog.getString('This URL has already been take, try another.'));
        }, function() {
          scope.brandOk = true;
        });
      }
    };

    var init = function() {
      Holding.get({id: $routeParams.id}).$promise.then(function(data) {
        scope.loading = undefined;
      }, function(err) {
        $cookies.remove('_cth', { domain: domain });
        $location.path('/create');
      });
    };

    var setCookies = function() {
      var now         = new Date();
      var ts          = now.setDate(now.getDate() + 1);
      var expires     = new Date(ts);
      $cookies.put('_cth', JSON.stringify(scope.user), { domain: domain, expires: expires } );
    };

    scope.update = function(stage) {
      scope.user = scope.holding;
      setCookies();
      setStage(stage);
    };

    var save = function() {
      $location.hash('done');
      scope.creatingAccount = true;
      Holding.update({id: $routeParams.id, holding_account: scope.user, v2: true}).$promise.then(function(data) {
        scope.errors = undefined;

        var timer = $timeout(function() {
          // loadPusher(scope.location.pubsub_token);
          $timeout.cancel(timer);
          scope.switchBrand(data);
        }, 5000);

      }, function(err) {
        showErrors(err);
        scope.updating = undefined;
      });
    };

    scope.switchBrand = function(data) {
      $cookies.put('_cta', data.token, {domain: '.' + domain});
      getMe(data.id);
    };

    var getMe = function(id) {
      Me.get({}).$promise.then(function(res) {
        var search = {};
        var loginArgs = { data: res, search: search };
        var domain = locationHelper.domain();
        Holding.destroy({id: id}).$promise.then(function(data) {
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
