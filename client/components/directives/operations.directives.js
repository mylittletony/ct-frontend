'use strict';

var app = angular.module('myApp.operations.directives', []);

app.directive('operations', ['Operation', 'Location', '$routeParams', 'gettextCatalog', 'pagination_labels', '$pusher', '$rootScope', function(Operation, Location, $routeParams, gettextCatalog, pagination_labels, $pusher, $rootScope) {

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

    var init = function() {
      Operation.query({box_id: scope.box.slug, page: scope.query.page, per: scope.query.limit }).$promise.then(function(res) {
        scope.operations = res.operations;
        console.log(scope.operations)
        scope._links = res._links;
        scope.loading = undefined;
      }, function() {
        scope.loading = undefined;
      });
    };

    // var removeFromList = function(index) {
    //   scope.operations.splice(index, 1);
    // };

    // scope.destroy = function(id, index) {
    //   Operation.destroy({box_id: scope.box.slug, id: id }).$promise.then(function(res) {
    //     removeFromList(index);
    //   }, function(err) {
    //     console.log(err);
    //     // scope.loading = undefined;
    //   });
    // };

    // scope.back = function() {
    //   window.location.href = '/#/locations/' + scope.location.slug + '/boxes/' + scope.box.slug;
    // };

    // var channel;
    // function loadPusher(key) {
    //   if (scope.pusherLoaded === undefined && typeof client !== 'undefined') {
    //     scope.pusherLoaded = true;
    //     var pusher = $pusher(client);
    //     channel = pusher.subscribe('private-' + scope.box.slug);
    //     console.log('Binding to:', channel.name);
    //     channel.bind('operations', function(data) {
    //       console.log('Operation received at', new Date().getTime() / 1000);
    //       processNotification(data);
    //     });
    //   }
    // }

    // var processNotification = function(data) {
    //   var msg;
    //   try{
    //     msg = JSON.parse(data.operation);
    //   } catch(e) {
    //     msg = data.operation;
    //   }

    //   angular.forEach(scope.operations, function(v) {
    //     if (msg.id === v.id) {
    //       if (msg.msg === 'LLD') {
    //         init();
    //       } else {
    //         var m = { msg: decodeURI(msg.msg), created_at: msg.created_at };
    //         v.replies = [];
    //         v.replies.push(m);
    //       }
    //     }
    //   });
    // };

    // $rootScope.$on('$routeChangeStart', function (event, next, current) {
    //   if (channel) {
    //     channel.unbind();
    //   }
    // });

    init();
    // loadPusher();
  };

  return {
    link: link,
    scope: {
      loading: '='
    },
    templateUrl: 'components/views/operations/_index.html'
  };

}]);
