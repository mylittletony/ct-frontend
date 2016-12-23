'use strict';

var app = angular.module('myApp.triggers.directives', []);

app.directive('listTriggers', ['Trigger', 'BrandTrigger', '$routeParams', '$rootScope', '$http', '$mdDialog', 'showToast', 'showErrors', 'gettextCatalog', 'pagination_labels', '$cookies', '$location', function (Trigger, BrandTrigger, $routeParams, $rootScope, $http, $mdDialog, showToast, showErrors, gettextCatalog, pagination_labels, $cookies, $location) {

  var link = function(scope,element,attrs) {

    scope.location = {};
    scope.brand = {};

    var path = $location.path().split('/');
    if (path[1] === 'brands') {
      scope.brand.id =  $routeParams.brand_id;
    } else {
      scope.location.slug = $routeParams.id;
    }

    if ($cookies.get('xct-trggrs') === '1') {
      scope.xctTrggrs = true;
    }

    scope.dismissTrigger = function() {
      $cookies.put('xct-trggrs', '1');
      scope.xctTrggrs = true;
    };

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
      var hash    = {};
      scope.page  = scope._links.current_page;
      hash.page   = scope.query.page;

      $location.search(hash);
      init();
    };

    // user permissions //
    var createMenu = function() {

      // User permissions //
      scope.allowed = true;

      scope.menu = [];

      scope.menu.push({
        name: gettextCatalog.getString('View'),
        icon: 'pageview',
        type: 'view'
      });

      scope.menu.push({
        name: gettextCatalog.getString('Edit'),
        icon: 'settings',
        type: 'edit'
      });

      scope.menu.push({
        name: gettextCatalog.getString('Logs'),
        icon: 'list',
        type: 'logs'
      });

      scope.menu.push({
        name: gettextCatalog.getString('Delete'),
        icon: 'delete_forever',
        type: 'delete'
      });

    };

    scope.action = function(type,trigger) {
      switch(type) {
        case 'view':
          view(trigger.id);
          break;
        case 'edit':
          edit(trigger.id);
          break;
        case 'logs':
          logs(trigger.id);
          break;
        case 'delete':
          destroy(trigger.id);
          break;
      }
    };

    var destroy = function(id) {
      var confirm = $mdDialog.confirm()
      .title(gettextCatalog.getString('Delete Trigger'))
      .textContent(gettextCatalog.getString('Are you sure you want to delete this trigger?'))
      .ariaLabel(gettextCatalog.getString('Delete Trigger'))
      .ok(gettextCatalog.getString('Delete'))
      .cancel(gettextCatalog.getString('Cancel'));
      $mdDialog.show(confirm).then(function() {
        scope.destroy(id);
      }, function() {
      });
    };

    scope.destroy = function(id) {
      if (scope.brand.id) {
        BrandTrigger.destroy({}, {
          brand_id: scope.brand.id,
          id: id
        }).$promise.then(function(results) {
          removeFromList(id);
        }, function(err) {
          showErrors(err);
        });
      } else {
        Trigger.destroy({}, {
          location_id: scope.location.slug,
          id: id
        }).$promise.then(function(results) {
          removeFromList(id);
        }, function(err) {
          showErrors(err);
        });
      }
    };

    var removeFromList = function(id) {
      for (var i = 0, len = scope.triggers.length; i < len; i++) {
        if (scope.triggers[i].id === id) {
          scope.triggers.splice(i, 1);
          showToast(gettextCatalog.getString('Trigger successfully deleted.'));
          break;
        }
      }
    };

    var loadedTriggers = function(results) {
      scope.triggers = results.triggers;
      scope._links   = results._links;
      createMenu();
      scope.loading  = undefined;
    };

    var brandTriggers = function(params) {
      params.brand_id = scope.brand.id;
      BrandTrigger.query(params).$promise.then(function(results) {
        loadedTriggers(results);
      }, function(err) {
        console.log(err);
        scope.loading = undefined;
      });
    };

    var locationTriggers = function(params) {
      params.location_id = scope.location.slug;
      Trigger.query(params).$promise.then(function(results) {
        loadedTriggers(results);
      }, function(err) {
        console.log(err);
        scope.loading = undefined;
      });
    };

    var init = function() {
      var params = {
        per: scope.query.limit,
        page: scope.query.page
      };
      if (scope.brand.id) {
        brandTriggers(params);
        return;
      }
      locationTriggers(params);
    };

    var view = function(id) {
      if (scope.brand.id) {
        window.location.href = '/#/brands/' + scope.brand.id + '/triggers/' + id;
      } else {
        window.location.href = '/#/locations/' + scope.location.slug + '/triggers/' + id;
      }
    };

    var edit = function(id) {
      if (scope.brand.id) {
        window.location.href = '/#/brands/' + scope.brand.id + '/triggers/' + id + '/edit';
      } else {
        window.location.href = '/#/locations/' + scope.location.slug + '/triggers/' + id + '/edit';
      }
    };

    var logs = function(id) {
      if (scope.brand.id) {
        window.location.href = '/#/brands/' + scope.brand.id + '/triggers/' + id + '/trigger_history';
      } else {
        window.location.href = '/#/locations/' + scope.location.slug + '/triggers/' + id + '/trigger_history';
      }
    };

    scope.create = function() {
      if (scope.brand.id) {
        window.location.href = '/#/brands/' + scope.brand.id + '/triggers/new';
      } else {
        window.location.href = '/#/locations/' + scope.location.slug + '/triggers/new';
      }
    };

    init();

  };

  return {
    link: link,
    scope: {
      loading: '='
    },
    templateUrl: 'components/views/triggers/list.html'
  };

}]);

