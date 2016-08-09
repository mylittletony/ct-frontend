'use strict';

var app = angular.module('myApp.audits.directives', []);

app.directive('audit', ['Report', '$routeParams', '$location', 'Location', '$q', 'menu', '$cookies', 'gettextCatalog', function(Report, $routeParams,$location,Location, $q, menu, $cookies, gettextCatalog) {

  var link = function( scope, element, attrs ) {

    var tz = window.moment.tz.guess();
    console.log('Setting TZ to', tz);
    window.moment.tz.setDefault(tz);

    if ($cookies.get('_ctm') === 'true') {
      menu.isOpenLeft = false;
      menu.isOpen = false;
    } else {
      menu.isOpen = true;
    }
    menu.hideBurger = false;
    menu.sections = [{}];
    menu.sectionName = gettextCatalog.getString('Audit');
    menu.header = '';

    var isActive = function(path) {
      var split = $location.path().split('/');
      if (split.length >= 3) {
        return ($location.path().split('/')[2] === path);
      } else if (path === 'dashboard') {
        return true;
      }
    };

    // Anyone know how to test the menu service?
    var createMenu = function() {
      menu.header = gettextCatalog.getString('Audit Reports');

      menu.sections.push({
        name: gettextCatalog.getString('Radius'),
        link: '/#/audit/',
        type: 'link',
        icon: 'donut_large',
        active: isActive('dashboard')
      });

      menu.sections.push({
        name: gettextCatalog.getString('Emails'),
        type: 'link',
        link: '/#/audit/emails',
        icon: 'email',
        active: isActive('emails')
      });

      menu.sections.push({
        name: gettextCatalog.getString('Social'),
        type: 'link',
        link: '/#/audit/social',
        icon: 'people',
        active: isActive('social')
      });

      menu.sections.push({
        name: gettextCatalog.getString('Guests'),
        type: 'link',
        link: '/#/audit/guests',
        icon: 'person_pin',
        active: isActive('guests')
      });

      menu.sections.push({
        name: gettextCatalog.getString('Sales'),
        type: 'link',
        link: '/#/audit/sales',
        icon: 'shopping_cart',
        active: isActive('sales')
      });

    };

    createMenu();

  };

  var controller = function($scope) {
    this.locationSearch = function(val) {
      return Location.query({q: val, size: 10}).$promise.then(function (res) {
      });
    };

    this.selectLocation = function(item) {
      $scope.updatePage(item);
    };

    this.get = function(params) {
      params.interval        = $routeParams.interval || gettextCatalog.getString('day');
      params.start           = $routeParams.start;
      params.end             = $routeParams.end;
      params.location_id     = $routeParams.location_id;
      params.location_name   = $routeParams.location_name;

      return $scope.init(params);
    };

    this.clearLocations = function() {
      $scope.updatePage();
    };

    this.updateRange = function(msg) {
      $scope.updatePage(msg);
    };

    this.clearQuery = function() {
      $scope.clearQuery();
    };
  };

  return {
    link: link,
    controller: controller,
    scope: {}
  };

}]);

