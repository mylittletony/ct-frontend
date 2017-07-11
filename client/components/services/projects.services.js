'use strict';

var app = angular.module('myApp.projects.services', ['ngResource',]);

app.factory('ProjectListing', [function() {
  return { projects: [] };
}]);

app.factory('Project', ['$resource', '$localStorage', 'API_END_POINT',
  function($resource, $localStorage, API_END_POINT){
    return $resource(API_END_POINT + '/projects/:id',
      {
        q: '@q',
        id: '@id'
      },
      {
      get: {
        method: 'GET',
        isArray: false,
        dataType: 'json',
        params: {
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
        isArray: false
      },
      create: {
        method: 'POST',
        isArray: false,
        params: {
          id: '@id'
        }
      },
      destroy: {
        method: 'DELETE',
        isArray: false,
        params: {
          id: '@id'
        }
      }
    });
  }]);

