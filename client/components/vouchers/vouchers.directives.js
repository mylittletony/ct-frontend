'use strict';

var app = angular.module('myApp.vouchers.directives', []);

app.directive('listVouchers', ['Voucher', 'Location', 'SplashPage', '$location', '$routeParams', 'showToast', 'showErrors', '$mdDialog', '$q', function(Voucher, Location, SplashPage, $location, $routeParams, showToast, showErrors, $mdDialog, $q) {


  var link = function(scope) {

    scope.location = { slug: $routeParams.id };

    scope.selected = [];

    scope.options = {
      autoSelect: true,
      boundaryLinks: false,
      largeEditDialog: false,
      pageSelector: true,
      rowSelection: false
    };

    scope.query = {
      filter:     $routeParams.q,
      order:      '-created_at',
      limit:      $routeParams.per || 25,
      page:       $routeParams.page || 1,
      options:    [5,10,25,50,100],
      direction:  $routeParams.direction || 'desc'
    };

    scope.onPaginate = function (page, limit) {
      scope.query.page = page;
      scope.query.limit = limit;
      scope.updatePage();
    };

    scope.updatePage = function(item) {
      var hash            = {};
      hash.page           = scope.query.page;
      hash.predicate      = scope.predicate;
      hash.direction      = scope.query.direction;
      hash.per            = scope.query.limit;
      hash.q              = scope.query.filter;
      $location.search(hash);
      scope.init();
    };

    scope.search = function() {
      scope.searching = true;
      scope.query.page = 1;
      scope.query.limit = 25;
      scope.updatePage();
    };

    var createMenu = function() {

      // user permissions //
      scope.allowed = true;

      scope.menuItems = [];

      scope.menuItems.push({
        name: 'View',
        icon: 'pageview',
        type: 'view'
      });

      scope.menuItems.push({
        name: 'Codes',
        icon: 'receipt',
        type: 'codes'
      });

      scope.menuItems.push({
        name: 'Delete',
        icon: 'delete_forever',
        type: 'delete'
      });

    };

    scope.action = function(id,type) {
      switch(type) {
        case 'codes':
          codes(id);
          break;
        case 'view':
          view(id);
          break;
        case 'settings':
          edit(id);
          break;
        case 'delete':
          destroy(id);
          break;
      }
    };

    scope.isActive = function(voucher,type) {
      return (!voucher.completed && (type === 'codes' || type === 'delete'));
    };

    var destroy = function(id) {
      var confirm = $mdDialog.confirm()
      .title('Delete Vouchers')
      .textContent('Are you sure you want to delete these vouchers?')
      .ariaLabel('Delete Vouchers')
      .ok('Delete')
      .cancel('Cancel');
      $mdDialog.show(confirm).then(function() {
        scope.destroy(id);
      }, function() {
      });
    };

    scope.destroy = function(id) {
      Voucher.destroy({id: id, location_id: scope.location.slug}).$promise.then(function(results) {
        removeFromList(id);
      }, function(err) {
        showErrors(err);
      });
    };

    var removeFromList = function(id) {
      for (var i = 0, len = scope.vouchers.length; i < len; i++) {
        if (scope.vouchers[i].unique_id === id) {
          scope.vouchers.splice(i, 1);
          showToast('Vouchers successfully deleted.');
          break;
        }
      }
    };

    scope.init = function() {
      var deferred = $q.defer();
      scope.promise = deferred.promise;
      return Voucher.get({location_id: scope.location.slug, q: $routeParams.q, page: scope.query.page, per: scope.query.limit}).$promise.then(function(data) {
        scope.vouchers   = data.vouchers;
        scope._links     = data._links;
        scope.loading    = undefined;
        createMenu();
        deferred.resolve();
      }, function(err) {
        scope.loading    = undefined;
        deferred.resolve();
      });
    };

    scope.create = function() {
      window.location.href = '/#/locations/' + scope.location.slug + '/vouchers/new';
    };

    var view = function(id) {
      window.location.href = '/#/locations/' + scope.location.slug + '/vouchers/' + id;
    };

    var edit = function(id) {
      window.location.href = '/#/locations/' + scope.location.slug + '/vouchers/' + id + '/edit';
    };

    var codes = function(id) {
      window.location.href = '/#/locations/' + scope.location.slug + '/vouchers/' + id + '/codes';
    };

    scope.init();

  };

  return {
    link: link,
    scope: {
      loading: '='
    },
    templateUrl: 'components/vouchers/_index.html'
  };

}]);