app.directive('auditSessions', ['Session', '$routeParams', '$location', 'Client', '$q', '$timeout', 'gettextCatalog', function(Session, $routeParams, $location, Client, $q, $timeout, gettextCatalog) {

  var link = function( scope, element, attrs ) {

    scope.loading       = true;
    scope.selected      = [];
    scope.client_mac    = $routeParams.client_mac;
    scope.ap_mac        = $routeParams.ap_mac;
    scope.location_name = $routeParams.location_name;
    scope.username      = $routeParams.username;

    if (scope.location_name) {
      scope.selectedItem  = scope.location_name;
    } else if (scope.ap_mac) {
      scope.selectedItem = scope.ap_mac;
    } else if (scope.client_mac) {
      scope.selectedItem = scope.client_mac;
    } else if (scope.username) {
      scope.selectedItem = scope.username;
    }

    function querySearch (query) {
      var deferred = $q.defer();
      Session.query({q: query, v2: true}).$promise.then(function(results) {
        deferred.resolve(results.results);
      }, function() {
        deferred.reject();
      });
      return deferred.promise;
    }

    function searchTextChange(text) {
    }
    
    var timer;
    function selectedItemChange(item) {
      timer = $timeout(function() {
        var hash = {};
        if (item && item._index) {
          switch(item._index) {
            case 'devices':
              hash.ap_mac = item._key;
              break;
            case 'clients':
              hash.client_mac = item._key;
              break;
            case 'locations':
              hash.location_name = item._key;
              break;
            case 'vouchers':
              hash.username = item._key;
              break;
            default:
              console.log(item._index);
          }
        }
        $location.search(hash);
      }, 250);
    }

    scope.querySearch         = querySearch;
    scope.selectedItemChange  = selectedItemChange;
    scope.searchTextChange    = searchTextChange;

    var rowSelect = true;
    if ($routeParams.q) {
      rowSelect = false;
    }

    scope.options = {
      boundaryLinks: false,
      largeEditDialog: false,
      pageSelector: false,
      rowSelection: rowSelect
    };

    scope.query = {
      order:          '-acctstarttime',
      start:          $routeParams.start,// || start,
      end:            $routeParams.end,// || end,
      filter:         $routeParams.q,
      limit:          $routeParams.per || 25,
      page:           $routeParams.page || 1,
      options:        [5,10,25,50,100],
      direction:      $routeParams.direction || 'desc'
    };

    scope.onPaginate = function (page, limit) {
      scope.query.page = page;
      scope.query.limit = limit;
      search();
    };

    var search = function() {
      var hash        = $location.search();
      hash.q          = scope.query.filter;
      hash.client_mac = scope.client_mac;
      hash.page       = scope.query.page;
      hash.per        = scope.query.limit;
      hash.start      = scope.query.start;
      hash.end        = scope.query.end;
      $location.search(hash);
    };

    scope.filterClient = function() {
      scope.client_mac = scope.selected[0].client_mac;
      search();
    };

    scope.clearFilter = function() {
      $location.search({});
    };

    // Don't like this however it's less annoying than dealing with
    // the conversion from a numeric id to slug in the locs. controller what???

    scope.visitClient = function(session) {
      Client.get({location_id: session.location_id, q: session.client_mac}, function(data) {
        $location.path('/locations/' + data.location_slug + '/clients/' + data.id);
      }, function(){
      });
    };

    var init = function() {
      var deferred = $q.defer();
      var params = {
        page: scope.query.page,
        username: scope.username,
        start: scope.query.start,
        end: scope.query.end,
        location_id: scope.location_id,
        q: scope.query.filter,
        per: scope.query.limit,
        ap_mac: scope.ap_mac,
        location_name: scope.location_name,
        client_mac: scope.client_mac,
      };
      Session.query(params).$promise.then(function(results) {
        scope.sessions    = results.sessions;
        scope._stats      = results._stats;
        scope.predicate   = '-starttime';
        scope._links      = results._links;
        scope.promise     = deferred.promise;
        if ($routeParams.start === undefined) {
          scope.query.start = results._links.start;
          scope.query.end = results._links.end;
        }
        scope.loading     = undefined;
        deferred.resolve();
      }, function(err) {
        scope.loading = undefined;
      });
    };

    init();

  };

  return {
    scope: {
      username: '@',
    },
    link: link,
    require: '^audit',
    templateUrl: 'components/audit/sessions/_index.html'
  };

}]);

