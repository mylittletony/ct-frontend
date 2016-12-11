'use strict';

var app = angular.module('myApp.triggers.directives', []);

app.directive('listTriggers', ['Trigger', '$routeParams', '$rootScope', '$http', '$mdDialog', 'showToast', 'showErrors', 'gettextCatalog', 'pagination_labels', function (Trigger, $routeParams, $rootScope, $http, $mdDialog, showToast, showErrors, gettextCatalog, pagination_labels) {

  var link = function(scope,element,attrs) {

    scope.loading = true;
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
      order:      '-created_at',
      limit:      $routeParams.per || 25,
      page:       $routeParams.page || 1,
      options:    [5,10,25,50,100],
      direction:  $routeParams.direction || 'desc'
    };

    // scope.onPaginate = function (page, limit) {
    //   scope.query.page = page;
    //   scope.query.limit = limit;
    //   scope.updatePage();
    // };

    // scope.updatePage = function(item) {

    // };

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
      Trigger.destroy({location_id: scope.location.slug, id: id}).$promise.then(function(results) {
        removeFromList(id);
      }, function(err) {
        showErrors(err);
      });
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

    scope.init = function() {
      Trigger.query({
        q: scope.query,
        page: scope.page,
        location_id: scope.location.slug
      }).$promise.then(function(results) {
        scope.triggers = results.triggers;
        scope.loading = undefined;
        createMenu();
      }, function(err) {
        console.log(err);
      });
    };

    var view = function(id) {
      window.location.href = '/#/locations/' + scope.location.slug + '/triggers/' + id;
    };

    var edit = function(id) {
      window.location.href = '/#/locations/' + scope.location.slug + '/triggers/' + id + '/edit';
    };

    var logs = function(id) {
      window.location.href = '/#/locations/' + scope.location.slug + '/triggers/' + id + '/trigger_history';
    };

    scope.create = function() {
      window.location.href = '/#/locations/' + scope.location.slug + '/triggers/new';
    };
    scope.init();

  };

  return {
    link: link,
    scope: {
      loading: '='
    },
    templateUrl: 'components/locations/triggers/list.html'
  };

}]);

