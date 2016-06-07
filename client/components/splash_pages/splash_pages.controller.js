'use strict';

/* Controllers */

var app = angular.module('myApp.splash_pages.controller', []);

app.controller('SplashPagesDesignCtrl', ['$scope', '$routeParams', 'menu', '$rootScope',

  function($scope, $routeParams, menu, $rootScope) {

    $scope.loading = true;
    $scope.location = { slug: $routeParams.id };

    var vm = this;

    menu.sections = [{
      name: 'Dashboard',
      link: '/#/locations/' + $scope.location.slug,
      type: 'link',
      icon: 'dashboard'
    }];

    menu.sections.push({
      name: 'Clients',
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
