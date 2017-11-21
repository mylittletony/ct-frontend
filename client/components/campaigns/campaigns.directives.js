'use strict';

var app = angular.module('myApp.campaigns.directives', []);

app.directive('listCampaigns', ['Campaign', 'BrandTrigger', '$routeParams', '$rootScope', '$http', '$mdDialog', 'showToast', 'showErrors', 'gettextCatalog', 'pagination_labels', '$cookies', '$location', function (Campaign, BrandTrigger, $routeParams, $rootScope, $http, $mdDialog, showToast, showErrors, gettextCatalog, pagination_labels, $cookies, $location) {

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
        name: gettextCatalog.getString('Edit'),
        icon: 'settings',
        type: 'view'
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
        Campaign.destroy({}, {
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
      console.log('hello')
      Campaign.query(params).$promise.then(function(results) {
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
      window.location.href = '/#/locations/' + scope.location.slug + '/campaigns/new';
    };

    init();

  };

  return {
    link: link,
    scope: {
      loading: '='
    },
    templateUrl: 'components/campaigns/index/_index.html'
  };

}]);

app.directive('editCampaign', ['Campaign', 'BrandTrigger', 'Integration', 'Auth', '$q', '$routeParams', '$rootScope', '$http', '$location', 'showToast', 'showErrors', '$sce', 'gettextCatalog', '$mdDialog', function (Campaign, BrandTrigger, Integration, Auth, $q, $routeParams, $rootScope, $http, $location, showToast, showErrors, $sce, gettextCatalog, $mdDialog) {

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
      { key: gettextCatalog.getString('All'), value: '_all' },
      { key: gettextCatalog.getString('Boxes'), value: 'box' },
      { key: gettextCatalog.getString('Clients'), value: 'client' },
      { key: gettextCatalog.getString('Email'), value: 'email' },
      { key: gettextCatalog.getString('Guests'), value: 'guest' },
      { key: gettextCatalog.getString('Locations'), value: 'location' },
      { key: gettextCatalog.getString('Networks'), value: 'network' },
      { key: gettextCatalog.getString('Splash'), value: 'splash' },
      { key: gettextCatalog.getString('Social'), value: 'social' },
      { key: gettextCatalog.getString('Store'), value: 'store' },
      { key: gettextCatalog.getString('Triggers'), value: 'trigger' },
      { key: gettextCatalog.getString('Vouchers'), value: 'voucher' },
      { key: gettextCatalog.getString('Users'), value: 'user' },
      { key: gettextCatalog.getString('Zones'), value: 'zone' }
    ];

    if (scope.location.slug) {
      scope.triggers.push({ key: gettextCatalog.getString('Actions'), value: 'action' });
      scope.triggers.push({ key: gettextCatalog.getString('Rogues'), value: 'rogue' });
    }

    if (scope.brand.id) {
      scope.triggers.push({ key: gettextCatalog.getString('Projects'), value: 'project' });
      scope.triggers.push({ key: gettextCatalog.getString('Project Users'), value: 'project_user' });
    }

    scope.channels = [
      { key: gettextCatalog.getString('Email'), value: 'email' },
      { key: gettextCatalog.getString('Slack'), value: 'slack' },
      { key: gettextCatalog.getString('Webhook'), value: 'webhook' },
      // { key: gettextCatalog.getString('MailChimp'), value: 'mailchimp' },
      // { key: gettextCatalog.getString('SMS'), value: 'sms' }
    ];

    scope.everies = [
      { key: gettextCatalog.getString('Day'), value: 'day' },
      { key: gettextCatalog.getString('Week'), value: 'week' },
      { key: gettextCatalog.getString('Month'), value: 'month' },
      { key: gettextCatalog.getString('Weekday'), value: 'weekday' },
      { key: gettextCatalog.getString('Weekend'), value: 'weekend' },
    ];

    scope.hours = [
      { key: gettextCatalog.getString('12AM'), value: 0 },
      { key: gettextCatalog.getString('01AM'), value: 1 },
      { key: gettextCatalog.getString('02AM'), value: 2 },
      { key: gettextCatalog.getString('03AM'), value: 3 },
      { key: gettextCatalog.getString('04AM'), value: 4 },
      { key: gettextCatalog.getString('05AM'), value: 5 },
      { key: gettextCatalog.getString('06AM'), value: 6 },
      { key: gettextCatalog.getString('07AM'), value: 7 },
      { key: gettextCatalog.getString('08AM'), value: 8 },
      { key: gettextCatalog.getString('09AM'), value: 9 },
      { key: gettextCatalog.getString('10AM'), value: 10 },
      { key: gettextCatalog.getString('11AM'), value: 11 },
      { key: gettextCatalog.getString('12PM'), value: 12 },
      { key: gettextCatalog.getString('01PM'), value: 13 },
      { key: gettextCatalog.getString('02PM'), value: 14 },
      { key: gettextCatalog.getString('03PM'), value: 15 },
      { key: gettextCatalog.getString('04PM'), value: 16 },
      { key: gettextCatalog.getString('05PM'), value: 17 },
      { key: gettextCatalog.getString('06PM'), value: 18 },
      { key: gettextCatalog.getString('07PM'), value: 19 },
      { key: gettextCatalog.getString('08PM'), value: 20 },
      { key: gettextCatalog.getString('09PM'), value: 21 },
      { key: gettextCatalog.getString('10PM'), value: 22 },
      { key: gettextCatalog.getString('11PM'), value: 23 },
    ];

    scope.mins = [
      { key: gettextCatalog.getString('00 Minutes'), value: '00' },
      { key: gettextCatalog.getString('15 Minutes'), value: '15' },
      { key: gettextCatalog.getString('30 Minutes'), value: '30' },
      { key: gettextCatalog.getString('45 Minutes'), value: '45' },
    ];

    scope.webhook_types = ['POST', 'GET'];
    scope.user = Auth.currentUser();

    scope.resetTypes = function() {
      scope.trigger.trigger_type = undefined;
      scope.trigger.channel = undefined;
    };

    var createMenu = function() {
      scope.allowed = true;
      scope.menu = [];
      if (scope.trigger.id) {
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
        Campaign.destroy({}, {
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
        Campaign.update({}, params).$promise.then(function(results) {
          scope.loading = undefined;
        }, function(err) {
          scope.errors = err;
        });
      }
    };

    var formatCronTime = function() {
      scope.trigger.cron_time = scope.trigger.hours + scope.trigger.mins;
    };

    scope.save = function(form) {
      form.$setPristine();
      setCustomName();
      formatCronTime();
      if (scope.trigger.id) {
        update();
      } else {
        save();
      }
    };

    var updateSuccess = function(results) {
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
      Campaign.update({}, params).$promise.then(function(results) {
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
      Campaign.save({}, {
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
    };

    scope.initChannel = function() {
      scope.error = undefined;
      if (scope.trigger.channel === 'webhook') {
        blank();
        if (!scope.trigger.id) {
          scope.trigger.attr_1 = undefined;
        }
        initWebhook();
      } else if (scope.trigger.channel === 'email') {
        initEmail();
      }
    };

    var initWebhook = function() {
      if (scope.trigger.attr_2 !== 'POST' && scope.trigger.attr_2 !== 'GET') {
        scope.trigger.attr_2 = 'POST';
      }
    };

    var initEmail = function() {
      if (!scope.trigger.id) {
        scope.trigger.attr_1 = '{{ Email }}';
        scope.trigger.attr_2 = undefined;
        scope.trigger.attr_3 = gettextCatalog.getString('[WELCOME] Thanks for logging in');
        scope.trigger.attr_4 = gettextCatalog.getString('Hello\n\nThanks for logging in today at {{ Location_Name }}!\n\nWe\'re super excited to meet you. \n\nThe Lodge');
      }
    };

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
      start = moment(start, 'HH');
      end = moment(end, 'HH');
      scope.trigger.starttime = new Date(start);
      scope.trigger.endtime = new Date(end);
    };

    var formatDays = function() {
      scope.trigger.periodic_days = [];
      if (!scope.trigger.allowed_days) {
        scope.trigger.allowed_days = ['0','1','2','3','4','5','6'];
      }
    };

    var formatCron = function() {
      var array, cronT, newcronT, mins;
      if (scope.trigger.cron_time === undefined || scope.trigger.cron_time === '' || scope.trigger.cron_time === null) {
        return;
      }

      cronT = scope.trigger.cron_time;
      newcronT = cronT.substr(0, cronT.length-2);
      mins = scope.trigger.cron_time.slice(-2);

      scope.trigger.hours = newcronT;
      scope.trigger.mins = mins;
    };

    var formatTimes = function() {
      formatAlertTime();
      formatDays();
      formatCron();
    };

    var triggerLoaded = function(results) {
      scope.trigger = results;
      scope.initChannel();
      setTriggerType(results.trigger_type);
      formatTimes();

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
      Campaign.get({
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
      formatTimes();
      scope.trigger.type = '_all';
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
    templateUrl: 'components/campaigns/edit/_edit.html'
  };

}]);