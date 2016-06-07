'use strict';

var app = angular.module('myApp.reports.v2.directives', []);

app.factory('Locations', [function() {
  return { current: '', all: '' };
}]);

app.directive('reportsHeader', ['Report', '$routeParams', '$location', 'Location', '$q', '$window', 'Locations', function(Report, $routeParams,$location,Location, $q, $window, Locations) {

  var link = function( scope, element, attrs, controller ) {

    scope.period = $routeParams.period || '7d';

    var setType = function() {
      var split = $location.path().split('/');
      if (split.length > 2) {
        scope.name = split[2];
      } else {
        scope.name = 'Wireless';
      }
    };

    setType();

    scope.active = function(path) {
      var split = $location.path().split('/');
      if (split.length >= 2) {
        if (split[2] === path) {
          return true;
        }
      } else if (path === '') {
        return true;
      }
    };

    function querySearch (query) {
      var deferred = $q.defer();
      Location.query({q: query}).$promise.then(function(results) {
        deferred.resolve(results.locations);
      }, function() {
        deferred.reject();
      });
      return deferred.promise;
    }

    function searchTextChange(text) {
    }
    function selectedItemChange(item) {
    }

    scope.querySearch   = querySearch;
    scope.selectedItemChange = selectedItemChange;
    scope.searchTextChange   = searchTextChange;

    scope.changeLocation = function() {
      var hash = $location.search();
      hash.location_id = scope.location.id;
      $location.search(hash);
    };

    scope.updatePeriod = function(period) {
      var hash = $location.search();
      hash.period = period;
      $location.search(hash);
    };

    scope.go = function(item) {
      scope.location = item;
      scope.locations.push(item);
      scope.changeLocation();
    };

    var init = function() {
      scope.locations = Locations.all;
      scope.location = Location.current;
    };

    init();

  };

  return {
    link: link,
    require: '^analytics',
    scope: {
      loading: '=',
    },
    templateUrl: 'components/reports/_filter.html'
  };

}]);

app.directive('wirelessReports', ['Report', '$routeParams', '$location', 'Location', '$q', 'Locations', function(Report, $routeParams,$location,Location, $q, Locations) {

  var link = function( scope, element, attrs ) {

    function init() {
      if ($routeParams.location_id) {
        Location.current  = { id: $routeParams.location_id };
      }
      getLocations();
    }

    function getLocations() {
      Location.favourites({per: 15}).$promise.then(function(results) {
        Locations.all     = results.locations;
        if (!$routeParams.location_id) {
          Location.current  = results.locations[0];
          $location.search({location_id: Location.current.id});
        }
        scope.loading     = undefined;
      }, function(err) {
        scope.loading = undefined;
      });
    }

    init();

  };

  return {
    link: link,
    scope: {
      loading: '='
    },
    templateUrl: 'components/reports/_wireless.html'
  };

}]);

app.directive('radiusReports', ['Report', '$routeParams', '$location', 'Location', '$q', 'Locations', function(Report, $routeParams,$location,Location, $q, Locations) {

  var link = function( scope, element, attrs ) {

    Location.all = '';
    Location.current = '';

    function init() {
      Location.favourites({per: 15}).$promise.then(function(results) {
        Locations.all = results.locations;
        if ($routeParams.location_id) {
          Location.current  = { id: $routeParams.location_id };
        } else {
          Location.current  = results.locations[0];
        }
        scope.loading     = undefined;
      }, function(err) {
        scope.loading = undefined;
      });
    }


    init();

  };

  return {
    link: link,
    scope: {
      loading: '='
    },
    templateUrl: 'components/reports/_radius.html'
  };

}]);

