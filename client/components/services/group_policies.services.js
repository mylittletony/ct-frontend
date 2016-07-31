'use strict';

var app = angular.module('myApp.group_policies.services', ['ngResource',]);

app.factory('GroupPolicyListing', [function() {
  return { group_policies: [] };
}]);

app.factory('GroupPolicy', ['$resource', '$localStorage', 'API_END_POINT',
  function($resource, $localStorage, API_END_POINT){
    return $resource(API_END_POINT + '/locations/:location_id/group_policies/:id',
      {
        q: '@q',
        location_id: '@location_id',
        id: '@id'
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
          q: '@q'

        }
      },
      update: {
        method: 'PATCH',
        isArray: false,
        params: {
          location_id: '@location_id',
          client_filter: '@client_filter'
        }
      },
      create: {
        method: 'POST',
        isArray: false,
        params: {
          location_id: '@location_id',
          client_filter: '@client_filter'
        }
      },
      destroy: {
        method: 'DELETE',
        isArray: false,
        params: {
          location_id: '@location_id'
        }
      }
    });
  }]);

