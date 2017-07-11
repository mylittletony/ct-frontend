'use strict';

var app = angular.module('myApp.projects.directives', []);

app.directive('listProjects', ['Project', '$routeParams', '$location', '$rootScope', 'Auth', '$pusher', 'showErrors', 'showToast', '$mdDialog', 'gettextCatalog', 'menu', 'pagination_labels', function(Project, $routeParams, $location, $rootScope, Auth, $pusher, showErrors, showToast, $mdDialog, gettextCatalog, menu, pagination_labels) {

  var link = function(scope) {

    menu.isOpen = false;
    menu.hideBurger = true;
    menu.sectionName = gettextCatalog.getString('Projects');

    scope.options = {
      boundaryLinks: false,
      largeEditDialog: false,
      pageSelector: false,
      rowSelection: false
    };

    scope.pagination_labels = pagination_labels;
    scope.query = {
      order:      'updated_at',
      filter:     $routeParams.q,
      limit:      $routeParams.per || 25,
      page:       $routeParams.page || 1,
      options:    [5,10,25,50,100],
      direction:  $routeParams.direction || 'desc'
    };

    var create = function(project) {
      // scope.project.project_name = scope.projectName.name;
      Project.create({}, { project_name: project.project_name }
      ).$promise.then(function(results) {
        // scope.projects.push(results);
        $location.path('/projects/'+results.slug);
        showToast(gettextCatalog.getString('Successfully created project'));
      }, function(err) {
        showErrors(err);
      });
    };

    function DialogController ($scope) {
      // $scope.ap_mac = ap_mac;
      // $scope.zones = zones;
      $scope.close = function() {
        $mdDialog.cancel();
      };
      $scope.save = function(zone) {
        $location.search({});
        $mdDialog.cancel();
        create($scope.project);
      };
    }
    DialogController.$inject = ['$scope'];

    scope.addProject = function(id) {
      $mdDialog.show({
        clickOutsideToClose: true,
        templateUrl: 'components/views/projects/_create.html',
        parent: angular.element(document.body),
        controller: DialogController,
        locals: {
          zones: scope.zones,
          ap_mac: $routeParams.ap_mac
        }
      });
    };

    var removeFromList = function(slug) {
      for (var i = 0, len = scope.projects.length; i < len; i++) {
        if (scope.projects[i].slug === slug) {
          scope.projects.splice(i, 1);
          showToast(gettextCatalog.getString('project successfully deleted.'));
          break;
        }
      }
    };

    var destroy = function(slug) {
      Project.destroy({id: slug}).$promise.then(function(results) {
        removeFromList(slug);
      }, function(err) {
        showErrors(err);
      });
    };

    scope.destroy = function(slug) {
      var confirm = $mdDialog.confirm()
      .title(gettextCatalog.getString('Delete Project'))
      .textContent(gettextCatalog.getString('You cannot delete projects with associated locations?'))
      .ariaLabel(gettextCatalog.getString('Delete Project'))
      .ok(gettextCatalog.getString('Delete'))
      .cancel(gettextCatalog.getString('Cancel'));
      $mdDialog.show(confirm).then(function() {
        destroy(slug);
      }, function() {
      });
    };

    var init = function() {
      Project.query({}).$promise.then(function(results) {
        scope.projects  = results.projects;
        scope._links  = results._links;
        scope.loading = undefined;
      }, function(err) {
        console.log(err);
        scope.projects = [];
        scope.loading = undefined;
      });
    };

    init();

  };

  return {
    link: link,
    scope: {
      loading: '='
    },
    templateUrl: 'components/views/projects/_index.html'
  };

}]);

// app.directive('newProject', ['Project', 'ProjectName', '$routeParams', '$location', '$rootScope', 'Auth', '$pusher', 'showErrors', 'showToast', '$mdDialog', 'gettextCatalog', 'menu', 'pagination_labels', function(Project, ProjectName, $routeParams, $location, $rootScope, Auth, $pusher, showErrors, showToast, $mdDialog, gettextCatalog, menu, pagination_labels) {

//   var link = function(scope) {

//     menu.isOpen = false;
//     menu.hideBurger = true;
//     menu.sectionName = gettextCatalog.getString('Projects');

//     scope.projectName = ProjectName;
//     scope.projectName.name = 'Acme Inc';

//     scope.locations = ['eu-west', 'us-central', 'us-west', 'asia-east'];
//     scope.locales = [
//       { key: 'Deutsch', value: 'de-DE' },
//       { key: 'English', value: 'en-GB' }
//     ];

//     scope.project = {
//       locale: 'en-GB',
//       network_location: 'eu-west',
//     };

