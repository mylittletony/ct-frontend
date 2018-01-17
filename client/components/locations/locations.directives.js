'use strict';

var app = angular.module('myApp.locations.directives', []);

app.directive('locationShow', ['Location', 'Auth', '$routeParams', '$location', '$localStorage', 'showToast', 'menu', '$timeout', '$pusher', '$route', '$rootScope', 'gettextCatalog', function(Location, Auth, $routeParams, $location, $localStorage, showToast, menu, $timeout, $pusher, $route, $rootScope, gettextCatalog) {

  var link = function(scope,element,attrs,controller) {

    var channel;

    scope.favourite = function() {
      scope.location.is_favourite = !scope.location.is_favourite;
      updateLocation();
    };

    if ($localStorage.user) {
      scope.white_label = $localStorage.user.custom;
    }

    function updateLocation() {
      Location.update({}, {
        id: $routeParams.id,
        location: {
          favourite: scope.location.is_favourite
        }
      }).$promise.then(function(results) {
        var val = scope.location.is_favourite ? gettextCatalog.getString('added to') : gettextCatalog.getString('removed from');
        showToast(gettextCatalog.getString('Location {{val}} favourites.', {val: val}));
      }, function(err) {
      });
    }

    scope.addDevice = function() {
      window.location.href = '/#/locations/' + scope.location.slug + '/boxes/new';
    };

    $timeout(function() {
      scope.loading = undefined
    },1500);

  };

  return {
    link: link,
    loading: '=',
    templateUrl: 'components/locations/show/_index.html'
  };

}]);

// app.directive('locationDashboard', ['Location', '$rootScope', '$compile', function(Location, $rootScope, $compile) {

//   var link = function(scope,element,attrs,controller) {

//     var compileTemplate = function(version) {
//       var template;
//       template = $compile('<show-dashboard location="location"></show-dashboard>')(scope);
//       element.html(template);
//       scope.loading = undefined;
//     };

//     $rootScope.$on('locationLoaded', function (event, next, current) {
//       compileTemplate();
//     });
//   };

//   return {
//     // scope: {},
//     link: link
//   };

// }]);

// app.directive('locationSplashReports', ['Report', '$routeParams', '$rootScope', '$location', '$timeout', 'Location', '$q', 'Locations', '$mdDialog', function(Report, $routeParams, $rootScope, $location, $timeout, Location, $q, Locations, $mdDialog) {

//   var link = function(scope,element,attrs,controller) {

//     var timer;

//     if ($routeParams.start && $routeParams.end) {
//       scope.start        = $routeParams.start;
//       scope.end          = $routeParams.end;
//       scope.dateFiltered = true;
//     } else {
//       scope.start    = (Math.floor(new Date() / 1000) - 21600);
//       scope.end      = Math.floor(new Date() / 1000);
//     }


//     Location.get({id: $routeParams.id}, function(data) {
//       scope.location = data;
//     }, function(err){
//       console.log(err);
//     });

//     scope.favourite = function() {
//       scope.location.is_favourite = !scope.location.is_favourite;
//       updateLocation();
//     };

//     function updateLocation() {
//       Location.update({}, {
//         id: $routeParams.id,
//         location: {
//           favourite: scope.location.is_favourite
//         }
//       }).$promise.then(function(results) {
//         var val = scope.location.is_favourite ? gettextCatalog.getString('added to') : gettextCatalog.getString('removed from');
//         showToast(gettextCatalog.getString('Location {{val}} favourites.', {val: val}));
//       }, function(err) {
//       });
//     }

//     function rangeCtrl($scope, startFull, endFull) {
//       $scope.startFull = startFull;
//       $scope.endFull = endFull;
//       $scope.page = 'show';
//       $scope.saveRange = function() {
//         if ($scope.startFull && $scope.endFull) {
//           // converting the moment picker time format - this could really do with some work:
//           var startTimestamp = Math.floor(moment($scope.startFull).utc().toDate().getTime() / 1000);
//           var endTimestamp = Math.floor(moment($scope.endFull).utc().toDate().getTime() / 1000);
//           if (startTimestamp > endTimestamp) {
//             showToast(gettextCatalog.getString('Selected range period not valid'));
//           } else if ((endTimestamp - startTimestamp) < 300 || (endTimestamp - startTimestamp) > 2592000) {
//             // check that the selected range period is between five minutes and thirty days
//             showToast(gettextCatalog.getString('Range period should be between five minutes and thirty days'));
//           } else {
//             scope.start = startTimestamp;
//             scope.end = endTimestamp;
//             scope.filtered = true;
//             scope.updatePage();
//             $mdDialog.cancel();
//           }
//         }
//       };

//       $scope.close = function() {
//         $mdDialog.cancel();
//       };
//     }

//     scope.openMomentRange = function() {
//       if ($routeParams.start && $routeParams.end) {
//         scope.startFull = moment($routeParams.start * 1000).format('MM/DD/YYYY h:mm A');
//         scope.endFull = moment($routeParams.end * 1000).format('MM/DD/YYYY h:mm A');
//       }
//       $mdDialog.show({
//         templateUrl: 'components/locations/clients/_client_date_range.html',
//         parent: angular.element(document.body),
//         clickOutsideToClose:true,
//         locals: {
//           startFull: scope.startFull,
//           endFull:   scope.endFull
//         },
//         controller: rangeCtrl
//       });
//     };

//     scope.updatePage = function() {
//       scope.loadingChart  = true;
//       var hash            = {};
//       hash.ap_mac         = scope.ap_mac;
//       hash.interval       = scope.interval;
//       hash.start          = scope.start;
//       hash.end            = scope.end;
//       $location.search(hash);
//       $timeout(function() {
//         scope.loadingChart = undefined;
//       },2000);
//     };

//     scope.clearRangeFilter = function() {
//       scope.start = undefined;
//       scope.end = undefined;
//       scope.updatePage();
//     };
//   };

//   return {
//     link: link,
//     scope: {
//       loading: '='
//     },
//     templateUrl: 'components/locations/reports/_splash.html'
//   };

// }]);

// app.directive('locationWirelessReports', ['Report', '$routeParams', '$rootScope', '$location', '$timeout', 'Location', '$q', 'Locations', '$mdDialog', function(Report, $routeParams, $rootScope, $location, $timeout, Location, $q, Locations, $mdDialog) {

//   var link = function(scope,element,attrs,controller) {

//     var timer;

//     if ($routeParams.start && $routeParams.end) {
//       scope.start        = $routeParams.start;
//       scope.end          = $routeParams.end;
//       scope.dateFiltered = true;
//     } else {
//       scope.start    = (Math.floor(new Date() / 1000) - 21600);
//       scope.end      = Math.floor(new Date() / 1000);
//     }


//     Location.get({id: $routeParams.id}, function(data) {
//       scope.location = data;
//     }, function(err){
//       console.log(err);
//     });

//     scope.favourite = function() {
//       scope.location.is_favourite = !scope.location.is_favourite;
//       updateLocation();
//     };

//     function updateLocation() {
//       Location.update({}, {
//         id: $routeParams.id,
//         location: {
//           favourite: scope.location.is_favourite
//         }
//       }).$promise.then(function(results) {
//         var val = scope.location.is_favourite ? gettextCatalog.getString('added to') : gettextCatalog.getString('removed from');
//         showToast(gettextCatalog.getString('Location {{val}} favourites.', {val: val}));
//       }, function(err) {
//       });
//     }

//     function rangeCtrl($scope, startFull, endFull) {
//       $scope.startFull = startFull;
//       $scope.endFull = endFull;
//       $scope.page = 'show';
//       $scope.saveRange = function() {
//         if ($scope.startFull && $scope.endFull) {
//           // converting the moment picker time format - this could really do with some work:
//           var startTimestamp = Math.floor(moment($scope.startFull).utc().toDate().getTime() / 1000);
//           var endTimestamp = Math.floor(moment($scope.endFull).utc().toDate().getTime() / 1000);
//           if (startTimestamp > endTimestamp) {
//             showToast(gettextCatalog.getString('Selected range period not valid'));
//           } else if ((endTimestamp - startTimestamp) < 300 || (endTimestamp - startTimestamp) > 2592000) {
//             // check that the selected range period is between five minutes and thirty days
//             showToast(gettextCatalog.getString('Range period should be between five minutes and thirty days'));
//           } else {
//             scope.start = startTimestamp;
//             scope.end = endTimestamp;
//             scope.filtered = true;
//             scope.updatePage();
//             $mdDialog.cancel();
//           }
//         }
//       };

//       $scope.close = function() {
//         $mdDialog.cancel();
//       };
//     }

//     scope.openMomentRange = function() {
//       if ($routeParams.start && $routeParams.end) {
//         scope.startFull = moment($routeParams.start * 1000).format('MM/DD/YYYY h:mm A');
//         scope.endFull = moment($routeParams.end * 1000).format('MM/DD/YYYY h:mm A');
//       }
//       $mdDialog.show({
//         templateUrl: 'components/locations/clients/_client_date_range.html',
//         parent: angular.element(document.body),
//         clickOutsideToClose:true,
//         locals: {
//           startFull: scope.startFull,
//           endFull:   scope.endFull
//         },
//         controller: rangeCtrl
//       });
//     };

//     scope.updatePage = function() {
//       scope.loadingChart  = true;
//       var hash            = {};
//       hash.ap_mac         = scope.ap_mac;
//       hash.interval       = scope.interval;
//       hash.start          = scope.start;
//       hash.end            = scope.end;
//       $location.search(hash);
//       $timeout(function() {
//         scope.loadingChart = undefined;
//       },2000);
//     };

//     scope.clearRangeFilter = function() {
//       scope.start = undefined;
//       scope.end = undefined;
//       scope.updatePage();
//     };
//   };

//   return {
//     link: link,
//     scope: {
//       loading: '='
//     },
//     templateUrl: 'components/locations/reports/_wireless.html'
//   };

// }]);

// app.directive('listLocations', ['Location', '$routeParams', '$rootScope', '$http', '$location', 'menu', 'locationHelper', '$q','Shortener', 'gettextCatalog', 'pagination_labels', function (Location, $routeParams, $rootScope, $http, $location, menu, locationHelper, $q, Shortener, gettextCatalog, pagination_labels) {

//   var link = function(scope,element,attrs) {

//     menu.isOpenLeft = false;
//     menu.isOpen = false;
//     menu.hideBurger = true;
//     menu.sectionName = gettextCatalog.getString('Locations');

//     if ($routeParams.user_id) {
//       scope.user_id = parseInt($routeParams.user_id);
//     }

//     scope.options = {
//       boundaryLinks: false,
//       largeEditDialog: false,
//       pageSelector: false,
//       rowSelection: false
//     };

//     scope.pagination_labels = pagination_labels;
//     scope.query = {
//       order:      'updated_at',
//       filter:     $routeParams.q,
//       limit:      $routeParams.per || 25,
//       page:       $routeParams.page || 1,
//       options:    [5,10,25,50,100],
//       direction:  $routeParams.direction || 'desc',
//       sort:  $routeParams.sort || 'updated_at'
//     };

