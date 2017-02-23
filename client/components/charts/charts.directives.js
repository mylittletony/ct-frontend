'use strict';

var app = angular.module('myApp.charts.directives', []);

app.directive('clientsChart', ['$timeout', '$rootScope', 'gettextCatalog', function($timeout, $rootScope, gettextCatalog) {

  var link = function(scope,element,attrs,controller) {

    var chart, d, json, len, formatter, i, time, title, data, timer, options;

    function toTitleCase(str) {
      return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
    }

    controller.$scope.$on('clientIndexChart', function(val,obj) {
      init(obj);
    });

    $(window).resize(function() {
      if (this.resizeTO) {
        clearTimeout(this.resizeTO);
      }
      this.resizeTO = setTimeout(function() {
        $(this).trigger('resizeEnd');
      }, 250);
    });

    $(window).on('resizeEnd', function() {
      window.google.charts.setOnLoadCallback(drawChart);
    });

    function init(obj) {

      scope.fn = obj.fn;
      scope.type = obj.type;
      json = obj.data;

      window.google.charts.setOnLoadCallback(drawChart);
    }

    var clearChart = function() {
      if (chart) {
        chart.clearChart();
      }
      scope.noData = true;
      scope.loading = undefined;
    };

    function drawChart() {

      $timeout.cancel(timer);

      // For the tests mainly, not sure why this has started causing a failure
      if (window.google && window.google.visualization) {
        data = new window.google.visualization.DataTable();

        data.addColumn('datetime', 'Date');
        data.addColumn('number', 'dummySeries');

        options = {
          lineWidth: 1.5,
          legend: { position: 'none' },
          crosshair: {
            trigger: 'both',
            orientation: 'vertical'
          },
          focusTarget: 'category',
          fontName: 'roboto',
          explorer: {
            axis: 'horizontal',
            actions: [ 'dragToZoom', 'rightClickToReset'],
          },
          chartArea: {
            left: '2%',
            // right: '2%',
            top: '3%',
            height: '84%',
            width: '94%'
          },
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
          }
        };
        options.hAxis = {
          count: -1,
          gridlines: {
            units: {
              days: {format: [gettextCatalog.getString('MMM dd, yyyy')]},
              hours: {format: [gettextCatalog.getString('hh:mm a')]},
              minutes: {format: [gettextCatalog.getString('hh:mm a')]}
            }
          }
        };

        if (scope.type === 'signal') {
          signalChart();
        } else if (scope.type === 'failures') {
          failureChart();
        } else if (scope.type === 'mcs') {
          mcsChart();
        } else {
          txChart();
        }

        var compileChart = function() {
          if (!scope.noData) {
            chart = new window.google.visualization.LineChart(document.getElementById('clients-chart'));
            chart.draw(data, options);
          }
        };

        window.google.charts.setOnLoadCallback(compileChart);
      }

      // For the tests mainly, not sure why this has started causing a failure, like above
      if (window.google && window.google.visualization) {
        var date_formatter = new window.google.visualization.DateFormat({
          pattern: gettextCatalog.getString('MMM dd, yyyy hh:mm:ss a')
        });
        date_formatter.format(data,0);
      }
    }

    //fixme @Toni translations: the titles will not work like that
    var signalChart = function() {

      title = toTitleCase(scope.fn || gettextCatalog.getString('Mean')) + gettextCatalog.getString(' Signal Strength');
      data.addColumn('number', gettextCatalog.getString('SNR'));
      data.addColumn('number', gettextCatalog.getString('Signal'));
      data.addColumn('number', gettextCatalog.getString('Noise'));

      if (json.signal && json.signal.length) {

        len = json.signal.length;

        for(i = 0; i < len; i++) {
          time = new Date(json.signal[i].time / (1000*1000));
          var snr = 0, noise = 0, signal = 0;
          if (json.signal && json.signal[i] && json.signal[i].value) {
            signal = json.signal[i].value;
          }
          if (json.snr && json.snr[i] && json.snr[i].value) {
            snr = json.snr[i].value;
          }
          if (json.noise && json.noise[i] && json.noise[i].value) {
            noise = json.noise[i].value;
          }
          data.addRow([time, null, snr, signal, noise ]);
        }

        formatter = new window.google.visualization.NumberFormat(
          {suffix: 'dB', negativeColor: 'red', negativeParens: true, pattern: '0'}
        );
        formatter.format(data,1);
        formatter = new window.google.visualization.NumberFormat(
          {suffix: 'dBm', negativeColor: 'red', negativeParens: true, pattern: '0'}
        );
        formatter.format(data,2);
        formatter.format(data,3);
        formatter.format(data,4);

        options.vAxis = {
          viewWindowMode:'explicit',
          viewWindow:{
            min: -100,
            max: 100
          }
        };
      } else {
        clearChart();
      }
    };

    //fixme @Toni translations: the titles are not ok like that, think of something
    var failureChart = function() {
      title = toTitleCase(scope.fn || gettextCatalog.getString('Mean')) + gettextCatalog.getString('Transmission Failures');
      data.addColumn('number', gettextCatalog.getString('TX Failed'));

      if (json && json.txfailed && json.txfailed.length) {
        len = json.txfailed.length;
        for(i = 0; i < len; i++) {
          time = new Date(json.txfailed[i].time / (1000*1000));
          data.addRow([time, null, json.txfailed[i].value]);
        }
        formatter = new window.google.visualization.NumberFormat(
          {pattern: '0'}
        );
        formatter.format(data,1);
      } else {
        clearChart();
      }
    };

    var mcsChart = function() {
      title = toTitleCase(scope.fn || gettextCatalog.getString('Mean')) + gettextCatalog.getString('MCS Values');
      data.addColumn('number', gettextCatalog.getString('MCS Index'));
      if (json.mcs && json.mcs.length) {
        len = json.mcs.length;
        for(i = 0; i < len; i++) {
          var mcs = json.mcs[i].value;
          if (!mcs) {
            mcs = 0;
          }
          time = new Date(json.mcs[i].time / (1000*1000));
          data.addRow([time, null, mcs]);
        }
        formatter = new window.google.visualization.NumberFormat(
          { pattern: '0' }
        );
        formatter.format(data,1);
      } else {
        clearChart();
      }
    };

    var txChart = function() {
      var suffix = 'Mbps';
      var type = 'Traffic';
      if (scope.type === 'usage') {
        type = 'Usage';
        suffix = 'MiB';
      }

      title = toTitleCase(scope.fn || gettextCatalog.getString('Mean')) + ' ' + type + ' (' + suffix + ')';

      data.addColumn('number', gettextCatalog.getString('Inbound'));
      data.addColumn('number', gettextCatalog.getString('Outbound'));

      if (json && json.inbound && json.inbound.length) {
        len = json.inbound.length;
        for(i = 0; i < len; i++) {

          var outbound = 0;
          var inbound = json.inbound[i].value;
          time = new Date(json.inbound[i].time / (1000*1000));

          if (json.outbound && json.outbound[i] && json.outbound[i].value) {
            outbound = json.outbound[i].value;
          }

          if (scope.type === 'usage') {
            data.addRow([time, null, inbound / (1000*1000), outbound / (1000*1000) ]);
          } else {
            data.addRow([time, null, inbound / (1000*1000), outbound / (1000*1000)]);
          }
        }
        formatter = new window.google.visualization.NumberFormat(
          {suffix: suffix, pattern: '0.000'}
        );
        formatter.format(data,2);
        formatter.format(data,3);
      } else {
        clearChart();
      }
    };

  };

  return {
    link: link,
    require: '^clientsIndex',
    scope: {
      json: '@',
      fn: '@',
      type: '@'
    },
    templateUrl: 'components/charts/clients/_clients_chart.html',
  };

}]);