app.directive('analytics', ['Report', '$routeParams', '$location', 'Location', '$q', '$route', function(Report, $routeParams,$location,Location, $q, $route) {

  var link = function( scope, element, attrs ) {

  };

  var controller = function($scope) {

    $scope.$on('changeLocation', function(evt, data) {
    });

    this.locationSearch = function(val) {
      return Location.query({q: val, size: 10}).$promise.then(function (res) {
      });
    };

    this.selectLocation = function(item) {
      $scope.updatePage(item);
    };

    var init = function(params) {
      var deferred = $q.defer();

      params.v2 = true;
      params.location_id = $routeParams.location_id;
      params.period = $routeParams.period || '7d';
      params.interval = $routeParams.interval || '1h';

      Report.get(params).$promise.then(function(results) {
        deferred.resolve(results);
      }, function(err) {
        deferred.reject(err);
      });

      return deferred.promise;
    };

    this.get = function(params) {
      return init(params);
    };

    this.clearLocations = function() {
      $scope.updatePage();
    };

    this.updateRange = function(msg) {
      $scope.updatePage(msg);
    };

    this.clearQuery = function() {
      $scope.clearQuery();
    };

    this.options = {
      height: 350,
      colors: ['#009688', '#009688', '#FF5722', '#03A9F4', '#FF5722', '#607D8B'],
      series: {
        0: {
          targetAxisIndex: 0, visibleInLegend: false, pointSize: 0, lineWidth: 0
        },
        1: {
          targetAxisIndex: 1
        },
        2: {
          targetAxisIndex: 1
        }
      },
      vAxes: {
        0: {
          textPosition: 'none'
        },
        1: {
          // title: title,
        },
      },
      legend: {
        position: 'none'
      },
      lineWidth: 1.5,
      // vAxis: {
      //   viewWindow: {
      //     min: 0
      //   }
      // },
      // hAxis: {
      //   format: 'dd MMM'
      // },
      crosshair: {
        trigger: 'both',
        orientation: 'vertical'
      },
      chartArea: {
        left: '2%',
        top: '3%',
        height: '84%',
        width: '92%'
      }
    };

    this.$scope = $scope;

  };

  return {
    link: link,
    controller: controller,
    scope: {}
  };

}]);