app.directive('editTrigger', ['Trigger', 'BrandTrigger', 'Integration', 'Auth', '$q', '$routeParams', '$rootScope', '$http', '$location', 'showToast', 'showErrors', '$sce', 'gettextCatalog', '$mdDialog', function (Trigger, BrandTrigger, Integration, Auth, $q, $routeParams, $rootScope, $http, $location, showToast, showErrors, $sce, gettextCatalog, $mdDialog) {

  var link = function(scope,element,attrs) {

    scope.trigger = { id: $routeParams.trigger_id };
    scope.location = {};
    scope.brand = {};

    var path = $location.path().split('/');
    if (path[1] === 'brands') {
      scope.brand.id =  $routeParams.brand_id;
    } else {
      scope.location.slug = $routeParams.id;
    }

    scope.triggers = [
      { key: gettextCatalog.getString('All'), value: 'all' },
      { key: gettextCatalog.getString('Boxes'), value: 'box' },
      { key: gettextCatalog.getString('Clients'), value: 'client' },
      { key: gettextCatalog.getString('Email'), value: 'email' },
      { key: gettextCatalog.getString('Guests'), value: 'guest' },
      { key: gettextCatalog.getString('Locations'), value: 'location' },
      { key: gettextCatalog.getString('Networks'), value: 'network' },
      { key: gettextCatalog.getString('Rogues'), value: 'rogue' },
      { key: gettextCatalog.getString('Splash'), value: 'splash' },
      { key: gettextCatalog.getString('Social'), value: 'social' },
      { key: gettextCatalog.getString('Store'), value: 'store' },
      { key: gettextCatalog.getString('Triggers'), value: 'trigger' },
      { key: gettextCatalog.getString('Vouchers'), value: 'voucher' },
      { key: gettextCatalog.getString('Users'), value: 'user' },
      { key: gettextCatalog.getString('Zones'), value: 'zone' }
    ];

    if (scope.brand.id) {
      scope.triggers.push({ key: gettextCatalog.getString('Projects'), value: 'project' });
      scope.triggers.push({ key: gettextCatalog.getString('Project Users'), value: 'project_user' });
    }

    scope.channels = [
      { key: 'Email', value: 'email' },
      { key: 'Slack', value: 'slack' },
      { key: 'Webhook', value: 'webhook' },
      // { key: 'MailChimp', value: 'mailchimp' },
      // { key: 'SMS', value: 'sms' }
    ];
    scope.webhook_types = ['POST', 'GET'];
    scope.user = Auth.currentUser();

    scope.resetTypes = function() {
      scope.trigger.trigger_type = undefined;
      scope.trigger.channel = undefined;
    };

    var formatTonyTime = function() {
      scope.trigger.start_hour = scope.trigger.starttime.getHours() + '' + ('0' + scope.trigger.starttime.getMinutes()).slice(-2);
      scope.trigger.end_hour = scope.trigger.endtime.getHours() + '' + ('0' + scope.trigger.endtime.getMinutes()).slice(-2);
    };

    var createMenu = function() {

      // User permissions //
      scope.allowed = true;
      scope.menu = [];

      scope.menu.push({
        name: gettextCatalog.getString('Edit'),
        icon: 'settings',
        type: 'edit'
      });

      // Removed until we re-wire backend
      // scope.menu.push({
      //   name: gettextCatalog.getString('Test'),
      //   icon: 'compare_arrows',
      //   type: 'test'
      // });

      // We don't have an end-point for brand trigger hist yet
      if (scope.trigger.location_id) {
        scope.menu.push({
          name: gettextCatalog.getString('Logs'),
          icon: 'list',
          type: 'logs'
        });
      }

      if (!scope.trigger.locked) {
        scope.menu.push({
          name: gettextCatalog.getString('Delete'),
          icon: 'delete_forever',
          type: 'delete'
        });
      }
    };

    scope.action = function(type,trigger) {
      switch(type) {
        case 'edit':
          edit();
          break;
        // case 'test':
        //   test();
        //   break;
        case 'logs':
          logs();
          break;
        case 'delete':
          destroy();
          break;
      }
    };

    var destroy = function(id) {
      var confirm = $mdDialog.confirm()
      .title(gettextCatalog.getString('Delete Trigger'))
      .textContent(gettextCatalog.getString('Are you sure you want to delete this trigger?'))
      .ariaLabel(gettextCatalog.getString('Delete Trigger'))
      .ok(gettextCatalog.getString('Delete'))
      .cancel(gettextCatalog.getString('Cancel'));
      $mdDialog.show(confirm).then(function() {
        destroyTrigger(id);
      }, function() {
      });
    };

    var destroySuccess = function() {
      if (scope.brand.id) {
        $location.path('/brands/' + scope.brand.id + '/triggers/');
      } else {
        $location.path('/locations/' + scope.location.slug + '/triggers/');
      }
      showToast(gettextCatalog.getString('Trigger successfully deleted.'));
    };

    var destroyTrigger = function() {
      if (scope.brand.id) {
      BrandTrigger.destroy({}, {
        brand_id: scope.brand.id,
        id: scope.trigger.id
      }).$promise.then(function(results) {
        destroySuccess();
      }, function(err) {
        showErrors(err);
      });
      } else {
        Trigger.destroy({}, {
          location_id: scope.location.slug,
          id: scope.trigger.id
        }).$promise.then(function(results) {
          destroySuccess();
        }, function(err) {
          showErrors(err);
        });
      }
    };

    var logs = function() {
      if (scope.brand.id) {
        window.location.href = '/#/brands/' + scope.brand.id + '/triggers/' + scope.trigger.id + '/trigger_history';
      } else {
        window.location.href = '/#/locations/' + scope.location.slug + '/triggers/' + scope.trigger.id + '/trigger_history';
      }
    };

    var edit = function() {
      if (scope.brand.id) {
        window.location.href = '/#/brands/' + scope.brand.id + '/triggers/' + scope.trigger.id + '/edit';
      } else {
        window.location.href = '/#/locations/' + scope.location.slug + '/triggers/' + scope.trigger.id + '/edit';
      }
    };

    scope.active = function() {
      var params = {
        id: scope.trigger.id,
        trigger: { active: true }
      };
      if (scope.brand.id) {
        params.brand_id = scope.brand.id;
        BrandTrigger.update({}, params).$promise.then(function(results) {
          scope.loading = undefined;
        }, function(err) {
          scope.errors = err;
        });
      } else {
        params.location_id = scope.location.slug;
        Trigger.update({}, params).$promise.then(function(results) {
          scope.loading = undefined;
        }, function(err) {
          scope.errors = err;
        });
      }
    };

    scope.save = function(form) {
      form.$setPristine();
      setCustomName();
      formatTonyTime();
      if (scope.trigger.id) {
        update();
      } else {
        save();
      }
    };

    var updateSuccess = function(results) {
      // scope.trigger = results;
      // redirect(results.id);
      showToast(gettextCatalog.getString('Trigger successfully updated.'));
    };

    var brandUpdate = function(params) {
      BrandTrigger.update({}, params).$promise.then(function(results) {
        updateSuccess(results);
      }, function(err) {
        showErrors(err);
      });
    };

    var locationUpdate = function(params) {
      Trigger.update({}, params).$promise.then(function(results) {
        updateSuccess(results);
      }, function(err) {
        showErrors(err);
      });
    };

    var update = function() {
      var params = {
        id: scope.trigger.id,
        trigger: scope.trigger
      };
      if (scope.brand.id) {
        params.brand_id = scope.brand.id;
        brandUpdate(params);
        return;
      }
      params.location_id = scope.location.slug;
      locationUpdate(params);
    };

    var saveSuccess = function(results) {
      redirect(results.id);
      showToast(gettextCatalog.getString('Trigger created successfully.'));
    };

    var locationSave = function(results) {
      Trigger.save({}, {
        location_id: scope.location.slug,
        trigger: scope.trigger,
      }).$promise.then(function(results) {
        saveSuccess(results);
      }, function(err) {
        showErrors(err);
      });
    };

    var brandSave = function() {
      BrandTrigger.save({}, {
        brand_id: scope.brand.id,
        trigger: scope.trigger,
      }).$promise.then(function(results) {
        saveSuccess(results);
      }, function(err) {
        showErrors(err);
      });
    };

    var save = function() {
      if (scope.brand.id) {
        brandSave();
        return;
      }
      locationSave();
    };

    var redirect = function(id) {
      if (scope.brand.id) {
        $location.path('/brands/' + scope.brand.id + '/triggers/' + id);
        return;
      }
      $location.path('/locations/' + scope.location.slug + '/triggers/' + id);
    };

    var setCustomName = function() {
      // if (scope.trigger.channel === 'slack') {
      //   for (var i = 0; i < scope.slack_channels.length; i++) {
      //     if (scope.slack_channels[i].id === scope.trigger.attr_1) {
      //       scope.trigger.custom_1 = scope.slack_channels[i].name;
      //     }
      //   }
      // }
      if (scope.trigger.channel === 'mailchimp' && scope.chimp_lists) {
        for (var j = 0; j < scope.chimp_lists.length; j++) {
          if (scope.chimp_lists[j].id === scope.trigger.attr_1) {
            scope.trigger.custom_1 = scope.chimp_lists[j].name;
          }
        }
      }
      else if (scope.trigger.channel === 'sms') {
        // for (var i = 0; i < scope.chimp_lists.length; i++) {
        //   if (scope.chimp_lists[i].id === scope.trigger.attr_1) {
        //     scope.trigger.custom_1 = scope.chimp_lists[i].name;
        //   }
        // }
      }
    };

    scope.initChannel = function() {
      scope.error = undefined;
      // if (scope.trigger.channel === 'slack') {
      //   blank();
      //   initSlack();
      // } else if (scope.trigger.channel === 'webhook') {
      if (scope.trigger.channel === 'webhook') {
        blank();
        if (!scope.trigger.id) {
          scope.trigger.attr_1 = undefined;
        }
        initWebhook();
      // } else if (scope.trigger.channel === 'mailchimp') {
      //   blank();
      //   initMc();
      // } else if (scope.trigger.channel === 'sms') {
      //   blank();
      //   initSms();
      } else if (scope.trigger.channel === 'email') {
        initEmail();
      }
    };

    // var initSlack = function() {
    // };

    var initWebhook = function() {
      if (scope.trigger.attr_2 !== 'POST' || scope.trigger.attr_2 !== 'GET') {
        scope.trigger.attr_2 = 'POST';
      }
    };

//     var initMc = function() {
//       scope.loading_integration = true;
//       checkMcIntegrated().then(function(a) {
//         chimpLists();
//         scope.loading_integration = undefined;
//       }, function(err) {
//         blank(true);
//         scope.error = err;
//         scope.loading_integration = undefined;
//       });
//     };

    var initEmail = function() {
      if (!scope.trigger.id) {
        scope.trigger.attr_1 = '{{ Email }}';
        scope.trigger.attr_2 = undefined;
        scope.trigger.attr_3 = gettextCatalog.getString('[WELCOME] Thanks for logging in');
        scope.trigger.attr_4 = gettextCatalog.getString('Hello\n\nThanks for logging in today at {{ Location_Name }}!\n\nWe\'re super excited to meet you. \n\nThe Lodge');
      }
    };

    // var initSms = function() {
    //   scope.loading_integration = true;
    //   checkSmsIntegrated().then(function(a) {
    //     twillioNumbers();
    //     scope.loading_integration = undefined;
    //     // scope.trigger.attr_2 = gettextCatalog.getString('A box with {{ Ap_Mac }} just went {{ State }} in {{ Location_Name }}');
    //   }, function(err) {
    //     blank(true);
    //     scope.error = $sce.trustAsHtml(err);
    //     scope.loading_integration = undefined;
    //   });
    // };

    var blank = function(force) {
      if ( force ) {
        scope.trigger.attr_1 = undefined;
      } else if (!scope.trigger.id) {
        scope.trigger.attr_2 = undefined;
        scope.trigger.attr_3 = undefined;
        scope.trigger.attr_4 = undefined;
        scope.trigger.attr_5 = undefined;
      }
    };

    var integrations = [];
    var checkSlackIntegrated = function() {
      var msg;
      var deferred = $q.defer();
      Integration.get({q: 'slack', location_id: scope.location.slug}).$promise.then(function(results) {
        integrations = [];
        for (var i = 0; i < results.length; i++) {
          if (results[i].access_token) {
            integrations.push(results[i]);
          }
        }
        if (integrations.length > 0) {
          deferred.resolve();
        } else {
          msg = gettextCatalog.getString('Slack isn\'t setup yet, or you don\'t have any active integrations. Do that now and come back.');
          scope.loading_integration = undefined;
          deferred.reject(msg);
        }
      }, function(err) {
        msg = gettextCatalog.getString('Unknown error, please try again');
        deferred.reject(msg);
      });
      return deferred.promise;
    };

    var slackChannels = function() {
      var deferred = $q.defer();
      Integration.slack_channels({id: integrations[0].id}).$promise.then(function(results) {
        scope.trigger.access_token = integrations[0].access_token;
        scope.slack_channels = results;
        deferred.resolve();
      }, function(err) {
        scope.error = gettextCatalog.getString('You don\'t have any active channel associated with your slack account.');
        deferred.reject();
      });
      scope.loading_integration = undefined;
      return deferred.promise;
    };

    // var checkMcIntegrated = function() {
    //   var msg;
    //   var deferred = $q.defer();
    //   Integration.get({q: 'mailchimp'}).$promise.then(function(results) {
    //     for (var i = 0; i < results.length; i++) {
    //       if (results[i].access_token) {
    //         integrations.push(results[i]);
    //       }
    //     }
    //     if (integrations.length > 0) {
    //       deferred.resolve();
    //     } else {
    //       msg = gettextCatalog.getString('MailChimp isn\'t setup yet. Do that first and come back.');
    //       scope.loading_integration = undefined;
    //       deferred.reject(msg);
    //     }
    //   }, function(err) {
    //     msg = 'Unknown error, please try again';
    //     deferred.reject(msg);
    //   });
    //   return deferred.promise;
    // };

    // var chimpLists = function() {
    //   var deferred = $q.defer();
    //   Integration.chimp_lists({id: integrations[0].id}).$promise.then(function(results) {
    //     scope.chimp_lists = results;
    //     scope.trigger.attr_2 = '{{ Email }}';
    //     deferred.resolve();
    //   }, function(err) {
    //     scope.error = gettextCatalog.getString('You don\'t have any active lists associated with your account.');
    //     deferred.reject();
    //   });
    //   return deferred.promise;
    // };

    // var checkSmsIntegrated = function() {
    //   var msg;
    //   var deferred = $q.defer();
    //   Integration.get({q: 'twillio'}).$promise.then(function(results) {
    //     for (var i = 0; i < results.length; i++) {
    //       if (results[i].access_token) {
    //         integrations.push(results[i]);
    //       }
    //     }
    //     if (integrations.length > 0) {
    //       deferred.resolve();
    //     } else {
    //       //fixme @Toni translations: the anchor might not work
    //       msg = gettextCatalog.getString('Twillio isn\'t setup yet, or you don\'t have any active integrations. You can <a href=\'/#/me/integrations\'>do that here</a>.');
    //       scope.loading_integration = undefined;
    //       deferred.reject(msg);
    //     }
    //   }, function(err) {
    //     msg = gettextCatalog.getString('Unknown error, please try again');
    //     deferred.reject(msg);
    //     scope.loading_integration = undefined;
    //   });
    //   return deferred.promise;
    // };

    // var twillioNumbers = function() {
    //   var deferred = $q.defer();
    //   Integration.twillio({id: integrations[0].id}).$promise.then(function(results) {
    //     scope.trigger.access_token = integrations[0].access_token;
    //     scope.twillio_numbers = results;
    //     scope.loading = undefined;
    //     deferred.resolve();
    //   }, function(err) {
    //     scope.error = gettextCatalog.getString('You don\'t have any active numbers associated with your Twillio account.');
    //     deferred.reject();
    //   });
    //   return deferred.promise;
    // };

    var setTriggerType = function(type) {
      if (type) {
        scope.trigger.type = type.split('.')[0];
      }
    };

    scope.back = function() {
      window.history.back();
    };

    var formatAlertTime = function() {
      var start, end;
      start = ('0' + scope.trigger.start_hour).slice(-4);
      end   = ('0' + scope.trigger.end_hour).slice(-4);
      start = moment(start, 'hh:mm:ss');
      end = moment(end, 'hh:mm:ss');
      scope.trigger.starttime = new Date(start);
      scope.trigger.endtime = new Date(end);
    };

    var formatDays = function() {
      scope.trigger.periodic_days = [];
      if (!scope.trigger.allowed_days) {
        scope.trigger.allowed_days = ['0','1','2','3','4','5','6'];
      }
      scope.trigger.periodic_days_cron = [];
    };

    var triggerLoaded = function(results) {
      scope.trigger = results;
      scope.initChannel();
      setTriggerType(results.trigger_type);
      formatAlertTime();
      formatDays();
      if (scope.trigger.cron) {
        scope.trigger.schedule = 1;
        scope.cron = true;
      }
      createMenu();
      scope.loading = undefined;
    };

    var brandTrigger = function(params) {
      BrandTrigger.get({
        brand_id: scope.brand.id,
        id: $routeParams.trigger_id
      }).$promise.then(function(results) {
        triggerLoaded(results);
      }, function(err) {
        scope.errors = err;
      });
    };

    var locationTrigger = function(params) {
      Trigger.get({
        location_id: scope.location.slug,
        id: $routeParams.trigger_id
      }).$promise.then(function(results) {
        triggerLoaded(results);
      }, function(err) {
        scope.errors = err;
      });
    };

    var init = function() {
      if (scope.brand.id) {
        brandTrigger();
        return;
      }
      locationTrigger();
    };

    if (scope.trigger.id) {
      init();
    } else {
      formatAlertTime();
      formatDays();
      scope.trigger.type = 'all';
      if ($routeParams.object) {
        scope.trigger.type = $routeParams.object;
      }
      scope.trigger.trigger_type = $routeParams.action;
      scope.trigger.trigger_event = 'notify';
      scope.trigger.schedule = 0;
      scope.loading = undefined;
      createMenu();
    }
  };

  return {
    link: link,
    scope: {
      loading: '='
    },
    templateUrl: 'components/views/triggers/_edit.html'
  };

}]);

