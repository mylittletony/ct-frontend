'use strict';

var app = angular.module('myApp.reports.v2.directives', []);

app.factory('Locations', [function() {
  return { current: '', all: '' };
}]);

app.directive('reportsHeader', ['Report', '$routeParams', '$location', 'Location', '$q', '$window', 'Locations', '$timeout', '$cookies', '$route', 'gettextCatalog', function(Report, $routeParams,$location, Location, $q, $window, Locations, $timeout, $cookies, $route, gettextCatalog) {

  var link = function( scope, element, attrs, controller ) {

    scope.period = $routeParams.period || '7d';

    var cid = $cookies.get('_ctlid');
    if (cid) {
      cid = JSON.parse(cid);
    }

    scope.location_name = $routeParams.location_name;
    scope.selectedItem  = scope.location_name;

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

    var timer;
    function selectedItemChange(item) {
      timer = $timeout(function() {
        var hash = {};
        hash.location_id   = item.id;
        hash.location_name = item.location_name;
        $location.search(hash);
        $route.reload();
      }, 250);
    }

    scope.querySearch        = querySearch;
    scope.selectedItemChange = selectedItemChange;
    scope.searchTextChange   = searchTextChange;

    scope.updatePeriod = function(period) {
      var hash = $location.search();
      hash.period = period;
      $location.search(hash);
      $route.reload();
    };

  };

  return {
    link: link,
    require: '^analytics',
    scope: {
      loading: '=',
    },
    templateUrl: 'components/reports/_header.html'
  };

}]);

