'use strict';

var app = angular.module('myApp.forms.services', ['ngResource',]);

app.factory('FormListing', [function() {
  return { forms: [] };
}]);

app.factory('Form', ['$resource', '$localStorage', 'API_END_POINT',
  function($resource, $localStorage, API_END_POINT){
    return $resource(API_END_POINT + '/locations/:location_id/registration_forms/:id',
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
          location_id: '@location_id',
          splash_page_id: '@splash_page_id'
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
          registration_form: '@form'
        }
      },
      create: {
        method: 'POST',
        isArray: false,
        params: {
          location_id: '@location_id',
          registration_form: '@form'
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

