'use strict';

var app = angular.module('myApp.boxes.directives', []);

app.directive('showBox', ['Box', '$routeParams', 'Auth', '$pusher', '$location', '$mdBottomSheet', 'Zone', 'ZoneListing', '$cookies', 'showToast', 'showErrors', '$mdDialog', '$q', 'ClientDetails', '$timeout', '$rootScope', 'Report', 'menu', 'gettextCatalog', function(Box, $routeParams, Auth, $pusher, $location, $mdBottomSheet, Zone, ZoneListing, $cookies, showToast, showErrors, $mdDialog, $q, ClientDetails, $timeout, $rootScope, Report, menu, gettextCatalog) {

  var link = function(scope,attrs,element,controller) {

    var prefs = {};
    var timeout;
    var j = 0;
    var counter = 0;

    scope.zone             = ZoneListing;
    scope.location         = { slug: $routeParams.id };
    scope.period           = $routeParams.period || '6h';

    scope.setPrefs = function(a) {
      if (prefs[scope.box.slug] === undefined) {
        prefs[scope.box.slug] = {};
      }
      var expireDate = new Date();
      expireDate.setDate(expireDate.getDate() + 1);
      prefs[scope.box.slug].igz = true;
      $cookies.put('_ctapref', JSON.stringify(prefs), {'expires': expireDate});
    };

    var c = $cookies.get('_ctapref');
    var ignoreZone;
    if ( c !== undefined ) {
      prefs = JSON.parse(c);
      if ( prefs[$routeParams.box_id] ) {
        ignoreZone = prefs[$routeParams.box_id].igz;
      }
    }

    // User Permissions //

    scope.allowed = true;

    scope.menuAction = function(type) {
      switch(type) {
        case 'edit':
          editBox();
          break;
        case 'reboot':
          scope.rebootBox();
          break;
        case 'transfer':
          scope.transferBox();
          break;
        case 'payloads':
          scope.payloads();
          break;
        case 'operations':
          viewOperations();
          break;
        case 'changelog':
          viewHistory();
          break;
        case 'logging':
          logs();
          break;
        case 'reset':
          scope.resetBox();
          break;
        case 'delete':
          scope.deleteBox();
          break;
      }
    };

    var createMenu = function() {
      scope.menu = [];
      scope.menu.push({
        type: 'edit',
        name: gettextCatalog.getString('Edit'),
        icon: 'settings'
      });

      if (scope.box.is_cucumber) {
        scope.menu.push({
          name: gettextCatalog.getString('Reboot'),
          icon: 'autorenew',
          type: 'reboot',
          disabled: !scope.box.allowed_job
        });

        scope.menu.push({
          name: gettextCatalog.getString('Reset'),
          icon: 'clear',
          type: 'reset',
        });

        scope.menu.push({
          type: 'changelog',
          name: gettextCatalog.getString('Changelog'),
          icon: 'history',
        });
      }

      scope.menu.push({
        name: gettextCatalog.getString('Transfer'),
        icon: 'transform',
        type: 'transfer',
      });

      scope.menu.push({
        name: gettextCatalog.getString('Operations'),
        icon: 'access_time',
        type: 'operations',
      });

      if (scope.box.is_cucumber) {
        scope.menu.push({
          name: gettextCatalog.getString('Logs'),
          icon: 'library_books',
          type: 'logging',
        });
      }

      scope.menu.push({
        name: gettextCatalog.getString('Delete'),
        icon: 'delete_forever',
        type: 'delete'
      });
    };

    var logs = function() {
      window.location.href = '/#/locations/' + scope.location.slug + '/logs?ap_mac=' + scope.box.calledstationid;
    };

    var checkZones = function(results) {
      scope.not_in_zone = (results._info && results._info.total > 0);
    };

    // showResetConfirm confirms or cancels a manual reset from a box.
    // Sending true to resetBox will reset.
    // Sending null to resetBox will cancel any actions on box.
    var showResetConfirm = function() {
      $mdBottomSheet.show({
        templateUrl: 'components/boxes/show/_toast_reset_confirm.html',
        controller: ResetCtrl
      });
    };

    function ResetCtrl($scope) {
      $scope.reset = function() {
        $mdBottomSheet.hide();
        resetBox(true);
      };
      $scope.cancel = function() {
        $mdBottomSheet.hide();
        resetBox();
      };
    }
    ResetCtrl.$inject = ['$scope'];

    var showZoneAlert = function() {
      $mdBottomSheet.show({
        templateUrl: 'components/boxes/show/_toast_zone.html',
        locals: {
          prefs: scope.setPrefs
        },
        controller: ZoneAlertCtrl
      });
    };

    var ZoneAlertCtrl = function($scope, $mdBottomSheet, prefs) {
      $scope.add = function() {
        $mdBottomSheet.hide();
        $location.path('/locations/' + scope.location.slug + '/zones').search({ap_mac: scope.box.calledstationid, box_id: scope.box.id});
      };
      $scope.cancel = function() {
        prefs();
        $mdBottomSheet.hide();
      };
    };
    ZoneAlertCtrl.$inject = ['$scope','$mdBottomSheet','prefs'];

    var editBox = function() {
      $location.path('/locations/' + scope.location.slug + '/devices/' + scope.box.slug + '/edit');
    };

    scope.payloads = function() {
      $location.path('/locations/' + scope.location.slug + '/devices/' + scope.box.slug + '/payloads');
    };

    scope.resetBox = function(ev) {
      var confirm = $mdDialog.confirm()
      .title(gettextCatalog.getString('Reset this Device'))
      .textContent(gettextCatalog.getString('Resetting your box is not recommended. If you are having problems with it, please resync first. If the device is offline, it will reset next time it restarts.'))
      .ariaLabel(gettextCatalog.getString('Reset Device'))
      .targetEvent(ev)
      .ok(gettextCatalog.getString('Reset it'))
      .cancel(gettextCatalog.getString('Cancel'));
      $mdDialog.show(confirm).then(function() {
        resetBox(true);
      });
    };

    var resetBox = function(reset) {
      var action = 'reset';
      if (reset === true) {
        scope.resetting = true;
        scope.box.allowed_job = false;
        createMenu();
      } else {
        action = 'cancel';
      }

      Box.update({}, {
        id: scope.box.slug,
        box: { action: action }
      }).$promise.then(function(results) {
        if (action === 'reset') {
          showToast(gettextCatalog.getString('Device reset in progress, please wait.'));
          scope.box.allowed_job = false;
          scope.box.state       = 'new';
          scope.resetting       = undefined;
        }
      }, function(errors) {
        console.log(errors);
        scope.box.state = 'failed';
        scope.resetting = undefined;
        showErrors(errors);
      });
    };

    scope.rebootBox = function(ev) {
      var confirm = $mdDialog.confirm()
      .title(gettextCatalog.getString('Would you like to reboot this device?'))
      .textContent(gettextCatalog.getString('Rebooting will disconnect your clients.\nA reboot takes about 60 seconds to complete'))
      .ariaLabel(gettextCatalog.getString('Reboot Box'))
      .targetEvent(ev)
      .ok(gettextCatalog.getString('Reboot it'))
      .cancel(gettextCatalog.getString('Cancel'));
      $mdDialog.show(confirm).then(function() {
        rebootBox();
      });
    };

    var rebootBox = function() {
      scope.box.state = 'processing';
      scope.box.allowed_job = false;
      Box.update({
        id: scope.box.slug,
        box: { action: 'reboot' }
      }).$promise.then(function(results) {
        scope.box.state = 'rebooting';
        showToast(gettextCatalog.getString('Box successfully rebooted.'));
      }, function(errors) {
        showToast(gettextCatalog.getString('Failed to reboot box, please try again.'));
        console.log('Could not reboot box:', errors);
        scope.box.state = 'online';
      });
    };

    scope.deleteBox = function(ev) {
      var confirm = $mdDialog.confirm()
      .title(gettextCatalog.getString('Are you sure you want to delete this device?'))
      .textContent(gettextCatalog.getString('This cannot be reversed, please be careful. Deleting a box is permanent.'))
      .ariaLabel(gettextCatalog.getString('Delete Box'))
      .targetEvent(ev)
      .ok(gettextCatalog.getString('Delete it'))
      .cancel(gettextCatalog.getString('Cancel'));
      $mdDialog.show(confirm).then(function() {
        deleteBox();
      });
    };

    var deleteBox = function() {
      Box.destroy({id: scope.box.slug}).$promise.then(function(results) {
        $location.path('/locations/' + scope.location.slug);
        showToast(gettextCatalog.getString('Box successfully deleted'));
      }, function(errors) {
        console.log(errors);
        showToast(gettextCatalog.getString('Could not delete box'));
      });
    };

    scope.transferBox = function(ev) {
      $mdDialog.show({
        controller: transferCtrl,
        locals: {
          transfer: transferBox
        },
        templateUrl: 'components/boxes/show/_transfer.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose:true
      });
    };

    function transferCtrl($scope, transfer) {
      $scope.obj = {};
      $scope.cancel = function() {
        $mdDialog.cancel();
      };
      $scope.transfer = function(id) {
        $mdDialog.cancel();
        transfer(id);
      };
    }
    transferCtrl.$inject = ['$scope', 'transfer'];

    var transferBox = function(id) {
      Box.update({
        id: scope.box.slug,
        box: {
          transfer_to: id
        }
      }).$promise.then(function(results) {
        scope.back();
        showToast(gettextCatalog.getString('Box transferred successfully.'));
      }, function(errors) {
        showErrors(errors);
      });
    };

    scope.muteBox = function() {
      scope.box.ignored = !scope.box.ignored;
      Box.update({
        location_id: scope.location.slug,
        id: scope.box.slug,
        box: {
          ignored: scope.box.ignored
        }
      }).$promise.then(function(res) {
        var val = scope.box.ignored ? gettextCatalog.getString('muted') : gettextCatalog.getString('unmuted');
        showToast(gettextCatalog.getString('Box successfully {{val}}.', {val: val}));
      }, function(errors) {
      });
    };

    scope.back = function() {
      window.location.href = '/#/locations/' + scope.location.slug + '/devices';
    };

    var channel;
    function loadPusher(key) {
      if (scope.pusherLoaded === undefined && typeof client !== 'undefined') {
        scope.pusherLoaded = true;
        var pusher = $pusher(client);
        channel = pusher.subscribe('private-' + scope.box.location_pubsub);
        console.log('Binding to:', channel.name);
        channel.bind('boxes_' + scope.box.pubsub_token, function(data) {
          console.log('Message received at', new Date().getTime() / 1000);
          processNotification(data.message);
        });
      }
    }

    var processNotification = function(data) {
      if (data){
        try{
          data = JSON.parse(data);
        }catch(e){
          console.log(e);
        }
      }
      switch(data.type) {
        case 'resync':
          console.log('Device resynced');
          break;
        case 'heartbeat':
          heartbeat(data);
          break;
        case 'speedtest':
          scope.box.speedtest_running = undefined;
          scope.box.allowed_job = true;
          scope.box.latest_speedtest = {
            result: data.message.val,
            timestamp: data.message.timestamp
          };
          break;
        case 'not-connected':
          timeout = $timeout(function() {
            showToast(gettextCatalog.getString('Device lost connection, jobs may fail.'));
            $timeout.cancel(timeout);
          }, 2000);
          break;
        case 'installer':
          if (data.status === true) {
            init();
            showToast(gettextCatalog.getString('Device installed successfully.'));
          } else {
            scope.box.state = 'new';
            showToast(gettextCatalog.getString('Device failed to install, please wait.'));
          }
          break;
        case 'upgrade':
          if (data.status === true) {
            scope.box.state = 'upgrading';
            showToast(gettextCatalog.getString('Upgrade running, please wait while it completes.'));
          } else {
            showToast(gettextCatalog.getString('Upgrade failed to run. Please try again.'));
          }
          break;
        default:
          console.log(data, 'Unknown Event');
      }
    };

    var heartbeat = function(data) {
      scope.box.last_heartbeat = data.last_heartbeat;
      scope.box.state          = data.state;
      scope.box.wan_ip         = data.wan_ip;
      if (scope.box.state === 'offline') {
        scope.box.allowed_job = false;
      } else {
        scope.box.allowed_job = true;
      }
    };

    var processAlertMessages = function() {
      if (scope.box.is_cucumber) {
        if (scope.box.reset_confirmation) {
          showResetConfirm();
        } else if (scope.not_in_zone) {
          showZoneAlert();
        }
      }
    };

    var loadCharts = function() {
      // alert(123)
      $timeout(function() {
        controller.$scope.$broadcast('loadClientChart', 'device');
      },250);
    };

    scope.updatePeriod = function(period) {
      scope.period = period;
      updatePage();
    };

    var updatePage = function(item) {
      var hash            = {};
      hash.interval       = scope.interval;
      hash.period         = scope.period;
      hash.fn             = scope.fn;
      hash.type           = scope.type;
      $location.search(hash);
      loadCharts();
    };

    scope.refresh = function() {
      scope.period = '6h';
      updatePage();
    };

    scope.isOpen = function(section) {
      return menu.isSectionSelected(section);
    };

    scope.toggle = function(section) {
      menu.toggleSelectSection(section);
    };

    var connectionStatus = function() {
      switch (scope.box.connection_status) {
        case '9':
          scope.box.connection_status_formatted = 'OK';
          break;
        case '9.1':
          scope.box.connection_status_formatted = 'NTP failed';
          break;
        case '1':
          scope.box.connection_status_formatted = 'HTTP and DNS check failed';
          break;
        case '4':
          scope.box.connection_status_formatted = 'HTTP check failed';
          break;
        case '0':
          scope.box.connection_status_formatted = 'Communication error';
          break;
        case '6':
          scope.box.connection_status_formatted = 'DNS check failed';
          break;
        default:
          scope.box.connection_status_formatted = 'Misc. Problem (' + scope.box.connection_status + ')';
          break;
      }
    };

    var init = function() {
      var deferred = $q.defer();
      Box.get({id: $routeParams.box_id, metadata: true}).$promise.then(function(box) {
        scope.box = box;
        ClientDetails.client = {
          location_id: box.location_id,
          ap_mac: box.calledstationid,
          version: box.v
        };
        scope.loading = undefined;
        connectionStatus();
        poll();
        deferred.resolve();
      }, function() {
        deferred.reject();
      });
      return deferred.promise;
    };

    var getZones = function() {
      var deferred = $q.defer();
      if (scope.box.zone_id || ignoreZone) {
        var msg = 'Ignoring zid: ' + scope.box.zone_id + '. Ignore: ' + ignoreZone;
        deferred.resolve();
      } else {
        Zone.get({
          location_id: scope.location.slug,
          box_id: scope.box.slug
        }).$promise.then(function(results) {
          scope.not_in_zone = (results.zones.length > 0);
          deferred.resolve();
        }, function(error) {
          deferred.reject(error);
        });
      }
      return deferred.promise;
    };

    controller.$scope.$on('fullScreen', function(val,obj) {
      menu.isOpenLeft = false;
      menu.isOpen = false;
      scope.fs = { panel: obj.panel };
      loadCharts();
    });

    controller.$scope.$on('closeFullScreen', function(val,obj) {
      menu.isOpenLeft = true;
      menu.isOpen = true;
      scope.fs = undefined;
      loadCharts();
    });

    var viewOperations = function() {
      $location.path('/locations/' + scope.location.slug + '/devices/' + scope.box.slug + '/operations');
    };

    var viewHistory = function() {
      $location.path('/locations/' + scope.location.slug + '/boxes/' + scope.box.slug + '/versions');
    };

    // We've remove the pusher notifications since the volume was getting too high
    var poller;
    var poll = function() {
      poller = $timeout(function() {
        console.log('Refreshing device');
        init();
      }, 15000);
    };

    init().then(function() {
      createMenu();
      loadPusher();
      getZones().then(function() {
        processAlertMessages();
      });
    });

    $rootScope.$on('$routeChangeStart', function (event, next, current) {
      if (channel) {
        channel.unbind();
      }
      $mdBottomSheet.hide();
      $timeout.cancel(timeout);
      $timeout.cancel(poller);
      ClientDetails.client.version = undefined;
      ClientDetails.client.ap_mac = undefined;
    });

  };

  return {
    link: link,
    require: '^clientChart',
    scope: {
      loading: '='
    },
    templateUrl: 'components/boxes/show/_index.html'
  };

}]);