//     scope.sort = function(val, reverse) {
//       if (scope.query.direction === 'asc') {
//         scope.query.direction = 'desc';
//       } else {
//         scope.query.direction = 'asc';
//       }
//       var page = $routeParams.page || 1;
//       var limit = $routeParams.per || 25;
//       scope.onPaginate(page, limit, val);
//     };

//     scope.onPaginate = function (page, limit, val) {
//       scope.query.page = page;
//       scope.query.limit = limit;
//       scope.query.sort = val || $routeParams.sort;
//       scope.blur();
//     };

//     scope.blur = function() {
//       var hash = {};
//       hash.page = scope.query.page;
//       hash.per = scope.query.limit;
//       hash.sort = scope.query.sort;
//       hash.direction = scope.query.direction;
//       hash.q = scope.query.filter;
//       if (scope.user_id) {
//         hash.user_id = scope.user_id;
//       }
//       $location.search(hash);
//     };

//     var filterLocationOwners = function() {
//       if (scope.user_id && scope.locations.length > 0) {
//         for (var i = 0, len = scope.locations.length; i < len; i++) {
//           if (scope.locations[i].user_id === scope.user_id) {
//             scope.locations[i].owner = true;
//           }
//         }
//       }
//     };

//     var init = function() {
//       Location.query({
//         q: scope.query.filter,
//         page: scope.query.page,
//         per: scope.query.limit,
//         sort: scope.query.sort,
//         direction: scope.query.direction,
//         user_id: scope.user_id
//       }).$promise.then(function(results) {
//         scope.total_locs  = results._links.total_entries;
//         scope.locations   = results.locations;
//         scope._links      = results._links;
//         filterLocationOwners();
//         scope.searching   = undefined;
//         scope.loading     = undefined;
//       }, function() {
//         scope.loading   = undefined;
//         scope.searching = undefined;
//       });
//     };

//     init();
//   };

//   return {
//     link: link,
//     templateUrl: 'components/locations/index/_list.html',
//     scope: {}
//   };

// }]);

// app.directive('locationAudit', ['Session', 'Client', 'Email', 'Guest', 'Social', 'Order', 'Location', 'Report', '$routeParams', '$rootScope', '$location', '$timeout', '$q', '$localStorage', 'Locations', '$mdDialog', 'showToast', 'showErrors', 'gettextCatalog', function(Session, Client, Email, Guest, Social, Order, Location, Report, $routeParams, $rootScope, $location, $timeout, $q, $localStorage, Locations, $mdDialog, showToast, showErrors, gettextCatalog) {

//   var link = function(scope,element,attrs,controller) {

//     var params = {};

//     scope.startDate = moment().utc().subtract(6, 'days').startOf('day').toDate();
//     scope.endDate = moment().utc().toDate();

//     var weekAgoEpoch = Math.floor(scope.startDate.getTime() / 1000);
//     var nowEpoch = Math.floor(scope.endDate.getTime() / 1000);

//     scope.audit_models = ['Radius Sessions', 'Clients', 'Emails', 'Guests', 'Social', 'Sales'];

//     var mailerType = {
//       'Radius Sessions': 'radius',
//       'Clients': 'client',
//       'Emails': 'email',
//       'Guests': 'guest',
//       'Social': 'social',
//       'Sales': 'order'
//     };

//     scope.selected = 'Radius Sessions' || $routeParams.type;

//     scope.query = {
//       page: $routeParams.page || 1,
//       limit: $routeParams.per || 25,
//       start: $routeParams.start || weekAgoEpoch,
//       end: $routeParams.end || nowEpoch
//     };

//     var getParams = function() {
//       params = {
//         location_id: scope.location.id,
//         page: scope.query.page,
//         per: scope.query.limit,
//         start: scope.query.start,
//         end: scope.query.end,
//         interval: 'day'
//       };
//     };

//     var clearTable = function() {
//       scope.results = [];
//       scope.links = undefined;
//       $location.search();
//       if (scope.query.end - scope.query.start > 604800 && $localStorage.user && !localStorage.user.paid_plan) {
//         showToast(gettextCatalog.getString('Please ensure you are permitted to see audits in this date range.'));
//       }
//     };

//     var findSessions = function() {
//       getParams();
//       params.client_mac = scope.query.client_mac;
//       Session.query(params).$promise.then(function(data, err) {
//         scope.selected = 'Radius Sessions';
//         scope.results = data.sessions;
//         scope.links = data._links;
//         $location.search();
//       }, function(err) {
//         console.log(err);
//         clearTable();
//       });
//     };

//     var findEmails = function() {
//       getParams();
//       Email.get(params).$promise.then(function(data, err) {
//         scope.selected = 'Emails';
//         scope.results = data.emails;
//         scope.links = data._links;
//         $location.search();
//       }, function(err) {
//         console.log(err);
//         clearTable();
//       });
//     };

//     var findClients = function() {
//       getParams();
//       Client.query(params).$promise.then(function(data, err) {
//         scope.selected = 'Clients';
//         scope.results = data.clients;
//         scope.links = data._links;
//         $location.search();
//       }, function(err) {
//         console.log(err);
//         clearTable();
//       });
//     };

//     var findGuests = function() {
//       getParams();
//       Guest.get(params).$promise.then(function(data, err) {
//         scope.selected = 'Guests';
//         scope.results = data.guests;
//         scope.links = data._links;
//         $location.search();
//       }, function(err) {
//         console.log(err);
//         clearTable();
//       });
//     };

//     var findSocial = function() {
//       getParams();
//       Social.get(params).$promise.then(function(data, err) {
//         scope.selected = 'Social';
//         scope.results = data.social;
//         scope.links = data._links;
//         $location.search();
//       }, function(err) {
//         console.log(err);
//         clearTable();
//       });
//     };

//     var findOrders = function() {
//       getParams();
//       Order.get(params).$promise.then(function(data, err) {
//         scope.selected = 'Sales';
//         scope.results = data.orders;
//         scope.links = data._links;
//         $location.search();
//       }, function(err) {
//         console.log(err);
//         clearTable();
//       });
//     };

//     var downloadReport = function() {
//       var params = {
//         start: scope.query.start,
//         end: scope.query.end,
//         location_id: scope.location.id,
//         type: mailerType[scope.selected]
//       };
//       Report.create(params).$promise.then(function(results) {
//         showToast(gettextCatalog.getString('Your report will be emailed to you soon'));
//       }, function(err) {
//         showErrors(err);
//       });
//     };

//     scope.updateAudit = function(selected) {
//       switch(selected) {
//         case 'Emails':
//           findEmails();
//           break;
//         case 'Clients':
//           findClients();
//           break;
//         case 'Guests':
//           findGuests();
//           break;
//         case 'Social':
//           findSocial();
//           break;
//         case 'Sales':
//           findOrders();
//           break;
//         default:
//           findSessions();
//           break;
//       }
//     };

//     scope.setStart = function() {
//       scope.query.start = new Date(scope.startDate).getTime() / 1000;
//       scope.updateAudit(scope.selected);
//     };

//     scope.setEnd = function() {
//       scope.query.end = new Date(scope.endDate).getTime() / 1000;
//       scope.updateAudit(scope.selected);
//     };

//     scope.filterSessionsByClient = function(mac) {
//       scope.query.client_mac = mac;
//       findSessions();
//     };

//     scope.clearClientFilter = function() {
//       scope.query.client_mac = undefined;
//       findSessions();
//     };

//     scope.onPaginate = function(page, limit) {
//       scope.query.page = page;
//       scope.query.limit = limit;
//       scope.updateAudit(scope.selected);
//     };

//     scope.downloadAudit = function() {
//       var confirm = $mdDialog.confirm()
//       .title(gettextCatalog.getString('Download Report'))
//       .textContent(gettextCatalog.getString('Please note this is a beta feature. Reports are sent via email.'))
//       .ariaLabel(gettextCatalog.getString('Email Report'))
//       .ok(gettextCatalog.getString('Download'))
//       .cancel(gettextCatalog.getString('Cancel'));
//       $mdDialog.show(confirm).then(function() {
//         downloadReport();
//       });
//     };

//     var getLocation = function() {
//       var deferred = $q.defer();
//       Location.get({id: $routeParams.id}).$promise.then(function(results) {
//         scope.location = results;
//         deferred.resolve(results.results);
//       }, function() {
//         deferred.reject();
//       });
//       return deferred.promise;
//     };

//     var init = function() {
//       getLocation().then(function() {
//         getParams();
//         scope.updateAudit(scope.selected);
//       });
//     };

//     init();

//   };

//   return {
//     link: link,
//     scope: {
//       loading: '='
//     },
//     templateUrl: 'components/locations/audit/_index.html'
//   };

// }]);

// app.directive('homeDashboard', ['Location', '$routeParams', '$rootScope', '$http', '$location', '$cookies', '$localStorage', 'locationHelper', '$q','Shortener', '$timeout', 'Box', function (Location, $routeParams, $rootScope, $http, $location, $cookies, $localStorage, locationHelper, $q, Shortener, $timeout, Box) {

//   var link = function(scope,element,attrs) {

//     var load = function() {
//       scope.querySearch        = querySearch;
//       scope.selectedItemChange = selectedItemChange;
//       scope.searchTextChange   = searchTextChange;

//       if ($localStorage.user) {
//         scope.white_label = $localStorage.user.custom;
//       }

//       if ($rootScope.loggedIn || (scope.$parent.loggedIn && scope.$parent.loggedOut === undefined)) {
//         scope.loggedIn = true;
//       }

//       if ($routeParams.pinned) {
//         scope.pinned = true;
//       }

//       scope.loading = undefined;
//     };

//     function querySearch (query) {
//       var deferred = $q.defer();
//       Location.query({q: query, aggs: true}).$promise.then(function(results) {
//         deferred.resolve(results.results);
//       }, function() {
//         deferred.reject();
//       });
//       return deferred.promise;
//     }

//     function shortener () {
//       Shortener.get({short: $routeParams.xtr}).$promise.then(function(results) {
//         $location.path(results.url);
//         $location.search({});
//       }, function() {
//         $location.search({});
//       });
//     }

//     scope.create = function(name) {
//       $location.path('/locations/new');
//       $location.search({name: name});
//     };

//     function searchTextChange(id) {
//     }

//     var timer;
//     function selectedItemChange(item) {
//       timer = $timeout(function() {
//         var hash = {};
//         if (item && item._index) {
//           switch(item._index) {
//             case 'locations':
//               goLocation(item._key);
//             break;
//           case 'devices':
//             goDevice(item._key);
//           break;
//         default:
//           console.log(item._index);
//           }
//         }
//       }, 250);
//     }

//     var goLocation = function(query) {
//       Location.query({location_name: query}).$promise.then(function(results) {
//         $location.path('/' + results.locations[0].slug);
//       }, function(err) {
//         console.log(err);
//       });
//     };