app.directive('wirelessReports', ['Report', '$routeParams', '$location', 'Location', '$q', 'Locations', '$cookies', function(Report, $routeParams,$location,Location, $q, Locations, $cookies) {

  var link = function( scope, element, attrs ) {

    var params;
    var cid = $cookies.get('_ctlid');
    var lid = $routeParams.location_id;

    function init() {
      if (lid) {
        Location.current  = { id: lid };
        params = {id: lid, location_name: $routeParams.location_name};
        var json = JSON.stringify(params);
        $cookies.put('_ctlid', json);
      } else if (cid) {
        cid = JSON.parse(cid);
        params = {location_id: cid.id, location_name: cid.location_name};
        Location.current = { id: cid.id };
        $location.search(params);
      } else {
        getLocations();
      }
    }

    function getLocations() {
      Location.favourites({per: 15}).$promise.then(function(results) {
        Locations.all     = results.locations;
        if (!$routeParams.location_id) {
          Location.current  = results.locations[0];
          $location.search({location_id: Location.current.id, location_name: results.locations[0].location_name});
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

app.directive('analytics', ['Report', '$routeParams', '$location', 'Location', '$q', '$route', '$cookies', 'menu', 'gettextCatalog', function(Report, $routeParams,$location,Location, $q, $route, $cookies, menu, gettextCatalog) {

  var link = function( scope, element, attrs ) {

    if ($cookies.get('_ctm') === 'true') {
      menu.isOpenLeft = false;
      menu.isOpen = false;
    } else {
      menu.isOpen = true;
    }
    menu.hideBurger = false;
    menu.sections = [{}];
    menu.sectionName = gettextCatalog.getString('Reports');
    menu.header = '';

    var isActive = function(path) {
      var split = $location.path().split('/');
      if (split.length >= 3) {
        return ($location.path().split('/')[2] === path);
      } else if (path === 'dashboard') {
        return true;
      }
    };

    var createMenu = function() {
      menu.header = gettextCatalog.getString('Usage Reports');

      menu.sections.push({
        name: gettextCatalog.getString('Wireless Stats'),
        link: '/#/reports/',
        type: 'link',
        icon: 'wifi',
        active: isActive('dashboard')
      });

      menu.sections.push({
        name: gettextCatalog.getString('Radius Stats'),
        type: 'link',
        link: '/#/reports/radius',
        icon: 'donut_large',
        active: isActive('radius')
      });

    };

    createMenu();

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

    this.setInterval = function(period) {
      var interval;
      switch(period) {
        case '5m':
          interval = '10s';
          break;
        case '30m':
          interval = '1m';
          break;
        case '1d':
          interval = '30m';
          break;
        case '6h':
          interval = '180s';
          break;
        case '7d':
          interval = '1h';
          break;
        case '14d':
          interval = '1h';
          break;
        case '30d':
          interval = '1h';
          break;
        default:
          interval = '60s';
      }
      return interval;
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
        },
      },
      legend: {
        position: 'none'
      },
      lineWidth: 1.5,
      hAxis: {
        // format: 'dd MMM'
      },
      crosshair: {
        trigger: 'both',
        orientation: 'vertical'
      },
      chartArea: {
        left: '2%',
        top: '3%',
        height: '84%',
        width: '92%'
      },
      explorer: {
        maxZoomOut:2,
        keepInBounds: true,
        axis: 'horizontal',
        actions: [ 'dragToZoom', 'rightClickToReset'],
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

app.directive('reportsPie', ['Report', '$routeParams', '$location', 'Location', '$timeout', 'Shortener', 'gettextCatalog', function(Report, $routeParams, $location, Location, $timeout, Shortener, gettextCatalog) {

  var link = function( scope, element, attrs, controller ) {

    var timer, json;

    var period, location_id;

    var drawChart = function() {

      var options = {};

      $timeout.cancel(timer);

      options.colors = ['#FFC107', '#009688', '#FF5722', '#03A9F4', '#FF5722', '#607D8B', '#F44336', '#E91E63', '#3F51B5', '#2196F3', '#4CAF50', '#FFC107'];
      options.chartArea = { width: '90%;', left: 10, right: 10 };
      options.legend = { position: attrs.legend || 'none' };
      options.height = '255';
      options.sliceVisibilityThreshold = 0;

      var len = json.length;
      var data = new window.google.visualization.DataTable();

      data.addColumn('string', 'Column');
      data.addColumn('number', 'Populartiy');

      var empty = 0;
      var term;
      for(var i = 0; i < len; i++) {
        term = json[i].term;
        var val = json[i].count;
        if (val === 0) {
          empty++;
        } else {
          data.addRow([term, val]);
        }
      }

      if (empty === 2) {
        data.addRow([term, 0.000001]);
      }

      if (empty === 2 || len === 1) {
        options.colors = ['#009688'];
      }

      if (scope.type === 'popular' ) {
        options.pieSliceText = 'value';
      }

      if (attrs.hole) {
        options.pieHole = attrs.hole;
      }

      var chart = new window.google.visualization.PieChart(document.getElementById(scope.render));

      if (attrs.tooltip) {
        options.tooltip = { trigger: 'selection' };

        chart.setAction({
          id: 'record',
          text: gettextCatalog.getString('View ') + attrs.tooltip,
          action: function() {
            var selection = chart.getSelection();
            shortener(json[selection[0].row].short);
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
        resource: attrs.resource,
        location_id: location_id,
        period: period
      };

      var data;
      controller.get(params).then(function(results) {
        data = results;
        if (scope.type === 'splash_data') {
          var a = [];
          a.push({ count: data.stats.inbound.total / (1000*1000), term: 'Inbound'});
          a.push({ count: data.stats.outbound.total / (1000*1000), term: 'Outbound'});
          data.stats = a;
        }
      }, function() {
        var a = [];
        a.push({ count: 0.00001, term: 'No data' });
        data = { stats: a };
      });
      timer = $timeout(function() {
        json = data.stats;
        drawChart();
      },500);
      scope.loading       = undefined;
    };

    attrs.$observe('render', function(val){
      if (val !== '') {
        scope.title     = attrs.title;
        scope.type      = attrs.type;
        scope.subhead   = attrs.subhead;
        scope.render    = attrs.render;
        period          = $routeParams.period   || '7d';
        location_id     = $routeParams.location_id;
        init();
      }
    });

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
    templateUrl: 'components/reports/_pie_charts.html',
  };

}]);

app.directive('radiusTimeline', ['Report', '$routeParams', '$location', 'Location', '$timeout', '$rootScope', 'gettextCatalog', function(Report, $routeParams, $location, Location, $timeout, $rootScope, gettextCatalog) {

  var link = function( scope, element, attrs, controller ) {

    var timer, results, c, json, stats, start;
    var options = controller.options;

    scope.interval    = '1d';
    scope.period      = $routeParams.period   || '7d';
    scope.fill        = $routeParams.fill     || '0';
    scope.location_id = $routeParams.location_id;
    scope.type        = $routeParams.type;

    attrs.$observe('render', function(val){
      if (val !== '') {
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

      $timeout.cancel(timer);

      var data = new window.google.visualization.DataTable();

      data.addColumn('datetime', 'Date');
      data.addColumn('number', 'dummy series');

      if (json && json.timeline && (json.timeline.stats && json.timeline.stats.length || json.timeline.uniques)) {

        scope.noData = undefined;
        scope.loading = undefined;

        if (scope.type === 'usage') {
          drawUsage(data);
        } else {
          drawClients(data);
        }

        c = new window.google.visualization.LineChart(document.getElementById(scope.render));
        c.draw(data, options);

      } else {
        scope.noData = true;
        scope.loading = undefined;
        clearChart();
      }
    };

    var drawUsage = function(data) {
      data.addColumn('number', 'Inbound');
      data.addColumn('number', 'Outbound');

      stats = json.timeline.stats;

      for(var i = 0; i < stats.length; i++) {
        var time = new Date(stats[i].time * (1000));
        data.addRow([time, null, stats[i].inbound / (1000*1000) , stats[i].outbound / (-1000*1000) ]);
      }

      options.vAxes = {
        0: {
          textPosition: 'none'
        },
        1: {
          format: '#Gb'
        }
      };

      var formatter = new window.google.visualization.NumberFormat(
        { suffix: 'Gb', pattern: '#,##0.00;'}
      );
      formatter.format(data,3);
      formatter.format(data,2);

    };

    var drawClients = function(data) {
      data.addColumn('number', scope.title);

      stats = json.timeline.stats;
      start = new Date(json._stats.start * 1000);

      for(var i = 0; i < stats.length; i++) {
        var time = new Date(stats[i].time * (1000));
        data.addRow([time, null, stats[i].count]);
      }

      options.vAxes = {
        0: {
          textPosition: 'none'
        },
        1: {
          format: ''
        }
      };

      var date_formatter = new window.google.visualization.DateFormat({
        pattern: 'MMM dd, yyyy'
      });
      date_formatter.format(data,0);

    };

    var clearChart = function() {
      if (c) {
        c.clearChart();
      }
    };

    scope.changeType = function(t) {
      clearChart();
      var hash        = $location.search();
      hash.type       = t;
      scope.type      = t;
      hash.interval   = scope.interval;
      $location.search(hash);
      init();
    };

    var createTitle = function() {
      switch(scope.type) {
        case 'usage':
          scope.title = gettextCatalog.getString('Radius Usage');
          break;
        case 'impressions':
          scope.title = gettextCatalog.getString('Splash Views');
          break;
        case 'uniques':
          scope.title = gettextCatalog.getString('Radius Uniques');
          break;
        default:
          scope.title = gettextCatalog.getString('Radius Sessions');
      }
    };

    scope.init = function() {
      init();
    };

    var init = function() {
      createTitle();
      var params = {
        resource:       'splash',
        type:           scope.type,
        period:         scope.period,
        interval:       scope.interval,
        fill:           scope.fill,
        location_id:    scope.location_id
      };

      controller.get(params).then(function(results) {
        json = results;
        timer = $timeout(function() {
          drawChart();
        },500);
        scope.loading = undefined;
      }, function(err) {
        console.log(err);
      });
    };

    $rootScope.$on('$routeChangeStart', function (event, next, current) {
      $timeout.cancel(timer);
    });

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
    templateUrl: 'components/reports/_radius_timeline.html',
  };

}]);

app.directive('wirelessTimeline', ['Report', '$routeParams', '$location', 'Location', '$timeout', '$rootScope', 'gettextCatalog', function(Report, $routeParams, $location, Location, $timeout, $rootScope, gettextCatalog) {

  var link = function( scope, element, attrs, controller ) {

    var timer, results, c, json, stats, start;
    var options = controller.options;

    scope.period      = $routeParams.period   || '7d';
    scope.interval    = $routeParams.interval || '12h';
    scope.fill        = $routeParams.fill     || '0';
    scope.location_id = $routeParams.location_id;
    scope.type        = $routeParams.type;

    attrs.$observe('render', function(val){
      if (val !== '') {
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

      var data = new window.google.visualization.DataTable();

      data.addColumn('datetime', 'Date');
      data.addColumn('number', 'dummy series');

      if (json && json.timeline && (json.timeline.stats && json.timeline.stats.length || json.timeline.inbound)) {

        scope.noData = undefined;
        scope.loading = undefined;

        if (scope.type === 'usage') {
          drawUsage(data);
        } else {
          drawUniques(data);
        }

        var date_formatter = new window.google.visualization.DateFormat({
          pattern: 'MMM dd, yyyy'
        });
        date_formatter.format(data,0);

        c = new window.google.visualization.LineChart(document.getElementById(scope.render));
        c.draw(data, options);

      } else {
        scope.noData = true;
        scope.loading = undefined;
        clearChart();
      }
    };

    var drawUsage = function(data) {
      data.addColumn('number', 'Inbound');
      data.addColumn('number', 'Outbound');

      for(var i = 0; i < json.timeline.inbound.length; i++) {
        var time = new Date(json.timeline.inbound[i].time / (1000*1000));
        data.addRow([time, null, json.timeline.inbound[i].value / (1000*1000*1000) , json.timeline.outbound[i].value / (1000*1000*1000) ]);
      }

      options.vAxes = {
        0: {
          textPosition: 'none'
        },
        1: {
          format: '#Gb'
        }
      };

      var formatter = new window.google.visualization.NumberFormat(
        { suffix: 'Gb', pattern: '#,##0.00;'}
      );
      formatter.format(data,3);
      formatter.format(data,2);

    };

    var drawUniques = function(data) {
      data.addColumn('number', scope.title);

      stats = json.timeline.stats;
      start = new Date(json._stats.start * 1000);

      for(var i = 0; i < stats.length; i++) {
        var time = new Date(stats[i].time * (1000));
        data.addRow([time, null, stats[i].count]);
      }

      options.vAxes = {
        0: {
          textPosition: 'none'
        },
        1: {
          format: ''
        }
      };

      var formatter = new window.google.visualization.NumberFormat(
        { pattern: '#,##0;'}
      );

      formatter.format(data,2);
    };

    var clearChart = function() {
      if (c) {
        c.clearChart();
      }
    };

    scope.changeType = function(t) {
      clearChart();
      var hash        = $location.search();
      hash.type       = t;
      scope.type      = t;
      scope.interval  = controller.setInterval(scope.period);
      hash.interval   = scope.interval;
      $location.search(hash);
      init();
    };

    var createTitle = function() {
      switch(scope.type) {
        case 'usage':
          scope.title = gettextCatalog.getString('Wireless Usage');
          break;
        default:
          scope.title = gettextCatalog.getString('Unique Clients');
      }
    };

    scope.init = function() {
      init();
    };

    var init = function() {
      createTitle();
      var params = {
        resource:       'device',
        type:           scope.type,
        period:         scope.period,
        interval:       scope.interval,
        fill:           scope.fill,
        location_id:    scope.location_id
      };

      controller.get(params).then(function(results) {
        json = results;
        timer = $timeout(function() {
          drawChart();
        },500);
        scope.loading = undefined;
      }, function(err) {
        console.log(err);
      });
    };

    $rootScope.$on('$routeChangeStart', function (event, next, current) {
      $timeout.cancel(timer);
    });

    // init();
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
    templateUrl: 'components/reports/_wireless_timeline.html',
  };

}]);

app.directive('wirelessStats', ['Report', '$routeParams', '$location', 'Location', '$timeout', function(Report, $routeParams, $location, Location, $timeout) {

  var link = function( scope, element, attrs, controller ) {

    var init = function() {

      scope.stats = {};

      var params = {
        resource: 'client',
        type: 'wireless_stats',
        interval: 'hour',
        location_id: $routeParams.location_id,
        period: $routeParams.period || '7d'
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
    templateUrl: 'components/reports/_wireless_stats.html',
  };

}]);

app.directive('radiusStats', ['Report', '$routeParams', '$location', 'Location', '$timeout', function(Report, $routeParams, $location, Location, $timeout) {

  var link = function( scope, element, attrs, controller ) {

    var init = function() {

      scope.stats = {};

      var params = {
        resource: 'splash',
        type: 'splash_stats',
        interval: 'hour',
        location_id: $routeParams.location_id,
        period: $routeParams.period || '7d'
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
    templateUrl: 'components/reports/_radius_stats.html',
  };

}]);
