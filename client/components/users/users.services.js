'use strict';

var app = angular.module('myApp.users.services', ['ngResource',]);

app.factory('Auth', ['$window', '$rootScope', '$localStorage', '$http', '$q', 'Logout', '$location', 'AccessToken', 'locationHelper', 'AUTH_URL', function($window, $rootScope, $localStorage, $http, $q, Logout, $location, AccessToken, locationHelper, AUTH_URL) {

    var user = null;

    var readStoredUser = function () {
      var storedUser = $localStorage.user;
      user = storedUser;
      try {
        if(storedUser) {
        }
      } catch (ex) {}
    };

    var currentUser = function currentUser() {
      if(!user) {
        readStoredUser();
      }
      return user;
    };

    var saveUser = function(userToSave) {
      $localStorage.user = (userToSave);
    };

    var refresh = function(data) {
      var deferred = $q.defer();
      AccessToken.set(data.access_token);
      $localStorage.user.refresh = data.refresh_token;
      deferred.resolve();
      return deferred.promise;
    };

    var login = function(data) {
      var deferred = $q.defer();
      var userToSave = data;
      saveUser(userToSave);
      deferred.resolve(data);
      return deferred.promise;
    };

    var fullLogin = function(data) {
      var deferred = $q.defer();
      deferred.resolve(data);
      var sub = locationHelper.subdomain();
      window.location.href = '/auth/login?brand=' + sub + '&return_to=' + 'search';
      return deferred.promise;
    };

    var logout = function() {
      var deferred = $q.defer();
      AccessToken.del();
      delete $localStorage.user;
      $('.hidden-boy').removeClass('real-boy');
      var sub = locationHelper.subdomain();
      window.location.href = AUTH_URL + '/logout?brand=' + sub;
    };

    return {
      currentUser: currentUser,
      saveUser: saveUser,
      logout: logout,
      login: login,
      fullLogin: fullLogin,
      refresh: refresh
    };

}]);

app.factory('UserSettings', ['$resource', 'API_END_POINT',
  function($resource, API_END_POINT){
    return $resource(API_END_POINT + '/user_settings', {}, {
      get: {
        params: {
        }
      },
      update: {
        method: 'PATCH',
        params: {
          user_settings: '@user_settings'
        }
      },
    });
  }
]);

app.factory('Me', ['$resource', 'API_END_POINT',
  function($resource, API_END_POINT){
    return $resource(API_END_POINT + '/me.json', {}, {
      get: {
        params: {
        }
      },
    });
  }
]);

app.factory('User', ['$resource', '$localStorage', 'API_END_POINT',
  function($resource, $localStorage, API){

    return $resource(API + '/users/:id/:action',
      {
        token: '@token'
      },
      {
      get: {
        method: 'GET',
        isArray: true
      },
      distro: {
        method: 'POST',
        isArray: false,
        params: {
          action: 'distro',
          dst: '@id'
        }
      },
      switcher: {
        method: 'POST',
        isArray: false,
        params: {
          action: 'switch',
          account_id: '@account_id'
        }
      },
      sessions: {
        method: 'GET',
        isArray: false,
        params: {
          id: '@id',
          action: 'user_sessions'
        }
      },
      query: {
        method: 'GET',
        isArray: false,
        params: {
          id: '@id'
        }
      },
      update: {
        method: 'PATCH',
        isArray: false,
        params: {
          id: '@id',
          user: '@user'
        }
      },
      logout_all: {
        method: 'POST',
        isArray: false,
        params: {
          action: 'logout_all',
          id: '@id'
        }
      },
      password: {
        method: 'PATCH',
        isArray: false,
        params: {
          password: '@password',
          action: 'password',
          id: '@id',
          password_confirmation: '@password_confirmation',
          user: '@user'
        }
      }
    }
  );
}]);

app.factory('Logout', ['$resource', 'API_URL',
  function($resource, API_URL){

    return $resource(API_URL + '/oauth/revoke',
      {
        token: '@token'
      },
      {
      logout: {
        method: 'POST',
        isArray: false
      },
      get: {
        method: 'GET',
        isArray: false
      },
    }
  );
}]);

app.factory('Inventory', ['$resource', 'API_END_POINT',
  function($resource, API){

    return $resource(API + '/inventories',
      {
      },
      {
      get: {
        method: 'GET',
        isArray: false,
        params: {
          id: '@id'
        }
      },
      show: {
        method: 'GET',
        isArray: false,
        params: {
          summary: true
        }
      },
    }
  );
}]);
