'use strict';

var app = angular.module('myApp.brands.controller', []);

app.controller('BrandsController', ['$rootScope', '$window', '$scope', '$routeParams', 'User', '$location', 'menu', '$cookies', 'gettextCatalog',
  function($rootScope, $window, $scope, $routeParams, User, $location, menu, $cookies, gettextCatalog) {

    // $scope.loading = true;

    function isOpen(section) {
      return menu.isSectionSelected(section);
    }

    var id = $routeParams.id;
    var path = $location.path();
    path = path.split('/');

    menu.isOpen = isOpen;
    menu.hideBurger = false;

    menu.header = undefined;
    menu.sectionName = 'Brand';

    menu.sections = [{
      name: gettextCatalog.getString('Details'),
      type: 'link',
      link: '/#/brands/' + id,
      icon: 'face',
    }];

    // menu.sections.push({
    //   name: gettextCatalog.getString('Triggers'),
    //   type: 'link',
    //   link: '/#/brands/' + id + '/alerts',
    //   icon: 'email',
    // });

    menu.sections.push({
      name: gettextCatalog.getString('Theme'),
      type: 'link',
      link: '/#/brands/' + id + '/theme',
      icon: 'format_paint',
    });
  }
]);

