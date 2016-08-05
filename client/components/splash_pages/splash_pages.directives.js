'use strict';

var app = angular.module('myApp.splash_pages.directives', []);

app.directive('listSplash', ['SplashPage', '$routeParams', '$location', 'showToast', 'showErrors', '$mdDialog', '$q', 'gettextCatalog', function(SplashPage,$routeParams,$location,showToast,showErrors,$mdDialog,$q, gettextCatalog) {

  var link = function(scope,element,attrs) {

    scope.location = { slug: $routeParams.id };

    scope.options = {
      autoSelect: true,
      boundaryLinks: false,
      largeEditDialog: false,
      pageSelector: false,
      rowSelection: false
    };

    scope.query = {
      order:      '-created_at',
      limit:      $routeParams.per || 25,
      page:       $routeParams.page || 1,
      options:    [5,10,25,50,100],
    };

    var createMenu = function() {

      // user permissions //
      scope.menu = [];

      scope.menu.push({
        name: gettextCatalog.getString('Edit'),
        icon: 'settings',
        type: 'settings'
      });

      scope.menu.push({
        name: gettextCatalog.getString('Design'),
        icon: 'format_paint',
        type: 'design'
      });

      scope.menu.push({
        name: gettextCatalog.getString('Delete'),
        icon: 'delete_forever',
        type: 'delete'
      });

    };

    scope.action = function(id,type) {
      switch(type) {
        case 'settings':
          edit(id);
          break;
        case 'design':
          designer(id);
          break;
        case 'delete':
          destroy(id);
          break;
      }
    };

    var destroy = function(id) {
      var confirm = $mdDialog.confirm()
      .title(gettextCatalog.getString('Delete Splash'))
      .textContent(gettextCatalog.getString('Are you sure you want to delete this splash page?'))
      .ariaLabel(gettextCatalog.getString('Delete Splash'))
      .ok(gettextCatalog.getString('Delete'))
      .cancel(gettextCatalog.getString('Cancel'));
      $mdDialog.show(confirm).then(function() {
        destroySplash(id);
      }, function() {
      });
    };

    var destroySplash = function(id) {
      SplashPage.destroy({location_id: scope.location.slug, id: id}).$promise.then(function(results) {
        removeFromList(id);
      }, function(err) {
        showErrors(err);
      });
    };

    var removeFromList = function(id) {
      for (var i = 0, len = scope.splash_pages.length; i < len; i++) {
        if (scope.splash_pages[i].id === id) {
          scope.splash_pages.splice(i, 1);
          showToast(gettextCatalog.getString('Splash successfully deleted'));
          break;
        }
      }
    };

    var designer = function(id) {
      $location.path('/locations/' + scope.location.slug + '/splash_pages/' + id + '/design');
    };

    var edit = function(id) {
      window.location.href = '/#/locations/' + scope.location.slug + '/splash_pages/' + id;
    };

    var init = function() {
      var id = $routeParams.id;
      var deferred = $q.defer();
      scope.promise = deferred.promise;
      SplashPage.get({location_id: scope.location.slug}).$promise.then(function(results) {
        if (id % 1 === 0 && results.location && results.location.slug) {
          $location.path('/locations/' + results.location.slug + '/splash_pages/new').replace().notify(false);
        }
        scope.cloned_id = $routeParams.new;
        scope.splash_pages = results.splash_pages;
        scope.loading = undefined;
        deferred.resolve();
        createMenu();
      }, function(error) {
        deferred.resolve();
      });
    };

    init();
  };

  return {
    link: link,
    scope: {
      loading: '='
    },
    templateUrl: 'components/splash_pages/_index.html'
  };

}]);