//     var goDevice = function(query) {
//       Box.query({description: query}).$promise.then(function(results) {
//         $location.path('/' + results.boxes[0].location_slug + '/devices/' + results.boxes[0].slug);
//       }, function(err) {
//         console.log(err);
//       });
//     };

//     if ($routeParams.xtr) {
//       shortener();
//     } else {
//       load();
//     }

//   };

//   return {
//     link: link,
//     templateUrl: 'components/locations/index/_index.html',
//     scope: {}
//   };

// }]);

// app.directive('changeLocationToken', ['Location', '$routeParams', 'showToast', 'showErrors', '$mdDialog', 'gettextCatalog', function (Location, $routeParams, showToast, showErrors, $mdDialog, gettextCatalog) {

//   var link = function(scope,element,attrs) {

//     scope.changeToken = function(box,ev) {
//       var confirm = $mdDialog.confirm()
//         .title(gettextCatalog.getString('Are you sure you want to change the API Token?'))
//         .textContent(gettextCatalog.getString('This will revoke your existing credentials and cannot be reversed.'))
//         .ariaLabel(gettextCatalog.getString('Revoke'))
//         .targetEvent(ev)
//         .ok(gettextCatalog.getString('Revoke it'))
//         .cancel(gettextCatalog.getString('Cancel'));
//       $mdDialog.show(confirm).then(function() {
//         changeToken();
//       });
//     };

//     var changeToken = function() {
//       if (scope.loading === undefined) {
//         updateLocation();
//       }
//     };

//     function updateLocation() {
//       Location.update({}, {
//         id: $routeParams.id,
//         location: {
//           update_token: true
//         }
//       }).$promise.then(function(results) {
//         scope.token = results.api_token;
//         showToast(gettextCatalog.getString('Token successfully changed.'));
//       }, function(err) {
//         showErrors(err);
//       });
//     }

//   };

//   return {
//     link: link,
//     scope: {
//       token: '='
//     },
//     templateUrl: 'components/locations/settings/_change_token.html',
//   };

// }]);

// app.directive('dashing', ['Report', function (Report) {

//   var link = function(scope,element,attrs) {

//     scope.loading = true;

//     var init = function() {

//       Report.dashboard({dashing: true, v: 2}).$promise.then(function(results) {
//         scope.stats     = results.stats;
//         process();
//         scope.loading   = undefined;
//       });

//     };

//     function process () {
//       angular.forEach(scope.stats.boxes.states, function(b) {
//         if (b.state === 'offline') {
//           scope.offline = b.total;
//         } else if (b.state === 'online') {
//           scope.online = b.total;
//         } else if (b.state === 'online') {
//           scope.online = b.total;
//         } else if (b.state === 'splash_only') {
//           scope.splash_only = b.total;
//         }
//       });
//     }

//     init();

//   };

//   return {
//     link: link,
//     scope: {
//       locations: '@'
//     },
//     templateUrl: 'components/locations/show/_dashing.html',
//   };

// }]);

// app.directive('locationShortlist', function() {
//   return {
//     templateUrl: 'components/locations/layouts/short-list.html'
//   };
// });

app.directive('newLocationForm', ['Location', '$location', 'menu', 'showErrors', 'showToast', '$timeout', 'gettextCatalog', function(Location, $location, menu, showErrors, showToast, $timeout, gettextCatalog) {

  var link = function( scope, element, attrs ) {

    menu.isOpen = false;
    menu.hideBurger = true;
    scope.location  = {
      add_to_global_map: false,
    };

    scope.save = function(form, location) {
      form.$setPristine();
      scope.location.creating = true;
      updateCT(location);
    };

    var complete = function(slug) {
      var timer = $timeout(function() {
        $timeout.cancel(timer);
        $location.path('/' + slug + '/guide');
        showToast(gettextCatalog.getString('Location successfully created.'));
      }, 2000);
    };

    var updateCT = function(location) {
      scope.loading = true;
      Location.save({
        location: location,
      }).$promise.then(function(results) {
        menu.isOpen = true;
        menu.hideBurger = false;
        complete(results.slug);
      }, function(err) {
        var msg = err.data.message[0];
        scope.loading = undefined;
        if (msg === 'Over free quota') {
          scope.over_quota = 'Hey, you\'re going to need a paid plan to do that.';
        } else if (msg === 'Over quota') {
          scope.over_quota = 'Please drop us a line and ask for a quota increase.';
        } else {
          showErrors(err);
        }
      });
    };

    scope.over_quota = 'Hey, you\'re going to need a paid plan to do that.';
  };

  return {
    link: link,
    restrict: 'E',
    scope: {
      // accountId: '@'
    },
    templateUrl: 'components/locations/new/_index.html'
  };

}]);

app.directive('newLocationCreating', ['Location', '$location', function(Location, $location) {

  var link = function( scope, element, attrs ) {
    scope.locationFinalised = function() {
      scope.location.attr_generated = true;
      $location.path('/locations/' + scope.location.slug);
      scope.newLocationModal();
    };
  };

  return {
    link: link,
    templateUrl: 'components/locations/show/attr-generated.html'
  };

}]);

// app.directive('locationAdmins', ['Location', 'Invite', '$routeParams', '$mdDialog', 'showToast', 'showErrors', '$pusher', '$rootScope', '$timeout', 'gettextCatalog', 'pagination_labels', function(Location, Invite, $routeParams, $mdDialog, showToast, showErrors, $pusher, $rootScope, $timeout, gettextCatalog, pagination_labels) {

//   var link = function( scope, element, attrs ) {

//     scope.users = [];
//     scope.roles = [
//       { role_id: 110, name: gettextCatalog.getString('Administrator') },
//       { role_id: 120, name: gettextCatalog.getString('Editor') },
//       { role_id: 130, name: gettextCatalog.getString('Supporter') },
//       { role_id: 140, name: gettextCatalog.getString('Observer') }
//     ];

//     scope.pagination_labels = pagination_labels;
//     scope.query = {
//       order:      'username',
//       limit:      $routeParams.per || 25,
//       page:       $routeParams.page || 1,
//       options:    [5,10,25,50,100],
//       // direction:  $routeParams.direction || 'desc'
//     };

//     // scope.onPaginate = function (page, limit) {
//     //   scope.query.page = page;
//     //   scope.query.limit = limit;
//     //   scope.updatePage();
//     // };

//     // scope.updatePage = function(item) {

//     // };

//     var channel;
//     function loadPusher(key) {
//       if (scope.pusherLoaded === undefined && typeof client !== 'undefined') {
//         scope.pusherLoaded = true;
//         var pusher = $pusher(client);
//         channel = pusher.subscribe('private-' + key);
//         channel.bind('invites', function(data) {
//           console.log('Message recvd.', data);
//           if (data.message.success === true) {
//             showToast(data.message.msg);
//           } else {
//             // Someone should fix the showErrors service so we can send an object in
//             showErrors({message: data.message.msg });
//           }
//         });
//       }
//     }

//     // User Permissions //
//     var createMenu = function() {
//       scope.allowed = true;
//       scope.menu = [];

//       scope.menu.push({
//         name: gettextCatalog.getString('View'),
//         type: 'view',
//         icon: 'pageview'
//       });

//       scope.menu.push({
//         name: gettextCatalog.getString('Edit'),
//         type: 'edit',
//         icon: 'settings'
//       });

//       scope.menu.push({
//         name: gettextCatalog.getString('Revoke'),
//         type: 'revoke',
//         icon: 'delete_forever'
//       });
//     };

//     scope.action = function(type,user) {
//       switch(type) {
//         case 'view':
//           view(user);
//         break;
//       case 'revoke':
//         revoke(user);
//       break;
//     case 'edit':
//       edit(user);
//     break;
//       }
//     };

//     scope.options = {
//       autoSelect: true,
//       boundaryLinks: false,
//       pageSelector: false,
//     };

//     scope.query = {
//       order: 'state',
//       limit: $routeParams.per || 50,
//       page: $routeParams.page || 1
//     };

//     function allowedEmail(email) {
//       var truth = true;
//       for (var i = 0, len = scope.users.length; i < len; i++) {
//         if (scope.users[i].email === email) {
//           truth = false;
//           break;
//         }
//       }
//       return truth;
//     }

//     scope.invite = function() {
//       $mdDialog.show({
//         templateUrl: 'components/locations/users/_invite.html',
//         clickOutsideToClose: true,
//         parent: angular.element(document.body),
//         controller: DialogController,
//         locals: {
//           roles: scope.roles
//         }
//       });
//     };

//     function DialogController ($scope, roles) {
//       $scope.roles = roles;
//       $scope.user = { role_id: roles[0].role_id };
//       $scope.close = function() {
//         $mdDialog.cancel();
//       };
//       $scope.invite = function(user) {
//         $mdDialog.cancel();
//         inviteUser(user);
//       };
//     }
//     DialogController.$inject = ['$scope', 'roles'];

//     var inviteUser = function(invite) {
//       if (allowedEmail(invite.email)) {
//         Invite.create({
//           location_id: scope.location.slug,
//           invite: invite
//         }).$promise.then(function(results) {
//           scope.users.push(results);
//         }, function(err) {
//           showErrors(err);
//         });
//       } else {
//         showErrors({message: gettextCatalog.getString('This email has already been added') });
//       }
//     };

//     var revoke = function(user) {
//       $mdDialog.show({
//         templateUrl: 'components/locations/users/_revoke.html',
//         parent: angular.element(document.body),
//         controller: RevokeController,
//         clickOutsideToClose: true,
//         locals: {
//           user: user,
//         }
//       });
//     };

//     function RevokeController ($scope, user) {
//       $scope.user = user;
//       $scope.update = function() {
//         $mdDialog.cancel();
//         revokeAdmin($scope.user);
//       };
//       $scope.close = function() {
//         $mdDialog.cancel();
//       };
//     }
//     RevokeController.$inject = ['$scope', 'user'];

//     var revokeAdmin = function(invite) {
//       invite.state = 'revoking';
//       Invite.destroy({location_id: scope.location.slug, invite: invite}).$promise.then(function(results) {
//         removeFromList(invite.email);
//       }, function(err) {
//         showErrors(err);
//       });
//     };

//     var removeFromList = function(email) {
//       for (var i = 0, len = scope.users.length; i < len; i++) {
//         if (scope.users[i].email === email) {
//           scope.users.splice(i, 1);
//           break;
//         }
//       }
//     };

//     var edit = function(user) {
//       $mdDialog.show({
//         templateUrl: 'components/locations/users/_edit.html',
//         parent: angular.element(document.body),
//         controller: EditRoleController,
//         clickOutsideToClose: true,
//         locals: {
//           user: user,
//           roles: scope.roles
//         }
//       });
//     };

