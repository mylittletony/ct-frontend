'use strict';

var app = angular.module('myApp.users.directives', []);

app.directive('userAvatar', [function() {
  return {
    replace: true,
    template: '<md-icon><img class=\'user-avatar\' src="https://www.gravatar.com/avatar/{{user.gravatar}}?s=25" ng-if=\'user.gravatar\'></img><span ng-if=\'!user.gravatar\'>face</span></md-icon>'
  };
}]);

app.directive('showUser', ['User', '$routeParams', '$location', 'Auth', 'showToast', 'showErrors', '$mdDialog', '$route', function(User, $routeParams, $location, Auth, showToast, showErrors, $mdDialog, $route) {

  var link = function( scope, element, attrs ) {

    var id, locale;

    scope.locales = [{key: 'Deutsche', value: 'de-de'}, { key: 'English', value: 'en-gb'}, { key: 'Français', value: 'fr-fr'}, {key: 'Italiano', value: 'it'}, { key: 'Română', value: 'ro' }];

    if ($location.path() === '/me' || Auth.currentUser().slug === $routeParams.id) {
      id = Auth.currentUser().slug;
    } else {
      id = $routeParams.id;
    }

    var init = function() {
      User.query({id: id}).$promise.then(function (res) {
        scope.user = res;
        locale = res.locale;
        if (scope.user.slug === Auth.currentUser().slug) {
          scope.user.allowed = true;
        }
        if (scope.user.role_id === 1 || scope.user.role_id === 2 || scope.user.role_id === 3) {
          scope.user.admin = true;
        }
        scope.loading = undefined;
      });
    };

    scope.update = function(form) {
      form.$setPristine();
      User.update({id: scope.user.slug, user: scope.user}).$promise.then(function(results) {
        if (locale !== results.locale) {
          // $route.reload();
          console.log('Hey Guido and friends, I\'ll put a reload in here when we\'re ready.');
          Auth.currentUser().locale = results.locale;
        }
        showToast('User successfully updated.');
      }, function(err) {
        showErrors(err);
      });
    };

    init();


  };

  return {
    link: link,
    scope: {
      loading: '='
    },
    templateUrl: 'components/users/show/_index.html'
  };

}]);

app.directive('userBilling', ['User', '$routeParams', '$location', 'Auth', 'showToast', 'showErrors', '$mdDialog', function(User, $routeParams, $location, Auth, showToast, showErrors, $mdDialog) {

  var link = function( scope, element, attrs ) {

    scope.currencies = { 'US Dollars' : 'USD', 'UK Pounds': 'GBP', 'EUR': 'Euros' };

    var init = function() {
      User.query({id: $routeParams.id}).$promise.then(function (res) {
        scope.user = res;
        if (scope.user.slug === Auth.currentUser().slug) {
          scope.user.allowed = true;
        }
        if (scope.user.role_id === 1 || scope.user.role_id === 2 || scope.user.role_id === 3) {
          scope.user.admin = true;
        }
        scope.loading = undefined;
      });
    };

    scope.save = function(form) {
      form.$setPristine();
      User.update({id: scope.user.slug, user: scope.user}).$promise.then(function(results) {
        showToast('User successfully updated.');
      }, function(err) {
        showErrors(err);
      });
    };

    init();


  };

  return {
    link: link,
    scope: {
      loading: '='
    },
    templateUrl: 'components/users/billing/_index.html'
  };

}]);