app.directive('newVoucher', ['Voucher', 'Location', 'SplashPage', '$location', '$routeParams', 'showToast', 'showErrors', 'menu', function(Voucher, Location, SplashPage, $location, $routeParams, showToast, showErrors, menu) {

  var link = function(scope) {

    scope.voucher   = {};
    scope.location  = { slug: $routeParams.id };

    scope.voucher.secure_password         = true;
    scope.voucher.quantity                = 10;
    scope.voucher.validity_minutes        = 60;
    scope.voucher.access_type             = 1;
    scope.voucher.download_speed          = 2048;
    scope.voucher.upload_speed            = 1024;
    scope.voucher.session_timeout         = 60;
    scope.voucher.idle_timeout            = 60;
    scope.voucher.simultaneous_use        = 2;
    scope.voucher.limit_type              = 'multi_use';
    scope.voucher.access_restrict_period  = '';
    scope.voucher.voucher_format          = 'alphanumeric';

    scope.access_types                = [{ key: 'Time', value: 1}, {key: 'Data', value: 2}];
    scope.access_restrict_periods     = [{key: 'All Time, multi-use', value: '' }, { key: 'Daily, multi-use', value: 'daily'}, {key: 'Weekly, multi-use', value: 'weekly'}, {key: 'Monthly, multi-use', value: 'monthly'}, { key: 'Single-use', value: 'all'}];
    scope.voucher_formats             = [{key:'Numbers and letters', value: 'alphanumeric'}, {key: 'Numbers only', value: 'numeric'}, { key: 'Letters only', value: 'alpha'}, {key: 'Alice in Wonderland', value: 'words'}];

    scope.toggle = function(section) {
      menu.toggleSelectSection(section);
    };

    scope.isOpen = function(section) {
      return menu.isSectionSelected(section);
    };

    var init = function() {
      SplashPage.query({location_id: scope.location.slug}).$promise.then(function(results) {
        if (results && results.splash_pages) {
          scope.splash_pages = results.splash_pages;
          if (scope.splash_pages.length === 0) {
            scope.voucher.splash_page_id = undefined;
          } else if (scope.splash_pages.length === 1) {
            scope.voucher.splash_page_id = scope.splash_pages[0].id;
          } else if ( scope.splash_pages.length > 1 ) {
            replaceUniqueId();
          }
        } else {
          scope.voucher.splash_page_id = undefined;
        }
        scope.loading = undefined;
      }, function(err) {
        scope.loading = undefined;
      });
    };

    function replaceUniqueId() {
      angular.forEach(scope.splash_pages, function(v,k) {
        v.unique_name = v.splash_name || v.unique_id;
      });
    }

    scope.save = function() {
      Voucher.create({location_id: scope.location.slug, voucher: scope.voucher}).$promise.then(function(results) {
        $location.path('/locations/'+ scope.location.slug + '/vouchers/' + results.unique_id);
        showToast('Voucher created successfully');
      }, function(err) {
        showErrors(err);
      });
    };

    scope.back = function() {
      window.location.href = '/#/locations/' + scope.location.slug + '/vouchers';
    };

    init();

  };

  return {
    link: link,
    scope: {
      loading: '='
    },
    templateUrl: 'components/vouchers/_new.html'
  };

}]);

