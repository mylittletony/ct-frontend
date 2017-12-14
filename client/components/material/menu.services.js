'use strict';

var app = angular.module('myApp.menu.services', ['ngResource',]);

app.factory('menu', ['$location', '$rootScope', function ($location, $rootScope) {

  var sections = [{
  }];

  var self;

  return self = {
    sections: sections,
    isOpen: true,

    toggleSelectSection: function (section) {
      self.openedSection = (self.openedSection === section ? null : section);
    },
    isSectionSelected: function (section) {
      return self.openedSection === section;
    }
  };

}]);

app.factory('showToast', ['$mdToast', 'gettextCatalog', function ($mdToast, gettextCatalog) {

  function t(msg) {
    var toast = $mdToast.simple()
    .textContent(msg)
    .action(gettextCatalog.getString('Close'))
    .highlightAction(true)
    .hideDelay(3000);
    $mdToast.show(toast);
  }

  return t;

}]);

app.factory('showErrors', ['$mdBottomSheet', 'gettextCatalog', function ($mdBottomSheet, gettextCatalog) {

  // Serious tidy in order //
  // Should handle all the errors gracefully. It doesn't //

  var formatErrors = function(errors) {
    var e = [];
    var err, res;
    var errorMsgs = [
          gettextCatalog.getString("Splash codes can't be created on the free plans"),
          gettextCatalog.getString("Captive portal enabled on multiple SSIDs. This is not possible without using a zone."),
          gettextCatalog.getString("Channel can't be blank"),
          gettextCatalog.getString("Channel is invalid")
        ];
    if (errors.data && errors.data.errors) {
      alert(123192837)
      res = errors.data.errors;
    }
    if (res) {
      var keys = Object.keys(res);
      if (keys && keys[0] === '0') {
        for (var i = 0; i < res.length; i++) {
          e.push(res[i]);
        }
      } else if (keys) {
        angular.forEach(keys, function(v,k) {
          e.push(v.split('_').join(' ')  + ' ' + res[v]);
        });
      }
    } else if (errors.data && errors.data.message) {
      alert(123)
      // This should loop through the array and remove the 'keys'
      // The keys don't actually work though since Rails sends full messages
      e.push(errors.data.message);
    } else if (errors && errors.data) {
      err = errors.data || 'An unknown error occurred, try again.';
      e.push(err);
    } else if (errors && errors.message) {
      err = errors.message;
      e.push(err);
    } else {
      console.log(errors);
      e.push(gettextCatalog.getString('An unknown error occurred, please try again.'));
    }
    if (e.length > 0) {
      return e[0];
    } else {
      return e;
    }
  };

  function MenuCtrl($scope, errors) {
    $scope.errors = errors;
    $scope.close = function() {
      $mdBottomSheet.hide();
    };
  }
  MenuCtrl.$inject = ['$scope','errors'];

  function t(msg) {
    var errors = formatErrors(msg);
    if (errors && errors.length > 0) {
      $mdBottomSheet.show({
        templateUrl: 'components/views/templates/_error_msg.html',
        locals: {
          errors: errors
        },
        controller: MenuCtrl,
        clickOutsideToClose: true
      });
    }
  }

  return t;

}]);

