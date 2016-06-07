'use strict';

var app = angular.module('myApp.commands.directives', []);

app.directive('commandSelect', ['Command', function(Command) {


  var link = function( scope, element, attrs ) {

    scope.command = {};

    var loadCommands = function() {
      Command.query().$promise.then(function(results) {
        scope.commands = results;
        scope.loading_commands = undefined;
      });
    };

    loadCommands();

  };

  return {
    link: link,
    scope: {
      commands: '='
    },
    restrict: 'AE',
    replace: true,
    template:
      '<div>' +
      '<select ng-model="command.selected" ng-options="command.unique_id as command.payload_description for command in commands" class="form-control" id=\'commands\'></select>' +
      '</div>'
  };

}]);

