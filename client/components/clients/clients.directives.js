'use strict';

var app = angular.module('myApp.clients.directives', []);

app.directive('clients', ['Client', 'Location', 'Report', 'GroupPolicy', '$location', '$routeParams', '$cookies', '$pusher', '$route', '$mdDialog', '$mdBottomSheet', '$q', 'showErrors', 'showToast', '$rootScope', 'gettextCatalog', function(Client, Location, Report, GroupPolicy, $location, $routeParams, $cookies, $pusher, $route, $mdDialog, $mdBottomSheet, $q, showErrors, showToast, $rootScope, gettextCatalog) {

  var link = function( scope, element, attrs, controller ) {

    var interval;
    scope.selected = [];

    scope.options = {
      autoSelect: true,
      boundaryLinks: false,
      largeEditDialog: false,
      pageSelector: false,
      rowSelection: true
    };

    // Updated at should be changed to lastseen
    // However the query takes too long so we're
    // replacing for the short-term
    scope.query = {
      order:      'updated_at',
      limit:      $routeParams.per || 25,
      page:       $routeParams.page || 1,
      options:    [5,10,25,50,100],
    };

    scope.onPaginate = function (page, limit) {
      scope.query.page = page;
      scope.query.limit = limit;
      scope.updatePage();
    };

    scope.toggleSearch    = false; // ?
    scope.type            = $routeParams.type || 'tx';
    scope.ap_mac          = $routeParams.ap_mac;
    scope.client_mac      = $routeParams.client_mac;
    scope.query.filter    = $routeParams.q;
    scope.fn              = $routeParams.fn;
    scope.end             = $routeParams.end;
    scope.client_mac      = $routeParams.client_mac;
    scope.period          = $routeParams.period || '6h';
    scope.policy_id       = $routeParams.policy_id;
    // scope.location        = { slug: $routeParams.id };
    scope.predicate       = $routeParams.predicate;

    var view = function(id) {
      $location.path('/locations/' + scope.location.slug + '/clients/' + id);
    };

    var setInterval = function() {
      switch(scope.period) {
        case '5m':
          interval = '10s';
          break;
        case '30m':
          interval = '1m';
          break;
        case '1d':
          interval = '30m';
          break;
        case '6h':
          interval = '30s';
          break;
        case '7d':
          interval = '1h';
          break;
        case '14d':
          interval = '1h';
          break;
        case '30d':
          interval = '1h';
          break;
        default:
          interval = '60s';
      }
    };

    if ($routeParams.start === undefined) {
      var d = new Date();
      d.setHours(d.getHours()-2);
      scope.start = parseInt(d) / 1000;
    } else {
      scope.start = $routeParams.start;
    }

    // scope.table = {
    //   autoSelect: true,
    //   boundaryLinks: false,
    //   largeEditDialog: false,
    //   pageSelector: false,
    //   rowSelection: true
    // };

    scope.refresh = function() {
      scope.policy_id = undefined;
      scope.query.filter = undefined;
      scope.client_mac = undefined;
      scope.ap_mac = undefined;
      scope.updatePage();
    };

    scope.reset = function() {
      scope.query.filter = undefined;
      scope.client_mac = undefined;
      scope.ap_mac = undefined;
      scope.period = '6h';
      scope.updatePage();
    };

    scope.updateChart = function() {
      scope.client_mac = scope.selected[0].client_mac;
      clientsChart();
    };

    scope.updatePeriod = function(period) {
      scope.period = period;
      scope.updatePage();
    };

    scope.changeType = function(t) {
      scope.type = t;
      clientsChart();
    };

    scope.changeFn = function(fn) {
      scope.fn = fn;
      clientsChart();
    };

    // User permissions //

    var createMenu = function() {
      if (true) { // user permissions
        scope.menu = [];

        scope.menu.push({
          name: gettextCatalog.getString('View'),
          type: 'view',
          icon: 'pageview'
        });

        // Removed short-term while testing
        // scope.clientsMenu.push({
        //   name: gettextCatalog.getString('Disconnect'),
        //   type: 'disconnect',
        //   icon: 'block'
        // });

        // scope.clientsMenu.push({
        //   name: gettextCatalog.getString('Logout'),
        //   type: 'logout',
        //   icon: 'exit_to_app'
        // });

      }
    };

    scope.menuAction = function(type,client) {
      switch(type) {
        case 'view':
          view(client.id);
          break;
        // case 'disconnect':
        //   client.processing = true;
        //   alert('I will disconnect the client');
        //   break;
        // case 'logout':
        //   logout(client);
        //   break;
      }
    };

    scope.menuDisabled = function(type,client) {
      switch(type) {
        case 'disconnect':
          return false;
        case 'logout':
          return !(client.online && client.splash_status === 'pass');
      }
    };

    // var logout = function() {
    //   scope.client.splash_status = 'dnat';
    //   Client.logout({
    //     location_id: scope.location.slug,
    //     box_id: scope.client.slug,
    //     id: scope.client.id
    //   }).$promise.then(function(results) {
    //     showToast(gettextCatalog.getString('Successfully disconnected client.'));
    //   }, function(err) {
    //     scope.client.splash_status = 'pass';
    //     showErrors(err);
    //   });
    // };

    var getParams = function() {
      var params = {};
      params.location_id = scope.location.slug;
      params.page        = scope.query.page;
      params.per         = scope.query.limit;
      params.interval    = interval;
      params.period      = scope.period;
      params.fn          = scope.fn;
      params.predicate   = scope.predicate;
      params.ap_mac      = scope.ap_mac;
      params.type        = scope.type;
      params.policy_id   = scope.policy_id;

      if (scope.presence) {
        params.presence  = true;
      } else {
        params.q          = scope.query.filter;
        params.client_mac = scope.client_mac;
      }
      return params;
    };

    scope.updatePage = function() {
      var hash            = {};
      hash.ap_mac         = scope.ap_mac;
      hash.client_mac     = scope.client_mac;
      hash.policy_id      = scope.policy_id;
      // hash.presence       = scope.presence;
      hash.interval       = scope.interval;
      hash.period         = scope.period;
      hash.page           = scope.query.page;
      hash.fn             = scope.fn;
      hash.type           = scope.type;
      hash.predicate      = scope.predicate;
      hash.direction      = scope.query.direction;
      hash.per            = scope.query.limit;
      $location.search(hash);
      init();
    };

    scope.sort = function(val, reverse) {
      if (scope.query.direction === 'asc') {
        scope.query.direction = 'desc';
      } else {
        scope.query.direction = 'asc';
      }
      scope.predicate = 'updated_at';
      // scope.predicate = val;
      scope.updatePage(val);
    };

    var createColumns = function() {
      scope.columns = {
        device_name: true,
        client_mac: true,
        ssid: true,
        txbps: true,
        rxbps: false,
        expected_throughput: false,
        tx: true,
        txbitrate: false,
        rxbitrate: false,
        snr: true,
        signal: false,
        ip: true,
        lastseen: true,
        capabilities: false,
        manufacturer: false,
        splash_username: false,
        type: true,
      };
      scope.saveCols();
    };

    scope.saveCols = function() {
      $cookies.put('__xc__', JSON.stringify(scope.columns));
    };

    scope.updatePolicy = function(id) {
      scope.policy_id = id;
      scope.ap_mac = undefined;
      scope.updatePage();
    };

    scope.updateAp = function(ap_mac) {
      scope.ap_mac = ap_mac;
      scope.policy_id = undefined;
      scope.updatePage();
    };

    var c = $cookies.get('__xc__');
    if (c === undefined) {
      createColumns();
    } else {
      try {
        scope.columns = JSON.parse(c);
      } catch(e) {
        createColumns();
      }
    }

    var updateClients = function(client) {
      angular.forEach(scope.clients.clients, function(value, key) {
        if (value.id === client.id) {
          var data = scope.clients.clients[key].data;
          client.data = data + parseFloat(client.tx_delta) + parseFloat(client.rx_delta);
          var date = new Date(client.updated_at);
          client.updated_at = date.getTime() / 1000;
          scope.clients.clients[key] = client;
        }
      });
    };

    scope.openColumns = function(ev) {
      $mdDialog.show({
        templateUrl: 'components/locations/clients/_columns_filter.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose:true,
        locals: {
          columns: scope.columns
        },
        controller: colsCtrl
      });
    };

    function colsCtrl ($scope, columns) {
      $scope.columns = columns;
      $scope.saveCols = function() {
        $cookies.put('__xc__', JSON.stringify(scope.columns));
      };
      $scope.close = function() {
        $mdDialog.cancel();
      };
    }
    colsCtrl.$inject = ['$scope', 'columns'];

    var channel, pusherLoaded;
    var loadPusher = function(key) {
      if (pusherLoaded === undefined && typeof client !== 'undefined') {
        pusherLoaded = true;
        var pusher = $pusher(client);
        channel = pusher.subscribe('private-'+key);
        channel.bind('clients_update', function(data) {
          updateClients(data.client);
        });
      }
    };

    var loadPolicies = function() {
      var deferred = $q.defer();
      scope.promise = deferred.promise;
      GroupPolicy.get({location_id: scope.location.slug}).$promise.then(function(results) {
        scope.loading = undefined;
        deferred.resolve(results.group_policies);
      }, function(err) {
        deferred.reject();
      });
      return deferred.promise;
    };

    scope.createClient = function(ev) {
      $mdDialog.show({
        templateUrl: 'components/views/clients/_create.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose:true,
        locals: {
          // columns: scope.columns
        },
        controller: clientsCtrl
      });
    };

    function clientsCtrl ($scope) {
      $scope.client = {};
      $scope.client.policy_ids = [];

      $scope.save = function() {
        $mdDialog.cancel();
        createClient();
      };

      $scope.close = function() {
        $mdDialog.cancel();
      };

      loadPolicies().then(function(results) {
        $scope.group_policies = results;
        $scope.loadingPolicies = undefined;
      });

      var createClient = function() {
        Client.create({
          location_id: scope.location.slug,
          client: $scope.client
        }).$promise.then(function(results) {
          if (!scope.clients) {
            scope.clients = [];
          }
          scope.clients.push(results);
          showToast('Client updated successfully.');
        }, function(err) {
          showErrors(err);
        });
      };
    }
    clientsCtrl.$inject = ['$scope'];

    var init = function() {
      var deferred = $q.defer();
      scope.promise = deferred.promise;
      var params = getParams();
      Client.query(params).$promise.then(function(results) {
        scope.clients = results.clients;
        scope.info    = results.info;
        scope._links  = results._links;
        loadPusher(scope.location.api_token);
        deferred.resolve();
      }, function() {
        scope.loading_table = undefined;
        deferred.reject();
      });
      return deferred.promise;
    };

    var clientsChart = function() {
      scope.noData = undefined;
      scope.loadingChart = true;
      var params = {
        type:         scope.type,
        client_mac:   scope.client_mac,
        fn:           scope.fn,
        location_id:  $routeParams.id,
        interval:     interval,
        distance:     scope.distance,
        ap_mac:       scope.ap_mac,
        period:       scope.period,
        resource:     'client',
      };

      Report.clientstats(params).$promise.then(function(data) {
        scope.loadingChart = undefined;
        if (data.timeline) {
          var obj = {
            data: data.timeline,
            type: scope.type,
            fn: scope.fn
          };
          controller.$scope.$broadcast(
            'clientIndexChart', obj
          );
        } else {
          scope.loading = undefined;
          controller.$scope.$broadcast('clientIndexChart', {});
        }
      }, function() {
        scope.loading = undefined;
        controller.$scope.$broadcast('clientIndexChart', {});
      });
    };

    var groupPolicies = function() {
      var params = {
        location_id: scope.location.slug
      };
      var deferred = $q.defer();
      scope.promise = deferred.promise;
      GroupPolicy.get(params).$promise.then(function(results) {
        scope.group_policies = results.group_policies;
        deferred.resolve();
      });
    };

    setInterval();
    createMenu();

    init().then(clientsChart).then(groupPolicies).then(function() {
      scope.loading = undefined;
    });

    $rootScope.$on('$routeChangeStart', function (event, next, current) {
      if (channel) {
        channel.unbind();
      }
    });

  };

  return {
    link: link,
    scope: {
      location: '=',
      loading: '='
    },
    require: '^clientsIndex',
    templateUrl: 'components/locations/clients/_index.html'
  };

}]);

