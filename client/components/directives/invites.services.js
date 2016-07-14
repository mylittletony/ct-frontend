'use strict';

var app = angular.module('myApp.invites.services', ['ngResource',]);

app.factory('Invite', ['$resource', 'API_END_POINT',
  function($resource, API){

    return $resource(API + '/invites/:id/:action',
      {
        token: '@token'
      },
      {
      get: {
        method: 'GET',
        isArray: true
      },
      query: {
        method: 'GET',
        isArray: false,
        params: {
          id: '@id',
          email: '@email',
          invite_token: '@invite_token'
        }
      },
      create: {
        method: 'POST',
        isArray: false,
        params: {
          user_id: '@user_id',
          invite: '@invite'
        }
      },
      update: {
        method: 'PATCH',
        isArray: false,
        params: {
          user_id: '@user_id',
          invite: '@invite'
        }
      },
      destroy: {
        method: 'DELETE',
        isArray: false,
        params: {
          user_id: '@user_id',
          invite: '@invite'
        }
      },
    }
  );
}]);