app.directive('showVoucher', ['Voucher', '$routeParams', '$location', '$pusher', '$rootScope', 'Auth', '$route', 'menu', 'showToast', 'showErrors', '$mdDialog', function(Voucher, $routeParams, $location, $pusher, $rootScope, Auth, $route, menu, showToast, showErrors, $mdDialog) {

  var link = function(scope) {

    scope.location  = { slug: $routeParams.id };

    var createMenu = function() {

      // user permissions //

      scope.menu = [];

      scope.menu.push({
        name: 'Edit',
        icon: 'settings',
        type: 'settings',
        disabled: !scope.voucher.completed
      });

      scope.menu.push({
        name: 'Codes',
        icon: 'receipt',
        type: 'codes',
        disabled: !scope.voucher.completed
      });

      scope.menu.push({
        name: 'New',
        icon: 'add_circle_outline',
        type: 'new'
      });

      scope.menu.push({
        name: 'Delete',
        icon: 'delete_forever',
        type: 'delete',
        disabled: !scope.voucher.completed
      });

    };

    scope.action = function(type) {
      switch(type) {
        case 'settings':
          scope.edit();
          break;
        case 'duplicate':
          duplicate();
          break;
        case 'new':
          newVoucher();
          break;
        case 'codes':
          codes();
          break;
        case 'delete':
          destroy();
          break;
      }
    };


    if ($routeParams.comp === 'true') {
      $location.search({});
    }

    Voucher.get({location_id: scope.location.slug, id: $routeParams.voucher_id}).$promise.then(function(results) {
      scope.voucher = results;
      scope.loading = undefined;
      createMenu();
      loadPusher();
    }, function(err) {
      scope.loading = undefined;
    });

    var destroy = function(network) {
      var confirm = $mdDialog.confirm()
      .title('Delete Voucher')
      .textContent('Are you sure you want to delete this voucher?')
      .ariaLabel('Delete Voucher')
      .ok('Delete')
      .cancel('Cancel');
      $mdDialog.show(confirm).then(function() {
        scope.destroy(network);
      }, function() {
      });
    };

    scope.destroy = function() {
      Voucher.destroy({id: scope.voucher.unique_id, location_id: scope.location.slug}).$promise.then(function(results) {
        $location.path('/locations/' + scope.location.slug + '/vouchers/');
        showToast('Successfully delete voucher.');
      }, function(err) {
        showErrors(err);
      });
    };

    var duplicate = function() {
      $mdDialog.show({
        templateUrl: 'components/vouchers/_copy.html',
        parent: angular.element(document.body),
        clickOutsideToClose: true,
        controller: DialogController,
        locals: {
          loading: scope.loading,
          network: scope.network
        }
      });
    };

    function DialogController ($scope) {
      $scope.close = function() {
        $mdDialog.cancel();
      };
    }
    DialogController.$inject = ['$scope'];

    scope.regenerateLink = function() {
      scope.voucher.state = 'regenerating';
      Voucher.update({
        location_id: scope.location.slug,
        id: $routeParams.voucher_id,
        voucher: {
          regenerate_link: true
        }
      }).$promise.then(function(results) {
        showToast('Download links regenerated');
        scope.voucher.csv_link  = results.csv_link;
        scope.voucher.pdf_link  = results.pdf_link;
      }, function(err) {
        showErrors(err);
      });
    };

    var channel, pusherLoaded;

    function loadPusher() {
      if (pusherLoaded === undefined) {
        pusherLoaded = true;
        if (Auth.currentUser() && Auth.currentUser().key) {
          var key = Auth.currentUser().key;
          var pusher = $pusher(client);
          channel = pusher.subscribe('private-' + key);
          channel.bind('vouchers_general', function(data) {
            var msg;
            try{
              msg = JSON.parse(data.message);
            } catch(e) {
              msg = data.message;
            }

            $location.search({comp: 'true'});
            $route.reload();
          });
        }
      }
    }

    scope.toggle = function(section) {
      menu.toggleSelectSection(section);
    };

    scope.isOpen = function(section) {
      return menu.isSectionSelected(section);
    };

    scope.back = function() {
      window.location.href = '/#/locations/' + scope.location.slug + '/vouchers';
    };

    var newVoucher = function() {
      window.location.href = '/#/locations/' + scope.location.slug + '/vouchers/new';
    };

    var codes = function() {
      window.location.href = '/#/locations/' + scope.location.slug + '/vouchers/' + scope.voucher.unique_id + '/codes';
    };

    scope.edit = function() {
      window.location.href = '/#/locations/' + scope.location.slug + '/vouchers/' + scope.voucher.unique_id + '/edit';
    };

    $rootScope.$on('$routeChangeStart', function (event, next, current) {
      if (channel) {
        channel.unbind();
      }
    });

  };

  return {
    link: link,
    scope: {
      loading: '='
    },
    templateUrl: 'components/vouchers/_show.html'
  };

}]);