//     function EditRoleController ($scope, user, roles) {
//       $scope.user = user;
//       $scope.roles = roles;
//       $scope.update = function() {
//         $mdDialog.cancel();
//         updateRole(user);
//       };
//       $scope.close = function() {
//         $mdDialog.cancel();
//       };
//     }
//     EditRoleController.$inject = ['$scope', 'user', 'roles'];

//     var updateRole = function(user) {
//       Invite.update({
//         location_id: scope.location.slug,
//         email: user.email,
//         role_id: user.role_id
//       }).$promise.then(function(results) {
//         showToast('User successfully updated.');
//       }, function(err) {
//         showErrors(err);
//         scope.loading = undefined;
//       });
//     };

//     var init = function() {
//       Location.users({id: scope.location.slug}).$promise.then(function(results) {
//         scope.users = results;
//         createMenu();
//         scope.loading = undefined;
//       }, function(err) {
//         scope.loading = undefined;
//         console.log(err);
//       });
//     };

//     var view = function(user) {
//       window.location.href = '/#/users/' + user.slug;
//     };

//     init();

//     var timer = $timeout(function() {
//       loadPusher(scope.location.pubsub_token);
//       $timeout.cancel(timer);
//     }, 500);

//   };

//   return {
//     link: link,
//     scope: {
//       id: '@',
//       loading: '=',
//       location: '='
//     },
//     templateUrl: 'components/locations/users/_index.html'
//   };
// }]);

// app.directive('locationMap', ['Location', 'Box', '$routeParams', '$mdDialog', 'showToast', 'showErrors', '$pusher', '$q', function(Location, Box, $routeParams, $mdDialog, showToast, showErrors, $pusher, $q) {

//   var link = function( scope, element, attrs ) {

//     scope.updateCT = function(opts) {
//       scope.box = {
//         latitude: opts.lat,
//         longitude: opts.lng
//       };
//       Box.update({id: opts.slug, box: scope.box}).$promise.then(function(data) {

//       });
//     };

//     var init = function() {
//       scope.deferred = $q.defer();
//       Box.query({
//         location_id: scope.location.slug,
//         metadata: true
//       }).$promise.then(function(results) {
//         scope.boxes           = results.boxes;
//         scope.loading         = undefined;
//         scope.deferred.resolve();
//       }, function(err) {
//         scope.loading = undefined;
//       });
//     };

//     init();

//   };

//   return {
//     link: link,
//     scope: {
//       location: '='
//     },
//     templateUrl: 'components/locations/show/_map.html'
//   };
// }]);

// app.directive('locationBoxes', ['Location', '$location', 'Box', 'Metric', '$routeParams', '$mdDialog', '$mdMedia', 'LocationPayload', 'showToast', 'showErrors', '$q', '$mdEditDialog', 'Zone', '$pusher', '$rootScope', 'gettextCatalog', 'pagination_labels', '$timeout', function(Location, $location, Box, Metric, $routeParams, $mdDialog, $mdMedia, LocationPayload, showToast, showErrors, $q, $mdEditDialog, Zone, $pusher, $rootScope, gettextCatalog, pagination_labels, $timeout) {

//   var link = function( scope, element, attrs ) {
//     scope.selected = [];
//     scope.location = {
//       slug: $routeParams.id
//     };

//     // User Permissions //
//     var createMenu = function() {

//       scope.menuItems = [];

//       scope.menuItems.push({
//         name: gettextCatalog.getString('Delete'),
//         type: 'delete',
//         icon: 'delete_forever'
//       });
//     };

//     createMenu();

//     scope.options = {
//       boundaryLinks: false,
//       pageSelector: false,
//       rowSelection: true
//     };

//     scope.pagination_labels = pagination_labels;
//     scope.query = {
//       order:          '-last_heartbeat',
//       limit:          $routeParams.per || 25,
//       page:           $routeParams.page || 1,
//       options:        [5,10,25,50,100],
//       direction:      $routeParams.direction || 'desc'
//     };

//     scope.onPaginate = function (page, limit) {
//       scope.query.page = page;
//       scope.query.limit = limit;
//       search();
//     };

//     var search = function() {
//       var hash            = {};
//       hash.page           = scope.query.page;
//       hash.per            = scope.query.limit;
//       $location.search(hash);
//       init();
//     };

//     scope.disabled = function(box,type) {
//       if (type === 'edit' || type === 'delete' || type === 'view' || type === 'zones') {
//         return false;
//       } else if (type === 'ignore' && !box.allowed_job) {
//         return false;
//       } else {
//         return !box.allowed_job;
//       }
//     };

//     scope.action = function(box,type) {
//       switch(type) {
//         case 'reboot':
//           reboot(box, 1);
//           break;
//         case 'payload':
//           payload(box);
//           break;
//         case 'zones':
//           zones(box);
//           break;
//         case 'resync':
//           resync(box);
//           break;
//         case 'delete':
//           destroy(box);
//           break;
//         case 'edit':
//           edit(box.slug);
//           break;
//         default:
//       }
//     };

//     scope.allowedMenu = function(box) {
//       return !box.allowed_job;
//     };

//     var reboot = function(box,ev) {
//       var confirm = $mdDialog.confirm()
//         .title(gettextCatalog.getString('Would you like to reboot this device?'))
//         .textContent(gettextCatalog.getString('Rebooting will disconnect your clients.\nA reboot takes about 60 seconds to complete'))
//         .ariaLabel(gettextCatalog.getString('Lucky day'))
//         .targetEvent(ev)
//         .ok(gettextCatalog.getString('Reboot it'))
//         .cancel(gettextCatalog.getString('Cancel'));
//       $mdDialog.show(confirm).then(function() {
//         rebootBox(box);
//       });
//     };

//     var rebootBox = function(box) {
//       box.state = 'processing';
//       box.allowed_job = false;

//       Box.update({id: box.slug, box: {action: 'reboot'}}).$promise.then(function(results) {
//         box.state = 'rebooting';
//         showToast(gettextCatalog.getString('Box successfully rebooted.'));
//       }, function(errors) {
//         showToast(gettextCatalog.getString('Failed to reboot box, please try again.'));
//         console.log('Could not reboot box:', errors);
//         box.state = 'online';
//         box.processing = undefined;
//       });
//     };

//     var destroy = function(box,ev) {
//       var confirm = $mdDialog.confirm()
//         .title(gettextCatalog.getString('Delete This Device Permanently?'))
//         .textContent(gettextCatalog.getString('Please be careful, this cannot be reversed.'))
//         .ariaLabel(gettextCatalog.getString('Lucky day'))
//         .targetEvent(ev)
//         .ok(gettextCatalog.getString('Delete it'))
//         .cancel(gettextCatalog.getString('Cancel'));
//       $mdDialog.show(confirm).then(function() {
//         deleteBox(box);
//         showToast(gettextCatalog.getString('Deleted device with mac {{address}}', {address: box.calledstationid}));
//       });
//     };

//     var deleteBox = function(box) {
//       box.processing  = true;
//       box.allowed_job = false;
//       Box.destroy({id: box.slug}).$promise.then(function(results) {
//         removeFromList(box);
//       }, function(errors) {
//         box.processing  = undefined;
//         showToast(gettextCatalog.getString('Failed to delete this box, please try again.'));
//         console.log('Could not delete this box:', errors);
//       });
//     };

//     var payload = function(box,event) {
//       scope.selected.push(box);
//       scope.showPayloadDialog(event);
//     };

//     var closeDialog = function() {
//       $mdDialog.cancel();
//     };

//     function DialogController($scope, items) {
//       $scope.items = items;
//       $scope.cancel = function() {
//         $mdDialog.cancel();
//       };
//       $scope.runCommand = function(command) {
//         runCommand(command);
//       };
//     }
//     DialogController.$inject = ['$scope', 'items'];

//     scope.showPayloadDialog = function(ev) {
//       $mdDialog.show({
//         templateUrl: 'components/locations/boxes/dialog.html',
//         parent: angular.element(document.body),
//         targetEvent: ev,
//         clickOutsideToClose:true,
//         locals: {
//           items: scope.selected // not working
//         },
//         controller: DialogController
//       });
//     };

//     var selection = [];
//     var formatIds = function() {
//       angular.forEach(scope.selected, function(k,v) {
//         selection.push(k.slug);
//         k.processing = true;
//       });
//     };

//     var createPayload = function(ids, command) {
//       LocationPayload.create({}, {
//         location_id: scope.location.slug,
//         payload: {
//           save:       command.save,
//           box_ids:    ids,
//           command_id: command.selected,
//           upgrade:    command.upgrade
//         }
//       }).$promise.then(function() {
//         closeDialog();
//         selection = [];
//         scope.selected = [];
//         showToast(gettextCatalog.getString('Payload sent successfully.'));
//       }, function(errors) {
//         closeDialog();
//         showToast(gettextCatalog.getString('Payload could not be sent.'));
//       });
//     };

//     var runCommand = function(command) {
//       formatIds();
//       if (selection.length > 0) {
//         createPayload(selection, command);
//       } else {
//         closeDialog();
//       }
//     };

//     scope.addDevice = function() {
//       window.location.href = '/#/locations/' + scope.location.slug + '/boxes/new';
//     };

//     scope.deleteDevices = function() {
//       var confirm = $mdDialog.confirm()
//         .title(gettextCatalog.getString('Are you sure you want to delete these devices?'))
//         .textContent(gettextCatalog.getString('This cannot be undone.'))
//         .ariaLabel(gettextCatalog.getString('Delete'))
//         .ok(gettextCatalog.getString('delete'))
//         .cancel(gettextCatalog.getString('Cancel'));
//       $mdDialog.show(confirm).then(function() {
//         deleteDevices();
//       });

//     };

//     var deleteDevices = function(ev) {
//       for (var i = 0, len = scope.selected.length; i < len; i++) {
//         deleteBox(scope.selected[i]);
//         var devices = 'devices';
//         if (scope.selected.length === 1) {
//           devices = 'device';
//         }
//         showToast(gettextCatalog.getPlural(scope.selected.length,'Deleted 1 device', 'Deleted {{$count}} devices', {}));
//       }
//     };

//     var removeFromList = function(box) {
//       scope.selected = [];
//       for (var i = 0, len = scope.boxes.length; i < len; i++) {
//         if (scope.boxes[i].id === box.id) {
//           if (!scope.selected.length) {
//           }
//           scope.boxes.splice(i, 1);
//           break;
//         }
//       }
//     };

//     var zones = function(box) {
//       scope.selected.push(box);
//       scope.showZonesDialog();
//     };

//     scope.showZonesDialog = function(ev) {
//       $mdDialog.show({
//         templateUrl: 'components/locations/boxes/zones.html',
//         parent: angular.element(document.body),
//         targetEvent: ev,
//         clickOutsideToClose:true,
//         controller: ZonesDialogController,
//         locals: {
//           selected: scope.selected
//         }
//       });
//     };

//     function ZonesDialogController($scope,selected) {

//       $scope.loading = true;
//       $scope.selected = selected;
//       var t = {}, a = [];