app.directive('userCoupon', ['User', '$routeParams', '$location', '$pusher', 'showToast', 'showErrors', '$rootScope', '$route', '$mdDialog', function(User, $routeParams, $location, $pusher, showToast, showErrors, $rootScope, $route, $mdDialog) {

  var link = function( scope, element, attrs ) {

    scope.user = { slug: $routeParams.id };

    scope.addCoupon = function() {
      $mdDialog.show({
        templateUrl: 'components/users/billing/_coupon.html',
        parent: angular.element(document.body),
        controller: DialogController,
        clickOutsideToClose: true,
        locals: {
          user: scope.user
        }
      });
    };

    function DialogController ($scope, user) {
      $scope.user = user;
      $scope.save = function() {
        $mdDialog.cancel();
        save();
      };
      $scope.close = function() {
        $mdDialog.cancel();
      };
    }
    DialogController.$inject = ['$scope', 'user'];

    var save = function(user) {
      User.update({id: scope.user.slug, user: scope.user}).$promise.then(function(results) {
        scope.user.coupon_code = undefined;
        scope.user.adding_coupon = results.adding_coupon;
      }, function(err) {
        showErrors(err);
      });
    };

    var channel;

    function loadPusher(key) {
      if (typeof client !== 'undefined' && scope.pusherLoaded === undefined) {
        scope.pusherLoaded = true;
        var pusher = $pusher(client);
        channel = pusher.subscribe('private-' + key);
        channel.bind('users_general', function(data) {
          var msg;
          try{
            msg = JSON.parse(data.message);
          } catch(e) {
            msg = data.message;
          }

          scope.user.adding_coupon = undefined;
          if (msg.status === false || msg.status === 'false') {
            showErrors(msg.message);
          } else if (msg.status) {
            scope.coupons.push(msg.coupon);
            showToast('Coupon added successfully.');
          }

        });
      }
    }

    attrs.$observe('key', function(val){
      if (val !== '' && !channel ) {
        loadPusher(attrs.key);
      }
    });

    $rootScope.$on('$routeChangeStart', function (event, next, current) {
      if (channel) {
        channel.unbind();
      }
    });

  };

  return {
    link: link,
    scope: {
      coupons: '=',
      key: '@'
    },
    template:
        '<form name=\'myForm\' ng-submit=\'save(myForm)\'>'+
        '<md-card>'+
        '<md-card-title>'+
        '<md-card-title-text>'+
        '<span class="md-headline">'+
        'Coupons & Discount Codes'+
        '</span>'+
        '</md-card-title-text>'+
        '</md-card-title>'+
        '<md-card-content>'+
        '<div layout="row" layout-wrap>'+
        '<span ng-if="user.adding_coupon" flex=\'100\' flex-gt-sm=\'100\'>'+
        '<p>Verifying Coupon</p>'+
        '<md-progress-linear md-mode="query"></md-progress-linear>'+
        '</span>'+
        '<div flex=\'100\' flex-gt-sm=\'100\'>'+
        '<md-list-item class="md-2-line" ng-repeat=\'coupon in coupons\' ng-if=\'coupons.length > 0\'>'+
        '<div class="md-list-item-text">'+
        '<p>{{ ::coupon.percent_off }}% off valid until {{ coupon.redeem_by | humanTime }}</p>'+
        '</div>'+
        '</md-list-item>'+
        '<p ng-if=\'coupons.length < 1\'>No active coupons found.</p>'+
        '</div>'+
        '</div>'+
        '</md-card-content>'+
        '<md-card-actions layout="row" layout-align="end center">'+
        '<md-button ng-disabled="user.adding_coupon" ng-click="addCoupon()">ADD COUPON</md-button>'+
        '</md-card-actions>'+
        '</md-card>'+
        '</form>'
  };

}]);

app.directive('userCreditCard', ['User', '$routeParams', 'showToast', 'showErrors', '$rootScope', '$route', '$mdDialog', 'STRIPE_KEY', '$pusher', function(User, $routeParams, showToast, showErrors, $rootScope, $route, $mdDialog, STRIPE_KEY, $pusher) {

  var link = function( scope, element, attrs ) {

    scope.addCard = function() {
      $mdDialog.show({
        templateUrl: 'components/users/billing/_card.html',
        parent: angular.element(document.body),
        controller: DialogController,
        clickOutsideToClose: true
      });
    };

    function DialogController ($scope) {
      $scope.stripeCallback = function (code, result) {
        if (result.error) {
          showErrors({data: result.error.message});
        } else {
          $mdDialog.cancel();
          scope.user.card = result.id;
          save();
        }
      };

      $scope.close = function() {
        $mdDialog.cancel();
      };
    }
    DialogController.$inject = ['$scope'];

    var save = function() {
      User.update({id: scope.user.slug, user: scope.user}).$promise.then(function(results) {
        scope.user.subscribing = true;
      }, function(err) {
        showErrors(err);
      });
    };

    var subscribe = function(key) {
      if (typeof client !== 'undefined') {
        var pusher = $pusher(client);
        if (key) {
          var channel = pusher.subscribe(key);
          channel.bind('card_added', function(data) {
            if (data.message.success === true) {
              scope.user.credit_card_last4 = data.message.credit_card_last4;
              scope.user.credit_card_exp_month = data.credit_card_exp_month;
              scope.user.credit_card_exp_year = data.message.credit_card_exp_year;
              scope.user.stripe_id = true;
              showToast(data.message.msg);
            } else {
              console.log(data);
            }
            scope.user.subscribing = undefined;
          });
        }
      }
    };

    if (STRIPE_KEY && window.Stripe) {
      console.log('Setting Stripe Token');
      window.Stripe.setPublishableKey(STRIPE_KEY);
    } else {
      console.log('Could not set stripe token');
    }

    scope.$watch('user',function(nv){
      if (nv !== undefined) {
        subscribe(scope.user.key);
      }
    });

  };

  return {
    link: link,
    scope: {
      user: '='
    },
    template:
        '<div ng-if=\'user.subscribing\'>'+
        '<p>Updating, please wait.</p>'+
        '<md-progress-linear md-mode="query"></md-progress-linear>'+
        '</div>'+
        '<div ng-if=\'!user.subscribing\'>'+
        '<md-button class=\'{{ user.credit_card_last4 ? "" : "md-raised md-primary" }}\' ng-disabled="" ng-click="addCard()">{{ user.credit_card_last4 ? "update" : "add" }} CARD</md-button>'+
        '</div>'
  };

}]);

