'use strict';

var app = angular.module('myApp.people.directives', []);

app.directive('displayPerson', ['People', 'Location', 'Social', 'Guest', 'Sms', 'Email', 'Client', 'PersonTimeline', 'PersonTimelinePortal', '$q', '$routeParams', '$location', '$http', '$compile', '$rootScope', '$timeout', '$pusher', 'showToast', 'showErrors', 'menu', '$mdDialog', 'gettextCatalog', function(People, Location, Social, Guest, Sms, Email, Client, PersonTimeline, PersonTimelinePortal, $q, $routeParams, $location, $http, $compile, $rootScope, $timeout, $pusher, showToast, showErrors, menu, $mdDialog, gettextCatalog) {

  var link = function(scope, element, attrs) {

    scope.editName = function(editState) {
      if (editState === true) {
        scope.edit_username = false;
      } else {
        scope.edit_username = true;
      }
    };

    var setProfilePhoto = function() {
      if (scope.person.social && scope.person.social.length > 0) {
        if (scope.person.social[0].facebook_id) {
          scope.person.profile_photo = 'https://graph.facebook.com/' + scope.person.social[0].facebook_id + '/picture?type=large';
          scope.loading  = undefined;
          return;
        }
        scope.person.profile_photo = scope.person.social[0].tw_profile_image;
      }
      scope.loading  = undefined;
    };

    var getSocials = function() {
      Social.get({
        person_id: scope.person.id,
        location_id: scope.location.id
      }).$promise.then(function(results) {
        scope.person.social = results.social;
        setProfilePhoto();
      }, function(err) {
        setProfilePhoto();
      });
    };

    var getGuests = function() {
      Guest.get({
        person_id: scope.person.id,
        location_id: scope.location.id
      }).$promise.then(function(results) {
        scope.person.guests = results.guests;
      }, function(err) {
      });
    };

    var getEmails = function() {
      Email.get({
        person_id: scope.person.id,
        location_id: scope.location.id
      }).$promise.then(function(results) {
        scope.person.emails = results.emails;
      }, function(err) {
      });
    };

    var getSms = function() {
      Sms.get({
        person_id: scope.person.id,
        location_id: scope.location.slug
      }).$promise.then(function(results) {
        scope.person.sms = results.sms;
      }, function(err) {
      });
    };

    var getClients = function() {
      Client.query({
        person_id: scope.person.id,
        location_id: scope.location.id
      }).$promise.then(function(results) {
        scope.person.clients = results.clients;
      }, function(err) {
      });
    };

    var getRelations = function() {
      getSocials();
      getGuests();
      getEmails();
      getSms();
      getClients();
    };

    scope.saveUsername = function() {
      People.update({}, {
        location_id: scope.location.slug,
        id: scope.person.id,
        person: {
          username: scope.person.username
        }
      }).$promise.then(function(results) {
        scope.person = results;
        getRelations();
        scope.edit_username = false;
      }, function(error) {
        showErrors(error);
      });
    };

    var getPerson = function() {
      People.query({location_id: scope.location.slug, id: $routeParams.person_id}).$promise.then(function(res) {
        scope.person = res;
        getRelations();
      }, function(err) {
        scope.loading  = undefined;
        console.log(err);
      });
    };

    var getTimeline = function() {
      PersonTimeline.query({location_id: scope.location.slug, person_id: $routeParams.person_id}).$promise.then(function(res) {
        scope.timelines = res.timelines;
      }, function(err) {
        console.log(err);
      });
    };

    var getPortalTimeline = function() {
      menu.hideBurger = true;
      scope.portal_request = true;
      if ($routeParams.code) {
        PersonTimelinePortal.query({person_id: $routeParams.person_id, code: $routeParams.code}).$promise.then(function(res) {
          scope.timelines = res.timelines;
          scope.loading = undefined;
        }, function(err) {
          scope.error_message = err.data.message[0];
          scope.loading = undefined;
        });
      } else {
        scope.error_message = 'Unable to authenticate timeline request';
      }
    };

    var init = function() {
      if ($routeParams.id) {
        Location.get({id: $routeParams.id}, function(data) {
          scope.location = data;
          getPerson();
          getTimeline();
        }, function(err){
          console.log(err);
        });
      } else {
        getPortalTimeline();
      }
    };

    scope.back = function() {
      window.history.back();
    };

    init();

  };

  return {
    link: link,
    scope: {
      loading: '='
    },
    templateUrl: 'components/locations/people/_show.html'
  };

}]);