//       Zone.get({location_id: scope.location.slug}).$promise.then(function(results) {

//         $scope.zones = results.zones;

//         if (results.zones.length) {
//           // Must be called remove !! //
//           var z = { id: 'remove', zone_name: gettextCatalog.getString('No Zone') };

//           results.zones.unshift(z);

//           // Loop through the zones so we can set the zone_id for display //
//           for(var i = 0, l = $scope.selected.length; i < l; ++i){
//             var n, id;
//             if ($scope.selected[i].zone_name) {
//               n  = $scope.selected[i].metadata.zone_name;
//               id = $scope.selected[i].zone_id;
//             } else {
//               n = 'null';
//               id = 'remove';
//             }

//             if (t[n] !== 1) {
//               t[n] = 1;
//               a.push(id);
//             }
//           }

//           if (a.length === 1) {
//             $scope.zone_id = a[0];
//           }
//         }

//         $scope.loading = undefined;

//       }, function() {
//         $scope.loading = undefined;
//       });

//       $scope.createZone = function() {
//         $mdDialog.cancel();
//         window.location.href = '/#/locations/' + scope.location.slug + '/zones?add=true';
//       };

//       $scope.cancel = function() {
//         $mdDialog.cancel();
//       };

//       $scope.execute = function(zone_id) {
//         $mdDialog.cancel();
//         editZones($scope.zones,zone_id);
//       };

//     }
//     ZonesDialogController.$inject = ['$scope', 'selected'];

//     var editZones = function(zones,zone_id) {

//       // Loop through the zones so we can update the metadata //
//       var len, zone_name, i;
//       if (zone_id !== 'remove') {
//         for (i = 0, len = zones.length; i < len; i++) {
//           if (zones[i].id === zone_id) {
//             zone_name = zones[i].zone_name;
//             break;
//           }
//         }
//       }

//       // Loop through the selected boxes and update //
//       for (i = 0, len = scope.selected.length; i < len; i++) {
//         var box = scope.selected[i];
//         // if (box.metadata === undefined) {
//         //   box.metadata = {};
//         // }
//         box.zone_name = zone_name;
//         box.zone_id = zone_id;
//         updateZone(box);
//       }

//       // Write a message to the screen, yeah //
//       var devices = gettextCatalog.getString('device zones'),
//         selectedLength = scope.selected.length;
//       if (scope.selected.length === 1) {
//         devices = gettextCatalog.getString('device zone');
//       }
//       showToast(gettextCatalog.getPlural(scope.selected.length, '1 device zone', '{{$count}} device zones'));
//       scope.selected = [];
//     };

//     var edit = function(slug) {
//       window.location.href = '/#/locations/' + scope.location.slug + '/boxes/' + slug + '/edit';
//     };

//     var view = function(slug) {
//       window.location.href = '/#/locations/' + scope.location.slug + '/boxes/' + slug;
//     };

//     var updateZone = function(box) {
//       if (box.zone_id === 'remove') {
//         box.zone_id = ''; // Must not be undefined
//       }
//       Box.update({
//         location_id: scope.location.slug,
//         id: box.slug,
//         box: {
//           zone_id: box.zone_id
//         }
//       }).$promise.then(function(res) {
//       }, function(errors) {
//         // showErrors(errors);
//       });
//     };

//     var update = function(box) {
//       Box.update({
//         location_id: scope.location.slug,
//         id: box.slug,
//         box: {
//           description: box.description
//         }
//       }).$promise.then(function(res) {
//         showToast(gettextCatalog.getString('Device description updated.'));
//       }, function(errors) {
//         showErrors(errors);
//       });
//     };

//     var assignClientCounts = function(data) {
//       scope.total_online = 0;
//       for (var i = 0, len = data.meta.length; i < len; i++) {
//         var metaObject = data.meta[i];
//         for (var j = 0, leng = scope.boxes.length; j < leng; j++) {
//           if (scope.boxes[j].calledstationid === metaObject.ap_mac) {
//             scope.boxes[j].clients_online = metaObject.clients;
//             scope.total_online += metaObject.clients;
//           }
//         }
//       }
//     };

//     var assignDeviceChannels = function(data) {
//       for (var i = 0, len = data.meta.length; i < len; i++) {
//         var metaObject = data.meta[i];
//         for (var j = 0, leng = scope.boxes.length; j < leng; j++) {
//           if (metaObject.ssids && scope.boxes[j].calledstationid === metaObject.ap_mac) {
//             scope.boxes[j].channel = metaObject.ssids[0].channel;
//           }
//         }
//       }
//     };

//     var boxMetadata = function() {
//       scope.box_macs = '';
//       for (var i = 0, len = scope.boxes.length; i < len; i++) {
//         if (scope.boxes[i].state !== 'offline' && scope.boxes[i].state !== 'new') {
//           scope.box_macs += scope.boxes[i].calledstationid;
//           scope.box_macs += ',';
//         }
//       }
//       scope.box_macs = scope.box_macs.substring(0, scope.box_macs.length-1);
//       Metric.clientstats({
//         type:         'devices.meta',
//         ap_mac:       scope.box_macs,
//         location_id:  scope.boxes[0].location_id
//       }).$promise.then(function(data) {
//         assignClientCounts(data);
//         assignDeviceChannels(data);
//       });
//     };


//     var channel;
//     function loadPusher() {
//       if (scope.pusherLoaded === undefined && typeof client !== 'undefined') {
//         scope.pusherLoaded = true;
//         var pusher = $pusher(client);
//         channel = pusher.subscribe('private-' + attrs.token);
//         console.log('Binding to:', channel.name);
//         for( var i = 0; i < scope.boxes.length; ++i ) {
//           channelBind(i);
//         }
//       }
//     }

//     var channelBind = function(i) {
//       channel.bind('boxes_' + scope.boxes[i].pubsub_token, function(data) {
//         updateBox(data.message);
//       });
//     };

//     var updateBox = function(data) {
//       data = JSON.parse(data);
//       angular.forEach(scope.boxes, function(value, key) {
//         if (parseInt(data.id) === value.id) {
//           var box = scope.boxes[key];
//           box.calledstationid = data.calledstationid;
//           // box.wan_proto       = data.wan_proto;
//           box.description     = data.description;
//           box.last_heartbeat  = data.last_heartbeat;
//           box.state           = data.state;
//           box.wan_ip          = data.wan_ip;
//           scope.boxes[key]    = box;
//           console.log('Updated', box.pubsub_token + ' at ' + new Date().getTime());
//         }
//       });
//     };

//     var init = function() {
//       scope.deferred = $q.defer();
//       Box.query({
//         location_id: scope.location.slug,
//         page: scope.query.page,
//         per:  scope.query.limit,
//         metadata: true
//       }).$promise.then(function(results) {
//         scope.boxes           = results.boxes;
//         scope._links          = results._links;
//         scope.loading         = undefined;
//         boxMetadata();
//         scope.deferred.resolve();
//       }, function(err) {
//         scope.loading = undefined;
//       });
//       return scope.deferred.promise;
//     };

//     // We've remove the pusher notifications since the volume was getting too high
//     var poller;
//     var poll = function() {
//       poller = $timeout(function() {
//         console.log('Refreshing devices');
//         init();
//       }, 30000);
//     };

//     init().then(loadPusher);

//     $rootScope.$on('$routeChangeStart', function (event, next, current) {
//       if (channel) {
//         channel.unbind();
//       }
//       $timeout.cancel(poller);
//     });

//   };
//   return {
//     link: link,
//     scope: {
//       filter: '=',
//       loading: '=',
//       token: '@'
//     },
//     templateUrl: 'components/locations/boxes/_table.html'
//   };

// }]);

app.directive('locationSettings', ['Location', '$location', '$routeParams', '$mdDialog', 'showToast', 'showErrors', 'moment', 'gettextCatalog', function(Location, $location, $routeParams, $mdDialog, showToast, showErrors, moment, gettextCatalog) {

  var controller = function($scope) {
    this.$scope = $scope;

    var slug;

    // User Permissions //
    var allowedUser = function() {
      $scope.allowed = true;
    };

    var id = $routeParams.id;
    var init = function() {
      $scope.loading  = undefined;
      slug = $scope.location.slug; // used to check for location name change
      allowedUser();
    };

    this.update = function (myform) {
      // Doesn't work since we display the form via a template
      // myform.$setPristine();
      Location.update({}, {
        id: $scope.location.slug,
        location: $scope.location
      }, function(data) {
        if (slug !== data.slug) {
          $location.path('/locations/' + data.slug + '/settings');
        }
        showToast(gettextCatalog.getString('Successfully updated location.'));
      }, function(err) {
        showErrors(err);
      });
    };

    this.back = function() {
      window.location.href = '/#/locations/' + slug + '/settings';
    };

    init();

  };

  controller.$inject = ['$scope'];

  return {
    restrict: 'AE',
    scope: {
      loading: '=',
      location: '='
    },
    controller: controller
  };

}]);

app.directive('locationSettingsMain', ['Location', 'SplashIntegration', '$location', '$routeParams', 'moment', '$mdDialog', 'showToast', 'showErrors', 'gettextCatalog', function(Location, SplashIntegration, $location, $routeParams, moment, $mdDialog, showToast, showErrors, gettextCatalog) {

  var link = function( scope, element, attrs, controller ) {

    scope.timezones = moment.tz.names();

    scope.update = function (form) {
      controller.update(form);
    };

    scope.back = function() {
      controller.back();
    };

    scope.destroy = function(ev) {
      var confirm = $mdDialog.confirm()
        .title(gettextCatalog.getString('Are you sure you want to delete this location?'))
        .textContent(gettextCatalog.getString('You cannot delete a location with session data.'))
        .ariaLabel(gettextCatalog.getString('Archive'))
        .targetEvent(ev)
        .ok(gettextCatalog.getString('delete'))
        .cancel(gettextCatalog.getString('Cancel'));
      $mdDialog.show(confirm).then(function() {
        destroyLocation();
      });
    };

    var destroyLocation = function(id) {
      Location.destroy({id: scope.location.id}).$promise.then(function(results) {
        $location.path('/');
        showToast(gettextCatalog.getString('Successfully deleted location.'));
      }, function(err) {
        showErrors(err);
      });
    };

  };

  return {
    link: link,
    templateUrl: 'components/locations/settings/_main.html',
    require: '^locationSettings'
  };

}]);