app.directive('auditEmails', ['Email', '$routeParams', '$location', 'Client', '$q', '$timeout', 'Location', function(Email, $routeParams, $location, Client, $q, $timeout, Location) {

  var link = function( scope, element, attrs ) {

    var interval        = 'day';
    scope.email         = $routeParams.email;
    scope.location_name = $routeParams.location_name;

    if (scope.email) {
      scope.selectedItem = scope.email;
    } else if (scope.location_name) {
      scope.selectedItem  = scope.location_name;
    }

    scope.options = {
      boundaryLinks: false,
      largeEditDialog: false,
      pageSelector: false,
    };

    scope.query = {
      order:          '-created_at',
      start:          $routeParams.start,
      end:            $routeParams.end,
      filter:         $routeParams.q,
      limit:          $routeParams.per || 25,
      page:           $routeParams.page || 1,
      options:        [5,10,25,50,100],
      direction:      $routeParams.direction || 'desc'
    };

    scope.onPaginate = function (page, limit) {
      scope.query.page = page;
      scope.query.limit = limit;
      search();
    };

    var search = function(key,value) {
      var hash        = $location.search();
      hash.q          = scope.query.filter;
      hash.page       = scope.query.page;
      hash.per        = scope.query.limit;
      hash.start      = scope.query.start;
      hash.end        = scope.query.end;
      hash[key]       = value;
      $location.search(hash);
    };

    function querySearch (query) {
      var deferred = $q.defer();
      Email.get({
        q: query
      }).$promise.then(function(results) {
        deferred.resolve(results.results);
      }, function(err) {
        scope.loading = undefined;
        deferred.reject();
      });
      return deferred.promise;
    }

    function searchTextChange(text) {
    }

    var timer;
    function selectedItemChange(item) {
      timer = $timeout(function() {
        var key, value;
        if (item && item._index) {
          switch(item._index) {
            case 'locations':
              key = 'location_name';
              value = item._key;
              break;
            case 'emails':
              key = 'email';
              value = item._key;
              break;
            default:
              console.log(item._index);
          }
        }
        search(key,value);
      }, 250);
    }

    scope.querySearch         = querySearch;
    scope.selectedItemChange  = selectedItemChange;
    scope.searchTextChange    = searchTextChange;

    scope.visitClient = function(email) {
      Location.get({id: email.location_id}, function(data) {
        $location.path('/locations/' + data.slug + '/clients/' + email.client_id);
      }, function(err){
        console.log(err);
      });
    };

    var init = function() {
      var params = {
        page: scope.query.page,
        per: scope.query.limit,
        location_name: scope.location_name,
        email: scope.email,
        start: scope.query.start,
        end: scope.query.end,
        interval: interval
      };
      Email.get(params).$promise.then(function(results) {
        scope.emails      = results.emails;
        scope.predicate   = '-created_at';
        scope._links      = results._links;
        console.log(results._links);
        if (results.locations.length > 0) {
          scope.location = { id: results.locations[0].id };
        }
        if ($routeParams.start === undefined) {
          scope.query.start = results._links.start;
          scope.query.end = results._links.end;
        }
        scope.loading     = undefined;
      }, function(err) {
        scope.loading = undefined;
      });
    };

    init();

  };

  return {
    scope: {},
    link: link,
    require: '^audit',
    templateUrl: 'components/audit/emails/_index.html'
  };

}]);

app.directive('auditSocial', ['Social', '$routeParams', '$location', 'Client', '$q', '$timeout', '$mdDialog', 'gettextCatalog', function(Social, $routeParams, $location, Client, $q, $timeout, $mdDialog, gettextCatalog) {

  var link = function( scope, element, attrs ) {

    scope.loading   = true;

    scope.email         = $routeParams.email;
    scope.location_name = $routeParams.location_name;

    if (scope.email) {
      scope.selectedItem = scope.email;
    } else if (scope.location_name) {
      scope.selectedItem  = scope.location_name;
    }

    scope.options = {
      boundaryLinks: false,
      largeEditDialog: false,
      pageSelector: false,
    };

    scope.query = {
      order:          '-created_at',
      start:          $routeParams.start,// || start,
      end:            $routeParams.end,// || end,
      filter:         $routeParams.q,
      limit:          $routeParams.per || 25,
      page:           $routeParams.page || 1,
      options:        [5,10,25,50,100],
      direction:      $routeParams.direction || 'desc'
    };

    scope.onPaginate = function (page, limit) {
      scope.query.page = page;
      scope.query.limit = limit;
      search();
    };

    var search = function() {
      var hash        = $location.search();
      hash.q          = scope.query.filter;
      hash.page       = scope.query.page;
      hash.per        = scope.query.limit;
      $location.search(hash);
    };

    function querySearch (query) {
      var deferred = $q.defer();
      Social.get({
        q: query,
        v2: true // -------------------> remove when old-tony gone
      }).$promise.then(function(results) {
        deferred.resolve(results.results);
      }, function(err) {
        scope.loading = undefined;
        deferred.reject();
      });
      return deferred.promise;
    }

    function searchTextChange(text) {
    }

    var timer;
    function selectedItemChange(item) {
      timer = $timeout(function() {
        var hash = {};
        if (item && item._index) {
          switch(item._index) {
            case 'locations':
              hash.location_name = item._key;
              break;
            case 'socials':
              hash.email = item._key;
              break;
            default:
              console.log(item._index);
          }
        }
        $location.search(hash);
      }, 250);
    }

    scope.querySearch         = querySearch;
    scope.selectedItemChange  = selectedItemChange;
    scope.searchTextChange    = searchTextChange;

    var init = function() {
      Social.query({
        id: $routeParams.id,
        page: scope.query.page,
        per: scope.query.limit,
        email: scope.email,
        location_name: scope.location_name
      }).$promise.then(function(results) {
        scope.socials    = results.social;
        scope._links     = results._links;
        scope.loading    = undefined;
      }, function(err) {
        scope.loading = undefined;
      });
    };

    scope.update = function() {
      scope.social.state = 'updating';
      Social.update({id: $routeParams.id, social: { notes: scope.social.notes }}).$promise.then(function(results) {
        scope.social.notes  = results.social.notes;
        scope.social.state  = 'updated';
      }, function(err) {
        scope.social.errors  = gettextCatalog.getString('There was a problem updating this user.');
        scope.social.state  = undefined;
      });
    };

    init();

  };

  return {
    scope: {
      username: '@',
    },
    link: link,
    require: '^audit',
    templateUrl: 'components/audit/social/_index.html'
  };

}]);