app.directive('reportsPie', ['Report', '$routeParams', '$location', 'Location', '$timeout', 'Shortener', function(Report, $routeParams, $location, Location, $timeout, Shortener) {

  var link = function( scope, element, attrs, controller ) {

    // scope.location_name   = $routeParams.location_name;
    // scope.loading         = controller.loading;

    var timer, json;

    attrs.$observe('render', function(val){
      if (val !== '' && !scope.type ) {
        scope.title = attrs.title;
        scope.type = attrs.type;
        scope.subhead = attrs.subhead;
        scope.render = attrs.render;
        init();
      }
    });

    function createCustomHTMLContent(flagURL, totalGold, totalSilver, totalBronze) {
      return '<div style="padding:5px 5px 5px 5px;">' +
        '<img src="' + flagURL + '" style="width:75px;height:50px"><br/>' +
        '<table class="medals_layout">' + '<tr>' +
        '<td><img src="https://upload.wikimedia.org/wikipedia/commons/1/15/Gold_medal.svg" style="width:25px;height:25px"/></td>' +
      '<td><b>' + totalGold + '</b></td>' + '</tr>' + '<tr>' +
        '<td><img src="https://upload.wikimedia.org/wikipedia/commons/0/03/Silver_medal.svg" style="width:25px;height:25px"/></td>' +
      '<td><b>' + totalSilver + '</b></td>' + '</tr>' + '<tr>' +
        '<td><img src="https://upload.wikimedia.org/wikipedia/commons/5/52/Bronze_medal.svg" style="width:25px;height:25px"/></td>' +
      '<td><b>' + totalBronze + '</b></td>' + '</tr>' + '</table>' + '</div>';
    }

    var drawChart = function() {

      var options = {};
      $timeout.cancel(timer);

      var len = json.length;
      var data = new window.google.visualization.DataTable();

      data.addColumn('string', 'Column');
      data.addColumn('number', 'Populartiy');
      // data.addColumn({'type': 'string', 'role': 'tooltip', 'p': {'html': true}});

      for(var i = 0; i < len; i++) {
        data.addRow([json[i].term, json[i].count]);
      }

      if (scope.type === 'popular' ) {
        options.pieSliceText = 'value';
      }

      if (attrs.hole) {
        options.pieHole = attrs.hole;
      }

      // options.height = 155;
      // options.chartArea = { left: 20, top: 20, width:'79%', height:'69%' };
      options.chartArea = { width: '90%;', left: 10, right: 10 };
      options.legend = { position: attrs.legend || 'none' };
      options.height = '255';
      options.colors = ['#FFC107', '#009688', '#FF5722', '#03A9F4', '#FF5722', '#607D8B', '#F44336', '#E91E63', '#3F51B5', '#2196F3', '#4CAF50', '#FFC107'];

      var chart = new window.google.visualization.PieChart(document.getElementById(scope.render));

      if (attrs.tooltip) {
        options.tooltip = { trigger: 'selection' };

        chart.setAction({
          id: 'record',
          text: 'View ' + attrs.tooltip,
          action: function() {
            var selection = chart.getSelection();
            shortener(json[selection[0].row].short);
            // window.location.href = ('/#/?xtr=' + json[selection[0].row].short);
          }
        });

      }
      chart.draw(data, options);
    };

    function shortener (code) {
      Shortener.get({short: code}).$promise.then(function(results) {
        $location.path(results.url);
        $location.search({});
      }, function() {
        $location.search({});
      });
    }

    var init = function() {

      var params = {
        type: scope.type,
        resource: attrs.resource
      };

      controller.get(params).then(function(results) {
        if (scope.type === 'splash_data') {
          var a = [];
          a.push({ count: results.stats.inbound.total / (1000*1000) , term: 'inbound'});
          a.push({ count: results.stats.outbound.total / (1000*1000) , term: 'outbound'});
          results.stats = a;
        }
        timer = $timeout(function() {
          json = results.stats;
          drawChart();
        },500);
        scope.loading       = undefined;
      });
    };

    init();
  };

  return {
    link: link,
    scope: {
      type: '@',
      title: '@',
      render: '@',
      subhead: '@'
    },
    require: '^analytics',
    template:
      '<md-card>'+
      '<md-card-title>'+
      '<md-card-title-text>'+
      '<span class="md-headline">'+
      '{{ title }}'+
      '</span>'+
      // '<span class="md-subhead" ng-if=\'subhead\'>'+
      // '{{ subhead }}'+
      // '</span>'+
      '</md-card-title-text>'+
      '</md-card-title>'+
      '<md-card-content>'+
      '<span ng-if=\'loading\'>'+
      'Loading.'+
      '</span>'+
      '<span ng-if=\'!loading\'>'+
      '<div id="{{ render }}"></div>'+
      // 'No warnings found.'+
      '</span>'+
      '<md-list-item class="md-2-line" ng-repeat=\'event in events\'>'+
      '<div class="md-list-item-text">'+
      '<h3 ng-class="event.event_type == \'box.online\' ? \'muted\' : \'offline\'">{{ event.data.ap_mac }} {{ event.event_type == \'box.online\' ? \'Reconnected\' : \'Disconnected\' }}</h3>'+
      '<p>Last seen {{ event.data.last_heartbeat | mysqlTime }} <a href=\'/#/locations/{{ event.data.location_name}}/boxes?q={{ event.data.ap_mac}}\'><md-icon md-font-icon="" style="font-size: 14px;">arrow_forward</md-icon></a></p>'+
      '</div>'+
      '</md-list-item>'+
      '</md-card-content>'+
      '<md-divider></md-divider>'+
      '</md-card>'
  };

}]);

