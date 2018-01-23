'use strict';

var app = angular.module('myApp.bulk_messages.directives', []);

app.directive('sendBulkMessage', ['$routeParams', 'BulkMessage', '$mdDialog', 'showToast', 'showErrors', function($routeParams,BulkMessage,$mdDialog, showToast, showErrors) {

  var link = function( scope, element, attrs ) {

    var send = function(message) {
      BulkMessage.create({}, {
        location_id: $routeParams.id,
        bulk_message: message
      }).$promise.then(function(msg) {
        showToast('Message queued, please wait.');
      }, function(err) {
        showErrors(err);
      });
    };

    scope.compose = function(ev) {
      $mdDialog.show({
        controller: DialogController,
        templateUrl: 'components/views/bulk_messages/_compose.tmpl.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose:true
      })
        .then(function(answer) {
        }, function() {
        });
    };

    function DialogController($scope, $mdDialog) {

      scope.message = {};

      $scope.selectedIndex = 0;

      $scope.hide = function() {
        $mdDialog.hide();
      };

      $scope.cancel = function() {
        $mdDialog.cancel();
      };

      $scope.back = function() {
        if ($scope.selectedIndex > 0) {
          $scope.selectedIndex--;
        }
      };

      $scope.next = function() {
        if ($scope.selectedIndex < 3) {
          $scope.selectedIndex++;
        }
      };

      $scope.send = function(message) {
        $scope.cancel();
        send(message);
      };
    }

  };

  var template =
    '<div><md-button ng-click="compose()" class=\'md-raised md-primary\'>SEND</md-button></div>';

  return {
    link: link,
    template: template
  };

}]);

app.directive('bulkMessages', ['$routeParams', 'BulkMessage', 'People', '$mdDialog', '$location', function($routeParams,BulkMessage,People,$mdDialog,$location) {

  var link = function( scope, element, attrs ) {

    var person = {};

    var fetchPerson = function() {
      People.query({location_id: $routeParams.id, id: $routeParams.person_id}).$promise.then(function(res) {
        person = res;
        fetchMessages();
      }, function(err) {
        console.log(err);
      });
    };

    var fetchMessages = function() {
      BulkMessage.index({}, {
        person_id:    person.id || $routeParams.person_id,
        location_id:  $routeParams.id,
        start:        $routeParams.start,
        end:          $routeParams.end
      }).$promise.then(function(results) {
        scope.loading = undefined;
        scope.messages = results.messages;
      });
    };

    scope.query = function(person_id) {
      var hash            = {};
      hash.person_id      = person_id;
      hash.per            = $routeParams.per || 100;
      hash.start          = $routeParams.start;
      hash.end            = $routeParams.end;
      $location.search(hash);
      fetchMessages();
    };

    if ($routeParams.person_slug) {
      fetchPerson();
    } else {
      fetchMessages();
    }

    // BulkMessageActivity.index({}, {
    //   location_id:  $routeParams.id,
    //   start:        $routeParams.start,
    //   end:          $routeParams.end
    // }).$promise.then(function(results) {
    //   scope.loading = undefined;
    //   console.log(results)
    // });

  };

  return {
    link: link,
    scope: {
      loading: '='
    },
    templateUrl: 'components/views/bulk_messages/_index.html'
  };

}]);

app.directive('bulkMessageShow', ['$routeParams', 'BulkMessage', 'BulkMessageActivity', 'People', '$mdDialog', '$location', function($routeParams,BulkMessage,BulkMessageActivity,People,$mdDialog,$location) {

  var link = function( scope, element, attrs ) {

    var person = {};

    var activity = function() {
      BulkMessageActivity.index({}, {
        location_id:  $routeParams.id,
        message_id: scope.message.message_id
      }).$promise.then(function(results) {
        scope.loading = undefined;
        scope.activity = results.message_activity;
      });
    };

    var init = function() {
      BulkMessage.get({}, {
        message_id:   $routeParams.message_id,
        location_id:  $routeParams.id,
      }).$promise.then(function(results) {
        scope.loading = undefined;
        scope.message = results;
        activity();
      });
    };

    // scope.query = function(person_id) {
    //   var hash            = {};
    //   hash.person_id      = person_id;
    //   hash.per            = $routeParams.per || 100;
    //   hash.start          = $routeParams.start;
    //   hash.end            = $routeParams.end;
    //   $location.search(hash);
    //   fetchMessages();
    // };

    init();

  };

  return {
    link: link,
    scope: {
      loading: '='
    },
    templateUrl: 'components/views/bulk_messages/_show.html'
  };

}]);
