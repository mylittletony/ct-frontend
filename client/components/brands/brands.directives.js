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
        // scope.loading = undefined;
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

    // var init = function() {
    //   Brand.query({}).$promise.then(function(results) {
    //     scope.brands  = results.brands;
    //     scope._links  = results._links;
    //     scope.loading = undefined;
    //   }, function(err) {
    //     console.log(err);
    //     // scope.loading = undefined;
    //   });
    // };

    // init();

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

// app.directive('userBrand', ['Brand', 'BrandName', 'User', '$routeParams', '$location', '$rootScope', 'Auth', '$pusher', 'showErrors', 'showToast', '$mdDialog', 'gettextCatalog', function(Brand, BrandName, User, $routeParams, $location, $rootScope, Auth, $pusher, showErrors, showToast, $mdDialog, gettextCatalog) {

//   var link = function(scope) {

//     var brand_id;
//     scope.brandName = BrandName;
//     scope.user      = {};
//     scope.brand     = { creating: true, network_location: 'eu-west' };
//     scope.locations = ['eu-west', 'us-central', 'us-west', 'asia-east'];

//     var init = function() {
//       User.query({id: $routeParams.id}).$promise.then(function (res) {
//         scope.user = res;
//         if (scope.user.invited_by) {
//           scope.loading = undefined;
//         } else {
//           getBrand();
//         }
//       });
//     };

//     var getBrand = function() {
//       Brand.get(
//         {
//           id: scope.user.brand_id
//         }
//       ).$promise.then(function(results) {
//         scope.brand           = results;
//         scope.loading         = undefined;
//         scope.originalUrl     = scope.brand.url;
//         scope.brandName.name  = scope.brand.brand_name;
//         subscribe();
//       }, function(err) {
//         scope.brandName.name = 'Acme Inc';
//         scope.brand.admin = true;
//         scope.loading = undefined;
//       });
//     };

//     scope.save = function(form) {
//       form.$setPristine();
//       if (scope.brand.id) {
//         confirmChange();
//       } else {
//         create();
//       }
//     };

//     var create = function() {
//       Brand.create({
//         brand: {
//           cname: scope.brand.cname,
//           brand_image: scope.brand.brand_image,
//           brand_name: scope.brandName.name,
//           url: scope.brand.url
//         }
//       }).$promise.then(function(results) {
//         scope.brand = results;
//         showToast(gettextCatalog.getString('Successfully updated brand'));
//         switchBrand();
//       }, function(err) {
//         showErrors(err);
//       });
//     };

//     var confirmChange = function() {
//       var confirm = $mdDialog.confirm()
//       .title(gettextCatalog.getString('Change Brand?'))
//       .textContent(gettextCatalog.getString('Please resync all your boxes after updating your brand.'))
//       .ariaLabel(gettextCatalog.getString('Change'))
//       .ok(gettextCatalog.getString('Change'))
//       .cancel(gettextCatalog.getString('Cancel'));
//       $mdDialog.show(confirm).then(function() {
//         scope.update();
//       }, function() {
//       });
//     };

//     scope.update = function() {
//       Brand.update(
//         {
//           id: scope.brand.id,
//           brand:
//             {
//               brand_name:         scope.brandName.name,
//               url:                scope.brand.url,
//               cname:              scope.brand.cname,
//               brand_image:        scope.brand.brand_image,
//               remove_image:       scope.brand.remove_image,
//               from_email:         scope.brand.from_email,
//               website:            scope.brand.website,
//               from_name:          scope.brand.from_name,
//               network_location:   scope.brand.network_location
//             }
//         }).$promise.then(function(results) {
//           scope.brand       = results;
//           scope.errors      = undefined;
//           scope.updating    = undefined;
//           scope.updateBrand = undefined;
//           if (scope.brand.url !== scope.originalUrl) {
//             switchBrand();
//           } else {
//             showToast(gettextCatalog.getString('Successfully updated brand'));
//           }
//         }, function(err) {
//           showErrors(err);
//         });
//     };

//     function subscribe() {
//       if (typeof client !== 'undefined' && scope.subscribed === undefined) {
//         scope.subscribe   = true;
//         var pusher        = $pusher(client);
//         var channel       = pusher.subscribe(scope.user.key);
//         channel.bind('general', function(data) {
//           if (data.type === 'updated_cname') {
//             scope.brand.cname_status = undefined;
//             showToast(gettextCatalog.getString('Updated CNAME, please login to finalise changes.'));
//           }
//         });
//       }
//     }

//     var switchBrand = function() {
//       var search;
//       var path        = $location.path();
//       if (scope.user) {
//         scope.user.url = scope.brand.url;
//       }
//       var loginEvent  = 'login';
//       var loginArgs   = {data: scope.user, path: path, search: search};
//       $rootScope.$broadcast(loginEvent, loginArgs);
//     };

//     init();
//   };

//   return {
//     link: link,
//     scope: {
//       loading: '='
//     },
//     templateUrl: 'components/users/branding/_form.html'
//   };

// }]);
