'use strict';

var app = angular.module('myApp.brand_users.directives', []);

app.directive('listBrandUsers', ['BrandUser', '$location', '$routeParams', 'menu', 'gettextCatalog', '$mdDialog', function(BrandUser, $location, $routeParams, menu, gettextCatalog, $mdDialog) {

  var link = function(scope,element,attrs) {
    scope.brand   = { id: $routeParams.brand_id };

    menu.isOpen = false;
    menu.hideBurger = true;
    menu.sectionName = 'Brands';

    var createMenu = function() {
      scope.menu = [];
      scope.menu.push({
        type: 'edit',
        name: gettextCatalog.getString('Edit'),
        icon: 'settings'
      });
      scope.menu.push({
        type: 'revoke',
        name: gettextCatalog.getString('Delete'),
        icon: 'delete_forever'
      });
    };

    scope.menuAction = function(type) {
      switch(type) {
        case 'edit':
          edit();
          break;
        case 'revoke':
          destroy();
          break;
      }
    };

    var edit = function() {
    };

    var destroy = function() {
      var confirm = $mdDialog.confirm()
      .title(gettextCatalog.getString('Remove this user?'))
      .textContent(gettextCatalog.getString('This will revoke the user from all your locations'))
      .ariaLabel(gettextCatalog.getString('Remove'))
      .ok(gettextCatalog.getString('Delete'))
      .cancel(gettextCatalog.getString('Cancel'));
      $mdDialog.show(confirm).then(function() {
        removeUser();
      });
    };

    var removeUser = function() {
      alert(123)
    };

    var init = function() {
      BrandUser.get({brand_id: scope.brand.id}).$promise.then(function(results) {
        scope.brand_users = results;
        createMenu();
        scope.loading = undefined;
      }, function(err) {
        scope.loading = undefined;
      });
    };

    init();

  };

  return {
    link: link,
    scope: {},
    templateUrl: 'components/views/brand_users/_index.html'
  };
}]);
