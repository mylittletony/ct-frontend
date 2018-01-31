'use strict';

var app = angular.module('myApp.users.controller', []);

app.controller('UsersShowController', ['$rootScope', '$window', '$scope', '$routeParams', 'User', '$location', 'Auth', 'STRIPE_KEY', '$route', 'locationHelper', 'AUTH_URL', 'menu', '$cookies', 'gettextCatalog',
  function($rootScope, $window, $scope, $routeParams, User, $location, Auth, STRIPE_KEY, $route, locationHelper, AUTH_URL, menu, $cookies, gettextCatalog) {

    $scope.loading = true;
    $scope.location = { slug: $routeParams.id };

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
      } else if (path === 'account') {
        return true;
      }
    };

    menu.header = undefined;
    menu.locationStateIcon = undefined;
    menu.sectionName = Auth.currentUser().username;

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
