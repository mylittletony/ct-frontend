'use strict';

var app = angular.module('myApp.campaigns.directives', []);

app.directive('listCampaigns', ['Campaign', '$routeParams', '$rootScope', '$http', '$mdDialog', 'showToast', 'showErrors', 'gettextCatalog', 'pagination_labels', '$cookies', '$location', function (Campaign, $routeParams, $rootScope, $http, $mdDialog, showToast, showErrors, gettextCatalog, pagination_labels, $cookies, $location) {

  var link = function(scope,element,attrs) {

    scope.location = {};
    scope.brand = {};
    scope.location.slug = $routeParams.id;

    scope.pagination_labels = pagination_labels;
    scope.query = {
      filter:     $routeParams.q,
      order:      '-created_at',
      limit:      $routeParams.per || 25,
      page:       $routeParams.page || 1,
      options:    [5,10,25,50,100],
      direction:  $routeParams.direction || 'desc'
    };

    var getCampaigns = function(params) {
      params.location_id = scope.location.slug;
      Campaign.query(params).$promise.then(function(results) {
        scope.campaigns = results.campaigns;
        scope._links   = results._links;
        scope.loading  = undefined;
      }, function(err) {
        console.log(err);
        scope.loading = undefined;
      });
    };

    var init = function() {
      var params = {
        per: scope.query.limit,
        page: scope.query.page
      };
      getCampaigns(params);
    };

    scope.create = function() {
      window.location.href = '/#/locations/' + scope.location.slug + '/campaigns/new';
    };

    init();

  };

  return {
    link: link,
    scope: {
      loading: '='
    },
    templateUrl: 'components/campaigns/index/_index.html'
  };

}]);

app.directive('editCampaign', ['Campaign', 'Integration', 'Auth', '$q', '$routeParams', '$rootScope', '$http', '$location', 'showToast', 'showErrors', '$sce', 'gettextCatalog', '$mdDialog', function (Campaign, Integration, Auth, $q, $routeParams, $rootScope, $http, $location, showToast, showErrors, $sce, gettextCatalog, $mdDialog) {

  var link = function(scope,element,attrs) {

    scope.campaign = { slug: $routeParams.campaign_id };
    scope.location = {slug: $routeParams.id};
    scope.user = Auth.currentUser();

    var init = function() {
      Campaign.get({
        location_id: scope.location.slug,
        id: scope.campaign.slug
      }).$promise.then(function(results) {
        scope.campaign = results;
        scope.loading = undefined;
      }, function(err) {
        scope.errors = err;
      });
    };

    init();
  };

  return {
    link: link,
    scope: {
      loading: '='
    },
    templateUrl: 'components/campaigns/edit/_edit.html'
  };

}]);