'use strict';

var app = angular.module('myApp.codes.directives', []);

app.directive('voucherCodes', ['Code', '$routeParams', '$location', 'Client', 'showToast', 'showErrors', 'gettextCatalog', function(Code, $routeParams, $location, Client, showToast, showErrors, gettextCatalog) {

  var link = function(scope) {

    scope.location  = { slug: $routeParams.id };
    scope.activated = $routeParams.activated;
    scope.voucher   = { unique_id: $routeParams.voucher_id };

    scope.options = {
      autoSelect: true,
      boundaryLinks: false,
      largeEditDialog: false,
      pageSelector: true,
      rowSelection: false
    };

    scope.query = {
      filter:     $routeParams.q,
      order:      'serial',
      limit:      $routeParams.per || 25,
      page:       $routeParams.page || 1,
      options:    [5,10,25,50,100],
    };

    scope.onPaginate = function (page, limit) {
      scope.query.page = page;
      scope.query.limit = limit;
      scope.updatePage();
    };

    var createMenu = function() {

      // user permissions //
      scope.allowed = true;

      scope.menuItems = [];

      scope.menuItems.push({
        name: gettextCatalog.getString('Sessions'),
        icon: 'data_usage',
        type: 'sessions'
      });

      scope.menuItems.push({
        name: gettextCatalog.getString('Disable'),
        icon: 'pageview',
        type: 'disable'
      });

    };

    scope.action = function(type,code) {
      switch(type) {
        case 'disable':
          updateCode(code);
          break;
        case 'sessions':
          sessions(code.username);
          break;
      }
    };

    scope.itemName = function(item,code) {
      if (item.type === 'disable' && code.active ) {
        return gettextCatalog.getString('Disable');
      } else if ( item.type === 'disable' && !code.active ) {
        return gettextCatalog.getString('Enable');
      } else {
        return item.name;
      }
    };

    scope.isDisabled = function(type, code) {
      return ( type === 'sessions' && !code.date_activated );
    };

    var updateCode = function(code) {
      code.active = !code.active;
      Client.update_code({
        location_id: scope.location.slug,
        id: code.username,
        code: { active: code.active }
      }).$promise.then(function(results) {
        var text = code.active ? gettextCatalog.getString('activated') : gettextCatalog.getString('disabled');
        showToast(gettextCatalog.getString('Code {{text}} successfully.', {text: text}));
      }, function(err) {
        code.active = !code.active;
        showErrors(err);
      });
    };

    scope.init = function() {
      var params = {
        vouchers:     'vouchers',
        location_id:  scope.location.slug,
        voucher_id:   scope.voucher.unique_id,
        page:         scope.query.page,
        activated:    scope.activated,
        per:          scope.query.limit
      };
      Code.get(params).$promise.then(function(results) {
        scope.codes       = results.codes;
        scope.predicate   = 'serial';
        scope._links      = results._links;
        createMenu();
        scope.loading     = undefined;
      }, function(err) {
        scope.loading = undefined;
      });
    };

    scope.updatePage = function(page) {
      scope.query.page = scope._links.current_page;
      var hash         = {};
      hash.q           = scope.query.filter;
      hash.activated   = scope.activated;
      hash.page        = scope.query.page;
      hash.per         = scope.query.limit;
      $location.search(hash);
      scope.init();
    };

    scope.back = function() {
      window.location.href = '/#/locations/' + scope.location.slug + '/vouchers/' + scope.voucher.unique_id;
    };

    var sessions = function(username) {
      window.location.href = '/#/locations/' + scope.location.slug + '/vouchers/' + scope.voucher.unique_id + '/codes/' + username;
    };

    scope.init();

  };

  return {
    link: link,
    scope: {
      voucher_id: '@',
      loading: '='
    },
    templateUrl: 'components/codes/_index.html'
  };

}]);

app.directive('codesList', ['Code', '$routeParams', '$location', 'Location', function(Code, $routeParams, $location, Location) {

  var link = function(scope,el,attrs,controller) {

    scope.loading       = true;
    scope.page          = $routeParams.page;
    scope.activated     = $routeParams.activated;
    scope.query         = $routeParams.q;
    scope.start         = $routeParams.start;
    scope.end           = $routeParams.end;
    scope.location_id   = $routeParams.location_id;
    scope.location_name = $routeParams.location_name;

    scope.init = function() {
      var params = {q: scope.query, voucher_id: $routeParams.voucher_id, page: scope.page, activated: scope.activated, start: scope.start, end: scope.end, location_id: scope.location_id};
      Code.get(params).$promise.then(function(results) {
        scope.codes       = results.codes;
        scope.predicate   = '-created_at';
        scope._links      = results._links;
        scope._stats      = results._stats;

        scope.start       = scope.start || results._stats.start;
        scope.end         = scope.end   || results._stats.end;

        scope.loading     = undefined;
        scope.searching   = undefined;
      }, function(err) {

        scope.loading = undefined;
      });
    };

    scope.updatePage = function(page) {
      scope.searching = true;
      scope.page      = scope._links.current_page;
      var hash        = {};
      hash.q          = scope.query;
      hash.activated  = scope.activated;
      hash.page       = scope.page;
      hash.start      = scope.start;
      hash.end        = scope.end;
      $location.search(hash);
      scope.init();
    };

    scope.clearQuery = function() {
      scope.query = undefined;
      appendSearch();
    };

    function appendSearch () {
      var hash = $location.search();
      hash.q = undefined;
      $location.search(hash);
      scope.init();
    }

    scope.updateRange = function(msg) {
      scope.start = msg.start;
      scope.end   = msg.end;
      scope.updatePage();
    };

    scope.locationSearch = function(val) {
      return Location.query({q: val, size: 10}).$promise.then(function (res) {
        scope.locations = res.locations;
      });
    };

    scope.selectLocation = function(item) {
      controller.selectLocation(item);
      scope.location_name   = item.location_name;
    };

    scope.clearLocations = function() {
      controller.clearLocations();
    };


    scope.init();

  };

  return {
    link: link,
    require: '^analytics',
    scope: {
    },
    templateUrl: 'components/reports/codes/_index.html'
  };

}]);

