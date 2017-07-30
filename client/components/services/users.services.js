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
      $localStorage.user = userToSave;
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

app.factory('Me', ['$resource', 'API_END_POINT',
  function($resource, API_END_POINT){
    return $resource(API_END_POINT + '/me.json', {}, {
      get: {
        cache: true
      },
    });
  }
]);

app.factory('User', ['$resource', 'API_END_POINT',
  function($resource, API){

    return $resource(API + '/users/:id/:action',
      {
        token: '@token',
        id: '@id',
        action: '@action'
      },
      {
      get: {
        method: 'GET',
        isArray: true
      },
      promos: {
        method: 'GET',
        isArray: false,
        action: 'promos'
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
        isArray: false
      },
      logout_all: {
        method: 'POST',
        isArray: false,
        params: {
          action: 'logout_all',
          id: '@id'
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

app.factory('Translate', ['$cookies', 'gettextCatalog', 'amMoment', function($cookies, gettextCatalog, amMoment) {

  //var supported = {'en_GB': true, 'de_DE': true, 'fr_FR': true, 'it': true, 'ro': true};
  // var supported = {'en_GB': true, 'de_DE': true};
  // var language, userLocale, amLocale;

  // function fixLocale(locale) {
  //   if (!locale) {
  //     return undefined;
  //   }

  //   var intermediate = locale.split('-');
  //   locale = intermediate[0];

  //   // To add support for more languages, make sure they're added here
  //   if (locale === 'en') {
  //     return 'en_GB';
  //   } else if (locale === 'de') {
  //     return 'de_DE';
  //   // } else if (locale === 'fr') {
  //   //   return 'fr_FR';
  //   // } else if (locale === 'it') {
  //   //   return 'it';
  //   // } else if (locale === 'ro') {
  //   //   return 'ro';
  //   } else {
  //     return undefined;
  //   }
  // }

  // function setLanguage() {
  //   if (navigator.languages) {
  //     for (var i = 0;  language === undefined && navigator.languages !== null && i < navigator.languages.length; ++i) {
  //       var lang = navigator.languages[i].substr(0, 2);
  //       language = fixLocale(lang);
  //       if (supported[lang]) {
  //         language = lang;
  //       }
  //     }
  //   } else {
  //     var lang = navigator.language.substr(0, 2);
  //     language = fixLocale(lang);
  //     if (supported[lang]) {
  //       language = lang;
  //     }
  //   }
  // }

  // var _load = function() {

  //   userLocale =  $cookies.get('locale');

  //   language = fixLocale(userLocale);

  //   //if the cookie is empty try if one of
  //   //the user's browser language preferences
  //   //is supported
  //   if (language === undefined) {
  //     setLanguage();
  //   }

  //   //if the user's browser language preferences
  //   //are not supported languages
  //   //fall back to english
  //   if (!supported[language]) {
  //     language = 'en_GB';
  //   }

  //   //don't forget to add angular moment's
  //   //language.json files to index.html
  //   //when more language are supported
  //   //(for now it's just en and de)
  //   var intermediate = language.split('_');
  //   amLocale = intermediate[0];

  //   gettextCatalog.setCurrentLanguage(language);
  //   gettextCatalog.loadRemote('/translations/' + language + '.json');
  //   amMoment.changeLocale(amLocale);
  // };

  return {
    // load: _load
  };

}]);
