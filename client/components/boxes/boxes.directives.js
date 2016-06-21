'use strict';

var app = angular.module('myApp.boxes.directives', []);

app.directive('showBox', ['Box', '$routeParams', 'Auth', '$pusher', '$location', '$mdBottomSheet', 'Zone', 'ZoneListing', '$cookies', 'showToast', 'showErrors', '$mdDialog', '$q', 'ClientDetails', '$timeout', '$rootScope', 'Report', 'menu', function(Box, $routeParams, Auth, $pusher, $location, $mdBottomSheet, Zone, ZoneListing, $cookies, showToast, showErrors, $mdDialog, $q, ClientDetails, $timeout, $rootScope, Report, menu) {

  var link = function(scope,attrs,element,controller) {

    var prefs = {};
    var zoneAlert;
    var timeout;
    scope.streamingUpdates = true;

    scope.zone     = ZoneListing;
    scope.staff    = Auth.currentUser().pss;
    scope.location = { slug: $routeParams.id };
    scope.period   = $routeParams.period || '6h';

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
        case 'Edit':
          editBox();
          break;
        case 'Reboot':
          scope.rebootBox();
          break;
        case 'Transfer':
          scope.transferBox();
          break;
        case 'Payloads':
          scope.payloads();
          break;
        case 'Resync':
          scope.resyncBox();
          break;
        case 'Changelog':
          viewHistory();
          break;
        case 'Reset':
          scope.resetBox();
          break;
        case 'Delete':
          scope.deleteBox();
          break;
      }
    };

    var createMenu = function() {
      scope.menu = [];

      scope.menu.push({
        name: 'Edit',
        icon: 'settings'
      });

      if (scope.box.is_polkaspots) {

        scope.menu.push({
          name: 'Reboot',
          icon: 'autorenew',
          disabled: !scope.box.allowed_job
        });

        scope.menu.push({
          name: 'Payloads',
          icon: 'present_to_all',
        });

        scope.menu.push({
          name: 'Changelog',
          icon: 'history',
        });
        // scope.menu.push({
        //   name: 'Firewall',
        //   icon: 'security',
        // });
      }

      scope.menu.push({
        name: 'Transfer',
        icon: 'transform',
      });

      scope.menu.push({
        name: 'Delete',
        icon: 'delete_forever'
      });

      if (scope.box.is_polkaspots) {
        scope.menu.push({
          name: 'Resync',
          icon: 'settings_backup_restore',
          disabled: !scope.box.allowed_job
        });

        scope.menu.push({
          name: 'Reset',
          // icon: 'undo',
          icon: 'clear',
        });
      }

    };

    var notInZone = function(results) {
      scope.not_in_zone = ((results._info && results._info.total > 0)  && (results.zones && results.zones.length === 0));
      return scope.not_in_zone;
    };

    function ZoneAlertCtrl($scope, $mdBottomSheet, prefs) {
      $scope.add = function() {
        $mdBottomSheet.hide();
        $location.path('/locations/' + scope.location.slug + '/zones').search({ap_mac: scope.box.calledstationid, box_id: scope.box.id});
      };
      $scope.cancel = function() {
        prefs();
        $mdBottomSheet.hide();
      };
    }
    ZoneAlertCtrl.$inject = ['$scope','$mdBottomSheet','prefs'];

    var showResetConfirm = function() {
      $mdBottomSheet.show({
        template:
          '<md-bottom-sheet class="md-list md-has-header" ng-cloak>'+
          '<md-subheader>Action Required. This box has been manually reset. Please confirm this action. Or click cancel to ignore.</md-subheader>'+
          '<md-button ng-click="cancel()" class="md-list-item-content">'+
          '<span class="md-inline-list-icon-label">Cancel</span>'+
          '</md-button>'+
          '<md-button ng-click="reset()" md-autofocus="true" class="md-list-item-content md-accent" >'+
          '<span class="md-inline-list-icon-label">CONFIRM</span>'+
          '</md-button>'+
          '</md-bottom-sheet>',
        controller: Ctrl
      });
    };

    function Ctrl($scope) {
      $scope.reset = function() {
        $mdBottomSheet.hide();
        resetBox();
      };
    }

    Ctrl.$inject = ['$scope'];

    var showZoneAlert = function() {
      $mdBottomSheet.show({
        template:
          '<md-bottom-sheet class="md-list md-has-header" ng-cloak>'+
          '<md-subheader>Action Required. This box is not part of a zone. The box will function but will not broadcast an SSID. Add this box to a zone to complete setup.</md-subheader>'+
          '<md-button ng-click="cancel()" class="md-list-item-content" >'+
          '<span class="md-inline-list-icon-label">Cancel</span>'+
          '</md-button>'+
          '<md-button ng-click="add()" class="md-list-item-content md-accent">'+
          '<span class="md-inline-list-icon-label">Add To Zone</span>'+
          '</md-button>'+
          '</md-bottom-sheet>',
        locals: {
          prefs: scope.setPrefs
        },
        controller: ZoneAlertCtrl
      });
    };

    var editBox = function() {
      window.location.href = '/#/locations/' + scope.location.slug + '/boxes/' + scope.box.slug + '/edit';
    };

    scope.payloads = function() {
      window.location.href = '/#/locations/' + scope.location.slug + '/boxes/' + scope.box.slug + '/payloads';
    };

    scope.resetBox = function(ev) {
      var confirm = $mdDialog.confirm()
      .title('Reset this Device')
      .textContent('Resetting your box is not recommended. If you are having problems with it, please resync first. If the device is offline, it will reset next time it restarts.')
      .ariaLabel('Reset Device')
      .targetEvent(ev)
      .ok('Reset it')
      .cancel('Cancel');
      $mdDialog.show(confirm).then(function() {
        resetBox();
      });
    };

    var resetBox = function() {
      scope.resetting = true;
      Box.reset({id: scope.box.slug}).$promise.then(function(results) {
        showToast('Device reset in progress, please wait.');
        scope.box.allowed_job = false;
        scope.box.state = 'resetting';
        scope.resetting = undefined;
      }, function(errors) {
        var err;
        if (errors && errors.data && errors.data.errors && errors.data.errors.base) {
          err = errors.data.errors.base;
        } else {
          err = 'Could not reset this device, please try again';
        }
        console.log(errors);
        showToast(err);
        scope.box.state = 'failed';
        scope.resetting = undefined;
      });
    };

    scope.resyncBox = function(ev) {
      var confirm = $mdDialog.confirm()
      .title('Resync this Device')
      .textContent('This will force a complete refresh of it\'s configuration files. A resync will disconnect any wireless clients temporarily')
      .ariaLabel('Resync Device')
      .targetEvent(ev)
      .ok('Resync it')
      .cancel('Cancel');
      $mdDialog.show(confirm).then(function() {
        resyncBox();
      });
    };

    var resyncBox = function() {
      scope.box.state = 'processing';
      scope.box.allowed_job = false;
      Box.update({
        location_id: scope.location.slug,
        id: scope.box.slug,
        box: {
          resync: true
        }
      }).$promise.then(function(res) {
        showToast('Device resync in progress. Please wait.');
      }, function(errors) {
        showToast('Failed to resync device, please try again.');
        console.log('Could not resync device:', errors);
        scope.box.state = 'online';
      });
    };

    scope.rebootBox = function(ev) {
      var confirm = $mdDialog.confirm()
      .title('Would you like to reboot this device?')
      .textContent('Rebooting will disconnect your clients.\nA reboot takes about 60 seconds to complete')
      .ariaLabel('Reboot Box')
      .targetEvent(ev)
      .ok('Reboot it')
      .cancel('Cancel');
      $mdDialog.show(confirm).then(function() {
        rebootBox();
      });
    };

    var rebootBox = function() {
      scope.box.state = 'processing';
      scope.box.allowed_job = false;
      Box.reboot({id: scope.box.slug}).$promise.then(function(results) {
        scope.box.state = 'rebooting';
        showToast('Box successfully rebooted.');
      }, function(errors) {
        showToast('Failed to reboot box, please try again.');
        console.log('Could not reboot box:', errors);
        scope.box.state = 'online';
      });
    };

    scope.deleteBox = function(ev) {
      var confirm = $mdDialog.confirm()
      .title('Are you sure you want to delete this device?')
      .textContent('This cannot be reversed, please be careful. Deleting a box is permanent.')
      .ariaLabel('Delete Box')
      .targetEvent(ev)
      .ok('Delete it')
      .cancel('Cancel');
      $mdDialog.show(confirm).then(function() {
        deleteBox();
      });
    };

    var deleteBox = function() {
      Box.destroy({id: scope.box.slug}).$promise.then(function(results) {
        $location.path('/locations/' + scope.location.slug);
        showToast('Box successfully deleted');
      }, function(errors) {
        console.log(errors);
        showToast('Could not delete box');
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
      Box.transfer({id: scope.box.slug, transfer_to: id}).$promise.then(function(results) {
        scope.back();
        showToast('Box transfer was a success.');
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
        var val = scope.box.ignored ? 'muted' : 'unmuted';
        showToast('Box successfully ' + val + '.');
      }, function(errors) {
      });
    };

    scope.back = function() {
      window.location.href = '/#/locations/' + scope.location.slug;
    };

    var j = 0;
    var counter = 0;

    var channel;
    function loadPusher(key) {
      if (scope.pusherLoaded === undefined && typeof client !== 'undefined') {
        scope.pusherLoaded = true;
        var pusher = $pusher(client);
        channel = pusher.subscribe(key);
        channel.bind('general', function(data) {
          console.log('Message recvd.', data);
          init();
        });
      }
    }

    var processAlertMessages = function() {
      if (scope.box.is_polkaspots) {
        if (scope.box.reset_confirmation) {
          showResetConfirm();
        } else if ( zoneAlert ) {
          showZoneAlert();
        }
      }
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

      timeout = $timeout(function() {
        // loadTput(); // not unless we want to adjust dynamically
        loadCharts();
      }, 500);
    };

    scope.refresh = function() {
      scope.period = '6h';
      updatePage();
    };

    scope.streamingUpdater = function() {
      if (scope.streamingUpdates) {
        loadPusher(scope.box.sockets_hash);
        showToast('Streaming updates enabled');
      } else {
        if (channel) {
          channel.unbind();
        }
        showToast('Streaming updates disabled');
      }
    };

    scope.isOpen = function(section) {
      return menu.isSectionSelected(section);
    };

    scope.toggle = function(section) {
      menu.toggleSelectSection(section);
    };

    var init = function() {
      var deferred = $q.defer();
      Box.get({id: $routeParams.box_id, metadata: true}).$promise.then(function(box) {
        scope.box = box;
        ClientDetails.client = { location_id: box.location_id, ap_mac: box.calledstationid };
        createMenu();
        sortSsids();
        loadPusher(box.sockets_hash);
        scope.loading = undefined;
        deferred.resolve(box);

      }, function() {
        deferred.reject();
      });
      return deferred.promise;
    };

    var getZones = function() {
      var deferred = $q.defer();
      Zone.get({location_id: scope.location.slug, box_id: scope.box.slug}).$promise.then(function(results) {
        scope.zone.zones    = results.zones;
        scope._info         = results._info;
        if (notInZone(results) && !ignoreZone) {
          zoneAlert = true;
        }
        deferred.resolve(results);
      }, function(error) {
        deferred.reject(error);
      });
      return deferred.promise;
    };

    var loadCharts = function() {
      controller.$scope.$broadcast('loadClientChart', 'device');
    };

    var loadTput = function() {
      var deferred = $q.defer();
      Report.clientstats({
        type:         'tput',
        ap_mac:       scope.box.calledstationid,
        location_id:  scope.box.location_id,
        resource:     'device',
        interval:     '60s',
        period:       '60m' // $routeParams.period,
      }).$promise.then(function(data) {
        scope.box.throughput = data.throughput;
        deferred.resolve(data);
      }, function() {
        deferred.reject();
      });
      return deferred.promise;
    };

    var sortSsids = function() {
      if (scope.box.metadata && scope.box.metadata.ssids && scope.box.metadata.ssids.length > 0) {
        if (scope.box.metadata.ssids.length === 1) {
          scope.box.ssids = scope.box.metadata.ssids[0];
        } else {
          var ssids = scope.box.metadata.ssids;
          if (ssids.length > 2) {
            var temp = ssids.slice(0,2).join(', ');
            scope.box.all_ssids = scope.box.metadata.ssids.join(', ');
            scope.box.ssids = temp + ' and ' + (ssids.length - 2) + ' more.';
          } else {
            scope.box.ssids = ssids.slice(0,2).join(' & ');
          }
        }
      } else {
        scope.box.ssids = 'N/A';
      }
    };

    var viewHistory = function() {
      window.location.href = '/#/locations/' + scope.location.slug + '/boxes/' + scope.box.slug + '/versions';
    };

    init().then(function() {
      loadTput();
      getZones().then(function() {
        loadCharts(); // seems to need to wait for something....
        processAlertMessages();
      });
    });

    $rootScope.$on('$routeChangeStart', function (event, next, current) {
      if (channel) {
        channel.unbind();
      }
      $timeout.cancel(timeout);
    });


  };

  return {
    link: link,
    require: '^clientChart',
    templateUrl: 'components/boxes/show/_index.html'
  };

}]);