app.directive('locationSplashPagesShow', ['SplashPage', 'Location', '$routeParams', '$filter', 'moment', 'showToast', 'showErrors', '$mdDialog', '$q', 'gettextCatalog', function(SplashPage, Location, $routeParams, $filter, moment, showToast, showErrors, $mdDialog, $q, gettextCatalog) {

  var link = function(scope,element,attrs) {

    var placeholderNewsletterPass =  gettextCatalog.getString('Username and Password'),
        placeholderNewsletterToken = gettextCatalog.getString('Enter your API token');
        
    scope.timezones = moment.tz.names();

    scope.access_restrict = [{ key: gettextCatalog.getString('Off'), value: 'none'}, {key: gettextCatalog.getString('Periodic'), value: 'periodic'}, {key: gettextCatalog.getString('Data Downloaded'), value: 'data' }, {key: gettextCatalog.getString('Timed Access'), value: 'timed'}];
    scope.newsletter_types = [{ key: gettextCatalog.getString('Off'), value: 0 }, { key: 'MailChimp', value: 1}, {key: 'CampaignMonitor', value: 2}, {key: 'SendGrid', value: 4}, {key: gettextCatalog.getString('Internal only'), value: 3 }];

    scope.slider = {};
    scope.slider.download_speed = 1024;
    scope.slider.upload_speed = 1024;

    scope.location = { slug: $routeParams.id };

    var createMenu = function() {

      // user permissions //
      scope.menu = [];

      scope.menu.push({
        name: gettextCatalog.getString('Design'),
        icon: 'format_paint',
        type: 'design'
      });

      scope.menu.push({
        name: gettextCatalog.getString('Networks'),
        icon: 'wifi',
        type: 'networks'
      });

      scope.menu.push({
        name: gettextCatalog.getString('Shop'),
        icon: 'shopping_basket',
        type: 'shop',
        disabled: (parseInt(scope.splash.primary_access_id) !== 2)// && !scope.splash.shop_active
      });

      scope.menu.push({
        name: gettextCatalog.getString('Forms'),
        icon: 'assignment',
        type: 'register',
        disabled: parseInt(scope.splash.primary_access_id) !== 8
      });

      scope.menu.push({
        name: gettextCatalog.getString('Duplicate'),
        icon: 'content_copy',
        type: 'copy'
      });

      scope.menu.push({
        name: gettextCatalog.getString('Transfer'),
        icon: 'transform',
        type: 'transfer'
      });

      scope.menu.push({
        name: gettextCatalog.getString('Delete'),
        icon: 'delete_forever',
        type: 'delete'
      });

    };

    scope.action = function(type) {
      switch(type) {
        case 'design':
          designer();
          break;
        case 'networks':
          networks();
          break;
        case 'transfer':
          transfer();
          break;
        case 'copy':
          duplicate();
          break;
        case 'register':
          register();
          break;
        case 'shop':
          shop();
          break;
        case 'delete':
          destroy();
          break;
      }
    };

    var destroy = function() {
      var confirm = $mdDialog.confirm()
      .title(gettextCatalog.getString('Delete Splash'))
      .textContent(gettextCatalog.getString('Are you sure you want to delete this splash page?'))
      .ariaLabel(gettextCatalog.getString('Delete Splash'))
      .ok(gettextCatalog.getString('Delete'))
      .cancel(gettextCatalog.getString('Cancel'));
      $mdDialog.show(confirm).then(function() {
        destroySplash();
      }, function() {
      });
    };

    var destroySplash = function() {
      SplashPage.destroy({location_id: scope.location.slug, id: scope.splash.id}).$promise.then(function(results) {
        scope.back();
        showToast(gettextCatalog.getString('Splash Page successfully deleted'));
      }, function(err) {
        showErrors(err);
      });
    };

    var duplicate = function() {
      var confirm = $mdDialog.confirm()
      .title(gettextCatalog.getString('Duplicate Splash'))
      .textContent(gettextCatalog.getString('Are you sure you want to duplicate this splash page?'))
      .ariaLabel(gettextCatalog.getString('Duplicate Splash'))
      .ok(gettextCatalog.getString('Duplicate'))
      .cancel(gettextCatalog.getString('Cancel'));
      $mdDialog.show(confirm).then(function() {
        dupSplash();
      }, function() {
      });
    };

    var dupSplash = function(copy_to,msg,destroy) {
      SplashPage.duplicate({
        location_id: scope.location.slug,
        id: scope.splash.id,
        copy_to: copy_to,
        destroy: destroy
      }).$promise.then(function(results) {
        showToast(msg || gettextCatalog.getString('Splash Page Duplicated.'));
        if (msg) {
          scope.back();
        }
      }, function(err) {
        showErrors(err);
      });
    };

    var transfer = function() {
      $mdDialog.show({
        templateUrl: 'components/splash_pages/_transfer.html',
        clickOutsideToClose: true,
        parent: angular.element(document.body),
        controller: TransferController,
      });
    };

    var TransferController = function($scope) {
      $scope.loading = true;

      $scope.close = function() {
        $mdDialog.cancel();
      };

      var deferred = $q.defer();
      Location.shortquery({}).$promise.then(function (res) {
        if (res.length > 1) {
          $scope.locations = res;
          deferred.resolve();
        }
        $scope.loading = undefined;
        deferred.reject();
      }, function() {
        $scope.loading = undefined;
        deferred.reject();
      });

      $scope.transfer = function(id) {
        $mdDialog.cancel();
        dupSplash(id, gettextCatalog.getString('Splash Page Successfully Transferred.'), true);
      };
    };

    var networks = function() {
      $mdDialog.show({
        templateUrl: 'components/splash_pages/_networks.html',
        parent: angular.element(document.body),
        clickOutsideToClose: true,
        controller: NetworksController,
        locals: { splash: scope.splash }
      });
    };

    var NetworksController = function($scope,splash) {
      $scope.loading = true;
      $scope.splash = splash;
      // $scope.pristine = true;
      $scope.networks = scope.networks;
      $scope.selected = [];

      $scope.close = function() {
        $mdDialog.cancel();
      };

      angular.forEach(scope.splash.networks, function (active) {
        angular.forEach($scope.networks, function (value, index) {
          if (value.id === active) {
            $scope.selected.push($scope.networks[index]);
          }
        });
      });

      $scope.loading = undefined;

      $scope.update = function() {
        for (var i = 0; i < $scope.selected.length; i++) {
          $scope.splash.network_ids.push($scope.selected[i].id);
        }
        $mdDialog.cancel();
        updateCT();
      };

    };
    NetworksController.$inject = ['$scope', 'splash'];


    var init = function(id) {

      SplashPage.query({
        location_id: scope.location.slug,
        hide_designer: true,
        id: $routeParams.splash_page_id
      }).$promise.then(function(results) {

        scope.splash = results.splash_page;

        if (scope.splash.newsletter_type === null) {
          scope.splash.newsletter_type = 0;
        }
        scope.splash.userdays = [];
        if (scope.splash.passwd_change_day === null) {
          scope.splash.passwd_change_day = [];
        }
        scope.splash.periodic_days = [];
        if (scope.splash.available_days === null) {
          scope.splash.available_days = [];
        }
        if (scope.splash.passwd_change_day === undefined) {
          scope.splash.passwd_change_day = [];
        }
        if (scope.splash && scope.splash.splash_tags) {
          scope.splash.splash_tags = scope.splash.splash_tags.toString();
        }

        if (scope.splash.walled_gardens && scope.splash.walled_gardens.length) {
          scope.splash.walled_gardens_array = scope.splash.walled_gardens.split(',');
        } else {
          scope.splash.walled_gardens_array = [];
        }

        scope.newsletter_placeholder = scope.splash.newsletter_type === 4 ? placeholderNewsletterPass : placeholderNewsletterToken;

        // if (scope.splash.blacklisted && scope.splash.blacklisted.length) {
        //   scope.splash.blacklisted_array = scope.splash.blacklisted.split(',');
        // } else {
        //   scope.splash.blacklisted_array = [];
        // }

        scope.access_types = results.access_types;
        scope.access_name();

        scope.networks = results.networks;
        scope.splash.network_ids = [];

        createMenu();
        scope.loading = undefined;
      }, function(err) {
        scope.loading = undefined;
      });
    };

    scope.update = function(form) {
      form.$setPristine();
      formatWalledGardens();
      // formatBlacklisted();
      updateCT();
    };

    var formatWalledGardens = function() {
      scope.splash.walled_gardens = scope.splash.walled_gardens_array.join(',');
    };

    // var formatBlacklisted = function() {
    //   scope.splash.blacklisted = scope.splash.blacklisted_array.join(',');
    // };

    var updateCT = function() {
      SplashPage.update({
        location_id: scope.location.slug,
        id: scope.splash.id,
        splash_page: scope.splash
      }).$promise.then(function(results) {
        showToast(gettextCatalog.getString('Splash page successfully updated.'));
        scope.splash.network_ids = [];
        createMenu();
      }, function(err) {
        scope.splash.network_ids = [];
        showErrors(err);
      });
    };

    scope.updateNews = function() {
      if ((scope.splash.newsletter_type === '0' || scope.splash.newsletter_type === 0) && scope.splash.newsletter_active === true) {
        scope.splash.newsletter_active = false;
      } else if ((scope.splash.newsletter_type !== '0' && scope.splash.newsletter_type !== 0) && scope.splash.newsletter_active === false) {
        scope.splash.newsletter_active = true;
      }
      if (scope.splash.newsletter_type === '4') {
        scope.newsletter_placeholder = placeholderNewsletterPass;
      } else {
        scope.newsletter_placeholder =  placeholderNewsletterToken;
      }
    };

    scope.access_name = function() {
      var id = parseInt(scope.splash.primary_access_id);
      var filtered = $filter('filter')(scope.access_types, {id: id }, true)[0];
      if (filtered !== undefined) {
        scope.splash.access_type = filtered.name.toLowerCase();
      }
    };

    scope.updateLocation = function() {
      Location.update({id: scope.location.slug, location: { tagged_logins: scope.splash.tagged_logins }}).$promise.then(function(results) {
      }, function(err) {
      });
    };

    scope.updateRequireEmail = function() {
      if ( scope.splash.newsletter_active !== true ) {
        scope.splash.email_required = false;
      }
    };

    var register = function() {
      window.location.href = '/#/locations/' + scope.location.slug + '/splash_pages/' + scope.splash.id + '/forms';
    };

    var shop = function() {
      window.location.href = '/#/locations/' + scope.location.slug + '/splash_pages/' + scope.splash.id + '/store';
    };

    scope.back = function() {
      window.location.href = '/#/locations/' + scope.location.slug + '/splash_pages';
    };

    var designer = function(id) {
      window.location.href = '/#/locations/' + scope.location.slug + '/splash_pages/' + scope.splash.id + '/design';
    };

    init();

  };

  return {
    link: link,
    scope: {
      slug: '@',
      loading: '='
    },
    templateUrl: 'components/splash_pages/splash_show.html'
  };

}]);

