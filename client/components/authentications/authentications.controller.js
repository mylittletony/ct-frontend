'use strict';

var app = angular.module('myApp.authentications.controller', []);

app.controller('AuthenticationsController', ['$scope', '$rootScope', '$cookies', 'Me', '$location', 'locationHelper', 'CTLogin', '$routeParams', '$localStorage', '$timeout',
  function($scope,$rootScope,$cookies,Me,$location,locationHelper,CTLogin,$routeParams,$localStorage,$timeout) {

    $scope.ct_login              = CTLogin;
    $scope.ct_login.active       = true;

    var domain = '.' + locationHelper.domain();
    var cookie = $cookies.get('_mta', {domain: domain});
    var sub    = locationHelper.subdomain();

    var login = function(token, search) {
      if (sub === 'my' || sub === 'dashboard') {
        sub = undefined;
      }
      window.location.href = '/auth/login?brand=' + sub + '&return_to=' + search;
    };

    var getMe = function() {
      Me.get({}).$promise.then(function(res) {
        console.log('CTME Auth 200');
        var loginArgs = { data: res };
        $rootScope.$broadcast('login', loginArgs);
        $scope.ct_login.active = undefined;
      }, function(err) {
        console.log('CTME Auth 401');
        $cookies.remove('_mta' );
        if ($localStorage.mimo_user) {
          $localStorage.mimo_user.refresh = undefined;
        }
        login();
      });
    };

    if ($routeParams.token) {
      delete $localStorage.mimo_user;
      $cookies.put('_mta', $routeParams.token, { domain: domain });
      $timeout(function() {
        getMe();
      }, 500);
    } else if ($routeParams.brand) {
      sub = $routeParams.brand;
      login();
    } else {
      login();
    }

}]);