app.directive('radiusTimeline', ['Report', '$routeParams', '$location', 'Location', '$timeout', function(Report, $routeParams, $location, Location, $timeout) {

  var link = function( scope, element, attrs, controller ) {

    var timer, results, c, json;
    var options = controller.options;

    scope.period   = $routeParams.period   || '7d';
    // scope.interval = $routeParams.interval || '12h';
    // scope.fill     = $routeParams.fill     || '0';

    attrs.$observe('render', function(val){
      if (val !== '') {
        scope.type = attrs.type;
        if ($routeParams.type) {
          scope.type = $routeParams.type;
        }
        if (scope.type === 'clients') {
          scope.interval = 'day';
        }
        scope.subhead = attrs.subhead;
        scope.render = attrs.render;
        init();
      }
    });

    $(window).resize(function() {
      if (this.resizeTO) {
        clearTimeout(this.resizeTO);
      }
      this.resizeTO = setTimeout(function() {
        $(this).trigger('resizeEnd');
      }, 500);
    });

    $(window).on('resizeEnd', function() {
      drawChart();
    });

    var drawChart = function() {

      var stats, start;
      $timeout.cancel(timer);

      var data = new window.google.visualization.DataTable();

      data.addColumn('datetime', 'Date');
      data.addColumn('number', 'dummy series');

      if (json && json.timeline && (json.timeline.stats && json.timeline.stats.length || json.timeline.uniques)) {

        scope.noData = undefined;
        scope.loading = undefined;

        if (scope.type === 'usage') {

          data.addColumn('number', 'Inbound');
          data.addColumn('number', 'Outbound');

          stats = json.timeline.stats;

          for(var i = 0; i < stats.length; i++) {
            var time = new Date(stats[i].time * (1000));
            data.addRow([time, null, stats[i].inbound / (1000*1000) , stats[i].outbound / (-1000*1000) ]);
          }

        } else {

          data.addColumn('number', scope.title);

          stats = json.timeline.stats;
          start = new Date(json._stats.start * 1000);

          for(var i = 0; i < stats.length; i++) {
            var time = new Date(stats[i].time * (1000));
            data.addRow([time, null, stats[i].count]);
          }
        }


        c = new window.google.visualization.LineChart(document.getElementById(scope.render));
        c.draw(data, options);

      } else {
        scope.noData = true;
        scope.loading = undefined;
        clearChart();
      }
    };

    var clearChart = function() {
      if (c) {
        c.clearChart();
      }
    };

    scope.changeType = function(t) {
      clearChart();
      scope.type = t;
      // searchParams();
      init();
    };

    // var searchParams = function() {
    //   var hash = {};
    //   hash.type = scope.type;
    //   $location.search(hash);
    // };

    var createTitle = function() {
      switch(scope.type) {
        case 'usage':
          scope.title = 'Radius Usage';
          break;
        case 'impressions':
          scope.title = 'Splash Views';
          break;
        case 'uniques':
          scope.title = 'Radius Uniques';
          break;
        default:
          scope.title = 'Radius Sessions';
      }
    };

    var init = function() {

      createTitle();
      var params = {
        resource: 'splash',
        type: scope.type,
        interval: scope.interval || 'hour'
        // distance: ''
      };

      controller.get(params).then(function(results) {

        json = results;

        timer = $timeout(function() {
          drawChart();
        },500);
        scope.loading = undefined;
      });
    };

    init();
  };

  return {
    link: link,
    scope: {
      type: '@',
      title: '@',
      render: '@',
      subhead: '@'
    },
    require: '^analytics',
    template:
      '<md-card>'+
      '<md-card-header class="graph-small">'+
      '<md-card-header-text>'+
      '<span class="md-subhead">'+
      '{{ fn | titleCase }} {{ title }}'+
      '</span>'+
      '</md-card-header-text>'+
      '<md-button class="md-icon-button" ng-click="refresh()">'+
      '<md-icon>refresh</md-icon>'+
      '</md-button>'+
      '<md-menu-bar style="padding: 0">'+
      '<md-menu>'+
      '<button ng-click="$mdOpenMenu()">'+
      '<md-icon>more_vert</md-icon>'+
      '</button>'+
      '<md-menu-content width="3">'+
      '<md-menu-item>'+
      '<md-button ng-click="changeType()">'+
      'Sessions'+
      '</md-button>'+
      '</md-menu-item>'+
      '<md-menu-item>'+
      '<md-button ng-click="changeType(\'uniques\')">'+
      'Unique Clients'+
      '</md-button>'+
      '</md-menu-item>'+
      '<md-menu-item>'+
      '<md-button ng-click="changeType(\'impressions\')">'+
      'Splash Views'+
      '</md-button>'+
      '</md-menu-item>'+
      '<md-menu-item>'+
      '<md-button ng-click="changeType(\'usage\')">'+
      'Usage Data'+
      '</md-button>'+
      '</md-menu-item>'+
      '</md-menu-content>'+
      '</md-menu>'+
      '</md-menu-bar>'+
      '</md-card-header>'+
      '<md-card-content>'+
      '<div id="{{ render }}"></div>'+
      '<div>'+
      '<div layout="row" ng-if=\'noData || loading\' style=\'min-height: 250px;\' layout-align="left end" class=\'muted\'>'+
      '<p><small><span ng-if=\'noData\'>No graph data</span><span ng-if=\'loading\'>Loading graph data</span></small></p>'+
      '</div>'+
      '<md-progress-linear ng-if=\'loading\' md-mode="query"></md-progress-linear>'+
      '</div>'+
      '</md-card-content>'+
      '</md-card>'
  };

}]);

