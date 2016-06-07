'use strict';

var app = angular.module('myApp.emails.directives', []);

app.directive('emailsList', ['Email', '$routeParams', '$location', function(Email, $routeParams, $location) {

  var link = function(scope) {

    scope.loading       = true;
    scope.page          = $routeParams.page;
    scope.query         = $routeParams.q;
    scope.location      = { id: parseInt($routeParams.location_id) };

    scope.init = function() {
      var params = {q: scope.query, page: scope.page, start: scope.start, end: scope.end, location_id: scope.location.id};
      Email.get(params).$promise.then(function(results) {
        scope.locations   = results.locations;
        scope.emails      = results.emails;
        scope.predicate   = '-created_at';
        scope._links      = results._links;
        scope.loading     = undefined;
      }, function(err) {
        scope.loading = undefined;
      });
    };

    scope.updatePage = function(page) {
      scope.searching = true;
      scope.page      = scope._links.current_page;
      var hash        = {};
      hash.q          = scope.query;
      hash.page       = scope.page;
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

    scope.updateLocation = function() {
      $location.search({location_id: scope.location.id});
    };

    scope.search = function() {
      $location.search({q: scope.query});
    };

    scope.init();

  };

  return {
    link: link,
    scope: {
    },
    template:
      '<div class="small-12 columns">'+
      '<div ng-show=\'loading\'>'+
      '<loader></loader>'+
      '</div>'+
      '<div ng-hide=\'loading\'>'+
      '<div class=\'row\'>'+
      '<div class="small-12 columns">'+
      '<h2>{{ _links.total_entries }} Emails Captured</h2>'+
      '<p>Hey, if your customers enter their details and agree to your newsletter, they will appear here.</p>'+
      '</div>'+
      '</div>'+
      '<div ng-hide=\'loading\'>'+
      '<div class=\'row\'>'+
      '<div class="small-12 medium-5 columns">'+
      '<div class="row">'+
      '<div class="large-12 columns">'+
      '<div class="row collapse">'+
      '<div class="small-10 columns">'+
      '<input type="text" placeholder="What are you looking for?" ng-model="query">'+
      '</div>'+
      '<div class="small-2 columns">'+
      '<a href="" class="button postfix" ng-click="search()">Go</a>'+
      '</div>'+
      '</div>'+
      '</div>'+
      '</div>'+
      // '<div class=\'row\'>'+
      // '<div class="small-10 columns">'+
      // '<input ng-model="query" placeholder="I\'m looking for..." type="text" autofocus>'+
      // '</div>'+
      // '<div class="small-2 columns">'+
      // '<button ng-disabled="!query" class="button postfix">Go <span ng-show="searching"> <i class="fa fa-cog fa-spin"></i></span></button>'+
      // '</div>'+
      // '</div>'+
      // '<input type="text" ng-model="query" placeholder="I\'m looking for..."><p></p>'+
      '<p><a ng-if="query || q" ng-click="clearQuery()"><small>Clear search...</small></a></p>'+
      '</div>'+
      '<div class="small-12 medium-4 columns">'+
      '{{ location_id }}'+
      '<select ng-change="updateLocation()" ng-model="location.id" ng-options="loc.id as loc.location_name for loc in locations" class="form-control" >'+
      '<option value="">Select Location</option>'+
      '</select>'+
      '</div>'+
      '<div class="small-12 medium-2 columns">'+
      '<create-report type=\'email\'></create-report>'+
      '</div>'+
      '</div>'+
      '<div class=\'row\'>'+
      '<div class="small-12 columns">'+
      '<div ng-hide=\'filtered.length\'>'+
      '<hr>'+
      '<p>No emails found</p>'+
      '</div>'+
      '<div ng-show=\'filtered.length\'>'+
      '<table>' +
      '<tr>'+
      '<th><a href=\'\' ng-click=\'predicate = "email"; reverse=!reverse\' >Email</a></th>'+
      '<th class=\'show-for-medium-up\'><a href=\'\' ng-click=\'predicate = "list_type"; reverse=!reverse\' >Type</a></th>'+
      '<th class=\'show-for-medium-up\'><a href=\'\' ng-click=\'predicate = "created_at"; reverse=!reverse\' >Captured</a></th>'+
      '<th><a href=\'\' ng-click=\'predicate = "location_name"; reverse=!reverse\' >Location</a></th>'+
      '<th>Added</th>'+
      '</tr>'+
      '<tr class=\'\' ng-repeat="email in filtered = (emails | filter:query | filter: { state: onlineFilter } | orderBy:predicate:reverse)">'+
      '<td>{{ email.email }}</td>'+
      '<td class=\'show-for-medium-up\'>{{ email.list_type || "Internal" }}</td>'+
      '<td class=\'show-for-medium-up\'>{{email.created_at | humanTime }}</td>'+
      '<td>{{ email.location_name }}</td>'+
      '<td><span ng-show=\'email.added\'><i class="fa fa-check"></i></span></td>'+
      '</tr>'+
      '</table>'+
      '<span ng-show="_links.total_pages > 1">' +
      '<pagination ng-click="updatePage()" total-items="_links.total_entries" page="_links.current_page" max-size="5" class="pagination-sm" boundary-links="false" rotate="false" num-pages="_links.total_pages" items-per-page="50"></pagination>'+
      '</span>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '</div>'

  };

}]);

