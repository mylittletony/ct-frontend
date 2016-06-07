'use strict';

var app = angular.module('myApp.locations.services', ['ngResource',]);

app.factory('LocationCache', [function() {
  return { location: {} };
}]);

// app.factory('Data', function() {
//   return {};
// });

app.factory('Location', ['$resource', '$localStorage', 'API_END_POINT',
  function($resource, $localStorage, API_END_POINT){

    return $resource(API_END_POINT + '/locations/:id/:action',
      {
        q: '@q',
        id: '@id',
        location: '@location',
        action: '@action',
      },
      {
      favourites: {
        method: 'GET',
        isArray: false,
        dataType: 'json',
        params: {
          favourites: true,
          per: '@per'
        }
      },
      shortquery: {
        method: 'GET',
        isArray: true,
        dataType: 'json',
        params: {
          q: '@q',
          short: 'yep'
        }
      },
      query: {
        method: 'GET',
        isArray: false,
        dataType: 'json',
        params: {
          q: '@q',
          dashing: '@dashing',
        }
      },
      all: {
        method: 'GET',
        isArray: false,
        dataType: 'json',
        params: {
          q: '@q',
          user_id: '@user_id',
          all: '@all'
        }
      },
      destroy: {
        method: 'DELETE',
        isArray: false,
        dataType: 'json',
        params: {
          id: '@id'
        }
      },
      users: {
        method: 'GET',
        isArray: false,
        dataType: 'json',
        params: {
          q: '@q',
          id: '@id',
          action: 'users'
        }
      },
      add_user: {
        method: 'POST',
        isArray: false,
        dataType: 'json',
        params: {
          action: 'users'
        }
      },
      del_user: {
        method: 'DELETE',
        isArray: false,
        dataType: 'json',
        params: {
          action: 'users'
        }
      },
      watch: {
        method: 'POST',
        isArray: false,
        dataType: 'json',
        params: {
          action: 'watchers'
        }
      },
      unwatch: {
        method: 'DELETE',
        isArray: false,
        dataType: 'json',
        params: {
          action: 'watchers'
        }
      },
      enable_sense: {
        method: 'POST',
        isArray: false,
        dataType: 'json',
        params: {
          action: 'sense'
        }
      },
      disable_sense: {
        method: 'DELETE',
        isArray: false,
        dataType: 'json',
        params: {
          action: 'sense'
        }
      },
      clone: {
        method: 'POST',
        isArray: false,
        dataType: 'json',
        params: {
          action: 'duplicate'
        }
      },
      archive: {
        method: 'POST',
        isArray: false,
        dataType: 'json',
        params: {
          action: 'archive'
        }
      },
      unarchive: {
        method: 'POST',
        isArray: false,
        dataType: 'json',
        params: {
          action: 'unarchive'
        }
      },
      update: {
        method: 'PATCH',
        isArray: false,
        params: {
          walledgardens: '@walledgardens'
        }
      },
      stats: {
        method: 'GET',
        isArray: false,
        dataType: 'json',
        params: {
          action: 'stats'
        }
      },
      firewall: {
        method: 'GET',
        isArray: true,
        dataType: 'json',
        params: {
          action: 'firewall_rules'
        }
      },
      walledgardens: {
        method: 'GET',
        isArray: true,
        dataType: 'json',
        params: {
          action: 'walledgardens'
        }
      },
      events: {
        method: 'GET',
        isArray: true,
        dataType: 'json',
        params: {
          action: 'location_events',
          id: '@id'
        }
      },
      networks: {
        method: 'GET',
        isArray: false,
        dataType: 'json',
        params: {
          action: 'networks'
        }
      },
      blacklists: {
        method: 'GET',
        isArray: true,
        dataType: 'json',
        params: {
          action: 'blacklists'
        }
      },
      layouts: {
        params: {
          action: 'layout'
        }
      },
      clone_layouts: {
        method: 'POST',
        params: {
          action: 'duplicate_logins'
        }
      },
      reset_layouts: {
        method: 'POST',
        params: {
          action: 'reset_logins'
        }
      },
      save: {
        method:'POST',
        isArray: false,
        params: {
        }
      },
      transfer: {
        method:'POST',
        isArray: false,
        params: {
          action: 'transfer',
          account_id: '@accountId'
        }
      },
      get: {
        method:'GET',
        isArray: false,
        params: {
        }
      }
    });
  }]);

app.factory('LocationAccess', ['$resource', '$localStorage', 'API_END_POINT',
  function($resource, $localStorage, API_END_POINT){
    return $resource(API_END_POINT + '/locations/:id/:action', {
      id: '@id',
      action: '@action'
    }, {
      get: {
        params: {
          action: 'access'
        }
      },
      update: {
        method: 'PATCH',
        params: {
          action: 'access',
          location: '@location'
        }
      },
      fb_verify_page: {
        method: 'POST',
        params: {
          action: 'fb_verify_page',
          page_id: '@page_id'
        }
      },
      fb_get_pages: {
        method: 'POST',
        params: {
          action: 'fb_get_pages',
          auth: '@auth'
        }
      },
    });
  }]);

app.factory('LocationSessions', ['$resource', '$localStorage', 'API_END_POINT',

  function($resource, $localStorage, API_END_POINT){
    return $resource(API_END_POINT + '/accounts/:id/:action', {
  });

}]);