app.directive('splashNew', ['Network', 'SplashPage', '$location', '$routeParams', '$rootScope', '$mdDialog', 'showToast', 'showErrors', 'gettextCatalog', function(Network,SplashPage,$location,$routeParams,$rootScope,$mdDialog,showToast,showErrors,gettextCatalog) {

  var link = function(scope, element, attrs) {

    scope.obj = {};
    scope.splash = {};
    scope.location = { slug: $routeParams.id };

    var getNetworks = function() {
      return Network.get({location_id: scope.location.slug, splash: true}).$promise.then(function(results) {
        scope.obj.networks = results;
        if (scope.obj.networks.length) {
          scope.splash.network_id = scope.obj.networks[0].id;
          for (var i = 0; i < scope.obj.networks.length; i++) {
            if (scope.obj.networks[i].zones.length) {
              scope.obj.zones = true;
              break;
            }
          }
        }
      });
    },
    getSplashPages = function() {
      return SplashPage.get({location_id: scope.location.slug }).$promise.then(function(results) {
        scope.obj.access_types = results.access_types;
        scope.splash.primary_access_id = scope.obj.access_types[0].id;
        scope.obj.loading = undefined;
      }, function(error) {
      });
    };

    var create = function(form) {
      form.$setPristine();
      if (scope.splash.ssid) {
        scope.splash.network_id = undefined;
      }

      SplashPage.create({
        location_id: scope.location.slug,
        splash_page: {
          ssid: scope.splash.ssid,
          network_ids: scope.splash.network_id,
          splash_name: scope.splash.splash_name,
          primary_access_id: scope.splash.primary_access_id
        }
      }).$promise.then(function(results) {
        scope.splash = {};
        $mdDialog.cancel();
        results.highlight = true;
        scope.pages.push(results);
        showToast(gettextCatalog.getString('Splash created successfully'));
      }, function(err) {
        $mdDialog.cancel();
        showErrors(err);
      });

    };

    scope.open = function(network) {
      $mdDialog.show({
        templateUrl: 'components/splash_pages/_form.html',
        parent: angular.element(document.body),
        controller: DialogController,
        clickOutsideToClose: true,
        locals: {
          obj: scope.obj,
          splash: scope.splash
        }
      });
    };

    function DialogController ($scope,obj,splash) {
      $scope.obj = obj;
      $scope.obj.loading = true;
      $scope.splash = splash;

      getNetworks().then(getSplashPages);

      $scope.save = function(form) {
        create(form);
      };
      $scope.close = function() {
        $mdDialog.cancel();
      };
    }
    DialogController.$inject = ['$scope','obj','splash'];

    scope.style = attrs.style;
    // if (attrs.create) {
    //   scope.open();
    // }

  };

  return {
    link: link,
    scope: {
      pages: '=',
      style: '@'
    },
    templateUrl: 'components/splash_pages/_splash_new.html',
  };

}]);

