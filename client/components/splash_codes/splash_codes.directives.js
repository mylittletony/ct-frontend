'use strict';

var app = angular.module('myApp.splash_codes.directives', []);

app.directive('listSplashCodes', ['Location', 'SplashCode', '$routeParams', '$location', '$q', '$mdDialog', 'showToast', 'showErrors', 'gettextCatalog', 'pagination_labels', function(Location,SplashCode,$routeParams,$location,$q,$mdDialog,showToast,showErrors, gettextCatalog, pagination_labels) {

  var link = function(scope,element,attrs) {

    Location.get({id: $routeParams.id}, function(data) {
      scope.location = data;
    }, function(err){
      console.log(err);
    });

    scope.currentNavItem = 'codes'

    scope.location = { slug: $routeParams.id };

    scope.options = {
      autoSelect: true,
      boundaryLinks: false,
      largeEditDialog: false,
      pageSelector: true,
      rowSelection: false
    };

    scope.pagination_labels = pagination_labels;
    scope.query = {
      filter:     $routeParams.q,
      order:      '-expires',
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
      init();
    };

    // scope.search = function() {
    //   scope.searching = true;
    //   scope.query.page = 1;
    //   scope.query.limit = 25;
    //   scope.updatePage();
    // };

    // User permissions //
    scope.allowed = true;
    var createMenu = function() {

      // user permissions //
      scope.allowed = true;

      scope.menuItems = [];

      scope.menuItems.push({
        name: gettextCatalog.getString('View'),
        icon: 'pageview',
        type: 'view'
      });

      scope.menuItems.push({
        name: gettextCatalog.getString('Disable'),
        icon: 'clear',
        type: 'disable'
      });

      // scope.menuItems.push({
      //   name: gettextCatalog.getString('Sessions'),
      //   icon: 'data_usage',
      //   type: 'sessions'
      // });

      scope.menuItems.push({
        name: gettextCatalog.getString('Delete'),
        icon: 'delete_forever',
        type: 'delete'
      });

    };

    scope.action = function(code,type) {
      switch(type) {
        case 'view':
          view(code.id);
          break;
        case 'sessions':
          sessions(code);
          break;
        case 'disable':
          update(code);
          break;
        case 'delete':
          destroy(code.id);
          break;
      }
    };

    scope.isActive = function(code,type) {
      return (!code.valid && type === 'disable');
    };

    var destroy = function(id) {
      var confirm = $mdDialog.confirm()
      .title(gettextCatalog.getString('Delete Code'))
      .textContent(gettextCatalog.getString('Are you sure you want to delete this code?'))
      .ariaLabel(gettextCatalog.getString('Delete Code'))
      .ok(gettextCatalog.getString('Delete'))
      .cancel(gettextCatalog.getString('Cancel'));
      $mdDialog.show(confirm).then(function() {
        scope.destroy(id);
      }, function() {
      });
    };

    scope.destroy = function(id) {
      SplashCode.destroy({location_id: scope.location.slug, id: id}).$promise.then(function(results) {
        removeFromList(id);
      }, function(err) {
        showErrors(err);
      });
    };

    var removeFromList = function(id) {
      for (var i = 0, len = scope.splash_codes.length; i < len; i++) {
        if (scope.splash_codes[i].id === id) {
          scope.splash_codes.splice(i, 1);
          showToast(gettextCatalog.getString('Code successfully deleted.'));
          break;
        }
      }
    };

    var update = function(code) {
      code.active = !code.active;
      SplashCode.update({location_id: scope.location.slug, id: code.id, splash_code: { active: code.active }}).$promise.then(function(results) {
        var text = code.active ? gettextCatalog.getString('activated') : gettextCatalog.getString('disabled');
        showToast(gettextCatalog.getString('Code {{text}} successfully.', {text: text}));
      }, function(err) {
        code.active = !code.active;
        showErrors(err);
      });

    };

    var init = function() {
      var deferred = $q.defer();
      scope.promise = deferred.promise;
      SplashCode.get({
        location_id: scope.location.slug,
        per: scope.query.limit,
        q: scope.query.filter
      }).$promise.then(function(results) {
        scope.splash_codes = results.splash_codes;
        scope.loading = undefined;
        createMenu();
        deferred.resolve();
      }, function(error) {
        deferred.resolve();
      });
    };

    scope.create = function(id) {
      window.location.href = '/#/' + scope.location.slug + '/splash_codes/new';
    };

    var view = function(id) {
      window.location.href = '/#/' + scope.location.slug + '/splash_codes/' + id;
    };

    var sessions = function(code) {
      window.location.href = '/#/' + scope.location.slug + '/splash_codes/' + code.id + '/sessions/' + code.username;
    };

    init();
  };

  return {
    link: link,
    scope: {
      loading: '='
    },
    templateUrl: 'components/splash_codes/_index.html'
  };

}]);