app.directive('wirelessTimeline', ['Report', '$routeParams', '$location', 'Location', '$timeout', function(Report, $routeParams, $location, Location, $timeout) {

  var link = function( scope, element, attrs, controller ) {

    var timer, results, c, json;
    var options = controller.options;

    scope.period   = $routeParams.period   || '7d';
    scope.interval = $routeParams.interval || '12h';
    scope.fill     = $routeParams.fill     || '0';

    scope.location_id = $routeParams.location_id;

    attrs.$observe('render', function(val){
      if (val !== '') {
        scope.type = attrs.type;
        if ($routeParams.type) {
          scope.type = $routeParams.type;
        }
        scope.subhead = attrs.subhead;
        scope.render = attrs.render;
        init();
      }
    });

    $(window).resize(function() {
      if (this.resizeTO) {
        clearTimeout(this.resizeTO);
      }
      this.resizeTO = setTimeout(function() {
        $(this).trigger('resizeEnd');
      }, 500);
    });

    $(window).on('resizeEnd', function() {
      drawChart();
    });

    var drawChart = function() {

      var stats, start, i, time;
      $timeout.cancel(timer);

      var data = new window.google.visualization.DataTable();

      data.addColumn('datetime', 'Date');
      data.addColumn('number', 'dummy series');

      if (json && json.timeline && (json.timeline.stats && json.timeline.stats.length || json.timeline.inbound)) {

        scope.noData = undefined;
        scope.loading = undefined;

        if (scope.type === 'usage') {

          data.addColumn('number', 'Inbound');
          data.addColumn('number', 'Outbound');

          for(i = 0; i < json.timeline.inbound.length; i++) {
            time = new Date(json.timeline.inbound[i].time / (1000*1000));
            data.addRow([time, null, json.timeline.inbound[i].value / (1000*1000) , json.timeline.outbound[i].value / (1000*1000) ]);
          }

        } else {

          data.addColumn('number', scope.title);

          stats = json.timeline.stats;
          start = new Date(json._stats.start * 1000);

          for(i = 0; i < stats.length; i++) {
            time = new Date(stats[i].time * (1000));
            data.addRow([time, null, stats[i].count]);
          }
        }

        c = new window.google.visualization.LineChart(document.getElementById(scope.render));
        c.draw(data, options);

      } else {
        scope.noData = true;
        scope.loading = undefined;
        clearChart();
      }
    };

    var clearChart = function() {
      if (c) {
        c.clearChart();
      }
    };

    scope.changeType = function(t) {
      clearChart();
      scope.type = t;
      // searchParams();
      init();
    };

    // var searchParams = function() {
    //   var hash = {};
    //   hash.type = scope.type;
    //   hash.period = scope.period;
    //   hash.location_id = scope.location_id;
    //   hash.fill = scope.fill;
    //   $location.search(hash);
    // };

    var createTitle = function() {
      switch(scope.type) {
        case 'usage':
          scope.title = 'Wireless Usage';
          break;
        default:
          scope.title = 'Unique Clients';
      }
    };

    var init = function() {

      createTitle();
      var params = {
        resource: 'device',
        type: scope.type,
        period: scope.period,
        interval: scope.interval,
        fill: scope.fill
        // distance: ''
      };

      controller.get(params).then(function(results) {

        json = results;

        timer = $timeout(function() {
          drawChart();
        },500);
        scope.loading = undefined;
      });
    };

    init();
  };

  return {
    link: link,
    scope: {
      type: '@',
      title: '@',
      render: '@',
      subhead: '@'
    },
    require: '^analytics',
    template:
      '<md-card>'+
      '<md-card-header class="graph-small">'+
      '<md-card-header-text>'+
      '<span class="md-subhead">'+
      '{{ fn | titleCase }} {{ title }}'+
      '</span>'+
      '</md-card-header-text>'+
      '<md-button class="md-icon-button" ng-click="refresh()">'+
      '<md-icon>refresh</md-icon>'+
      '</md-button>'+
      '<md-menu-bar style="padding: 0">'+
      '<md-menu>'+
      '<button ng-click="$mdOpenMenu()">'+
      '<md-icon>more_vert</md-icon>'+
      '</button>'+
      '<md-menu-content width="3">'+
      // '<md-menu-item>'+
      // '<md-button ng-click="changeType()">'+
      // 'Sessions'+
      // '</md-button>'+
      // '</md-menu-item>'+
      '<md-menu-item>'+
      '<md-button ng-click="changeType(\'uniques\')">'+
      'Unique Clients'+
      '</md-button>'+
      '</md-menu-item>'+
      '<md-menu-item>'+
      '<md-button ng-click="changeType(\'usage\')">'+
      'Usage Data'+
      '</md-button>'+
      '</md-menu-item>'+
      // '<md-menu-item>'+
      // '<md-button ng-click="changeType(\'usage\')">'+
      // 'Usage Data'+
      // '</md-button>'+
      // '</md-menu-item>'+
      '</md-menu-content>'+
      '</md-menu>'+
      '</md-menu-bar>'+
      '</md-card-header>'+
      '<md-card-content>'+
      '<div id="{{ render }}"></div>'+
      '<div>'+
      '<div layout="row" ng-if=\'noData || loading\' style=\'min-height: 250px;\' layout-align="left end" class=\'muted\'>'+
      '<p><small><span ng-if=\'noData\'>No graph data</span><span ng-if=\'loading\'>Loading graph data</span></small></p>'+
      '</div>'+
      '<md-progress-linear ng-if=\'loading\' md-mode="query"></md-progress-linear>'+
      '</div>'+
      '</md-card-content>'+
      '</md-card>'
  };

}]);