//     scope.save = function(form) {
//       if (form) {
//         form.$setPristine();
//       }
//       scope.project.project_name = scope.projectName.name;
//       Project.create({}, scope.project
//       ).$promise.then(function(results) {
//         $location.path('/projects/'+results.id);
//         showToast(gettextCatalog.getString('Successfully created project'));
//       }, function(err) {
//         showErrors(err);
//       });
//     };
//   };

//   return {
//     link: link,
//     scope: {
//       loading: '='
//     },
//     templateUrl: 'components/views/projects/_new.html'
//   };

// }]);

app.directive('project', ['Project', '$routeParams', '$location', '$rootScope', 'Auth', '$pusher', 'showErrors', 'showToast', '$mdDialog', 'gettextCatalog', 'menu', 'pagination_labels', function(Project, $routeParams, $location, $rootScope, Auth, $pusher, showErrors, showToast, $mdDialog, gettextCatalog, menu, pagination_labels) {

  var link = function(scope) {

    scope.project = {  };

    var init = function() {
      Project.get({id: $routeParams.id}).$promise.then(function(results) {
        scope.project = results;
        menu.header = results.project_name;
        scope.loading = undefined;
      }, function(err) {
        console.log(err);
        scope.loading = undefined;
      });
    };

    var update = function() {
      Project.update({},
        {
          id: scope.project.slug,
          project: scope.project
        }).$promise.then(function(results) {
          scope.project = results;
          showToast(gettextCatalog.getString('Successfully updated project'));
        }, function(err) {
          console.log(err);
          showErrors(err);
        });
    };

    scope.save = function(form) {
      form.$setPristine();
      update();
    };

    init();
  };

  return {
    link: link,
    scope: {
      loading: '='
    },
    templateUrl: 'components/views/projects/_show.html'
  };

}]);

// app.directive('projectTheme', ['Project', '$routeParams', '$location', '$rootScope', 'Auth', '$pusher', 'showErrors', 'showToast', '$mdDialog', 'gettextCatalog', 'menu', 'pagination_labels', '$cookies', function(Project, $routeParams, $location, $rootScope, Auth, $pusher, showErrors, showToast, $mdDialog, gettextCatalog, menu, pagination_labels, $cookies) {

//   var link = function(scope) {

//     scope.themes = [
//       { val: 'Pink', key: 'pink' },
//       { val: 'Orange', key: 'orange' },
//       { val: 'Deep Orange', key: 'deep-orange' },
//       { val: 'Blue', key: 'blue' },
//       { val: 'Blue Grey', key: 'blue-grey' },
//       { val: 'Light Blue', key: 'light-blue' },
//       { val: 'Red', key: 'red' },
//       { val: 'Green', key: 'green' },
//       { val: 'Light Green', key: 'light-green' },
//       { val: 'Lime', key: 'lime' },
//       { val: 'Yellow', key: 'yellow' },
//       { val: 'Teal', key: 'teal' },
//       { val: 'Brown', key: 'brown' },
//       { val: 'Purple', key: 'purple' },
//       { val: 'Deep Purple', key: 'deep-purple' },
//       { val: 'Cyan', key: 'cyan' },
//       { val: 'Yellow', key: 'yellow' },
//       { val: 'Amber', key: 'amber' },
//       { val: 'Indigo', key: 'indigo' },
//       { val: 'Brown', key: 'brown' },
//       { val: 'Grey', key: 'grey' },
//       // { val: 'Black', key: 'black' }
//     ];

//     var init = function() {
//       Project.get({id: $routeParams.project_id}).$promise.then(function(results) {
//         scope.project = results;
//         menu.header = results.project_name;
//         scope.loading = undefined;
//       }, function(err) {
//         console.log(err);
//         // scope.loading = undefined;
//       });
//     };

//     scope.swatchPrimary = function() {
//       $rootScope.theme = scope.project.theme_primary;
//     };

//     var update = function() {
//       Project.update({},
//         {
//           id: scope.project.id,
//           project: {
//             theme_primary: scope.project.theme_primary,
//             theme_accent: scope.project.theme_accent
//           }
//         }).$promise.then(function(results) {
//           $cookies.put('_ctt', results.theme_primary + '.' + results.theme_accent);
//           showToast(gettextCatalog.getString('Successfully updated project'));
//         }, function(err) {
//           showErrors(err);
//         });
//     };

//     scope.save = function(form) {
//       form.$setPristine();
//       update();
//     };

//     init();
//   };

//   return {
//     link: link,
//     scope: {
//       loading: '='
//     },
//     // reload: generateTheme,
//     templateUrl: 'components/views/projects/theme/_index.html'
//   };

// }]);

