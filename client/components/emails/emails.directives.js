'use strict';

var app = angular.module('myApp.emails.directives', []);

app.directive('emailOptInConfirm', ['Email', '$routeParams', function(Email, $routeParams) {

  var link = function(scope, element, attrs) {

    scope.email = {id: $routeParams.email_id};

    var init = function() {
      if ($routeParams.code) {
        Email.update({}, {
          id: scope.email.id,
          action: 'confirm',
          code: $routeParams.code
        }).$promise.then(function(data) {
          scope.message = 'Thanks! You can always update your preferences below.';
          scope.success = true;
        }, function(err) {
          scope.message = 'Unable to confirm email address';
          scope.success = undefined;
        });
      } else {
        scope.message = 'Code required to confirm email address.';
        scope.loading = undefined;
        scope.success = undefined;
      }
    };

    init();
  };

  return {
    link: link,
    scope: {
      loading: '='
    },
    templateUrl: 'components/emails/_confirm.html'
  };

}]);
