
'use strict';

var app = angular.module('myApp.docs.directives', []);

app.directive('ctDocs', ['Auth', 'docs', function(Auth, docs) {

  var link = function(scope,element,attrs) {

    if (Auth.currentUser() && Auth.currentUser().docs !== true) {
      scope.link = docs.url[attrs.name];
    }
  };

  return {
    link: link,
    scope: {
      name: '@'
    },
    transclude: true,
    template:
      '<span><a target=\'_blank\' href=\'{{ link }}\' ng-transclude></a></span>'
  };

}]);