app.directive('clientsIndex', ['$routeParams', function($routeParams) {

  return {
    scope: {
      location: '@',
      mac: '@'
    },
    controller: function($scope,$element,$attrs) {

      this.$scope = $scope;

    }
  };

}]);

app.directive('clientCols', ['$routeParams', '$cookies', function($routeParams, $cookies) {

  var link = function(scope, element)  {

    scope.saveCols = function() {
      $cookies.put('__xc__', JSON.stringify(scope.columns));
    };

    var controller = element.parent().controller();

    scope.isOpen = function (section) {
      return controller.isOpen(section);
    };
    scope.toggle = function (section) {
      controller.toggleOpen(section);
    };

  };

  return {
    link: link,
    scope: {
      columns: '='
    },
    templateUrl: 'components/locations/clients/_columns.html'
  };

}]);

app.directive('clientsRangeButtons', ['$routeParams', '$location', '$route', 'Auth', function($routeParams, $location, $route, Auth) {

  var link = function(scope)  {

    scope.interval = $routeParams.interval;
    scope.distance = $routeParams.distance;
    scope.ap_mac = $routeParams.ap_mac;

    scope.formData = {};
    var a = [];
    var hours;

    scope.formData.interval = $routeParams.interval || 'min';

    scope.notAllowed = function() {
      return !(Auth.currentUser() && (Auth.currentUser().ps || Auth.currentUser().paid_plan));
    };

    var updatePage = function() {
      var hash            = {};
      // scope.page          = scope._links.current_page;
      hash.ap_mac         = $routeParams.ap_mac;
      hash.client_mac     = $routeParams.client_mac;
      // hash.hg             = scope.hg;
      hash.interval       = scope.formData.interval;
      hash.distance       = scope.formData.distance;
      hash.page           = $routeParams.page;
      hash.start          = scope.start;
      hash.end            = scope.end;
      hash.predicate      = $routeParams.predicate;
      hash.direction      = $routeParams.direction;
      hash.per            = $routeParams.per;
      $location.search(hash);
      // $route.reload();
    };

    //fixme @Toni translations: translate maybe
    scope.intervals = [{key:'1 MIN', value: 'min'}, {key:'60 MINS', value: 'hour'}, {key: '1 DAY', value: 'day'}];

    var updateDistances = function() {
      if (scope.interval === 'hour') {
        scope.distances = [{key: '24 HR', value: 24}, {key: '48 HR', value: 48}, { key: '1 WK', value: 168 }, { key: '1 MO', value: 720}];
      } else if ( scope.interval === 'day' ) {
        scope.distances = [{key: '1 WK', value: 168}, {key: '1 MO', value: 720}, {key: '3 MO', value: 2160}, {key: '6 MO', value: 4320}];
      } else {
        scope.distances = [{key: '2 HR', value: 2}, {key: '6 HR', value: 6}, {key: '24 HR', value: 24}, {key: '48 HR', value: 48}];
      }
    };

    var setDistance = function() {
      scope.start = setHours();
      updatePage();
    };

    var setHours = function() {
      var d = new Date();
      d.setHours(d.getHours()-scope.formData.distance);
      var start = Math.round((d/1000),0);
      return start;
    };

    var init = function() {
      if ( scope.formData.interval === 'min' ) {
        a = ['2', '6', '24', '48'];
        if (scope.distance === undefined) {
          scope.formData.distance = 2;
        } else if (a.indexOf($routeParams.distance) === -1) {
          scope.formData.distance = 2;
          updatePage();
        } else {
          scope.formData.distance = $routeParams.distance;
        }
      } else if ( scope.formData.interval === 'hour' ) {
        a = ['24', '48', '168', '720'];
        if (scope.distance === undefined) {
          scope.formData.distance = 24;
        } else if (a.indexOf($routeParams.distance) === -1) {
          scope.formData.distance = 24;
          updatePage();
        } else {
          scope.formData.distance = $routeParams.distance;
        }
      } else if ( scope.formData.interval === 'day' ) {
        a = ['168', '720', '2160', '4320', '8640'];
        if (scope.distance === undefined) {
          scope.formData.distance = 24*7;
        } else if (a.indexOf($routeParams.distance) === -1) {
          scope.formData.distance = 24*7;
          updatePage();
        } else {
          scope.formData.distance = $routeParams.distance;
        }
      }
      updateDistances();
    };

    scope.updateDistance = function() {
      setDistance();
    };

    scope.updateInterval = function(dist) {
      if ( scope.formData.interval === 'min' ) {
        scope.formData.distance = 2;
      } else if ( scope.formData.interval === 'hour' ) {
        scope.formData.distance = 24;
      } else if ( scope.formData.interval === 'day' ) {
        scope.formData.distance = 24*7;
      }
      scope.updateDistance();
    };

    init();
  };

  return {
    link: link,
    scope: {
      interval: '=',
      updateFn: '&'
    },
    templateUrl: 'components/locations/clients/_range_buttons.html'
  };

}]);