app.directive('fetchBox', ['Box', '$routeParams', '$compile', function(Box, $routeParams, $compile) {

  var link = function( scope, element, attrs ) {
    var init = function() {
      return Box.get({id: $routeParams.box_id}).$promise.then(function(box) {
        compileTemplate(box.v);
      }, function(err) {
        scope.loading = undefined;
        console.log(err);
      });
    };

    var compileTemplate = function(version) {
      var template = $compile('<list-messages></list-messages>')(scope);
      element.html(template);
      scope.loading = undefined;
    };

    init();
  };

  return {
    link: link,

  };
}]);

app.directive('boxPayloads', ['Box', 'Payload', 'showToast', 'showErrors', '$routeParams', '$pusher', '$mdDialog', 'gettextCatalog', function(Box, Payload, showToast, showErrors, $routeParams, $pusher, $mdDialog, gettextCatalog) {

  var link = function(scope,element,attrs,controller) {

    scope.command = { save: true };
    scope.location = { slug: $routeParams.id };
    scope.box = { slug: $routeParams.box_id };

    var init = function() {
      loadPayloads();
      loadPusher();
    };

    scope.deletePayload = function(index,id) {
      Payload.destroy({}, {
        location_id: scope.location.slug,
        box_id: scope.box.slug,
        id: id
      }).$promise.then(function() {
        scope.payloads.splice(index, 1);
        showToast(gettextCatalog.getString('Payload deleted successfully'));
      }, function(errors) {
        showToast(gettextCatalog.getString('Could not delete the payload.'));
      });
    };

    scope.showPayload = function(index,ev) {
      $mdDialog.show({
        templateUrl: 'components/boxes/payloads/_show_payload.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose:true,
        controller: Ctrl,
        locals: {
          command: scope.payloads[index]
        }
      });
    };

    function Ctrl ($scope, command) {
      $scope.command = command;
      $scope.cancel = function() {
        $mdDialog.cancel();
      };
    }
    Ctrl.$inject = ['$scope', 'command'];

    var loadPayloads = function() {
      Payload.query({}, {
        location_id: scope.location.slug,
        box_id: scope.box.slug
      }, function(data) {
        scope.payloads = data;
      });
    };

    var channel;
    function loadPusher() {
      if (scope.pusherLoaded === undefined && typeof client !== 'undefined') {
        scope.pusherLoaded = true;
        var pusher = $pusher(client);
        channel = pusher.subscribe('private-' + scope.box.location_pubsub);
        channel.bind('boxes_' + scope.box.pubsub_token, function(data) {
          scope.command.success = undefined;
          showToast(gettextCatalog.getString('Payload completed!'));
          loadPayloads();
        });
      }
    }

    scope.back = function() {
      window.location.href = '/#/locations/' + scope.location.slug + '/boxes/' + scope.box.slug;
    };

    init();

  };

  return {
    link: link,
    scope: {
      loading: '=',
    },
    templateUrl: 'components/boxes/payloads/_index.html'
  };

}]);

