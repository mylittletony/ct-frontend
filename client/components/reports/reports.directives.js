'use strict';

var app = angular.module('myApp.reports.directives', []);

app.directive('createReport', ['Report', '$modal', function(Report, $modal) {

  var link = function( scope, element, attrs ) {

    scope.create = function() {
      scope.errors = undefined;
      scope.report = { type: attrs.type };
      scope.openModal();
    };

    scope.createReport = function() {
      scope.loading = true;
      Report.create({report: scope.report}).$promise.then(function (res) {
        scope.loading = undefined;
        scope.notifications = 'Report Created Successfully';
      }, function(err) {
        scope.loading = undefined;
        if (err.data && err.data.message) {
          scope.errors = err.data.message[0];
        }
      });
    };

    scope.openModal = function () {
      scope.modalInstance = $modal.open({
        size: 'md',
        scope: scope,
        require: '^payloadsBulk',
        resolve: {
          items: function () {
            return scope;
          }
        },
        template:
          '<div>'+
          '<div class="modal-header">'+
          '<h2 class="modal-title">Download your report.</h2>'+
          '<hr>'+
          '</div>'+
          '<div class="modal-body">'+
          '<div ng-show=\'errors\'>'+
          '<p>CSV {{ errors }}</p>'+
          '</div>'+
          '<div ng-show=\'notifications\'>'+
          '<p>Success! Your CSV will be emailed to you shortly.</p>'+
          '<p ng-show=\'notifications\'><a href=\'\' ng-click=\'close()\' class=\'button success\'>Done</a></p>'+
          '</div>'+
          '<div ng-hide=\'errors || notifications\'>'+
          '<form name=\'myForm\' ng-submit=\'createReport()\'>'+
          '<div class=\'row\'>'+
          '<div class=\'row\'>'+
          '<div class=\'small-12 medium-6 columns\'>'+
          '<label for=\'email\'>Email Address</label>'+
          '<input type=\'email\' name=\'email\' placeholder=\'Enter an alternative email\' ng-model=\'reports.email\'>'+
          '<p class="text text-muted small" ng-hide="myForm.$error.email"><b><small>Leave it empty and we\'ll send the csv to you.</small></b></p>'+
          '<p class="text text-danger small" ng-show="myForm.$error.email"><b><small>That\'s not an email.</small></b></p>'+
          '<p><button ng-disabled="myForm.$invalid" class="btn btn-primary" id="update">Download</button></p>'+
          '</div>'+
          '</div>'+
          '</form>'+
          '<p>Download your {{ type }}s as a CSV. It might take a few minutes to prepare. We\'ll email you when it\'s done.</p>'+
          '</div>'+
          '</div>'+
          '<hr>'+
          '<p ng-hide=\'notifications\'><a href=\'\' ng-click=\'close()\' class=\'button alert\'>Cancel</a></p>'+
          '</div>' +
          '</div>'
      });
    };

    scope.close = function() {
      scope.modalInstance.close();
      scope.report = undefined;
    };

  };

  return {
    link: link,
    scope: {
      type: '@'
    },
    template: '<span><a href=\'\' class=\'button success\' ng-click=\'create()\'>Download</a></span>'
  };

}]);