app.directive('clientDetail', ['Client', 'ClientDetails', 'Report', '$routeParams', 'menu', '$pusher', '$rootScope','showToast', 'showErrors', '$mdDialog', '$timeout', '$location', 'gettextCatalog', '$q', 'GroupPolicy', function(Client,ClientDetails,Report,$routeParams,menu,$pusher, $rootScope,showToast,showErrors,$mdDialog, $timeout, $location, gettextCatalog, $q, GroupPolicy) {

  var link = function( scope, element, attrs, controller ) {

    scope.location = { slug: $routeParams.id };
    scope.ap_mac   = $routeParams.ap_mac;
    scope.fn       = $routeParams.fn;
    scope.period   = $routeParams.period || '30m';

    var logout = function() {
      scope.client.splash_status = 'dnat';
      Client.logout({
        location_id: scope.location.slug,
        box_id: scope.client.slug,
        id: scope.client.id
      }).$promise.then(function(results) {
        showToast(gettextCatalog.getString('Successfully disconnected client.'));
      }, function(err) {
        scope.client.splash_status = 'pass';
        showErrors(err);
      });
    };

    scope.updatePage = function() {
      scope.loadingChart  = true;
      var hash            = {};
      hash.ap_mac         = scope.ap_mac;
      hash.interval       = scope.interval;
      hash.period         = scope.period;
      hash.fn             = scope.fn;
      $location.search(hash);
      $timeout(function() {
        scope.reload();
      },50);
      $timeout(function() {
        scope.loadingChart = undefined;
      },2000);
    };

    scope.updatePeriod = function(period) {
      scope.period = period;
      scope.updatePage();
    };

    scope.refresh = function() {
      scope.period = '30m';
      scope.ap_mac = undefined;
      scope.updatePage();
    };

    scope.reload = function() {
      controller.$scope.$broadcast('loadClientChart');
    };

    controller.$scope.$on('fullScreen', function(val,obj) {
      menu.isOpenLeft = false;
      menu.isOpen = false;
      scope.fs = { panel: obj.panel };
      $timeout(function() {
        controller.$scope.$broadcast('loadClientChart');
      },500);
    });

    controller.$scope.$on('closeFullScreen', function(val,obj) {
      menu.isOpenLeft = true;
      menu.isOpen = true;
      scope.fs = undefined;
      $timeout(function() {
        controller.$scope.$broadcast('loadClientChart');
      },500);
    });

    scope.toggle = function(section) {
      menu.toggleSelectSection(section);
    };

    scope.isOpen = function(section) {
      return menu.isSectionSelected(section);
    };

    scope.back = function() {
      window.location.href = '/#/locations/' + scope.location.slug + '/clients';
    };

    var updateClient = function(client) {
      if (client.id === scope.client.id) {
        client.ap_description = scope.client.ap_description;
        var t = (parseFloat(client.txbytes) + parseFloat(client.tx_delta));
        var r = (parseFloat(client.rxbytes) + parseFloat(client.rx_delta));
        var total = client.tx_delta + client.rx_delta + scope.client.data.total;
        var date = new Date(client.updated_at);
        client.updated_at = date.getTime() / 1000;
        client.data = {
          total: total,
          tx: t,
          rx: r
        };
        console.log('Refreshing client data at', new Date().getTime() );
        scope.client = client;
      }
    };

    var channel, pusherLoaded;
    var loadPusher = function(key) {
      if (pusherLoaded === undefined && typeof client !== 'undefined') {
        pusherLoaded = true;
        var pusher = $pusher(client);
        channel = pusher.subscribe('private-'+key);
        channel.bind('clients_update', function(data) {
          updateClient(data.client);
        });
      }
    };

    var loadPolicies = function() {
      var deferred = $q.defer();
      scope.promise = deferred.promise;
      GroupPolicy.get({location_id: scope.location.slug}).$promise.then(function(results) {
        scope.loading = undefined;
        deferred.resolve(results.group_policies);
      }, function(err) {
        deferred.reject();
      });
      return deferred.promise;
    };

    scope.editPolicy = function(ev) {
      $mdDialog.show({
        templateUrl: 'components/views/clients/_policy.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose:true,
        locals: {
          client: scope.client,
        },
        controller: PolicyController
      });
    };

    function PolicyController($scope, $mdDialog, client) {
      $scope.loadingPolicies = true;
      $scope.client = client;
      loadPolicies().then(function(results) {
        $scope.group_policies = results;
        updateSelected();
        $scope.loadingPolicies = undefined;
      });
      $scope.close = function() {
        $mdDialog.cancel();
      };
      $scope.save = function() {
        $mdDialog.cancel();
        updatePolicies();
      };

      var updateSelected = function() {
        $scope.client.policy_ids = [];
        angular.forEach(scope.client.policies, function (value, id) {
          if (value.id !== null) {
            angular.forEach($scope.group_policies, function(val, id) {
              if (val.id === value.id) {
                $scope.client.policy_ids.push(val.id);
              }
            });
          }
        });
      };

      var updatePolicies = function() {
        var params = {
          blacklist: $scope.client.blacklist,
          whitelist: $scope.client.whitelist,
        };
        if ($scope.client.policy_ids.length > 0) {
          params.policy_ids = $scope.client.policy_ids;
        } else {
          params.destroy_policies = true;
        }

        Client.update({
          location_id: scope.location.slug,
          id: scope.client.id,
          client: params
        }).$promise.then(function(results) {
          refreshPolicies();
          showToast('Client updated successfully.');
        }, function(err) {
          showErrors(err);
        });
      };

      var refreshPolicies = function() {
        scope.client.policies = [];
        for (var i = 0, len = $scope.client.policy_ids.length; i < len; i++) {
          for (var j = 0, l = $scope.group_policies.length; j < l; j++) {
            if (parseInt($scope.client.policy_ids[i]) === $scope.group_policies[j].id) {
              scope.client.policies.push($scope.group_policies[j]);
            }
          }
        }
        if ($scope.client.blacklist) {
          scope.client.policies.push({policy_name: scope.client.ssid + ' Blacklist'});
        }
        if ($scope.client.whitelist) {
          scope.client.policies.push({policy_name: scope.client.ssid + ' Splash Whitelist'});
        }
      };
    }
    PolicyController.$inject = ['$scope', '$mdDialog', 'client'];

    scope.editName = function(ev) {
      $mdDialog.show({
        templateUrl: 'components/locations/clients/_device_name.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose:true,
        locals: {
          client: scope.client
        },
        controller: DialogController
      });
    };

    function DialogController($scope, $mdDialog, client) {
      $scope.client = client;
      if ($scope.client.name === undefined || $scope.client.name === '') {
        $scope.client.name = client.device_name;
      }
      $scope.close = function() {
        $mdDialog.cancel();
      };
      $scope.save = function(name) {
        scope.update();
        $mdDialog.cancel();
      };
    }
    DialogController.$inject = ['$scope', '$mdDialog', 'client'];

    scope.clientFilter = function() {
      $mdDialog.show({
        clickOutsideToClose: true,
        templateUrl: 'components/views/clients/_client_filters.html',
        parent: angular.element(document.body),
        controller: FilterController,
        locals: {
          levels: scope.levels,
          networks: scope.networks,
          loadingLevels: scope.loadingLevels
        }
      });
    };

    function FilterController ($scope, levels, networks, loadingLevels) {
      $scope.levels = levels;
      $scope.loadingLevels = loadingLevels;
      $scope.selectLevel = function(level) {
        $scope.errors = undefined;
        getLevels(level);
      };
      $scope.close = function() {
        $mdDialog.cancel();
      };
      $scope.save = function(zone) {
        $mdDialog.cancel();
        // scope.createUpdate($scope.cf);
      };

      var getNetworks = function() {
        $scope.zones = undefined;
        if (!$scope.networks) {
          scope.getNetworks().then(function(networks) {
            $scope.networks = networks;
            $scope.loadingLevels = undefined;
          }, function() {
            $scope.errors = true;
            $scope.loadingLevels = undefined;
          });
        } else {
          $scope.loadingLevels = undefined;
        }
      };

      var getZones = function() {
        $scope.networks = undefined;
        if (!$scope.zones) {
          scope.getZones().then(function(zones) {
            $scope.zones = zones;
            $scope.loadingLevels = undefined;
          }, function() {
            $scope.errors = true;
            $scope.loadingLevels = undefined;
          });
        } else {
          $scope.loadingLevels = undefined;
        }
      };

      var getLevels = function(level) {
        $scope.loadingLevels = true;
        if (level === 'network') {
          getNetworks();
        } else {
          getZones();
        }
      };
    }
    FilterController.$inject = ['$scope', 'levels', 'networks', 'loadingLevels'];

    scope.update = function() {
      scope.client.updating = true;
      var client = {};
      client.name = scope.client.name;
      client.network_id = scope.client.network_id;
      client.zone_id = scope.client.zone_id;
      client.blocked = scope.client.blocked;
      client.description = scope.client.description;
      Client.update({
        location_id: scope.location.slug,
        id: scope.client.id,
        client: client
      }).$promise.then(function(results) {
        showToast('Client updated successfully.');
      }, function(err) {
        showErrors(err);
      });
    };

    var init = function() {
      Client.get({location_id: scope.location.slug, id: $routeParams.client_id}).$promise.then(function(results) {
        ClientDetails.client = { location_id: results.location_id, client_mac: results.client_mac };
        scope.client    = results;
        scope.loading   = undefined;
        loadPusher(results.location_token);
        controller.$scope.$broadcast('loadClientChart');
      });
    };

    $rootScope.$on('$routeChangeStart', function (event, next, current) {
      if (channel) {
        channel.unbind();
      }
    });

    init();

  };

  return {
    link: link,
    scope: {
      loading: '='
    },
    require: '^clientChart',
    templateUrl: 'components/locations/clients/_show.html',
  };
}]);