app.directive('codesShow', ['Code', '$routeParams', '$location', function(Code, $routeParams, $location) {

  var link = function(scope) {

    scope.loading   = true;

    scope.init = function() {
      Code.query({ id: $routeParams.id }).$promise.then(function(results) {
        scope.code        = results.code;
        scope.rules       = results.rules;
        scope.loading     = undefined;
      }, function(err) {
        scope.loading = undefined;
      });
    };

    scope.init();

  };

  return {
    link: link,
    scope: {
    },
    template:
      '<div class=\'row\'>'+
      '<div class=\'small-12 columns\'>'+
      '<div ng-show=\'loading\'>'+
      'Loading...'+
      '</div>'+
      '<div ng-hide=\'loading\'>'+
      '<h2>Voucher Details</h2>'+
      '<h3><b>Username: {{ code.username }}</b></h3>' +
      '<p>Password: <a href=\'\' ng-click=\'showPassy = !showPassy\' ><span ng-show=\'showPassy\'><b>{{ code.password }}</b></span><span ng-hide=\'showPassy\'>*********</span></a> (click to {{ showPassy ? \'hide\' : \'reveal\'}})</p>'+
      '<ul class=\'no-bullet\'>'+
      '<li>Activated: <span ng-hide=\'code.date_activated\'>Not used</span><span ng-show=\'code.date_activated\'>{{ code.date_activated | humanTime }}</span></li>' +
      '<li>Location: <a href=\'/#/locations/{{ code.location_slug }}\'>{{ code.location_name }}</a></li>'+
      '</ul>'+
      '<p ng-show=\'code.date_activated\'><a href=\'/#/reports/sessions?username={{code.username}}\' class=\'button tiny\'>View History</a></p>'+
      '<p ng-hide=\'code.date_activated\'>No history available.</p>'+
      '<hr>' +
      '<div class=\'row\'>'+
      '<div class=\'small-12 columns\'>'+
      '<div class=\'row\'>'+
      '<div class=\'small-12 medium-4 columns\'>'+
      '<h3>Access Rules</h3>'+
      '<ul class=\'no-bullet\'>'+
      '<li>{{ rules.download_speed }}Kbps <i class="fa fa-arrow-down"></i> {{ rules.upload_speed }}Kbps <i class="fa fa-arrow-up"></i></li>' +
      '<li>Simultaneous Devices: {{ rules.simultaneous_use }}</li>' +
      '<li ng-show=\'rules.access_period\'>Access Period: {{ rules.access_period }} mins</li>' +
      '<li ng-show=\'rules.access_restrict_data\'>Data: {{ rules.access_restrict_data }}Mb</li>' +
      '<li>Show splash after: {{ rules.session_timeout }} mins</li>' +
      '<li>Logout after: {{ rules.idle_timeout }} mins (if idle)</li>' +
      '</ul>'+
      '</div>' +
      '<div class=\'small-12 medium-4 end columns\'>'+
      '<h3>Guest Details</h3>' +
      '<p ng-show=\'code.guest_id\'><a href=\'/#/reports/guests/{{ code.guest_id }}\'>View guest</a></p>' +
      '<p ng-hide=\'code.guest_id\'>Not associated with a guest</p>'+
      '<span ng-show=\'code.order_id\'>'+
      '<h3>Order Details</h3>' +
      '<p><a href=\'/#/reports/orders/{{ code.order_id }}\'>View order</a></p>' +
      '</span>'+
      '<span ng-show=\'code.voucher_slug\'>'+
      '<h3>Voucher Details</h3>' +
      '<p><a href=\'/#/vouchers/{{ code.voucher_slug }}\'>View voucher</a></p>' +
      '</span>'+
      '</div>' +
      '</div>' +
      '<p><a href=\'/#/reports/codes\'>Back to the codes</a></p>'+
      '</div>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '</div>'

  };

}]);