app.directive('clientChart', ['Report', '$routeParams', '$q', 'ClientDetails', 'COLOURS', function(Report, $routeParams, $q, ClientDetails, COLOURS) {

  return {
    scope: {
      location: '@',
      mac: '@'
    },
    controller: function($scope,$element,$attrs) {

      var colours = COLOURS.split(' ');

      $(window).resize(function() {
        if (this.resizeTO) {
          clearTimeout(this.resizeTO);
        }
        this.resizeTO = setTimeout(function() {
          $(this).trigger('resizeEnd');
        }, 250);
      });

      $(window).on('resizeEnd', function() {
        $scope.$broadcast('loadClientChart');
      });

      this.$scope = $scope;

      this.options = {
        lineWidth: 1.5,
        // legend: { position: 'none' },
        height: 250,
        focusTarget: 'category',
        // fontName: 'roboto',
        crosshair: {
          trigger: 'both',
          orientation: 'vertical'
        },
        chartArea: {
          left: '3%',
          top: '3%',
          height: '84%',
          width: '90%'
        },
        interpolateNulls: true,
        colors: colours
      };

      this.setInterval = function() {
        switch(this.period) {
          case '5m':
            this.interval = '10s';
            break;
          case '30m':
            this.interval = '1m';
            break;
          case '1d':
            this.interval = '30m';
            break;
          case '6h':
            this.interval = '180s';
            break;
          case '7d':
            this.interval = '1h';
            break;
          case '14d':
            this.interval = '1h';
            break;
          case '30d':
            this.interval = '1h';
            break;
          case '1yr':
            this.interval = '1yr';
            break;
          default:
            this.interval = '180s';
        }
      };

      this.getStats = function(params) {
        var deferred = $q.defer();
        if (params.resource === 'location' ) {
          this.period = params.period || $routeParams.period;
        } else {
          this.period = params.period || $routeParams.period || '6h';
        }
        this.setInterval();
        $scope.client = ClientDetails.client;
        Report.clientstats({
          type:         params.type,
          fill:         params.fill || $routeParams.fill,
          fn:           params.fn || $routeParams.fn,
          ap_mac:       $scope.client.ap_mac,
          client_mac:   $scope.client.client_mac,
          location_id:  $routeParams.id,
          resource:     params.resource,
          interval:     params.interval || this.interval,
          period:       this.period,
          start:        params.start,
          end:          params.end,
        }).$promise.then(function(data) {
          if (data.usage || data.timeline) {
            deferred.resolve(data);
          } else {
            deferred.reject();
          }
        }, function() {
          deferred.reject();
        });
        return deferred.promise;
      };
    }
  };

}]);

