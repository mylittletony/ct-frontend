'use strict';

var app = angular.module('myApp.controllers', [

  'myApp.authentications.controller',
  'myApp.boxes.controller',
  'myApp.events.controller',
  'myApp.heartbeats.controller',
  'myApp.jobs.controller',
  'myApp.invoices.controller',
  'myApp.locations.controller',
  'myApp.port_forwards.controller',
  'myApp.reports.controller',
  'myApp.speedtests.controller',
  'myApp.splash_pages.controller',
  'myApp.registrations.controller',
  'myApp.zones.controller',
  'myApp.users.controller',
  'myApp.vouchers.controller'
]);

app.controller('MainCtrl', ['$rootScope', '$scope', '$localStorage', '$window', '$location', '$routeParams', 'AccessToken', 'RefreshToken', 'Auth', 'API_END_POINT', '$pusher', '$route', 'onlineStatus', '$cookies', 'Brand', 'locationHelper', 'BrandName', 'CTLogin', 'User', 'Me', 'AUTH_URL', 'menu', 'designer', '$mdSidenav', 'docs', '$mdMedia', '$q', 'INTERCOM', 'PUSHER', 'gettextCatalog', 'Translate',

  function ($rootScope, $scope, $localStorage, $window, $location, $routeParams, AccessToken, RefreshToken, Auth, API, $pusher, $route, onlineStatus, $cookies, Brand, locationHelper, BrandName, CTLogin, User, Me, AUTH_URL, menu, designer, $mdSidenav, docs, $mdMedia, $q, INTERCOM, PUSHER, gettextCatalog, Translate) {

    $scope.ct_login = CTLogin;
    // $rootScope.CONFIG = CONFIG;

    // Zak Moonman - bonjour move these into something separate
    docs.url['find-mac'] = 'http://docs.cucumberwifi.io/article/112-finding-your-mac-address';
    docs.url['getting-started'] = 'http://docs.cucumberwifi.io/category/403-getting-started';
    docs.url['firmware'] = 'http://docs.cucumberwifi.io/category/403-getting-started';
    docs.url['walled-gardens'] = 'http://docs.cucumberwifi.io/article/91-walled-gardens';
    docs.url['branding'] = 'http://docs.cucumberwifi.io/article/229-branding-your-dashboard-login';
    // Zak Moonman - bonjour move these into something separate

    function isOpen(section) {
      return (menu.isSectionSelected(section) && menu.isOpen());
    }

    $scope.toggle = function(section){
      $mdSidenav(section || 'left').toggle();
    };

    var toggleOpen = function(){
      if ($mdMedia('gt-sm')) {
        vm.menu.isOpenLeft = false;
        menu.isOpen = !menu.isOpen;
        vm._ctm = !vm._ctm;
        $cookies.put('_ctm', !menu.isOpen);
      } else {
        vm.menu.isOpenLeft = !vm.menu.isOpenLeft;
      }
      $(window).trigger('resize');
    };

    function toggle(section) {
      menu.toggleSelectSection(section);
    }

    var vm = this;

    vm._ctm = $cookies.get('_ctm');
    vm.menu = menu;

    vm.designer = designer;
    vm.toggle = toggle;

    if ($cookies.get('_ctm') === 'true') {
      vm.menu.isOpenLeft = false;
      vm.menu.isOpen = false;
    }

    vm.menu.main = [{
      title: gettextCatalog.getString('Home'),
      link: '/#/',
      type: 'link',
      icon: 'home'
    }];

    vm.menu.main.push({
      title: gettextCatalog.getString('Locations'),
      type: 'link',
      link: '/#/locations',
      icon: 'business'
    });

    vm.menu.main.push({
      title: gettextCatalog.getString('Reports'),
      type: 'link',
      link: '/#/reports',
      icon: 'timeline'
    });

    vm.menu.main.push({
      title: gettextCatalog.getString('Audit'),
      type: 'link',
      link: '/#/audit',
      icon: 'assignment'
    });

    vm.menu.main.push({
      title: gettextCatalog.getString('Events'),
      type: 'link',
      link: '/#/events',
      icon: 'warning'
    });

    vm.status = {
      isFirstOpen: true,
      isFirstDisabled: false
    };

    vm.settingsMenu = [];

    vm.menuRight = [];

    vm.menuRight.push({
      name: gettextCatalog.getString('Home'),
      link: '/#/',
      type: 'link',
      icon: 'home'
    });

    vm.menuRight.push({
      name: gettextCatalog.getString('Locations'),
      link: '/#/locations',
      type: 'link',
      icon: 'business'
    });

    vm.menuRight.push({
      name: gettextCatalog.getString('Reports'),
      link: '/#/reports',
      type: 'link',
      icon: 'timeline'
    });

    vm.menuRight.push({
      name: gettextCatalog.getString('Audit'),
      link: '/#/audit',
      type: 'link',
      icon: 'assignment'
    });

    vm.menuRight.push({
      type: 'divider',
    });

    vm.menuRight.push({
      name: gettextCatalog.getString('Developer'),
      link: '/#/apps',
      type: 'link',
      icon: 'android'
    });

    // Permissions //
    vm.menuRight.push({
      name: gettextCatalog.getString('Documentation'),
      link: 'http://docs.cucumberwifi.io',
      type: 'link',
      target: '_blank',
      icon: 'account_balance'
    });

    vm.menuRight.push({
      name: gettextCatalog.getString('Discussions'),
      link: 'https://discuss.cucumberwifi.io',
      target: '_blank',
      type: 'link',
      icon: 'forum'
    });

    vm.menuRight.push({
      name: gettextCatalog.getString('Support'),
      icon: 'get_app',
      id: 'intercom'
    });

    vm.menuRight.push({
      name: gettextCatalog.getString('Downloads'),
      link: '/#/downloads',
      type: 'link',
      icon: 'get_app'
    });

    vm.menuRight.push({
      type: 'divider',
    });

    vm.menuRight.push({
      name: gettextCatalog.getString('Profile'),
      link: '/#/me',
      type: 'link',
      icon: 'face'
    });

    vm.menuRight.push({
      type: 'divider',
    });

    // vm.menuRight.push({
    //   name: gettextCatalog.getString('Logout'),
    //   type: 'link',
    //   icon: 'exit_to_app'
    // });

    $scope.toggleOpen = toggleOpen;

    $scope.$on('logout', function(args) {
      logout().then(function(response) {
        $route.reload();
        console.log('Refreshing Token.');
      }, function() {
        Auth.fullLogin();
      });
    });

    var logout = function(args) {
      var deferred = $q.defer();
      var user = $localStorage.user;
      var path = $location.path();
      AccessToken.del();
      if ( user && user.refresh ) {
        var host  = locationHelper.domain();
        $cookies.put('_ctp', JSON.stringify(path) );
        RefreshToken.refresh(user.refresh, path).then(function(response) {
          Auth.refresh(response).then(function(a){
            deferred.resolve();
          });
        }, function(er) {
          deferred.reject();
        });
      } else {
        deferred.reject();
      }
      return deferred.promise;
    };

    $scope.$on('login', function(args,event) {

      console.log('Logging in...');
      var cname = event.data.cname;
      if ((cname === null || cname === '') && event.data.url !== 'default') {
        var sub   = locationHelper.subdomain();
        var host  = locationHelper.domain();
        // put back when on public //
        // if (event.data.url && (sub !== event.data.url)) {
        //   var newUrl = locationHelper.reconstructed(event.data.url);
        //   var reconstructed = newUrl + '/#/switch?return_to=' + event.path;
        //   $cookies.put('event', JSON.stringify(event), {'domain': host});
        //   window.location = reconstructed;
        // } else {
          doLogin(event);
        // }
      } else {
        doLogin(event);
      }
    });

    function doLogin(event) {
      Auth.login(event.data).then(function(a) {
        var path;
        $scope.loggedIn = true;
        if (event.path) {
          path = event.path;
        } else {
          var raw = $cookies.get('_ctp');
          if (raw) {
            try{
              path = JSON.parse(raw);
            }catch(e){
              console.log('Couldn\'t parse JSON to redirect');
            }
          }
        }
        $location.path(path || '/').search(event.search || {});
        if (event !== undefined && event.rdir !== undefined) {
          $location.search({rdir: event.rdir});
        }
        $cookies.remove('_ctp');
        $scope.ct_login = undefined;
        Translate.load();
      });
    }

    $scope.$on('intercom', function(args,event) {
      if (Auth.currentUser() && (Auth.currentUser().chat_enabled !== false && Auth.currentUser().user_hash !== undefined)) {
        vm.menu.Intercom = true;
        var settings = {
            app_id: INTERCOM,
            user_id: Auth.currentUser().accountId,
            email: Auth.currentUser().email,
            name: Auth.currentUser().username,
            created_at: Auth.currentUser().created_at,
            user_hash: Auth.currentUser().user_hash,
            brand_name: Auth.currentUser().url,
            cname: Auth.currentUser().cname,
            sense_active: Auth.currentUser().sense_active,
            plan_name: Auth.currentUser().plan_name,
            paid_plan: Auth.currentUser().paid_plan,
            locs: Auth.currentUser().locs,
            version: '2'
        };
        settings.widget = {
          activator: '#intercom'
        };
        window.Intercom('boot', settings);
      }
    });

    $rootScope.$on('$routeChangeStart', function (event, next, current) {
      var pusher;
      if (Auth.currentUser() && Auth.currentUser().key !== null) {
        $scope.$broadcast('intercom', {hi: 'simon'});
        window.client = new Pusher(PUSHER, {
          authEndpoint: API + '/pusherAuth?token=' + Auth.currentUser().key
        });
        pusher = $pusher(client);
      }

      $scope.brandName = BrandName;
      function getSubdomain () {
        var sub   = locationHelper.subdomain();
        var host  = locationHelper.domain();
        var parts = $location.host().split('.');
        var cname;
        if (host !== 'ctapp.io' && host !== 'ctapp.dev') {
          getBrand(host, true);
        }
        else if (parts.length === 3) {
          sub = parts[0];
          getBrand(sub);
        } else {
          console.log('Domain error occured');
        }
      }

      function getBrand(sub, cname) {
        if (Auth.currentUser() && Auth.currentUser().url !== null) {
          sub = Auth.currentUser().url;
        }
        Brand.query({
          id: sub,
          cname: cname,
          type: 'showcase'
        }).$promise.then(function(results) {
          // Decide to switch the brand here
          // Can we turn Cucumber into a variable so we don't just set
          // Maybe use the config files - Simon TBD //
          $scope.brandName.name  = results.brand_name || 'Cucumber';
          // Maybe use the config files - Simon TBD //
          $scope.brandName.admin = results.admin;
          $scope.brandName.url   = results.url;
          $scope.brandName.id    = results.id;
        }, function() {
          setDefaultImages(sub);
        });
      }

      function getMe() {
        Me.get({}).$promise.then(function(res) {
          Auth.login(res).then(function(a) {
            $scope.user = Auth.currentUser();
            $scope.loggedIn = true;
          });
        });
      }

      var setDefaultImages = function(sub) {
        $scope.brandName.name = 'Cucumber';
      };

      var firstName = function() {
        if (Auth.currentUser() && Auth.currentUser().username) {
          $scope.user = { gravatar: Auth.currentUser().gravatar, lucky_dip: Auth.currentUser().lucky_dip };
        }
      };

      var a = AccessToken.get();
      if ( (!Auth.currentUser() && a ) || Auth.currentUser() && (Auth.currentUser().url !== 'default' )) {
        getMe();
      }
      firstName();
      getSubdomain();

      var domain = 'ctapp.io';
      var addDistro = function() {
        $cookies.put('_ct', $location.search().dst, {'domain': domain});
        $location.search({});
      };

      if ($location.search().dst) {
        addDistro();
      }

      var removeCtCookie = function() {
        $cookies.remove('_ct', { domain: domain } );
      };

      var cookie = $cookies.get('_ct', {'domain': domain});
      if (cookie && Auth.currentUser() && Auth.currentUser().id) {
        User.distro({dst: cookie}).$promise.then(function(result) {
          removeCtCookie();
        }, function() {
          removeCtCookie();
        });
      }
      Translate.load();
    });

    var setLoggedIn = function(isLoggedIn) {
      $scope.loggedIn = isLoggedIn;
      return isLoggedIn;
    };

    setLoggedIn(AccessToken.get() !== undefined);

    $scope.logout = function() {
      Auth.logout();
    };

    // $scope.onlineStatus = onlineStatus;
    // if ( $scope.loggedIn ) {
      // $scope.$watch('onlineStatus.isOnline()', function(online) {
      //   $scope.online_status_string = online ? 'online' : 'offline';
      //   if ($scope.online_status_string === 'offline') {
      //     $scope.open('md');
      //   } else if ($scope.online_status_string === 'online' ){
      //     // if ($scope.modalInstance !== undefined) {
      //     //   $scope.modalInstance.close();
      //     // }
      //   }
      // });
    // }

    // $scope.open = function (size) {
    // };

    // $scope.close = function() {
    // };

}]);

app.controller( 'ParentCtrl', function ParentCtrl($scope, onlineStatus) {

  // $scope.items = [];
  // $scope.linkItems = {
  // };

  // $scope.onlineStatus = onlineStatus;
  // $scope.$watch('onlineStatus.isOnline()', function(online) {
  //   $scope.online_status_string = online ? 'online' : 'offline';
  //   if ($scope.online_status_string === 'offline') {
  //     $scope.open('md');
  //   } else if ($scope.online_status_string === 'online' ){
  //   }
  // });

  // $scope.open = function (size) {
  // };

});