app.directive('userInvoices', ['User', '$routeParams', 'showToast', 'showErrors', 'Invoice', '$mdDialog', '$location', function(User, $routeParams, showToast, showErrors, Invoice, $mdDialog, $location) {

  var link = function( scope, element, attrs ) {

    scope.selected = [];
    var user = { slug: $routeParams.id };

    scope.options = {
      autoSelect: true,
      boundaryLinks: false,
      largeEditDialog: false,
      pageSelector: false,
      rowSelection: true
    };

    scope.query = {
      order:      'updated_at',
      limit:      $routeParams.per || 25,
      page:       $routeParams.page || 1,
      options:    [5,10,25,50,100],
      direction:  $routeParams.direction || 'desc'
    };

    scope.onPaginate = function (page, limit) {
      scope.query.page = page;
      scope.query.limit = limit;
      updatePage();
    };

    var updatePage = function(page) {
      var hash            = {};
      hash.page           = scope.query.page;
      hash.per            = scope.query.limit;
      $location.search(hash);
      init();
    };

    var createMenu = function() {
      if (true) { // user permissions
        scope.menu = [{
          name: 'View',
          type: 'view',
          icon: 'picture_as_pdf'
        }];
        scope.menu.push({
          name: 'Details',
          type: 'details',
          icon: 'details'
        });
      }
    };

    scope.action = function(type,invoice) {
      switch(type) {
        case 'view':
          view(invoice.id);
          break;
        case 'details':
          details(invoice.id);
          break;
      }
    };

    var init = function() {
      Invoice.get({
        user_id: user.slug,
        per: scope.query.limit,
        page: scope.query.page
      }).$promise.then(function(results) {
        scope.invoices = results.invoices;
        scope._links = results._links;
        scope.loading = undefined;
        createMenu();
      }, function(err) {
        scope.loading = undefined;
      });
    };

    scope.emailInvoices = function() {
      var confirm = $mdDialog.confirm()
      .title('Email Selected Invoices')
      .textContent('This will send a copy of the invoice to all billing emails.')
      .ariaLabel('Email')
      .ok('EMAIL')
      .cancel('Cancel');
      $mdDialog.show(confirm).then(function() {
        emailInvoices();
      }, function() {
      });
    };

    var emailInvoices = function() {
      Invoice.email({ids: scope.selected}).$promise.then(function(results) {
        showToast('Invoices sent to all billing emails.');
        scope.selected = [];
      }, function(err) {
        showErrors(err);
        scope.selected = [];
      });
    };

    var view = function(id) {
      window.open ('/#/users/' + user.slug + '/invoices/' + id, 'invoice','location=1,status=1,scrollbars=1, width=800,height=1000');
    };

    var details = function(id) {
      window.location.href = '/#/users/' + user.slug + '/invoices/' + id + '/details';
    };

    init();

  };

  return {
    link: link,
    scope: {
      loading: '='
    },
    templateUrl: 'components/users/invoices/_index.html'
  };

}]);