app.directive('txChart', ['$timeout', 'Report', '$routeParams', 'gettextCatalog', function($timeout, Report, $routeParams, gettextCatalog) {

  var link = function(scope,element,attrs,controller) {

    var c, timer;
    var opts = controller.options;

    scope.type     = 'tx';
    scope.loading  = true;
    scope.fn       = 'mean';
    scope.resource = 'client';
    scope.noData   = undefined;

    controller.$scope.$on('loadClientChart', function (evt,type){
      if (type && type === 'device') {
        scope.resource = 'device';
      }
      chart();
    });

    scope.changeFn = function(type) {
      controller.fn = type;
      scope.fn = type;
      chart();
    };

    scope.changeTxType = function(t) {
      scope.type = t;
      chart(scope.type);
    };

    scope.refresh = function() {
      chart();
    };

    scope.fullScreen = function(type) {
      var t = { panel: type };
      if (!scope.fs) {
        scope.fs = true;
        controller.$scope.$broadcast('fullScreen', t);
      } else {
        scope.fs = undefined;
        controller.$scope.$broadcast('closeFullScreen', t);
      }
    };

    function chart() {
      var params = {
        type: scope.type,
        resource: scope.resource,
        fn: scope.fn
      };
      controller.getStats(params).then(function(data) {
        // timer = $timeout(function() {
        window.google.charts.setOnLoadCallback(drawChart(data.timeline));
        // },500);
      }, function() {
        clearChart();
      });
    }

    var clearChart = function() {
      if (c) {
        c.clearChart();
      }
      scope.noData = true;
      scope.loading = undefined;
    };

    function drawChart(json) {

      $timeout.cancel(timer);
      var len, time, suffix;

      if (json.txfailed || json.txretries || json.inbound) {

        if (scope.type === 'usage') {
          scope.title = gettextCatalog.getString('WiFi Usage');
          suffix = 'MB';
        } else if (scope.resource === 'device') {
          scope.title = gettextCatalog.getString('Device Traffic (Mbps)');
          suffix = 'Mbps';
        } else if (scope.type === 'tx') {
          scope.title = gettextCatalog.getString('WiFi Traffic (Mbps)');
          suffix = 'Mbps';
        } else if (scope.type === 'txfailed') {
          scope.title = gettextCatalog.getString('Failed Tx Count');
          suffix = undefined;
        } else if (scope.type === 'txretries') {
          scope.title = gettextCatalog.getString('Tx Retries');
          suffix = undefined;
        }

        var makeDataTable = function() {
          var data = new window.google.visualization.DataTable();
          data.addColumn('datetime', gettextCatalog.getString('Date'));
          data.addColumn('number', 'dummySeries');
          if (scope.type === 'device_tx' || scope.type === 'tx' || scope.type === 'usage') {
            len = json.inbound.length;
            data.addColumn('number', gettextCatalog.getString('Inbound'));
            data.addColumn('number', gettextCatalog.getString('Outbound'));
          } else if (scope.type === 'txfailed') {
            len = json.txfailed.length;
            data.addColumn('number', gettextCatalog.getString('Tx Failed'));
          } else if (scope.type === 'txretries') {
            len = json.txretries.length;
            data.addColumn('number', gettextCatalog.getString('Tx Retries'));
          }

          for(var i = 0; i < len; i++) {

            if (scope.type === 'device_tx' || scope.type === 'tx' || scope.type === 'usage') {

              var outbound = 0;
              var inbound = json.inbound[i].value;
              time = new Date(json.inbound[i].time / (1000*1000));

              if (json.outbound && json.outbound[i] && json.outbound[i].value) {
                outbound = json.outbound[i].value;
              }

              data.addRow([time, null, inbound / (1000*1000), outbound / (1000*1000) ]);

            } else if (scope.type === 'txfailed') {

              time = new Date(json.txfailed[i].time / (1000*1000));
              var val = 0;
              if (json.txfailed && json.txfailed[i] && json.txfailed[i].value) {
                val = json.txfailed[i].value;
              }
              data.addRow([time, null, val]);

            } else if (scope.type === 'txretries') {

              time = new Date(json.txretries[i].time / (1000*1000));
              data.addRow([time, null, json.txretries[i].value]);

            }
          }

          var date_formatter = new window.google.visualization.DateFormat({
            pattern: gettextCatalog.getString('MMM dd, yyyy hh:mm:ss a')
          });
          date_formatter.format(data,0);

          var formatter = new window.google.visualization.NumberFormat(
            {suffix: suffix}
          );
          formatter.format(data,2);
          if (scope.type === 'tx' || scope.type === 'usage' || scope.type === 'device_tx') {
            formatter.format(data,3);
          }

          opts.legend = { position: 'none' };
          opts.series = {
            0: {
              targetAxisIndex: 0, visibleInLegend: false, pointSize: 0, lineWidth: 0
            },
            1: {
              targetAxisIndex: 1
            },
            2: {
              targetAxisIndex: 1
            }
          };
          opts.vAxis = {
          };
          opts.hAxis = {
            gridlines: {
              count: -1,
              units: {
                days: {format: [gettextCatalog.getString('MMM dd')]},
                hours: {format: [gettextCatalog.getString('hh:mm a')]},
                minutes: {format: [gettextCatalog.getString('hh:mm a')]}
              }
            }
          };

          opts.explorer = {
            maxZoomOut:2,
            keepInBounds: true,
            axis: 'horizontal',
            actions: [ 'dragToZoom', 'rightClickToReset'],
          };
          if (scope.fs) {
            opts.height = 600;
          } else {
            opts.height = 250;
          }
          c = new window.google.visualization.LineChart(document.getElementById('tx-chart'));
          scope.noData = undefined;
          scope.loading = undefined;
          c.draw(data, opts);
        }
        window.google.charts.setOnLoadCallback(makeDataTable);
      } else {
        clearChart();
      }
    }
  };

  return {
    link: link,
    scope: {
      type: '@'
    },
    require: '^clientChart',
    templateUrl: 'components/charts/clients/_client_tx_chart.html',
  };

}]);