app.directive('analytics', ['Report', '$routeParams', '$location', 'Location', '$q', function(Report, $routeParams,$location,Location, $q) {

  var link = function( scope, element, attrs ) {

    scope.interval        = $routeParams.interval || 'day';
    scope.start           = $routeParams.start;
    scope.end             = $routeParams.end;
    scope.location_id     = $routeParams.location_id;
    scope.location_name   = $routeParams.location_name;
    scope.hc              = $routeParams.hc;

    scope.updatePage = function(item) {
      var hash            = {};
      item                = item || {};
      hash.start          = item.start || scope.start;
      hash.end            = item.end || scope.end;
      hash.location_id    = item.id;
      hash.location_name  = item.location_name;
      hash.q              = item.q;
      hash.hc             = scope.hc;
      scope.start         = hash.start;
      scope.end           = hash.end;
      $location.search(hash);
    };

    scope.clearLocations = function() {
      scope.location_id   = undefined;
      scope.location_name = undefined;
      scope.updatePage();
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

    scope.init = function(params) {
      var deferred = $q.defer();

      Report.get(params).$promise.then(function(results) {
        deferred.resolve(results);
      }, function(err) {
        deferred.reject(err);
      });

      return deferred.promise;

    };

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
      params.interval        = $routeParams.interval || 'day';
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

app.directive('reportsCodes', ['Report', '$routeParams', '$location', 'Location', function(Report, $routeParams, $location, Location) {

  var link = function( scope, element, attrs, controller ) {

    scope.location_name   = $routeParams.location_name;
    scope.loading         = controller.loading;

    var params = {
      codes: true
    };

    scope.init = function() {
      controller.get(params).then(function(results) {

        scope.chart_series  = results.timeline;
        scope._stats        = results._stats;
        scope.info          = results.info;
        scope.start         = results._stats.start;
        scope.end           = results._stats.end;
        scope.loading       = undefined;
      });
    };

    scope.updateRange = function(msg) {
      controller.updateRange(msg);
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
    scope: {},
    require: '^analytics',
    templateUrl: 'components/stats/codes/_index.html'
  };

}]);

app.directive('reportsFinancials', ['Report', '$routeParams', '$location', 'Location', function(Report, $routeParams, $location, Location) {

  var link = function( scope, element, attrs, controller ) {

    scope.location_name   = $routeParams.location_name;
    scope.loading         = controller.loading;

    var params = {
      orders: true,
    };

    scope.init = function() {
      controller.get(params).then(function(results) {

        scope.chart_series  = { 'Gross': results.timeline.gross };
        scope._stats        = results._stats;
        scope.info          = results.info;
        scope.locations     = results.locations;
        scope.start         = results._stats.start;
        scope.end           = results._stats.end;
        scope.loading       = undefined;
      });
    };

    scope.updateRange = function(msg) {
      controller.updateRange(msg);
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
    scope: {},
    require: '^analytics',
    templateUrl: 'components/stats/financials/_index.html'
  };

}]);

app.directive('reportsSocial', ['Report', '$routeParams', '$location', 'Location', function(Report, $routeParams, $location, Location) {

  var link = function( scope, element, attrs, controller ) {

    scope.location_name   = $routeParams.location_name;
    scope.loading         = controller.loading;
    scope.query           = $routeParams.q;
    scope.hideChart       = $routeParams.hc;
    scope.query           = $routeParams.q;
    scope.hideChart       = $routeParams.hc;

    var params = {
      social: true,
      q: scope.query
    };

    scope.init = function() {
      controller.get(params).then(function(results) {
        scope.chart_series  = { 'New Users': results.timeline.uniques } ;
        scope._stats        = results._stats;
        scope.start         = results._stats.start;
        scope.end           = results._stats.end;
        scope.predicate     = '-total';
        scope.genders       = results.info.genders;
        scope.networks      = results.info.networks;
        scope.info          = results.info;
        scope.locations     = results.info.locations;
        scope.loading       = undefined;
      });
    };

    scope.hChart = function() {
      if ( scope.hideChart === undefined || scope.hideChart === false) {
        scope.hideChart = 'true';
      } else {
        scope.hideChart = false;
      }
      var hash          = $location.search();
      console.log(123, scope.hideChart);
      hash.hc           = scope.hideChart;
      $location.search(hash);
    };

    scope.updateRange = function(msg) {
      controller.updateRange(msg);
    };

    scope.updatePage = function() {
      var item = { q: scope.query };
      controller.updateRange(item);
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

    scope.clearQuery = function() {
      controller.clearQuery();
    };

    scope.init();
  };

  return {
    link: link,
    scope: {},
    require: '^analytics',
    templateUrl: 'components/stats/social/_index.html'
  };

}]);

app.directive('reportsImpressions', ['Report', '$routeParams', '$location', 'Location', function(Report, $routeParams, $location, Location) {

  var link = function( scope, element, attrs, controller ) {

    scope.location_name   = $routeParams.location_name;
    scope.loading         = controller.loading;
    scope.predicate       = '-total';

    var params = {
      impressions: true,
    };

    scope.init = function() {
      controller.get(params).then(function(results) {
        scope.chart_series  = results.timeline;
        scope._stats        = results._stats;
        scope.locations     = results.locations;
        scope.start         = results._stats.start;
        scope.end           = results._stats.end;
        scope.loading       = undefined;
      });
    };

    scope.updateRange = function(msg) {
      controller.updateRange(msg);
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
    scope: {},
    require: '^analytics',
    templateUrl: 'components/stats/impressions/_index.html'
  };

}]);

// Used in the locations home page //

app.directive('reportsClientsBrief', ['Report', '$routeParams', '$location', 'Location', function(Report, $routeParams, $location, Location) {

  var link = function( scope, element, attrs, controller ) {

    scope.location_name   = $routeParams.location_name;
    scope.loading         = controller.loading;

    var params = {
      clients: true,
    };

    scope.init = function() {
      controller.get(params).then(function(results) {
        if (results.timeline !== undefined) {
          scope.chart_series = {
            'Devices Per Day' : results.timeline.devices,
            'Throughput'      : results.timeline.throughput
          };
        }
        scope._stats          = results._stats;
        scope.end             = results._stats.end;
        scope.start           = results._stats.start;
        scope.loading         = undefined;
      });
    };

    scope.init();
  };

  return {
    link: link,
    scope: {},
    require: '^analytics',
    templateUrl: 'components/stats/clients/_index_brief.html'
  };

}]);

app.directive('reportsClients', ['Report', '$routeParams', '$location', 'Location', function(Report, $routeParams, $location, Location) {

  var link = function( scope, element, attrs, controller ) {

    scope.location_name   = $routeParams.location_name;
    scope.loading         = controller.loading;

    var params = {
      clients: true,
    };

    scope.init = function() {
      controller.get(params).then(function(results) {
        scope.chart_series  = results.timeline;
        scope._stats        = results._stats;
        scope.info          = results.info;
        scope.manufacturers = results.manufacturers;
        scope.locations     = results.locations;
        scope.start         = results._stats.start;
        scope.end           = results._stats.end;
        scope.avgSnr        = Math.round(scope.info.snr);
        scope.predicate     = '-total';
        scope.loading       = undefined;
      });
    };

    scope.updateRange = function(msg) {
      controller.updateRange(msg);
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
    scope: {},
    require: '^analytics',
    templateUrl: 'components/stats/clients/_index.html'
  };

}]);

app.directive('reportsSessions', ['Report', '$routeParams', '$location', 'Location', function(Report, $routeParams,$location,Location) {

  var link = function( scope, element, attrs, controller ) {

    scope.loading         = true;
    scope.location_name   = $routeParams.location_name;
    scope.query           = $routeParams.q;
    scope.hideChart       = $routeParams.hc;

    var params = {
      sessions: true,
      q: scope.query
    };

    scope.init = function() {
      controller.get(params).then(function(results) {
        scope.chart_series  = results.timeline;
        scope._stats        = results._stats;
        scope.info          = results.info;
        scope.durations     = results.durations;
        scope.start         = scope.start || results._stats.start;
        scope.end           = scope.end || results._stats.end;
        scope.avgVisits     = Math.round(scope.info.avgVisits);
        scope.loading       = undefined;
      });
    };

    scope.updateRange = function(msg) {
      controller.updateRange(msg);
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

    scope.clearQuery = function() {
      controller.clearQuery();
    };

    scope.updatePage = function() {
      var item = { q: scope.query };
      controller.updateRange(item);
    };

    scope.hChart = function() {
      if ( scope.hideChart === undefined || scope.hideChart === false) {
        scope.hideChart = 'true';
      } else {
        scope.hideChart = false;
      }
      var hash          = $location.search();
      hash.hc           = scope.hideChart;
      $location.search(hash);
    };

    scope.init();
  };

  return {
    link: link,
    scope: {},
    require: '^analytics',
    templateUrl: 'components/stats/sessions/_index.html'
  };

}]);

app.directive('clientsGraph', ['Report', function(Report) {

  var link = function( scope, element, attrs ) {

  };

  return {
    link: link,
  };

}]);

