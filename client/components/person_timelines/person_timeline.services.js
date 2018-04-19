'use strict';

var app = angular.module('myApp.person_timelines.services', ['ngResource',]);

app.factory('PersonTimeline', ['$resource', '$localStorage', 'API_END_POINT',
  function($resource, $localStorage, API_END_POINT){
    return $resource(API_END_POINT + '/locations/:location_id/people/:person_id/person_timelines',
      {
        location_id: '@location_id',
        person_id: '@person_id'
      },
      {
      query: {
        method: 'GET',
        isArray: false,
        dataType: 'json'
      }
    });
  }]);

app.factory('PersonTimelinePortal', ['$resource', '$localStorage', 'API_END_POINT',
  function($resource, $localStorage, API_END_POINT){
    return $resource(API_END_POINT + '/person_timelines/:person_id',
      {
        person_id: '@person_id',
        code: '@code'
      },
      {
      query: {
        method: 'GET',
        isArray: false,
        dataType: 'json'
      },
      download: {
        method: 'PATCH',
        isArray: false,
        params: {
          email: '@email',
          action: 'download'
        }
      },
      destroy: {
        method: 'DELETE',
        isArray: false,
        dataType: 'json'
      }
    });
  }]);