app.directive('usageChart', ['$timeout', 'Report', '$routeParams', 'COLOURS', function($timeout, Report, $routeParams, COLOURS) {

  var link = function(scope,element,attrs,controller) {

    var c, timer;
    scope.type = 'data';
    scope.loading = true;
    var colours = COLOURS.split(' ');
    var data = { usage: { inbound: 1 } };

    controller.$scope.$on('loadClientChart', function (evt,type){
      chart();
    });

    scope.refresh = function() {
      chart();
    };

    function chart() {
      var params = {
        type:     scope.type,
        resource: scope.resource
      };
      controller.getStats(params).then(function(resp) {
        data = resp;
        if (data.usage.inbound === 0 && data.usage.outbound === 0) {
          data.usage.inbound = 1;
        }
        renderChart();
      }, function() {
        clearChart();
      });
    }

    var renderChart = function() {
      window.google.charts.setOnLoadCallback(drawChart(data.usage));
    };

    var clearChart = function() {
      if (c) {
        c.clearChart();
      }
      scope.noData = true;
      scope.loading = undefined;
    };

    function drawChart(json) {
      $timeout.cancel(timer);
      var makeDataTable = function() {
        var data = new window.google.visualization.DataTable();
        data.addColumn('string', 'Inbound');
        data.addColumn('number', 'Outbound');
        data.addRows([
          ['Outbound', json.outbound / (1000*1000) || 0],
          ['Inbound', json.inbound / (1000*1000) || 0]
        ]);

        var formatter = new window.google.visualization.NumberFormat(
          {suffix: 'MiB', pattern: '0.00'}
        );

        var opts = controller.options;
        opts.height = 255;
        opts.explorer = undefined;
        opts.pieHole = 0.6;
        opts.legend = { position: 'right' };
        opts.height = '255';

        formatter.format(data,1);
        c = new window.google.visualization.PieChart(document.getElementById('usage-chart'));
        c.draw(data, opts);
      }
      window.google.charts.setOnLoadCallback(makeDataTable);

      scope.noData = undefined;
      scope.loading = undefined;
    }

  };

  return {
    link: link,
    scope: {
      mac: '@',
      loc: '@'
    },
    require: '^clientChart',
    templateUrl: 'components/charts/clients/_client_usage_chart.html',
  };

}]);

app.directive('loadChart', ['Report', '$routeParams', '$timeout', 'gettextCatalog', function(Report, $routeParams, $timeout, gettextCatalog) {

  var link = function(scope,element,attrs,controller) {

    var c, timer;
    scope.loading = true;
    scope.type  = 'device_load';

    controller.$scope.$on('loadClientChart', function (evt, type){
      chart();
    });

    scope.refresh = function() {
      chart();
    };

    scope.fullScreen = function(type) {
      var t = { panel: type };
      if (!scope.fs) {
        scope.fs = true;
        controller.$scope.$broadcast('fullScreen', t);
      } else {
        scope.fs = undefined;
        controller.$scope.$broadcast('closeFullScreen', t);
      }
    };

    function chart() {
      var params = {
        type:     scope.type,
        resource: scope.resource
      };
      controller.getStats(params).then(function(data) {
        if (data.timeline.load) {
          window.google.charts.setOnLoadCallback(drawChart(data.timeline));
        } else {
          clearChart();
        }
      }, function() {
        scope.noData = true;
        scope.loading = undefined;
        clearChart();
      });
    }

    var clearChart = function() {
      if (c) {
        c.clearChart();
      }
      scope.loading = undefined;
      scope.noData = true;
    };

    function drawChart(json) {

      $timeout.cancel(timer);

      var data = new window.google.visualization.DataTable();
      data.addColumn('datetime', 'Date');
      data.addColumn('number', 'dummySeries');
      data.addColumn('number', gettextCatalog.getString('Load Average'));
      var len = json.load.length;
      for(var i = 0; i < len; i++) {
        var load = json.load[i].value;
        if (!load) {
          load = 0;
        }
        var time = new Date(json.load[i].time / (1000*1000));
        data.addRow([time, null, load*100]);
      }

      var date_formatter = new window.google.visualization.DateFormat({
        pattern: gettextCatalog.getString('MMM dd, yyyy hh:mm:ss a')
      });
      date_formatter.format(data,0);

      var formatter = new window.google.visualization.NumberFormat(
        { pattern: '0', suffix: '%' }
      );
      formatter.format(data,2);

      var opts = controller.options;
      opts.legend = { position: 'none' };
      opts.series = {
        0: {
          targetAxisIndex: 0, visibleInLegend: false, pointSize: 0, lineWidth: 0
        },
        1: {
          targetAxisIndex: 1
        },
        2: {
          targetAxisIndex: 1
        }
      };
      opts.vAxis = {
      };
      opts.hAxis = {
        gridlines: {
          count: -1,
          units: {
            days: {format: [gettextCatalog.getString('MMM dd')]},
            hours: {format: [gettextCatalog.getString('hh:mm a')]},
            minutes: {format: [gettextCatalog.getString('hh:mm a')]}
          }
        }
      };

      opts.explorer = {
        maxZoomOut:2,
        keepInBounds: true,
        axis: 'horizontal',
        actions: [ 'dragToZoom', 'rightClickToReset'],
      };
      if (scope.fs) {
        opts.height = 600;
      } else {
        opts.height = 250;
      }
      c = new window.google.visualization.LineChart(document.getElementById('load-chart'));
      c.draw(data, opts);
      scope.noData = undefined;
      scope.loading = undefined;
    }

    // The resize event triggers the graphs to load
    // Not ideal, but good for responsive layouts atm
    $(window).trigger('resize');

  };

  return {
    link: link,
    // restrict: 'EA',
    scope: {
      mac: '@',
      loc: '@'
    },
    require: '^clientChart',
    templateUrl: 'components/charts/devices/_load_chart.html',
  };

}]);

