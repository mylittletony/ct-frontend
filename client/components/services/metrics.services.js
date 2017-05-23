'use strict';

var app = angular.module('myApp.metrics.services', ['ngResource',]);

app.factory('Metric', ['$resource', '$localStorage', 'API_END_POINT_V2',
  function($resource, $localStorage, API_END_POINT_V2){
    var token;
    if ($localStorage && $localStorage.user && $localStorage.user.api_token) {
      token = $localStorage.user.api_token;
    }
    return $resource(API_END_POINT_V2 + '/metrics',
      {
        'access_token': token
      },
      {
      // inventory: {
      //   method:'GET',
      //   isArray: false,
      //   params: {
      //     inventory: true,
      //   }
      // },
      // dashboard: {
      //   method:'GET',
      //   isArray: false,
      //   params: {
      //     dashboard: true,
      //   }
      // },
      clientstats: {
        method:'GET',
        isArray: false,
        // params: {}
        // params: {
        //   v: '@v',
        //   // v2: true, // can remove soon
        //   resource: '@resource',
        //   type: '@type',
        //   location_id: '@location_id',
        //   start: '@start',
        //   end: '@end',
        //   interval: '@interval',
        //   distance: '@distance',
        //   ap_mac: '@ap_mac'
        // }
      },
      // tx: {
      //   method:'GET',
      //   isArray: false,
      //   params: {
      //     tx: true,
      //     location_id: '@location_id',
      //     start: '@start',
      //     end: '@end',
      //     interval: '@interval',
      //     distance: '@distance',
      //     ap_mac: '@ap_mac'
      //   }
      // },
      // clients: {
      //   method:'GET',
      //   isArray: false,
      //   params: {
      //     clients: true,
      //     location_id: '@location_id',
      //     start: '@start',
      //     end: '@end',
      //     interval: '@interval',
      //     distance: '@distance',
      //     ap_mac: '@ap_mac'
      //   }
      // },
      // speedtests: {
      //   method:'GET',
      //   isArray: false,
      //   params: {
      //     speedtests: true,
      //     location_id: '@location_id',
      //     start: '@start',
      //     end: '@end',
      //     interval: '@interval',
      //     distance: '@distance',
      //     ap_mac: '@ap_mac'
      //   }
      // },
      // throughput: {
      //   method:'GET',
      //   isArray: false,
      //   params: {
      //     throughput: true,
      //     location_id: '@location_id',
      //     start: '@start',
      //     end: '@end',
      //     interval: '@interval',
      //     distance: '@distance',
      //     ap_mac: '@ap_mac'
      //   }
      // },
      // periscope: {
      //   method:'GET',
      //   isArray: false
      // },
      // signal: {
      //   method:'GET',
      //   isArray: false,
      //   params: {
      //     signal: true,
      //     location_id: '@location_id',
      //     start: '@start',
      //     end: '@end',
      //     interval: '@interval',
      //     distance: '@distance',
      //     ap_mac: '@ap_mac'
      //   }
      // },
      // bitrate: {
      //   method:'GET',
      //   isArray: false,
      //   params: {
      //     bitrate: true,
      //     location_id: '@location_id',
      //     start: '@start',
      //     end: '@end',
      //     interval: '@interval',
      //     distance: '@distance',
      //     ap_mac: '@ap_mac'
      //   }
      // },
      // quality: {
      //   method:'GET',
      //   isArray: false,
      //   params: {
      //     quality: true,
      //     location_id: '@location_id',
      //     start: '@start',
      //     end: '@end',
      //     interval: '@interval',
      //     distance: '@distance',
      //     ap_mac: '@ap_mac'
      //   }
      // },
      // create: {
      //   method:'POST',
      //   isArray: false,
      //   params: {
      //     location_id: '@location_id',
      //     start: '@start',
      //     end: '@end',
      //     type: '@type',
      //     interval: 'day'
      //   }
      // },
    });
  }]);