app.directive('auditGuests', ['Guest', '$routeParams', '$location', 'Client', '$q', '$timeout', '$mdDialog', function(Guest, $routeParams, $location, Client, $q, $timeout, $mdDialog) {

  var link = function( scope, element, attrs ) {

    var interval        = 'day';
    scope.loading       = true;
    scope.email         = $routeParams.email;
    scope.location_name = $routeParams.location_name;

    if (scope.email) {
      scope.selectedItem  = scope.email;
    } else if (scope.location_name) {
      scope.selectedItem = scope.location_name;
    }

    scope.options = {
      boundaryLinks: false,
      largeEditDialog: false,
      pageSelector: false,
    };

    scope.query = {
      order:          '-created_at',
      start:          $routeParams.start,
      end:            $routeParams.end,
      filter:         $routeParams.q,
      limit:          $routeParams.per || 25,
      page:           $routeParams.page || 1,
      options:        [5,10,25,50,100],
      direction:      $routeParams.direction || 'desc'
    };

    scope.onPaginate = function (page, limit) {
      scope.query.page  = page;
      scope.query.limit = limit;
      search();
    };

    function querySearch (query) {
      var deferred = $q.defer();
      Guest.get({
        q: query,
      }).$promise.then(function(results) {
        deferred.resolve(results.results);
      }, function(err) {
        scope.loading = undefined;
        deferred.reject();
      });
      return deferred.promise;
    }

    function searchTextChange(text) {
    }

    var timer;
    function selectedItemChange(item) {
      timer = $timeout(function() {
        var hash = {};
        if (item && item._index) {
          switch(item._index) {
            case 'guests':
              hash.email = item._key;
              break;
            case 'locations':
              hash.location_name = item._key;
              break;
            default:
              console.log(item._index);
          }
        }
        $location.search(hash);
      }, 250);
    }

    scope.querySearch         = querySearch;
    scope.selectedItemChange  = selectedItemChange;
    scope.searchTextChange    = searchTextChange;

    var search = function() {
      var hash        = $location.search();
      hash.q          = scope.query.filter;
      hash.page       = scope.query.page;
      hash.per        = scope.query.limit;
      $location.search(hash);
    };

    var init = function() {
      Guest.get({
        page: scope.query.page,
        per:  scope.query.limit,
        email: scope.email,
        start: scope.query.start,
        end: scope.query.end,
        location_name: scope.location_name,
        interval: interval
      }).$promise.then(function(results) {
        scope.guests        = results.guests;
        scope._links        = results._links;
        if (scope.location_name) {
          scope.location = { id: results.guests[0].location_id };
        }
        if ($routeParams.start === undefined) {
          scope.query.start = results._links.start;
          scope.query.end = results._links.end;
        }
        scope.loading       = undefined;
      }, function(err) {
        scope.loading = undefined;
      });
    };

    init();
  };

  return {
    scope: {
      username: '@',
    },
    link: link,
    require: '^audit',
    templateUrl: 'components/audit/guests/_index.html'
  };

}]);

