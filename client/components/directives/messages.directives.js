'use strict';

var app = angular.module('myApp.messages.directives', []);

app.directive('listMessages', ['Message', 'Location', '$routeParams', 'gettextCatalog', 'pagination_labels', function(Message, Location, $routeParams, gettextCatalog, pagination_labels) {

  var link = function(scope,element,attrs,controller) {

    scope.loading  = true;
    scope.box      = { slug: $routeParams.box_id };

    scope.pagination_labels = pagination_labels;
    scope.query = {
      order:   '-created_at',
      limit:   $routeParams.per || 100,
      page:    $routeParams.page || 1,
      options: [5,10,25,50,100],
    };

    var init = function() {
      Message.query({box_id: scope.box.slug }).$promise.then(function(res) {
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

app.directive('createMessage', ['Message', 'Location', '$routeParams', 'gettextCatalog', 'pagination_labels', 'showToast', '$timeout', function(Message, Location, $routeParams, gettextCatalog, pagination_labels, showToast, $timeout) {

  var link = function(scope,element,attrs,controller) {

    var timeout;
    scope.msg     = {};
    scope.loading  = true;
    scope.box      = { slug: $routeParams.box_id };

    scope.create = function(msg) {
      if (scope.disabled === undefined) {
        save(msg);
        scope.msg = {};
      }
    };

    scope.alert = function() {
      if (scope.msg.msg && scope.msg.msg.length === 1 && scope.msg.msg[0] === '/') {
        console.log('Slash command dialog..........')
      }
    };

    var save = function(msg) {
      Message.create({box_id: scope.box.slug, message: { msg: msg.msg } }).$promise.then(function(res) {
        scope.messages.push(res);
      }, function(err) {
        scope.disabled = true;
        console.log(err);
        showToast(gettextCatalog.getString('Could not publish message, try again'));
        timeout = $timeout(function() {
          scope.disabled = undefined;
          $timeout.cancel(timeout);
        }, 1000);
      });
    };
  };

  return {
    link: link,
    scope: {
      messages: '='
    },
    templateUrl: 'components/views/messages/_create.html'
  };

}]);