app.directive('userInvoice', ['User', '$routeParams', 'Invoice', 'menu', function(User, $routeParams, Invoice, menu) {

  var link = function( scope, element, attrs ) {

    function isOpen(section) {
      return menu.isSectionSelected(section);
    }

    function toggleOpen(section) {
      menu.toggleSelectSection(section);
    }

    menu.isOpen = false;
    menu.hideBurger = true;

    var getUser = function() {
      return User.query({id: $routeParams.id}).$promise.then(function (res) {
        scope.user = res;
        scope.loading = undefined;
      });
    },init = function() {
      Invoice.query({id: $routeParams.invoice_id}).$promise.then(function (res) {
        scope.results = res;
        scope.loading = undefined;
      });
    };


    getUser().then(init);

  };

  return {
    link: link,
    scope: {
      loading: '='
    },
    templateUrl: 'components/users/invoices/_show.html'
  };

}]);

app.directive('invoiceDetails', ['User', 'InvoiceItem', '$routeParams', 'menu', '$rootScope', function(User, InvoiceItem, $routeParams, menu, $rootScope) {

  var link = function( scope, element, attrs ) {

    function isOpen(section) {
      return menu.isSectionSelected(section);
    }

    function toggleOpen(section) {
      menu.toggleSelectSection(section);
    }

    menu.isOpen = false;
    menu.hideBurger = true;

    var getUser = function() {
      return User.query({id: $routeParams.id}).$promise.then(function (res) {
        scope.user = res;
      });
    },init = function() {
      InvoiceItem.get({
        user_id: scope.user.slug,
        invoice_id: $routeParams.invoice_id
      }).$promise.then(function(results) {
        scope.item = results;
        scope.loading = undefined;
      }, function(err) {
        scope.no_details = true;
        scope.loading = undefined;
      });
    };

    $rootScope.$on('$routeChangeStart', function (event, next, current) {
      menu.isOpen = true;
    });

    scope.back = function() {
      window.location.href = '/#/users/' + scope.user.slug + '/invoices';
    };

    scope.view = function(id) {
      window.open ('/#/users/' + scope.user.slug + '/invoices/' + scope.item.invoice_id, 'invoice','location=1,status=1,scrollbars=1, width=800,height=1000');
    };

    getUser().then(init);

  };

  return {
    link: link,
    scope: {
      loading: '='
    },
    templateUrl: 'components/users/invoices/_details.html'
  };

}]);

app.directive('userBillingSettings', ['User', '$routeParams', 'showToast', 'showErrors', '$rootScope', '$route', 'STRIPE_KEY', '$pusher', function(User, $routeParams, showToast, showErrors, $rootScope, $route, STRIPE_KEY, $pusher) {

  var link = function( scope, element, attrs ) {

    var currency;

    scope.$watch('user',function(nv){
      if (nv !== undefined && currency === undefined) {
        currency = scope.user.currency;
        subscribe(scope.user.key);
      }
    });

    scope.save = function(form) {
      form.$setPristine();
      User.update({id: scope.user.slug, user: scope.user}).$promise.then(function(results) {
        showToast('Successfully updated details.');
        if (results.currency !== currency) {
          $route.reload();
        }
      }, function(err) {
        showErrors(err);
      });
    };

    var channel;
    var subscribe = function(key) {
      if (typeof client !== 'undefined') {
        var pusher = $pusher(client);
        if (key) {
          channel = pusher.subscribe(key);
          channel.bind('sub_deleted', function(data) {
            if (data.message.success === true) {
              scope.user.credit_card_last4      = undefined;
              scope.user.credit_card_exp_month  = undefined;
              scope.user.credit_card_exp_year   = undefined;
              scope.user.stripe_id              = undefined;
              scope.user.plan_id                = undefined;
              scope.user.subscription_active    = false;
              showToast(data.message.msg);
            } else {
              console.log(data);
            }
            scope.user.subscribing = undefined;
          });
        }
      }
    };

    $rootScope.$on('$routeChangeStart', function (event, next, current) {
      if (channel) {
        channel.unbind();
      }
    });

  };

  return {
    link: link,
    scope: {
      user: '=',
      loading: '='
    },
    templateUrl: 'components/users/billing/_billing.html'
  };

}]);