app.directive('locationSettingsNotifications', ['$timeout', function($timeout) {

  var link = function( scope, element, attrs, controller ) {

    function validateEmail(email) {
      var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }

    scope.update = function (form) {
      var emails = [];
      for (var i = 0, len = scope.ctrl.emails.length; i < len; i++) {
        if (validateEmail(scope.ctrl.emails[i])) {
          emails.push(scope.ctrl.emails[i]);
        }
      }
      scope.location.reports_emails = emails.join(',');
      controller.update(form);
    };

    scope.ctrl = {};
    scope.ctrl.emails = [];

    var populateEmails = function() {
      if (scope.location.reports_emails) {
        var emails = scope.location.reports_emails.split(',');
        for (var i = 0, len = emails.length; i < len; i++) {
          scope.ctrl.emails.push(emails[i]);
        }
      }
    };

    // Prefer to watch atm //
    var timer = $timeout(function() {
      populateEmails();
      $timeout.cancel(timer);
    }, 250);

    scope.back = function() {
      controller.back();
    };

  };

  return {
    link: link,
    templateUrl: 'components/locations/settings/_notifications.html',
    require: '^locationSettings'
  };

}]);

app.directive('locationSettingsSecurity', ['$timeout', '$localStorage', function($timeout, $localStorage) {

  var link = function( scope, element, attrs, controller ) {

    scope.update = function (form) {
      controller.update(form);
    };

    scope.ctrl = {};
    scope.ctrl.levels = [1,2,3];
    if ($localStorage.user) {
      scope.white_label = $localStorage.user.custom;
    }

    scope.back = function() {
      controller.back();
    };

  };

  return {
    link: link,
    templateUrl: 'components/locations/settings/_security.html',
    require: '^locationSettings'
  };

}]);

app.directive('locationSettingsDevices', ['menu', '$timeout', function(menu, $timeout) {

  var link = function( scope, element, attrs, controller ) {

    scope.environments = [{key: 'Beta', value: 'Beta'}, {key: 'Production', value: 'Production'}];

    scope.update = function (form) {
      controller.update(form,scope.location);
    };

    scope.testVsz = function(form) {
      form.$setPristine();
      scope.location.vsg_testing = true;
      scope.location.run_vsg_test = true;
      controller.$scope.update(form,scope.location);
    };

    scope.toggle = function(section) {
      menu.toggleSelectSection(section);
    };

    scope.isOpen = function(section) {
      return menu.isSectionSelected(section);
    };

    scope.back = function() {
      controller.back();
    };

    var timer = $timeout(function() {
      if (scope.location.experimental === true) {
        scope.environments.push({key: 'Experimental', value: 'Experimental' });
      }
      $timeout.cancel(timer);
    }, 250);

  };

  return {
    link: link,
    templateUrl: 'components/locations/settings/_devices.html',
    require: '^locationSettings'
  };

}]);

app.directive('locationSettingsAnalytics', [function() {

  var link = function( scope, element, attrs, controller ) {

    scope.update = function (form) {
      controller.update(form);
    };

    scope.back = function() {
      controller.back();
    };

  };

  return {
    link: link,
    templateUrl: 'components/locations/settings/_analytics.html',
    require: '^locationSettings'
  };

}]);

app.directive('locationSettingsSplash', [function() {

  var link = function( scope, element, attrs, controller ) {

    scope.update = function (form) {
      controller.update(form,scope.location);
    };

    scope.back = function() {
      controller.back();
    };

  };

  return {
    link: link,
    templateUrl: 'components/locations/settings/_splash.html',
    require: '^locationSettings'
  };

}]);

app.directive('locationSettingsMenu', ['Location', '$location', '$routeParams', '$mdDialog', 'showToast', 'showErrors', 'moment', '$pusher', '$rootScope', 'gettextCatalog', 'menu', function(Location, $location, $routeParams, $mdDialog, showToast, showErrors, moment, $pusher, $rootScope, gettextCatalog, menu) {

  var link = function( scope, element, attrs ) {

    // scope.location = { slug: $routeParams.id };

    // User Permissions //
    var createMenu = function() {

      scope.menu = [];

      scope.menu.push({
        name: gettextCatalog.getString('Notifications'),
        type: 'notifications',
        icon: 'add_alert'
      });

      scope.menu.push({
        name: gettextCatalog.getString('Devices'),
        type: 'devices',
        icon: 'router'
      });

      scope.menu.push({
        name: gettextCatalog.getString('Security'),
        type: 'security',
        icon: 'security'
      });

      scope.menu.push({
        name: gettextCatalog.getString('Splash'),
        type: 'splash',
        icon: 'web'
      });

      scope.menu.push({
        name: gettextCatalog.getString('Analytics'),
        type: 'analytics',
        icon: 'trending_up'
      });

      scope.menu.push({
        name: gettextCatalog.getString('Transfer'),
        type: 'transfer',
        icon: 'transform'
      });

      scope.menu.push({
        name: scope.location.archived ? gettextCatalog.getString('Unarchive') : gettextCatalog.getString('Archive'),
        type: 'archive',
        icon: 'archive'
      });

      scope.menu.push({
        name: gettextCatalog.getString('Delete'),
        type: 'delete',
        icon: 'delete_forever'
      });
    };

    scope.action = function(type) {
      switch(type) {
        case 'delete':
          scope.destroy();
          break;
        case 'transfer':
          transfer();
          break;
        case 'archive':
          archive();
          break;
        case 'security':
          security();
          break;
        case 'notifications':
          notifications();
          break;
        case 'devices':
          devices();
          break;
        case 'splash':
          splash();
          break;
        case 'analytics':
          analytics();
          break;
      }
    };

    var archive = function(ev) {
      var msg, msg2;
      if (scope.location.archived) {
        msg = gettextCatalog.getString('Are you sure you want to restore this location');
        msg2 = gettextCatalog.getString('Your splash pages and networks will be activated.');
      } else {
        msg = gettextCatalog.getString('Are you sure you want to archive this location');
        msg2 = gettextCatalog.getString('This will prevent users from logging in.');
      }
      var confirm = $mdDialog.confirm()
        .title(msg)
        .textContent(msg2)
        .ariaLabel(gettextCatalog.getString('Archive'))
        .targetEvent(ev)
        .ok(gettextCatalog.getString('CONFIRM'))
        .cancel(gettextCatalog.getString('Cancel'));
      $mdDialog.show(confirm).then(function() {
        updateLocation(scope.location.archived);
      });
    };

    var updateLocation = function(state) {
      var s = 'active';
      if (state === false) {
        s = 'archived';
      }
      Location.update({}, {
        id: scope.location.slug,
        location: {
          state: s
        }
      }).$promise.then(function(results) {
        scope.location.archived = true;
        var msg;
        if (s === 'active') {
          menu.archived = false;
          msg = gettextCatalog.getString('Location successfully restored.');
          menu.locationStateIcon = undefined;
        } else {
          menu.archived = true;
          msg = gettextCatalog.getString('Location successfully archived.');
          menu.locationStateIcon = 'archived';
        }
        showToast(msg);
      }, function(err) {
        showErrors(err);
      });
    };

    // var unArchiveLocation = function() {
    //   Location.unarchive({id: scope.location.slug}).$promise.then(function(results) {
    //     scope.location.archived = false;
    //     menu.archived = undefined;
    //     showToast(gettextCatalog.getString('Location successfully restored.'));
    //   }, function(err) {
    //     showErrors(err);
    //   });
    // };

    var transfer = function() {
      $mdDialog.show({
        templateUrl: 'components/locations/settings/_transfer.html',
        clickOutsideToClose: true,
        parent: angular.element(document.body),
        controller: TransferController,
      });
    };

    var TransferController = function($scope){
      $scope.transfer = function(account_id) {
        $mdDialog.cancel();
        transferLocation(account_id);
      };
      $scope.close = function() {
        $mdDialog.cancel();
      };
    };
    TransferController.$inject = ['$scope'];

    var transferLocation = function(accountId) {
      Location.transfer({accountId: accountId, id: scope.location.slug}).$promise.then(function(results) {
        $location.path('/').search('tfer=true');
        showToast(gettextCatalog.getString('Location successfully transferred.'));
      }, function(err) {
        showErrors(err);
      });
    };

    var security = function() {
      window.location.href = '/#/locations/' + scope.location.slug + '/settings/security';
    };

    var notifications = function() {
      window.location.href = '/#/locations/' + scope.location.slug + '/settings/notifications';
    };

    var devices = function() {
      window.location.href = '/#/locations/' + scope.location.slug + '/settings/devices';
    };

    var splash = function() {
      window.location.href = '/#/locations/' + scope.location.slug + '/settings/splash';
    };

    var analytics = function() {
      window.location.href = '/#/locations/' + scope.location.slug + '/settings/analytics';
    };

    // user permissions //
    scope.$watch('location',function(nv){
      if (nv !== undefined) {
        createMenu();
      }
    });

  };

  return {
    link: link,
    scope: {
      location: '='
    },
    templateUrl: 'components/locations/settings/_settings_menu.html',
  };

}]);


// app.directive('appStatus', ['statusPage', 'gettextCatalog', function(statusPage, gettextCatalog) {

//   var link = function(scope) {

//     var init = function() {

//       var id, slug;
//       statusPage.get({}, function(data) {
//         scope.status = data;
//         if (scope.status.incidents.length === 0) {
//           if (scope.status.status.indicator === 'none') {
//             scope.color = 'rgb(76,175,80)';
//             scope.incidents = gettextCatalog.getString('All systems operational.');
//           } else {
//             scope.color = 'rgb(255,152,0)';
//             scope.incidents = gettextCatalog.getString('Partially degraded service.');
//           }
//         } else {
//           scope.color = 'rgb(244,67,54)';
//         }
//         scope.url   = scope.status.incidents.length === 0 ? 'http://status.ctapp.io' : scope.status.incidents[0].shortlink;
//       });
//     };

//     init();

//   };

//   return {
//     scope: {
//       loading: '=',
//     },
//     link: link,
//     templateUrl: 'components/locations/show/_app_status.html',
//   };

// }]);

// app.directive('favourites', ['Location', '$location', function(Location, $location) {

//   var link = function(scope) {

//     scope.loading = true;

//     scope.all = function() {
//       $location.search({pinned: true});
//     };

//     var init = function() {
//       Location.favourites({per: 5}).$promise.then(function(results) {
//         scope.locations = results.locations;
//         scope.loading = undefined;
//       }, function() {
//         scope.loading = undefined;
//       });
//     };

//     init();

//   };

//   return {
//     scope: {
//     },
//     link: link,
//     templateUrl: 'components/locations/show/_favourites.html',
//   };

// }]);

// app.directive('favouritesExtended', ['Location', '$location', '$routeParams', 'showToast', 'showErrors', '$mdDialog', 'gettextCatalog', 'pagination_labels', function(Location, $location, $routeParams, showToast, showErrors, $mdDialog, gettextCatalog, pagination_labels) {

//   var link = function(scope) {

//     scope.loading = true;

//     scope.options = {
//       boundaryLinks: false,
//       largeEditDialog: false,
//       pageSelector: false,
//       rowSelection: false
//     };

//     var createMenu = function() {
//       scope.menu = [];
//       scope.menu.push({
//         name: gettextCatalog.getString('View'),
//         type: 'view',
//         icon: 'pageview'
//       });

//       scope.menu.push({
//         name: gettextCatalog.getString('Unfavourite'),
//         type: 'remove',
//         icon: 'favorite_border'
//       });

