'use strict';

/* Controllers */

var app = angular.module('myApp.splash_pages.controller', []);

app.controller('SplashPagesDesignCtrl', ['$scope', '$routeParams', 'menu', '$rootScope', 'gettextCatalog',

  function($scope, $routeParams, menu, $rootScope, gettextCatalog) {

    $scope.loading = true;
    $scope.location = { slug: $routeParams.id };

    var vm = this;

    menu.sections = [{
      name: gettextCatalog.getString('Dashboard'),
      link: '/#/locations/' + $scope.location.slug,
      type: 'link',
      icon: 'dashboard'
    }];

    menu.sections.push({
      name: gettextCatalog.getString('Clients'),
      type: 'link',
      link: '/#/locations/' + $scope.location.slug + '/clients',
      icon: 'devices'
    });

    $rootScope.$on('$routeChangeStart', function (event, next, current) {
      menu.Designer = undefined;
      menu.hideMainNav = undefined;
      menu.hideToolbar = undefined;
      menu.isOpen = true;
    });

  }

]);
