'use strict';

var app = angular.module('myApp.brands.directives', []);

app.directive('listBrands', ['Brand', '$routeParams', '$location', '$rootScope', 'Auth', '$pusher', 'showErrors', 'showToast', '$mdDialog', 'gettextCatalog', 'menu', 'pagination_labels', function(Brand, $routeParams, $location, $rootScope, Auth, $pusher, showErrors, showToast, $mdDialog, gettextCatalog, menu, pagination_labels) {

  var link = function(scope) {

    menu.isOpen = false;
    menu.hideBurger = true;
    menu.sectionName = gettextCatalog.getString('Brands');

    scope.options = {
      boundaryLinks: false,
      largeEditDialog: false,
      pageSelector: false,
      rowSelection: false
    };

    scope.pagination_labels = pagination_labels;
    scope.query = {
      order:      'updated_at',
      filter:     $routeParams.q,
      limit:      $routeParams.per || 25,
      page:       $routeParams.page || 1,
      options:    [5,10,25,50,100],
      direction:  $routeParams.direction || 'desc'
    };

    var init = function() {
      Brand.query({}).$promise.then(function(results) {
        scope.brands  = results.brands;
        scope._links  = results._links;
        scope.loading = undefined;
      }, function(err) {
        console.log(err);
        scope.brands = [];
        scope.loading = undefined;
      });
    };

    init();

  };

  return {
    link: link,
    scope: {
      loading: '='
    },
    templateUrl: 'components/views/brands/_index.html'
  };

}]);

app.directive('newBrand', ['Brand', 'BrandName', '$routeParams', '$location', '$rootScope', 'Auth', '$pusher', 'showErrors', 'showToast', '$mdDialog', 'gettextCatalog', 'menu', 'pagination_labels', function(Brand, BrandName, $routeParams, $location, $rootScope, Auth, $pusher, showErrors, showToast, $mdDialog, gettextCatalog, menu, pagination_labels) {

  var link = function(scope) {

    menu.isOpen = false;
    menu.hideBurger = true;
    menu.sectionName = gettextCatalog.getString('Brands');

    scope.brandName = BrandName;
    scope.brandName.name = 'Acme Inc';

    scope.locations = ['eu-west', 'us-central', 'us-west', 'asia-east'];
    scope.locales = [
      { key: 'Deutsch', value: 'de-DE' },
      { key: 'English', value: 'en-GB' }
    ];

    scope.brand     = {
      locale: 'en-GB',
      network_location: 'eu-west',
    };

    scope.save = function(form) {
      form.$setPristine();
      scope.brand.brand_name = scope.brandName.name;
      Brand.create({}, scope.brand
      ).$promise.then(function(results) {
        $location.path('/brands/'+results.id);
        showToast(gettextCatalog.getString('Successfully created brand'));
      }, function(err) {
        showErrors(err);
      });
    };

  };

  return {
    link: link,
    scope: {
      loading: '='
    },
    templateUrl: 'components/views/brands/_new.html'
  };

}]);