app.directive('channelTypes', [function() {
  var link = function(scope, element, attrs) {
    attrs.$observe('ver', function(start) {
      if (start !== '') {
        scope.getPanel = function() {
          return 'components/views/triggers/channel-' + attrs.ver + '.html';
        };
      }
    });
  };

  return {
    link: link,
    template: '<div ng-include="getPanel()"></div>'
  };

}]);


app.directive('showTriggerDetails', [function() {
  var link = function(scope, element, attrs) {
    attrs.$observe('ver', function(start) {
      if (start !== '') {
        scope.getPanel = function() {
          return 'components/views/triggers/show-' + attrs.ver + '.html';
        };
      }
    });
  };

  return {
    link: link,
    template: '<div ng-include="getPanel()"></div>'
  };

}]);

app.directive('triggerTags', ['$mdDialog',function($mdDialog) {
  var link = function(scope, element, attrs) {

    scope.showVars = function() {
      $mdDialog.show({
        templateUrl: 'components/views/triggers/_vars.html',
        clickOutsideToClose: true,
        parent: angular.element(document.body),
        controller: DialogController,
        locals: {
          type: attrs.type,
          channel: attrs.channel
        }
      });
    };

    function DialogController($scope,type,channel) {
      $scope.type = type;
      $scope.channel = channel;
      $scope.close = function() {
        $mdDialog.cancel();
      };
    }
    DialogController.$inject = ['$scope', 'type', 'channel'];

    attrs.$observe('channel', function(start) {
      scope.type = attrs.type;
      scope.channel = attrs.channel;
    });
  };

  return {
    link: link,
    scope: {
      type: '@',
      channel: '@',
    },
    templateUrl: 'components/views/triggers/_webhook_variables.html',
  };

}]);

