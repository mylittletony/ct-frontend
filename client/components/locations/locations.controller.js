'use strict';

var app = angular.module('myApp.locations.controller', []);

// app.controller('LocationsCtrlShort', ['$scope', '$routeParams', '$filter', 'Location', 'Data',
//   function($scope, $routeParams, $filter, Location, Data) {

//     $scope.location = {};

//     $scope.getLocation = function(val) {
//       return Location.shortquery({q: val}).$promise.then(function (res) {
//         $scope.locations = res;
//       });
//     };

//     $scope.selectLocation = function(item) {
//       $scope.selected = {};
//       $scope.selected.item = item;
//       $scope.data.selected = item;
//       $scope.data = Data;
//     };

//     $scope.getLocation();

//   }

// ]);

app.controller('LocationsCtrl', ['$scope', '$routeParams', 'Location', '$location', 'Box', '$filter', '$pusher', '$rootScope', '$route', 'menu', '$mdSidenav', '$cookies', 'LocationCache', 'gettextCatalog', 'ClientDetails',
  function($scope, $routeParams, Location, $location, Box, $filter, $pusher, $rootScope, $route, menu, $mdSidenav, $cookies, LocationCache, gettextCatalog, ClientDetails) {

    $scope.loading = true;
    $scope.location = { slug: $routeParams.id };

    function isOpen(section) {
      return menu.isSectionSelected(section);
    }

    function toggleOpen(section) {
      menu.toggleSelectSection(section);
    }

    var isActive = function(path) {
      var split = $location.path().split('/');
      if (split.length >= 3) {
        if (path === 'splash_pages'){
          var page = $location.path().split('/')[2];
          return (page === path || page === 'vouchers' || page === 'splash_codes');
        }
        return ($location.path().split('/')[2] === path);
      } else if (path === 'people') {
        return true;
      }
    };

    var vm = this;

    if ($cookies.get('_ctm') === 'true') {
      menu.isOpenLeft = false;
      menu.isOpen = false;
    } else {
      menu.isOpen = true;
    }

    menu.hideBurger = false;

    menu.sections = [];

    var guide = '/guide';
    var createMenu = function() {

      menu.sections.push({
        name: gettextCatalog.getString('People'),
        type: 'link',
        link: '/#/' + $scope.location.slug + '/people',
        icon: 'people',
        active: isActive('people')
      });

      menu.sections.push({
        name: gettextCatalog.getString('Splash'),
        type: 'link',
        link: '/#/' + $scope.location.slug + '/splash_pages' + guide,
        icon: 'format_paint',
        active: isActive('splash_pages')
      });

      menu.sections.push({
        name: gettextCatalog.getString('Campaigns'),
        type: 'link',
        link: '/#/' + $scope.location.slug + '/campaigns',
        icon: 'email',
        active: isActive('campaigns')
      });

    };

    var setLocationStateIcon = function(location) {
      menu.locationStateIcon = undefined;
      if (location.archived === 1 || location.archived === true) {
        menu.locationStateIcon = 'archived';
        return;
      }
      if (location.ct_view === 0 || location.ct_view === false) {
        menu.locationStateIcon = 'vpn_locked';
        return;
      }
    };

    var init = function() {

      var id = $routeParams.id;
      var slug;

      Location.get({id: id}, function(data) {
        if (id % 1 === 0) {
          var suffix;
          var path = $location.path().split('/');
          if (path.length === 4) {
            suffix = '/' + path[path.length-1];
          }
          $location.path('/' + data.slug + suffix).replace();
        }
        menu.header = data.location_name;
        menu.sectionName = gettextCatalog.getString('Location');
        setLocationStateIcon(data);
        $scope.location = data;
        window.moment.tz.setDefault($scope.location.timezone);

        var params = {id: data.id, location_name: data.location_name, slug: data.slug};
        var json = JSON.stringify(params);
        $cookies.put('_ctlid', json);

        if (data.paid) {
          guide = '';
        }

        // Used to check for location name change
        // Will refresh the page if a change is detected

        slug = $scope.location.slug;

        ClientDetails.client.location_id = data.id;
        $rootScope.$broadcast('locationLoaded');

        createMenu();
      });
    };

    init();

    $rootScope.$on('$routeChangeStart', function (event, next, current) {
      menu.sections = [];
    });
}]);

app.controller('HomeCtrl', ['$scope', '$cookies', '$location', 'Location', function($scope, $cookies, $location, Location) {

  var getLocation = function() {
    Location.query({}).$promise.then(function(results) {
      if (results && results.locations && results.locations.length > 0) {
        var location = results.locations[0];
        $location.path('/' + location.slug + (location.paid ? '' : '/guide'));
      } else {
        $location.path('/new');
      }
    });
  };

  var cookies = $cookies.get('_ctlid-----');
  if (!cookies) {
    getLocation();
  } else {
    var location = JSON.parse(cookies);
    if (location && location.slug) {
      $location.path('/' + location.slug);
    } else {
      getLocation();
    }
  }

}]);
