'use strict';

var app = angular.module('myApp.orders.directives', []);

app.directive('storeOrders', ['Order', '$routeParams', '$location', function(Order, $routeParams, $location) {

  var link = function(scope) {

    scope.page      = $routeParams.page;
    scope.location  = { slug: $routeParams.id };
    scope.client    = { id: $routeParams.client_id };

    scope.options = {
      autoSelect: false,
      boundaryLinks: false,
      pageSelector: false,
      rowSelection: false
    };

    scope.query = {
      order:      '-created_at',
      limit:      $routeParams.per || 25,
      page:       $routeParams.page || 1,
      options:    [5,10,25,50,100],
      direction:  $routeParams.direction || 'asc'
    };

    var createMenu = function() {
    
      // User permissions //
      scope.menu = [{
        name: 'View',
        type: 'view'
      }];

      if (false) {
        scope.menu.push({
          name: 'Refund',
          type: 'refund',
          disabled: 'false'
        });
      }
    };

    scope.action = function(id, type) {
      switch(type) {
        case 'view':
          window.location.href = '/#/locations/' + scope.location.slug + '/clients/' + scope.client.id + '/orders/' + id;
          break;
      }
    };

    scope.init = function() {
      Order.get({page: scope.page, client_id: scope.client.id }).$promise.then(function(results) {
        scope.orders      = results.orders;
        scope.loading     = undefined;
        scope.predicate   = '-created_at';
        scope._links      = results._links;
        createMenu();
      }, function(err) {
        scope.loading = undefined;
      });
    };

    // scope.updatePage = function(page) {
    //   scope.page      = scope._links.current_page;
    //   var hash        = {};
    //   // hash.q          = scope.query;
    //   hash.page       = scope.page;
    //   $location.search(hash);
    //   scope.init();
    // };

    // scope.clearQuery = function() {
    //   scope.query = undefined;
    // };

    scope.back = function() {
      window.location.href = '/#/locations/' + scope.location.slug + '/clients/' + scope.client.id;
    };

    scope.init();

  };

  return {
    link: link,
    scope: {
      loading: '='
    },
    templateUrl: 'components/orders/_table.html'
  };

}]);

app.directive('ordersShow', ['Order', '$routeParams', '$timeout', 'menu', '$mdDialog', 'showToast', 'showErrors', function(Order, $routeParams, $timeout, menu, $mdDialog, showToast, showErrors) {

  var link = function(scope) {

    scope.page      = $routeParams.page;
    scope.order     = { id: $routeParams.order_id };
    scope.client    = { id: $routeParams.client_id };
    scope.location  = { slug: $routeParams.id };

    // User permissions //

    var createMenu = function() {
      scope.menu = [{
        name: 'Refund',
        type: 'refund',
        icon: 'money_off',
        disabled: (scope.order.state !== 'success')
      }];

    };

    scope.action = function(type) {
      switch(type) {
        case 'refund':
          refund();
          break;
      }
    };

    scope.init = function() {
      Order.query({id: $routeParams.order_id}).$promise.then(function(results) {
        scope.order      = results;
        scope.loading     = undefined;
        createMenu();
      }, function(err) {

        scope.loading = undefined;
      });
    };

    var refund = function(ev) {
      $mdDialog.show({
        templateUrl: 'components/orders/_refund.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose:true,
        locals: {
          client: scope.client
        },
        controller: DialogController
      });
    };

    function DialogController($scope) {
      $scope.save = function() {
        scope.order.refund_reason = $scope.reason;
        refundOrder();
        $mdDialog.cancel();
      };

      $scope.close = function() {
        $mdDialog.cancel();
      };
    }
    DialogController.$inject = ['$scope'];

    var refundOrder = function() {
      Order.update({id: scope.order.id, store_order: { refund: true, reason: scope.order.refund_reason }}).$promise.then(function(results) {
        scope.order.state = 'refunded';
        showToast('The order was refunded. Refunds can take a few minutes.');
      }, function(err) {
        scope.order.refund_reason = undefined;
        showErrors(err);
      });
    };

    scope.toggle = function(section) {
      menu.toggleSelectSection(section);
    };

    scope.isOpen = function(section) {
      return menu.isSectionSelected(section);
    };

    scope.back = function() {
      if (scope.client.id) {
        window.location.href = '/#/locations/' + scope.location.slug + '/clients/' + scope.client.id + '/orders/';
      } else { 
      }
    };

    scope.init();

  };

  return {
    link: link,
    scope: {
      loading: '='
    },
    templateUrl: 'components/orders/_show.html'
  };

}]);