app.directive('listTriggerHistory', ['TriggerHistory', '$http', '$routeParams', '$location', 'gettextCatalog', 'pagination_labels', function(TriggerHistory, $http, $routeParams, $location, gettextCatalog, pagination_labels) {
  var link = function(scope, element, attrs) {

    scope.location  = { slug: $routeParams.id };
    scope.trigger   = { id: $routeParams.trigger_id };

    scope.pagination_labels = pagination_labels;
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
      $location.search(hash);
      scope.init();
    };

    // user permissions //
    var createMenu = function() {

      scope.menu = [];

      scope.menu.push({
        name: gettextCatalog.getString('View'),
        icon: 'pageview',
        type: 'view'
      });

    };

    scope.action = function(id,type) {
      switch(type) {
        case 'view':
          view(id);
          break;
      }
    };

    scope.init = function() {
      TriggerHistory.query({
        location_id:  scope.location.slug,
        trigger_id:   $routeParams.trigger_id,
        page:         scope.query.page,
        per:          scope.query.limit
      }).$promise.then(function(results) {
        scope.histories = results.history;
        scope._links    = results._links;
        scope.loading   = undefined;
        createMenu();
      }, function(err) {
        scope.errors = err;
      });
    };

    var view = function(id) {
      window.location.href = '/#/locations/' + scope.location.slug + '/triggers/' + scope.trigger.id + '/trigger_history/' + id;
    };

    scope.back = function() {
      window.location.href = '/#/locations/' + scope.location.slug + '/triggers/' + scope.trigger.id;
    };

    scope.init();

  };

  return {
    link: link,
    scope: {
      loading: '='
    },
    templateUrl: 'components/views/triggers/history/_index.html'
  };

}]);

app.directive('showTriggerHistory', ['TriggerHistory', '$http', '$routeParams', '$location', '$compile', '$sce', function(TriggerHistory, $http, $routeParams, $location, $compile, $sce) {
  var link = function(scope, element, attrs) {

    scope.loading   = true;
    scope.location  = { slug: $routeParams.id };
    scope.trigger   = { id: $routeParams.trigger_id };

    scope.init = function() {
      TriggerHistory.get({
        location_id:  scope.location.slug,
        trigger_id:   $routeParams.trigger_id,
        id:           $routeParams.trigger_history_id
      }).$promise.then(function(res) {
        scope.loading = undefined;
        scope.history = res;
      }, function(err) {
        scope.errors = err;
      });
    };

    scope.back = function() {
      window.location.href = '/#/locations/' + scope.location.slug + '/triggers/' + scope.trigger.id + '/trigger_history';
    };

    scope.init();

  };

  return {
    link: link,
    scope: {
      loading: '='
    },
    templateUrl: 'components/views/triggers/history/_show.html'
  };

}]);