app.directive('splashDesignerForm', ['$compile', function($compile) {

  var link = function(scope,element,attrs) {

    var leform;

    var init = function() {
      switch(attrs.access) {
      case '1':
        leform = '<input type="password" class="design-input" placeholder="What\'s the password?">';
        break;
      case '2':
        leform =
          '<label>Enter your username</label><br>'+
          '<input style="display:none" type="text" name="fakeinput"/>'+
          '<input style="display:none" type="password" name="fakeinput"/>'+
          '<input type="text" class="design-input" disabled placeholder="What\'s your username"><br>' +
          '<label>Enter your password</label><br>'+
          '<input type="password" class="design-input" disabled placeholder="What\'s the password"><br>' +
          '<button class=\'btn\'>{{ btn_text }}</button>';
          break;
      case '3':
        leform =
          '<button class=\'btn\'>{{ btn_text }}</button>';
          break;
      case '7':
        leform =
          '<p class=\'btn social des-facebook\'>Facebook</p>';
        break;
      case '8':
        leform =
          '<p><small>Your other fields will show on the live page.</small></p>' +
          '<label>Enter your username</label><br>'+
          '<input style="display:none" type="text" name="fakeinput"/>'+
          '<input style="display:none" type="password" name="fakeinput"/>'+
          '<input type="text" class="design-input" disabled placeholder="What\'s your username"><br>' +
          '<label>Enter your password</label><br>'+
          '<input type="password" class="design-input" disabled placeholder="What\'s the password"><br>' +
          '<button class=\'btn\'>{{ btn_text }}</button>';
          break;
      default:
        leform =
          '<button>{{ btn_text }}</button>';
          // default code block
      }
      var template = $compile('<div>' + leform + '</div>')(scope);
      var compileForm = function() {};
      element.html(template);
    };

    attrs.$observe('btntext', function(id) {
      if (id !== '') {
        scope.btn_text = attrs.btntext;
        init();
      }
    });

  };

  return {
    link: link,
    scope: {
      access: '@',
      btntext: '@'
    }
  };

}]);