app.directive('clientsToolbar', ['$routeParams', '$cookies', 'Client', 'showToast', 'showErrors', 'gettextCatalog', function($routeParams, $cookies, Client, showToast, showErrors, gettextCatalog) {

  var link = function(scope, element)  {

    scope.location = { slug: $routeParams.id };

    var init = function() {
      if (true) { // user permissions
        scope.menu = [];
        scope.menu.push({
          name: gettextCatalog.getString('Logout'),
          type: 'logout',
          disabled: !(scope.client.online && scope.client.splash_status === 'pass'),
          icon: 'exit_to_app'
        });
        scope.menu.push({
          name: gettextCatalog.getString('Vouchers'),
          type: 'codes',
          icon: 'receipt'
        });
        scope.menu.push({
          name: gettextCatalog.getString('Sessions'),
          type: 'sessions',
          icon: 'data_usage'
        });
        scope.menu.push({
          name: gettextCatalog.getString('Orders'),
          type: 'orders',
          icon: 'attach_money'
        });
        scope.menu.push({
          name: gettextCatalog.getString('Social'),
          type: 'social',
          disabled: !scope.client.social_id,
          icon: 'people'
        });

        if (false) {
          scope.menu.push({
            name: gettextCatalog.getString('Policies'),
            type: 'policies',
            icon: ''
          });
        }
      }
    };

    scope.action = function(type) {
      switch(type) {
        case 'logout':
          logout();
          break;
        case 'policies':
          policies();
          break;
        case 'social':
          socialRedirect();
          break;
        case 'orders':
          orderRedirect();
          break;
        default:
          redirect(type);
      }
    };

    var orderRedirect = function() {
      window.location.href = '/#/audit/sales?client_id=' + scope.client.id;
    };

    var socialRedirect = function() {
      window.location.href = '/#/locations/' + scope.location.slug + '/clients/' + scope.client.id + '/social/' + scope.client.social_id;
    };

    var redirect = function(type) {
      window.location.href = '/#/locations/' + scope.location.slug + '/clients/' + scope.client.id + '/' + type;
    };

    var policies = function() {
      window.location.href = '/#/locations/' + scope.location.slug + '/policies?client_mac=' + scope.client.client_mac;
    };

    var logout = function() {

      // Not finished //
      // Must test //

      scope.client.processing = true;
      scope.client.splash_status = 'dnat';
      Client.logout({location_id: scope.location.slug, box_id: scope.client.slug, id: scope.client.id}).$promise.then(function(results) {
        showToast(gettextCatalog.getString('The client was logged out'));
      }, function(err) {
        showErrors(err);
        scope.client.splash_status = 'pass';
        scope.client.processing = undefined;
      });
    };

    scope.$watch('client',function(nv){
      if (nv !== undefined) {
        init();
      }
    });


  };

  return {
    link: link,
    scope: {
      client: '='
    },
    templateUrl: 'components/locations/clients/_toolbar.html'
  };

}]);