//     };

//     scope.pagination_labels = pagination_labels;
//     scope.query = {
//       order:      'updated_at',
//       limit:      $routeParams.per || 25,
//       page:       $routeParams.page || 1,
//       options:    [5,10,25,50,100],
//       direction:  $routeParams.direction || 'desc'
//     };

//     scope.action = function(location,type) {
//       switch(type) {
//         case 'view':
//           view(location.slug);
//         break;
//       case 'remove':
//         remove(location.slug);
//       break;
//       }
//     };

//     scope.onPaginate = function (page, limit) {
//       scope.query.page = page;
//       scope.query.limit = limit;
//       scope.updatePage();
//     };

//     var init = function() {
//       Location.favourites({}).$promise.then(function(results) {
//         scope.locations = results.locations;
//         scope._links = results._links;
//         createMenu();
//         scope.loading = undefined;
//       }, function() {
//         scope.loading = undefined;
//       });
//     };

//     var remove = function(id) {
//       var confirm = $mdDialog.confirm()
//         .title(gettextCatalog.getString('Remove From Favourites?'))
//         .textContent(gettextCatalog.getString('Are you sure you want to remove this location?'))
//         .ariaLabel(gettextCatalog.getString('Remove Location'))
//         .ok(gettextCatalog.getString('Ok'))
//         .cancel(gettextCatalog.getString('Cancel'));
//       $mdDialog.show(confirm).then(function() {
//         removeFav(id);
//       });
//     };

//     var removeFav = function(id) {
//       updateLocation(id);
//     };

//     function updateLocation(id) {
//       Location.update({}, {
//         id: id,
//         location: {
//           favourite: false
//         }
//       }).$promise.then(function(results) {
//         removeFromList(id);
//       }, function(err) {
//         showErrors(err);
//       });
//     }

//     var removeFromList = function(id) {
//       for (var i = 0, len = scope.locations.length; i < len; i++) {
//         if (scope.locations[i].slug === id) {
//           scope.locations.splice(i, 1);
//           showToast(gettextCatalog.getString('Location removed from favourites.'));
//           break;
//         }
//       }
//     };

//     scope.back = function() {
//       $location.search({});
//     };

//     var view = function(id) {
//       window.location.href = '/#/locations/' + id;
//     };

//     init();

//   };

//   return {
//     scope: {
//       loading: '='
//     },
//     link: link,
//     templateUrl: 'components/locations/index/_favourites.html'
//   };

// }]);

// app.directive('dashInventory', ['Report', 'Auth', function(Report, Auth) {

//   var link = function(scope) {

//     scope.loading = true;
//     scope.stats = { new: 0, active: 0 };

//     scope.user = Auth.currentUser();

//     var init = function() {
//       Report.inventory({}).$promise.then(function(results) {
//         createStats(results.stats);
//         scope.loading     = undefined;
//       }, function(err) {
//         scope.loading = undefined;
//       });
//     };

//     var loopStats = function(i, stats) {
//       Object.keys(stats[i]).forEach(function (key) {
//         if (key === 'new') {
//           scope.stats.new = stats[i][key];
//         } else if (key === 'active') {
//           scope.stats.active = stats[i][key];
//         }
//       });
//     };

//     var createStats = function(stats) {
//       for(var i = 0; i < stats.length; i++) {
//         loopStats(i, stats);
//       }
//     };

//     init();

//   };

//   return {
//     scope: {
//     },
//     link: link,
//     templateUrl: 'components/locations/show/_inventory.html',
//   };

// }]);

// app.directive('homeStatCards', ['Box', 'Report', function (Box, Report) {

//   var link = function(scope,element,attrs) {

//     scope.loading = true;

//     var init = function() {

//       Report.dashboard({homeStatCards: true, v: 2}).$promise.then(function(results) {
//         scope.stats     = results.stats;
//         process();
//         scope.loading   = undefined;
//       });

//     };

//     function process () {
//       angular.forEach(scope.stats.boxes.states, function(b) {
//         if (b.state === 'offline') {
//           scope.offline = b.total;
//         } else if (b.state === 'online') {
//           scope.online = b.total;
//         } else if (b.state === 'online') {
//           scope.online = b.total;
//         } else if (b.state === 'splash_only') {
//           scope.splash_only = b.total;
//         }
//       });
//     }

//     init();

//   };

//   return {
//     link: link,
//     scope: {
//       locations: '@'
//     },
//     templateUrl: 'components/locations/show/_home_stat_cards.html'
//   };

// }]);

app.directive('integrationSelect', ['Location', '$routeParams', '$location', '$http', '$compile', '$mdDialog', 'showToast', 'showErrors', 'gettextCatalog', function(Location, $routeParams, $location, $http, $compile, $mdDialog, showToast, showErrors, gettextCatalog) {

  var link = function(scope, element, attrs) {

    scope.location = {slug: $routeParams.id};
    scope.save = function(type) {
      $location.path($routeParams.id + '/integration/' + type + '/auth');
      // $location.search({gs: true});
    };


    scope.setUnifi = function() {
      type = 'unifi';
      scope.save();
    }

    var locationName = function() {
      Location.get({id: scope.location.slug}, function(data) {
        scope.location = data;
      }, function(err){
        console.log(err);
      });
    };

    locationName();

  };

  return {
    link: link,
    scope: {
    },
    templateUrl: 'components/locations/new/_create_integration.html'
  };

}]);

app.directive('integrations', ['Location', '$routeParams', '$location', '$http', '$compile', '$mdDialog', 'showToast', 'showErrors', 'SplashIntegration', '$q', function(Location, $routeParams, $location, $http, $compile, $mdDialog, showToast, showErrors, SplashIntegration, $q) {

  var link = function(scope, element, attrs) {

    scope.integSelected = function() {
      scope.integration.host = undefined;
      scope.integration.username = undefined;
      scope.integration.password = undefined;
    };

    scope.addBoxes = function() {
      SplashIntegration.update({},{
        id: scope.integration.id,
        location_id: $routeParams.id,
        splash_integration: {
          action: 'import_boxes'
        }
      }, function(results) {
        if (results.failed) {
        }
        showToast('Successfully imported ' + results.success + ' box(es)');
      }, function(error) {
        showErrors(error);
      });
    };

  };

  var controller = function($scope) {

    this.scope = $scope;

    this.fetch = function() {
      var deferred = $q.defer();
      SplashIntegration.query({location_id: $routeParams.id}).$promise.then(function(results) {
        deferred.resolve(results);
      });
      return deferred.promise;
    };

    this.save = function(integration) {
      var deferred = $q.defer();
      SplashIntegration.create({}, {
        location_id: $routeParams.id,
        splash_integration: integration
      }).$promise.then(function(results) {
        showToast('Successfully validated integration');
        deferred.resolve(results);
      }, function(error) {
        deferred.reject();
        showErrors(error);
      });

      return deferred.promise;
    }

    this.update = function(integration) {
      var deferred = $q.defer();
      SplashIntegration.update({}, {
        id: integration.id,
        location_id: $routeParams.id,
        splash_integration: integration
      }).$promise.then(function(results) {
        console.log(results)
        showToast('Successfully updated and validated integration');
        deferred.resolve(results);
      }, function(error) {
        showErrors(error);
        deferred.reject();
        console.log(error);
      });
      return deferred.promise;
    }

    this.fetchSites = function(integration) {
      var deferred = $q.defer();
      SplashIntegration.integration_action({
        id: integration.id,
        location_id: $routeParams.id,
        action: 'fetch_settings'
      }).$promise.then(function(results) {
        deferred.resolve(results);
      });
      return deferred.promise;
    };

  };

  return {
    controller: controller
  };

}]);

app.directive('unifiAuth', ['Location', '$routeParams', '$location', '$http', '$compile', '$mdDialog', 'showToast', 'showErrors', 'gettextCatalog', function(Location, $routeParams, $location, $http, $compile, $mdDialog, showToast, showErrors, gettextCatalog) {

  var link = function(scope, element, attrs, controller) {

    scope.location = {slug: $routeParams.id};

    var locationName = function() {
      Location.get({id: scope.location.slug}, function(data) {
        scope.location = data;
      }, function(err){
        console.log(err);
      });
    };

    var create = function() {
      controller.save(scope.integration).then(function(results) {
        $location.path($routeParams.id + '/integration/unifi/setup');
      });
    };

    var update = function() {
      controller.update(scope.integration).then(function(results) {
        $location.path($routeParams.id + '/integration/unifi/setup');
      });
    }

    scope.save = function(form) {

      scope.myForm.$setPristine();

      scope.integration.action = 'validate'
      if (scope.integration.new_record) {
        create();
      } else {
        update();
      }
    };

    controller.fetch().then(function(integration) {
      scope.integration = integration;
      scope.integration.type = 'unifi';
    }, function(err) { console.log(err); })

    locationName();

  };

  return {
    require: '^integrations',
    link: link,
    scope: {},
    templateUrl: 'components/locations/new/_unifi_auth.html'
  };

}]);

app.directive('unifiSetup', ['Location', '$routeParams', '$location', '$http', '$compile', '$mdDialog', 'showToast', 'showErrors', 'gettextCatalog', 'SplashIntegration', function(Location, $routeParams, $location, $http, $compile, $mdDialog, showToast, showErrors, gettextCatalog, SplashIntegration) {

  var link = function(scope, element, attrs, controller) {

    scope.location = {slug: $routeParams.id};

    var locationName = function() {
      Location.get({id: scope.location.slug}, function(data) {
        scope.location = data;
      }, function(err){
        console.log(err);
      });
    };

    scope.save = function(form,site,ssid) {
      scope.myForm.$setPristine();
      site = JSON.parse(site);
      SplashIntegration.update({},{
        id: scope.integration.id,
        location_id: $routeParams.id,
        splash_integration: {
          metadata: {
            unifi_site_name:  site.name,
            unifi_site_id:    site.id,
            ssid:             ssid
          },
          action: 'create_setup'
        }
      }, function(results) {
        showToast('Successfully created UniFi setup');
        console.log(results)
        // @zak create the landing page
        $location.path($routeParams.id + '/integration/completed');
      }, function(error) {
        showErrors(error);
      });
    };

    var fetchSites = function() {
      controller.fetchSites(scope.integration).then(function(sites) {
        scope.unifi_sites = sites;
      });
    };

    controller.fetch().then(function(integration) {
      if(integration.new_record) {
        $location.path($routeParams.id + '/integration/unifi/auth');
      } else {
        scope.integration = integration;
        fetchSites();
      }
    })

    locationName();

  };

  return {
    require: '^integrations',
    link: link,
    scope: {},
    templateUrl: 'components/locations/new/_unifi_setup.html'
  };

}]);