app.directive('wirelessStats', ['Report', '$routeParams', '$location', 'Location', '$timeout', function(Report, $routeParams, $location, Location, $timeout) {

  var link = function( scope, element, attrs, controller ) {

    var init = function() {

      scope.stats = {};

      var params = {
        resource: 'client',
        type: 'wireless_stats',
        interval: 'hour'
      };

      controller.get(params).then(function(results) {
        scope.stats = results.stats;
      });
    };

    init();
  };

  return {
    link: link,
    scope: {
      type: '@',
      title: '@',
      render: '@',
      subhead: '@'
    },
    require: '^analytics',
    template:
      '<div class=\'md-padding\' layout-gt-xs=\'row\' layout=\'column\'>'+
      '<md-card flex-gt-xs="20">'+
      '<md-card-content>'+
      '<md-list-item class="md-2-line">'+
      '<div class="md-list-item-text">'+
      '<h3>Unique Users</h3>'+
      '<p>{{ stats.uniques || 0 }}</p>'+
      '</div>'+
      '</md-list-item>'+
      '</md-card-content>'+
      '</md-card>'+
      '<md-card flex-gt-xs="20">'+
      '<md-card-content>'+
      '<md-list-item class="md-2-line">'+
      '<div class="md-list-item-text">'+
      '<h3>New Clients</h3>'+
      '<p>{{ stats.created || 0 }}</p>'+
      '</div>'+
      '</md-list-item>'+
      '</md-card-content>'+
      '</md-card>'+
      '<md-card flex-gt-xs="20">'+
      '<md-card-content>'+
      '<md-list-item class="md-2-line">'+
      '<div class="md-list-item-text">'+
      '<h3>Data Transferred</h3>'+
      '<p>0 TBC</p>'+
      '</div>'+
      '</md-list-item>'+
      '</md-card-content>'+
      '</md-card>'+
      '<md-card flex-gt-xs="20">'+
      '<md-card-content>'+
      '<md-list-item class="md-2-line">'+
      '<div class="md-list-item-text">'+
      '<h3>TBC</h3>'+
      '<p>0 TBC</p>'+
      '</div>'+
      '</md-list-item>'+
      '</md-card-content>'+
      '</md-card>'+
      '</div>'
  };

}]);

