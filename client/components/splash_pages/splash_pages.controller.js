'use strict';

/* Controllers */

var app = angular.module('myApp.splash_pages.controller', []);

app.controller('SplashPagesDesignCtrl', ['$location', '$scope', '$routeParams', 'menu', '$rootScope', 'gettextCatalog',

  function($location, $scope, $routeParams, menu, $rootScope, gettextCatalog) {

    $scope.loading = true;
    $scope.location = { slug: $routeParams.id };

    var vm = this;

    var isActive = function(path) {
      var split = $location.path().split('/');
      if (split.length >= 3) {
        return ($location.path().split('/')[2] === path);
      } else if (path === 'splash_pages') {
        return true;
      }
    };

    menu.sections.push({
      name: gettextCatalog.getString('People'),
      type: 'link',
      link: '/#/' + $scope.location.slug + '/people',
      icon: 'people',
      active: isActive('people')
    });

    menu.sections.push({
      name: gettextCatalog.getString('Splash'),
      type: 'link',
      link: '/#/' + $scope.location.slug + '/splash_pages',
      icon: 'format_paint',
      active: isActive('splash_pages')
    });

    menu.sections.push({
      name: gettextCatalog.getString('Campaigns'),
      type: 'link',
      link: '/#/' + $scope.location.slug + '/triggers',
      icon: 'email',
      active: isActive('triggers')
    });

    $rootScope.$on('$routeChangeStart', function (event, next, current) {
      menu.Designer = undefined;
      menu.hideMainNav = undefined;
      menu.hideToolbar = undefined;
      menu.isOpen = true;
      menu.sections = [];
    });
  }

]);