app.directive('splashOnly', ['Box', 'showToast', 'showErrors', 'gettextCatalog', function(Box, showToast, showErrors, gettextCatalog) {

  var link = function(scope,element,attrs) {

    scope.machine_types = [{ key: 'Cisco Meraki MR-12', value: 'meraki-mr-12'}, {key: 'Cisco Meraki MR-16', value: 'meraki-mr-16'}, {key:'Cisco Meraki MR-18',value: 'meraki-mr-18'}, {key: 'Cisco Meraki MR-24', value: 'meraki-mr-24'}, {key: 'Cisco Meraki MR-34', value: 'meraki-mr-34'}, {key: 'Cisco Meraki MR-62', value: 'meraki-mr-62'}, {key: 'Cisco Meraki MR-66', value: 'meraki-mr-66'}, {key: 'Aruba', value: 'aruba'}, {key: 'Aerohive', value: 'aerohive'}, {key: 'Ruckus', value: 'ruckus'}, {key: 'Xirrus', value: 'xirrus'}, {key: 'Mikrotik', value: 'mikrotik' }];

    scope.$watch('box',function(nv){
      if (nv !== undefined) {
        scope.box.tony = scope.box.is_cucumber;
      }
    });

    scope.update = function(form) {
      form.$setPristine();
      scope.box.is_cucumber = scope.box.tony;
      return Box.update({
        id: scope.box.slug,
        box: scope.box
      }).$promise.then(function(box) {
        showToast(gettextCatalog.getString('Settings updated successfully'));
      }, function(errors) {
        showErrors(errors);
      });
    };

  };

  return {
    link: link,
    scope: {
      box: '='
    },
    templateUrl: 'components/boxes/show/_non_ps.html'
  };

}]);