app.directive('radiusStats', ['Report', '$routeParams', '$location', 'Location', '$timeout', function(Report, $routeParams, $location, Location, $timeout) {

  var link = function( scope, element, attrs, controller ) {

    var init = function() {

      scope.stats = {};

      var params = {
        resource: 'splash',
        type: 'splash_stats',
        interval: 'hour'
      };

      // Get the splash stats
      controller.get(params).then(function(results) {
        scope.stats.splash = results.stats;

        // Get the voucher stats
        params.type = 'voucher_stats';
        controller.get(params).then(function(results) {
          scope.stats.vouchers = results.stats;
        });
      });
    };

    init();
  };

  return {
    link: link,
    scope: {
      type: '@',
      title: '@',
      render: '@',
      subhead: '@'
    },
    require: '^analytics',
    template:
      '<div class=\'md-padding\' layout-gt-xs=\'row\' layout=\'column\'>'+
      '<md-card flex-gt-xs="20">'+
      '<md-card-content>'+
      '<md-list-item class="md-2-line">'+
      '<div class="md-list-item-text">'+
      '<h3>Unique Users</h3>'+
      '<p>{{ stats.splash.uniques || 0 }}</p>'+
      '</div>'+
      '</md-list-item>'+
      '</md-card-content>'+
      '</md-card>'+
      '<md-card flex-gt-xs="20">'+
      '<md-card-content>'+
      '<md-list-item class="md-2-line">'+
      '<div class="md-list-item-text">'+
      '<h3>Average Session</h3>'+
      '<p>{{ (stats.splash.durations.avg / 60) | number:0 }} Mins</p>'+
      '</div>'+
      '</md-list-item>'+
      '</md-card-content>'+
      '</md-card>'+
      '<md-card flex-gt-xs="20">'+
      '<md-card-content>'+
      '<md-list-item class="md-2-line">'+
      '<div class="md-list-item-text">'+
      '<h3>Total Sessions</h3>'+
      '<p>{{ stats.splash.total_sessions }}</p>'+
      '</div>'+
      '</md-list-item>'+
      '</md-card-content>'+
      '</md-card>'+
      '<md-card flex-gt-xs="20">'+
      '<md-card-content>'+
      '<md-list-item class="md-2-line">'+
      '<div class="md-list-item-text">'+
      '<h3>Data Transferred</h3>'+
      '<p>{{ (stats.splash.usage.inbound.sum + stats.splash.usage.outbound.sum) | humanData }}</p>'+
      '</div>'+
      '</md-list-item>'+
      '</md-card-content>'+
      '</md-card>'+
      '<md-card flex-gt-xs="20" hide show-gt-sm>'+
      '<md-card-content>'+
      '<md-list-item class="md-2-line">'+
      '<div class="md-list-item-text">'+
      '<h3>Vouchers</h3>'+
      '<p>{{ stats.vouchers.created }} created, {{ stats.vouchers.activated }} used.</p>'+
      '</div>'+
      '</md-list-item>'+
      '</md-card-content>'+
      '</md-card>'+
      '</div>'
  };

}]);
