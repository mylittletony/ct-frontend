'use strict';

var app = angular.module('myApp.events.directives', []);

app.directive('listEvents', ['Event', '$location', '$routeParams', 'menu', function(Event, $location, $routeParams, menu) {

  var link = function(scope,element,attrs) {

    menu.isOpenLeft = false;
    menu.isOpen = false;

    scope.loading     = true;
    scope.page        = $routeParams.page;

    scope.options = {
      boundaryLinks: false,
      largeEditDialog: false,
      pageSelector: false,
      rowSelection: false
    };

    scope.query = {
      order:      '-created_at',
      filter:     $routeParams.q,
      limit:      $routeParams.per || 25,
      page:       $routeParams.page || 1,
      options:    [5,10,25,50,100],
      direction:  $routeParams.direction || 'desc'
    };

    scope.onPaginate = function (page, limit) {
      scope.query.page = page;
      scope.query.limit = limit;

      var hash   = {};
      hash.page  = scope.query.page;
      hash.per   = scope.query.limit;
      $location.search(hash);
      init();
    };

    scope.triggers = { 'All': 'all', 'Boxes' : 'box', 'Clients': 'client', 'Email': 'email', 'Guests': 'guest', 'Locations': 'location', 'Networks': 'network', 'Splash': 'splash', 'Social': 'social', 'Vouchers': 'voucher', 'Zones': 'zone' };

    scope.event = { type: 'all' };
    // scope.query = undefined;
    // scope.search = function() {
      // if ( scope.event.type === 'all' ) {
      //   scope.query = undefined;
      // } else {
      //   scope.query = scope.event.type;
      // }
    // };

    var init = function() {
      Event.query({page: scope.query.page, per: scope.query.limit}).$promise.then(function(results) {
        scope.events            = results.events;
        scope._links            = results._links;

        scope.loading           = undefined;
        // scope.eventCount.count  = 0;
      }, function(error) {
      });
    };

    scope.updatePage = function(page) {
      var hash              = {};
      scope.page            = scope._links.current_page;
      hash.page             = scope.page;

      $location.search(hash);
      init();
    };

    init();

  };

  return {
    link: link,
    scope: {},
    templateUrl: 'components/events/_index.html'
        // '<loader></loader>'+
        // '<div ng-hide=\'loading\'>'+
        // '<h2>Dashboard Events</h2>'+
        // '<p>A list of things that have been happening. You can create custom triggers when events take place too.</p>'+
        // '<div ng-hide=\'events.length\'>'+
        // '<p>Nothing to be seen yet, move along please</p>'+
        // '</div>'+
        // '<div ng-show=\'events.length\'>'+
        // '<div class=\'row\'>'+
        // '<div class=\'small-12 medium-3 columns\'>'+
        // '<select ng-model="event.type" class="form-control" ng-options="name for (name, value) in triggers" ng-change="search()" name="type"></select>'+
        // '</div>'+
        // '</div>'+
        // '<table>' +
        // '<thead>' +
        // '<tr>' +
        // '<th>Type</th>' +
        // '<th>Event</th>' +
        // '<th>Created</th>' +
        // '</tr>' +
        // '</thead>' +
        // '<tr ng-class="event.ps ? \'muted\' : \'\'" ng-repeat="event in filtered = (events | filter:{ event_type: query } | orderBy:predicate:reverse)">' +
        // '<td><a href="/#/events/{{ event.id }}">{{ event.event_type || \'NA\' }}</a></td>' +
        // '<td>{{ event.message }}</td>' +
        // '<td>{{ event.created_at | humanTime }}</td>' +
        // '</tr>' +
        // '</table>' +
        // '<pagination ng-click="updatePage()" total-items="_links.total_entries" page="_links.current_page" max-size="5" class="pagination-sm" boundary-links="false" rotate="false" num-pages="_links.total_pages" items-per-page="100"></pagination>'+
        // '</div>'
  };

}]);

app.directive('showEvent', ['Event', '$location', '$routeParams', '$compile', 'menu', 'Shortener', function(Event, $location, $routeParams, $compile, menu, Shortener) {

  var link = function(scope,element,attrs) {

    menu.isOpenLeft = false;
    menu.isOpen = false;

    scope.loading     = true;
    scope.page        = $routeParams.page;

    var shorten = function(s) {
      Shortener.get({short: s}).$promise.then(function(results) {
        scope.event.url = '/#' + results.url;
      });
    };

    // scope.viewDevice = function(p) {
    //   $location.path(p);
    //   $location.search({});
    // };

    var init = function() {
      Event.get({id: $routeParams.id}).$promise.then(function(results) {
        scope.event = results;
        results = JSON.stringify(scope.event,null,2);
        scope.test  = window.hljs.highlight('json',results).value;
        var test = '<pre>' + scope.test + '</pre>';

        var template = test;
        var templateObj = $compile(template)(scope);
        element.html(templateObj);

        if (scope.event.short_url) {
          shorten(scope.event.short_url);
        }
        scope.loading           = undefined;
      }, function(error) {
      });
    };

    init();

  };

  return {
    link: link,
    scope: {
      event: '='
    }
  };

}]);
