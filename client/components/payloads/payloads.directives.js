'use strict';

var app = angular.module('myApp.payloads.directives', []);

app.directive('runPayload', ['Payload', 'Command', '$routeParams', 'showToast', 'showErrors', function(Payload, Command, $routeParams, showToast, showErrors) {

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
        showToast('Payload running, please wait.');
      }, function(errors) {
        showErrors(errors);
      });
    };

    scope.$watch('allowed',function(nv){
      if (nv !== undefined) {
        scope.allowed = attrs.allowed === 'true';
        loadCommands();
      }
    });

  };

  return {
    link: link,
    scope: {
      command: '=',
      allowed: '@'
    },
    template:
      '<div>' +
      '<md-input-container class="md-block" flex-gt-xs="50">'+
      '<label>Run Payload</label>'+
      '<md-select ng-model="command.selected">'+
      '<md-option ng-repeat="cmd in commands" value="{{cmd.unique_id}}">'+
      '{{cmd.payload_description}}'+
      '</md-option>'+
      '</md-select>'+
      '</md-input-container>'+
      '<md-button ng-disabled=\'!command.selected || !allowed\' class=\'md-raised\' ng-click=\'runCommand()\'>RUN</md-button>'+
      '</div>' +
      '<p ng-hide=\'allowed\'>You can\'t run a payload on this box since it\'s not connected or is already processing a job.</p>'+
      '<div ng-if=\'command.success\'>'+
      // '<p>Payload running, please wait.</p>'+
      // '<md-progress-linear md-mode="query"></md-progress-linear>'+
      '</div>'+
      '</div>'

  };

}]);