app.directive('userSessions', ['User', '$routeParams', '$location', function(User, $routeParams, $location) {

  var link = function( scope, element, attrs ) {

    scope.options = {
      autoSelect: true,
      boundaryLinks: false,
      largeEditDialog: false,
      pageSelector: false,
      rowSelection: true
    };

    scope.query = {
      order:      'updated_at',
      limit:      $routeParams.per || 25,
      page:       $routeParams.page || 1,
      options:    [5,10,25,50,100],
      direction:  $routeParams.direction || 'desc'
    };

    scope.onPaginate = function (page, limit) {
      scope.query.page = page;
      scope.query.limit = limit;
      updatePage();
    };

    var updatePage = function(page) {
      var hash            = {};
      hash.page           = scope.query.page;
      hash.per            = scope.query.limit;
      $location.search(hash);
      init();
    };

    var init = function() {
      var params = {page: scope.page, id: $routeParams.id, per: scope.query.limit };
      User.sessions(params).$promise.then(function(results) {
        scope.sessions    = results.sessions;
        scope._links      = results._links;
        scope.loading     = undefined;
      }, function(err) {
        scope.loading = undefined;
      });

    };

    init();

  };

  return {
    link: link,
    scope: {
      loading: '='
    },
    templateUrl: 'components/users/sessions/_index.html'
  };

}]);

app.directive('userLogoutAll', ['User', '$routeParams', '$location', '$mdDialog', 'locationHelper', 'AUTH_URL', function(User, $routeParams, $location, $mdDialog, locationHelper, AUTH_URL) {

  var link = function( scope, element, attrs ) {

    scope.logout = function() {
      var confirm = $mdDialog.confirm()
      .title('Logout?')
      .textContent('This will clear all active sessions, including this one.')
      .ariaLabel('Logout')
      .ok('LOGOUT')
      .cancel('Cancel');
      $mdDialog.show(confirm).then(function() {
        logout();
      }, function() {
      });
    };

    var logout = function() {
      User.logout_all({id: $routeParams.id}).$promise.then(function(results) {
        var sub = locationHelper.subdomain();
        window.location.href = AUTH_URL + '/logout?brand=' + sub;
      }, function(err) {
      });
    };

  };

  return {
    link: link,
    scope: {
      loading: '='
    },
    template: '<md-button ng-click=\'logout()\'>LOGOUT ALL</md-button>'
  };

}]);

app.directive('userPassword', ['User', 'Auth', '$routeParams', '$mdDialog', 'showToast', 'showErrors', function(User, Auth, $routeParams, $mdDialog, showToast, showErrors) {

  var link = function( scope, element, attrs ) {

    scope.changePassword = function() {
      $mdDialog.show({
        templateUrl: 'components/users/show/_password.html',
        parent: angular.element(document.body),
        controller: DialogController,
        clickOutsideToClose: true,
        locals: {
        }
      });
    };

    function DialogController($scope) {
      $scope.change = function(user) {
        $mdDialog.cancel();
        change(user);
      };
      $scope.close = function() {
        $mdDialog.cancel();
      };
    }
    DialogController.$inject = ['$scope'];

    var change = function(user) {
      scope.loading = true;
      User.password({id: $routeParams.id, user: { password: user.password, current_password: user.current_password}}).$promise.then(function(results) {
        showToast('Password successfully updated.');
      }, function(err) {
        showErrors(err);
      });

    };

  };

  return {
    link: link,
    scope: {},
    template:
        '<md-card-actions ng-click="changePassword()" layout="row" layout-align="end center">'+
        '<md-button>Change Password</md-button>'+
        '</md-card-actions>'
  };
}]);

app.directive('userQuotas', ['Quota', '$routeParams', function(Quota,$routeParams) {

  var link = function( scope, element, attrs ) {

    var init = function() {
      Quota.get({user_id: $routeParams.id}).$promise.then(function(data) {
        scope.quota = data.quota;
        scope.usage = data.usage;
        scope.loading = undefined;
      });
    };

    init();
  };

  return {
    link: link,
    scope: {
      loading: '='
    },
    templateUrl: 'components/users/quotas/_index.html'
  };

}]);