app.directive('newTrigger', ['Trigger', 'Integration', 'Auth', '$q', '$routeParams', '$rootScope', '$http', '$location', 'showToast', 'showErrors', '$sce', 'gettextCatalog', function (Trigger, Integration, Auth, $q, $routeParams, $rootScope, $http, $location, showToast, showErrors, $sce, gettextCatalog) {

  var link = function(scope,element,attrs) {

    scope.location = { slug: $routeParams.id };
    scope.trigger = { id: $routeParams.trigger_id };

    scope.triggers = [
      { key: gettextCatalog.getString('All'), value: 'all' },
      { key: gettextCatalog.getString('Boxes'), value: 'box' },
      { key: gettextCatalog.getString('Clients'), value: 'client' },
      { key: gettextCatalog.getString('Email'), value: 'email' },
      { key: gettextCatalog.getString('Guests'), value: 'guest' },
      { key: gettextCatalog.getString('Locations'), value: 'location' },
      { key: gettextCatalog.getString('Networks'), value: 'network' },
      { key: gettextCatalog.getString('Splash'), value: 'splash' },
      { key: gettextCatalog.getString('Social'), value: 'social' },
      { key: gettextCatalog.getString('Vouchers'), value: 'voucher' },
      { key: gettextCatalog.getString('Zones'), value: 'zone' }
    ];

    scope.channels = [
      { key: 'Email', value: 'email' },
      { key: 'Slack', value: 'slack' },
      { key: 'Webhook', value: 'webhook' },
      // { key: 'MailChimp', value: 'mailchimp' },
      // { key: 'SMS', value: 'sms' }
    ];
    scope.webhook_types = ['POST', 'GET'];
    scope.user = Auth.currentUser();

    scope.init = function() {
      Trigger.get({location_id: scope.location.slug, id: $routeParams.trigger_id}).$promise.then(function(results) {
        scope.trigger = results;
        scope.initChannel();
        setTriggerType(results.trigger_type);
        scope.loading = undefined;
      }, function(err) {
        scope.errors = err;
      });
    };

    scope.resetTypes = function() {
      scope.trigger.trigger_type = undefined;
    };

    scope.save = function(form) {
      form.$setPristine();
      setCustomName();
      if (scope.trigger.id) {
        update();
      } else {
        save();
      }
    };

    var update = function() {
      Trigger.update({
        location_id: scope.location.slug,
        id: scope.trigger.id,
        trigger: scope.trigger
      }).$promise.then(function(results) {
        scope.trigger = results;
        redirect(results.id);
        showToast(gettextCatalog.getString('Trigger successfully updated.'));
      }, function(err) {
        showErrors(err);
      });
    };

    var save = function() {
      Trigger.save({
        location_id: scope.location.slug,
        trigger: scope.trigger,

      }).$promise.then(function(results) {
        redirect(results.id);
        showToast(gettextCatalog.getString('Trigger created successfully.'));
      }, function(err) {
        showErrors(err);
      });
    };

    var redirect = function(id) {
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
      if (scope.trigger.channel === 'slack') {
        blank();
        initSlack();
      } else if (scope.trigger.channel === 'webhook') {
        blank();
        if (!scope.trigger.id) {
          scope.trigger.attr_1 = undefined;
        }
        initWebhook();
      } else if (scope.trigger.channel === 'mailchimp') {
        blank();
        initMc();
      } else if (scope.trigger.channel === 'sms') {
        blank();
        initSms();
      } else if (scope.trigger.channel === 'email') {
        initEmail();
      }
    };

    var initSlack = function() {
      // scope.loading_integration = true;
      // checkSlackIntegrated().then(function(a) {
      //   slackChannels();
        // scope.trigger.attr_2 = gettextCatalog.getString('A box with {{ Ap_Mac }} just went {{ State }} in {{ Location_Name }}');
        // scope.loading_integration = undefined;
      // }, function(err) {
      //   blank(true);
      //   scope.error = err;
      //   scope.loading_integration = undefined;
      // });
    };

    var initWebhook = function() {
      if (scope.trigger.attr_2 !== 'POST' || scope.trigger.attr_2 !== 'GET') {
        scope.trigger.attr_2 = 'POST';
      }
    };

    var initMc = function() {
      scope.loading_integration = true;
      checkMcIntegrated().then(function(a) {
        chimpLists();
        scope.loading_integration = undefined;
      }, function(err) {
        blank(true);
        scope.error = err;
        scope.loading_integration = undefined;
      });
    };

    var initEmail = function() {
      if (!scope.trigger.id) {
        scope.trigger.attr_1 = '{{ Email }}';
        scope.trigger.attr_2 = undefined;
        scope.trigger.attr_3 = gettextCatalog.getString('[WELCOME] Thanks for logging in');
        scope.trigger.attr_4 = gettextCatalog.getString('Hello\n\nThanks for logging in today atrrrr {{ Location_Name }}!\n\nWe\'re super excited to meet you. \n\nThe Lodge');
      }
    };

    var initSms = function() {
      scope.loading_integration = true;
      checkSmsIntegrated().then(function(a) {
        twillioNumbers();
        scope.loading_integration = undefined;
        // scope.trigger.attr_2 = gettextCatalog.getString('A box with {{ Ap_Mac }} just went {{ State }} in {{ Location_Name }}');
      }, function(err) {
        blank(true);
        scope.error = $sce.trustAsHtml(err);
        scope.loading_integration = undefined;
      });
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

    var checkMcIntegrated = function() {
      var msg;
      var deferred = $q.defer();
      Integration.get({q: 'mailchimp'}).$promise.then(function(results) {
        for (var i = 0; i < results.length; i++) {
          if (results[i].access_token) {
            integrations.push(results[i]);
          }
        }
        if (integrations.length > 0) {
          deferred.resolve();
        } else {
          msg = gettextCatalog.getString('MailChimp isn\'t setup yet. Do that first and come back.');
          scope.loading_integration = undefined;
          deferred.reject(msg);
        }
      }, function(err) {
        msg = 'Unknown error, please try again';
        deferred.reject(msg);
      });
      return deferred.promise;
    };

    var chimpLists = function() {
      var deferred = $q.defer();
      Integration.chimp_lists({id: integrations[0].id}).$promise.then(function(results) {
        scope.chimp_lists = results;
        scope.trigger.attr_2 = '{{ Email }}';
        deferred.resolve();
      }, function(err) {
        scope.error = gettextCatalog.getString('You don\'t have any active lists associated with your account.');
        deferred.reject();
      });
      return deferred.promise;
    };

    var checkSmsIntegrated = function() {
      var msg;
      var deferred = $q.defer();
      Integration.get({q: 'twillio'}).$promise.then(function(results) {
        for (var i = 0; i < results.length; i++) {
          if (results[i].access_token) {
            integrations.push(results[i]);
          }
        }
        if (integrations.length > 0) {
          deferred.resolve();
        } else {
          //fixme @Toni translations: the anchor might not work
          msg = gettextCatalog.getString('Twillio isn\'t setup yet, or you don\'t have any active integrations. You can <a href=\'/#/me/integrations\'>do that here</a>.');
          scope.loading_integration = undefined;
          deferred.reject(msg);
        }
      }, function(err) {
        msg = gettextCatalog.getString('Unknown error, please try again');
        deferred.reject(msg);
        scope.loading_integration = undefined;
      });
      return deferred.promise;
    };

    var twillioNumbers = function() {
      var deferred = $q.defer();
      Integration.twillio({id: integrations[0].id}).$promise.then(function(results) {
        scope.trigger.access_token = integrations[0].access_token;
        scope.twillio_numbers = results;
        scope.loading = undefined;
        deferred.resolve();
      }, function(err) {
        scope.error = gettextCatalog.getString('You don\'t have any active numbers associated with your Twillio account.');
        deferred.reject();
      });
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

    if (scope.trigger.id) {
      scope.init();
    } else {
      scope.trigger.type = 'all';
      if ($routeParams.object) {
        scope.trigger.type = $routeParams.object;
      }
      scope.trigger.trigger_type = $routeParams.action;
      scope.loading = undefined;
    }

  };

  return {
    link: link,
    scope: {
      loading: '='
    },
    templateUrl: 'components/locations/triggers/_new.html'
  };

}]);

app.directive('showTrigger', ['Trigger', '$q', '$routeParams', '$rootScope', '$http', '$location', '$pusher', 'Auth', '$mdDialog', 'showToast', 'showErrors', 'gettextCatalog', function (Trigger, $q, $routeParams, $rootScope, $http, $location, $pusher, Auth, $mdDialog, showToast, showErrors, gettextCatalog) {

  var link = function(scope,element,attrs) {

    scope.location = { slug: $routeParams.id };
    scope.trigger  = { id: $routeParams.trigger_id };

    // user permissions //
    var createMenu = function() {

      // User permissions //
      scope.allowed = true;

      scope.menu = [];

      scope.menu.push({
        name: gettextCatalog.getString('Edit'),
        icon: 'settings',
        type: 'edit'
      });

      scope.menu.push({
        name: gettextCatalog.getString('Test'),
        icon: 'compare_arrows',
        type: 'test'
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
        case 'edit':
          edit();
          break;
        case 'test':
          test();
          break;
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
        scope.destroy(id);
      }, function() {
      });
    };

    scope.destroy = function() {
      Trigger.destroy({location_id: scope.location.slug, id: scope.trigger.id}).$promise.then(function(results) {
        $location.path('/locations/' + scope.location.slug + '/triggers/');
        showToast(gettextCatalog.getString('Trigger successfully deleted.'));
      }, function(err) {
        showErrors(err);
      });
    };

    scope.init = function() {
      Trigger.get({location_id: scope.location.slug, id: scope.trigger.id}).$promise.then(function(results) {
        scope.trigger = results;
        scope.loading = undefined;
        createMenu();
      }, function(err) {
        scope.errors = err;
      });
    };

    scope.active = function() {
      Trigger.update({location_id: scope.location.slug, id: scope.trigger.id, trigger: scope.trigger}).$promise.then(function(results) {
        scope.trigger = results;
        scope.loading = undefined;
      }, function(err) {
        scope.errors = err;
      });
    };

    var test = function() {
      scope.trigger.test = undefined;
      scope.trigger.testing = true;
      Trigger.update({location_id: scope.location.slug, id: scope.trigger.id, trigger: { test: true }}).$promise.then(function(results) {
        showToast(gettextCatalog.getString('Running test, please wait.'));
      }, function(err) {
        showErrors(err);
      });
    };

    var channel;
    function subAlerts () {
      var pusher        = $pusher(client);
      var key           = Auth.currentUser().key;
      channel           = pusher.subscribe('private-' + key);
      channel.bind('trigger_test', function(data) {
        scope.trigger.testing = undefined;
        if (data && data.message) {
          var msg = data.message;
          if (msg.success) {
            scope.trigger.run_count++;
            scope.trigger.test = gettextCatalog.getString('Yay, it worked. The trigger completed successfully!');
          } else {
            // scope.trigger.fail_count++;
            // scope.trigger.total_fail_count++;
            scope.trigger.test = gettextCatalog.getString('Oh no, the trigger failed. Please check the logs');
          }
        }
      });
    }

    $rootScope.$on('$routeChangeStart', function (event, next, current) {
      if (channel) {
        channel.unbind();
      }
    });

    var logs = function() {
      window.location.href = '/#/locations/' + scope.location.slug + '/triggers/' + scope.trigger.id + '/trigger_history';
    };

    var edit = function() {
      window.location.href = '/#/locations/' + scope.location.slug + '/triggers/' + scope.trigger.id + '/edit';
    };

    scope.back = function() {
      window.location.href = '/#/locations/' + scope.location.slug + '/triggers';
    };

    scope.init();
    subAlerts();

  };

  return {
    link: link,
    scope: {
      loading: '='
    },
    templateUrl: 'components/locations/triggers/_show.html'
  };

}]);

app.directive('editTrigger', ['Trigger', '$q', '$routeParams', '$rootScope', '$http', '$location', function (Trigger, $q, $routeParams, $rootScope, $http, $location) {

  var link = function(scope,element,attrs) {

    scope.location = { slug: $routeParams.id };

    scope.init = function() {
      Trigger.get({location_id: scope.location.slug, id: scope.trigger.id}).$promise.then(function(results) {
        scope.trigger = results;
        scope.loading = undefined;
      }, function(err) {
        scope.errors = err;
      });
    };

    scope.init();
  };

  return {
    link: link,
    scope: {
      loading: '='
    },
    templateUrl: 'components/locations/triggers/_new.html'
  };

}]);

app.directive('channelTypes', [function() {
  var link = function(scope, element, attrs) {
    attrs.$observe('ver', function(start) {
      if (start !== '') {
        scope.getPanel = function() {
          return 'components/locations/triggers/channel-' + attrs.ver + '.html';
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
          return 'components/locations/triggers/show-' + attrs.ver + '.html';
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
        templateUrl: 'components/locations/triggers/_vars.html',
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
    templateUrl: 'components/locations/triggers/_webhook_variables.html',
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
    templateUrl: 'components/locations/triggers/history/_index.html'
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

        var results = JSON.stringify(res,null,2);
        var json  = window.hljs.highlight('json',results).value;

        // CANT TRANSLATE YET
        var template =
          '<md-toolbar class="md-table-toolbar md-default">'+
          '<div class="md-toolbar-tools">'+
          '<md-button id="main" class="md-icon-button md-primary" ng-click="back()" aria-label="Settings">'+
          '<md-icon md-font-icon="arrow_back" >arrow_back</md-icon>'+
          '</md-button>'+
          '<p>Trigger Logs</p>'+
          '</div>'+
          '<md-divider></md-divider>'+
          '</md-toolbar>'+
          '<md-content class="md-padding" layout="column" layout-gt-sm=\'row\' layout-align="center center">'+
          '<md-card>'+
          '<md-card-title>'+
          '<md-card-title-text>'+
          '<span class="md-headline">'+
          'Details'+
          '</span>'+
          '</md-card-title-text>'+
          '<md-card-title-media>'+
          '<img src="https://d3e9l1phmgx8f2.cloudfront.net/images/integration-images/slack.png" class="integrations-icon-show">'+
          '</md-card-title-media>'+
          '</md-card-title>'+
          '<md-card-content><pre>'+
          json +
          '</pre></md-card-content>'+
          '</md-card>'+
          '</md-content>';

        var templateObj = $compile(template)(scope);
        element.html(templateObj);

        // scope.history   = results;
        scope.loading   = undefined;
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
    }
  };

}]);
