'use strict';

var app = angular.module('myApp.messages.directives', []);

app.directive('listMessages', ['Message', 'Location', '$routeParams', 'gettextCatalog', 'pagination_labels', '$pusher', '$rootScope', function(Message, Location, $routeParams, gettextCatalog, pagination_labels, $pusher, $rootScope) {

  var link = function(scope,element,attrs,controller) {

    scope.loading  = true;
    scope.box      = { slug: $routeParams.box_id };
    scope.location = { slug: $routeParams.id };

    scope.pagination_labels = pagination_labels;
    scope.query = {
      order:   '-created_at',
      limit:   $routeParams.per || 100,
      page:    $routeParams.page || 1,
      options: [5,10,25,50,100],
    };

    var gotoBottom = function() {
      setTimeout(function() {
        document.getElementById("payload-bottom").scrollTop = document.getElementById("payload-bottom").scrollHeight;
      }, 500);
    }

    var init = function() {
      Message.query({box_id: scope.box.slug, page: scope.query.page, per: scope.query.limit }).$promise.then(function(res) {
        scope.messages = res.messages;
        scope._links = res._links;
        scope.loading = undefined;
        gotoBottom();
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

    scope.back = function() {
      window.location.href = '/#/locations/' + scope.location.slug + '/boxes/' + scope.box.slug;
    };

    var channel;
    function loadPusher(key) {
      if (scope.pusherLoaded === undefined && typeof client !== 'undefined') {
        scope.pusherLoaded = true;
        var pusher = $pusher(client);
        channel = pusher.subscribe('private-' + scope.box.slug);
        console.log('Binding to:', channel.name);
        channel.bind('messages', function(data) {
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

      angular.forEach(scope.messages, function(v) {
        if (msg.id === v.id) {
          if (msg.msg === 'LLD') {
            init();
          } else {
            var m = { msg: decodeURI(msg.msg), created_at: msg.created_at };
            v.replies = [];
            v.replies.push(m);
            gotoBottom();
          }
        }
      });
    };

    $rootScope.$on('$routeChangeStart', function (event, next, current) {
      if (channel) {
        channel.unbind();
      }
    });

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

    var gotoBottom = function() {
      setTimeout(function() {
        document.getElementById("payload-bottom").scrollTop = document.getElementById("payload-bottom").scrollHeight;
      }, 500);
    }

    var banned = ['ping', 'traceroute', 'top'];

    scope.create = function(msg) {
      var first = msg.msg.split(' ')[0];
      if (banned.indexOf(first) !== -1) {
        alert('Banned for the time being..');
        return;
      }
      if (scope.disabled === undefined && (msg.msg !== '' && msg.msg !== null && msg.msg !== undefined)) {
        scope.lastMsg = scope.msg.msg;
        save(msg);
        scope.msg = {};
        gotoBottom();
      }
    };

    scope.alert = function() {
      if (scope.msg.msg && scope.msg.msg.length === 1 && scope.msg.msg[0] === '/') {
        console.log('Slash command dialog..........');
      }
    };

    scope.keypress = function(evnt) {
      if (evnt.keyCode === 38) {
        scope.thisMsg = scope.msg.msg;
        scope.msg.msg = scope.lastMsg;
      } else if (evnt.keyCode === 40) {
        scope.msg.msg = scope.thisMsg;
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
