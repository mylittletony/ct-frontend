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
      query: {
        method: 'GET',
        isArray: false,
        dataType: 'json',
        params: {
          id: '@id'
        }
      },
      get: {
        method: 'GET',
        isArray: false,
        dataType: 'json',
      },
      update: {
        method: 'PATCH',
        isArray: false,
        params: {
          project: '@project'
        }
      },
      create: {
        method: 'POST',
        isArray: false,
        params: {
          project: '@project'
        }
      },
      destroy: {
        method: 'DELETE',
        isArray: false
      }
    });
  }]);

app.factory('ProjectUser', ['$resource', '$localStorage', 'API_END_POINT',
  function($resource, $localStorage, API_END_POINT){
    return $resource(API_END_POINT + '/projects/:project_id/project_users/:id',
      {
        q: '@q',
        id: '@id',
        project_id: '@project_id'
      },
      {
      get: {
        method: 'GET',
        isArray: false,
        dataType: 'json',
        params: {
          project_id: '@project_id'
        }
      },
      update: {
        method: 'PATCH',
        isArray: false,
        params: {
          project_id: '@project_id',
          id: '@id',
          project_user: '@project_user'
        }
      },
      create: {
        method: 'POST',
        isArray: false,
        params: {
          project_id: '@project_id',
          project_user: '@project_user'
        }
      },
      destroy: {
        method: 'DELETE',
        isArray: false,
        params: {
          project_id: '@project_id'
        }
      }
    });
  }]);

