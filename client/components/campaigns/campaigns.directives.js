'use strict';

var app = angular.module('myApp.campaigns.directives', []);

app.directive('listCampaigns', ['Campaign', 'Location', '$routeParams', '$rootScope', '$http', '$mdDialog', 'showToast', 'showErrors', 'gettextCatalog', 'pagination_labels', '$cookies', '$location', function (Campaign, Location, $routeParams, $rootScope, $http, $mdDialog, showToast, showErrors, gettextCatalog, pagination_labels, $cookies, $location) {

  var link = function(scope,element,attrs) {

    scope.location = {};
    scope.location.slug = $routeParams.id;
    scope.currentNavItem = 'campaigns';

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

    var destroy = function(campaign) {
      Campaign.destroy({location_id: scope.location.slug, id: campaign.id}).$promise.then(function(results) {
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
        destroy(campaign);
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

    var isNumber = function(number) {
      if (Number.isInteger(number / 1)) {
        return true;
      }
    };

    scope.campaign = { slug: $routeParams.campaign_id };

    scope.available_options = [];
    scope.available_options.push({value: 'created_at', name: 'First seen', desc: 'When the user first signed in through your WiFi network'});
    scope.available_options.push({value: 'updated_at', name: 'Last seen', desc: 'The last time they were seen on your network'});
    scope.available_options.push({value: 'logins_count', name: 'Number of logins', desc: 'Total number of logins through your network'});

    scope.states = ['draft', 'live'];

    scope.addRule = function() {
      if (!scope.campaign.holding_predicates) {
        scope.campaign.holding_predicates = [];
      }
      scope.focusedCard = scope.campaign.holding_predicates.length;
      scope.showChooser = true;
    };

    scope.onSelect = function(index) {
      scope.showChooser = undefined;
      var pred = { value: '', operator: 'gte' };
      switch(index) {
        case 0:
          pred.name = 'First seen';
          pred.attribute = 'created_at';
          pred.operator = 'gte';
          break;
        case 1:
          pred.name = 'Last seen';
          pred.attribute = 'updated_at';
          pred.operator = 'gte';
          break;
        case 2:
          pred.name = 'Number of logins';
          pred.attribute = 'login_count';
          pred.operator = 'gte';
          break;
      }
      scope.campaign.holding_predicates.push(pred);
    };

    scope.showCard = function(index) {
      scope.focusedCard = index;
    };

    scope.name = function(attribute) {
      switch(attribute) {
        case 'created_at':
          return 'First seen';
        case 'updated_at':
          return 'Last seen';
        case 'login_count':
          return 'Number of logins';
        default:
          return attribute;
      }
    };

    scope.removePredicate = function(index) {
      scope.campaign.holding_predicates.splice(index, 1);
    };

    scope.setRules = function() {
      switch(scope.campaign.template) {
        case 'signed_up_now':
          scope.campaign.holding_predicates = [];
          scope.campaign.holding_predicates.push({operator: 'rel_lte', rel_value: 1, attribute: 'created_at'});
          break;
        case 'signed_up_30':
          scope.campaign.holding_predicates = [];
          scope.campaign.holding_predicates.push({operator: 'rel_eq', rel_value: 30, attribute: 'created_at'});
          break;
        case 'last_seen_30':
          scope.campaign.holding_predicates = [];
          scope.campaign.holding_predicates.push({operator: 'rel_eq', rel_value: 30, attribute: 'updated_at'});
          break;
        case 'custom':
          scope.campaign.holding_predicates = [];
          break;
      }
    };

    var create = function(campaign) {
      Campaign.create({}, {
        location_id: $routeParams.id,
        campaign: campaign
      }).$promise.then(function(results) {
        console.log(results);
        scope.campaign.id = results.id;
        showToast(gettextCatalog.getString('Campaign successfully created.'));
        $location.path($routeParams.id + '/campaigns/' + results.id);
      }, function(err) {
        showErrors(err);
      });
    };

    var update = function(campaign) {
      Campaign.update({}, {
        location_id: $routeParams.id,
        id: campaign.id,
        campaign: campaign
      }).$promise.then(function(results) {
        console.log(results);
        scope.campaign.id = results.id;
        scope.campaign.hard_state = results.state;
        showToast(gettextCatalog.getString('Campaign successfully updated.'));
      }, function(err) {
        showErrors(err);
      });
    };

    var save = function() {
      var campaign = scope.campaign;
      delete campaign.holding_predicates;
      delete campaign.template;
      if (scope.campaign.id === undefined) {
        create(campaign);
      } else{
        update(campaign);
      }
    };

    scope.save = function(form) {
      form.$setPristine();
      scope.focusedCard = undefined;
      scope.campaign.predicates = scope.campaign.holding_predicates;
      save();
    };

    scope.hideOthers = function() {
      scope.focusedCard = undefined;
      scope.showChooser = undefined;
    };

    var getCampaign = function() {
      Campaign.get({
        location_id: $routeParams.id,
        id: scope.campaign.slug
      }).$promise.then(function(results) {
        scope.campaign = results;
        scope.campaign.hard_state = results.state;

        var len = results.predicates.length;
        for (var i=0; i < len; i++) {
          if (isNumber(scope.campaign.predicates[i].value)) {
            results.predicates[i].relative = true;
            continue;
          }
          results.predicates[i].relative = false;
        }

        scope.campaign.holding_predicates = results.predicates;
        scope.loading = undefined;
      }, function(err) {
        scope.errors = err;
      });
    };

    var buildCampaign = function() {
      scope.campaign = {};
      scope.campaign.relative = true;
      scope.campaign.template = 'signed_up_now';
      scope.campaign.holding_predicates = [];
      scope.campaign.holding_predicates.push({operator: 'lte', value: 1, attribute: 'created_at', relative: true});
      scope.campaign.predicate_type = 'and';
      scope.campaign.title = 'Thanks for being awesome';
      scope.campaign.content = 'Hey {{ Username }}, thanks for joining us!';
      scope.campaign.state = 'draft';
      scope.loading = undefined;
    };

    var init = function() {
      if ($routeParams.campaign_id) {
        getCampaign();
      } else {
        buildCampaign();
      }
    };

    init();
  };

  return {
    link: link,
    scope: {
      loading: '=',
      location: '='
    },
    templateUrl: 'components/campaigns/edit/_edit.html'
  };

}]);

app.directive('campGuide', [function() {

  var link = function(scope, element, attrs) {

    scope.loading = undefined;
    scope.currentNavItem = 'guide';

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

    scope.currentNavItem = 'reports';

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


app.directive('validateCampaignEmail', ['CampaignValidate', '$routeParams', '$timeout', '$location', function (CampaignValidate, $routeParams, $timeout, $location) {

  var link = function(scope) {
    var timeout;
    var validateCampaign = function() {
      CampaignValidate.update({
        secret: $routeParams.secret
      }).$promise.then(function(results) {
        scope.message = 'Cool, your email was validated. <br><br>Remember to party hard.';
        scope.loading = undefined;
      }, function(err) {
        scope.message = 'Could not validate the token, please try again later.';
        scope.loading = undefined;
      });
    };

    scope.message = 'Cool, your email was validated. Party hard.';
    if ($routeParams.secret) {
      validateCampaign();
    } else {
      $location.path('/');
      $location.search({});
    }
  };

  return {
    link: link,
    scope: {
      loading: '='
    },
    templateUrl: 'components/campaigns/_validate.html'
  };
}]);
