'use strict';

var app = angular.module('myApp.controllers', [
  'myApp.authentications.controller',
  'myApp.brands.controller',
  'myApp.boxes.controller',
  'myApp.heartbeats.controller',
  'myApp.jobs.controller',
  'myApp.invoices.controller',
  'myApp.locations.controller',
  'myApp.port_forwards.controller',
  'myApp.projects.controller',
  'myApp.reports.controller',
  'myApp.speedtests.controller',
  'myApp.splash_pages.controller',
  'myApp.registrations.controller',
  'myApp.zones.controller',
  'myApp.users.controller',
  'myApp.vouchers.controller'
]);

app.controller('MainCtrl', ['$rootScope', '$scope', '$localStorage', '$window', '$location', '$routeParams', 'AccessToken', 'RefreshToken', 'Auth', 'API_END_POINT', '$pusher', '$route', 'onlineStatus', '$cookies', 'Brand', 'locationHelper', 'BrandName', 'CTLogin', 'User', 'Me', 'AUTH_URL', 'menu', 'designer', '$mdSidenav', 'docs', '$mdMedia', '$q', 'INTERCOM', 'PUSHER', 'gettextCatalog', 'Translate', 'COMMITHASH', '$mdDialog',

  function ($rootScope, $scope, $localStorage, $window, $location, $routeParams, AccessToken, RefreshToken, Auth, API, $pusher, $route, onlineStatus, $cookies, Brand, locationHelper, BrandName, CTLogin, User, Me, AUTH_URL, menu, designer, $mdSidenav, docs, $mdMedia, $q, INTERCOM, PUSHER, gettextCatalog, Translate, COMMITHASH, $mdDialog) {

    var domain = 'ctapp.io';

    $scope.brandName  = BrandName;
    $scope.commit     = COMMITHASH;
    $scope.ct_login   = CTLogin;

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

    vm.menu.main = [];
    // vm.menu.reports = [];
    vm.settingsMenu = [];
    vm.menuRight = [];

    vm.status = {
      isFirstOpen: true,
      isFirstDisabled: false
    };

    // vm.menuRight.push({
    //   name: gettextCatalog.getString('Locations'),
    //   link: '/#/locations',
    //   type: 'link',
    //   icon: 'business'
    // });
    //
    //
    // // Permissions //
    // if ($localStorage.user && !$localStorage.user.custom) {
    //   vm.menuRight.push({
    //     name: gettextCatalog.getString('Documentation'),
    //     link: 'http://docs.cucumberwifi.io',
    //     type: 'link',
    //     target: '_blank',
    //     icon: 'account_balance'
    //   });
    //
    //   vm.menuRight.push({
    //     name: gettextCatalog.getString('Discussions'),
    //     link: 'https://discuss.cucumberwifi.io',
    //     target: '_blank',
    //     type: 'link',
    //     icon: 'forum'
    //   });
    //
    //   vm.menuRight.push({
    //     name: gettextCatalog.getString('Support'),
    //     icon: 'get_app',
    //     id: 'intercom'
    //   });
    // }
    //
    // vm.menuRight.push({
    //   name: gettextCatalog.getString('Support'),
    //   icon: 'get_app',
    //   id: 'intercom'
    // });
    //
    // vm.menuRight.push({
    //   name: gettextCatalog.getString('Downloads'),
    //   link: '/#/downloads',
    //   type: 'link',
    //   icon: 'get_app'
    // });
    //
    // vm.menuRight.push({
    //   type: 'divider',
    // });

    vm.showPromo = function(offer) {
      $mdDialog.show({
        controller: TrialController,
        templateUrl: 'components/views/main/promos.tmpl.html',
        parent: angular.element(document.body),
        clickOutsideToClose:true,
        locals: {
          offer: offer
        },
        fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
      });
    };

    function TrialController($scope, $mdDialog, $sce, offer) {
      $scope.offer = $sce.trustAsHtml(offer);
      $scope.hide = function() {
        $mdDialog.hide();
      };

      $scope.upgrade = function() {
        $mdDialog.hide();
        $location.path('/users/' + Auth.currentUser().slug + '/billing');
        $location.search({trial: 'y'});
      };
    }

    vm.showUpgrade = function() {
      $mdDialog.show({
        controller: DialogController,
        templateUrl: 'components/views/main/upgrade.tmpl.html',
        parent: angular.element(document.body),
        clickOutsideToClose:true,
        fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
      });
    };

    function DialogController($scope, $mdDialog) {
      $scope.hide = function() {
        $mdDialog.hide();
      };

      $scope.upgrade = function() {
        $mdDialog.hide();
        $location.path('/users/' + Auth.currentUser().slug + '/billing');
      };
    }

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
      doLogin(event);
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
        // Translate.load();
      });
    }

    $scope.$on('intercom', function(args,event) {
      if (Auth.currentUser() && Auth.currentUser().user_hash !== undefined) {
        vm.menu.Intercom = true;
        window.intercomSettings = {
            app_id: INTERCOM,
            user_id: Auth.currentUser().accountId,
            reseller: Auth.currentUser().reseller,
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
            version: '2',
            hide_default_launcher: !Auth.currentUser().chat_enabled || false
        };
      }

      // check for customers from reseller brands who aren't resellers
      if ($scope.brandName && $scope.brandName.reseller === true && Auth.currentUser().reseller !== true) {
        // check if there is a special brand intercom id, otherwise just hide it
        if ($scope.brandName.intercom_id) {
          window.intercomSettings.app_id = $scope.brandName.intercom_id;
        } else {
          window.intercomSettings.hide_default_launcher = true;
        }
      }
    });

    function promos() {
      User.promos({}, {
        action: 'promos',
        id: Auth.currentUser().slug
      }).$promise.then(function(results) {
        vm.promos = results;
      }, function() {
        if (Auth.currentUser().paid_plan !== true) {
          vm.upgrade = true;
        }
      });
    }

    function menuPush() {
      if (vm.menu.main.length === 0) {
        // vm.menu.main.push({
        //   title: gettextCatalog.getString('Locations'),
        //   type: 'link',
        //   link: '/#/locations',
        //   icon: 'business'
        // });
        //
        // if ($localStorage.user && ($localStorage.user.custom !== true || $localStorage.user.reseller === true)) {
        //   vm.menu.main.push({
        //     title: gettextCatalog.getString('Brands'),
        //     type: 'link',
        //     link: '/#/brands',
        //     icon: 'branding_watermark'
        //   });
        //
        //   vm.menu.main.push({
        //     title: gettextCatalog.getString('Users'),
        //     type: 'link',
        //     link: '/#/users',
        //     icon: 'people'
        //   });
        //
        //   vm.menuRight.push({
        //     name: gettextCatalog.getString('Brands'),
        //     type: 'link',
        //     link: '/#/brands',
        //     icon: 'branding_watermark'
        //   });
        //
        //   vm.menuRight.push({
        //     name: gettextCatalog.getString('Users'),
        //     type: 'link',
        //     link: '/#/users',
        //     icon: 'people'
        //   });
        //
        //   vm.menu.main.push({
        //     title: gettextCatalog.getString('Projects'),
        //     type: 'link',
        //     link: '/#/projects',
        //     icon: 'dns'
        //   });
        //
        //   vm.menuRight.push({
        //     type: 'divider',
        //   });
        // }

        vm.menuRight.push({
          name: gettextCatalog.getString('Profile'),
          link: '/#/me',
          type: 'link',
          icon: 'face'
        });

        // vm.menuRight.push({
        //   type: 'divider',
        // });
      }

      if (Auth.currentUser().promo !== '' && Auth.currentUser().promo !== null && Auth.currentUser().promo !== undefined) {
        promos();
      } else if (Auth.currentUser().paid_plan !== true) {
        vm.upgrade = true;
      }
    }

    var setDefaultImages = function(sub) {
      $scope.brandName.name = 'CT';
    };

    function getBrand(sub, cname) {
      if (Auth.currentUser() && Auth.currentUser().url !== null) {
        sub = Auth.currentUser().url;
      }

      Brand.query({}, {
        id: sub,
        cname: cname,
        type: 'showcase'
      }).$promise.then(function(results) {
        // Decide to switch the brand here
        // Can we turn CT into a variable so we don't just set
        // Maybe use the config files - Simon TBD //

        var t = $cookies.get('_ctt');
        // if (t !== results.theme_primary) {
        $cookies.put('_ctt', results.theme_primary + '.' + results.theme_accent);
        // }
        $scope.brandName.name  = results.brand_name || 'CT';
        // Maybe use the config files - Simon TBD //
        $scope.brandName.admin = results.admin;
        $scope.brandName.url   = results.url;
        $scope.brandName.id    = results.id;
        $scope.brandName.intercom_id = results.intercom_id;
        $scope.brandName.logo_url = results.logo_url;
        $scope.brandName.reseller = results.reseller;
      }, function() {
        setDefaultImages(sub);
      });
    }

    var removeCtCookie = function() {
      $cookies.remove('_ct', { domain: domain });
    };

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
        if (sub !== 'dashboard' && sub !== 'alpha-preview' && sub !== 'dev-egg') {
          if (sub !== 'my') {
            getBrand(sub);
          }
          window.location.hostname = 'dashboard.' + host;
          return;
        }
        setDefaultImages();
      } else {
        window.location.hostname = 'dashboard.' + host;
        return;
      }
    }

    function getMe() {
      Me.get({}).$promise.then(function(res) {
        Auth.login(res).then(function(a) {
          $scope.user = Auth.currentUser();
          $scope.loggedIn = true;
          menuPush();
          if ($scope.user.promo !== '') {
            console.log('Getting promo...');
          }
        });
      });
    }

    function routeChangeStart() {
      var pusher;

      // If user logged in, load pusher
      if (Auth.currentUser() && Auth.currentUser().key !== null) {
        $scope.$broadcast('intercom', {hi: 'user'});
        window.client = new Pusher(PUSHER, {
          authEndpoint: API + '/pusherAuth?token=' + Auth.currentUser().key
        });
        pusher = $pusher(client);
      }

      var a = AccessToken.get();
      if ( (!Auth.currentUser() && a ) || Auth.currentUser() && (Auth.currentUser().url !== 'default' )) {
        getMe();
      }
      getSubdomain();

      // Translate.load();
    }

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

    $rootScope.$on('$routeChangeStart', function (event, next, current) {
      routeChangeStart();
    });


}]);

app.controller( 'ParentCtrl', function ParentCtrl($scope, onlineStatus) {
});
