'use strict';

var app = angular.module('myApp.events.directives', []);

app.directive('listEvents', ['Event', '$location', '$routeParams', 'menu', 'gettextCatalog', 'pagination_labels', function(Event, $location, $routeParams, menu, gettextCatalog, pagination_labels) {

  var link = function(scope,element,attrs) {

    menu.isOpenLeft = false;
    menu.isOpen = false;
    menu.sectionName = 'Events';

    scope.loading     = true;
    scope.page        = $routeParams.page;

    scope.options = {
      boundaryLinks: false,
      largeEditDialog: false,
      pageSelector: false,
      rowSelection: false
    };

    scope.pagination_labels = pagination_labels;
    scope.query = {
      order:      '-created_at',
      type:       $routeParams.type,
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
      hash.q     = scope.query.filter;
      $location.search(hash);
      init();
    };

    scope.triggers = [{ name: gettextCatalog.getString('All'), value: 'all'}, {name: gettextCatalog.getString('Boxes'), value: 'box'}, {name: gettextCatalog.getString('Clients'), value: 'client'}, {name: gettextCatalog.getString('Email'), value: 'email'}, {name: gettextCatalog.getString('Guests'), value: 'guest'}, {name: gettextCatalog.getString('Locations'), value: 'location'}, {name: gettextCatalog.getString('Networks'), value: 'network'}, {name: gettextCatalog.getString('Splash'), value: 'splash'}, {name: gettextCatalog.getString('Social'), value: 'social'}, {name: gettextCatalog.getString('Vouchers'), value: 'voucher'}, {name: gettextCatalog.getString('Zones'), value: 'zone' }];

    scope.search = function() {
      var hash  = $location.search();
      hash.q    = scope.query.filter;
      hash.type = undefined;
      $location.search(hash);
    };

    scope.setType = function(type, obj) {
      var hash  = $location.search();
      hash.q      = obj;
      hash.type   = type;
      $location.search(hash);
    };

    var init = function() {
      if (scope.query.filter === 'all') {
        scope.query.filter = undefined;
      }
      Event.query({
        page: scope.query.page,
        per: scope.query.limit, 
        object: scope.query.filter,
        type: scope.query.type
      }).$promise.then(function(results) {
        scope.events            = results.events;
        scope._links            = results._links;
        scope.loading           = undefined;
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
