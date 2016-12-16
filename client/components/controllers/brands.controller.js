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
      // active: isActive('dashboard')
    }];

    // if (Auth.currentUser() && !Auth.currentUser().guest) {
    //   menu.sections.push({
    //     name: gettextCatalog.getString('Billing'),
    //     type: 'link',
    //     link: '/#/users/' + id + '/billing',
    //     icon: 'credit_card',
    //     active: isActive('billing')
    //   });

    //   menu.sections.push({
    //     name: gettextCatalog.getString('Invoices'),
    //     type: 'link',
    //     link: '/#/users/' + id + '/invoices',
    //     icon: 'picture_as_pdf',
    //     active: isActive('invoices')
    //   });
    // }

    // menu.sections.push({
    //   name: gettextCatalog.getString('Integrations'),
    //   type: 'link',
    //   link: '/#/users/' + id + '/integrations',
    //   icon: 'widgets',
    //   active: isActive('integrations')
    // });

    menu.sections.push({
      name: gettextCatalog.getString('Settings'),
      type: 'link',
      link: '/#/brands/' + id + '/settings',
      icon: 'settings',
      // active: isActive('sessions')
    });

    menu.sections.push({
      name: gettextCatalog.getString('Triggers'),
      type: 'link',
      link: '/#/brands/' + id + '/alerts',
      icon: 'email',
      // active: isActive('alerts')
    });

    // if (Auth.currentUser() && !Auth.currentUser().guest) {
    //   menu.sections.push({
    //     name: gettextCatalog.getString('Branding'),
    //     type: 'link',
    //     link: '/#/users/' + id + '/branding',
    //     icon: 'perm_identity',
    //     active: isActive('branding')
    //   });
    // }

    // menu.sections.push({
    //   name: gettextCatalog.getString('Locations'),
    //   type: 'link',
    //   link: '/#/users/' + id + '/locations',
    //   icon: 'business'
    // });

    menu.sections.push({
      name: gettextCatalog.getString('Theme'),
      type: 'link',
      link: '/#/brands/' + id + '/history',
      icon: 'change_history',
      // active: isActive('history')
    });

    // menu.sections.push({
    //   name: gettextCatalog.getString('Inventory'),
    //   type: 'link',
    //   link: '/#/brands/' + id + '/inventory',
    //   icon: 'track_changes',
    //   // active: isActive('inventory')
    // });
    // menu.sections.push({
    //   name: gettextCatalog.getString('Quotas'),
    //   type: 'link',
    //   link: '/#/brands/' + id + '/quotas',
    //   icon: 'book',
    //   // active: isActive('quotas')
    // });

  }
]);