app.directive('vszAuth', ['Location', '$routeParams', '$location', '$http', '$compile', '$mdDialog', 'showToast', 'showErrors', 'gettextCatalog', function(Location, $routeParams, $location, $http, $compile, $mdDialog, showToast, showErrors, gettextCatalog) {

  var link = function(scope, element, attrs, controller) {

    scope.location = {slug: $routeParams.id};

    var locationName = function() {
      Location.get({id: scope.location.slug}, function(data) {
        scope.location = data;
      }, function(err){
        console.log(err);
      });
    };

    var create = function() {
      controller.save(scope.integration).then(function(results) {
        $location.path($routeParams.id + '/integration/vsz/setup');
      });
    };

    var update = function() {
      controller.update(scope.integration).then(function(results) {
        $location.path($routeParams.id + '/integration/vsz/setup');
      });
    }

    scope.save = function(form) {

      scope.myForm.$setPristine();

      scope.integration.action = 'validate'
      if (scope.integration.new_record) {
        create();
      } else {
        update();
      }
    };

    controller.fetch().then(function(integration) {
      console.log(integration);
      scope.integration = integration;
      scope.integration.type = 'vsz';
    }, function(err) { console.log(err); })

    locationName();

  };

  return {
    require: '^integrations',
    link: link,
    scope: {
    },
    templateUrl: 'components/locations/new/_vsz_auth.html'
  };

}]);

app.directive('vszSetup', ['Location', '$routeParams', '$location', '$http', '$compile', '$mdDialog', 'showToast', 'showErrors', 'gettextCatalog', 'SplashIntegration', function(Location, $routeParams, $location, $http, $compile, $mdDialog, showToast, showErrors, gettextCatalog, SplashIntegration) {

  var link = function(scope, element, attrs, controller) {

    scope.location = {slug: $routeParams.id};

    var locationName = function() {
      Location.get({id: scope.location.slug}, function(data) {
        scope.location = data;
      }, function(err){
        console.log(err);
      });
    };

    scope.save = function(form,site,ssid) {
      scope.myForm.$setPristine();
      site = JSON.parse(site);
      SplashIntegration.update({},{
        id: scope.integration.id,
        location_id: $routeParams.id,
        splash_integration: {
          metadata: {
            vsz_zone_name:  site.name,
            zoneUUID:       site.id,
            ssid:           ssid
          },
          action: 'create_setup'
        }
      }, function(results) {
        showToast('Successfully created Ruckus VSZ setup');
        console.log(results)
        // @zak create the landing page
        $location.path($routeParams.id + '/integration/completed');
      }, function(error) {
        showErrors(error);
      });
    };

    var fetchSites = function() {
      controller.fetchSites(scope.integration).then(function(sites) {
        scope.vsz_zones = sites;
      });
    };

    controller.fetch().then(function(integration) {
      if(integration.new_record) {
        $location.path($routeParams.id + '/integration/vsz/auth');
      } else {
        scope.integration = integration;
        fetchSites();
      }
    })

    locationName();

  };

  return {
    require: '^integrations',
    link: link,
    scope: {
    },
    templateUrl: 'components/locations/new/_vsz_setup.html'
  };

}]);

app.directive('merakiAuth', ['Location', '$routeParams', '$location', '$http', '$compile', '$mdDialog', 'showToast', 'showErrors', 'gettextCatalog', function(Location, $routeParams, $location, $http, $compile, $mdDialog, showToast, showErrors, gettextCatalog) {

  var link = function(scope, element, attrs, controller) {

    scope.location = {slug: $routeParams.id};

    var locationName = function() {
      Location.get({id: scope.location.slug}, function(data) {
        scope.location = data;
      }, function(err){
        console.log(err);
      });
    };

    var create = function() {
      controller.save(scope.integration).then(function(results) {
        $location.path($routeParams.id + '/integration/meraki/setup');
      });
    };

    var update = function() {
      controller.update(scope.integration).then(function(results) {
        $location.path($routeParams.id + '/integration/meraki/setup');
      });
    };

    scope.save = function(form) {

      scope.myForm.$setPristine();

      scope.integration.action = 'validate';
      if (scope.integration.new_record) {
        create();
      } else {
        update();
      }
    };

    controller.fetch().then(function(integration) {
      console.log(integration);
      scope.integration = integration;
      scope.integration.type = 'meraki';
    }, function(err) { console.log(err); });

    locationName();

  };

  return {
    require: '^integrations',
    link: link,
    scope: {
    },
    templateUrl: 'components/locations/new/_meraki_auth.html'
  };

}]);

app.directive('merakiSetup', ['Location', '$routeParams', '$location', '$http', '$compile', '$mdDialog', 'showToast', 'showErrors', 'gettextCatalog', 'SplashIntegration', function(Location, $routeParams, $location, $http, $compile, $mdDialog, showToast, showErrors, gettextCatalog, SplashIntegration) {

  var link = function(scope, element, attrs, controller) {

    scope.location = {slug: $routeParams.id};

    var locationName = function() {
      Location.get({id: scope.location.slug}, function(data) {
        scope.location = data;
      }, function(err){
        console.log(err);
      });
    };

    scope.save = function(form,meraki) {
      scope.myForm.$setPristine();
      SplashIntegration.update({},{
        id: scope.integration.id,
        location_id: $routeParams.id,
        splash_integration: {
          metadata: {
            meraki_organization:   meraki.org,
            meraki_network:        meraki.network,
            ssid:                  meraki.ssid
          },
          action: 'create_setup'
        }
      }, function(results) {
        showToast('Successfully created Meraki setup');
        // @zak create the landing page
        $location.path($routeParams.id + '/integration/completed');
      }, function(error) {
        showErrors(error);
      });
    };

    var updateMeraki = function(cb) {
      SplashIntegration.update({}, {
        id: scope.integration.id,
        location_id: $routeParams.id,
        splash_integration: scope.integration
      }).$promise.then(function(results) {
        return cb();
      }, function(error) {
        console.log(error);
        return cb();
      });
    }

    var fetchSites = function() {
      controller.fetchSites(scope.integration).then(function(results) {
        scope.meraki = {};
        scope.integration.metadata = {};
        scope.meraki.ssid = undefined;
        scope.meraki_ssids = [];
        scope.meraki.network = undefined;
        scope.meraki_networks = [];
        scope.meraki_orgs = results;
      });
    };

    var fetchNetworks = function() {
      SplashIntegration.integration_action({
        id: scope.integration.id,
        location_id: $routeParams.id,
        action: 'meraki_networks'
      }).$promise.then(function(results) {
        scope.meraki_networks = results;
        }
      );
    };

    scope.orgSelected = function(org) {
      scope.meraki.ssid = undefined;
      scope.meraki_ssids = [];
      scope.meraki.network = undefined;
      scope.meraki_networks = [];
      scope.integration.metadata.organisation = org;
      updateMeraki(function() {
        fetchNetworks();
      });
    };

    var fetchSsid = function() {
      SplashIntegration.integration_action({
        id: scope.integration.id,
        location_id: $routeParams.id,
        action: 'meraki_ssids'
      }).$promise.then(function(results) {
        scope.meraki_ssids = results;
        }
      );
    };

    scope.netSelected = function(network) {
      scope.meraki.ssid = undefined;
      scope.meraki_ssids = [];
      scope.integration.metadata.network = network;
      updateMeraki(function() {
        fetchSsid();
      });
    };

    controller.fetch().then(function(integration) {
      if(integration.new_record) {
        $location.path($routeParams.id + '/integration/meraki/auth');
      } else {
        scope.integration = integration;
        fetchSites();
      }
    });

    locationName();

  };

  return {
    require: '^integrations',
    link: link,
    scope: {
    },
    templateUrl: 'components/locations/new/_meraki_setup.html'
  };

}]);

app.directive('gettingStarted', ['Location', '$routeParams', '$location', '$http', '$compile', '$mdDialog', 'showToast', 'showErrors', 'gettextCatalog', 'SplashIntegration', function(Location, $routeParams, $location, $http, $compile, $mdDialog, showToast, showErrors, gettextCatalog, SplashIntegration) {

  var link = function(scope, element, attrs, controller) {
    scope.visitSplash = function(paid) {
      $location.path('/' + scope.location.slug + '/splash_pages' + (paid ? '' : '/guide'));
    };
  };

  return {
    link: link,
    templateUrl: 'components/locations/welcome/_index.html'
  };

}]);

app.directive('getWithThePlan', ['Location', '$routeParams', '$location', '$http', '$compile', '$mdDialog', 'showToast', 'showErrors', 'gettextCatalog', function(Location, $routeParams, $location, $http, $compile, $mdDialog, showToast, showErrors, gettextCatalog) {

  var link = function(scope, element, attrs, controller) {

    scope.signUp = function(ev) {
      $mdDialog.show({
        controller: DialogController,
        templateUrl: 'components/locations/_signup.tmpl.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose:true
      })
        .then(function(answer) {
          $scope.status = 'You said the information was "' + answer + '".';
        }, function() {
          $scope.status = 'You cancelled the dialog.';
        });
    };

    function DialogController($scope, $mdDialog) {
      $scope.selectedIndex = 0;

      $scope.hide = function() {
        $mdDialog.hide();
      };

      $scope.cancel = function() {
        $mdDialog.cancel();
      };

      $scope.back = function() {
        if ($scope.selectedIndex > 0) {
          $scope.selectedIndex--;
        }
      };

      $scope.next = function() {
        if ($scope.selectedIndex < 3) {
          $scope.selectedIndex++;
        }
      };

      $scope.pay = function() {
        alert('wohooohoooo!')
      };
    }
  };

  var template =
    '<md-button type="submit" class="md-raised md-primary" ng-click="signUp()">' +
    'Sign-up now' +
    '</md-button>';


  return {
    link: link,
    scope: {
      message: '@'
    },
    template: template
  };
}]);

app.directive('integrationComplete', ['Location', '$routeParams', '$location', '$http', '$compile', '$mdDialog', 'showToast', 'showErrors', 'gettextCatalog', function(Location, $routeParams, $location, $http, $compile, $mdDialog, showToast, showErrors, gettextCatalog) {

  var link = function(scope, element, attrs, controller) {

    var locationName = function() {
      Location.get({id: scope.location.slug}, function(data) {
        scope.location = data;
      }, function(err){
        console.log(err);
      });
    };

    var create = function() {
      controller.save(scope.integration).then(function(results) {
        $location.path($routeParams.id + '/integration/meraki/setup');
      });
    };

    var update = function() {
      controller.update(scope.integration).then(function(results) {
        $location.path($routeParams.id + '/integration/meraki/setup');
      });
    };

    scope.save = function(form) {
      scope.myForm.$setPristine();
      scope.integration.action = 'validate';
      if (scope.integration.new_record) {
        create();
      } else {
        update();
      }
    };

    controller.fetch().then(function(integration) {
      console.log(integration);
      scope.integration = integration;
      scope.integration.type = 'meraki';
    }, function(err) { console.log(err); });
  };

  return {
    require: '^integrations',
    link: link,
    scope: {
    },
    templateUrl: 'components/locations/new/_integration_complete.html'
  };
}]);