app.directive('boxPayloads', ['Box', 'Payload', 'showToast', 'showErrors', '$routeParams', '$pusher', '$mdDialog', function(Box, Payload, showToast, showErrors, $routeParams, $pusher, $mdDialog) {

  var link = function(scope,element,attrs) {

    scope.location = { slug: $routeParams.id };
    scope.command = { save: true };

    var init = function() {
      return Box.get({id: $routeParams.box_id}).$promise.then(function(box) {
        scope.box = box;
        scope.loading = undefined;
        loadPayloads();
      }, function(err) {
        scope.loading = undefined;
        console.log(err);
      });
    };

    scope.deletePayload = function(index,id) {
      Payload.destroy({box_id: scope.box.slug, id: id}).$promise.then(function() {
        scope.payloads.splice(index, 1);
        showToast('Payload deleted successfully');
      }, function(errors) {
        showToast('Could not delete the payload.');
      });
    };

    scope.showPayload = function(index,ev) {
      $mdDialog.show({
        template:
        '<md-dialog aria-label="Payload Output" ng-cloak>'+
        '<md-toolbar>'+
        '<div class="md-toolbar-tools">'+
        '<h2>Command Output</h2>'+
        '<span flex></span>'+
        '</div>'+
        '</md-toolbar>'+
        '<md-dialog-content>'+
        '<div class="md-dialog-content">'+
        '<div flex-xs flex="100" ng-hide="prefs.now">'+
        '<pre>{{ command.body }}</pre>'+
        '</div>'+
        '</div>'+
        '</md-dialog-content>'+
        '<md-dialog-actions layout="row">'+
        '<span flex></span>'+
        '<md-button ng-click="cancel()">'+
        'CLOSE'+
        '</md-button>'+
        '</md-dialog-actions>'+
        '</md-dialog>',
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
      Payload.query({controller: 'boxes', box_id: scope.box.slug}, function(data) {
        scope.payloads = data;
        loadPusher(scope.box.sockets_hash);
      });
    };

    var channel;
    function loadPusher(key) {
      if (scope.pusherLoaded === undefined && typeof client !== 'undefined') {
        scope.pusherLoaded = true;
        var pusher = $pusher(client);
        channel = pusher.subscribe(key);
        channel.bind('general', function(data) {
          scope.command.success = undefined;
          showToast('Payload completed!')
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

app.directive('splashOnly', ['Box', 'showToast', 'showErrors', function(Box, showToast, showErrors) {

  var link = function(scope,element,attrs) {

    scope.machine_types = [{ key: 'Cisco Meraki MR-12', value: 'meraki-mr-12'}, {key: 'Cisco Meraki MR-16', value: 'meraki-mr-16'}, {key:'Cisco Meraki MR-18',value: 'meraki-mr-18'}, {key: 'Cisco Meraki MR-24', value: 'meraki-mr-24'}, {key: 'Cisco Meraki MR-34', value: 'meraki-mr-34'}, {key: 'Cisco Meraki MR-62', value: 'meraki-mr-62'}, {key: 'Cisco Meraki MR-66', value: 'meraki-mr-66'}, {key: 'Aruba', value: 'aruba'}, {key: 'Aerohive', value: 'aerohive'}, {key: 'Ruckus', value: 'ruckus'}, {key: 'Xirrus', value: 'xirrus'}, {key: 'Mikrotik', value: 'mikrotik' }];

    scope.$watch('box',function(nv){
      if (nv !== undefined) {
        scope.box.tony = scope.box.is_polkaspots;
      }
    });

    scope.update = function(form) {
      form.$setPristine();
      scope.box.is_polkaspots = scope.box.tony;
      return Box.update({
        id: scope.box.slug,
        box: scope.box
      }).$promise.then(function(box) {
        showToast('Settings updated successfully');
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

app.directive('editBox', ['Box', '$routeParams', 'showToast', 'showErrors', 'moment', function(Box, $routeParams, showToast, showErrors, moment) {

  var link = function(scope) {

    scope.location = { slug: $routeParams.id };
    scope.timezones = moment.tz.names();

    var ht20_channels  = ['auto', '01','02','03','04','05','06','07','08','09','10','11'];
    var ht40m_channels = ['auto','05','06','07','08','09','10','11'];
    var ht40p_channels = ['auto','01','02','03','04','05','06','07'];

    var ht20_channels_5 = ['auto','36','40','44','48','52','56','60','64','149','153','157','161','165'];
    var ht40m_channels_5 = ['auto','40','44','48','52','56','60','64','153','157','161','165'];
    var ht40p_channels_5 = ['auto','36','40','44','48','52','56','60','153','157','161','165'];

    var vht20_channels_5 = ['auto','36','40','44','48'];
    var vht40_channels_5 = ['auto','40','44','48'];
    var vht80_channels_5 = ['auto','36','40','44','48'];
    var vht160_channels_5 = ['auto','36','40','44','48'];

    scope.protos = [{ key: 'DHCP', value: 'dhcp'}, { key: 'Static', value: 'static'}];

    scope.ht_modes = [{key: 'HT20', value: 'HT20' }, { key: 'HT40-', value: 'HT40-'}, {key: 'HT40+', value: 'HT40+'}];
    var htModes = function() {
      if (scope.box.is_ac) {
        scope.ht_modes_5 = [
          {key: 'VHT20', value: 'VHT20' },
          {key: 'VHT40', value: 'VHT40'},
          {key: 'VHT80', value: 'VHT80'},
          {key: 'VHT160', value: 'VHT160'}
        ];
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
      } else if (scope.box.ht_mode_5 === 'VHT1600') {
        scope.channels5 = vht160_channels_5;
      }
    };

    scope.update = function(form) {
      form.$setPristine();
      scope.box.is_polkaspots = scope.box.tony;
      return Box.update({
        id: scope.box.slug,
        box: scope.box
      }).$promise.then(function(box) {
        showToast('Settings updated successfully');
      }, function(errors) {
        form.$setPristine();
        showErrors(errors);
      });
    };

    var init = function() {
      return Box.get({id: $routeParams.box_id}).$promise.then(function(box) {
        scope.box = box;
        scope.box.location_slug = scope.location.slug;
        htModes();
        scope.updateChannels();
        scope.box.tx_power_2 = parseInt(scope.box.tx_power_2,0);
        scope.box.tx_power_5 = parseInt(scope.box.tx_power_5,0);
        scope.box.tony       = scope.box.is_polkaspots;
        scope.loading = undefined;
      });
    };

    scope.back = function() {
      window.location.href = '/#/locations/' + scope.location.slug + '/boxes/' + scope.box.slug;
    };

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

app.directive('boxIntStats', ['Box', 'Report', '$routeParams', '$location', '$q', function(Box, Report, $routeParams, $location, $q) {

  var link = function( scope, element, attrs ) {

    scope.chart = {};
    scope.chart.interval = $routeParams.interval || 'quarter';
    scope.chart.distance = $routeParams.distance || '24hr';

    // scope.gran = 'quarter'

    attrs.$observe('apMac', function(val){
      if (val !== '' && !scope.chart.length ) {
        scope.dualband = (attrs.dualband === 'true');
        fetchData();
      }
    });

    var interfaceChart = function(ap_mac) {
      Report.signal({dual: scope.dualband, location_id: attrs.lid, interval: scope.chart.interval, distance: scope.chart.distance, ap_mac: ap_mac}).$promise.then(function(data) {
        scope.chart = data.stats;
        scope.interface2 = data.stats['24'];
        scope.interface5 = data.stats['5'];

        if (scope.interface2 === null) {
          scope.interface2 = [];
          scope.interface2.push({key: new Date().getTime() / 1000, noise: 0, signal: 0, snr: 0});
        }

        if (scope.interface5 === null) {
          scope.interface5 = [];
          scope.interface5.push({key: new Date().getTime() / 1000, noise: 0, signal: 0, snr: 0});
        }

        scope.keys = JSON.stringify(['signal', 'noise']);
      });
    };

    var qualityChart = function(ap_mac) {
      Report.quality({dual: scope.dualband, location_id: attrs.lid, interval: scope.chart.interval, distance: scope.chart.distance, ap_mac: ap_mac}).$promise.then(function(data) {
        scope.quality24 = data.stats['24'];
        scope.quality5 = data.stats['5'];
        scope.quality_keys = JSON.stringify(['quality', 'quality_max']);

        if (scope.quality24 === null) {
          scope.quality24 = [];
          scope.quality24.push({key: new Date().getTime() / 1000, noise: 0, signal: 0, snr: 0});
        }

        if (scope.quality5 === null) {
          scope.quality5 = [];
          scope.quality5.push({key: new Date().getTime() / 1000, noise: 0, signal: 0, snr: 0});
        }
      });
    };

    var bitrateChart = function(ap_mac) {
      Report.bitrate({dual: scope.dualband, location_id: attrs.lid, interval: scope.chart.interval, distance: scope.chart.distance, ap_mac: ap_mac}).$promise.then(function(data) {

        scope.bitrate24 = data.stats['24'];
        scope.bitrate5 = data.stats['5'];

        if (scope.bitrate24 === null) {
          scope.bitrate24 = [];
          scope.bitrate24.push({key: new Date().getTime() / 1000, noise: 0, signal: 0, snr: 0});
        }

        if (scope.bitrate5 === null) {
          scope.bitrate5 = [];
          scope.bitrate5.push({key: new Date().getTime() / 1000, noise: 0, signal: 0, snr: 0});
        }
      });
    };

    function fetchData() {
      var cbs = $q.all([interfaceChart(attrs.apMac), qualityChart(attrs.apMac), bitrateChart(attrs.apMac)]);
    }

  };

  return {
    link: link,
    restrict: 'E',
    scope: {
      ap_mac: '@',
      lid: '@',
      distance: '@',
      dualband: '@',
      chart: '='
    },
    template:
      '<div>'+
      '<div class="row">'+
      '<div class="small-12 columns" ng-class="dualband ? \'medium-6\' : \'\'">'+
      '<p>2.4Ghz Avg. Signal (SNR)</p>'+
      '<interfaces-chart key="snr" data="{{interface2}}" align="left" snr="16" start="{{ chart.start_date }}" interval="{{ chart.interval }}" renderto="interface2" ></interfaces-chart>' +
      '</div>'+
      '<div class="small-12 medium-6 columns" ng-if=\'dualband\'>'+
      '<p>5Ghz Avg. Signal (SNR)</p>'+
      '<interfaces-chart renderto="interface5" key="snr" data="{{interface5}}" align="left" snr="16" start="{{ chart.start_date }}" interval="{{ chart.interval }}" ></interfaces-chart>' +
      '</div>'+
      '</div>'+

      '<div class="row interface_charts">'+
      '<div class="small-12 columns" ng-class="dualband ? \'medium-6\' : \'\'">'+
      '<p>2.4Ghz Signal & Noise</p>'+
      '<interfaces-chart reversed="true" renderto="snr2" keys="{{ keys }}" data="{{interface2}}" legend="true" align="left" start="{{ chart.start_date }}" interval="{{ chart.interval }}" ></interfaces-chart>' +
      '</div>' +
      '<div class="small-12 medium-6 columns" ng-if=\'dualband\'>'+
      '<p>5Ghz Signal & Noise</p>'+
      '<interfaces-chart reversed="true" keys="{{ keys }}" data="{{interface5}}" legend="true" align="left" start="{{ chart.start_date }}" renderto="snr5"></interfaces-chart>' +
      '</div>' +
      '</div>' +

      '<div class="row interface_charts">'+
      '<div class="small-12 columns" ng-class="dualband ? \'medium-6\' : \'\'">'+
      '<p>2.4Ghz Bitrate</p>'+
      '<interfaces-chart key="bit_rate" data="{{bitrate24}}" align="left" renderto="bitrate2" ></interfaces-chart>' +
      '</div>'+
      '<div class="small-12 medium-6 columns" ng-if=\'dualband\'>'+
      '<p>5Ghz Bitrate</p>'+
      '<interfaces-chart key="bit_rate" data="{{bitrate5}}" align="left" renderto="bitrate5" ></interfaces-chart>' +
      '</div>'+
      '</div>'+

      '<div class="row interface_charts">'+
      '<div class="small-12 columns" ng-class="dualband ? \'medium-6\' : \'\'">'+
      '<p>2.4Ghz Quality</p>'+
      '<interfaces-chart renderto="quality2" keys="{{ quality_keys }}" data="{{quality24}}" legend="true" align="left" start="{{ chart.start_date }}" interval="{{ chart.interval }}" ></interfaces-chart>' +
      '</div>'+
      '<div class="small-12 medium-6 columns" ng-if=\'dualband\'>'+
      '<p>5Ghz Quality</p>'+
      '<interfaces-chart renderto="quality5" keys="{{ quality_keys }}" data="{{quality5}}" legend="true" align="left" start="{{ chart.start_date }}" interval="{{ chart.interval }}" ></interfaces-chart>' +
      '</div>'+
      '</div>'+
      '</div>'
  };
}]);

// Untested //

app.directive('interfaceButtons', ['$routeParams', '$location', function($routeParams, $location) {

  var link = function(scope)  {

    scope.formData = {};
    var a = [];

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

app.directive('upgradeBox', ['Payload', '$routeParams', '$pusher', '$rootScope', '$mdDialog', 'showToast', 'Upgrade', function(Payload, $routeParams, $pusher, $rootScope, $mdDialog, showToast, Upgrade) {

  var link = function( scope, element, attrs ) {

    var ps;

    var upgrade = function(prefs) {
      scope.box.state               = 'processing';
      scope.box.upgrade_scheduled   = true;
      if (scope.box) {
        scope.box.cancelled             = undefined;
      }
      Payload.create(
        {
          payload: {
            scheduled: prefs.scheduled,
            box_ids: scope.box.slug,
            version: prefs.version,
            upgrade: true
          }
        }
      ).$promise.then(function() {
        if (prefs.version) {
          scope.box.next_firmware = prefs.version;
        }
        loadPusher(scope.box.sockets_hash);
        showToast('Your upgrade has been scheduled.');
      }, function(err) {
        scope.box.state               = 'online';
        scope.box.upgrade_scheduled   = undefined;
        var e;
        if (err && err.data && err.data.message) {
          e = err.data.message;
        } else {
          e = 'Could not schedule upgrade, try again.';
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
        template:
        '<md-dialog aria-label="Upgrade Device" ng-cloak>'+
        '<form>'+
        '<md-toolbar>'+
        '<div class="md-toolbar-tools">'+
        '<h2>Upgrade Your Device</h2>'+
        '</div>'+
        '</md-toolbar>'+
        '<md-dialog-content>'+
        '<div class="md-dialog-content">'+
        '<h2>Firmware Upgrade</h2>'+
        '<p>Upgrade your firmware to the latest version. Firmware upgrades include security updates and new features.</p>'+
        '<div flex-xs flex="50" ng-if="ps">'+
        '<md-input-container>'+
        '<label>Enter a Version</label>'+
        '<input ng-model="prefs.version" placeholder="B_160201_01">'+
        '</md-input-container>'+
        '</div>'+
        '<div flex-xs flex="50">'+
        '<md-checkbox ng-model="prefs.now" aria-label="Upgrade Now">'+
        'Upgrade Now'+
        '</md-checkbox>'+
        '</div>'+
        '<div flex-xs flex="100" ng-hide="prefs.now">'+
        '<h4>Upgrade at 2am localtime on the following date</h4>'+
        '<md-datepicker ng-model="myDate" md-placeholder="Enter date" md-min-date="minDate" md-max-date="maxDate"></md-datepicker>'+
        '</div>'+
        '</div>'+
        '</md-dialog-content>'+
        '<md-dialog-actions layout="row">'+
        '<span flex></span>'+
        '<md-button ng-click="cancel()">'+
        'Cancel'+
        '</md-button>'+
        '<md-button ng-click="runUpgrade()" style="margin-right:20px;">'+
        'upgrade <span ng-if="upgrade.now">now</span>'+
        '</md-button>'+
        '</md-dialog-actions>'+
        '</form>'+
        '</md-dialog>',
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
      .title('Are you sure you want to cancel?')
      .textContent('If the upgrade has begun, you cannot stop it. Please wait until it completes.')
      .ariaLabel('Cancel Upgrade')
      .targetEvent(ev)
      .ok('please cancel it')
      .cancel('exit');
      $mdDialog.show(confirm).then(function() {
        cancelUpgrade();
      });
    };

    var cancelUpgrade = function() {
      Upgrade.destroy({box_id: scope.box.slug}).$promise.then(function(result) {
        scope.box.state = 'online';
        scope.box.upgrade_scheduled = undefined;
        showToast('Upgrade cancelled successfully.');
      }, function(err) {
        showToast(err);
      });
    };

    var channel, pusherLoaded;
    var loadPusher = function(key) {

      if (pusherLoaded === undefined && typeof client !== 'undefined') {
        pusherLoaded = true;
        var pusher = $pusher(client);
        channel = pusher.subscribe(key);
        channel.bind('box_upgrade', function(data) {
          var msg;
          try{
            msg = JSON.parse(data.message);
          } catch(e) {
            msg = data.message;
          }
          if (msg.status) {
            scope.box.upgrade_scheduled = undefined;
            scope.box.state = 'upgrading';
            scope.box.allowed_job = false;
            channel.unbind();
          }
          showToast('Box upgrading. Do not unplug or restart your device.');
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
      ps: '@'
    },
    template:
      '<span ng-if="box.next_firmware && box.allowed_job">'+
      '<md-button id="main" class="md-icon-button md-warn" ng-click="runUpgrade()" aria-label="Settings" >'+
      '<md-icon>system_update_alt</md-icon>'+
      '<md-tooltip md-direction="left">An upgrade is available for this device</md-tooltip>'+
      '</md-button>'+
      '</span>'
  };
}]);

app.directive('speedtestChart', ['Report', '$routeParams', function(Report, $routeParams) {

  var link = function( scope, element, attrs ) {

    scope.chart = {};

    attrs.$observe('apMac', function(val){
      if (val !== '' && !scope.chart.length ) {
        scope.renderto = attrs.renderto;
        speedtestChart(attrs.apMac);
      }
    });

    var speedtestChart = function(ap_mac) {
      scope.chart.interval = $routeParams.interval || 'day';
      scope.chart.distance = $routeParams.distance || '7';
      scope.chart.loading = true;
      Report.speedtests({interval: scope.chart.interval, distance: scope.chart.distance, ap_mac: ap_mac}).$promise.then(function(data) {
        scope.chart = data;
      });
    };
  };

  return {
    link: link,
    scope: {
      ap_mac: '@',
      location_id: '@',
      interval: '@',
      distance: '@',
      chart: '=',
      renderto: '@'
    },
    template:
      '<div class=\'interface_charts\'><p>Speedtests</p><line-chart data="{{chart.stats.series}}" legend="true" align="left" start="{{ chart.stats.start_date }}" interval="{{chart.interval}}" renderto="{{ renderto }}" height="250px" ></line-chart>'
  };
}]);

app.directive('heartbeatChart', ['Box', 'Heartbeat', '$routeParams', '$compile', function(Box, Heartbeat, $routeParams, $compile) {

  var link = function( scope, element, attrs ) {

    scope.loading = true;
    scope.heartbeats = {};

    attrs.$observe('slug', function(val){
      if (val !== '') {
        getHeartbeats(attrs.slug);
      }
    });

    var getHeartbeats = function(slug) {

      scope.heartbeats.interval = $routeParams.interval || 'day';
      scope.heartbeats.distance = $routeParams.distance || '30';

      Heartbeat.query({box_id: slug, interval: scope.heartbeats.interval, distance: scope.heartbeats.distance}).$promise.then(function(results) {
        if (results.heartbeats !== null) {
          var length = Object.keys(results.heartbeats).length;
          if ( length >= 5) {
            scope.heartbeats = results.heartbeats;
            formatData(results.heartbeats);
          }
        }
      });

    };

    var array = [], online_series = [], offline_series = [];
    var startonline, startoffline, endonline, endoffline, currentstate, i;

    var formatData = function(data) {

      var template = '<span ng-if=\'loading\'>Loading heartbeats <i class="fa fa-cog fa-spin"></i></span><div ng-hide="loading" id=\'heartbeats\' style=\'width: 100%!important; height: 90px!important;\'></div>';
      var templateObj = $compile(template)(scope);
      element.html(templateObj);

      var start, enddate, interval = 60, times = [];

      angular.forEach(data, function(v,k) {
        times.push(parseInt(k));
      });

      start = times[0];
      scope.start_date = start;
      enddate = times[times.length - 1];

      for (i=start; i <= enddate; i += interval) {
        array.push(i);
      }

      createChart(data, array);

    };


    var createChart = function(data, array) {

      for (var i = 0; i < array.length; ++i) {

        var val = data[array[i]];

        if ( currentstate === undefined ) {
          setStartState(val,array[i]);
        }

        if (val === 1 || val === 0) {
          if ( parseInt(val) !== parseInt(currentstate)) {
            pushData(val, array[i]);
          }
        }

        if ( i === array.length - 1) {
          var factor = (new Date().getTime() / 1000);
          finishSeries(currentstate, factor);
        }

      }
      scope.data = { online: online_series, offline: offline_series } ;

      loadChart(scope.data);
      scope.loading = undefined;
    };

    var setStartState = function(val, time) {
      currentstate = val;
      if (val === 1) {
        startonline = time * 1000;
      } else {
        startoffline = time * 1000;
      }
    };

    var pushData = function(val, factor) {
      if ( val === 1 ) {
        updateOffline(factor);
      } else {
        updateOnline(factor);
      }
      currentstate = currentstate === 1 ? 0 : 1;
    };

    var finishSeries = function(val, factor) {
      if ( val === 1 ) {
        updateOnline(factor);
      } else {
        updateOffline(factor);
      }
    };

    var updateOnline = function(factor) {
      endonline = factor * 1000;
      startoffline = factor * 1000;
      online_series.push({x: 0, low: startonline, high: endonline});
    };

    var updateOffline = function(factor) {
      endoffline = factor * 1000;
      startonline = factor * 1000;
      offline_series.push({x: 0, low: startoffline, high: endoffline});
    };

    var loadChart = function(data) {

      var options = {

        chart: {
          type: 'columnrange',
          zoomType: 'y',
          inverted: true,
          renderTo: 'heartbeats',
          backgroundColor: 'transparent',
          spacingLeft: -5,
          spacingRight: -5,
          marginBottom: 50,
        },
        title: {
          text: ''
        },
        xAxis: {
          lineColor: 'transparent',
          labels: {
            enabled: false
          }
        },
        credits: {
          enabled: false
        },
        yAxis: {
          type: 'datetime',
          title: {
            text: ''
          },
          startOnTick: true,
          gridLineColor: 'transparent',
          labels: {
            style: {
              font: 'normal 9px \'open-sans\',\'Helvetica Neue\',sans-serif; font-weight: normal; text-transform: titlecase',
            },
          }

        },
        plotOptions: {
          columnrange: {
            grouping: false,
          },
          series: {
            borderWidth: '0',
            pointWidth: '200',
            animation: false,
            pointPadding: 0,
            groupPadding: 0
          },
        },

        legend: {
          enabled: false
        },
        tooltip: {
          formatter:function(){
            var x = (this.point.high - this.point.low);
            var distance = millisecondsToStr(x);
            var text =
              '<b>' + this.series.name + '</b><br>From: ' + Highcharts.dateFormat('%A, %b %e, %Y at %H:%M', this.point.low) +
              '<br>Until: ' + Highcharts.dateFormat('%A, %b %e, %Y at %H:%M', this.point.high) +
              '<br>Duration: ' + distance;
            return text;
          },
          crosshairs: {
            dashStyle: 'dot'
          }
        },

        series: [{
          name: 'Online',
          data: data.online,
          color: '#64ab35'
        },
        {
          name: 'Offline',
          data: data.offline,
          color: '#e82d10'
        }

        ]

      };

      var chart = new Highcharts.Chart(options);

    };

    var millisecondsToStr = function(ms) {

      function numberEnding (number) {
        return (number > 1) ? 's' : '';
      }

      var temp = Math.floor(ms / 1000);

      var days = Math.floor((temp %= 31536000) / 86400);
      if (days) {
        return days + ' day' + numberEnding(days);
      }
      var hours = Math.floor((temp %= 86400) / 3600);
      if (hours) {
        return hours + ' hour' + numberEnding(hours);
      }
      var minutes = Math.floor((temp %= 3600) / 60);
      if (minutes) {
        return minutes + ' minute' + numberEnding(minutes);
      }
      var seconds = temp % 60;
      if (seconds) {
        return seconds + ' second' + numberEnding(seconds);
      }
      return 'less than a second';
    };

  };

  return {
    link: link,
    replace: true
  };

}]);

app.directive('downloadFirmware', ['$routeParams', '$location', 'Box', 'Firmware', '$cookies', 'menu', function($routeParams, $location, Box, Firmware, $cookies, menu) {

  var link = function( scope, element, attrs ) {

    scope.firmwares = [];
    menu.isOpen = false;
    menu.hideBurger = true;
    menu.sectionName = 'Downloads';

    var init = function() {
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
    template:
      '<div>'+
      '<p>Download the firmware for your devices. You can read about installing the firmwares in the <ct-docs name=\'firmware\' alt="documentation">documentation<ct-docs>.</p>'+
      '<div flex flex-gt-sm="30" layout="column">'+
      '<md-input-container>'+
      '<label>Choose a firmware version</label>'+
      '<md-select iiing-if=\'firmwares.length\' ng-model="firmware">'+
      '<md-option ng-repeat="f in firmwares" value="{{f.url}}">'+
      '{{f.type}}'+
      '</md-option>'+
      '</md-select>'+
      '</md-input-container>'+
      '</div>'+
      '<md-button ng-click="download()" class="md-raised" ng-disabled="!firmware" aria-label="download firmware">Download</md-button>'+
      '</div>'
  };

}]);

app.directive('addBoxWizard', ['Box', '$routeParams', '$location', '$pusher', 'Auth', '$timeout', '$rootScope', 'showToast', 'showErrors', '$route', '$q', '$mdEditDialog', 'Zone', function(Box, $routeParams, $location, $pusher, Auth, $timeout, $rootScope, showToast, showErrors, $route, $q, $mdEditDialog, Zone) {

  var link = function( scope, element, attrs, controller ) {

    var timer;
    scope.selected  = [];
    // scope.created   = $routeParams.created;
    scope.temp      = { is_polkaspots: true };
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
          box.is_polkaspots   = true;
          box.zone_id         = scope.temp.zone_id;
          box.description = scope.selected[i].description || 'Automatically discovered' ;
          if (i === scope.selected.length - 1) {
            last = true;
          }
          scope.create(box);
        }
      }
    };

    scope.create = function(box) {
      scope.creating = true;
      var type = $routeParams.type || scope.setup.type;
      Box.save({location_id: scope.location.slug, box: box}).$promise.then(function(data) {

        if (scope.selected.length <= 1) {
          redirect(data.slug);
          showToast('Your device has been added.');
        } else if (last) {
          redirect(data.slug);
          showToast('Your devices have been added.');
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
        // if (results.zones && results.zones.length === 1) {
        //   scope.temp.zone_id = results.zones[0].id;
        // }
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
      window.location.href = '/#/locations/' + scope.location.slug;
    };

    scope.manualBox = function() {
      $location.search({stage: 1, type: 'mac'});
    };

    if (parseInt($routeParams.stage) === 2 && scope.setup.type === 'ct') {
      scope.setup.ct_type = 'rogue';
      scope.setup.detecting = true;
      timer = $timeout(function() {
        fetchDiscovered();
      }, 2000);
    } else if (parseInt($routeParams.stage) === 1 || (scope.setup && scope.setup.stage === 1)) {
      scope.setup.next = true;
    }

    if (scope.setup && scope.setup.stage === 2) {
      subscribeRogues();
    }

    scope.editDescription = function (event, box) {

      var editDialog = {
        modelValue: box.description,
        placeholder: 'Add a comment',
        save: function (input) {
          box.description = input.$modelValue;
        },
        targetEvent: event,
        title: 'Add a comment',
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

app.directive('boxSpeedtestWidget', ['showErrors', 'showToast', 'Speedtest', function(showErrors,showToast,Speedtest) {

  var link = function(scope, element,attrs) {
    scope.runSpeedtest = function() {
      scope.box.speedtest_running = true;
      scope.box.allowed_job = false;
      updateCT();
    };

    var updateCT = function() {
      Speedtest.create({box_id: scope.box.slug}).$promise.then(function(results) {
        showToast('Running speedtest, please wait.');
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
    template:
      '<md-list-item class="md-2-line">'+
      '<div class="md-list-item-text">'+
      '<h3>Speedtest</h3>'+
      '<md-button class=\'md-secondary md-icon-button\' ng-if=\'box.allowed_job && !box.speedtest_running\' ng-click="runSpeedtest()">'+
      '<md-icon>replay</md-icon>'+
      '</md-button>'+
      '<span>'+
      '<p>Last result: <b>{{ box.latest_speedtest.result || 0 }}Mb/s</b> <span ng-if=""box.latest_speedtest.result"> at {{ box.latest_speedtest.timestamp | humanTime }}</span></p>'+
      '</span>'+
      '<span ng-if="box.speedtest_running">'+
      '<md-progress-linear md-mode="query"></md-progress-linear>'+
      '</span>'+
      '</div>' +
      '</md-list-item>'
  };

}]);

app.directive('boxDoctor', ['Payload', function(Payload) {

  var link = function(scope, element,attrs,controller) {

    scope.runCommand = function() {
      scope.checking = true;
      var dr = '8b3dde7e-83c2-4fad-a190-c1792c763409';
      Payload.create({payload: {box_ids: attrs.slug, command_id: dr}}).$promise.then(function() {
      }, function(errors) {
        scope.error = true;
        scope.checking = undefined;
      });
    };

  };

  return {
    link: link,
    scope: {
      checking: '=',
      slug: '@'
    },
    template:
      '<div>'+
      '<p><md-button ng-disabled=\'checking\' class=\'md-raised\' ng-click=\'runCommand()\'>Checkup</md-button></p>'+
      '<span ng-if=\'checking == true\'>'+
      '<md-progress-linear md-mode="query"></md-progress-linear>'+
      '<p>A checkup is underway.</p>'+
      '</span>'+
      '<span ng-if=\'error == true\'>'+
      '<p>There was a problem running the doctor, please try again.</p>'+
      '</span>'+
      '</div>'
  };

}]);

app.directive('boxDoctorWidget', ['$mdDialog', function($mdDialog) {

  var link = function(scope, element,attrs,controller) {

    scope.open = function(ev) {
      $mdDialog.show({
        templateUrl: 'components/boxes/show/_health_modal.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose:true,
        locals: {
          items: scope.selected // not working
        },
        controller: DialogController
      });
    };

    function DialogController($scope, $mdDialog, items) {
      $scope.items = items;
      $scope.close = function() {
        $mdDialog.cancel();
      };
    }
    DialogController.$inject = ['$scope', '$mdDialog', 'items'];

  };

  return {
    link: link,
    scope: {
      box: '='
    },
    template:
      '<div class="box_widget">'+
      '<span ng-if="box.allowed_job == true">'+
      '<box-doctor slug=\'{{box.slug}}\' checking=\'box.checking_health\'></box-doctor>'+
      '</span>'+
      '<p><span ng-if=\'box.healthy == true\'><a href=\'\' ng-click=\'open()\'> This box is healthy</a></span>'+
      '<span ng-if=\'box.healthy == false\' ><b>This box needs a check-up. <a ng-click=\'open()\'>Why?</a></b></span>'+
      '<span ng-if=\'box.healthy != true && box.healthy != false\'>No tests completed yet.</span>'+
      '</p>'+
      '<span ng-show="box.allowed_job == false">'+
      '</span>'+
      '</div>'
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
