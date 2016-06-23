'use strict';

var app = angular.module('myApp.distros.directives', []);

app.directive('listReferrals', ['Referral', '$location', '$routeParams', function(Referral, $location, $routeParams) {

  var link = function(scope,element,attrs) {

    scope.loading     = true;
    scope.page        = $routeParams.page;

    var init = function() {
      Referral.get({page: scope.page}).$promise.then(function(results) {
        scope.referrals            = results;
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
    template:
        // NO NEED TO TRANSLATE AT THE MOMENT
        // SECTION TO BE COMPLETED
        '<loader></loader>'+
        '<div ng-hide=\'loading\'>'+
        '<h2><i class=\'fa fa-star fa-fw\'></i> Your Referrals</h2>'+
        '<p>These are people who\'ve signed-up for a plan. They can be paid and free users.</p>'+
        '<div ng-hide=\'referrals.length\'>'+
        '<p>Nothing to be seen here yet.</p>'+
        '</div>'+
        '<div ng-show=\'referrals.length\'>'+
        '<table>' +
        '<thead>' +
        '<tr>' +
        '<th>Code</th>' +
        '<th>Email</th>' +
        '<th>Created</th>' +
        '<th>Type</th>' +
        '<th>Paying</th>' +
        '<th>Frequency</th>' +
        '<th>Value</th>' +
        '</tr>' +
        '</thead>' +
        '<tr ng-repeat="r in filtered = (referrals | filter:query | orderBy:predicate:reverse)">'+
        '<td>{{ r.ref }}</td>' +
        '<td>{{ r.email }}</td>' +
        '<td>{{ r.signed_up | humanTime }}</td>' +
        '<td>{{ r.ref_type }}</td>' +
        '<td><i class="fa fa-thumbs-o-up" ng-if="r.subscription"></i></td>' +
        '<td>{{ r.period | titleCase }}</td>' +
        '<td>{{ r.value/100 | currency }}</td>' +
        '</tr>' +
        '</table>' +
        '</div>'
  };

}]);

app.directive('distro', ['Distributor', '$location', '$routeParams', function(Distributor, $location, $routeParams) {

  var link = function(scope,element,attrs) {

    scope.loading     = true;

    var init = function() {
      Distributor.get({page: scope.page}).$promise.then(function(results) {
        scope.distro            = results;
        scope.loading           = undefined;
      }, function(error) {
      });
    };

    init();

  };

  return {
    link: link,
    scope: {},
    template:
        '<loader></loader>'+
        '</div>'
  };

}]);
