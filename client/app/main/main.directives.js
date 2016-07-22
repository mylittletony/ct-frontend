'use strict';

/* Controllers */

var app = angular.module('myApp.directives', [

  'myApp.apps.directives',
  'myApp.audits.directives',
  'myApp.brands.directives',
  'myApp.boxes.directives',
  'myApp.codes.directives',
  'myApp.charts.directives',
  'myApp.commands.directives',
  'myApp.clients.directives',
  'myApp.group_policies.directives',
  'myApp.distros.directives',
  'myApp.docs.directives',
  'myApp.emails.directives',
  'myApp.events.directives',
  'myApp.forms.directives',
  'myApp.firmwares.directives',
  'myApp.google.maps.directives',
  'myApp.guests.directives',
  'myApp.invoices.directives',
  'myApp.invites.directives',
  'myApp.locations.directives',
  'myApp.main.directives',
  'myApp.menu.directives',
  'myApp.networks.directives',
  'myApp.payloads.directives',
  'myApp.plans.directives',
  'myApp.port_forwards.directives',
  'myApp.quotas.directives',
  'myApp.registrations.directives',
  'myApp.reports.v2.directives',
  // 'myApp.sessions.directives',
  'myApp.social.directives',
  'myApp.splash_codes.directives',
  'myApp.splash_pages.directives',
  'myApp.triggers.directives',
  'myApp.versions.directives',
  'myApp.vouchers.directives',
  'myApp.users.directives',
  'myApp.webhooks.directives',
  'myApp.zones.directives'

]);

app.directive('formErrors', [function () {
  return {
    restrict: 'E',
    template: '<p class="text text-danger" ng-show="myForm.errors"><b>There\'s been a problem saving the form. A list of errors can be found above.</b></p>'
  };
}]);

app.directive('formSuccess', [function () {
  return {
    restrict: 'E',
    template: '<p class="text-success"><b>Settings Updated <i class="fa fa-check fa-fw"></i></b></p>'
  };
}]);

app.factory('onlineStatus', ['$window', '$rootScope', function ($window, $rootScope) {
    var onlineStatus = {};

    onlineStatus.onLine = $window.navigator.onLine;

    onlineStatus.isOnline = function() {
        return onlineStatus.onLine;
    };

    $window.addEventListener('online', function () {
        onlineStatus.onLine = true;
        $rootScope.$digest();
    }, true);

    $window.addEventListener('offline', function () {
        onlineStatus.onLine = false;
        $rootScope.$digest();
    }, true);

    return onlineStatus;
}]);

app.directive('sidebar', ['$compile', '$location', '$routeParams', function ($compile, $location, $routeParams) {

  var link = function(scope,element,attrs) {

    function sortSideBar () {
      var path = $location.path().split('/');
      var base = path[1];
      var sub = path[3];
      if ( base !== undefined) {
        if ( sub === 'boxes' && $routeParams.id !== undefined) {
          scope.box = { slug: $routeParams.id };
          scope.location = { slug: $routeParams.location_id };
          scope.getSideBar = 'components/locations/layouts/sidebar.html';
        }
        else if (base === 'locations') {
          var id = $routeParams.location_id || $routeParams.id;
          scope.location = { slug: id };
          scope.getSideBar = 'components/locations/layouts/sidebar.html';
        }
        else if (base === 'me' || base === 'users') {
          scope.getSideBar = 'components/users/layouts/sidebar.html';
        }
      }
    }

    scope.$on('$routeChangeSuccess', function (event, current, previous) {
      sortSideBar();
    });

  };

  return {
    link: link,
    template: '<div ng-include="getSideBar"></div>'
  };
}]);

app.directive('navbar', ['$compile', '$location', function ($compile, $location) {

  var link = function(scope,element,attrs) {

  };

  return {
    link: link,
    templateUrl: 'components/navbar/navbar.html'
  };

}]);