app.directive('clientUsage', ['Client', '$routeParams', 'Session', '$location', '$q', '$mdDialog', 'showErrors', 'gettextCatalog', function(Client, $routeParams, Session, $location, $q, $mdDialog, showErrors, gettextCatalog) {

  var link = function( scope, element, attrs ) {

    scope.location      = { slug: $routeParams.id };
    scope.client        = { id: $routeParams.client_id };
    scope.code          = { username: $routeParams.username };
    scope.voucher       = { unique_id: $routeParams.voucher_id };
    scope.splash_code   = { id: $routeParams.splash_code_id };

    scope.options = {
      autoSelect: true,
      boundaryLinks: false,
      largeEditDialog: false,
      pageSelector: true,
      rowSelection: false
    };

    var start = new Date();
    var end = new Date();

    start = new Date(
      start.getFullYear(),
      start.getMonth(),
      start.getDate() - 30
    );

    start = start.getTime() / 1000;
    end = end.getTime() / 1000;

    scope.query = {
      start:      $routeParams.start || start,
      end:        $routeParams.end || end,
      order:      '-acctstarttime',
      limit:      $routeParams.per || 50,
      page:       $routeParams.page || 1,
      options:    [5,10,25,50,100],
      direction:  $routeParams.direction || 'desc'
    };

    scope.onPaginate = function(page,limit) {
      scope.query.page  = page;
      scope.query.limit = limit;
      updatePage();
    };

    var updatePage = function() {
      var hash            = {};
      hash.ap_mac         = scope.ap_mac;
      hash.client_mac     = scope.client_mac;
      hash.presence       = scope.presence;
      hash.interval       = scope.interval;
      hash.distance       = scope.distance;
      hash.page           = scope.query.page;
      hash.start          = scope.query.start;
      hash.end            = scope.query.end;
      hash.predicate      = scope.predicate;
      hash.direction      = scope.query.direction;
      hash.per            = scope.query.limit;
      $location.search(hash);
      init();
    };

    var init = function() {
      var deferred = $q.defer();
      scope.promise = deferred.promise;
      var params = {
        page: scope.query.page,
        per: scope.query.limit,
        username: $routeParams.username,
        interval: 'day',
        start: scope.query.start,
        end: scope.query.end,
        location_id: scope.location.slug,
        // q: $routeParams.username,
        client_mac: scope.client.client_mac
      };
      Session.query(params).$promise.then(function(results) {
        scope.sessions    = results.sessions;
        scope._stats      = results._stats;
        scope._links      = results._links;
        scope.query.start = results._stats.start;
        scope.query.end   = results._stats.end;
        scope.loading     = undefined;
        deferred.resolve();
      }, function(err) {
        scope.loading = undefined;
        deferred.reject();
        showErrors(err);
      });
    };

    scope.rangeFilter = function(ev) {
      $mdDialog.show({
        templateUrl: 'components/views/templates/_range_filter.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose:true,
        controller: DialogController
      });
    };

    function DialogController($scope) {
      $scope.myDate = new Date();
      $scope.minDate = new Date(
        $scope.myDate.getFullYear(),
        $scope.myDate.getMonth() - 2,
        $scope.myDate.getDate()
      );
      $scope.maxDate = new Date(
        $scope.myDate.getFullYear(),
        $scope.myDate.getMonth(),
        $scope.myDate.getDate()
      );

      $scope.close = function() {
        $mdDialog.cancel();
      };

      $scope.search = function() {
        scope.query.start = new Date($scope.startDate).getTime() / 1000;
        scope.query.end   = new Date($scope.endDate).getTime() / 1000;
        if (scope.query.start >= scope.query.end) {
          $scope.error = gettextCatalog.getString('The start date must be less than the end date');
        } else {
          $mdDialog.cancel();
          scope.query.page = 1;
          scope.query.limit = 50;
          updatePage();
        }
      };
    }
    DialogController.$inject = ['$scope'];

    scope.back = function() {
      if (scope.splash_code.id) {
        window.location.href = '/#/locations/' + scope.location.slug + '/splash_codes/' + scope.splash_code.id;
      } else if (scope.voucher.unique_id) {
        window.location.href = '/#/locations/' + scope.location.slug + '/vouchers/' + scope.voucher.unique_id + '/codes';
      } else if (scope.code.username) {
        window.location.href = '/#/locations/' + scope.location.slug + '/clients/' + scope.client.id + '/codes';
      } else {
        window.location.href = '/#/locations/' + scope.location.slug + '/clients/' + scope.client.id;
      }
    };

    var getClient = function() {
      var deferred = $q.defer();
      Client.get({location_id: scope.location.slug, id: $routeParams.client_id}).$promise.then(function(results) {
        scope.client = results;
        deferred.resolve();
      });
      return deferred.promise;
    };

    getClient().then(init);
  };

  return {
    link: link,
    scope: {
      loading: '=',
      client_mac: '@'
    },
    templateUrl: 'components/codes/_sessions.html'
  };
}]);