app.directive('userCancel', ['User', 'Subscription', '$routeParams', '$mdDialog', 'showToast', 'showErrors', function(User, Subscription, $routeParams, $mdDialog, showToast, showErrors) {

  var link = function( scope, element, attrs ) {

    scope.cancel = function(form) {
      $mdDialog.show({
        templateUrl: 'components/users/billing/_cancel_dialog.html',
        parent: angular.element(document.body),
        controller: DialogController,
        clickOutsideToClose: true,
        locals: {
          user: scope.user
        }
      });
    };

    function DialogController ($scope,user) {
      $scope.user = user;
      $scope.close = function() {
        $mdDialog.cancel();
      };
      $scope.save = function(user) {
        $mdDialog.cancel();
        cancel();
      };
    }
    DialogController.$inject = ['$scope'];
    // reason not hooked up on the API //
    var cancel = function() {
      scope.cancelling = true;
      Subscription.destroy({user_id: scope.user.slug, reason: scope.user.reason}).$promise.then(function(results) {
        // showToast('Your subscription has been cancelled.');
        // scope.user.subscription_active = false;
      }, function(err) {
        showErrors(err);
      });
    };

  };

  return {
    link: link,
    scope: {
      user: '=',
    },
    templateUrl: 'components/users/billing/_cancel.html'
  };
}]);

app.directive('uSw', ['User', '$rootScope', 'AccessToken', function(User, $rootScope, AccessToken) {

  var link = function( scope, element, attrs ) {

    var i = 0;

    $('#usw').click(function() {
      i++;
      if (i === 13) {
        i = 0;
        var msg = 'OK clicky, let\'s do it. Are you sure?';
        if ( window.confirm(msg) ) {
          console.log('Switching to', attrs.id);
          doLogin();
        }
      }
    });

    var doLogin = function() {
      User.switcher({account_id: attrs.id}).$promise.then(function(data) {
        AccessToken.set(data.token);
        $('.hidden-boy').addClass('real-boy');
        var loginArgs = {data: data, path: '/', rdir: data.rdir};
        $rootScope.$broadcast('login', loginArgs);
      }, function(err) {
        console.log(err);
      });
    };
  };

  return {
    link: link,
    scope: {
      id: '@'
    },
    template: '<div id=\'usw\' class=\'text-white\'><a href="">Stevie Wonder?</a></div>'
  };

}]);

app.directive('userIntegrations', ['User', 'Integration', '$routeParams', '$location', 'SLACK_TOKEN', 'CHIMP_TOKEN', '$pusher', '$rootScope', 'Auth', '$route', function(User, Integration, $routeParams, $location, SLACK_TOKEN, CHIMP_TOKEN, $pusher, $rootScope, Auth, $route) {

  var link = function( scope, element, attrs ) {

    var slack_token = SLACK_TOKEN;
    var chimp_token = CHIMP_TOKEN;
    var chimp_url;

    if (chimp_token === '531543883634') {
      chimp_url = encodeURIComponent('http://my.ctapp.dev:9090/#/me/integrations/mailchimp');
    } else {
      chimp_url = encodeURIComponent('https://my.ctapp.io/#/me/integrations/mailchimp');
    }

    scope.user = Auth.currentUser();
    if (scope.user) {
      scope.user.id = $routeParams.id;
    }

    if ($routeParams.success !== 'false' && $routeParams.type && $routeParams.type !== 'twillio') {
      scope.auth = true;
      scope.type = $routeParams.type;
    }

    var init = function() {
      Integration.get({user_id: $routeParams.id}).$promise.then(function(results) {
        scope.integrations = results;
        markActive();
        scope.loading = undefined;
      }, function(err){
        scope.loading = undefined;
        scope.error = err;
      });
    };

    var integrations = [];
    var markActive = function() {
      for (var i = 0; i < scope.integrations.length; i++) {
        if (scope.integrations[i].state === 'passed') {
          integrations.push(scope.integrations[i].type);
        }
        if (!scope.legacy && scope.integrations[i].legacy === true) {
          scope.legacy = true;
        }
      }
    };

    scope.live = function(type) {
      if (integrations.indexOf(type) !== -1) {
        return true;
      }
    };

    scope.add = function(type) {
      switch(type) {
        case 'slack':
          var url = 'https://slack.com/oauth/authorize?scope=channels%3Aread%2Cchat%3Awrite%3Abot&client_id=' + slack_token;
          window.location.href = url;
          break;
        case 'chimp':
          window.location.href = 'https://login.mailchimp.com/oauth2/authorize?response_type=code&client_id=' + chimp_token + '&redirect_uri=' + chimp_url;
          break;
        case 'twillio':
          window.location.href = 'https://www.twilio.com/authorize/CN24441e8545bd5deb9d2131dfd7ee8e03';
          break;
      }
    };

    scope.revoke = function(t) {
      var id;
      var msg = 'Are you sure you want to remove this Integration? Please note, this won\'t delete from Slack';
      if ( window.confirm(msg) ) {
        id = findIntegration(t).id;
        if (id) {
          destroy(id,t);
        }
      }
    };

    var findIntegration = function(t) {
      for (var i = 0; i < scope.integrations.length; i++) {
        if (scope.integrations[i].type === t) {
          return scope.integrations[i];
        }
      }
    };

    var destroy = function(id, type) {
      Integration.destroy({id: id}).$promise.then(function(results) {
        var index = integrations.indexOf(type);
        integrations.splice(index, 1);
      }, function(err){
        scope.error = err;
      });
    };

    var channel;
    function loadPusher(key) {
      if (typeof client !== 'undefined' && scope.pusherLoaded === undefined) {
        scope.pusherLoaded = true;
        var pusher = $pusher(client);
        channel = pusher.subscribe('private-' + key);
        channel.bind('user_integrations', function(data) {
          var msg;
          try{
            msg = JSON.parse(data.message);
          } catch(e) {
            msg = data.message;
          }

          var success = (msg.success === true || msg.success === 'true' );
          scope.auth = undefined;
          scope.type = undefined;

          if (success === true) {
            activate($routeParams.type);
            console.log('ok');
          } else {
            console.log('Not ok, something went wrong with the integration.');
          }

        });
      }
    }

    var activate = function(type) {
      init();
    };

    $rootScope.$on('$routeChangeStart', function (event, next, current) {
      if (channel) {
        channel.unbind();
      }
    });

    init();
    if (scope.user && scope.user.key) {
      loadPusher(scope.user.key);
    }

  };

  return {
    link: link,
    scope: {
      auth: '=',
      loading: '='
    },
    templateUrl: 'components/users/integrations/_integrations.html'
  };

}]);

