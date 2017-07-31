'use strict';

var app = angular.module('myApp.logs.directives', []);

app.directive('logging', ['Logs', 'Location', 'Box', '$routeParams', 'gettextCatalog', 'pagination_labels', '$pusher', '$rootScope', '$location', function(Logs, Location, Box, $routeParams, gettextCatalog, pagination_labels, $pusher, $rootScope, $location) {

  var link = function(scope,element,attrs,controller) {

    scope.loading  = true;
    var ap_mac = $routeParams.ap_mac;

    scope.pagination_labels = pagination_labels;
    scope.query = {
      // order:   '-timestamp',
      query:   $routeParams.q,
      limit:   $routeParams.per,
      page:    $routeParams.page || 1,
      options: [5,10,25,50,100],
    };

    var boxes = {};
    var location;

    var fetchBoxes = function() {
      Box.get({location_id: $routeParams.id}).$promise.then(function(results) {
        for (var i = 0, len = results.boxes.length; i < len; i++) {
          boxes[results.boxes[i].calledstationid] = results.boxes[i].description;
        }
      });
    };

    var setApNames = function() {
      for (var i = 0, len = scope.logs.length; i < len; i++) {
        scope.logs[i].ap_name = boxes[scope.logs[i].ap_mac];
      }
    };

    // scope.onPaginate = function (page, limit) {
    //   scope.query.page = page;
    //   scope.query.limit = limit;
    //   updatePage();
    // };

    var updatePage = function(page) {
      var hash  = {};
      hash.page = scope.query.page;
      hash.per  = scope.query.limit;
      hash.q    = scope.query.query;
      $location.search(hash);
    };

    var start_time = $routeParams.start;
    var end_time = $routeParams.end;

    if (!start_time) {
      start_time = Math.round((new Date().getTime() - 60*60*1000) / 1000);
    }

    if (!end_time) {
      end_time = Math.round((new Date().getTime()) / 1000);
    }

    var getLogs = function() {
      Logs.query({
        location_id: scope.location.id,
        ap_mac: ap_mac,
        page: scope.query.page,
        per: scope.query.limit,
        start_time: start_time,
        end_time: end_time,
        q: scope.query.query
      }).$promise.then(function(res) {
        scope.logs = res.data;
        setApNames()
        // scope._links = res._links;
        scope.loading = undefined;
      }, function() {
        scope.loading = undefined;
      });

    };

    var init = function() {
      Location.get({id: $routeParams.id}, function(data) {
        scope.location = data;
        fetchBoxes();
        getLogs();
      }, function(err){
        console.log(err);
      });
    };

    init();
  };

  return {
    link: link,
    scope: {
      loading: '='
    },
    templateUrl: 'components/locations/logging/_index.html'
  };

}]);

