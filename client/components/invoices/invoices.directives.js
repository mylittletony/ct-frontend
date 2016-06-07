'use strict';

var app = angular.module('myApp.invoices.directives', []);

app.directive('refundInvoice', ['Invoice', 'Auth', '$compile', '$routeParams', function(Invoice, Auth, $compile, $routeParams) {

  var link = function( scope, element, attrs ) {

    if ( Auth.currentUser().pss === true) {
      var template =
        '<span class=\'right\'>'+
        '<h3>Refund</h3>'+
        '<div ng-show=\'errors\'>'+
        '{{errors[0]}}'+
        '</div>'+
        '<div ng-show=\'success\'>'+
        'We have refunded the invoice.'+
        '</div>'+
        '<div ng-hide=\'success\'>'+
        '<a href=\'\' ng-click=\'refund()\' ng-hide=\'loading || errors\' class=\'button alert small\'> Refund</a>'+
        '<div id=\'refund-amount\' ng-show=\'loading\''+
        '<label for=\'refund-amount\'></label>'+
        '<input type=\'text\' name=\'amount\' ng-model=\'amount\' placeholder=\'Refund amount.\'>'+
        '<p><small>Leave blank to refund it all</small></p>'+
        '<a class=\'button tiny\' ng-click=\'processRefund(amount)\'>Refund</a>' +
        '</div>'+
        '</div>'+
        '</span>';
      var templateObj = $compile(template)(scope);
      element.html(templateObj);
    }

    scope.refund = function() {
      scope.loading = true;
    };

    scope.processRefund = function() {
      var msg = 'You\'re about to refund £' + scope.amount || 'ALL' + 'of this invoice. Are you sure you want to do this?';
      if ( window.confirm(msg) ) {
        refund(scope.amount);
      }
    };

    function refund(amount) {
      Invoice.refund({id: attrs.id, amount: amount}).$promise.then(function(results) {
        scope.errors = undefined;
        scope.loading = undefined;
        scope.success = true;
      }, function(err) {
        scope.errors = err.data.message;
        scope.loading = undefined;
        scope.success = undefined;
      });
    }
  };

  return {
    link: link,
    scope: {
      id: '@'
    }
  };
}]);