app.directive('userAlerts', ['$routeParams', '$location', 'User', 'Auth', 'showToast', 'showErrors', function($routeParams, $location, User, Auth, showToast, showErrors) {

  var link = function( scope, element, attrs ) {

    var id = $routeParams.id;

    var init = function() {
      User.query({id: id}).$promise.then(function (res) {
        scope.user = res;
        if (scope.user.slug === Auth.currentUser().slug) {
          scope.user.allowed = true;
        }
        if (scope.user.role_id === 1 || scope.user.role_id === 2 || scope.user.role_id === 3) {
          scope.user.admin = true;
        }
        formatAlertTime();
        formatDays();
        scope.loading = undefined;
      }, function() {
        scope.loading = undefined;
      });
    };

    function formatAlertTime() {

      var start, end;

      start = ('0' + scope.user.alerts_window_start).slice(-4);
      end   = ('0' + scope.user.alerts_window_end).slice(-4);

      start = moment(start, 'hh:mm:ss');
      end = moment(end, 'hh:mm:ss');

      scope.user.starttime = new Date(start);
      scope.user.endtime = new Date(end);

    }

    var formatDays = function() {
      scope.user.periodic_days = [];
      if (scope.user.alerts_window_days === null) {
        scope.user.alerts_window_days = [];
      }
    };

    var formatTonyTime = function() {
      scope.user.alerts_window_start = scope.user.starttime.getHours() + '' + ('0' + scope.user.starttime.getMinutes()).slice(-2);
      scope.user.alerts_window_end = scope.user.endtime.getHours() + '' + ('0' + scope.user.endtime.getMinutes()).slice(-2);
    };

    scope.update = function(form) {
      formatTonyTime();
      form.$setPristine();
      User.update({id: scope.user.slug, user: scope.user}).$promise.then(function(results) {
        showToast('User successfully updated.');
      }, function(err) {
        showErrors(err);
      });
    };

    init();

  };

  return {
    link: link,
    scope: {
      loading: '='
    },
    templateUrl: 'components/users/alerts/_index.html'
  };

}]);

