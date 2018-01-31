'use strict';

var app = angular.module('myApp.users.directives', []);

app.directive('userAvatar', [function() {
  return {
    replace: true,
    template: '<md-icon><img class=\'user-avatar\' src="https://www.gravatar.com/avatar/{{user.gravatar}}?s=25" ng-if=\'user.gravatar\'></img><span ng-if=\'!user.gravatar\'>face</span></md-icon>'
  };
}]);

app.directive('showUser', ['User', '$routeParams', '$location', '$route', 'Auth', 'showToast', 'showErrors', '$window', 'gettextCatalog', 'Translate', '$cookies', '$mdDialog', function(User, $routeParams, $location, $route, Auth, showToast, showErrors, $window, gettextCatalog, Translate, $cookies, $mdDialog) {

  var link = function( scope, element, attrs ) {

    scope.currentNavItem = 'profile'

    var id, locale;
    // Check git history to more vars;
    // scope.locales = [{key: 'Deutsch', value: 'de-DE'}, { key: 'English', value: 'en-GB'}];

    if ($location.path() === '/me' || Auth.currentUser().slug === $routeParams.id) {
      id = Auth.currentUser().slug;
    } else {
      id = $routeParams.id;
    }

    var init = function() {
      User.query({id: id}).$promise.then(function (res) {
        scope.user = res;
        // locale = res.locale;
        if (scope.user.slug === Auth.currentUser().slug) {
          scope.user.allowed = true;
        }
        if (scope.user.role_id === 1 || scope.user.role_id === 2 || scope.user.role_id === 3) {
          scope.user.admin = true;
        }
        scope.loading = undefined;
      });
    };

    scope.confirmDelete = function(email) {
      User.destroy({id: id, email: email}).$promise.then(function() {
        Auth.logout();
      }, function(err) {
        showErrors(err);
      });
    };

    function DialogController($scope) {
      $scope.delete = function(email) {
        scope.confirmDelete(email);
        $mdDialog.cancel();
      };
      $scope.close = function() {
        $mdDialog.cancel();
      };
    }
    DialogController.$inject = ['$scope'];

    scope.deleteAccount = function() {
      $mdDialog.show({
        templateUrl: 'components/users/show/_delete_account.html',
        parent: angular.element(document.body),
        controller: DialogController
      });
    };

    scope.update = function(form) {
      form.$setPristine();
      scope.user.plan = undefined;
      User.update({}, {
        id: scope.user.slug,
        user: scope.user
      }).$promise.then(function(results) {
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

app.directive('userReseller', ['User', '$routeParams', '$location', 'Auth', 'showToast', 'showErrors', 'gettextCatalog', '$mdDialog', 'STRIPE_KEY', '$rootScope', '$pusher', 'Reseller', function(User, $routeParams, $location, Auth, showToast, showErrors, gettextCatalog, $mdDialog, STRIPE_KEY, $rootScope, $pusher, Reseller) {

  var link = function( scope, element, attrs ) {

    var formatCurrency = function() {
      if (scope.user && scope.user.plan) {
        switch(scope.user.plan.currency) {
          case 'GBP':
            scope.user.plan.currency_symbol = '£';
            scope.amount = 400;
            scope.per = 0.78;
            break;
          case 'EUR':
            scope.user.plan.currency_symbol = '€';
            scope.amount = 435;
            scope.per = 0.88;
            break;
          default:
            scope.user.plan.currency_symbol = '$';
            scope.amount = 500;
            scope.per = 1.00;
            break;
        }
      }
    };

    var init = function() {
      User.query({id: $routeParams.id}).$promise.then(function (res) {
        scope.user = res;
        formatCurrency();
        scope.loading = undefined;
      });
    };

    var save = function() {
      Reseller.create({}, {
      }).$promise.then(function(results) {
        scope.user.new_reseller = true;
        scope.user.reseller = true;
        scope.user.reseller_processing = undefined;
        showToast(gettextCatalog.getString('User successfully updated.'));
      }, function(err) {
        scope.user.reseller_processing = undefined;
        showErrors(err);
      });
    };

    function CardController ($scope) {
      $scope.user = scope.user;

      $scope.save = function() {
        scope.user.reseller_processing = true;
        $mdDialog.cancel();
        save();
      };

      $scope.close = function() {
        $mdDialog.cancel();
      };
    }
    CardController.$inject = ['$scope'];

    var justSub = function() {
      $mdDialog.show({
        templateUrl: 'components/users/reseller/_create.html',
        parent: angular.element(document.body),
        controller: CardController,
        clickOutsideToClose: true
      });
    };

    scope.go = function() {
      if (scope.user.credit_card_last4) {
        justSub();
      }
    };

    if (STRIPE_KEY && window.Stripe) {
      console.log('Setting Stripe Token');
      window.Stripe.setPublishableKey(STRIPE_KEY);
    } else {
      console.log('Could not set stripe token');
    }

    init();

  };

  return {
    link: link,
    loading: '=',
    templateUrl: 'components/users/reseller/_index.html'
  };
}]);

app.directive('userSplashViews', ['User', '$routeParams', '$location', 'Auth', 'showToast', 'showErrors', 'gettextCatalog', '$mdDialog', 'STRIPE_KEY', '$rootScope', '$pusher', 'BonusSplashViews', function(User, $routeParams, $location, Auth, showToast, showErrors, gettextCatalog, $mdDialog, STRIPE_KEY, $rootScope, $pusher, BonusSplashViews) {

  var link = function( scope, element, attrs ) {

    scope.formatCurrency = {
      GBP: '£',
      EUR: '€',
      USD: '$'
    };

    scope.packages = [
      {views: 2500,
       cost: 15,
       type: 'small'},
      {views: 5000,
       cost: 25,
       type: 'big'}
    ];

    var init = function() {
      User.query({id: $routeParams.id}).$promise.then(function (res) {
        scope.user = res;
        scope.loading = undefined;
      });
    };

    var save = function() {
      BonusSplashViews.create({}, {package_type: scope.package
      }).$promise.then(function(results) {
        showToast(gettextCatalog.getString('Transaction completed successfully.'));
      }, function(err) {
        showErrors(err);
      });
    };

    function CardController ($scope) {
      $scope.user = scope.user;
      $scope.save = function() {
        $mdDialog.cancel();
        save();
      };

      $scope.close = function() {
        $mdDialog.cancel();
      };
    }
    CardController.$inject = ['$scope'];

    var justSub = function() {
      $mdDialog.show({
        templateUrl: 'components/users/splash_views/_create.html',
        parent: angular.element(document.body),
        controller: CardController,
        clickOutsideToClose: true,
      });
    };

    scope.go = function(package_type) {
      if (scope.user.credit_card_last4) {
        scope.package = package_type;
        justSub();
      }
    };

    if (STRIPE_KEY && window.Stripe) {
      console.log('Setting Stripe Token');
      window.Stripe.setPublishableKey(STRIPE_KEY);
    } else {
      console.log('Could not set stripe token');
    }

    init();

  };

  return {
    link: link,
    loading: '=',
    templateUrl: 'components/users/splash_views/_index.html'
  };
}]);

app.directive('userBilling', ['User', '$routeParams', '$location', 'Auth', 'showToast', 'showErrors', 'gettextCatalog', function(User, $routeParams, $location, Auth, showToast, showErrors, gettextCatalog) {

  var link = function( scope, element, attrs ) {

    scope.currentNavItem = 'billing'

    scope.currencies = { 'US Dollars' : 'USD', 'UK Pounds': 'GBP', 'EUR': 'Euros' };

    var formatCurrency = function() {
      if (scope.user && scope.user.plan) {
        switch(scope.user.plan.currency) {
          case 'GBP':
            scope.user.plan.currency_symbol = '$';
            break;
          case 'EUR':
            scope.user.plan.currency_symbol = '€';
            break;
          default:
            scope.user.plan.currency_symbol = '$';
            break;
        }
      }
    };

    var init = function() {
      User.query({id: $routeParams.id}).$promise.then(function (res) {
        scope.user = res;
        if (scope.user.slug === Auth.currentUser().slug) {
          scope.user.allowed = true;
        }
        if (scope.user.role_id === 1 || scope.user.role_id === 2 || scope.user.role_id === 3) {
          scope.user.admin = true;
        }
        formatCurrency();
        scope.loading = undefined;
      });
    };

    scope.save = function(form) {
      form.$setPristine();
      User.update({}, {
        id: scope.user.slug,
        user: scope.user
      }).$promise.then(function(results) {
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
      User.update({}, {
        id: scope.user.slug,
        user: scope.user
      }).$promise.then(function(results) {
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

    var save = function() {
      User.update({}, {
        id: scope.user.slug,
        user: scope.user
      }).$promise.then(function(results) {
        scope.user.subscribing = true;
      }, function(err) {
        showErrors(err);
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

    scope.addCard = function() {
      $mdDialog.show({
        templateUrl: 'components/users/billing/_card.html',
        parent: angular.element(document.body),
        controller: DialogController,
        clickOutsideToClose: true
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

app.directive('userInvoices', ['User', '$routeParams', 'showToast', 'showErrors', 'Invoice', '$mdDialog', '$location', 'gettextCatalog', 'pagination_labels', function(User, $routeParams, showToast, showErrors, Invoice, $mdDialog, $location, gettextCatalog, pagination_labels) {

  var link = function( scope, element, attrs ) {

    scope.currentNavItem = 'invoices'

    scope.selected = [];
    var user = { slug: $routeParams.id };

    scope.options = {
      autoSelect: true,
      boundaryLinks: false,
      largeEditDialog: false,
      pageSelector: false,
      rowSelection: true
    };

    scope.pagination_labels = pagination_labels;
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

    var getUser = function() {
      return User.query({id: $routeParams.id}).$promise.then(function (res) {
        scope.user = res;
      });
    },init = function() {
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

    getUser().then(init);

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
      User.update({}, {
        id: scope.user.slug,
        user: scope.user
      }).$promise.then(function(results) {
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

app.directive('userSessions', ['User', '$routeParams', '$location', 'pagination_labels', function(User, $routeParams, $location, pagination_labels) {

  var link = function( scope, element, attrs ) {

    scope.options = {
      autoSelect: true,
      boundaryLinks: false,
      largeEditDialog: false,
      pageSelector: false,
      rowSelection: true
    };

    scope.pagination_labels = pagination_labels;
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

    var logout = function() {
      User.logout_all({id: $routeParams.id}).$promise.then(function(results) {
        var sub = locationHelper.subdomain();
        window.location.href = AUTH_URL + '/logout';
      }, function(err) {
      });
    };

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

app.directive('userQuotas', ['Quota', 'showToast', 'gettextCatalog', 'showErrors', '$routeParams', '$localStorage', '$mdDialog', function(Quota,showToast,gettextCatalog,showErrors,$routeParams,$localStorage,$mdDialog) {

  var link = function( scope, element, attrs ) {

    scope.currentNavItem = 'quotas'

    var init = function() {
      Quota.get({user_id: $routeParams.id}).$promise.then(function(data) {
        scope.quota = data.quota;
        scope.usage = data.usage;
        scope.user = $localStorage.mimo_user;
        scope.loading = undefined;
      });
    };

    scope.editBoxQuota = function() {
      $mdDialog.show({
        templateUrl: 'components/users/quotas/_update_quota.html',
        parent: angular.element(document.body),
        clickOutsideToClose: true,
        locals: {
          quota: scope.quota
        },
        controller: DialogController
      });
    };

    function DialogController ($scope,quota) {
      $scope.quota = quota;
      $scope.close = function() {
        $mdDialog.cancel();
      };
      $scope.save = function() {
        $mdDialog.cancel();
        saveBoxQuota();
      };
    }

    var saveBoxQuota = function(quota) {
      Quota.update({}, {user_id: $routeParams.id, id: scope.quota.id, quota: {boxes: scope.quota.boxes}}).$promise.then(function(data) {
        showToast(gettextCatalog.getString(data.message));
      }, function(errors) {
        showErrors(errors);
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

app.directive('userNav', ['Location', function(Location) {

  var link = function(scope, element, attrs, controller) {
  };

  return {
    link: link,
    templateUrl: 'components/users/_nav.html'
  };
}]);
