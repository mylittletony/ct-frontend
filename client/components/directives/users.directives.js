'use strict';

var app = angular.module('myApp.users.directives', []);

app.directive('userAvatar', [function() {
  return {
    replace: true,
    template: '<md-icon><img class=\'user-avatar\' src="https://www.gravatar.com/avatar/{{user.gravatar}}?s=25" ng-if=\'user.gravatar\'></img><span ng-if=\'!user.gravatar\'>face</span></md-icon>'
  };
}]);

app.directive('showUser', ['User', '$routeParams', '$location', 'Auth', 'showToast', 'showErrors', '$window', 'gettextCatalog', 'Translate', function(User, $routeParams, $location, Auth, showToast, showErrors, $window, gettextCatalog, Translate) {

  var link = function( scope, element, attrs ) {

    var id, locale;

    // scope.locales = [{key: 'Deutsch', value: 'de-DE'}, { key: 'English', value: 'en-GB'}, { key: 'Français', value: 'fr-FR'}, {key: 'Italiano', value: 'it'}, { key: 'Română', value: 'ro' }];
    scope.locales = [{key: 'Deutsch', value: 'de-DE'}, { key: 'English', value: 'en-GB'}];

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
          console.log('Setting locale to', results.locale);
          Auth.currentUser().locale = results.locale;
          $window.location.reload();
        }
        showToast(gettextCatalog.getString('User successfully updated.'));
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

app.directive('userBilling', ['User', '$routeParams', '$location', 'Auth', 'showToast', 'showErrors', 'gettextCatalog', function(User, $routeParams, $location, Auth, showToast, showErrors, gettextCatalog) {

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
        showToast(gettextCatalog.getString('User successfully updated.'));
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

app.directive('userCoupon', ['User', '$routeParams', '$location', '$pusher', 'showToast', 'showErrors', '$rootScope', '$route', '$mdDialog', 'gettextCatalog', function(User, $routeParams, $location, $pusher, showToast, showErrors, $rootScope, $route, $mdDialog, gettextCatalog) {

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
            showToast(gettextCatalog.getString('Coupon added successfully.'));
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
    templateUrl: 'components/users/billing/_add_coupon.html',
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
    templateUrl: 'components/users/billing/_update_card.html',
  };

}]);

app.directive('userInvoices', ['User', '$routeParams', 'showToast', 'showErrors', 'Invoice', '$mdDialog', '$location', 'gettextCatalog', function(User, $routeParams, showToast, showErrors, Invoice, $mdDialog, $location, gettextCatalog) {

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
      var hash  = {};
      hash.page = scope.query.page;
      hash.per  = scope.query.limit;
      $location.search(hash);
      init();
    };

    // user permissions
    var createMenu = function() {
      if (true) {
        scope.menu = [{
          name: gettextCatalog.getString('View'),
          type: 'view',
          icon: 'picture_as_pdf'
        }];
        scope.menu.push({
          name: gettextCatalog.getString('Details'),
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
      .title(gettextCatalog.getString('Email Selected Invoices'))
      .textContent(gettextCatalog.getString('This will send a copy of the invoice to all billing emails.'))
      .ariaLabel(gettextCatalog.getString('Email'))
      .ok(gettextCatalog.getString('EMAIL'))
      .cancel(gettextCatalog.getString('Cancel'));
      $mdDialog.show(confirm).then(function() {
        emailInvoices();
      }, function() {
      });
    };

    var emailInvoices = function() {
      Invoice.email({ids: scope.selected}).$promise.then(function(results) {
        showToast(gettextCatalog.getString('Invoices sent to all billing emails.'));
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

app.directive('userBillingSettings', ['User', '$routeParams', 'showToast', 'showErrors', '$rootScope', '$route', 'STRIPE_KEY', '$pusher', 'gettextCatalog', function(User, $routeParams, showToast, showErrors, $rootScope, $route, STRIPE_KEY, $pusher, gettextCatalog) {

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
        showToast(gettextCatalog.getString('Successfully updated details.'));
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

app.directive('userLogoutAll', ['User', '$routeParams', '$location', '$mdDialog', 'locationHelper', 'AUTH_URL', 'gettextCatalog', function(User, $routeParams, $location, $mdDialog, locationHelper, AUTH_URL, gettextCatalog) {

  var link = function( scope, element, attrs ) {

    scope.logout = function() {
      var confirm = $mdDialog.confirm()
      .title(gettextCatalog.getString('Logout?'))
      .textContent(gettextCatalog.getString('This will clear all active sessions, including this one.'))
      .ariaLabel(gettextCatalog.getString('Logout'))
      .ok(gettextCatalog.getString('LOGOUT'))
      .cancel(gettextCatalog.getString('Cancel'));
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
    templateUrl: 'components/users/sessions/_logout_all.html',
  };

}]);

app.directive('userPassword', ['User', 'Auth', '$routeParams', '$mdDialog', 'showToast', 'showErrors', 'gettextCatalog', '$location', function(User, Auth, $routeParams, $mdDialog, showToast, showErrors, gettextCatalog, $location) {

  var link = function( scope, element, attrs ) {

    var id;
    if ($location.path() === '/me' || Auth.currentUser().slug === $routeParams.id) {
      id = Auth.currentUser().slug;
    } else {
      id = $routeParams.id;
    }

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
      User.update({
        id: id,
        user: {
          password: user.password,
          current_password: user.current_password
        }
      }).$promise.then(function(results) {
        showToast(gettextCatalog.getString('Password successfully updated.'));
      }, function(err) {
        showErrors(err);
      });

    };

  };

  return {
    link: link,
    scope: {},
    templateUrl: 'components/users/show/_change_password.html',
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

app.directive('userIntegrations', ['User', 'Integration', '$routeParams', '$location', 'SLACK_TOKEN', 'CHIMP_TOKEN', '$pusher', '$rootScope', 'Auth', '$route', 'gettextCatalog', function(User, Integration, $routeParams, $location, SLACK_TOKEN, CHIMP_TOKEN, $pusher, $rootScope, Auth, $route, gettextCatalog) {

  var link = function( scope, element, attrs ) {

    var slack_token = SLACK_TOKEN;
    var chimp_token = CHIMP_TOKEN;
    var chimp_url;

    if (chimp_token === '531543883634') {
      chimp_url = encodeURIComponent('http://my.ctapp.dev:9090/#/me/integrations/mailchimp');
    } else {
      chimp_url = encodeURIComponent('https://dashboard.ctapp.io/#/me/integrations/mailchimp');
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
      var msg = gettextCatalog.getString('Are you sure you want to remove this Integration? Please note, this won\'t delete from Slack');
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

app.directive('userAlerts', ['$routeParams', '$location', 'User', 'Auth', 'showToast', 'showErrors', 'gettextCatalog', function($routeParams, $location, User, Auth, showToast, showErrors, gettextCatalog) {

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
        showToast(gettextCatalog.getString('User successfully updated.'));
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

app.directive('listUsers', ['User', '$routeParams', '$location', 'menu', '$rootScope', 'gettextCatalog', '$mdDialog', 'BrandName', '$q', 'BrandUser', 'showErrors', 'showToast', 'Auth', function(User, $routeParams, $location, menu, $rootScope, gettextCatalog, $mdDialog, BrandName, $q, BrandUser, showErrors, showToast, Auth) {

  var link = function( scope, element, attrs ) {

    menu.isOpen = false;
    menu.hideBurger = true;
    scope.brand = { id: $routeParams.brand_id };

    if (Auth.currentUser()) {
      scope.super = Auth.currentUser().super;
    }
    scope.roles = [{ role_id: 205, name: 'Brand Ambassador' }, { role_id: 201, name: 'Member' }];

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

      var hash  = {};
      hash.page = page;
      hash.per  = limit;
      $location.search(hash);
    };

    // user permissions
    var createMenu = function() {
      scope.menu = [];
      scope.menu.push({
        type: 'edit',
        name: gettextCatalog.getString('Edit'),
        icon: 'settings'
      });
      scope.menu.push({
        type: 'revoke',
        name: gettextCatalog.getString('Delete'),
        icon: 'delete_forever'
      });
    };

    scope.menuAction = function(type,user) {
      switch(type) {
        case 'edit':
          edit(user);
          break;
        case 'revoke':
          destroy(user);
          break;
      }
    };

    var edit = function(user) {
      $mdDialog.show({
        templateUrl: 'components/users/brand_users/_edit.html',
        parent: angular.element(document.body),
        controller: DialogController,
        clickOutsideToClose: true,
        locals: {
          user: user,
          roles: scope.roles
        }
      });
    };

    function DialogController ($scope, user, roles) {
      $scope.user = user;
      $scope.roles = roles;
      $scope.update = function() {
        $mdDialog.cancel();
        updateRole(user);
      };
      $scope.close = function() {
        $mdDialog.cancel();
      };
    }
    DialogController.$inject = ['$scope', 'user', 'roles'];

    var destroy = function(user) {
      var confirm = $mdDialog.confirm()
      .title(gettextCatalog.getString('Remove this user?'))
      .textContent(gettextCatalog.getString('This will revoke the user from all your locations'))
      .ariaLabel(gettextCatalog.getString('Remove'))
      .ok(gettextCatalog.getString('Delete'))
      .cancel(gettextCatalog.getString('Cancel'));
      $mdDialog.show(confirm).then(function() {
        removeUser(user);
      });
    };

    var updateRole = function(user) {
      BrandUser.update({
        brand_user: {
          user_id: user.id,
          role_id: user.role_id
        },
        brand_id: scope.brand.id
      }).$promise.then(function(results) {
        showToast('User successfully updated.');
      }, function(err) {
        showErrors(err);
        scope.loading = undefined;
      });
    };

    var removeUser = function(user) {
      BrandUser.destroy({
        brand_user: {
          user_id: user.id,
          role_id: user.role_id
        },
        brand_id: scope.brand.id
      }).$promise.then(function(results) {
        removeFromList(user.id);
        showToast('User successfully updated.');
      }, function(err) {
        showErrors(err);
        scope.loading = undefined;
      });
    };

    var removeFromList = function(id) {
      for (var i = 0, len = scope.users.length; i < len; i++) {
        if (scope.users[i].id === id) {
          scope.users.splice(i, 1);
          break;
        }
      }
    };

    var fetchBrand = function() {
      if (!scope.brand.id && BrandName && BrandName.admin === true) {
        scope.brand = BrandName;
      }
    };

    scope.search = function() {
      var hash = {};
      hash.q = scope.query.filter;

      $location.search(hash);
      init();
    };

    var init = function() {
      fetchBrand();

      var params = {
        page: scope.query.page,
        brand_id: scope.brand.id,
        per: scope.query.limit,
        q: scope.query.filter
      };

      User.query(params).$promise.then(function(results) {
        scope.users       = results.users;
        scope._links      = results._links;
        scope.loading     = undefined;
        if (scope.brand && scope.brand.id) {
          createMenu();
        }
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