app.directive('mcsChart', ['Report', '$routeParams', '$timeout', 'gettextCatalog', function(Report, $routeParams, $timeout, gettextCatalog) {

  var link = function(scope,element,attrs,controller) {

    var c, timer;
    scope.loading = true;
    scope.type  = 'mcs';

    controller.$scope.$on('loadClientChart', function  (){
      chart();
    });

    scope.refresh = function() {
      chart();
    };

    scope.fullScreen = function(type) {
      var t = { panel: type };
      if (!scope.fs) {
        scope.fs = true;
        controller.$scope.$broadcast('fullScreen', t);
      } else {
        scope.fs = undefined;
        controller.$scope.$broadcast('closeFullScreen', t);
      }
    };

    function chart() {
      var params = {
        type: scope.type,
        resource: scope.resource,
        fn: scope.fn
      };
      controller.getStats(params).then(function(data) {
        if (data.timeline.mcs) {
          window.google.charts.setOnLoadCallback(drawChart(data.timeline));
        } else {
          clearChart();
        }
      });
    }

    var clearChart = function() {
      if (c) {
        c.clearChart();
      }
      scope.loading = undefined;
      scope.noData = true;
    };

    function drawChart(json) {

      $timeout.cancel(timer);
      var makeDataTable = function() {
        var data = new window.google.visualization.DataTable();
        data.addColumn('datetime', 'Date');
        data.addColumn('number', 'dummySeries');
        data.addColumn('number', gettextCatalog.getString('MCS Index'));
        var len = json.mcs.length;
        for(var i = 0; i < len; i++) {
          var mcs = json.mcs[i].value;
          if (!mcs) {
            mcs = 0;
          }
          var time = new Date(json.mcs[i].time / (1000*1000));
          data.addRow([time, null, mcs]);
        }

        var date_formatter = new window.google.visualization.DateFormat({
          pattern: gettextCatalog.getString('MMM dd, yyyy hh:mm:ss a')
        });
        date_formatter.format(data,0);

        var formatter = new window.google.visualization.NumberFormat(
          { pattern: '0' }
        );
        formatter.format(data,1);

        var opts = controller.options;
        opts.legend = { position: 'none' };
        opts.series = {
          0: {
            targetAxisIndex: 0, visibleInLegend: false, pointSize: 0, lineWidth: 0
          },
          1: {
            targetAxisIndex: 1
          },
          2: {
            targetAxisIndex: 1
          }
        };
        opts.hAxis = {
          gridlines: {
            count: -1,
            units: {
              days: {format: [gettextCatalog.getString('MMM dd')]},
              hours: {format: [gettextCatalog.getString('hh:mm a')]},
              minutes: {format: [gettextCatalog.getString('hh:mm a')]}
            }
          }
        };
        opts.vAxes = {
          0: {
            textPosition: 'none'
          },
          1: {},
        };

        opts.explorer = {
          maxZoomOut:2,
          keepInBounds: true,
          axis: 'horizontal',
          actions: [ 'dragToZoom', 'rightClickToReset'],
        };
        if (scope.fs) {
          opts.height = 600;
        } else {
          opts.height = 250;
        }
        c = new window.google.visualization.LineChart(document.getElementById('mcs-chart'));
        c.draw(data, opts);
      }
      window.google.charts.setOnLoadCallback(makeDataTable);
      scope.noData = undefined;
      scope.loading = undefined;
    }

  };

  return {
    link: link,
    // restrict: 'EA',
    scope: {
      mac: '@',
      loc: '@'
    },
    require: '^clientChart',
    templateUrl: 'components/charts/clients/_mcs_chart.html',
  };

}]);