app.directive('editVoucher', ['Voucher', '$routeParams', '$location', 'menu', 'showToast', 'showErrors', '$mdDialog', 'gettextCatalog', function(Voucher, $routeParams, $location, menu, showToast, showErrors, $mdDialog, gettextCatalog) {

  var link = function(scope) {

    scope.location  = { slug: $routeParams.id };

    scope.access_types                = [{ key: 'Time', value: 1}, {key: 'Data', value: 2}];
    scope.access_restrict_periods     = [{key: 'All Time, multi-use', value: '' }, { key: 'Daily, multi-use', value: 'daily'}, {key: 'Weekly, multi-use', value: 'weekly'}, {key: 'Monthly, multi-use', value: 'monthly'}, { key: 'Single-use', value: 'all'}];
    scope.voucher_formats             = [{key:'Numbers and letters', value: 'alphanumeric'}, {key: 'Numbers only', value: 'numeric'}, { key: 'Letters only', value: 'alpha'}, {key: 'Alice in Wonderland', value: 'words'}];

    scope.toggle = function(section) {
      menu.toggleSelectSection(section);
    };

    scope.isOpen = function(section) {
      return menu.isSectionSelected(section);
    };

    scope.save = function() {
      Voucher.update({
        location_id: scope.location.slug,
        id: $routeParams.voucher_id,
        voucher: scope.voucher
      }).$promise.then(function(results) {
        $location.path('/locations/'+ scope.location.slug + '/vouchers/' + results.unique_id);
        showToast('Voucher successfully updated');
      }, function(err) {
        showErrors(err);
      });
    };

    scope.enableDisableWarn = function(val) {
      var msg;
      if (val === true) {
        msg = gettextCatalog.getString('Reactivating the batch will enable all associated codes.');
      } else {
        msg = gettextCatalog.getString('Disabling the batch will disable all the associated codes.');
      }
      var confirm = $mdDialog.confirm()
        .title(gettextCatalog.getString('Disable Voucher Batch'))
        .textContent(msg)
        .ariaLabel(gettextCatalog.getString('Disable / Enable Batch'))
        .ok(gettextCatalog.getString('OK'));
      $mdDialog.show(confirm).then(function() {
        $mdDialog.cancel();
      });
    };

    var init = function() {
      Voucher.get({location_id: scope.location.slug, id: $routeParams.voucher_id}).$promise.then(function(results) {
        scope.voucher = results;
        if (!scope.voucher.access_restrict_period) {
          scope.voucher.access_restrict_period = '';
        }
        scope.loading = undefined;
      }, function(err) {
        scope.loading = undefined;
      });
    };

    scope.back = function() {
      window.location.href = '/#/locations/' + scope.location.slug + '/vouchers/' + scope.voucher.unique_id;
    };

    init();

  };

  return {
    link: link,
    scope: {
      loading: '='
    },
    templateUrl: 'components/vouchers/_edit.html'
  };

}]);
