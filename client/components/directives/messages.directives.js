'use strict';

var app = angular.module('myApp.messages.directives', []);

app.directive('listMessages', ['Message', 'Location', '$routeParams', 'gettextCatalog', 'pagination_labels', '$pusher', function(Message, Location, $routeParams, gettextCatalog, pagination_labels, $pusher) {

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
      Message.query({box_id: scope.box.slug, page: scope.query.page, per: scope.query.limit }).$promise.then(function(res) {
        scope.messages = res.messages;
        scope._links = res._links;
        scope.loading = undefined;
      }, function() {
        scope.loading = undefined;
      });
    };

    var removeFromList = function(index) {
      scope.messages.splice(index, 1);
    };

    scope.destroy = function(id, index) {
      Message.destroy({box_id: scope.box.slug, id: id }).$promise.then(function(res) {
        removeFromList(index);
      }, function(err) {
        console.log(err);
        // scope.loading = undefined;
      });
    };

    var channel;
    function loadPusher(key) {
      if (scope.pusherLoaded === undefined && typeof client !== 'undefined') {
        scope.pusherLoaded = true;
        var pusher = $pusher(client);
        channel = pusher.subscribe('test-');
        // channel = pusher.subscribe('private-' + scope.box.location_pubsub);
        console.log('Binding to:', channel.name);
        channel.bind('event', function(data) {
        // channel.bind('boxes_' + scope.box.pubsub_token, function(data) {
          console.log('Message received at', new Date().getTime() / 1000);
          processNotification(data);
        });
      }
    }

    var processNotification = function(data) {
      var msg;
      try{
        msg = JSON.parse(data.message);
      } catch(e) {
        msg = data.message;
      }

      console.log(msg)

      angular.forEach(scope.messages, function(v) {
        if (msg.id === v.id) {
          alert(123)
          var m = { msg: msg.msg };
          console.log(v)
          v.replies = []
          v.replies.push(m);
        }
      });
    };

    init();
    loadPusher();
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
        console.log('Slash command dialog..........');
      }
    };

    var save = function(msg) {
      Message.create({box_id: scope.box.slug, message: { msg: msg.msg } }).$promise.then(function(res) {
        scope.messages.push(res);
        scope.disabled = undefined;
      }, function(err) {
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