app.directive('brand', ['Brand', '$routeParams', '$location', '$rootScope', 'Auth', '$pusher', 'showErrors', 'showToast', '$mdDialog', 'gettextCatalog', 'menu', 'pagination_labels', function(Brand, $routeParams, $location, $rootScope, Auth, $pusher, showErrors, showToast, $mdDialog, gettextCatalog, menu, pagination_labels) {

  var link = function(scope) {

    scope.locations = ['eu-west', 'us-central', 'us-west', 'asia-east'];
    scope.locales = [
      { key: 'Deutsch', value: 'de-DE' },
      { key: 'English', value: 'en-GB' }
    ];

    var init = function() {
      Brand.get({id: $routeParams.id}).$promise.then(function(results) {
        scope.brand = results;
        menu.header = results.brand_name;
        scope.loading = undefined;
      }, function(err) {
        console.log(err);
        // scope.loading = undefined;
      });
    };

    var update = function() {
      Brand.update({},
        {
          id: scope.brand.id,
          brand: scope.brand
        }).$promise.then(function(results) {
          scope.brand       = results;
          // scope.errors      = undefined;
          // scope.updating    = undefined;
          // scope.updateBrand = undefined;
          showToast(gettextCatalog.getString('Successfully updated brand'));
        }, function(err) {
          showErrors(err);
        });
    };

    var confirmChange = function() {
      var confirm = $mdDialog.confirm()
      .title(gettextCatalog.getString('Confirm Update'))
      .textContent(gettextCatalog.getString('You may need to resync your boxes after updating your brand.'))
      .ariaLabel(gettextCatalog.getString('Change'))
      .ok(gettextCatalog.getString('Change'))
      .cancel(gettextCatalog.getString('Cancel'));
      $mdDialog.show(confirm).then(function() {
        update();
      }, function() {
      });
    };

    scope.save = function(form) {
      form.$setPristine();
      confirmChange();
    };

    init();
  };

  return {
    link: link,
    scope: {
      loading: '='
    },
    templateUrl: 'components/views/brands/_show.html'
  };

}]);

app.directive('brandTheme', ['Brand', '$routeParams', '$location', '$rootScope', 'Auth', '$pusher', 'showErrors', 'showToast', '$mdDialog', 'gettextCatalog', 'menu', 'pagination_labels', 'Theme', '$cookies', function(Brand, $routeParams, $location, $rootScope, Auth, $pusher, showErrors, showToast, $mdDialog, gettextCatalog, menu, pagination_labels, Theme, $cookies) {

  var link = function(scope) {

    scope.themes = [
      { val: 'Pink', key: 'pink' },
      { val: 'Orange', key: 'orange' },
      { val: 'Deep Orange', key: 'deep-orange' },
      { val: 'Blue', key: 'blue' },
      { val: 'Blue Grey', key: 'blue-grey' },
      { val: 'Light Blue', key: 'light-blue' },
      { val: 'Red', key: 'red' },
      { val: 'Green', key: 'green' },
      { val: 'Light Green', key: 'light-green' },
      { val: 'Lime', key: 'lime' },
      { val: 'Yellow', key: 'yellow' },
      { val: 'Teal', key: 'teal' },
      { val: 'Brown', key: 'brown' },
      { val: 'Purple', key: 'purple' },
      { val: 'Deep Purple', key: 'deep-purple' },
      { val: 'Cyan', key: 'cyan' },
      { val: 'Yellow', key: 'yellow' },
      { val: 'Amber', key: 'amber' },
      { val: 'Indigo', key: 'indigo' },
      { val: 'Brown', key: 'brown' },
      { val: 'Grey', key: 'grey' },
      // { val: 'Black', key: 'black' }
    ];

    var init = function() {
      Brand.get({id: $routeParams.id}).$promise.then(function(results) {
        scope.brand = results;
        menu.header = results.brand_name;
        scope.loading = undefined;
      }, function(err) {
        console.log(err);
        // scope.loading = undefined;
      });
    };

    scope.swatchPrimary = function() {
      $rootScope.theme = scope.brand.theme_primary;
    };

    var update = function() {
      Brand.update({},
        {
          id: scope.brand.id,
          brand: {
            theme_primary: scope.brand.theme_primary,
            theme_accent: scope.brand.theme_accent
          }
        }).$promise.then(function(results) {
          $cookies.put('_ctt', results.theme_primary + '.' + results.theme_accent);
          // scope.brand       = results;
          showToast(gettextCatalog.getString('Successfully updated brand'));
        }, function(err) {
          showErrors(err);
        });
    };

    // var themeColors = _theme.colors;
    // console.log(themeColors);

    scope.save = function(form) {
      form.$setPristine();
      update();
    };

    init();
  };

  return {
    link: link,
    scope: {
      loading: '='
    },
    // reload: generateTheme,
    templateUrl: 'components/views/brands/theme/_index.html'
  };

}]);
