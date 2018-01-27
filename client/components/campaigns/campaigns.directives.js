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

    var updatePage = function(item) {
      var hash    = {};
      scope.page  = scope._links.current_page;
      hash.page   = scope.query.page;

      $location.search(hash);
      init();
    };

    scope.onPaginate = function (page, limit) {
      scope.query.page = page;
      scope.query.limit = limit;
      updatePage();
    };

    scope.create = function() {
      window.location.href = '/#/' + scope.location.slug + '/campaigns/new';
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

app.directive('editCampaign', ['Campaign', 'Location', 'Integration', 'Auth', '$q', '$routeParams', '$rootScope', '$http', '$location', 'showToast', 'showErrors', '$sce', 'gettextCatalog', '$mdDialog', function (Campaign, Location, Integration, Auth, $q, $routeParams, $rootScope, $http, $location, showToast, showErrors, $sce, gettextCatalog, $mdDialog) {

  var link = function(scope,element,attrs) {

    scope.campaign = { slug: $routeParams.campaign_id };
    scope.location = {slug: $routeParams.id};

    scope.available_options = [];
    scope.available_options.push({value: 'created_at', name: 'First seen', desc: 'When the user first signed in through your WiFi network'});
    scope.available_options.push({value: 'updated_at', name: 'Last seen', desc: 'The last time they were seen on your network'});
    scope.available_options.push({value: 'logins', name: 'Number of logins', desc: 'Total number of logins through your network'});

    scope.addRule = function() {
      if (!scope.campaign.predicates) {
        scope.campaign.predicates = [];
      }
      scope.focusedCard = scope.campaign.predicates.length;
      scope.showChooser = true;
    };

    scope.onSelect = function(index) {
      scope.showChooser = undefined;
      // scope.predicate.rel_value = 7;
      var pred = { value: '', operator: 'rel_gte' };
      switch(index) {
        case 0:
          pred.name = 'First seen';
          pred.attribute = 'created_at';
          // pred.type = 'date';
          break;
        case 1:
          pred.name = 'Last seen';
          pred.attribute = 'updated_at';
          // pred.type = 'date';
          break;
        case 2:
          pred.name = 'Number of logins';
          pred.attribute = 'logins';
          break;
      }
      scope.campaign.predicates.push(pred);
    };

    scope.showCard = function(index) {
      console.log(index);
      scope.focusedCard = index;
    };

    var rel = ['rel_gte', 'rel_lte', 'rel_eq'];
    var abs = ['abs_gte', 'abs_lte', 'abs_eq'];

    scope.human = function(predicate) {
      var relative, absolute;
      if (rel.indexOf(predicate.operator) >= 0) {
        switch(predicate.operator) {
          case 'rel_gte':
            return `More than ${predicate.rel_value || 0 } days ago.`;
          case 'rel_lte':
            return `Less than ${predicate.rel_value || 0 } days ago.`;
          case 'rel_eq':
            return `Exactly ${predicate.rel_value || 0 } days ago.`;
        }
      } else if (abs.indexOf(predicate.operator) >= 0) {
        switch(predicate.operator) {
          case 'abs_gte':
            return `After ${predicate.abs_value}.`;
          case 'abs_lte':
            return `Before ${predicate.abs_value}.`;
          case 'abs_eq':
            return `On ${predicate.abs_value}.`;
        }
      } else {
        switch(predicate.operator) {
          case 'gte':
            return `More than ${predicate.value} logins.`;
          case 'lte':
            return `Less than ${predicate.value} logins.`;
        }
      }
    };

    scope.removePredicate = function(index) {
      scope.campaign.predicates.splice(index, 1);
    };

    var getCampaign = function() {
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

    var buildCampaign = function() {
      scope.campaign = {};
      scope.campaign.template = 'signed_up_now';
      scope.campaign.template = 'custom'; // remove
      scope.campaign.predicate_type = 'and';
      scope.loading = undefined;
    };

    var init = function() {
      Location.get({id: scope.location.slug}, function(data) {
        scope.location = data;
        if ($routeParams.campaign_id) {
          getCampaign();
        } else {
          buildCampaign();
        }
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
    templateUrl: 'components/campaigns/edit/_edit.html'
  };

}]);

app.directive('campGuide', [function() {

  var link = function(scope, element, attrs) {

    scope.loading = undefined;

  };

  return {
    link: link,
    templateUrl: 'components/campaigns/_guide.html'
  };
}]);

app.directive('campNav', [function() {

  var link = function(scope, element, attrs) {

  };

  return {
    link: link,
    templateUrl: 'components/campaigns/_nav.tmpl.html'
  };

}]);

app.directive('campaignReports', ['Campaign', 'Location', '$routeParams', function(Campaign, Location, $routeParams) {

  var link = function(scope, element, attrs) {

    scope.currentNavItem = 'people';

    var init = function() {
      Location.get({id: $routeParams.id}, function(data) {
        scope.location = data;
        scope.loading = undefined;
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
    templateUrl: 'components/campaigns/reports/_reports.html'
  };

}]);
