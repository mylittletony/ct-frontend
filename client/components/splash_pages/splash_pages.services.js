'use strict';

var app = angular.module('myApp.splash_pages.services', ['ngResource',]);

app.factory('designer', ['$location', '$rootScope', function ($location, $rootScope) {

  // var splash = {s: {}};

  var self;

  var save = function() {
  }

  return {
    splash: {},
    save: save
  };

}]);

app.factory('SplashPageForm', ['$http', 'API_END_POINT', '$q', '$httpParamSerializer',
  function($http, API_END_POINT, $q, $httpParamSerializer){

    var update = function(params) {

      var deferred = $q.defer();
      $http({
        method: 'PATCH',
        url: API_END_POINT + '/locations/' + params.location_slug + '/splash_pages/' + params.id ,
        headers : { 'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8' },
        data: $httpParamSerializer(params),
      }).
        success(function(msg) {
          deferred.resolve(msg);
        }).
          error(function(err) {
            deferred.reject(err);
          });
          return deferred.promise;
    };

    return {
      update: update
    };

  }]);

app.factory('SplashPage', ['$resource', 'API_END_POINT',
  function($resource, API_END_POINT){
    return $resource(API_END_POINT + '/locations/:location_id/splash_pages/:id/:action',
      {
        q: '@q',
        location_id: '@location_id',
        id: '@id',
        copy_to: '@copy_to'
      },
      {
      get: {
        method: 'GET',
        isArray: false,
        dataType: 'json',
        params: {
          location_id: '@location_id'
        }
      },
      query: {
        method: 'GET',
        isArray: false,
        dataType: 'json',
        params: {
          q: '@q',
          location_id: '@location_id',
          id: '@id'
        }
      },
      update: {
        method: 'PATCH',
        isArray: false
      },
      duplicate: {
        method: 'POST',
        isArray: false,
        params: {
          location_id: '@location_id',
          id: '@id',
          action: 'duplicate',
          network_id: '@network_id'
        }
      },
      create: {
        method: 'POST',
        isArray: false,
        params: {
          location_id: '@location_id',
          splash_page: '@splash_page'
        }
      },
      destroy: {
        method: 'DELETE',
        isArray: false,
        params: {
          location_id: '@location_id'
        }
      },
      create_store: {
        method: 'POST',
        isArray: false,
        dataType: 'json',
        params: {
          q: '@q',
          location_id: '@location_id',
          id: '@splash_id',
          action: 'stores'
        }
      },
      update_store: {
        method: 'PATCH',
        isArray: false,
        dataType: 'json',
        params: {
          location_id: '@location_id',
          id: '@splash_id',
          action: 'stores',
          store: '@store'
        }
      },
      store: {
        method: 'GET',
        isArray: false,
        dataType: 'json',
        params: {
          location_id: '@location_id',
          id: '@id',
          action: 'stores'
        }
      },
    });
  }]);