app.directive('createSplashCode', ['SplashCode', 'SplashPage', 'Code', '$routeParams', '$location', 'showToast', 'showErrors', 'gettextCatalog', function(SplashCode,SplashPage,Code,$routeParams,$location,showToast,showErrors, gettextCatalog) {

  var link = function(scope,element,attrs) {

    scope.location  = {slug: $routeParams.id};

    var date = new Date();
    var today_date = new Date(date);
    date.setDate(date.getDate() + 1);
    date = new Date(date);

    scope.myDate = new Date();
    scope.minDate = new Date(
      scope.myDate.getFullYear(),
      scope.myDate.getMonth(),
      scope.myDate.getDate() + 1
    );

    var offset = new Date().getTimezoneOffset();

    scope.code      = {
      download_speed:   2056,
      upload_speed:     1024,
      simultaneous_use: 2,
      volume:           60,
      expires:          date,
      start_date:       today_date,
      period:           'daily',
      offset:           offset
    };

    var init = function() {
      getSplash(scope.location.slug);
    };

    function getSplash(slug) {
      SplashPage.query({location_id: scope.location.slug}).$promise.then(function(results) {
        if (results && results.splash_pages) {
          scope.splash_pages = results.splash_pages;
          if (scope.splash_pages.length === 0) {
            scope.code.splash_page_id = undefined;
          } else if (scope.splash_pages.length === 1) {
            scope.code.splash_page_id = scope.splash_pages[0].id;
          } else if ( scope.splash_pages.length > 1 ) {
            replaceUniqueId();
          }
          scope.loadingSplash = undefined;
        } else {
          scope.loadingSplash = undefined;
          scope.code.splash_page_id = undefined;
        }
        scope.loading = undefined;
      }, function(err) {
        // no error handling here yet //
      });
    }

    scope.save = function(form) {
      form.$setPristine();
      SplashCode.create({location_id: scope.location.slug, splash_code: scope.code}).$promise.then(function(results) {
        $location.path('/' + scope.location.slug + '/splash_codes/' + results.id);
        showToast(gettextCatalog.getString('Successfully generated password'));
      }, function(err) {
        showErrors(err);
      });
    };

    // scope.random = function(form) {
    //   scope.randomising = true;
    //   Code.generate_password().$promise.then(function(results) {
    //     var rand = Math.round(Math.random() * 1000);
    //     scope.code.password = results.password + '-' + rand;
    //     scope.randomising = undefined;
    //     form.$pristine = false;
    //   }, function() {
    //     scope.error = true;
    //     scope.randomising = undefined;
    //   });
    // };

    function replaceUniqueId() {
      angular.forEach(scope.splash_pages, function(v,k) {
        v.unique_name = v.splash_name || gettextCatalog.getString('No name / ') + v.unique_id;
      });
    }

    scope.back = function() {
      window.location.href = '/#/' + scope.location.slug + '/splash_codes';
    };

    init();
  };

  return {
    link: link,
    scope: {
      loading: '='
    },
    templateUrl: 'components/splash_codes/_edit.html'
  };

}]);

app.directive('showSplashCode', ['Location', 'SplashCode', '$routeParams', '$location', '$mdDialog', 'showToast', 'showErrors', 'gettextCatalog', function(Location,SplashCode,$routeParams,$location,$mdDialog,showToast,showErrors, gettextCatalog) {

  var link = function(scope,element,attrs) {

    Location.get({id: $routeParams.id}, function(data) {
      scope.location = data;
    }, function(err){
      console.log(err);
    });

    scope.location  = {slug: $routeParams.id};

    var createMenu = function() {

      // user permissions //

      scope.menu = [];

      scope.menu.push({
        name: gettextCatalog.getString('Sessions'),
        icon: 'data_usage',
        type: 'sessions'
      });

      scope.menu.push({
        name: gettextCatalog.getString('New'),
        icon: 'add_circle_outline',
        type: 'new'
      });

      scope.menu.push({
        name: gettextCatalog.getString('Delete'),
        icon: 'delete_forever',
        type: 'delete'
      });

    };

    scope.action = function(type) {
      switch(type) {
        case 'new':
          newCode();
          break;
        case 'sessions':
          sessions();
          break;
        case 'delete':
          scope.destroy();
          break;
      }
    };

    scope.init = function() {
      SplashCode.query({location_id: scope.location.slug, id: $routeParams.splash_code_id}).$promise.then(function(results) {
        scope.splash_code = results;
        scope.loading = undefined;
        createMenu();
      }, function(err) {
      });
    };

    scope.update = function() {
      SplashCode.update({location_id: scope.location.slug, id: scope.splash_code.id, splash_code: scope.splash_code}).$promise.then(function(results) {
      }, function(err) {
      });

    };

    scope.destroy = function() {
      var confirm = $mdDialog.confirm()
      .title(gettextCatalog.getString('Delete Code'))
      .textContent(gettextCatalog.getString('Are you sure you want to delete this code?'))
      .ariaLabel(gettextCatalog.getString('Delete Code'))
      .ok(gettextCatalog.getString('Delete'))
      .cancel(gettextCatalog.getString('Cancel'));
      $mdDialog.show(confirm).then(function() {
        destroyCode();
      }, function() {
      });
    };

    var destroyCode = function() {
      SplashCode.destroy({location_id: scope.location.slug, id: scope.splash_code.id}).$promise.then(function(results) {
        $location.path('/' + scope.location.slug + '/splash_codes');
        showToast(gettextCatalog.getString('Code successfully deleted.'));
      }, function(err) {
        showErrors(err);
      });
    };

    scope.back = function() {
      window.location.href = '/#/' + scope.location.slug + '/splash_codes';
    };

    var sessions = function() {
      window.location.href = '/#/' + scope.location.slug + '/splash_codes/' + scope.splash_code.id + '/sessions/' + scope.splash_code.username;
    };

    var newCode = function() {
      window.location.href = '/#/' + scope.location.slug + '/splash_codes/new';
    };

    scope.init();
  };

  return {
    link: link,
    scope: {
      loading: '='
    },
    templateUrl: 'components/splash_codes/_show.html'
  };

}]);
