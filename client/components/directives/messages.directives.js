'use strict';

var app = angular.module('myApp.messages.directives', []);

app.directive('listMessages', ['Message', 'Location', '$routeParams', '$mdDialog', 'showToast', 'showErrors', '$mdEditDialog', '$q', 'gettextCatalog', 'pagination_labels', function(Message, Location, $routeParams, $mdDialog, showToast, showErrors, $mdEditDialog, $q, gettextCatalog, pagination_labels) {

  var link = function(scope,element,attrs,controller) {

    scope.loading = true;
    // scope.box = controller.$scope.box;
    scope.box = {};
    scope.location = { slug: $routeParams.id };

    scope.pagination_labels = pagination_labels;
    scope.query = {
      order:   '-created_at',
      limit:   $routeParams.per || 100,
      page:    $routeParams.page || 1,
      options: [5,10,25,50,100],
    };

    var init = function() {
      Message.query({box_id: scope.box.id }).$promise.then(function(res) {
        scope.messages = res.messages;
        scope._links = res._links;
        scope.loading = undefined;
      }, function() {
        scope.loading = undefined;
      });
    };

    init();
  };

  return {
    link: link,
    scope: {},
    templateUrl: 'components/views/messages/_index.html'
  };

}]);
