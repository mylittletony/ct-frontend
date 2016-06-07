'use strict';

var app = angular.module('myApp.port_forwards.directives', []);

app.directive('portForwardForm', ['PortForward', function(PortForward) {

  var link = function( scope, element, attrs, ngModel ) {

    scope.addRule = function() {
      scope.port_forwards.push({'source':'','destination_port':'','destination_ip':'','target':'','forward_to_ip':'','forward_to_port':''});
    };

    scope.removeRule = function(index) {
      scope.port_forwards[index]._destroy = '1';
      scope.myForm.$pristine = false;
    };

    scope.updateRules = function() {
      scope.myForm.updating = true;
      updateCT();
    };

    var updateCT = function() {
      scope.box.port_forwards_attributes = scope.port_forwards;
      PortForward.update({box_id: scope.box.slug, box: scope.box }).$promise.then(function() {
        scope.myForm.updating = undefined;
        scope.myForm.errors = undefined;
        scope.myForm.success = true;
      }, function(errors) {
        scope.myForm.updating = undefined;
        scope.myForm.errors = errors.data.errors;
        scope.myForm.success = undefined;
      });
    };
  };

  return {
    link: link,
    restrict: 'A',
    replace: true,
    templateUrl: 'components/boxes/port_forwards/form.html'

  };

}]);

