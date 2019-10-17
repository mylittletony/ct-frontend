'use strict';

var app = angular.module('myApp.plans.directives', []);

app.directive('userPlans', ['Plan', '$routeParams', '$location', '$mdDialog', '$q', '$pusher', 'Subscription', 'showToast', '$rootScope', 'showErrors', function(Plan, $routeParams, $location, $mdDialog, $q, $pusher, Subscription, showToast, $rootScope, showErrors) {

  function link(scope) {

    var plan;
    scope.loading = true;

    scope.$watch('user',function(nv){
      if (nv !== undefined && scope.curr === undefined) {
        currency(scope.user.currency);
        init();
      }
    });

    var currency = function(curr) {
      if (curr === 'GBP') {
        scope.curr = '£';
      } else if (curr === 'EUR' ) {
        scope.curr = '€';
      } else {
        scope.curr = '$';
      }
    };

    scope.planPrice = function(price, period) {
      var formatted;
      if ( period === 'monthly') {
        formatted = price;
      } else {
        formatted = (price / 12);
      }
      return formatted;
    };

    var getPlan = function(id) {
      var deferred = $q.defer();
      Plan.get({id: id}).$promise.then(function(data) {
        deferred.resolve(data);
      }, function() {
       deferred.reject();
      });
      return deferred.promise;
    };

    scope.viewPlan = function(id) {
      $mdDialog.show({
        locals: {
          plan_id: id,
          currency: scope.curr
        },
        templateUrl: 'components/users/billing/_show.html',
        controller: DialogController,
        clickOutsideToClose: true
      });
    };

    function DialogController($scope, plan_id, currency) {
      $scope.loading = true;
      $scope.currency = currency;
      getPlan(plan_id).then(function(data) {
        $scope.plan = data.plan;
        $scope.loading = undefined;
      });
      $scope.upgrade = function(plan) {
        $mdDialog.cancel();
        scope.upgrade(plan);
      };
      $scope.close = function() {
        $mdDialog.cancel();
      };
    }
    DialogController.$inject = ['$scope', 'plan_id'];

    scope.upgrade = function(p) {
      upgrade(p.id);
      // alert(123);
      // plan = p;
      // $mdDialog.show({
      //   locals: {
      //     plan: plan,
      //     currency: scope.curr
      //   },
      //   templateUrl: 'components/users/billing/_upgrade.html',
      //   controller: UpgradeController,
      //   clickOutsideToClose: true
      // });
    };

    function UpgradeController($scope, plan, currency) {
      $scope.plan = plan;
      $scope.currency = currency;
      $scope.upgrade = function() {
        $mdDialog.cancel();
        plan.upgrading = true;
        upgrade(plan.slug);
      };
      $scope.close = function() {
        $mdDialog.cancel();
      };
    }
    UpgradeController.$inject = ['$scope', 'plan', 'currency'];

    var upgrade = function(id) {
      scope.user.subscribing = true;
      Subscription.create({plan_id: id}).$promise.then(function(data) {
      }, function(err) {
        scope.user.subscribing = undefined;
        scope.user.errors = err.data.message;
      });
    };

    var channel;

    var subscribe = function(key) {
      if (typeof client !== 'undefined') {
        var pusher = $pusher(client);
        if (key) {
          channel = pusher.subscribe(key);
          channel.bind('sub_completed', function(data) {
            if (data.message.success === true) {
              scope.user.plan_id = data.message.plan_id;
              scope.user.subscribing = undefined;
              showToast(data.message.msg);
              for (var i = 0; i < scope.plans.length; i++) {
                if (scope.plans[i].plan_id === data.message.plan_id) {
                  scope.plans[i].upgrading = undefined;
                }
              }
            } else {
              if (plan) {
                plan.upgrading = false;
              }
              scope.user.subscribing = undefined;
              showErrors({data: data.message.message});
              console.log(data);
            }
          });
        }
      }
    };

    var init = function() {
      Plan.query({
        period: 'monthly',
        user_id: $routeParams.id,
        enterprise: scope.user.enterprise
      }).$promise.then(function(data) {
        scope.plans = data.plans;
        var available_plans = [];
        for (var i = 0; i < scope.plans.length; i++) {
          available_plans.push(scope.plans[i].plan_id);
        }
        if (!available_plans.includes(scope.user.plan.id)) {
          scope.user.grandfather_plan = true;
        }
        subscribe(scope.user.key);
      });
    };

    $rootScope.$on('$routeChangeStart', function (event, next, current) {
      if (channel) {
        channel.unbind();
      }
    });

  }

  return {
    link: link,
    scope: {
      user: '='
    },
    templateUrl: 'components/users/billing/_plans.html'
  };

}]);