app.directive('auditSales', ['Order', '$routeParams', '$location', 'Client', '$q', '$timeout', '$mdDialog', function(Order, $routeParams, $location, Client, $q, $timeout, $mdDialog) {

  var link = function( scope, element, attrs ) {

    scope.email         = $routeParams.email;
    scope.voucher       = $routeParams.voucher;
    scope.authorization = $routeParams.authorization;

    if (scope.email) {
      scope.selectedItem  = scope.email;
    } else if (scope.vouchers) {
      scope.selectedItem = scope.voucher;
    } else if (scope.authorization) {
      scope.selectedItem = scope.authorization;
    }

    scope.options = {
      boundaryLinks: false,
      largeEditDialog: false,
      pageSelector: false,
    };

    scope.query = {
      order:          '-created_at',
      start:          $routeParams.start,// || start,
      end:            $routeParams.end,// || end,
      filter:         $routeParams.q,
      limit:          $routeParams.per || 25,
      page:           $routeParams.page || 1,
      options:        [5,10,25,50,100],
      direction:      $routeParams.direction || 'desc'
    };

    scope.onPaginate = function (page, limit) {
      scope.query.page = page;
      scope.query.limit = limit;
      search();
    };

    function querySearch (query) {
      var deferred = $q.defer();
      Order.get({
        q: query,
      }).$promise.then(function(results) {
        deferred.resolve(results.results);
      }, function(err) {
        scope.loading = undefined;
        deferred.reject();
      });
      return deferred.promise;
    }

    function searchTextChange(text) {
    }

    var timer;
    function selectedItemChange(item) {
      timer = $timeout(function() {
        var hash = {};
        if (item && item._index) {
          switch(item._index) {
            case 'emails':
              hash.email = item._key;
              break;
            case 'vouchers':
              hash.voucher = item._key;
              break;
            case 'authorization':
              hash.authorization = item._key;
              break;
            default:
              console.log(item._index);
          }
        }
        $location.search(hash);
      }, 250);
    }

    scope.querySearch         = querySearch;
    scope.selectedItemChange  = selectedItemChange;
    scope.searchTextChange    = searchTextChange;

    var search = function() {
      var hash        = $location.search();
      hash.q          = scope.query.filter;
      hash.page       = scope.query.page;
      hash.per        = scope.query.limit;
      $location.search(hash);
    };

    scope.visitClient = function(session) {
      Client.get({location_id: session.location_id, q: session.client_mac}, function(data) {
        $location.path('/locations/' + data.location_slug + '/clients/' + data.id);
      }, function(err){
        console.log(err);
      });
    };

    var init = function() {
      Order.get({
        page:           scope.query.page,
        per:            scope.query.limit,
        email:          scope.email,
        voucher:        scope.voucher,
        authorization:  scope.authorization,
        client_id:      $routeParams.client_id
      }).$promise.then(function(results) {
        scope.orders      = results.orders;
        scope.predicate   = '-created_at';
        scope._links      = results._links;
        scope.loading     = undefined;
      }, function(err) {
        scope.loading = undefined;
      });
    };

    init();

  };

  return {
    scope: {
      loading: '='
    },
    link: link,
    require: '^audit',
    templateUrl: 'components/audit/sales/_index.html'
  };

}]);

app.directive('showOrder', ['Order', '$routeParams', '$timeout', 'menu', '$mdDialog', 'showToast', 'showErrors', 'gettextCatalog', function(Order, $routeParams, $timeout, menu, $mdDialog, showToast, showErrors, gettextCatalog) {

  var link = function(scope) {

    scope.loading   = true;
    scope.page      = $routeParams.page;

    menu.isOpenLeft = false;
    menu.isOpen = false;
    menu.hideBurger = false;

    var init = function() {
      Order.query({id: $routeParams.id}).$promise.then(function(results) {
        scope.order      = results;
        scope.loading     = undefined;
      }, function(err) {

        scope.loading = undefined;
      });
    };

    scope.refund = function() {
      scope.initialState = scope.order.state;
      $mdDialog.show({
        controller: dialogCtrl,
        templateUrl: 'components/audit/sales/_refund.html',
        parent: angular.element(document.body),
        clickOutsideToClose:true
      });
    };

    function dialogCtrl($scope) {
      $scope.cancel = function() {
        $mdDialog.cancel();
      };
      $scope.refund = function(id) {
        scope.order.state = 'refunding';
        $mdDialog.cancel();
        refund();
      };
    }
    dialogCtrl.$inject = ['$scope'];

    function refund () {
      Order.update({id: $routeParams.id, store_order: { refund: true }}).$promise.then(function(results) {
        // scope.order.state = 'refunded';
        showToast(gettextCatalog.getString('Order successfully refunded.'));
      }, function(err) {
        scope.order.state   = scope.initialState;
        scope.initialState  = undefined;
        showErrors(err);
      });
    }

    scope.back = function() {
      window.history.back();
    };

    init();

  };

  return {
    link: link,
    scope: {},
    templateUrl: 'components/audit/sales/_show.html'
  };

}]);

