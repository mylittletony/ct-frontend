'use strict';

var app = angular.module('myApp.projects.controller', []);

app.controller('ProjectsController', ['$rootScope', '$window', '$scope', '$routeParams', 'User', '$location', 'menu', '$cookies', 'gettextCatalog',
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
    menu.sectionName = 'Project';

    menu.sections = [{
      name: gettextCatalog.getString('Details'),
      type: 'link',
      link: '/#/projects/' + id,
      icon: 'dns',
    }];

    // menu.sections.push({
    //   name: gettextCatalog.getString('Locations'),
    //   type: 'link',
    //   link: '/#/projects/' + id + '/locations',
    //   icon: 'business',
    // });

  }
]);

