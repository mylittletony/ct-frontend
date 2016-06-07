'use strict';

var app = angular.module('myApp.geocoder.services', ['ngResource',]);

// app.factory('Geocoder', ['$q', '$localStorage', '$window', '$rootScope', '$http', 'API_END_POINT',
//   function($q, $localStorage, $window, $rootScope, $http, API_END_POINT){

//     var position;
//     var deferred = $q.defer();
//     var msg;

//     var get = function(params) {
//       return $http({
//         url: API_END_POINT + '/geocoder',
//         method: 'GET',
//         params: {
//         }
//       }).then(function(result) {
//         window.localStorage.setItem('locations', JSON.stringify(result.data));
//         return result;
//       }, function(errors) {
//         // errors
//       });
//     };

//     var cache = function() {
//       var locations = window.localStorage.getItem('locations');
//       if ( locations !== undefined) {
//         locations = JSON.parse(locations);
//         return locations;
//       }
//     };

//     var queue = function(params) {
//       return $http({
//         url: API_END_POINT + '/geocoder',
//         method: 'POST',
//         params: {
//           lat: params.latitude,
//           lon: params.longitude
//         }
//       }).then(function(result) {
//         return result;
//       }, function(errors) {
//         // errors
//       });
//     };

//     var getLocation = function() {
//       window.localStorage.removeItem('locations');
//       if ($window.navigator && $window.navigator.geolocation) {
//         // success()
//         navigator.geolocation.getCurrentPosition(success, errors);
//       } else {
//         msg = 'You\'re using an unsupported browser, please enter your location manually.';
//         $rootScope.$broadcast('error', msg);
//         $rootScope.$apply(function() {
//           deferred.reject(msg);
//         });
//       }
//       return deferred.promise;
//     };

//     var success = function(position) {
//       window.localStorage.setItem('position', JSON.stringify(position.coords));
//       $rootScope.$apply(function(){deferred.resolve(position);});
//     };

//     var errors = function(error) {
//       switch (error.code) {
//         case 1:
//           msg = 'Please allow access to your location. The request was blocked by your browser.';
//           $rootScope.$broadcast('error',msg);
//           $rootScope.$apply(function() {
//             deferred.reject(msg);
//           });
//           break;
//         case 2:
//           msg = 'Unable to determine your location';
//           $rootScope.$broadcast('error',msg);
//           $rootScope.$apply(function() {
//             deferred.reject(msg);
//           });
//           break;
//         case 3:
//           msg = 'Unable to contact geocoding service';
//           $rootScope.$broadcast('error',msg);
//           $rootScope.$apply(function() {
//             deferred.reject(msg);
//           });
//           break;
//       }
//     };

//     return {
//       getLocation:      getLocation,
//       get:              get,
//       queue:            queue,
//       cache:            cache
//     };
//   }
// ]);