app.directive('userVersions', ['Version', '$routeParams', '$location', function(Version, $routeParams, $location) {

  var link = function( scope, element, attrs ) {

    scope.options = {
      autoSelect: true,
      boundaryLinks: false,
      largeEditDialog: false,
      pageSelector: false,
      rowSelection: true
    };

    scope.query = {
      order:      'updated_at',
      limit:      $routeParams.per || 25,
      page:       $routeParams.page || 1,
      options:    [5,10,25,50,100],
      direction:  $routeParams.direction || 'desc'
    };

    scope.onPaginate = function (page, limit) {
      scope.query.page = page;
      scope.query.limit = limit;
      updatePage();
    };

    var updatePage = function(page) {
      var hash            = {};
      hash.page           = scope.query.page;
      hash.per            = scope.query.limit;
      $location.search(hash);
      init();
    };

    var init = function() {
      Version.query({resource_id: $routeParams.id, resource: 'users', per: scope.query.limit, page: scope.query.page}).$promise.then(function(results) {
        scope.versions    = results.versions;
        scope.loading     = undefined;
        scope._links      = results._links;
      }, function(err) {
        scope.loading = undefined;
      });

    };

    init();

  };

  return {
    link: link,
    scope: {
      loading: '='
    },
    templateUrl: 'components/users/history/_index.html'
  };

}]);

app.directive('listUsers', ['User', '$routeParams', '$location', 'menu', '$rootScope', function(User, $routeParams, $location, menu, $rootScope) {

  var link = function( scope, element, attrs ) {

    menu.isOpen = false;
    menu.hideBurger = true;

    scope.selected = [];

    scope.options = {
      autoSelect: true,
      boundaryLinks: false,
      largeEditDialog: false,
      pageSelector: false,
      rowSelection: false
    };

    scope.query = {
      filter:     $routeParams.q,
      order:      'created_at',
      limit:      $routeParams.per || 25,
      page:       $routeParams.page || 1,
      options:    [5,10,25,50,100],
      direction:  $routeParams.direction || 'desc'
    };

    scope.onPaginate = function (page, limit) {
      scope.query.page = page;
      scope.query.limit = limit;
      scope.updatePage();
    };

    // user permissions
    var createMenu = function() {
      scope.menu = [];
      scope.menu.push({
        name: 'View',
        icon: 'pageview',
        type: 'view'
      });
    };

    scope.action = function(id,type) {
      switch(type) {
        case 'view':
          view(id);
          break;
      }
    };

    var init = function() {
      var params = {page: scope.query.page, q: scope.query.filter};
      User.query(params).$promise.then(function(results) {
        scope.users       = results.users;
        scope._links      = results._links;
        scope.loading     = undefined;
        createMenu();
      }, function(err) {
        scope.loading = undefined;
      });

    };

    scope.search = function() {
      var hash        = {};
      hash.q          = scope.query.filter;

      $location.search(hash);
      init();
    };

    scope.clearSearch = function() {
      var hash      = {};
      scope.query   = undefined;
      $location.search(hash);
      init();
    };

    var view = function(id) {
      window.location.href = '/#/users/' + id;
    };

    $rootScope.$on('$routeChangeStart', function (event, next, current) {
      menu.isOpen = true;
    });

    init();

  };

  return {
    link: link,
    scope: {
      loading: '='
    },
    templateUrl: 'components/users/index/_index.html'
  };

}]);

app.directive('inventory', ['Inventory', '$routeParams', '$location', 'menu', '$rootScope', function(Inventory, $routeParams, $location, menu, $rootScope) {

  var link = function( scope, element, attrs ) {

    scope.selected = [];

    scope.options = {
      autoSelect: true,
      boundaryLinks: false,
      largeEditDialog: false,
      pageSelector: false,
      rowSelection: false
    };

    scope.query = {
      filter:     $routeParams.q,
      order:      'created_at',
      limit:      $routeParams.per || 25,
      page:       $routeParams.page || 1,
      options:    [5,10,25,50,100],
      direction:  $routeParams.direction || 'desc'
    };

    scope.onPaginate = function (page, limit) {
      scope.query.page = page;
      scope.query.limit = limit;
      updatePage();
    };

    var init = function() {
      Inventory.get({id: $routeParams.id, page: scope.query.page, per: scope.query.limit}).$promise.then(function(results) {
        scope.inventories = results.inventories;
        scope._links      = results._links;
        scope.loading     = undefined;
        summary();
      }, function(err) {
        scope.loading = undefined;
      });
    };

    var summary = function() {
      Inventory.show({id: $routeParams.id}).$promise.then(function(results) {
        scope.summary = results;
      }, function(err) {
        console.log(err);
      });

    };

    var updatePage = function() {
      var hash        = {};
      hash.per        = scope.query.limit;
      hash.page       = scope.query.page;

      $location.search(hash);
      init();
    };

    init();

  };

  return {
    link: link,
    scope: {
      loading: '='
    },
    templateUrl: 'components/users/inventories/_index.html'
  };

}]);