app.directive('splashDesigner', ['Location', 'SplashPage', 'SplashPageForm', '$routeParams', '$q', 'menu', 'designer', '$timeout', 'showToast', 'showErrors', '$rootScope', 'gettextCatalog', function(Location, SplashPage, SplashPageForm, $routeParams, $q, menu, designer, $timeout, showToast, showErrors, $rootScope, gettextCatalog) {

  var link = function(scope,element,attrs) {

    menu.hideToolbar = true;
    menu.isOpen = false;
    scope.location = { slug: $routeParams.id };
    scope.splash = { id: $routeParams.splash_page_id };

    var init = function() {
      return SplashPage.query({
        location_id: scope.location.slug,
        id: scope.splash.id,
        designer: true
      }).$promise.then(function(res) {
        scope.splash      = res.splash_page;
        designer.splash   = scope.splash;
        scope.uploadLogo  = (scope.splash.header_image_name === null && scope.splash.logo_file_name === null);
        $timeout(function() {
          menu.Designer = true;
          scope.loading     = undefined;
        }, 500);
      }, function() {
        scope.loading     = undefined;
        scope.errors      = true;
      });
    };

    designer.save = function(splash, form) {
      scope.splash.updating = true;
      SplashPage.update({
        location_id: scope.location.slug,
        id: scope.splash.id,
        splash_page: splash
      }).$promise.then(function(res) {
        scope.splash.updating = undefined;
        form.$setPristine();
        showToast(gettextCatalog.getString('Layout successfully updated.'));
      }, function(err) {
        showErrors(err);
        scope.splash.updating = undefined;
      });
    };

    scope.setTrans = function() {
      if (scope.nologo) {
        scope.splash.header_image_name = 'https://d3e9l1phmgx8f2.cloudfront.net/images/login_screens/transparent.png';
      } else {
        scope.splash.header_image_name = undefined;
      }
    };

    scope.saveAndContinue = function() {
      scope.update(scope.splash);
    };

    // scope.align_logo = function(align) {
    //   scope.splash.logo_position = align;
    // };

    // scope.align_container = function(align) {
    //   scope.splash.container_float = align;
    // };

    // scope.align_text = function(align) {
    //   scope.splash.container_text_align = align;
    // };

    scope.swapToWelcome = function() {
      if (scope.welcomeEditing === undefined) {
        scope.welcomeEditing = true;
      }
    };

    scope.clearWelcomeEdit = function() {
      if (scope.welcomeEditing !== undefined) {
        scope.welcomeEditing = undefined;
      }
    };

    designer.deleteBg = function(splash,form) {
      splash.background_image_name = '';
      designer.save(splash,form);
    };

    designer.back = function() {
      window.history.back();
    };

    designer.preview = function() {
      window.open('http://app.my-wifi.co/'+scope.splash.unique_id+'?cmd=login&mac=FF-FF-FF-FF-FF-FF&apname='+scope.splash.preview_mac+'&vcname=instant-C6:3C:E8','winname','directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=no,width=1000,height=800');

    };

    designer.toggle = function(section) {
      menu.toggleSelectSection(section);
    };

    designer.isOpen = function(section) {
      return menu.isSectionSelected(section);
    };

    designer.fonts = [
      '"Helvetica Neue",sans-serif', 'Arial, "Helvetica Neue", Helvetica, sans-serif', 'Baskerville, "Times New Roman", Times, serif', 'Century Gothic", "Apple Gothic", sans-serif"', '"Copperplate Light", "Copperplate Gothic Light", serif', '"Courier New", Courier, monospace, Futura, "Century Gothic", AppleGothic, sans-serif"', 'Garamond, "Hoefler Text", "Times New Roman", Times, serif"', 'Geneva, "Lucida Sans", "Lucida Grande", "Lucida Sans Unicode", Verdana, sans-serif', 'Georgia, Palatino, "Palatino Linotype", Times, "Times New Roman", serif', 'Helvetica, Arial, sans-serif', '"Helvetica Neue", Arial, Helvetica, sans-serif', 'Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif"', '"Lucida Sans", "Lucida Grande", "Lucida Sans Unicode", sans-serif', '"Trebuchet MS", "Lucida Sans Unicode", "Lucida Grande", "Lucida Sans", Arial, sans-serif"', 'Verdana, Geneva, Tahoma, sans-serif', '"Deck Light"'];

    $rootScope.$on('$routeChangeStart', function (event, next, current) {
      menu.hideToolbar = false;
      menu.isOpen = true;
    });

    init();

  };

  return {
    link: link,
    scope: {
      loading: '=',
      fonts: '='
    },
    templateUrl: 'components/splash_pages/_designer.html'
  };

}]);