app.directive('snrChart', ['$timeout', 'Report', '$routeParams', 'gettextCatalog', function($timeout, Report, $routeParams, gettextCatalog) {

  var link = function(scope,element,attrs,controller) {

    var c, timer;
    scope.type  = 'signal';

    controller.$scope.$on('loadClientChart', function  (){
      chart();
    });

    scope.refresh = function() {
      chart();
    };

    scope.fullScreen = function(type) {
      var t = { panel: type };
      if (!scope.fs) {
        scope.fs = true;
        controller.$scope.$broadcast('fullScreen', t);
      } else {
        scope.fs = undefined;
        controller.$scope.$broadcast('closeFullScreen', t);
      }
    };

    function chart() {
      var params = {
        type: scope.type,
        resource: scope.resource,
        fn: scope.fn
      };
      controller.getStats(params).then(function(data) {
        if (data.timeline.signal) {
          window.google.charts.setOnLoadCallback(drawChart(data.timeline));
        } else {
          clearChart();
        }
      }, function() {
        clearChart();
      });
    }

    var clearChart = function() {
      if (c) {
        c.clearChart();
      }
      scope.loading = undefined;
      scope.noData = true;
    };

    function drawChart(json) {

      $timeout.cancel(timer);
      var makeDataTable = function() {
        var data = new window.google.visualization.DataTable();
        data.addColumn('datetime', 'Date');
        data.addColumn('number', 'dummySeries');
        data.addColumn('number', 'SNR');
        data.addColumn('number', gettextCatalog.getString('Signal'));
        data.addColumn('number', gettextCatalog.getString('Noise'));

        var len = json.signal.length;

        for(var i = 0; i < len; i++) {
          var time = new Date(json.signal[i].time / (1000*1000));
          var snr = 0, noise = 0, signal = 0;
          if (json.signal && json.signal[i] && json.signal[i].value) {
            signal = json.signal[i].value;
          }
          if (json.snr && json.snr[i] && json.snr[i].value) {
            snr = json.snr[i].value;
          }
          if (json.noise && json.noise[i] && json.noise[i].value) {
            noise = json.noise[i].value;
          }
          data.addRow([time, null, snr, signal, noise ]);
        }

        var date_formatter = new window.google.visualization.DateFormat({
          pattern: gettextCatalog.getString('MMM dd, yyyy hh:mm:ss a')
        });
        date_formatter.format(data,0);

        var formatter = new window.google.visualization.NumberFormat(
          {suffix: 'dB', negativeColor: 'red', negativeParens: true, pattern: '0'}
        );
        formatter.format(data,1);
        formatter = new window.google.visualization.NumberFormat(
          {suffix: 'dBm', negativeColor: 'red', negativeParens: true, pattern: '0'}
        );
        formatter.format(data,2);
        formatter.format(data,3);
        formatter.format(data,4);
        
        var opts = controller.options;
        opts.legend = { position: 'none' };
        opts.series = {
          0: {
            targetAxisIndex: 0, visibleInLegend: false, pointSize: 0, lineWidth: 0
          },
          1: {
            targetAxisIndex: 1
          },
          2: {
            targetAxisIndex: 1
          }
        };
        opts.vAxes = {
          0: {
            textPosition: 'none'
          },
          1: {},
        };

        opts.explorer = {
          maxZoomOut:2,
          keepInBounds: true,
          axis: 'horizontal',
          actions: [ 'dragToZoom', 'rightClickToReset'],
        };
        if (scope.fs) {
          opts.height = 600;
        } else {
          opts.height = 250;
        }

        c = new window.google.visualization.LineChart(document.getElementById('snr-chart'));
        c.draw(data, opts);
      }
      window.google.charts.setOnLoadCallback(makeDataTable);
      scope.noData = undefined;
      scope.loading = undefined;
    }

  };

  return {
    link: link,
    scope: {
      mac: '@',
      loc: '@'
    },
    require: '^clientChart',
    templateUrl: 'components/charts/clients/_signal_chart.html',
  };

}]);

