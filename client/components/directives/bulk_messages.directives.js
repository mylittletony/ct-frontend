'use strict';

var app = angular.module('myApp.bulk_messages.directives', []);

app.directive('sendBulkMessage', ['$routeParams', 'BulkMessage', '$mdDialog', 'showToast', 'showErrors', 'Campaign', function($routeParams,BulkMessage,$mdDialog, showToast, showErrors, Campaign) {

  var link = function( scope, element, attrs ) {

    var send = function(message) {
      BulkMessage.create({}, {
        location_id: $routeParams.id,
        person_id: $routeParams.person_id,
        bulk_message: message
      }).$promise.then(function(msg) {
        showToast('Message queued, please wait.');
      }, function(err) {
        showErrors(err);
      });
    };

    function DialogController($scope, valid) {

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

      $scope.validateEmail = function(email) {
        Campaign.validate({}, {
          location_id: $routeParams.id,
          email: email
        }).$promise.then(function(msg) {
          $scope.valid = true;
        }, function(err) {
          $scope.valid = false;
        });
      };
    }
    DialogController.$inject = ['$scope', 'valid'];

    scope.compose = function(ev) {
      $mdDialog.show({
        controller: DialogController,
        templateUrl: 'components/views/bulk_messages/_compose.tmpl.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose:true,
        locals: {
          valid: false
        }
      }).then(function(answer) {
      }, function() {
      });
    };

  };

  var template =

    '<md-menu-item><md-button ng-click="compose()">Send Message</md-button></md-menu-item>';

  return {
    link: link,
    template: template
  };

}]);

app.directive('bulkMessages', ['$routeParams', 'BulkMessage', 'People', '$mdDialog', '$location', function($routeParams,BulkMessage,People,$mdDialog,$location) {

  var link = function( scope, element, attrs ) {

    scope.person = {};
    scope.location = {slug: $routeParams.id};

    var fetchMessages = function() {
      BulkMessage.index({}, {
        person_id:    scope.person.id || $routeParams.person_id,
        location_id:  scope.location.slug,
        start:        $routeParams.start,
        end:          $routeParams.end
      }).$promise.then(function(results) {
        scope.loading = undefined;
        scope.messages = results.messages;
      });
    };

    var fetchPerson = function() {
      People.query({location_id: scope.location.slug, id: $routeParams.person_slug}).$promise.then(function(res) {
        scope.person = res;
        fetchMessages();
      }, function(err) {
        console.log(err);
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
    scope.location = {slug: $routeParams.id}

    var activity = function() {
      BulkMessageActivity.index({}, {
        location_id:  $routeParams.id,
        message_id: scope.message.message_id
      }).$promise.then(function(results) {
        scope.loading = undefined;
        scope.activity = results.activity;
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