app.directive('editBox', ['Box', '$routeParams', '$localStorage', 'showToast', 'showErrors', 'moment', 'gettextCatalog', 'Zone', '$rootScope', '$pusher', '$timeout', '$location', function(Box, $routeParams, $localStorage, showToast, showErrors, moment, gettextCatalog, Zone, $rootScope, $pusher, $timeout, $location) {

  var link = function(scope) {

    var channel, timer;

    scope.location = { slug: $routeParams.id };
    if ($localStorage.user) {
      scope.white_label = $localStorage.user.custom;
    }
    scope.timezones = moment.tz.names();

    var ht20_channels  = ['auto', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'];
    var ht40m_channels  = ['auto','5','6','7','8','9','10','11'];
    var ht40p_channels  = ['auto','1','2','3','4','5','6','7'];

    var ht20_channels_5 = ['auto','36','40','44','48','52','56','60','64','149','153','157','161','165'];
    var ht40m_channels_5 = ['auto','40','44','48','52','56','60','64','153','157','161','165'];
    var ht40p_channels_5 = ['auto','36','40','44','48','52','56','60','153','157','161','165'];

    var vht20_channels_5 = ['auto','36','40','44','48', '52', '56', '60', '64', '100', '104', '108', '112', '116', '120', '124', '128', '132', '140'];
    var vht40_channels_5 = ['auto','40','44','48', '52', '56', '60', '64', '100', '104', '108', '112', '116', '120', '124', '128', '132', '140'];
    var vht80_channels_5 = ['auto','36','40','44','48', '52', '56', '60', '64', '100', '104', '108', '112', '116', '120', '124', '128', '132', '140'];
    var vht160_channels_5 = ['auto','36','40','44','48', '52', '56', '60', '64', '100', '104', '108', '112', '116', '120', '124', '128', '132', '140'];

    scope.protos = [{ key: 'DHCP', value: 'dhcp'}, { key: 'Static', value: 'static'}];

    scope.ht_modes = [{key: 'HT20', value: 'HT20' }, { key: 'HT40-', value: 'HT40-'}, {key: 'HT40+', value: 'HT40+'}];
    var htModes = function() {
      if (scope.box.is_ac) {
        scope.ht_modes_5 = [
          {key: 'VHT20', value: 'VHT20' },
          {key: 'VHT40', value: 'VHT40'},
          {key: 'VHT80', value: 'VHT80'},
          // {key: 'VHT160', value: 'VHT160'}
        ];
        if (scope.box.dual_band && scope.box.ht_mode_5 !== 'VHT20' && scope.box.ht_mode_5 !== 'VHT40' && scope.box.ht_mode_5 !== 'VHT80') {
          scope.box.ht_mode_5 = 'VHT20';
        }
      } else {
        scope.ht_modes_5 = scope.ht_modes;
      }
    };

    scope.updateChannels = function() {
      scope.updateChannelTwo();
      scope.updateChannelFive();
    };

    scope.updateChannelTwo = function() {
      if (scope.box.ht_mode_2 === 'HT20') {
        scope.channels = ht20_channels;
      } else if (scope.box.ht_mode_2 === 'HT40-') {
        scope.channels = ht40m_channels;
      } else if (scope.box.ht_mode_2 === 'HT40+') {
        scope.channels = ht40p_channels;
      }
    };

    scope.updateChannelFive = function() {
      if (scope.box.ht_mode_5 === 'HT20') {
        scope.channels5 = ht20_channels_5;
      } else if (scope.box.ht_mode_5 === 'HT40-') {
        scope.channels5 = ht40m_channels_5;
      } else if (scope.box.ht_mode_5 === 'HT40+') {
        scope.channels5 = ht40p_channels_5;
      } else if (scope.box.ht_mode_5 === 'VHT20') {
        scope.channels5 = vht20_channels_5;
      } else if (scope.box.ht_mode_5 === 'VHT40') {
        scope.channels5 = vht40_channels_5;
      } else if (scope.box.ht_mode_5 === 'VHT80') {
        scope.channels5 = vht80_channels_5;
      }
    };

    function loadPusher(key) {
      if (scope.pusherLoaded === undefined && typeof client !== 'undefined') {
        scope.pusherLoaded = true;
        var pusher = $pusher(client);
        channel = pusher.subscribe('private-' + scope.box.location_pubsub);
        channel.bind('boxes_' + scope.box.pubsub_token, function(data) {
          console.log('Message received at', new Date().getTime() / 1000);
          processNotification(data.message);
        });
      }
    }

    var processNotification = function(msg) {
      timer = $timeout(function() {
        showToast(gettextCatalog.getString('This device is being resynced'));
      }, 5000);
    };

    scope.update = function(form) {
      form.$setPristine();
      scope.box.is_cucumber = scope.box.tony;
      return Box.update({
        id: scope.box.slug,
        box: scope.box
      }).$promise.then(function(box) {
        scope.box.tags = box.tags;
        showToast(gettextCatalog.getString('Settings updated successfully'));
      }, function(errors) {
        form.$setPristine();
        showErrors(errors);
      });
    };

    var getZones = function() {
      Zone.get({location_id: scope.location.slug}).$promise.then(function(results) {
        scope.zones = results.zones;
        // if (results.zones && results.zones.length === 1) {
        //   scope.temp.zone_id = results.zones[0].id;
        // }
      });
    };

    var highlight = function() {
      scope.highlight = $location.hash();
    };

    var init = function() {
      return Box.get({id: $routeParams.box_id}).$promise.then(function(box) {
        scope.box = box;
        scope.box.location_slug = scope.location.slug;
        htModes();
        scope.updateChannels();
        scope.box.tx_power_2 = parseInt(scope.box.tx_power_2,0);
        scope.box.tx_power_5 = parseInt(scope.box.tx_power_5,0);
        scope.box.tony       = scope.box.is_cucumber;
        scope.loading = undefined;
        getZones();
        loadPusher();
        highlight();
      });
    };

    scope.back = function() {
      window.location.href = '/#/locations/' + scope.location.slug + '/boxes/' + scope.box.slug;
    };

    $rootScope.$on('$routeChangeStart', function (event, next, current) {
      if (channel) {
        channel.unbind();
      }
      // $mdBottomSheet.hide();
      $timeout.cancel(timer);
    });

    init();
  };

  return {
    link: link,
    scope: {
      loading: '='
    },
    templateUrl: 'components/boxes/edit/_edit.html'
  };
}]);

app.directive('transferBox', ['Box', '$location', '$routeParams', '$q', 'Location', function(Box, $location, $routeParams, $q, Location) {

  var link = function( scope, element, attrs ) {

    scope.loading = true;

    var init = function() {
      var deferred = $q.defer();
      Location.shortquery({}).$promise.then(function (res) {
        if (res.length > 1) {
          scope.locations = res;
          deferred.resolve();
        }
        scope.loading = undefined;
        deferred.reject();
      }, function() {
        scope.loading = undefined;
        deferred.reject();
      });
    };

    init();

  };

  return {
    link: link,
    scope: {
      box: '='
    },
    templateUrl: 'components/boxes/show/_transfer_select.html',
  };
}]);


app.directive('runPayloads', ['Command', function(Command) {

  var link = function(scope) {

    scope.loading = true;
    scope.command = {};

    function getCommands() {
      Command.query().$promise.then(function(res) {
        scope.commands = res;
        scope.loading = undefined;
      });
    }

    getCommands();
  };

  return {
    scope: {
      command: '='
    },
    link: link,
    templateUrl: 'components/boxes/payloads/_payloads_mass.html',
  };

}]);

app.directive('boxStatus', ['Box', '$routeParams', '$location', '$timeout', '$rootScope', function(Box, $routeParams, $location, $timeout, $rootScope) {

  var link = function( scope, element ) {

    var i = 0;
    var chart;
    scope.status = 0;

    function status () {
      Box.status({id: $routeParams.id}).$promise.then(function(results) {
        scope.status = results.status ? 5 : 0;
        if ( results.status === 1) {
          scope.color = '#43ac6a';
        } else {
          scope.color = '#d92525';
        }
      });

    }

    var series;
    var refreshData = function() {
      // if ( i < 120 ) {
      // scope.timeout = $timeout(function() {
      //   scope.time = new Date().getTime() / 1000;
      //   refreshChart();
      //   i++;
      // }, 1000);
      // } else {
      //   $timeout.cancel(scope.timeout);
      // }
    };

    var refreshChart = function() {
      status();
      series = chart.series[0];
      var x = (new Date()).getTime(), y = scope.status;
      var shift = series.data.length > 20;
      series.addPoint([x, y], true, shift);
      refreshData();
    };

    var loadChart = function() {
      chart = new Highcharts.Chart({
          chart: {
              renderTo: 'live_chart',
              backgroundColor: 'transparent',
              plotBorderWidth: null,
              plotShadow: false,
              margin: [100, 0, 60, 0],
              spacingRight: 0,
              defaultSeriesType: 'spline',
              animation: Highcharts.svg,
              events: {
                  load: refreshData
              }
          },
          credits: {
            enabled: false
          },
          title: {
              text: '',
              enabled: false
          },
          xAxis: {
              type: 'datetime',
              spacingLeft: 10,
              gridLineColor: '#ECECEC',
              gridLineWidth: 1,
              title: {
                  text: null,
              },
              labels: {
                enabled: true,
                style: {
                  fontSize: '9px'
                }
              },
              tickPixelInterval: 150,
              maxZoom: 20 * 1000
          },
          yAxis: {
              // minPadding: 10,
              // maxPadding: 10,
              min: -1,
              minRange: 0.1,
              gridLineColor: '#ECECEC',
              gridLineWidth: 1,
              labels: {
                enabled: false
              },
              title: {
                  text: null,
              }
          },
          tooltip: {
            enabled: false
          },
          legend: {
            enabled: false
          },
          plotOptions: {
            line: {
              marker: {
                enabled: false
              }
            },
            series: {
              fillColor: null,
              fillOpacity: 0.1,
              lineWidth: 1.5,
              marker: {
                enabled: false,
              },
              shadow: false,
              states: {
                hover: {
                  enabled: false
                }
              }
            }
          },
          series: [{
              name: null,
              lineWidth: 5,
              zones: [{
                  value: 0.5,
                  color: '#d92525'
              }, {
                  color: '#43ac6a'
              }],
              data: (function () {
                  var data = [],
                      time = (new Date()).getTime(),
                      i;

                  for (i = -2; i <= 0; i += 1) {
                      data.push({
                          x: time + i * 1000,
                          y: scope.status
                      });
                  }
                  return data;
              }()),
          }]
      });
    };

    status();

    $rootScope.$on('$routeChangeStart', function (event, next, current) {
      $timeout.cancel(scope.timeout);
    });

    $timeout(function() {
      loadChart();
    }, 10);

  };


  return {
    link: link,
    scope: {
      timeout: '=',
      time: '='
    },
    template: '<div id="live"><div id="live_chart"></div></div>'
  };

}]);

app.directive('boxesTemplate', ['Box', '$routeParams', '$location', '$modal', function(Box, $routeParams, $location, $modal) {

  var link = function( scope, element, attrs, controller ) {

    scope.selected = {};

    scope.updatePage = function(page) {
      scope.page = scope._links.current_page;
      locationSearch();
    };

    scope.activatePayload = function() {
      scope.activeBox = true;
    };

    var locationSearch = function() {
      var hash = {};
      hash.machine_type = scope.machine_type;
      hash.firmware_version = scope.firmware;
      hash.state = scope.state;
      hash.q = scope.query;
      hash.page = scope.page;
      hash.environment = scope.environment;
      $location.search(hash);
    };

    scope.selectAll = function() {
      if (scope.boxes.length) {
        if (scope.selectall === true) {
          angular.forEach(scope.boxes, function(v) {
            if (v.allowed_job) {
              scope.selected[v.slug] = true;
            }
          });
        } else {
          scope.selected = {};
        }
      }
    };

  };

  return {
    link: link,
    scope: {
      slug: '@',
      boxes: '=',
      query: '@',
      _links: '=links',
      selected: '='
    },
    templateUrl: 'components/boxes/list/list.html',
  };

}]);

app.directive('boxDataRates', ['$compile', function($compile) {

  var link = function(scope, element, attrs) {

    scope.loading = true;

    scope.two   = [{key: '6Mbps', value: 6000}, {key: '12Mbps', value: 12000}, {key: '18Mbps', value: 18000}, {key: '24Mbps', value: 24000}, {key: '36Mbps', value: 36000}, {key: '48Mbps', value: 48000}, {key: '54Mbps', value: 54000}];

    scope.five   = [{key: '6Mbps', value: 6000}, {key: '12Mbps', value: 12000}, {key: '18Mbps', value: 18000}, {key: '24Mbps', value: 24000}, {key: '36Mbps', value: 36000}, {key: '48Mbps', value: 48000}, {key: '54Mbps', value: 54000}];

    scope.$watch('nas',function(nv){
      if (nv !== undefined && nv.id !== undefined) {
        scope.loading = undefined;
      }
    });

  };

  return {
    link: link,
    scope: {
      nas: '='
    },
    templateUrl: 'components/boxes/edit/_minimum_datarates.html',
  };

}]);

// Untested //

app.directive('interfaceButtons', ['$routeParams', '$location', function($routeParams, $location) {

  var link = function(scope)  {

    scope.formData = {};
    var a = [];
    //fixme: translations
    scope.formData.interval = $routeParams.interval || 'quarter';

    if ( scope.formData.interval === 'quarter' ) {
      a = ['1hr', '6hr', '24hr', '48hr'];
      if (a.indexOf($routeParams.distance) === -1) {
        scope.formData.distance = '24hr';
      } else {
        scope.formData.distance = $routeParams.distance;
      }
    } else if ( scope.formData.interval === 'hour' ) {
      a = ['6hr', '24hr', '1week', '1month'];
      if (a.indexOf($routeParams.distance) === -1) {
        scope.formData.distance = '24hr';
      } else {
        scope.formData.distance = $routeParams.distance;
      }
    } else if ( scope.formData.interval === 'date' ) {
      a = ['7days', '1months', '3months', '6months'];
      if (a.indexOf($routeParams.distance) === -1) {
        scope.formData.distance = '7days';
      } else {
        scope.formData.distance = $routeParams.distance;
      }
    }

    scope.updateDistance = function(dist) {
      updateSearch();
    };

    function updateSearch() {
      $location.search({interval: scope.formData.interval, distance: scope.formData.distance});
    }

  };

  return {
    link: link,
    templateUrl: 'components/boxes/stats/_range_buttons.html'
  };

}]);

app.directive('upgradeBox', ['Payload', '$routeParams', '$pusher', '$rootScope', '$mdDialog', 'showToast', 'Upgrade', 'gettextCatalog', function(Payload, $routeParams, $pusher, $rootScope, $mdDialog, showToast, Upgrade, gettextCatalog) {

  var link = function( scope, element, attrs ) {

    var ps;
    var location = { slug: $routeParams.id };

    var upgrade = function(prefs) {
      scope.box.state               = 'processing';
      scope.box.upgrade_processing  = true;
      if (scope.box) {
        scope.box.cancelled = undefined;
      }
      Payload.create(
        {
          location_id: location.slug,
          box_id: scope.box.slug,
          payload: {
            box_ids:    scope.box.slug,
            scheduled:  prefs.scheduled,
            version:    prefs.version,
            upgrade:    true
          }
        }
      ).$promise.then(function() {
        if (prefs.version) {
          scope.box.next_firmware = prefs.version;
        }
        loadPusher(scope.box.pubsub_token);
        showToast(gettextCatalog.getString('Your upgrade has been scheduled.'));
      }, function(err) {
        scope.box.state               = 'online';
        scope.box.upgrade_processing   = undefined;
        var e;
        if (err && err.data && err.data.message) {
          e = err.data.message;
        } else {
          e = gettextCatalog.getString('Could not schedule upgrade, try again.');
        }
        showToast(e);
      });
    };

    function upgradeCtrl($scope, upgrade, ps) {
      $scope.ps = ps;
      var myDate = new Date();
      $scope.myDate = new Date(
        myDate.getFullYear(),
        myDate.getMonth(),
        myDate.getDate() + 1
      );
      $scope.minDate = new Date(
        $scope.myDate.getFullYear(),
        $scope.myDate.getMonth(),
        $scope.myDate.getDate()
      );
      $scope.maxDate = new Date(
        $scope.myDate.getFullYear(),
        $scope.myDate.getMonth(),
        $scope.myDate.getDate() + 30
      );

      $scope.prefs = { now: true };

      $scope.cancel = function() {
        $mdDialog.cancel();
      };

      $scope.runUpgrade = function() {
        if ($scope.prefs.now === false) {
          var date = new Date($scope.myDate);
          date.setHours(2,0,0,0);
          date = date.getTime() / 1000;
          $scope.prefs.scheduled = date;
        }
        $mdDialog.cancel();
        upgrade($scope.prefs);
      };
    }
    upgradeCtrl.$inject = ['$scope','upgrade','ps'];

    scope.runUpgrade = function(ev) {
      $mdDialog.show({
        templateUrl: 'components/boxes/firmware/_upgrade_firmware_dialog.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose:true,
        controller: upgradeCtrl,
        locals: {
          upgrade: upgrade,
          ps: scope.ps,
        }
      });
    };

    scope.cancel = function(ev) {
      var confirm = $mdDialog.confirm()
      .title(gettextCatalog.getString('Are you sure you want to cancel?'))
      .textContent(gettextCatalog.getString('If the upgrade has begun, you cannot stop it. Please wait until it completes.'))
      .ariaLabel(gettextCatalog.getString('Cancel Upgrade'))
      .targetEvent(ev)
      .ok(gettextCatalog.getString('please cancel it'))
      .cancel(gettextCatalog.getString('exit'));
      $mdDialog.show(confirm).then(function() {
        cancelUpgrade();
      });
    };

    var cancelUpgrade = function() {
      Upgrade.destroy({}, {
        box_id: scope.box.slug
      }).$promise.then(function(result) {
        scope.box.state = 'online';
        scope.box.upgrade_processing = undefined;
        showToast(gettextCatalog.getString('Upgrade cancelled successfully.'));
      }, function(err) {
        showToast(err);
      });
    };

    var channel, pusherLoaded;
    var loadPusher = function(key) {
      if (pusherLoaded === undefined && typeof client !== 'undefined') {
        pusherLoaded = true;
        var pusher = $pusher(client);

        channel = pusher.subscribe('private-' + scope.box.location_pubsub);
        channel.bind('boxes_' + scope.box.pubsub_token, function(data) {
          var msg;
          try{
            msg = JSON.parse(data.message);
          } catch(e) {
            msg = data.message;
          }
          if (msg.status) {
            scope.box.upgrade_processing = undefined;
            scope.box.state = 'upgrading';
            scope.box.allowed_job = false;
            channel.unbind();
          }
          showToast(gettextCatalog.getString('Box upgrading. Do not unplug or restart your device.'));
        });
      }
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
      box: '=',
      prompt: '=',
      ps: '@'
    },
    templateUrl: 'components/boxes/firmware/_upgrade_firmware.html'
  };
}]);

app.directive('downloadFirmware', ['$routeParams', '$location', '$localStorage', 'Box', 'Firmware', 'Auth', '$cookies', 'menu', 'gettextCatalog', function($routeParams, $location, $localStorage, Box, Firmware, Auth, $cookies, menu, gettextCatalog) {

  var link = function( scope, element, attrs ) {

    scope.firmwares = [];
    menu.isOpen = false;
    menu.hideBurger = true;
    menu.sectionName = gettextCatalog.getString('Downloads');

    var init = function() {
      if ($localStorage.user) {
        scope.white_label = $localStorage.user.custom;
      }
      Firmware.query({public: true}).$promise.then(function(res) {
        scope.firmwares   = res;
        scope.loading     = undefined;
      }, function() {
        scope.loading     = undefined;
        scope.errors      = true;
      });
    };

    scope.download = function() {
      window.open(scope.firmware, '_blank');
      scope.firmware = undefined;
    };

    init();

  };

  return {
    link: link,
    scope: {
      next: '='
    },
    templateUrl: 'components/boxes/firmware/_download_firmware.html',
  };

}]);

app.directive('addBoxWizard', ['Box', '$routeParams', '$location', '$pusher', 'Auth', '$timeout', '$rootScope', 'showToast', 'showErrors', '$route', '$q', '$mdEditDialog', 'Zone', 'gettextCatalog', function(Box, $routeParams, $location, $pusher, Auth, $timeout, $rootScope, showToast, showErrors, $route, $q, $mdEditDialog, Zone, gettextCatalog) {

  var link = function( scope, element, attrs, controller ) {

    var timer;
    scope.selected  = [];
    // scope.created   = $routeParams.created;
    scope.temp      = { is_cucumber: true };
    scope.location  = { slug: $routeParams.id };

    scope.setup = {
      stage: parseInt($routeParams.stage) || 1,
      type: $routeParams.type || 'ct',
      // ct_type: $routeParams.ct_type
    };

    scope.table = {
      autoSelect: true,
      boundaryLinks: false,
      largeEditDialog: false,
      pageSelector: false,
      rowSelection: true
    };

    scope.query = {
      order: 'mac',
      limit: 10,
      page: 1
    };

    function fetchDiscovered() {
      Box.detect({location_id: scope.location.slug}).$promise.then(function(data) {
        sortRogues(data);
      }, function(err) {
        scope.setup.detecting = undefined;
        if (scope.setup.stage !== 2) {
          stageThree();
        }
      });
    }

    var stageThree = function() {
      scope.setup.stage = 2;
      var type = scope.setup.type || $routeParams.type;
      $location.search({type: type, stage: scope.setup.stage, ct_type: scope.setup.ct_type});
    };

    function sortRogues(rogues) {
      scope.errors            = undefined;
      scope.data              = rogues;
      scope.existing          = [];
      scope.rogues            = [];
      angular.forEach(rogues, function(r) {
        if (r.existing === true) {
          scope.existing.push(r);
        } else {
          scope.rogues.push(r);
        }
      });
      scope.setup.detecting = undefined;
    }

    var channel;
    var subscribeRogues = function() {
      if (typeof client !== 'undefined' && scope.subscribed === undefined) {
        scope.subscribed  = true;
        var pusher        = $pusher(client);
        var key           = Auth.currentUser().key;
        channel           = pusher.subscribe('private-' + key);
        channel.bind('general', function(data) {
          stageThree();
        });
      }
    };

    scope.retry = function() {
      $route.reload();
    };

    scope.nextStage = function() {
      scope.setup.stage = parseInt(scope.setup.stage) + 1;
      moveStage();
    };

    scope.lastStage = function() {
      scope.setup.stage = parseInt(scope.setup.stage) - 1;
      moveStage();
    };

    var moveStage = function() {
      scope.creating   = undefined;
      var type          = scope.setup.type || $routeParams.type;
      var ct_type       = scope.setup.ct_type || $routeParams.ct_type;
      $location.search({type: type, stage: scope.setup.stage, ct_type: ct_type});
    };

    var last;
    scope.createBoxFromRogues = function() {
      scope.err = undefined;
      for (var i = 0; i < scope.selected.length; ++i) {
        if (scope.err) {
          break;
        } else {
          var box = {};
          box.calledstationid = scope.selected[i].mac;
          box.is_cucumber   = true;
          box.zone_id       = scope.temp.zone_id;
          box.description = scope.selected[i].description || gettextCatalog.getString('Automatically discovered');
          if (i === scope.selected.length - 1) {
            last = true;
          }
          scope.create(box);
        }
      }
    };

    scope.create = function(box, form) {
      if (form !== undefined) {
        form.$setPristine();
      }
      scope.creating = true;
      var type = $routeParams.type || scope.setup.type;
      Box.save({}, {
        location_id: scope.location.slug,
        box: box
      }).$promise.then(function(data) {
        if (scope.selected.length <= 1) {
          redirect(data.slug);
          showToast(gettextCatalog.getString('Your device has been added.'));
        } else if (last) {
          redirect(data.slug);
          showToast(gettextCatalog.getString('Your devices have been added.'));
        }
      }, function(err) {
        if (!scope.err) {
          scope.err = true;
          showErrors(err);
        }
      });
    };

    var getZones = function() {
      Zone.get({location_id: scope.location.slug}).$promise.then(function(results) {
        scope.zones = results.zones;
      });
    };

    var redirect = function(slug) {
      if (scope.selected.length === 0) {
      window.location.href = '/#/locations/' + scope.location.slug + '/boxes/' + slug;
      } else {
        scope.back();
      }
    };

    scope.back = function() {
      window.location.href = '/#/locations/' + scope.location.slug + '/boxes';
    };

    scope.manualBox = function() {
      $location.search({stage: 1, type: 'mac'});
    };

    if (parseInt($routeParams.stage) === 2 && scope.setup.type === 'ct') {
      scope.setup.ct_type = 'rogue';
      scope.setup.detecting = true;
      timer = $timeout(function() {
        fetchDiscovered();
      }, 0);
    } else if (parseInt($routeParams.stage) === 1 || (scope.setup && scope.setup.stage === 1)) {
      scope.setup.next = true;
    }

    if (scope.setup && scope.setup.stage === 2) {
      subscribeRogues();
    }

    scope.editDescription = function (event, box) {

      var editDialog = {
        modelValue: box.description,
        placeholder: gettextCatalog.getString('Add a comment'),
        save: function (input) {
          box.description = input.$modelValue;
        },
        targetEvent: event,
        title: gettextCatalog.getString('Add a comment'),
        validators: {
          'md-maxlength': 30,
          'md-minlength': 5
        }
      };

      var promise;
      promise = $mdEditDialog.small(editDialog);
      promise.then(function (ctrl) {
        var input = ctrl.getInput();
        input.$viewChangeListeners.push(function () {
          input.$setValidity('test', input.$modelValue !== 'test');
        });
      });

    };

    $rootScope.$on('$routeChangeStart', function (event, next, current) {
      $timeout.cancel(timer);
      if (channel) {
        channel.unbind();
      }
    });

    getZones();
  };

  return {
    link: link,
    scope: {},
    templateUrl: 'components/boxes/new/_add.html'
  };

}]);

app.directive('widgetBody', ['$compile', function($compile) {

  var link = function(scope, element, attrs) {
    var newEl = angular.element(scope.item.template);
    element.append(newEl);
    $compile(newEl)(scope);
  };

  return {
    link: link,
    scope: true
  };

}]);

app.directive('deviceMeta', ['Metric', 'showErrors', 'showToast', 'Speedtest', 'gettextCatalog', function(Metric, showErrors, showToast, Speedtest, gettextCatalog) {

  var link = function(scope, element,attrs) {
    var load;

    var loadMeta = function(box) {
      load = true;
      Metric.clientstats({
        type:         'device.meta',
        ap_mac:       box.calledstationid,
        location_id:  box.location_id
      }).$promise.then(function(data) {
        scope.box_data = data;
      });
    };

    scope.$watch('box',function(box){
      if (box !== undefined && !load && box.calledstationid) {
        loadMeta(box);
      }
    });
  };

  return {
    link: link,
    scope: {
      box: '='
    },
    templateUrl: 'components/boxes/payloads/_metadata.html'
  };

}]);

app.directive('boxSpeedtestWidget', ['showErrors', 'showToast', 'Speedtest', 'gettextCatalog', function(showErrors, showToast, Speedtest, gettextCatalog) {

  var link = function(scope, element,attrs) {
    var updateCT = function() {
      Speedtest.create({box_id: scope.box.slug}).$promise.then(function(results) {
        showToast(gettextCatalog.getString('Running speedtest, please wait.'));
      }, function(errors) {
        showErrors(errors);
      });
    };
    scope.runSpeedtest = function() {
      scope.box.speedtest_running = true;
      updateCT();
    };
  };

  return {
    link: link,
    scope: {
      box: '='
    },
    templateUrl: 'components/boxes/payloads/_speedtest_widget.html'
  };

}]);

app.directive('boxUpgradeWidget', ['$compile', function($compile) {

  var link = function(scope, element,attrs) {
  };

  return {
    link: link,
    templateUrl: 'components/boxes/edit/_upgrade.html'
  };

}]);
