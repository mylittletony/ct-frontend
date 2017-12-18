'use strict';

var app = angular.module('myApp.campaigns.directives', []);

app.directive('listCampaigns', ['Campaign', 'Location', '$routeParams', '$rootScope', '$http', '$mdDialog', 'showToast', 'showErrors', 'gettextCatalog', 'pagination_labels', '$cookies', '$location', function (Campaign, Location, $routeParams, $rootScope, $http, $mdDialog, showToast, showErrors, gettextCatalog, pagination_labels, $cookies, $location) {

  var link = function(scope,element,attrs) {

    scope.location = {};
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

    var removeFromList = function(campaign) {
      for (var i = 0, len = scope.campaigns.length; i < len; i++) {
        if (scope.campaigns[i].id === campaign.id) {
          scope.campaigns.splice(i, 1);
          showToast(gettextCatalog.getString('Campaign successfully deleted.'));
          break;
        }
      }
    };

    scope.destroy = function(campaign) {
      Campaign.destroy({location_id: scope.location.slug, id: campaign.slug}).$promise.then(function(results) {
        removeFromList(campaign);
      }, function(err) {
        showErrors(err);
      });
    };

    scope.delete = function(campaign) {
      var confirm = $mdDialog.confirm()
      .title(gettextCatalog.getString('Delete Campaign'))
      .textContent(gettextCatalog.getString('Are you sure you want to delete this campaign?'))
      .ariaLabel(gettextCatalog.getString('Delete Campaign'))
      .ok(gettextCatalog.getString('Delete'))
      .cancel(gettextCatalog.getString('Cancel'));
      $mdDialog.show(confirm).then(function() {
        scope.destroy(campaign);
      }, function() {
      });
    };

    scope.onPaginate = function (page, limit) {
      scope.query.page = page;
      scope.query.limit = limit;
      scope.updatePage();
    };

    scope.updatePage = function(item) {
      var hash    = {};
      scope.page  = scope._links.current_page;
      hash.page   = scope.query.page;

      $location.search(hash);
      init();
    };

    var getCampaigns = function() {
      var params = {
        per: scope.query.limit,
        page: scope.query.page,
        location_id: scope.location.slug
      };
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
      Location.get({id: scope.location.slug}, function(data) {
        scope.location = data;
        getCampaigns();
      }, function(err){
        console.log(err);
      });
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