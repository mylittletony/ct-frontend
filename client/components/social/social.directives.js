'use strict';

var app = angular.module('myApp.social.directives', []);

app.directive('showSocial', ['Social', '$routeParams', '$timeout', '$location', function(Social, $routeParams, $timeout, $location) {

  var link = function(scope) {

    scope.page      = $routeParams.page;
    scope.client    = { id: $routeParams.client_id };
    scope.location  = { slug: $routeParams.id };

    var init = function() {
      Social.query({id: $routeParams.social_id}).$promise.then(function(results) {
        scope.social     = results.social;
        scope.clients    = results.clients;
        scope.locations  = results.locations;
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
        scope.social.errors  = 'There was a problem updating this user.';
        scope.social.state  = undefined;
      });
    };

    scope.back = function() {
      window.location.href = '/#/locations/' + scope.location.slug + '/clients/' + scope.client.id;
    };

    init();

  };

  return {
    link: link,
    scope: {
      loading: '='
    },
    templateUrl: 'components/reports/social/_show.html'
  };

}]);

app.directive('listSocial', ['Social', '$routeParams', '$location', 'Location', function(Social, $routeParams, $location, Location) {

  var link = function(scope,element,attrs,controller) {

    scope.loading         = true;
    scope.location_name   = $routeParams.location_name;
    scope.location_id     = $routeParams.location_id;

    scope.init = function() {
      Social.get({page: scope.page, location_id: scope.location_id}).$promise.then(function(results) {
        scope.test = results;
        scope.socials     = results.social;
        scope.loading     = undefined;
        scope.predicate   = '-created_at';
        scope._links      = results._links;
      }, function(err) {
        scope.loading = undefined;
      });
    };

    scope.icon = function() {
      var hash = {};
    };

    scope.updatePage = function(page) {
      scope.page      = scope._links.current_page;
      var hash        = {};
      hash.q          = scope.query;
      hash.activated  = scope.activated;
      hash.page       = scope.page;
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
    template:
      '<div class=\'row\'>'+
      '<div class=\'small-12 columns\'>'+
      '<div ng-show=\'loading\'>' +
      '<p>Loading...</p>'+
      '</div>'+
      '<div ng-hide=\'loading\'>' +
      '<div class="row">'+
      '<div class="small-12 columns">'+
      '<hr>'+
      '<div ng-hide=\'filtered.length\'>'+
      '<p>Nothing to be seen.</p>'+
      '</div>' +
      '<div ng-show=\'filtered.length\'>'+
      '<table>' +
      '<tr>' +
      '<th></th>'+
      '<th><a href=\'\' ng-click=\'predicate = "email"; reverse=!reverse\' >User</a></th>'+
      '<th class=\'show-for-medium-up\'><a href=\'\' ng-click=\'predicate = "updated_at"; reverse=!reverse\' >Last Seen</a></th>'+
      '<th><a href=\'\' ng-click=\'predicate = "checkins"; reverse=!reverse\' >Checkins</a></th>'+
      '<th>Locations</th>'+
      '</tr>' +
      '<tr ng-repeat=\'social in filtered = (socials | filter:query | orderBy:predicate:reverse)\'>'+
      '<td>'+
      '<span class=\'social\'>'+
      '<span ng-if=\'social.googleId\'><img src=\'https://d3e9l1phmgx8f2.cloudfront.net/images/social/google.png\' width=\'24px\'></span>'+
      '<span ng-if=\'social.linkedinId\'><img src=\'https://d3e9l1phmgx8f2.cloudfront.net/images/social/linkedin.png\' width=\'24px\'></span>'+
      '<span ng-if=\'social.facebookId\'><img src=\'https://d3e9l1phmgx8f2.cloudfront.net/images/social/facebook.png\' width=\'24px\'></span>'+
      '</span>'+
      '</td>'+
      '<td>'+
      '<a href=\'/#/reports/social/{{ social.id }}\' >{{ social.firstName }} {{ social.lastName }} </a><br>'+
      '<small><span ng-show=\'social.gender == "male"\'><i class="fa fa-male"></i></span> <span ng-show=\'social.gender == "female"\'><i class="fa fa-female"></i></span> {{ social.currentLocation || "Unknown"}}</small>'+
      '</td>'+
      '<td class=\'show-for-medium-up\'>'+
      '<p>{{ social.updated_at | humanTime }}<br>'+
      '<small class=\'text-muted\'>Created: {{ social.created_at | humanTime }}</small></p>'+
      '</td>'+
      '<td>{{ social.checkins }}</td>'+
      '<td>{{ social.location_ids.length }}</td>'+
      '</tr>' +
      '</table>'+
      '<span ng-show="_links.total_pages > 1">'+
      '<pagination ng-click="updatePage()" total-items="_links.total_entries" page="_links.current_page" max-size="5" class="pagination-sm" boundary-links="false" rotate="false" num-pages="_links.total_pages" items-per-page="100"></pagination>'+
      '</span>'+
      '</div>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '</div>'
  };

}]);