app.directive('splashDesign', [function() {
  return {
    link: function(scope, element, attrs) {
      attrs.$observe('ver', function(start) {
        if (start !== '') {
          scope.getContentUrl = function() {
            return 'components/splash_pages/design-' + attrs.ver + '.html';
          };
        }
      });
    },
    template: '<div ng-include="getContentUrl()"></div>'
   };
}]);

app.directive('designMenu', ['designer', function(designer) {
  return {
    link: function(scope, element, attrs) {
      attrs.$observe('ver', function(start) {
        if (start !== '') {
          scope.splash = designer;
          scope.getContentUrl = function() {
            return 'components/splash_pages/_menu.html';
          };
        }
      });
    },
    template: '<div ng-include="getContentUrl()"></div>'
   };
}]);

app.directive('removeImage', ['SplashPage', function(SplashPage) {

  var link = function(scope,element,attrs) {

    scope.removeImage = function() {
      scope.temp = scope.attribute;
      scope.attribute = '';
    };

    scope.undoRemoveImage = function() {
      scope.attribute = scope.temp;
      scope.temp = undefined;
    };

  };

  return {
    link: link,
    scope: {
      attribute: '=',
      temp: '='
    },
    template:
      '<p class=\'remove-image\'>'+
      '<small><a ng-show=\'attribute\' class=\'remove-image\' ng-click=\'removeImage()\'><i class="fa fa-times"></i> Remove Image</a>' +
      '<a ng-show=\'temp\' class=\'undo-remove\' ng-click=\'undoRemoveImage()\'>Undo remove</a></small></p>'
  };

}]);

