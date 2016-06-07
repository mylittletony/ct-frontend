'use strict';

var app = angular.module('myApp.sessions.directives', []);

app.directive('sessionsList', ['Session', '$routeParams', '$location', 'Location', function(Session,$routeParams,$location,Location) {

  var link = function( scope, element, attrs ) {

    scope.loading       = true;
    scope.username      = $routeParams.username;
    scope.page          = $routeParams.page;
    scope.start         = $routeParams.start;
    scope.end           = $routeParams.end;
    scope.location_id   = $routeParams.location_id;
    scope.location_name = $routeParams.location_name;
    scope.query         = $routeParams.q;

    scope.init = function() {
      var params = {page: scope.page, username: scope.username, start: scope.start, end: scope.end, location_id: scope.location_id, q: scope.query };
      Session.query(params).$promise.then(function(results) {
        scope.sessions    = results.sessions;
        scope._stats      = results._stats;
        scope.predicate   = '-starttime';
        scope._links      = results._links;
        scope.start       = scope.start || results._stats.start;
        scope.end         = scope.end || results._stats.end;
        scope.loading     = undefined;
        scope.rangeFilter = undefined;
        scope.searching   = undefined;
      }, function(err) {
        scope.loading = undefined;
      });
    };

    scope.filterClient = function(mac) {
      scope.query = mac;
      scope.updatePage();
    };

    scope.filterUser = function(username) {
      scope.username = username;
      scope.updatePage();
    };

    scope.updatePage = function(page) {
      scope.searching       = true;
      var hash              = {};
      scope.page            = scope._links.current_page;
      hash.q                = scope.query;
      hash.username         = scope.username;
      hash.start            = scope.start;
      hash.end              = scope.end;
      hash.page             = scope.page;
      hash.location_id      = scope.location_id;
      hash.location_name    = scope.location_name;
      scope.start           = hash.start;
      scope.end             = hash.end;

      $location.search(hash);
      scope.init();
    };

    function appendSearch () {
      var hash = $location.search();
      hash.q = undefined;
      $location.search(hash);
      scope.init();
    }

    scope.clearQuery = function() {
      scope.query = undefined;
      scope.searching_ct = undefined;
      appendSearch();
    };

    scope.initSearch = function() {
      var hash = $location.search();
      scope.searching_ct = true;
      hash.q = scope.query;
      $location.search(hash);
      scope.init();
    };

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
      scope.location_id     = item.id;
      scope.location_name   = item.location_name;
      scope.locationSelect  = undefined;
      scope.updatePage();
    };

    scope.clearLocations = function() {
      scope.location_id   = undefined;
      scope.location_name = undefined;
      scope.updatePage();
    };

    scope.init();
  };

  return {
    scope: {
      username: '@',
    },
    link: link,
    templateUrl: 'components/reports/sessions/_index.html'
  };

}]);

app.directive('sessionsOnline', ['Session', '$routeParams', '$location', function(Session,$routeParams,$location) {

  var link = function( scope, element, attrs ) {

    scope.loading       = true;
    scope.page          = $routeParams.page;

    scope.init = function() {
      var params = {page: scope.page, online: true };
      Session.query(params).$promise.then(function(results) {
        if (results._links) { 
          scope.active    = results._links.total_entries || 0;
        } else {
          scope.active = 0
        }
        scope.online    = results.online;
        scope.predicate = '-acctstarttime';
        scope._links    = results._links;
        scope.loading   = undefined;
      });
    };

    scope.updatePage = function(page) {
      var hash          = {};
      scope.page        = scope._links.current_page;
      hash.page         = scope.page;

      $location.search(hash);
      scope.init();
    };

    scope.init();
  };

  return {
    link: link,
    scope: {
      active: '='
    },
    template:
      '<div class="row">'+
        '<div class="small-12 columns">'+
          '<div ng-show=\'loading\'>' +
          '<p>Loading...</p>'+
          '</div>'+
          '<div ng-hide=\'loading\'>' +
            '<div class="row">'+
              '<div class="small-12 medium-6 columns">'+
                '<input type="text" ng-model="query" placeholder="I\'m looking for..."><p></p>'+
                '<p><a ng-if="query || q" ng-click="clearQuery()"><small>Clear search...</small></a></p>'+
              '</div>'+
            '</div>'+
            '<div class=\'row\'>'+
              '<div class=\'small-12 columns\'>'+
                '<hr>'+
                '<div ng-show=\'online.length\'>'+
                  '<table>'+
                    '<tr>'+
                      '<th><a href=\'\' ng-click=\'predicate = "client_mac"; reverse=!reverse\' >Client Mac</a></th>'+
                      '<th><a href=\'\' ng-click=\'predicate = "ap_mac"; reverse=!reverse\' class=\'show-for-medium-up\'>AP Mac</a></th>'+
                      '<th><a href=\'\' ng-click=\'predicate = "data_activated"; reverse=!reverse\' >Session start</a></th>'+
                      '<th class=\'show-for-medium-up\'><a href=\'\' ng-click=\'predicate = "download"; reverse=!reverse\' >Data</a></th>'+
                    '</tr>'+
                    '<tr ng-repeat=\'session in filtered = (online | filter:query | orderBy:predicate:reverse)\'>'+
                      '<td ng-show=\'session.client_mac\'>'+
                        '{{ session.client_mac }}<br>'+
                        '<small class=\'text-muted\'>{{ session.ipaddr }}</small>'+
                      '</td>'+
                      '<td class=\'show-for-medium-up\'>{{ session.ap_mac }}</td>'+
                      '<td>{{ session.acctstarttime | humanTime }}<br>'+
                        '<span class=\'text-muted\' ng-if=\'session.stoptime != 0\'><small>{{ session.stoptime | humanTime }}</small></span>'+
                      '</td>'+
                      '<td class=\'show-for-medium-up\'>'+
                        '<span ng-show=\'session.download\'>{{ session.download | humanData }}<i class="fa fa-arrow-down"></i></span><br>'+
                        '<small ng-show=\'session.upload\' class=\'text-muted\'>{{ session.upload | humanData }}<i class="fa fa-arrow-up"></i></small>'+
                      '</td>'+
                    '</tr>'+
                  '</table>'+
                  '<span ng-show="_links.total_pages > 1">'+
                    '<pagination ng-click="updatePage()" total-items="_links.total_entries" page="_links.current_page" max-size="5" class="pagination-sm" boundary-links="false" rotate="false" num-pages="_links.total_pages" items-per-page="100"></pagination>'+
                  '</span>'+
                '</div>'+
                '<div ng-hide=\'online.length\'>'+
                  '<p>No splash clients online</p>'+
                '</div>'+
              '</div>'+
            '</div>'+
          '</div>'+
        '</div>'+
      '</div>'
  };

}]);