app.directive('interfaceChart', ['Report', '$routeParams', '$timeout', 'gettextCatalog', function(Report, $routeParams, $timeout, gettextCatalog) {

  var link = function(scope,element,attrs,controller) {

    var c, timer;
    scope.loading = true;
    scope.type  = 'snr';
    scope.resource = 'device';

    controller.$scope.$on('loadClientChart', function (evt,type){
      chart();
    });

    scope.refresh = function() {
      chart();
    };

    scope.fullScreen = function(type) {
      var t = { panel: type };
      if (!scope.fs) {
        scope.fs = true;
        controller.$scope.$broadcast('fullScreen', t);
      } else {
        scope.fs = undefined;
        controller.$scope.$broadcast('closeFullScreen', t);
      }
    };

    scope.changeType = function(t) {
      scope.type = t;
      chart(scope.type);
    };

    scope.refresh = function() {
      chart();
    };

    function chart() {
      var params = {
        type: scope.type,
        resource: scope.resource,
        fn: scope.fn
      };
      controller.getStats(params).then(function(data) {
        if (data.timeline) {
          window.google.charts.setOnLoadCallback(drawChart(data.timeline));
        } else {
          scope.loading = undefined;
          scope.noData = true;
          clearChart();
        }
      }, function() {
        clearChart();
      });
    }

    var clearChart = function() {
      if (c) {
        c.clearChart();
      }
      scope.loading = undefined;
      scope.noData = true;
    };

    function transpose(array) {
      return array[0].map(function (_, c) {
        return array.map(function (r) {
          return typeof r[c] == 'undefined' ? {value: null} : r[c];
        });
      });
    }

    function drawChart(json) {

      $timeout.cancel(timer);
      var data = new window.google.visualization.DataTable();

      data.addColumn('datetime', 'Date');
      data.addColumn('number', 'dummySeries');
      var opts = controller.options;
      opts.series = {
        0: {
          targetAxisIndex: 0, visibleInLegend: false, pointSize: 0, lineWidth: 0
        },
        1: {
          targetAxisIndex: 1
        }
      };

      // Create temp store for interfaces and add columns //
      var ifaces = [];
      var ifaceData = [];
      for (var k in json) {
        if (typeof json[k] !== 'function') {
          ifaces.push(k);
          ifaceData.push(json[k].values);
          data.addColumn('number', k);
        }
      }

      for (var i = 2; i < ifaces.length + 2; i++) {
        opts.series[i] = { targetAxisIndex: 1 }
      }

      var allRows = transpose(ifaceData);

      var first = json[ifaces[0]];

      if (first && first.values && first.values.length) {
        var len = first.values.length;

        for(var i = 0; i < len; i++) {

          var time = (first.values[i].time);
          var t = new Date(time / (1000*1000));

          var rowEntry = allRows[i].map(function(e) { return e.value })
          rowEntry.unshift(t, null);

          data.addRow(rowEntry);
        }

        var suffix;

        // vAxis set to only have values on negative graphs
        if (scope.type === 'snr' ) {
          suffix = 'dB';
          opts.vAxis = {
          }
        } else if (scope.type === 'noise' || scope.type === 'signal') {
          suffix = 'dBm';
          opts.vAxis = {
            minValue: -100,
            maxValue: 0
          }
        } else if (scope.type === 'quality') {
          suffix = '%';
          opts.vAxis = {
          }
        }

        var date_formatter = new window.google.visualization.DateFormat({
          pattern: gettextCatalog.getString('MMM dd, yyyy hh:mm:ss a')
        });
        date_formatter.format(data,0);

        var formatter = new window.google.visualization.NumberFormat(
          {suffix: suffix, pattern: '0'}
        );

        for (i = 0; i < data.getNumberOfColumns(); i++){
          formatter.format(data,i);
        }

        opts.legend = { position: 'bottom' };

        opts.hAxis = {
          gridlines: {
            count: -1,
            units: {
              days: {format: [gettextCatalog.getString('MMM dd')]},
              hours: {format: [gettextCatalog.getString('hh:mm a')]},
              minutes: {format: [gettextCatalog.getString('hh:mm a')]}
            }
          }
        };

        opts.explorer = {
          maxZoomOut:2,
          keepInBounds: true,
          axis: 'horizontal',
          actions: [ 'dragToZoom', 'rightClickToReset'],
        };
        if (scope.fs) {
          opts.height = 600;
        } else {
          opts.height = 250;
        }
        c = new window.google.visualization.LineChart(document.getElementById('snr-chart'));
        c.draw(data, opts);
        scope.noData = undefined;
        scope.loading = undefined;
      } else {
        scope.noData = true;
        scope.loading = undefined;
      }
    }

  };

  return {
    link: link,
    // restrict: 'EA',
    scope: {
      mac: '@',
      loc: '@'
    },
    require: '^clientChart',
    templateUrl: 'components/charts/devices/_snr_chart.html',
  };

}]);

