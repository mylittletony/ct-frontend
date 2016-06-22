'use strict';

var app = angular.module('myApp.registrations.directives', []);

app.directive('registerUser', ['Registration', 'Auth', 'Invite', '$routeParams', '$rootScope', 'CTLogin', function(Reg, Auth, Invite, $routeParams, $rootScope, CTLogin) {

  var link = function( scope, element, attrs ) {

    scope.ct_login              = CTLogin;
    scope.ct_login.class_name   = 'ct-login';
    scope.ct_login.active       = 'true';

    function validateToken(token) {
      Invite.query({invite_token: token}).$promise.then(function(data) {
        scope.user = { email: data.email };
        scope.invite = scope.user.email;
        scope.checking = undefined;
      }, function() {
        scope.inviteerrors = true;
        scope.checking = undefined;
      });
    }

    if ($routeParams.invite_token !== undefined) {
      scope.invite_token = $routeParams.invite_token;
      validateToken(scope.invite_token);
      scope.checking = true;
    } else if ( $routeParams.customer_token !== undefined ) {
      scope.customer_token = $routeParams.customer_token;
    }

    scope.register = function(user) {
      scope.creating = true;
      user.invite_token   = scope.invite_token;
      user.customer_token = scope.customer_token;
      Reg.create({user: user}).$promise.then(function(data) {
        scope.creating = undefined;
        doLogin(data);
      }, function(err) {
        formatErrors(err.data);
      });

    };

    function doLogin(user) {
      var path = '/';
      var search = {newinvite: true};
      var loginEvent = 'login';
      var loginArgs = {data: user, path: path, search: search};
      $rootScope.$broadcast(loginEvent, loginArgs);
    }

    function formatErrors(res) {
      var errors    = [];
      var keys      = Object.keys(res);
      angular.forEach(keys, function(v,k) {
        errors.push(v.split('_').join(' ')  + ' ' + res[v]);
      });
      scope.errors    = errors;
      scope.creating  = undefined;
    }

  };

  return {
    link: link,
    scope: {},
    template:
      '<div ng-hide=\'\'>'+
      '<div ng-show=\'checking\'>'+
      '<p>One second, we\'re validating your token</p>'+
      '</div>'+
      '<div ng-hide=\'checking\'>'+
      '<div ng-show=\'errors\' class=\'alert-box alert\'>'+
      '<span ng-repeat=\'error in errors\'>'+
      '{{ error }}<br>'+
      '</span>'+
      '</div>'+
      '<div ng-hide=\'invite\'>' +
      'Konnichiwa.<br><br>You\'ve just been invited to manage a network however <b>the invitation token has expired</b>. <br><br>You should contact the person who invited you. <br>Or, <a href=\'/#/create\'>sign-up now</a>..<br><br>'+
      '</div>'+
      '<div ng-show=\'invite\'>'+
      '<form ng-submit=\'register(user)\' name=\'myForm\'>'+
      'Konnichiwa. You\'ve just been invited to manage a network. <br><br>Please create an account and we\'ll send you on your way.<br><br>'+
      '<div class=\'row\' ng-hide=\'invite\'>'+
      '<div class=\'small-12 medium-10 columns medium-centered\'>'+
      '<label>Enter your email address</label>'+
      '<input type=\'email\' ng-model=\'user.email\' name=\'email\' placeholder="What\'s your email" autofocus required></input>' +
      '<p class="text text-danger" ng-show="myForm.email.$error.email"><small>Please enter a valid email.</small></p>'+
      '</div>'+
      '</div>'+
      '<div class=\'row\'>'+
      '<div class=\'small-12 medium-10 columns medium-centered\'>'+
      '<label>Choose a memorable username</label>'+
      '<input type=\'text\' ng-model=\'user.username\' name=\'username\' placeholder=\'Username\' autofocus required></input>' +
      '<p class="text text-danger" ng-show="myForm.username.$error.required"><small>Please choose a username.</small></p>'+
      '</div>'+
      '</div>'+
      '<div class=\'row\'>'+
      '<div class=\'small-12 medium-10 columns medium-centered\'>'+
      '<label>And set a decent, strong password.</label>'+
      '<input type=\'password\' ng-model=\'user.password\' placeholder=\'What is the password?\' name=\'password\' ng-minlength=\'8\' required></input>' +
      '<p class="text text-danger" ng-show="myForm.password.$error.minlength"><small>Must be more than 8 characters.</small></p>'+
      '</div>'+
      '</div>'+
      '<p><button ng-disabled="myForm.$invalid || myForm.$pristine" class="button" id="update">Register <span ng-show="creating"> <i class="fa fa-spinner fa-spin"></i></span></button></p>' +
      '</div>'+
      '</div>'+
      '</div>'
  };

}]);

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

app.directive('buildFlow', ['Holding', '$routeParams', '$location', '$rootScope', 'BrandName', 'locationHelper', '$cookies', 'menu', 'Me', 'showErrors', 'showToast', 'Brand', function(Holding, $routeParams, $location, $rootScope, BrandName, locationHelper, $cookies, menu, Me, showErrors, showToast, Brand) {

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
        scope.title = 'Your dashboard is being created.';
        scope.subhead = 'You\'ll be on your way soon, please wait.';
      } else if ($location.hash() === 'brand') {
        scope.title = 'What web address do you want use for your dashboard?';
        scope.subhead = 'This is the address you\'ll use to sign-in.';
      } else if ($location.hash() === 'user') {
        scope.title = 'What should we call you?';
        scope.subhead = 'You can call me Alice. Nice to meet you.';
      } else if ($location.hash() === 'confirm') {
        scope.title = 'Hello. Confirm your choices.';
        scope.subhead = 'You can change all these later if you need.';
      } else if (!scope.creatingAccount) {
        scope.title = 'What do you want to call your first network?';
        scope.subhead = 'This is usually the name of the place you want to install your access points. Something descriptive like \'London Office\' or \'Beach House.\'';
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
      scope.brandName.name = 'My Awesome Company';
    }

    scope.checkBrand = function(form) {
      if (scope.holding.url) {
        Brand.query({
          id: scope.holding.url
        }).$promise.then(function(results) {
          showToast('This URL has already been take, try another.');
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
        scope.switchBrand(data);
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
