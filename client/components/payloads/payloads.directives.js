'use strict';

var app = angular.module('myApp.payloads.directives', []);

app.directive('runPayload', ['Payload', 'Command', '$routeParams', 'showToast', 'showErrors', 'gettextCatalog', function(Payload, Command, $routeParams, showToast, showErrors, gettextCatalog) {

  var link = function( scope, element, attrs ) {

    var loadCommands = function() {
      Command.query().$promise.then(function(results) {
        scope.commands = results;
        scope.loading_commands = undefined;
      });
    };

    scope.runCommand = function() {
      scope.processing = true;
      updateCT();
    };

    var updateCT = function() {
      var cmd = scope.command.selected;
      scope.command.selected = undefined;
      Payload.create({payload: {
        box_ids: $routeParams.box_id,
        command_id: cmd
      }}).$promise.then(function() {
        // scope.command.success = true;
        showToast(gettextCatalog.getString('Payload running, please wait.'));
      }, function(errors) {
        showErrors(errors);
      });
    };

    loadCommands();

  };

  return {
    link: link,
    scope: {
      command: '=',
      allowed: '@'
    },
    templateUrl: 'components/payloads/_run_payload.html',

  };

}]);