app.directive('locationChart', ['Report', '$routeParams', '$timeout', '$location', 'gettextCatalog', function(Report, $routeParams, $timeout, $location, gettextCatalog) {

  var link = function(scope,element,attrs,controller) {

    scope.type = $routeParams.type || 'clients';
    var c, timer, data, json;
    var opts = controller.options;

    var resource = 'location';
    scope.loading = true;

    $(window).resize(function() {
      if (this.resizeTO) {
        clearTimeout(this.resizeTO);
      }
      this.resizeTO = setTimeout(function() {
        $(this).trigger('resizeEnd');
      }, 250);
    });

    $(window).on('resizeEnd', function() {
      init();
    });

    function setTitle() {
      if (scope.type === 'usage') {
        scope.title = gettextCatalog.getString('Usage Data');
      } else if (scope.type === 'clients') {
        scope.title = gettextCatalog.getString('Wireless Clients');
      } else if (scope.type === 'impressions') {
        scope.title = gettextCatalog.getString('Splash Impressions');
      } else if (scope.type === 'uniques') {
        scope.title = gettextCatalog.getString('Splash Users');
      } else {
        scope.title = gettextCatalog.getString('Splash Sessions');
      }
    }

    var init = function() {
      setTitle();
      setIntervals();
      chart();
    };

    var minDate = new Date();
    minDate.setDate(minDate.getDate() - 7);
    minDate.setHours(0,0,0,0);
    var minDateEpoch = Date.parse(minDate) / 1000;
    var maxDate = new Date();
    maxDate.setHours(0,0,0,0);
    var maxDateEpoch = Date.parse(maxDate) / 1000;

    var searchParams = function() {
      var hash = {};
      hash.type = scope.type;
      $location.search(hash);
    };

    scope.changeType = function(t) {
      clearChart();
      scope.type = t;
      searchParams();
      init();
    };

    // Cos we have period mixes in with start dates //
    var setIntervals = function() {
      if (scope.type === 'usage') {
        scope.interval = '1d';
        scope.period = '7d';
      } else {
        scope.interval = 'day';
        scope.period = undefined;
      }
    };

    scope.refresh = function() {
      chart();
    };

    function chart() {

      var params = {
        type: scope.type,
        resource: resource,
        period: scope.period,
        fn: scope.fn,
        interval: scope.interval,
        fill: '0'
      };
      controller.getStats(params).then(function(data) {
        if (data && data.timeline && data.timeline.stats) {
          json = data;
          window.google.charts.setOnLoadCallback(drawChart);
        } else {
          clearChart();
        }
      }, function() {
        clearChart();
        console.log('No data returned for query');
      });
    }

    var clearChart = function() {
      if (c) {
        c.clearChart();
      }
      scope.noData = true;
      scope.loading = false;
    };

    function drawChart() {

      $timeout.cancel(timer);
      data = new window.google.visualization.DataTable();
      if (scope.type === 'usage') {
        usageChart();
      } else if (scope.type === 'clients') {
        clientsChart();
      } else if (scope.type === 'impressions') {
        sessionsChart();
      } else if (scope.type === 'uniques') {
        sessionsChart();
      } else {
        sessionsChart();
      }

      opts.legend = { position: 'none' };

      opts.series = {
        0: {
          targetAxisIndex: 0, visibleInLegend: false, pointSize: 0, lineWidth: 0
        },
        1: {
          targetAxisIndex: 1
        },
        2: {
          targetAxisIndex: 1
        }
      };
      opts.hAxis = {
        format:  gettextCatalog.getString('MMM dd, yyyy'),
        viewWindow: {
          min: minDate,
          max: maxDate
        },
      };
      opts.vAxis = {
        format: '0',
        minValue: 4
      };
      opts.vAxes = {
        0: {
          textPosition: 'none'
        },
        1: {
          // Leads to weird results but can help the min value
          // also, need to figure out how to not display decimals
          // format: '#,###',
          // viewWindowMode:'explicit',
          // viewWindow: {
          //   min: 0,
          //   max: 'auto'
          // }
        },
      };

      opts.explorer = {
        maxZoomOut:2,
        keepInBounds: true,
        axis: 'horizontal',
        actions: [ 'dragToZoom', 'rightClickToReset'],
      };
      if (scope.fs) {
        opts.height = 600;
      } else {
        opts.height = 250;
      }
      c = new window.google.visualization.LineChart(document.getElementById('location-chart'));
      c.draw(data, opts);
      scope.noData = undefined;
      scope.loading = undefined;
    }

    timer = $timeout(function() {
      init();
    }, 250);

    var clientsChart = function() {

      var time;
      var stats = json.timeline.stats;
      var start = new Date(json._stats.start * 1000);

      if (stats && stats.length) {

        data.addColumn('datetime', 'Date');
        data.addColumn('number', 'dummySeries');
        data.addColumn('number', gettextCatalog.getString('Clients'));

        for(var i = 0; i < stats.length; i++) {
          time = new Date(stats[i].time * (1000));
          data.addRow([time, null, stats[i].count]);
        }

        // Google charts, you are annoying. Why can't we just have a single-point chart ? //
        // I thought you fixed the issue but you seem to make the reset worse //
        // if (stats.length <= 1) {
        //   time = new Date();
        //   data.addRow([time, null, 0]);
        //   // time.setDate(time.getDate() + 1);
        //   // data.addRow([time, null, 0]);
        // }
      }

      var date_formatter = new window.google.visualization.DateFormat({
        pattern: gettextCatalog.getString('MMM dd, yyyy')
      });
      date_formatter.format(data,0);

      var formatter = new window.google.visualization.NumberFormat(
        { pattern: '#,##0'}
      );
      formatter.format(data,2);
      opts.interpolateNulls = true;

    };

    var usageChart = function() {
      json = json.timeline;
      if (json.inbound && json.inbound.length) {
        var len = json.inbound.length;

        data.addColumn('date', 'Date');
        data.addColumn('number', 'dummySeries');
        data.addColumn('number', gettextCatalog.getString('Inbound'));
        data.addColumn('number', gettextCatalog.getString('Outbound'));

        for(var i = 0; i < len; i++) {

          var outbound = 0;
          var inbound = json.inbound[i].value;
          var time = new Date(json.inbound[i].time / (1000*1000));

          if (json.outbound && json.outbound[i] && json.outbound[i].value) {
            outbound = json.outbound[i].value;
          }
          data.addRow([time, null, inbound / (1000*1000), outbound / (1000*1000) ]);
        }

      }

      var date_formatter = new window.google.visualization.DateFormat({
        pattern: gettextCatalog.getString('MMM dd, yyyy hh:mm:ss a')
      });

      date_formatter.format(data,0);

      var formatter = new window.google.visualization.NumberFormat(
        { suffix: 'MiB', pattern: '#,##0'}
      );
      formatter.format(data,2);
      formatter.format(data,3);

      opts.vAxis = {};
    };

    var sessionsChart = function() {

      var start = new Date(json._stats.start * 1000);

      if (scope.type === 'impressions') {
        scope.title = gettextCatalog.getString('Splash Impressions');
      } else if (scope.type === 'uniques') {
        scope.title = gettextCatalog.getString('Splash Users');
      } else {
        scope.title = gettextCatalog.getString('Splash Sessions');
      }

      var sessions = json.timeline.stats;

      data.addColumn('date', 'Date');
      data.addColumn('number', 'dummySeries');
      data.addColumn('number', scope.title);

      for(var i = 0; i < sessions.length; i++) {
        var time = new Date(sessions[i].time * (1000));
        data.addRow([time, null, sessions[i].count]);
      }

      var date_formatter = new window.google.visualization.DateFormat({
        pattern: gettextCatalog.getString('MMM dd, yyyy hh:mm:ss a')
      });
      date_formatter.format(data,0);

      var formatter = new window.google.visualization.NumberFormat(
        { pattern: '0' }
      );
      formatter.format(data,1);

      opts.vAxis = {
        viewWindowMode:'explicit',
        viewWindow:{
          min: 0
        }
      };
    };

  };

  return {
    link: link,
    scope: {
      mac: '@',
      loc: '@'
    },
    require: '^clientChart',
    templateUrl: 'components/charts/devices/_wireless_chart.html',
  };

}]);
