'use strict';

var app = angular.module('myApp.plans.directives', []);

app.directive('userPlans', ['Plan', '$routeParams', '$location', '$mdDialog', '$q', '$pusher', 'Subscription', 'User', 'Auth', 'showToast', '$rootScope', 'showErrors', function(Plan, $routeParams, $location, $mdDialog, $q, $pusher, Subscription, User, Auth, showToast, $rootScope, showErrors) {

  function link(scope) {

    var plan;
    scope.loading = true;

    var currency = function(curr) {
      if (curr === 'GBP') {
        scope.curr = '£';
      } else if (curr === 'EUR' ) {
        scope.curr = '€';
      } else {
        scope.curr = '$';
      }
    };

    var cancel = function(email) {
      User.destroy({id: scope.user.id, email: email}).$promise.then(function() {
        Auth.logout();
      }, function(err) {
        showErrors(err);
      });
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

    function CancelController ($scope,user) {
      $scope.user = user;
      $scope.close = function() {
        $mdDialog.cancel();
      };
      $scope.save = function(email) {
        $mdDialog.cancel();
        cancel(email);
      };
    }
    CancelController.$inject = ['$scope', 'user'];

    function ChangeController ($scope) {
      $scope.close = function() {
        $mdDialog.cancel();
      };
      $scope.save = function() {
        $mdDialog.cancel();
        upgrade();
      };
    }
    ChangeController.$inject = ['$scope'];
    var upgrade = function() {
      scope.user.subscribing = true;
      Subscription.create({plan_id: scope.user.new_plan}).$promise.then(function(data) {
      }, function(err) {
        scope.user.subscribing = undefined;
        scope.user.errors = err.data.message;
      });
    };

    var doThePlansThing = function() {
      for (var i=0; i < scope.plans.length; i++) {
        if (scope.user.plan_id === scope.plans[i].plan_id) {
          scope.user.active_plan = scope.plans[i].unique_id;
          scope.user.new_plan    = scope.plans[i].unique_id;
          scope.user.plan_name   = scope.plans[i].plan_name;
          scope.user.plan_price  = scope.plans[i].plan_price;
          break;
        }
      }
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
              doThePlansThing();
            } else {
              scope.user.subscribing = undefined;
              showErrors({data: [data.message.message]});
            }
          });
        }
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

    scope.cancel = function(form) {
      $mdDialog.show({
        templateUrl: 'components/users/billing/_cancel_dialog.html',
        parent: angular.element(document.body),
        controller: CancelController,
        clickOutsideToClose: true,
        locals: {
          user: scope.user
        }
      });
    };

    scope.changePlan = function(id) {
      $mdDialog.show({
        templateUrl: 'components/users/plans/_change_dialog.html',
        parent: angular.element(document.body),
        controller: ChangeController,
        clickOutsideToClose: true
      });
    };

    var init = function() {
      Plan.query({
        period: 'monthly',
        user_id: $routeParams.id,
      }).$promise.then(function(data) {
        scope.plans = data.plans;
        doThePlansThing();
        subscribe(scope.user.key);
      });
    };

    $rootScope.$on('$routeChangeStart', function (event, next, current) {
      if (channel) {
        channel.unbind();
      }
    });

    scope.$watch('user',function(nv){
      if (nv !== undefined && scope.curr === undefined) {
        currency(scope.user.currency);
        init();
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
