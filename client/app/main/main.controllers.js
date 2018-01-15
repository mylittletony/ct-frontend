'use strict';

var app = angular.module('myApp.controllers', [
  'myApp.authentications.controller',
  'myApp.boxes.controller',
  'myApp.invoices.controller',
  'myApp.locations.controller',
  'myApp.port_forwards.controller',
  'myApp.reports.controller',
  'myApp.splash_pages.controller',
  'myApp.registrations.controller',
  'myApp.users.controller',
  'myApp.vouchers.controller'
]);

app.controller('MainCtrl', ['$rootScope', '$scope', '$localStorage', '$window', '$location', '$routeParams', 'AccessToken', 'RefreshToken', 'Auth', 'API_END_POINT', '$pusher', '$route', 'onlineStatus', '$cookies', 'locationHelper', 'CTLogin', 'User', 'Me', 'AUTH_URL', 'menu', 'designer', '$mdSidenav', '$mdMedia', '$q', 'INTERCOM', 'PUSHER', 'gettextCatalog', 'Translate', 'COMMITHASH', '$mdDialog',

  function ($rootScope, $scope, $localStorage, $window, $location, $routeParams, AccessToken, RefreshToken, Auth, API, $pusher, $route, onlineStatus, $cookies, locationHelper, CTLogin, User, Me, AUTH_URL, menu, designer, $mdSidenav, $mdMedia, $q, INTERCOM, PUSHER, gettextCatalog, Translate, COMMITHASH, $mdDialog) {

    var domain = 'ctapp.io';

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
    vm.settingsMenu = [];
    vm.menuRight = [];

    vm.status = {
      isFirstOpen: true,
      isFirstDisabled: false
    };

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

        vm.menuRight.push({
          name: gettextCatalog.getString('Profile'),
          link: '/#/me',
          type: 'link',
          icon: 'face'
        });

      }

      if (Auth.currentUser().promo !== '' && Auth.currentUser().promo !== null && Auth.currentUser().promo !== undefined) {
        promos();
      } else if (Auth.currentUser().paid_plan !== true) {
        vm.upgrade = true;
      }
    }

    var setDefaultImages = function(sub) {
    };

    var removeCtCookie = function() {
      $cookies.remove('_ct', { domain: domain });
    };

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


    $scope.toggleLocations = function() {

      var locationSidebar = document.getElementById("locationSidebar");

      if (locationSidebar.classList.contains('md-closed')) {
          $mdSidenav('locations').open();
      } else {
          $mdSidenav('locations').close();
      }
    }


}]);

app.controller( 'ParentCtrl', function ParentCtrl($scope, onlineStatus) {
});