app.directive('accessTypes', [function() {
  var link = function(scope, element, attrs) {
    attrs.$observe('ver', function(start) {
      if (start !== '') {
        scope.getPanel = function() {
          return 'components/splash_pages/access-' + attrs.ver + '.html';
        };
      }
    });
  };

  return {
    link: link,
    template: '<div ng-include="getPanel()"></div>'
  };

}]);

app.directive('splashGeneratePassy', ['Code', function(Code) {

  var link = function(scope,element) {
    scope.generatePassy = function() {
      scope.loading = true;
      Code.generate_password().$promise.then(function(results) {
        scope.attribute = results.password;
        scope.loading = undefined;
        scope.showPass = true;
        // scope.myForm.$pristine = false;
      }, function() {
        scope.error = true;
        scope.loading = undefined;
      });
    };
  };

  return {
    link: link,
    scope: {
      attribute: '=',
      loading: '=',
      showPass: '='
    },
    templateUrl: 'components/splash_pages/_generate_password.html',
  };
}]);

app.directive('splashStore', ['SplashPage', '$routeParams', '$http', '$location', 'showToast', 'showErrors', '$mdDialog', 'gettextCatalog', function(SplashPage,$routeParams,$http,$location,showToast,showErrors,$mdDialog, gettextCatalog) {

  var link = function(scope,element,attrs) {

    var init = function() {

      scope.merchant_types = [{key:'PayPal Express', value: 'paypal'}, {key: 'Stripe Checkout', value: 'stripe'}, {key: 'SagePay (Form)', value: 'sagepay' }];
      scope.location = { slug: $routeParams.id };
      scope.splash = { id: $routeParams.splash_page_id };

      SplashPage.store({location_id: scope.location.slug, id: scope.splash.id}).$promise.then(function(results) {
        scope.store = results ? results.store : undefined;
        if (results && results.products === undefined) {
          // createProducts();
        } else if (results && results.products ) {
          scope.products = results.products;
        }

        scope.loading = undefined;
      });
    };

    // function createProducts() {
    //   var product = {
    //     duration: 60,
    //     type: 'multiuse',
    //     distance: 'minutes',
    //     download_speed: 2048,
    //     upload_speed: 1024,
    //     dummy: true,
    //     value: 300,
    //     devices: 2
    //   };

    //   scope.products = [];
    //   scope.products.push(product);
    // }

    scope.environments = [{key: gettextCatalog.getString('Test'), value: 'test'}, {key: gettextCatalog.getString('Production'), value: 'production'}];

    scope.addProduct = function() {
      add();
    };

    var add = function() {
      $mdDialog.show({
        templateUrl: 'components/splash_pages/_store_product.html',
        clickOutsideToClose: true,
        parent: angular.element(document.body),
        controller: ProductsController,
      });
    };

    function ProductsController($scope) {
      var date = new Date();
      $scope.minDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()) + 1;

      $scope.templates = scope.templates;
      $scope.distances = [{key: gettextCatalog.getString('Minutes'), value: 'minutes'}, {key: gettextCatalog.getString('Hours'), value: 'hours'}, {key: gettextCatalog.getString('Days'), value: 'days'}, {key: gettextCatalog.getString('Weeks'), value: 'weeks'}, {key:gettextCatalog.getString('Months'), value: 'months'}];
      $scope.product = {
        description: gettextCatalog.getString('A product for immediate purchase, enjoy.'),
        template_id: 1,
        duration: 60,
        session_timeout: 60,
        type: 'multiuse',
        distance: 'minutes',
        download_speed: 2048,
        upload_speed: 1024,
        devices: 3,
        value: 300
      };
      $scope.close = function() {
        $mdDialog.cancel();
      };

      $scope.save = function() {
        $mdDialog.cancel();
        scope.saveProduct($scope.product);
      };

    }
    ProductsController.$inject = ['$scope'];

    scope.saveProduct = function(product) {
      scope.products = scope.products || [];
      scope.products.push(product);
      scope.update(gettextCatalog.getString('Product added to store'));
    };

    scope.removeProduct = function(index) {
      var confirm = $mdDialog.confirm()
      .title(gettextCatalog.getString('Delete Product'))
      .textContent(gettextCatalog.getString('Are you sure you want to delete this product?'))
      .ariaLabel(gettextCatalog.getString('Delete'))
      .ok(gettextCatalog.getString('Delete'))
      .cancel(gettextCatalog.getString('Cancel'));
      $mdDialog.show(confirm).then(function() {
        scope.products[index]._destroy = 1;
        scope.update(gettextCatalog.getString('Product removed from store'));
      }, function() {
      });
    };

    scope.update = function(msg, form) {

      if (form) {
        form.$setPristine();
      }

      if (scope.products) {
        scope.store.store_products_attributes = scope.products;
      }

      SplashPage.update_store({
        location_id: scope.location.slug,
        splash_id: scope.splash.id,
        store: scope.store
      }).$promise.then(function(results) {
        if (results && results.products ) {
          scope.products = results.products;
        } else {
          scope.products = undefined;
        }
        showToast(msg);
      }, function(err) {
        scope.products.splice(-1,1);
        showErrors(err);
      });
    };

    scope.templates = [];

    var twentymins = {
      duration: 20,
      session_timeout: 20,
      type: 'singleuse',
      distance: 'minutes',
      download_speed: 2048,
      upload_speed: 1024,
      devices: 1,
      description: gettextCatalog.getString('A single-use voucher valid for 20 minutes from the time you login'),
      value: 100
    };
    scope.templates.push({name: gettextCatalog.getString('20 minute, quickcode'),  val: twentymins, id: 1 });

    var sixtymins = {
      duration: 60,
      session_timeout: 60,
      type: 'multiuse',
      distance: 'minutes',
      download_speed: 2048,
      upload_speed: 1024,
      devices: 1,
      description: gettextCatalog.getString('A 60 minute, multi-use voucher. Use me until my minutes have expired.'),
      value: 100
    };
    scope.templates.push({name: gettextCatalog.getString('60 minute, multi-use voucher'), val: sixtymins, id: 2 });

    var twenty4 = {
      duration: 24,
      session_timeout: 60,
      type: 'singleuse',
      distance: 'hours',
      download_speed: 2048,
      upload_speed: 1024,
      devices: 3,
      description: gettextCatalog.getString('A 24 hour voucher, for up to 3 devices. Valid for one 24 hour period.'),
      value: 500
    };
    scope.templates.push({name: gettextCatalog.getString('24 hour, single-use voucher'), val: twenty4, id: 3 });

    var sevendays = {
      duration: 7,
      session_timeout: 60,
      type: 'singleuse',
      distance: 'days',
      download_speed: 2048,
      upload_speed: 1024,
      devices: 3,
      description: gettextCatalog.getString('A 7 day voucher, for up to 3 devices. Valid for 7 consecutive days.'),
      value: 500
    };
    scope.templates.push({name: gettextCatalog.getString('7 day, unlimited voucher'), val: sevendays, id: 4 });

    var month = {
      duration: 30,
      session_timeout: 60,
      type: 'singleuse',
      distance: 'days',
      download_speed: 2048,
      upload_speed: 1024,
      description: gettextCatalog.getString('A monthly voucher for 5 up to devices. Valid for 30 consecutive days.'),
      devices: 5,
    };
    scope.templates.push({name: '30 day, unlimited voucher', val: month, id: 5 });

    scope.selectTemplate = function() {
      angular.forEach(scope.templates, function (value) {
        if (value.id === scope.product.template_id) {
          scope.product.duration          = value.val.duration;
          scope.product.session_timeout   = value.val.session_timeout;
          scope.product.type              = value.val.type;
          scope.product.distance          = value.val.distance;
          scope.product.description       = value.val.description;
        }
      });
    };

    scope.createStore = function() {
      scope.creating = true;
      SplashPage.create_store({
        location_id: scope.location.slug,
        splash_id: scope.splash.id,
        store: scope.store
      }).$promise.then(function(results) {
        showToast(gettextCatalog.getString('Store created successfully.'));
        scope.store = results;
        scope.creating = undefined;
      }, function(err) {
        scope.creating = undefined;
        showErrors(err);
      });
    };

    scope.back = function() {
      window.location.href = '/#/locations/' + scope.location.slug + '/splash_pages/' + scope.splash.id;
    };

    init();

  };

  return {
    link: link,
    scope: {
      store: '=',
      loading: '='
    },
    templateUrl: 'components/splash_pages/view-store.html'
  };

}]);
