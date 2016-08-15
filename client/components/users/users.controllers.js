'use strict';

var app = angular.module('myApp.users.controller', []);

app.controller('UsersShowController', ['$rootScope', '$window', '$scope', '$routeParams', 'User', '$location', 'Auth', 'STRIPE_KEY', '$route', 'locationHelper', 'AUTH_URL', 'menu', '$cookies', 'gettextCatalog',
  function($rootScope, $window, $scope, $routeParams, User, $location, Auth, STRIPE_KEY, $route, locationHelper, AUTH_URL, menu, $cookies, gettextCatalog) {

    $scope.loading = true;

    function isOpen(section) {
      return menu.isSectionSelected(section);
    }

    var id;
    var path = $location.path();
    path = path.split('/');

    if ((path && path[1] === 'me') || Auth.currentUser().slug === $routeParams.id) {
      id = Auth.currentUser().slug;
    } else {
      id = $routeParams.id;
    }

    menu.isOpen = isOpen;
    menu.hideBurger = false;

    var isActive = function(path) {
      var split = $location.path().split('/');
      if (split.length >= 4) {
        return ($location.path().split('/')[3] === path);
      } else if (path === 'dashboard') {
        return true;
      }
    };

    menu.header = undefined;
    menu.sectionName = Auth.currentUser().username;

    menu.sections = [{
      name: gettextCatalog.getString('Profile'),
      type: 'link',
      link: '/#/users/' + id,
      icon: 'face',
      active: isActive('dashboard')
    }];

    if (Auth.currentUser() && !Auth.currentUser().guest) {
      menu.sections.push({
        name: gettextCatalog.getString('Billing'),
        type: 'link',
        link: '/#/users/' + id + '/billing',
        icon: 'credit_card',
        active: isActive('billing')
      });

      menu.sections.push({
        name: gettextCatalog.getString('Invoices'),
        type: 'link',
        link: '/#/users/' + id + '/invoices',
        icon: 'picture_as_pdf',
        active: isActive('invoices')
      });
    }

    menu.sections.push({
      name: gettextCatalog.getString('Integrations'),
      type: 'link',
      link: '/#/users/' + id + '/integrations',
      icon: 'widgets',
      active: isActive('integrations')
    });

    menu.sections.push({
      name: gettextCatalog.getString('Notifications'),
      type: 'link',
      link: '/#/users/' + id + '/alerts',
      icon: 'email',
      active: isActive('alerts')
    });

    menu.sections.push({
      name: gettextCatalog.getString('Branding'),
      type: 'link',
      link: '/#/users/' + id + '/branding',
      icon: 'perm_identity',
      active: isActive('branding')
    });

    // menu.sections.push({
    //   name: gettextCatalog.getString('Locations'),
    //   type: 'link',
    //   link: '/#/users/' + id + '/locations',
    //   icon: 'business'
    // });

    menu.sections.push({
      name: gettextCatalog.getString('History'),
      type: 'link',
      link: '/#/users/' + id + '/history',
      icon: 'change_history',
      active: isActive('history')
    });

    menu.sections.push({
      name: gettextCatalog.getString('Access'),
      type: 'link',
      link: '/#/users/' + id + '/sessions',
      icon: 'pan_tool',
      active: isActive('sessions')
    });

    menu.sections.push({
      name: gettextCatalog.getString('Inventory'),
      type: 'link',
      link: '/#/users/' + id + '/inventory',
      icon: 'track_changes',
      active: isActive('inventory')
    });
    menu.sections.push({
      name: gettextCatalog.getString('Quotas'),
      type: 'link',
      link: '/#/users/' + id + '/quotas',
      icon: 'book',
      active: isActive('quotas')
    });

  }
]);

app.controller('UsersIntegrationsController', ['Integration', '$scope', '$routeParams', 'User', '$location', 'Auth', '$pusher',
  function(Integration, $scope, $routeParams, User, $location, Auth, $pusher) {

    function parse(val) {
      var result, tmp = [];
      location.search
      .substr(1)
      .split('&')
      .forEach(function (item) {
        tmp = item.split('=');
        if (tmp[0] === val) {
          result = decodeURIComponent(tmp[1]);
        }
      });
      return result;
    }

    var code = $routeParams.code || parse('code');

    var type;
    if (($routeParams.id === 'slacker' || $routeParams.id === 'slacker') && code ) {
      type = 'slack';
    }
    else if ($routeParams.id === 'mailchimp' && code ) {
      type = 'mailchimp';
    }
    else if ($routeParams.id === 'twillio' && code ) {
      type = 'twillio';
    }

    if ($routeParams.error) {
      $location.path('/users/' + Auth.currentUser().slug + '/integrations');
      $location.search({success: false, error: $routeParams.error});
    } else if (type) {
      Integration.create({integration: { code: code, type: type }}).$promise.then(function(results) {
        $location.path('/users/' + Auth.currentUser().slug + '/integrations');
        $location.search({success: true, type: type});
      }, function(err) {
        $location.path('/users/' + Auth.currentUser().slug + '/integrations');
        $location.search({success: false, type: type});
      });
    } else {
      $location.path('/users/' + Auth.currentUser().slug + '/integrations');
      $location.search({success: false, type: type});
    }
  }

]);
