'use strict';

var app = angular.module('myApp.boxes.services', ['ngResource',]);

app.factory('Box', ['$resource', 'API_END_POINT',
  function($resource, API_END_POINT){
    return $resource(API_END_POINT + '/boxes/:id/:action',
      {
        q: '@q',
        id: '@id',
        action: '@action'
      },
      {
      geodata: {
        method: 'GET',
        isArray: true,
        dataType: 'json',
        params: {
          q: '@q',
          geodata: 'true'
        }
      },
      get: {
        method: 'GET',
        isArray: false,
        dataType: 'json',
        params: {
          q: '@q',
          location_id: '@location_id'
        }
      },
      save: {
        method: 'POST',
        isArray: false,
        dataType: 'json',
        params: {
          q: '@q',
          location_id: '@location_id'
        }
      },
      query: {
        method: 'GET',
        isArray: false,
        dataType: 'json',
        params: {
          q: '@q',
          machine_type: '@machine_type'
        }
      },
      status: {
        method: 'GET',
        isArray: false,
        params: {
          id: '@id',
          action: 'status'
        }
      },
      update: {
        method: 'PATCH',
        isArray: false,
        params: {
          box: '@box'
        }
      },
      destroy: {
        method: 'DELETE',
        params: {
        }
      },
      alerts: {
        method: 'PATCH',
        isArray: false,
        dataType: 'json',
        params: {
          q: '@q',
          id: '@id',
          alerts: '@alerts',
          action: 'alerts'
        }
      },
      reset: {
        method: 'POST',
        isArray: false,
        dataType: 'json',
        params: {
          q: '@q',
          id: '@id',
          action: 'reset'
        }
      },
      reboot: {
        method: 'POST',
        isArray: false,
        dataType: 'json',
        params: {
          q: '@q',
          id: '@id',
          action: 'reboot'
        }
      },
      transfer: {
        method: 'POST',
        isArray: false,
        dataType: 'json',
        params: {
          q: '@q',
          transfer_to: '@transfer_to',
          action: 'transfer'
        }
      },
      payload: {
        method: 'POST',
        isArray: false,
        dataType: 'json',
        params: {
          q: '@q',
          payload_id: '@payload_id',
          box_ids: '@box_ids',
          action: 'payloads'
        }
      },
      speedtests: {
        method: 'GET',
        isArray: true,
        dataType: 'json',
        params: {
          q: '@q',
          id: '@id',
          action: 'speedtests'
        }
      },
      create_speedtests: {
        method: 'POST',
        isArray: false,
        dataType: 'json',
        params: {
          q: '@q',
          id: '@id',
          action: 'speedtests'
        }
      },
      detect: {
        method: 'POST',
        isArray: true,
        dataType: 'json',
        params: {
          action: 'detect'
        }
      }
    });
  }]);

app.factory('LocationBox', ['$resource', 'API_END_POINT',
  function($resource, API_END_POINT){
    return $resource(API_END_POINT + '/locations/:location_id/boxes/:id',
      {
        q: '@q',
        id: '@id',
        location_id: '@location_id'
      },
      {
      get: {
        method: 'GET',
        isArray: false,
        dataType: 'json',
        params: {
          q: '@q',
          location_id: '@location_id'
        }
      },
      query: {
        method: 'GET',
        isArray: true,
        dataType: 'json',
        params: {
          q: '@q',
          location_id: '@location_id'
        }
      },
      save: {
        method: 'POST',
        isArray: false,
        dataType: 'json',
        params: {
          q: '@q',
          location_id: '@location_id'
        }
      },
      update: {
        method: 'PATCH',
        isArray: true,
        params: {
        }
      },
      destroy: {
        method: 'DELETE',
        params: {
          id: '@id'
        }
      }
    });
  }]);

