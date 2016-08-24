'use strict';

var app = angular.module('myApp', [
  'ngStorage',
  'ngRoute',
  'ngCookies',
  'ngMessages',
  'myApp.controllers',
  'myApp.filters',
  'myApp.services',
  'myApp.directives',
  'ngAnimate',
  'angularPayments',
  'angularMoment',
  'ngMaterial',
  'md.data.table',
  'minicolors',
  'pusher-angular',
  'config',
  'gettext'
]);

app.config(['$compileProvider', 'DEBUG', function ($compileProvider,DEBUG) {
  $compileProvider.debugInfoEnabled(DEBUG);
}]);

app.config(['$routeProvider', '$locationProvider', '$httpProvider', '$mdThemingProvider', '$mdIconProvider', function ($routeProvider, $locationProvider, $httpProvider, $mdThemingProvider, $mdIconProvider) {

  $httpProvider.interceptors.push('myHttpInterceptor');

  $httpProvider.defaults.useXDomain = true;
  $httpProvider.defaults.headers.common['Accept'] = 'application/json';
  $httpProvider.defaults.headers.common['Content-Type'] = 'application/json';
  $httpProvider.defaults.headers.patch['Accept'] = 'application/json';
  $httpProvider.defaults.headers.patch['Content-Type'] = 'application/json;charset=utf-8';

  var items = ['pink', 'orange', 'blue-grey', 'blue', 'red', 'green', 'yellow', 'teal', 'brown'];
  var item = 'blue';

  $mdThemingProvider.theme('default')
    .primaryPalette(item, {
      'hue-1': '100',
    }).
    accentPalette('blue', {
      'default': '500',
      'hue-1': '50'
    });

  function loginRequired ($location, $q, AccessToken, $rootScope) {
    var deferred = $q.defer();
    if (! AccessToken.get() ) {
      var logoutEvent = 'logout';
      var logoutArgs = ['arg'];
      $rootScope.$broadcast(logoutEvent, logoutArgs);
      deferred.reject();
    } else {
      deferred.resolve();
    }
    return deferred.promise;
  }
  loginRequired.$inject = ['$location', '$q', 'AccessToken', '$rootScope' ];

  var loggedIn = function($location, $q, AccessToken) {
    var deferred = $q.defer();
    if (AccessToken.get() === undefined) {
      deferred.resolve();
    } else {
      $location.path('/');
      deferred.reject();
    }
    return deferred.promise;
  };

  $routeProvider.
    when('/', {
      templateUrl: 'components/locations/index/index.html',
      controller: 'HomeCtrl'
    }).
    when('/hey', {
      templateUrl: 'components/locations/index/_unauthed.html',
    }).
    when('/brand-404', {
      templateUrl: 'components/home/brand-not-found.html',
    }).
    when('/404', {
      templateUrl: 'components/home/404.html',
    }).
    when('/aes', {
      templateUrl: 'components/app_events/index.html',
      resolve: { loginRequired: loginRequired },
    }).
    when('/aes/:id', {
      templateUrl: 'components/app_events/show.html',
      resolve: { loginRequired: loginRequired },
    }).
    when('/apps', {
      templateUrl: 'components/apps/index.html',
      resolve: { loginRequired: loginRequired }
    }).
    when('/apps/new', {
      templateUrl: 'components/apps/new.html',
      resolve: { loginRequired: loginRequired }
    }).
    when('/apps/:id', {
      templateUrl: 'components/apps/show.html',
      resolve: { loginRequired: loginRequired }
    }).
    when('/apps/:id/edit', {
      templateUrl: 'components/apps/new.html',
      resolve: { loginRequired: loginRequired }
    }).
    when('/audit', {
      templateUrl: 'components/audit/sessions/index.html',
      resolve: { loginRequired: loginRequired },
    }).
    when('/audit/emails', {
      templateUrl: 'components/audit/emails/index.html',
      resolve: { loginRequired: loginRequired }
    }).
    when('/audit/social', {
      templateUrl: 'components/audit/social/index.html',
      resolve: { loginRequired: loginRequired }
    }).
    when('/audit/guests', {
      templateUrl: 'components/audit/guests/index.html',
      resolve: { loginRequired: loginRequired }
    }).
    when('/audit/guests/:id', {
      templateUrl: 'components/audit/guests/show.html',
      resolve: { loginRequired: loginRequired }
    }).
    when('/audit/sales', {
      templateUrl: 'components/audit/sales/index.html',
      resolve: { loginRequired: loginRequired }
    }).
    when('/audit/sales/:id', {
      templateUrl: 'components/audit/sales/show.html',
      resolve: { loginRequired: loginRequired }
    }).
    when('/login', {
      controller: 'AuthenticationsController',
      templateUrl: 'components/home/hello.html',
    }).
    when('/switch', {
      templateUrl: 'components/home/switching.html',
      controller: function($location, $rootScope, $cookies, locationHelper, CTLogin) {

        var event = $cookies.get('event');
        if (event) {
          event = JSON.parse($cookies.get('event'));
          var domain = locationHelper.domain();
          $cookies.remove('event', {domain: domain});
          if (event && event.data ) {
            var loginEvent = 'login';
            var loginArgs = {data: event.data, path: event.path, search: event.search};
            $rootScope.$broadcast(loginEvent, loginArgs);
          }
        } else {
          $location.path('/');
        }
      }
    }).
    when('/register', {
      templateUrl: 'components/registrations/index.html',
      resolve: { loggedIn: loggedIn }
    }).
    when('/create', {
      templateUrl: 'components/registrations/create.html',
      controller: function($rootScope) {
        $rootScope.$broadcast('intercom', {hi: 'simon'});
      },
      resolve: { loggedIn: loggedIn }
    }).
    when('/success', {
      templateUrl: 'components/registrations/success.html',
    }).
    when('/create/:id', {
      templateUrl: 'components/registrations/flow.html',
      resolve: { loggedIn: loggedIn }
    }).
    when('/boxes', {
      redirectTo: '/alerts'
    }).
    when('/alerts', {
      templateUrl: 'components/locations/index/alerts.html',
      resolve: { loginRequired: loginRequired },
    }).
    when('/distributors/:id', {
      templateUrl: 'components/distros/distro.html',
      resolve: { loginRequired: loginRequired },
      reloadOnSearch: false
    }).
    when('/referrals', {
      templateUrl: 'components/distros/referrals.html',
      resolve: { loginRequired: loginRequired },
      reloadOnSearch: false
    }).
    when('/events', {
      templateUrl: 'components/events/index.html',
      resolve: { loginRequired: loginRequired },
    }).
    when('/events/:id', {
      templateUrl: 'components/events/show.html',
      resolve: { loginRequired: loginRequired },
    }).
    when('/locations', {
      templateUrl: 'components/locations/index/list.html',
      resolve: { loginRequired: loginRequired }
    }).
    when('/locations/map', {
      templateUrl: 'components/locations/map/index.html',
      resolve: { loginRequired: loginRequired }
    }).
    when('/locations/new', {
      templateUrl: 'components/locations/new/index.html',
      resolve: { loginRequired: loginRequired }
    }).
    when('/locations/:id', {
      templateUrl: 'components/locations/show/index.html',
      controller: 'LocationsCtrl as lc',
      resolve: { loginRequired: loginRequired },
      reloadOnSearch: false
    }).
    when('/locations/:id/map', {
      templateUrl: 'components/locations/show/map.html',
      controller: 'LocationsCtrl as lc',
      resolve: { loginRequired: loginRequired },
    }).
    when('/locations/:id/clients', {
      templateUrl: 'components/locations/clients/index.html',
      resolve: { loginRequired: loginRequired },
      controller: 'LocationsCtrl as lc',
    }).
    when('/locations/:id/clients/:client_id', {
      templateUrl: 'components/locations/clients/show.html',
      resolve: { loginRequired: loginRequired },
      controller: 'LocationsCtrl as lc',
      reloadOnSearch: false,
    }).
    when('/locations/:id/clients/:client_id/codes', {
      templateUrl: 'components/locations/clients/codes.html',
      resolve: { loginRequired: loginRequired },
      controller: 'LocationsCtrl as lc',
    }).
    when('/locations/:id/clients/:client_id/codes/:username', {
      templateUrl: 'components/locations/clients/show_code.html',
      resolve: { loginRequired: loginRequired },
      controller: 'LocationsCtrl as lc',
    }).
    when('/locations/:id/clients/:client_id/codes/:username/sessions', {
      templateUrl: 'components/locations/clients/sessions.html',
      resolve: { loginRequired: loginRequired },
      controller: 'LocationsCtrl as lc',
    }).
    when('/locations/:id/clients/:client_id/orders/:order_id', {
      templateUrl: 'components/locations/clients/show_order.html',
      resolve: { loginRequired: loginRequired },
      controller: 'LocationsCtrl as lc',
    }).
    when('/locations/:id/clients/:client_id/social/:social_id', {
      templateUrl: 'components/locations/clients/social.html',
      resolve: { loginRequired: loginRequired },
      controller: 'LocationsCtrl as lc',
    }).
    when('/locations/:id/clients/:client_id/sessions', {
      templateUrl: 'components/locations/clients/sessions.html',
      resolve: { loginRequired: loginRequired },
      controller: 'LocationsCtrl as lc',
    }).
    when('/locations/:id/group_policies', {
      templateUrl: 'components/views/group_policies/index.html',
      controller: 'LocationsCtrl as lc',
      resolve: { loginRequired: loginRequired }
    }).
    when('/locations/:id/group_policies/:group_policy_id', {
      templateUrl: 'components/views/group_policies/show.html',
      controller: 'LocationsCtrl as lc',
      resolve: { loginRequired: loginRequired }
    }).
    when('/locations/:id/group_policies/:group_policy_id/clients', {
      templateUrl: 'components/views/group_policies/clients.html',
      controller: 'LocationsCtrl as lc',
      resolve: { loginRequired: loginRequired }
    }).
    when('/locations/:id/triggers', {
      templateUrl: 'components/locations/triggers/index.html',
      controller: 'LocationsCtrl as lc',
      resolve: { loginRequired: loginRequired }
    }).
    when('/locations/:id/triggers/new', {
      templateUrl: 'components/locations/triggers/new.html',
      controller: 'LocationsCtrl as lc',
      resolve: { loginRequired: loginRequired }
    }).
    when('/locations/:id/triggers/:trigger_id', {
      templateUrl: 'components/locations/triggers/show.html',
      resolve: { loginRequired: loginRequired },
      controller: 'LocationsCtrl as lc',
    }).
    when('/locations/:id/triggers/:trigger_id/edit', {
      templateUrl: 'components/locations/triggers/edit.html',
      controller: 'LocationsCtrl as lc',
      resolve: { loginRequired: loginRequired }
    }).
    when('/locations/:id/triggers/:trigger_id/trigger_history', {
      templateUrl: 'components/locations/triggers/history/index.html',
      controller: 'LocationsCtrl as lc',
      resolve: { loginRequired: loginRequired }
    }).
    when('/locations/:id/triggers/:trigger_id/trigger_history/:trigger_history_id', {
      templateUrl: 'components/locations/triggers/history/show.html',
      controller: 'LocationsCtrl as lc',
      resolve: { loginRequired: loginRequired }
    }).
    when('/locations/:id/users', {
      templateUrl: 'components/locations/users/index.html',
      controller: 'LocationsCtrl as lc',
      resolve: { loginRequired: loginRequired }
    }).
    when('/locations/:id/settings', {
      templateUrl: 'components/locations/settings/index.html',
      controller: 'LocationsCtrl as lc',
      resolve: { loginRequired: loginRequired }
    }).
    when('/locations/:id/settings/notifications', {
      templateUrl: 'components/locations/settings/notifications.html',
      controller: 'LocationsCtrl as lc',
      resolve: { loginRequired: loginRequired }
    }).
    when('/locations/:id/settings/devices', {
      templateUrl: 'components/locations/settings/devices.html',
      controller: 'LocationsCtrl as lc',
      resolve: { loginRequired: loginRequired }
    }).
    when('/locations/:id/settings/splash', {
      templateUrl: 'components/locations/settings/splash.html',
      controller: 'LocationsCtrl as lc',
      resolve: { loginRequired: loginRequired }
    }).
    when('/locations/:id/settings/analytics', {
      templateUrl: 'components/locations/settings/analytics.html',
      controller: 'LocationsCtrl as lc',
      resolve: { loginRequired: loginRequired }
    }).
    when('/locations/:id/versions', {
      templateUrl: 'components/locations/versions/index.html',
      controller: 'LocationsCtrl as lc',
      resolve: { loginRequired: loginRequired }
    }).
    when('/locations/:id/networks', {
      templateUrl: 'components/locations/networks/index.html',
      controller: 'LocationsCtrl as lc',
      resolve: { loginRequired: loginRequired }
    }).
    when('/locations/:id/zones', {
      templateUrl: 'components/zones/index.html',
      controller: 'LocationsCtrl as lc',
      resolve: { loginRequired: loginRequired },
      reloadOnSearch: false,
    }).
    when('/locations/:id/zones/:zone_id', {
      templateUrl: 'components/zones/show.html',
      // controller: 'ZonesCtrlShow',
      controller: 'LocationsCtrl as lc',
      resolve: { loginRequired: loginRequired }
    }).
    when('/locations/:id/networks/:network_id', {
      templateUrl: 'components/locations/networks/show.html',
      resolve: { loginRequired: loginRequired },
      controller: 'LocationsCtrl as lc',
    }).
    when('/locations/:id/splash_codes', {
      controller: 'LocationsCtrl as lc',
      templateUrl: 'components/splash_codes/index.html',
      resolve: { loginRequired: loginRequired }
    }).
    when('/locations/:id/splash_codes/new', {
      templateUrl: 'components/splash_codes/new.html',
      controller: 'LocationsCtrl as lc',
      resolve: { loginRequired: loginRequired }
    }).
    when('/locations/:id/splash_codes/:splash_code_id', {
      controller: 'LocationsCtrl as lc',
      templateUrl: 'components/splash_codes/show.html',
      resolve: { loginRequired: loginRequired }
    }).
    when('/locations/:id/splash_codes/:splash_code_id/sessions/:username', {
      controller: 'LocationsCtrl as lc',
      templateUrl: 'components/splash_codes/sessions.html',
      resolve: { loginRequired: loginRequired }
    }).
    when('/locations/:id/splash_pages', {
      controller: 'LocationsCtrl as lc',
      templateUrl: 'components/splash_pages/index.html',
      resolve: { loginRequired: loginRequired }
    }).
    when('/locations/:id/splash_pages/new', {
      templateUrl: 'components/splash_pages/new.html',
      controller: 'SplashPagesCtrlNew',
      resolve: { loginRequired: loginRequired }
    }).
    when('/locations/:id/splash_pages/:splash_page_id/design', {
      templateUrl: 'components/splash_pages/design.html',
      controller: 'SplashPagesDesignCtrl as lc',
      resolve: { loginRequired: loginRequired }
    }).
    when('/locations/:id/splash_pages/:splash_page_id/store', {
      templateUrl: 'components/splash_pages/store.html',
      reloadOnSearch: false,
      controller: 'LocationsCtrl as lc',
      resolve: { loginRequired: loginRequired }
    }).
    when('/locations/:id/splash_pages/:splash_page_id/forms', {
      templateUrl: 'components/splash_pages/forms.html',
      reloadOnSearch: false,
      controller: 'LocationsCtrl as lc',
      resolve: { loginRequired: loginRequired }
    }).
    when('/locations/:id/splash_pages/:splash_page_id', {
      templateUrl: 'components/splash_pages/show.html',
      controller: 'LocationsCtrl as lc',
      resolve: { loginRequired: loginRequired }
    }).
    when('/downloads', {
      templateUrl: 'components/downloads/index.html',
      resolve: { loginRequired: loginRequired },
    }).
    when('/locations/:id/devices', {
      redirectTo: '/locations/:id'
    }).
    when('/locations/:id/boxes', {
      redirectTo: '/locations/:id'
    }).
    when('/locations/:id/boxes/new', {
      redirectTo: '/locations/:id/devices/new'
    }).
    when('/locations/:id/devices/new', {
      templateUrl: 'components/boxes/new/index.html',
      resolve: { loginRequired: loginRequired },
      controller: 'LocationsCtrl as lc',
    }).
    when('/locations/:id/boxes/:box_id', {
      redirectTo: '/locations/:id/devices/:box_id',
    }).
    when('/locations/:id/devices/:box_id', {
      templateUrl: 'components/boxes/show/index.html',
      controller: 'LocationsCtrl as lc',
      resolve: { loginRequired: loginRequired },
      reloadOnSearch: false,
    }).
    when('/locations/:id/boxes/:box_id/edit', {
      redirectTo: '/locations/:id/devices/:box_id/edit',
    }).
    when('/locations/:id/devices/:box_id/edit', {
      templateUrl: 'components/boxes/edit/index.html',
      controller: 'LocationsCtrl as lc',
      resolve: { loginRequired: loginRequired }
    }).
    when('/locations/:id/boxes/:box_id/payloads', {
      redirectTo: '/locations/:id/devices/:box_id/payloads',
    }).
    when('/locations/:id/devices/:box_id/payloads', {
      templateUrl: 'components/boxes/payloads/index.html',
      controller: 'LocationsCtrl as lc',
      resolve: { loginRequired: loginRequired }
    }).
    when('/locations/:id/boxes/:box_id/versions', {
      redirectTo: '/locations/:id/devices/:box_id/versions',
    }).
    when('/locations/:id/devices/:box_id/versions', {
      templateUrl: 'components/boxes/versions/index.html',
      controller: 'LocationsCtrl as lc',
      resolve: { loginRequired: loginRequired }
    }).
    when('/reports', {
      templateUrl: 'components/reports/wireless.html',
      controller: 'ReportsCtrl as rc',
      reloadOnSearch: false,
      resolve: { loginRequired: loginRequired }
    }).
    when('/reports/radius', {
      templateUrl: 'components/reports/radius.html',
      controller: 'ReportsCtrl as rc',
      reloadOnSearch: false,
      resolve: { loginRequired: loginRequired }
    }).
    when('/users', {
      templateUrl: 'components/users/index/index.html',
      resolve: { loginRequired: loginRequired }
    }).
    when('/users/:id', {
      templateUrl: 'components/users/show/index.html',
      controller: 'UsersShowController',
      resolve: { loginRequired: loginRequired }
    }).
    when('/users/:id/sessions', {
      templateUrl: 'components/users/sessions/index.html',
      controller: 'UsersShowController',
      resolve: { loginRequired: loginRequired }
    }).
    when('/me', {
      templateUrl: 'components/users/show/index.html',
      controller: 'UsersShowController',
      resolve: { loginRequired: loginRequired }
    }).
    when('/users/:id/billing', {
      templateUrl: 'components/users/billing/index.html',
      controller: 'UsersShowController',
      resolve: { loginRequired: loginRequired }
    }).
    when('/users/:id/invoices', {
      templateUrl: 'components/users/invoices/index.html',
      controller: 'UsersShowController',
      resolve: { loginRequired: loginRequired }
    }).
    when('/me/inventory', {
      templateUrl: 'components/users/inventories/index.html',
      controller: 'UsersShowController',
      resolve: { loginRequired: loginRequired }
    }).
    when('/users/:id/inventory', {
      templateUrl: 'components/users/inventories/index.html',
      controller: 'UsersShowController',
      resolve: { loginRequired: loginRequired }
    }).
    when('/users/:id/invoices/:invoice_id', {
      templateUrl: 'components/users/invoices/show.html',
      resolve: { loginRequired: loginRequired }
    }).
    when('/users/:id/invoices/:invoice_id/details', {
      templateUrl: 'components/users/invoices/details.html',
      // controller: 'InvoicesShowController',
      resolve: { loginRequired: loginRequired }
    }).
    when('/me/integrations/:id', {
      templateUrl: 'components/users/integrations/setup.html',
      controller: 'UsersIntegrationsController',
      resolve: { loginRequired: loginRequired }
    }).
    when('/me/integrations', {
      templateUrl: 'components/users/integrations/index.html',
      controller: 'UsersShowController',
      resolve: { loginRequired: loginRequired }
    }).
    when('/users/:id/alerts', {
      templateUrl: 'components/users/alerts/index.html',
      controller: 'UsersShowController',
      resolve: { loginRequired: loginRequired }
    }).
    when('/users/:id/integrations', {
      templateUrl: 'components/users/integrations/index.html',
      controller: 'UsersShowController',
      resolve: { loginRequired: loginRequired }
    }).
    when('/users/:id/branding', {
      templateUrl: 'components/users/branding/index.html',
      controller: 'UsersShowController',
      resolve: { loginRequired: loginRequired }
    }).
    when('/users/:id/locations', {
      templateUrl: 'components/users/locations/index.html',
      controller: 'UsersShowController',
      resolve: { loginRequired: loginRequired }
    }).
    when('/users/:id/users', {
      templateUrl: 'components/users/users/index.html',
      controller: 'UsersShowController',
      resolve: { loginRequired: loginRequired }
    }).
    when('/users/:id/usage', {
      templateUrl: 'components/users/usage/index.html',
      controller: 'UsersShowController',
      resolve: { loginRequired: loginRequired }
    }).
    when('/users/:id/history', {
      templateUrl: 'components/users/history/index.html',
      controller: 'UsersShowController',
      resolve: { loginRequired: loginRequired }
    }).
    when('/users/:id/quotas', {
      templateUrl: 'components/users/quotas/index.html',
      controller: 'UsersShowController',
      resolve: { loginRequired: loginRequired }
    }).
    when('/locations/:id/vouchers', {
      templateUrl: 'components/vouchers/index.html',
      controller: 'LocationsCtrl as lc',
      resolve: { loginRequired: loginRequired },
      // reloadOnSearch: false
    }).
    when('/locations/:id/vouchers/new', {
      templateUrl: 'components/vouchers/new.html',
      controller: 'LocationsCtrl as lc',
      resolve: { loginRequired: loginRequired }
    }).
    when('/locations/:id/vouchers/:voucher_id/edit', {
      templateUrl: 'components/vouchers/edit.html',
      controller: 'LocationsCtrl as lc',
      resolve: { loginRequired: loginRequired }
    }).
    when('/locations/:id/vouchers/:voucher_id', {
      templateUrl: 'components/vouchers/show.html',
      controller: 'LocationsCtrl as lc',
      resolve: { loginRequired: loginRequired }
    }).
    when('/locations/:id/vouchers/:voucher_id/codes', {
      templateUrl: 'components/codes/vouchers_index.html',
      controller: 'LocationsCtrl as lc',
      resolve: { loginRequired: loginRequired }
    }).
    when('/locations/:id/vouchers/:voucher_id/codes/:username', {
      templateUrl: 'components/codes/voucher_sessions.html',
      controller: 'LocationsCtrl as lc',
      resolve: { loginRequired: loginRequired }
    }).
    otherwise({
      templateUrl: 'components/home/404.html',
      // redirectTo: '/404'
    });
    $locationProvider.html5Mode(false);
}]);

app.factory('myHttpInterceptor', ['$q', '$location', '$localStorage', '$rootScope', 'AccessToken',
  function($q, $location, $localStorage, $rootScope, AccessToken) {
    return {
      request: function(config){
        var token = AccessToken.get();
        if (token) {
          config.headers.Authorization = 'Bearer ' + token;
        }
        return config;
      },
      response: function(response){
        if (response.status === 401) {
        //   var logoutEvent = 'logout';
        //   var logoutArgs = ['arg'];
        //   $rootScope.$broadcast(logoutEvent, logoutArgs);
        }
        else if (response.status === 500) {
          // alert(500, 'Error');
          // $location.path('/404.html');
        }
        return response || $q.when(response);
      },
      responseError: function(rejection) {
        if (rejection.status === 401) {
          var logoutEvent = 'logout';
          var logoutArgs = ['arg'];
          $rootScope.$broadcast(logoutEvent, logoutArgs);
        }
        // else if (rejection.status === 404) {
        //   $location.path('/404').search({ct: 'does-not-compute'});
        // }
        return $q.reject(rejection);
      }
    };
  }
]);