app.directive('filepicker', ['$compile', function ($compile) {

  var link = function(scope,element,attrs) {

    var options = {};

    filepicker.setKey('AOEp4NPeVQ1s5VydEkh3Qz');
    scope.upload = function() {
      if (attrs.type === '1') {
        options = { width: 200 };
      }
      else if ( attrs.type === '2') {
        options = { width: 851, height: 315, fit: 'scale' };
      }
      else if ( attrs.type === '10') { // bg image
        options = { width: 1200 };
      }

      else if ( attrs.type === '20') { // bg image
        options = { width: 300, height: 45 };
      }

      pickFile(options);
    };

    var pickFile = function() {
      filepicker.pick(
        function(Blob){
          scope.uploading = true;
          scope.$apply(function () {
            imageHandler(Blob, options);
          });
        }
      );
    };

    var imageHandler = function(Blob, options) {
      filepicker.convert(Blob, options,
      function(newBlob){
        scope.$apply(function () {
          convert(newBlob);
        });
      });
    };

    var convert = function(Blob) {
      convertToCDN(Blob.url);
    };

    var convertToCDN = function(name) {
      var split = name.split('/');
      var filename = split[split.length - 1];
      scope.attribute = 'https://d247kqobagyqjh.cloudfront.net/api/file/' + filename;
      scope.uploading = undefined;
      scope.uploaded  = true;
    };
  };

  return {
    link: link,
    template: '<md-button class=\'md-primary\' ng-click=upload()>Upload</md-button>',
    scope: {
      attribute: '=',
      uploading: '=',
      uploaded: '=',
      type: '@'
    }
  };
}]);

app.directive('confirmOnExit', ['$mdDialog', '$location','gettextCatalog', function($mdDialog,$location, gettextCatalog) {
  return {
    link: function($scope, elem, attrs) {

      var n = true;
      $scope.$on('$locationChangeStart', function(event, next, current) {
        if ($scope.myForm.$dirty && n) {
          event.preventDefault();
          var confirm = $mdDialog.confirm()
          .title(gettextCatalog.getString('Unsaved Changes'))
          .textContent(gettextCatalog.getString('You have unsaved changes. Are you sure you want to leave the page?'))
          .ariaLabel(gettextCatalog.getString('Unsaved'))
          .ok(gettextCatalog.getString('Continue'))
          .cancel(gettextCatalog.getString('Cancel'));
          $mdDialog.show(confirm).then(function() {
            n = undefined;
            window.location.href = next;
          });
        }
      });
    }
  };
}]);

app.directive('cardForm', [function() {

  function link(scope,element,attrs) {

  }

  return {
    link: link,
    scope: {
      form: '=',
      card: '='
    },
    template:
      '<div>'+
      // '<form stripe-form="stripeCallback" name=\'myForm\'>'+
      '<div layout="row" layout-wrap>'+
      '<md-input-container class="md-block" flex="100">'+
      '<label>Card Number</label>'+
      '<input md-autofocus type=\'text\' ng-model=\'number\' placeholder=\'Card Number\' payments-format=\'card\' payments-validate=\'card\' name=\'card\' value=\'\'/>'+
      '<div ng-messages="form.card.$error">'+
      '<div ng-message="card">Card number invalid</div>'+
      '</div>'+
      '</md-input-container>'+
      '<md-input-container class="md-block" flex="100" flex-gt-sm="50">'+
      '<label for=\'expiry\'>Expiry Date</label>'+
      '<input type=\'text\' ng-model=\'expiry\' placeholder=\'Expiration\' payments-format=\'expiry\' payments-validate=\'expiry\' name=\'expiry\'/>'+
      '<div ng-messages="form.expiry.$error">'+
      '<div ng-message="expiry">Invalid expiry date</div>'+
      '</div>'+
      '</md-input-container>'+
      '<md-input-container class="md-block" flex="100" flex-gt-sm="50">'+
      '<label for=\'cvc\'>Security Code (CVC)</label>'+
      '<input type=\'text\' ng-model=\'cvc\' placeholder=\'CVC\' payments-validate=\'cvc\' payments-format=\'cvc\' name=\'cvc\'/>'+
      '<div ng-messages="form.cvc.$error">'+
      '<div ng-message="expiry">Invalid CVC</div>'+
      '</div>'+
      '</md-input-container>'+
      '</div>'
  };

}]);