app.directive('clientVouchers', ['Client', '$routeParams', '$q', 'showToast', 'showErrors', 'gettextCatalog', function(Client, $routeParams, $q, showToast, showErrors, gettextCatalog) {

  var link = function( scope, element, attrs ) {

    scope.location = { slug: $routeParams.id };
    scope.client   = { id: $routeParams.client_id };

    scope.options = {
      autoSelect: false,
      boundaryLinks: false,
      pageSelector: false,
      rowSelection: false
    };

    scope.query = {
      order:      '-date_activated',
      limit:      $routeParams.per || 25,
      page:       $routeParams.page || 1,
      options:    [5,10,25,50,100],
      direction:  $routeParams.direction || 'asc'
    };

    var codesMenu = function() {
      if (true) { // user permissions
        scope.codesMenu = [{
          name: gettextCatalog.getString('Usage'),
          icon: ''
        }];
        scope.codesMenu.push({
          name: gettextCatalog.getString('Details'),
          link: '',
          icon: ''
        });
        scope.codesMenu.push({
          name: gettextCatalog.getString('activate'),
          link: '',
          icon: ''
        });
      }
    };
    codesMenu();

    var getCodes = function() {
      var deferred = $q.defer();
      scope.promise = deferred.promise;
      Client.codes({
        location_id: scope.location.slug,
        id: scope.client.id
      }).$promise.then(function(results) {
        scope.codes       = results.codes;
        scope.loading     = undefined;
        scope.predicate   = 'serial';
        scope._links      = results._links;
        deferred.resolve();
      }, function(err) {
        deferred.reject();
        scope.loading = undefined;
      });
    };

    scope.updateCode = function(code) {
      code.active = !code.active;
      Client.update_code({
        location_id: scope.location.slug,
        client_id: scope.client.id,
        id: code.username,
        code: { active: code.active }
      }).$promise.then(function(results) {
        var text = code.active ? gettextCatalog.getString('activated') : gettextCatalog.getString('disabled');
        showToast(gettextCatalog.getString('Code {{text}} successfully.', {text: text}));
      }, function(err) {
        showErrors(err);
      });
    };

    scope.viewUsage = function(code) {
      window.location.href = '/#/locations/' + scope.location.slug + '/clients/' + scope.client.id + '/codes/' + code.username + '/sessions';
    };

    scope.back = function() {
      window.location.href = '/#/locations/' + scope.location.slug + '/clients/' + scope.client.id;
    };

    getCodes();

  };

  return {
    link: link
  };
}]);

app.directive('clientCode', ['Client', '$routeParams', 'Code', 'showToast', 'showErrors', function(Client, $routeParams, Code, showToast, showErrors) {

  var link = function( scope, element, attrs ) {

    scope.location = { slug: $routeParams.id };
    scope.client   = { id: $routeParams.client_id };
    scope.code     = { username: $routeParams.username };

    var init = function() {
      var params = {
        location_id:  scope.location.slug,
        code_id:      scope.code.username,
      };
      Code.get(params).$promise.then(function(results) {
        scope.results = results;
        scope.loading     = undefined;
      }, function(err) {
        scope.loading = undefined;
      });
    };

    scope.back = function() {
      window.location.href = '/#/locations/' + scope.location.slug + '/clients/' + scope.client.id + '/codes';
    };

    init();
  };

  return {
    link: link,
    templateUrl: 'components/locations/clients/_show_code.html'
  };
}]);
