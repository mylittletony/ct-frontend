'use strict';

var app = angular.module('myApp.brands.directives', []);

app.directive('userBrand', ['Brand', 'BrandName', 'User', '$routeParams', '$location', '$rootScope', 'Auth', '$pusher', 'showErrors', 'showToast', '$mdDialog', 'gettextCatalog', function(Brand, BrandName, User, $routeParams, $location, $rootScope, Auth, $pusher, showErrors, showToast, $mdDialog, gettextCatalog) {

  var link = function(scope) {

    var brand_id;
    scope.brandName = BrandName;
    scope.user      = {};
    scope.brand     = { creating: true, network_location: 'eu-west' };
    scope.locations = ['eu-west', 'us-central', 'us-west', 'asia-east'];

    var init = function() {
      User.query({id: $routeParams.id}).$promise.then(function (res) {
        scope.user = res;
        getBrand();
      });
    };

    var getBrand = function() {
      Brand.get(
        {
          id: scope.user.brand_id
        }
      ).$promise.then(function(results) {
        scope.brand           = results;
        scope.loading         = undefined;
        scope.originalUrl     = scope.brand.url;
        scope.brandName.name  = scope.brand.brand_name;
        subscribe();
      }, function(err) {
        scope.loading = undefined;
      });
    };

    scope.save = function(form) {
      form.$setPristine();
      if (scope.brand.id) {
        confirmChange();
      } else {
        create();
      }
    };

    var create = function() {
      Brand.create({
        brand: {
          cname: scope.brand.cname,
          brand_image: scope.brand.brand_image,
          brand_name: scope.brandName.name,
          url: scope.brand.url
        }
      }).$promise.then(function(results) {
        scope.brand = results;
        showToast(gettextCatalog.getString('Successfully updated brand'));
        switchBrand();
      }, function(err) {
        showErrors(err);
      });
    };

    var confirmChange = function() {
      var confirm = $mdDialog.confirm()
      .title(gettextCatalog.getString('Change Brand?'))
      .textContent(gettextCatalog.getString('Please resync all your boxes after updating your brand.'))
      .ariaLabel(gettextCatalog.getString('Change'))
      .ok(gettextCatalog.getString('Change'))
      .cancel(gettextCatalog.getString('Cancel'));
      $mdDialog.show(confirm).then(function() {
        scope.update();
      }, function() {
      });
    };

    scope.update = function() {
      Brand.update(
        {
          id: scope.brand.id,
          brand:
            {
              brand_name:         scope.brandName.name,
              url:                scope.brand.url,
              cname:              scope.brand.cname,
              brand_image:        scope.brand.brand_image,
              remove_image:       scope.brand.remove_image,
              from_email:         scope.brand.from_email,
              website:            scope.brand.website,
              from_name:          scope.brand.from_name,
              network_location:   scope.brand.network_location
            }
        }).$promise.then(function(results) {
          scope.brand       = results;
          scope.errors      = undefined;
          scope.updating    = undefined;
          scope.updateBrand = undefined;
          if (scope.brand.url !== scope.originalUrl) {
            switchBrand();
          } else {
            showToast(gettextCatalog.getString('Successfully updated brand'));
          }
        }, function(err) {
          showErrors(err);
        });
    };

    function subscribe() {
      if (typeof client !== 'undefined' && scope.subscribed === undefined) {
        scope.subscribe   = true;
        var pusher        = $pusher(client);
        var channel       = pusher.subscribe(scope.user.key);
        channel.bind('general', function(data) {
          if (data.type === 'updated_cname') {
            scope.brand.cname_status = undefined;
            showToast(gettextCatalog.getString('Updated CNAME, please login to finalise changes.'));
          }
        });
      }
    }

    var switchBrand = function() {
      var search;
      var path        = $location.path();
      if (scope.user) {
        scope.user.url = scope.brand.url;
      }
      var loginEvent  = 'login';
      var loginArgs   = {data: scope.user, path: path, search: search};
      $rootScope.$broadcast(loginEvent, loginArgs);
    };

    init();
  };

  return {
    link: link,
    scope: {
      loading: '='
    },
    templateUrl: 'components/users/branding/_form.html'
  };

}]);