app.directive('showGuest', ['Guest', '$routeParams', '$timeout', 'menu', '$mdDialog', 'showToast', 'showErrors', function(Guest, $routeParams, $timeout, menu, $mdDialog, showToast, showErrors) {

  var link = function(scope) {

    scope.loading   = true;
    scope.page      = $routeParams.page;

    menu.isOpenLeft = false;
    menu.isOpen = false;
    menu.hideBurger = false;

    var init = function() {
      Guest.query({id: $routeParams.id}).$promise.then(function(results) {
        scope.guest       = results;
        scope.loading     = undefined;
      }, function(err) {

        scope.loading = undefined;
      });
    };

    scope.back = function() {
      window.history.back();
    };

    init();

  };

  return {
    link: link,
    scope: {},
    templateUrl: 'components/audit/guests/_show.html'
  };

}]);

app.directive('rangeFilter', ['$routeParams', '$mdDialog', '$location', 'gettextCatalog', function($routeParams, $mdDialog, $location, gettextCatalog) {

  var link = function(scope) {

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
        $scope.myDate.getMonth() - 12,
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
        var hash = $location.search();
        hash.start = new Date($scope.startDate).getTime() / 1000;
        var end = new Date($scope.endDate);
        hash.end = end.setDate(end.getDate() + 1) / 1000;
        if (hash.start >= hash.end) {
          $scope.error = gettextCatalog.getString('The start date must be less than the end date');
        } else {
          $mdDialog.cancel();
          $location.search(hash);
          scope.search();
        }
      };
    }
    DialogController.$inject = ['$scope'];

  };

  return {
    link: link,
    scope: {
      search: '&'
    },
    template: 
      '<div>'+
      '<md-button ng-click="rangeFilter()" class="md-icon-button" hide show-gt-xs>'+
      '<md-icon md-font-icon="date_range">date_range</md-icon>'+
      '</md-button>'+
      '</div>'
  };

}]);

app.directive('auditDownloads', ['Report', '$routeParams', '$mdDialog', '$location', 'showToast', 'showErrors', 'gettextCatalog', function(Report, $routeParams, $mdDialog, $location, showToast, showErrors, gettextCatalog) {

  var link = function(scope,el,attrs) {

    scope.downloadReport = function() {
      var confirm = $mdDialog.confirm()
      .title(gettextCatalog.getString('Download Report'))
      .textContent(gettextCatalog.getString('Please note this is a beta feature. Reports are sent via email.'))
      .ariaLabel(gettextCatalog.getString('Email Report'))
      .ok(gettextCatalog.getString('Download'))
      .cancel(gettextCatalog.getString('Cancel'));
      $mdDialog.show(confirm).then(function() {
        downloadReport();
      });
    };

    var downloadReport = function() {
      var params = {
        start: $routeParams.start,
        end: $routeParams.end,
        location_id: scope.lid,
        type: scope.type
      };
      Report.create(params).$promise.then(function(results) {
        showToast(gettextCatalog.getString('Your report will be emailed to you soon'));
      }, function(err) {
        showErrors(err);
      });
    };

  };

  return {
    link: link,
    scope: {
      search: '&',
      lid: '@',
      type: '@'
    },
    template: 
      '<div>'+
      '<md-button ng-click="downloadReport()" class="md-icon-button" hide show-gt-xs>'+
      '<md-icon>file_download</md-icon>'+
      '</md-button>'+
      '</div>'
  };

}]);

