'use strict';

var app = angular.module('myApp.integrations.services', ['ngResource',]);

app.factory('Integration', ['$resource', 'API_END_POINT',
  function($resource, API){

    return $resource(API + '/integrations/:id',
      {},
      {
      get: {
        method: 'GET',
        isArray: true,
        params: {
          user_id: '@user_id',
          q: '@q'
        }
      },
      query: {
        method: 'GET',
        isArray: false,
        params: {
          id: '@id'
        }
      },
      create: {
        method: 'POST',
        isArray: false,
        params: {
          integration: '@integration'
        }
      },
      update: {
        method: 'PATCH',
        isArray: false,
        params: {
          integration: '@integration',
          id: '@id'
        }
      },
      destroy: {
        method: 'DELETE',
        isArray: false,
        params: {
        }
      },
      slack_channels: {
        method: 'GET',
        isArray: true,
        cache: true,
        params: {
          'slack.channels': true
        }
      },
      chimp_lists: {
        method: 'GET',
        isArray: true,
        cache: true,
        params: {
          'chimp.lists': true
        }
      },
      twillio: {
        method: 'GET',
        isArray: true,
        cache: true,
        params: {
          'twillio.numbers': true
        }
      }
    }
  );
}]);

