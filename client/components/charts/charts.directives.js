'use strict';

var app = angular.module('myApp.charts.directives', []);

app.directive('clientsChart', ['$timeout', '$rootScope', 'gettextCatalog', '$filter', function($timeout, $rootScope, gettextCatalog, $filter) {

  var link = function(scope,element,attrs,controller) {

    var chart, d, json, len, formatter, i, time, title, data, timer, options;

    function toTitleCase(str) {
      if (str.key !== undefined) {
        return str.key.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
      }
    }

    controller.$scope.$on('clientIndexChart', function(val,obj) {
      init(obj);
    });

    // $(window).resize(function() {
    //   if (this.resizeTO) {
    //     clearTimeout(this.resizeTO);
    //   }
    //   this.resizeTO = setTimeout(function() {
    //     $(this).trigger('resizeEnd');
    //   }, 250);
    // });

    $(window).on('resizeEnd', function() {
      drawChart();
    });

    function init(obj) {
      scope.fn = {key: $filter('translatableChartTitle')(obj.fn), value: obj.fn};
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

      var drawChartCallback = function() {
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
            gridlines: {
              count: -1,
              units: {
                days: {format: [gettextCatalog.getString('MMM dd, yyyy')]},
                hours: {format: [gettextCatalog.getString('hh:mm a')]},
                minutes: {format: [gettextCatalog.getString('hh:mm a')]}
              }
            },
            minorGridlines: {
              count: -1,
              units: {
                days: {format: [gettextCatalog.getString('MMM dd')]},
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

          if (!scope.noData) {
            chart = new window.google.visualization.LineChart(document.getElementById('clients-chart'));
            chart.draw(data, options);
          }
        }
      };

      if (window.google && window.google.visualization) {
        window.google.charts.setOnLoadCallback(drawChartCallback);
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
      var suffix =  gettextCatalog.getString('Kbps');
      var type = 'Traffic';
      if (scope.type === 'usage') {
        type = 'Usage';
        type = gettextCatalog.getString('Usage');
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

app.directive('clientChart', ['Report', 'Metric', '$routeParams', '$q', 'ClientDetails', 'COLOURS', function(Report, Metric, $routeParams, $q, ClientDetails, COLOURS) {

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
        $scope.$broadcast('resizeClientChart');
      });

      this.$scope = $scope;

      this.options = {
        lineWidth: 1.5,
        height: 250,
        focusTarget: 'category',
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

      var distance;
      this.setInterval = function() {
        switch(this.period) {
          case '5m':
            this.interval = '10s';
            distance = 10;
            break;
          case '30m':
            this.interval = '1m';
            distance = 60*30;
            break;
          case '60m':
            this.interval = '1m';
            distance = 60*60;
            break;
          case '1d':
            this.interval = '30m';
            distance = 60*60*24;
            break;
          case '6h':
            this.interval = '180s';
            distance = 60*60*6;
            break;
          case '7d':
            this.interval = '1h';
            distance = 60*60*24*7;
            break;
          case '14d':
            this.interval = '1h';
            distance = 60*60*24*14;
            break;
          case '30d':
            this.interval = '1h';
            distance = 60*60*24*30;
            break;
          case '1yr':
            this.interval = '1yr';
            distance = 60*60*24*365;
            break;
          default:
            this.interval = '1h';
            distance = 60*60*24*7;
            break;
        }
      };

      var minDateEpoch, maxDateEpoch, minDate, maxDate;

      this.setStartEnd = function() {
        if (distance >= 60*60*24) {
          minDate = moment().utc().subtract(distance, 'seconds').startOf('day').toDate();
          maxDate = moment().utc().endOf('day').toDate();
        } else {
          minDate = moment().utc().subtract(distance, 'seconds').toDate();
          maxDate = moment().utc().toDate();
        }

        minDateEpoch = Math.floor(minDate.getTime() / 1000);
        maxDateEpoch = Math.floor(maxDate.getTime() / 1000);
      };

      // this.v1 = function(params, deferred) {
      //   Report.clientstats({
      //     type:         params.type,
      //     fill:         params.fill || $routeParams.fill,
      //     fn:           params.fn || $routeParams.fn,
      //     ap_mac:       $scope.client.ap_mac,
      //     client_mac:   $scope.client.client_mac,
      //     location_id:  $routeParams.id,
      //     resource:     params.resource,
      //     interval:     params.interval || this.interval,
      //     period:       this.period,
      //     start:        params.start,
      //     end:          params.end,
      //   }).$promise.then(function(data) {
      //     if (data.usage || data.timeline) {
      //       deferred.resolve(data);
      //     } else {
      //       deferred.reject();
      //     }
      //   }, function() {
      //     deferred.reject();
      //   });
      // };

      this.v2 = function(params, deferred) {
        var endOfDay = Math.floor(moment().utc().endOf('day').toDate().getTime() / 1000);
        Metric.clientstats({
          type:         params.metric_type || params.type,
          ap_mac:       $scope.client.ap_mac || params.ap_mac,
          client_mac:   $scope.client.client_mac,
          location_id:  $scope.client.location_id,
          interface:    params.interface,
          start_time:   minDateEpoch,
          end_time:     maxDateEpoch,
          rate:         params.rate,
        }).$promise.then(function(data) {
          deferred.resolve(data);
        }, function() {
          deferred.reject();
        });
      };

      this.getStats = function(params) {
        var deferred = $q.defer();
        if (params.resource === 'location' ) {
          this.period = params.period || $routeParams.period;
        } else {
          this.period = params.period || $routeParams.period || '6h';
        }
        this.setInterval();
        this.setStartEnd();

        $scope.client = ClientDetails.client;
        this.v2(params, deferred);
        return deferred.promise;
      };
    }
  };

}]);

app.directive('txChart', ['$timeout', 'Report', '$routeParams', 'gettextCatalog', '$filter', 'COLOURS', 'ClientDetails', function($timeout, Report, $routeParams, gettextCatalog, $filter, COLOURS, ClientDetails) {

  var link = function(scope,element,attrs,controller) {

    // ClientDetails.client.version = '4';

    var a, data;
    var c, timer, json;
    var opts = controller.options;
    var rate = $routeParams.rate;
    if (rate === undefined && rate !== 'true' && rate !== 'false') {
      rate = 'true';
    }
    var colours = COLOURS.split(' ');


    // Update when testing clients //
    scope.type     = 'devices.rx,devices.tx';

    scope.loading  = true;
    scope.fn       = {key: gettextCatalog.getString('mean'), value:'mean'};
    scope.resource = 'client';
    scope.noData   = undefined;

    controller.$scope.$on('resizeClientChart', function (evt,type){
      // if (type && type === 'device') {
      //   scope.resource = 'device';
      // }
      if (a) {
        drawChart();
      }
    });

    controller.$scope.$on('loadClientChart', function (evt, type){
      a = undefined;
      chart();
    });

    scope.changeFn = function(type) {
      controller.fn = type;
      scope.fn = {key: $filter('translatableChartTitle')(type), value: type};
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
        rate: rate,
        fn: scope.fn.value
      };
      controller.getStats(params).then(function(data) {
        json = data;
        drawChart();
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

    function drawChart() {

      var len, time, suffix;

      // var drawChartCallback = function() {

      if (json.multi === true) {
      }

      suffix = gettextCatalog.getString('Kbps');
      //scope.title = gettextCatalog.getString('Device Traffic ('+suffix+')');
       scope.title = gettextCatalog.getString('Device Traffic (Kbps)');

      if (a === undefined) {
        data = new window.google.visualization.DataTable();
        data.addColumn('datetime', gettextCatalog.getString('Date'));
        data.addColumn('number', 'dummySeries');
        data.addColumn('number', gettextCatalog.getString('Inbound'));
        if (json.multi) {
          data.addColumn('number', gettextCatalog.getString('Outbound'));
        }

        if (json.multi === true) {
          var s1 = json.data[0].data;
          var s2 = json.data[1].data;

          for(var i = 0; i < json.data[0].data.length; i++) {
            time = new Date(s1[i].timestamp*1000);
            var inbound = (s1[i].value / (1000)) * 8;
            var outbound = (s2[i].value / (1000)) * 8;
            data.addRow([time, null, inbound, outbound]);
          }
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
      formatter.format(data,3);

      opts.colors = colours;
      opts.legend = { position: 'bottom' };
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
        1: {
          viewWindow:{
            min: 0
          }
        }
      };
      opts.vAxis = {
      };
      // opts.chartArea = {
      //   'width': '90%',
      //   'height': '70%',
      //   'top': 10,
      //   'left': 0,
      //   'bottom': 20,
      //   'height': '100%'
      // };
      opts.hAxis = {
        gridlines: {
          count: -1,
          units: {
            days: {format: [gettextCatalog.getString('MMM dd')]},
            hours: {format: [gettextCatalog.getString('hh:mm a')]},
            minutes: {format: [gettextCatalog.getString('hh:mm a')]}
          }
        },
        minorGridlines: {
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

      a = true;
      c.draw(data, opts);
      // };
      // window.google.charts.setOnLoadCallback(drawChartCallback);
    }

    setTimeout(function() {
      window.google.charts.setOnLoadCallback(chart);
    }, 500);
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

// Depreciate in favour of dash usage chart
app.directive('usageChart', ['$timeout', 'Report', '$routeParams', 'COLOURS', 'gettextCatalog', function($timeout, Report, $routeParams, COLOURS, gettextCatalog) {

  var link = function(scope,element,attrs,controller) {

    var c, timer, json, a, data;
    scope.type = 'data';
    scope.loading = true;
    var colours = COLOURS.split(' ');

    // controller.$scope.$on('resizeClientChart', function (evt,type){
    //   drawChart();
    // });

    controller.$scope.$on('loadClientChart', function (evt, type){
      a = undefined;
      chart();
    });

    function chart() {
      var params = {
        type:         scope.type,
        metric_type:  'devices.usage',
        resource:     scope.resource
      };
      controller.getStats(params).then(function(resp) {
        json = resp;
        drawChart();
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

    function drawChart() {
      var opts = controller.options;
      opts.explorer = undefined;
      opts.pieHole = 0.8;
      opts.legend = { position: 'right' };
      opts.title = 'none';
      opts.pieSliceText = 'none';
      opts.height = '260';
      opts.colors = ['#16ac5b', '#225566'];

      if (!a) {

        a = true;
        var formatted = {};

        for (var i in json.stats) {
          var key = json.stats[i].key;
          if (key === 'outbound') {
            formatted.outbound = json.stats[i].value;
          } else if (key === 'inbound') {
            formatted.inbound = json.stats[i].value;
          }
        }

        if (formatted.inbound === 0 && formatted.outbound === 0) {
          formatted.inbound = 1;
        }

        // json = data.usage;
        data = new window.google.visualization.DataTable();
        data.addColumn('string', gettextCatalog.getString('Inbound'));
        data.addColumn('number', gettextCatalog.getString('Outbound'));
        data.addRows([
          [gettextCatalog.getString('Outbound'), formatted.outbound / (1000*1000) || 0],
          [gettextCatalog.getString('Inbound'), formatted.inbound / (1000*1000) || 0]
        ]);

        var formatter = new window.google.visualization.NumberFormat(
          {suffix: 'MiB', pattern: '0.00'}
        );

        formatter.format(data,1);
      }

      c = new window.google.visualization.PieChart(document.getElementById('usage-chart'));
      c.draw(data, opts);
      // };

      // window.google.charts.setOnLoadCallback(drawChartCallback);

      scope.noData = undefined;
      scope.loading = undefined;
    }
    window.google.charts.setOnLoadCallback(chart);
    // setTimeout(function() {
    //   chart();
    // }, 250);
  };

  return {
    link: link,
    scope: {
      mac: '@',
      loc: '@',
      version: '@'
    },
    require: '^clientChart',
    templateUrl: 'components/charts/clients/_client_usage_chart.html',
  };

}]);

app.directive('dashUsageChart', ['$timeout', 'Report', '$routeParams', 'COLOURS', 'gettextCatalog', 'ClientDetails', function($timeout, Report, $routeParams, COLOURS, gettextCatalog, ClientDetails) {

  var link = function(scope,element,attrs,controller) {

    scope.loading = true;
    var c, timer, data, json;
    ClientDetails.client.version = '4';
    var colours = ['#16ac5b', '#225566'];
    var formatted = { usage: { inbound: 1 } };

    // controller.$scope.$on('resizeClientChart', function (evt,type){
    //   drawChart();
    // });

    function chart() {
      var params = {
        type:         scope.type,
        metric_type:  'device.usage',
        resource:     scope.resource
      };
      controller.getStats(params).then(function(resp) {
        json = resp;
        drawChart();
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

    function drawChart() {

      var opts = controller.options;
      opts.explorer = undefined;
      opts.pieHole = 0.8;
      opts.legend = { position: 'bottom' };
      opts.title = 'none';
      opts.pieSliceText = 'none';
      opts.height = '350';
      opts.colors = colours;

      if (data === undefined) {
        for (var i in json.stats) {
          var key = json.stats[i].key;
          if (key === 'outbound') {
            formatted.usage.outbound = json.stats[i].value;
          } else if (key === 'inbound') {
            formatted.usage.inbound = json.stats[i].value;
          }
        }
        json = formatted.usage;

        if (json.inbound === 0 && json.outbound === 0) {
          json.inbound = 100;
        }

        data = new window.google.visualization.DataTable();
        data.addColumn('string', gettextCatalog.getString('Inbound'));
        data.addColumn('number', gettextCatalog.getString('Outbound'));
        data.addRows([
          [ gettextCatalog.getString('Outbound'), json.outbound / (1000*1000) || 0 ],
          [ gettextCatalog.getString('Inbound'), json.inbound / (1000*1000) || 0 ]
        ]);

        var formatter = new window.google.visualization.NumberFormat(
          {suffix: 'Mb', pattern: '#,###,###'}
        );

        formatter.format(data, 1);
      }

      c = new window.google.visualization.PieChart(document.getElementById('dash-usage-chart'));
      c.draw(data, opts);

      scope.noData = undefined;
      scope.loading = undefined;
    }

    timer = setTimeout(function() {
      window.google.charts.setOnLoadCallback(chart);
    }, 500);
    $timeout.cancel(timer);

  };

  return {
    link: link,
    scope: {
      mac: '@',
      loc: '@',
      version: '@'
    },
    require: '^clientChart',
    templateUrl: 'components/charts/locations/_usage_chart.html',
  };

}]);

app.directive('capsChart', ['$timeout', 'Report', '$routeParams', 'COLOURS', 'gettextCatalog', function($timeout, Report, $routeParams, COLOURS, gettextCatalog) {

  var link = function(scope,element,attrs,controller) {

    scope.loading = true;
    var c, timer, data, formatted;
    var colours = ['#16ac5b', '#225566'];

    // controller.$scope.$on('resizeClientChart', function (evt,type){
    //   drawChart();
    // });

    function chart() {
      var params = {
        type:         scope.type,
        metric_type:  'device.caps',
        resource:     scope.resource,
        period:       '7d' // can be removed soon when loyalty dynamic
      };
      controller.getStats(params).then(function(resp) {
        formatted = resp;
        drawChart(formatted.usage);
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

    function drawChart() {

      var opts = controller.options;
      opts.explorer = undefined;
      opts.pieHole = 0.8;
      opts.legend = { position: 'bottom' };
      opts.title = 'none';
      opts.pieSliceText = 'none';
      opts.height = '350';
      opts.colors = colours;

      if (data === undefined && formatted) {
        data = new window.google.visualization.DataTable();
        data.addColumn('string', gettextCatalog.getString('2.4Ghz'));
        data.addColumn('number', gettextCatalog.getString('5Ghz'));

        var two, five = 0;
        for (var i in formatted.stats) {
          if (formatted.stats[i].key === 'two') {
            two = formatted.stats[i].value;
          } else if (formatted.stats[i].key === 'five') {
            five = formatted.stats[i].value;
          }
        }

        if (two === 0 && five === 0) {
          two = 1;
        }

        data.addRow(['2.4Ghz', two]);
        data.addRow(['5Ghz', five]);
      }

      var formatter = new window.google.visualization.NumberFormat(
        {suffix: '%', pattern: ''}
      );

      formatter.format(data, 1);

      c = new window.google.visualization.PieChart(document.getElementById('caps-chart'));
      c.draw(data, opts);

      scope.noData = undefined;
      scope.loading = undefined;
    }

    window.google.charts.setOnLoadCallback(chart);

    timer = setTimeout(function() {
      window.google.charts.setOnLoadCallback(chart);
    }, 500);
    $timeout.cancel(timer);
  };

  return {
    link: link,
    scope: {
      mac: '@',
      loc: '@',
      version: '@'
    },
    require: '^clientChart',
    templateUrl: 'components/charts/locations/_caps_chart.html',
  };

}]);

app.directive('clientsConnChart', ['$timeout', 'Report', '$routeParams', 'COLOURS', 'gettextCatalog', function($timeout, Report, $routeParams, COLOURS, gettextCatalog) {

  var link = function(scope,element,attrs,controller) {

    scope.loading = true;
    var c, timer, data, formatted;
    // var colours = ['#16ac5b', '#225566', '#007788', '#0088AA', '#0088BB', '#BBCCCC'];
    var colours = ['#16ac5b', '#225566'];
    // controller.$scope.$on('resizeClientChart', function (evt,type){
    //   drawChart();
    // });

    function chart() {
      var params = {
        type:         scope.type,
        metric_type:  'client.loyalty',
        resource:     scope.resource
      };
      controller.getStats(params).then(function(resp) {
        formatted = resp;
        drawChart();
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

    function drawChart() {

      // var drawChartCallback = function() {

      var opts = controller.options;
      opts.explorer = undefined;
      opts.pieHole = 0.8;
      opts.legend = { position: 'bottom' };
      opts.title = 'none';
      opts.pieSliceText = 'none';
      opts.height = '350';
      opts.tooltipText = 'value';
      opts.colors = colours;

      if (data === undefined && formatted) {

        var newV = 0, retV = 0;
        data = new window.google.visualization.DataTable();
        data.addColumn('string', gettextCatalog.getString('2.4Ghz'));
        data.addColumn('number', gettextCatalog.getString('5Ghz'));
        for (var i in formatted.stats) {
          if (formatted.stats[i].key === 'new') {
            newV = formatted.stats[i].value;
          } else if (formatted.stats[i].key === 'returning') {
            retV = formatted.stats[i].value;
          }
        }

        if (newV === 0 && retV === 0) {
          newV = 100;
        }

        data.addRow([gettextCatalog.getString('New'), newV]);
        data.addRow([gettextCatalog.getString('Returning'), retV]);

        var formatter = new window.google.visualization.NumberFormat(
          {suffix: '%', pattern: '###,###,###'}
        );

        formatter.format(data, 1);
      }

      c = new window.google.visualization.PieChart(document.getElementById('dash-loyalty-chart'));
      c.draw(data, opts);
      // };

      // window.google.charts.setOnLoadCallback(drawChartCallback);

      scope.noData = undefined;
      scope.loading = undefined;
    }

    timer = setTimeout(function() {
      window.google.charts.setOnLoadCallback(chart);
    }, 500);
    $timeout.cancel(timer);
  };

  return {
    link: link,
    scope: {
      mac: '@',
      loc: '@',
      version: '@'
    },
    require: '^clientChart',
    templateUrl: 'components/charts/locations/_loyalty_chart.html',
  };

}]);

app.directive('healthChart', ['$timeout', 'Report', '$routeParams', 'COLOURS', 'gettextCatalog', 'ClientDetails', function($timeout, Report, $routeParams, COLOURS, gettextCatalog, ClientDetails) {

  var link = function(scope,element,attrs,controller) {

    ClientDetails.client.version = '4';
    ClientDetails.client.ap_mac = undefined;

    var c, timer, json, data;
    scope.loading = true;
    // var colours = ['#16ac5b', '#ef562d', '#5587a2', '#d13076', '#0c4c8a', '#5c7148'];
    var colours = ['#16ac5b', '#225566', '#EF476F', '#FFD166', '#0088bb'];

    // controller.$scope.$on('resizeClientChart', function (evt,type){
    //   drawChart();
    // });

    function chart() {
      var params = {
        type:         scope.type,
        metric_type:  'device.health',
        resource:     scope.resource
      };
      controller.getStats(params).then(function(resp) {
        drawChart(resp);
      }, function(err) {
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
      var drawChartCallback = function() {

        if (data === undefined) {
          var stats = json.stats;
          var len = stats.length;

          data = new window.google.visualization.DataTable();
          data.addColumn('string', 'state');
          data.addColumn('number', 'count');

          for(var i = 0; i < len; i++) {
            if (stats[i].key === 'total') {
              scope.total = stats[i].value;
            } else {
              data.addRow([stats[i].key, stats[i].value]);
            }
          }
        }

        var formatter = new window.google.visualization.NumberFormat(
          {pattern: '###,###,###'}
        );

        formatter.format(data, 1);

        var opts = controller.options;
        opts.explorer = undefined;
        opts.pieHole = 0.8;
        opts.legend = { position: 'bottom' };
        opts.title = 'none';
        opts.pieSliceText = 'none';
        opts.height = '350';
        opts.colors = colours;

        formatter.format(data,1);
        c = new window.google.visualization.PieChart(document.getElementById('dash-health-chart'));
        c.draw(data, opts);
      };
      window.google.charts.setOnLoadCallback(drawChartCallback);

      scope.noData = undefined;
      scope.loading = undefined;
    }

    timer = setTimeout(function() {
      window.google.charts.setOnLoadCallback(chart);
    }, 500);
    $timeout.cancel(timer);

  };

  return {
    link: link,
    scope: {
      mac: '@',
      loc: '@',
      version: '@'
    },
    require: '^clientChart',
    templateUrl: 'components/charts/locations/_health_chart.html',
  };

}]);

app.directive('heartbeatChart', ['$timeout', 'Report', '$routeParams', 'COLOURS', '$location', 'gettextCatalog', 'ClientDetails', function($timeout, Report, $routeParams, COLOURS, $location, gettextCatalog, ClientDetails) {

  var link = function(scope,element,attrs,controller) {

    var data, a;

    // ClientDetails.client.version = '4';
    // ClientDetails.client.ap_mac = undefined;

    controller.$scope.$on('resizeClientChart', function (evt, type){
      if (a) {
        drawChart();
      }
    });

    function getOptions(colors) {
      var opts =  {
        timeline: {
          colorByRowLabel:  false,
          showBarLabels: false,
          showRowLabels: false
        },
        avoidOverlappingGridLines: false,
        height: attrs.height || 45,
        width: '100%',
        tooltip: {isHtml: true}
      };
      return opts;
    }

    function boolToStatus(value) {
      return value ? 'Online' : 'Offline';
    }

    function prefixNumber(number) {
      return (number < 10 ? '0' + number : number);
    }

    function formatDate(date) {
      date = new Date(date * 1000 * 1000);
      var timeFormatted = prefixNumber(date.getHours()) + ':' + prefixNumber(date.getMinutes());
      var dateFormatted = prefixNumber(date.getDate()) + '/' + prefixNumber(date.getMonth() + 1) + '/' + date.getFullYear().toString().slice(-2);
      var datetimeFormatted = timeFormatted + ' ' + dateFormatted;
      return datetimeFormatted;
    }

    function duration(start, end) {
      return (end - start) / 60000;
    }

    function makeTooltip(status, startTime, endTime) {
      var tooltip = '<div class="heartbeats-tooltip" style="width: 250px; height: 80px; left 5px; top: 30px; pointer-events: none; font-weight: bold;">' +
        '<div class="heartbeats-tooltip-item-list" style="height: 25px">' +
          '<div class="heartbeats-tooltip-item">' +
            '<span style="font-family: Arial">Status: ' + status + '</span>' +
          '</div>' +
        '</div>' +
        // '<div class="heartbeats-tooltip-separator" style="height: 1px; margin: 0; padding: 0; background-color: #dddddd;"></div>' +
        '<div class="heartbeats-tooltip-item-list" style="height: 25px">' +
          '<div class="heartbeats-tooltip-item" style="height: 0px;">' +
            '<p><span style="font-family: Arial; font-size: 12px; color: rgb(0, 0, 0); margin: 0px; text-decoration: none; font-weight: bold;">Between:</span>' +
            '<span style="font-family: Arial; font-size: 12px; color: rgb(0, 0, 0); margin: 0px; text-decoration: none; font-weight: normal;"> ' + formatDate(startTime) + ' - ' + formatDate(endTime) + ' </span>' +
            '</p>'+
            // '<p>'+
            // '<p><span style="font-family: Arial; font-size: 12px; color: rgb(0, 0, 0); margin: 0px; text-decoration: none; font-weight: bold;">Duration:</span>' +
            // '<span style="font-family: Arial; font-size: 12px; color: rgb(0, 0, 0); margin: 0px; text-decoration: none; font-weight: normal;">' + duration(startTime, endTime) + ' minutes</span>' +
            // '</p>'+
          '</div>' +
        '</div>' +
      '</div>';

      return tooltip;
    }

    function sort(array) {
      return array.sort(function(a, b) {
        var x = a.timestamp; var y = b.timestamp;
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
      });
    }

    var chart = function() {
      var params = {
        metric_type:  'device.heartbeats',
        ap_mac: scope.mac,
        period: '7d' // can be removed soon when loyalty dynamic
      };
      controller.getStats(params).then(function(resp) {
        data = sort(resp.data).reverse();
        drawChart();
      }, function() {
      });
    };

    var dataTable;
    var drawChart = function() {

      if (!a) {

        a = true;
        dataTable = new window.google.visualization.DataTable();

        dataTable.addColumn({ type: 'string', id: 'Heartbeat' });
        dataTable.addColumn({ type: 'string', id: 'Status' });
        dataTable.addColumn({ type: 'string', role: 'tooltip', p: {html: 'true'}});
        dataTable.addColumn({ type: 'string', id: 'Style',  role: 'style'  });
        dataTable.addColumn({ type: 'datetime', id: 'Start' });
        dataTable.addColumn({ type: 'datetime', id: 'End' });

        var status;
        var t1, t2;

        for (var i = 0; i < data.length; i++) {

          t1 = data[i].timestamp;

          var colours = {Offline: '#eb0404', Online: '#16ac5b'};

          if (data.length === 1) {
            t2 = new Date().getTime() / (1000 * 1000);
            status = boolToStatus(data[i].value);
            dataTable.addRow(['Heartbeat', status, makeTooltip(status, t1, t2), 'color: ' + colours[status], new Date(t1 * 1000 * 1000), new Date(t2 * 1000 * 1000)]);
          }

          if (i !== 0) {
            dataTable.addRow(['Heartbeat', status, makeTooltip(status, t1, t2), 'color: ' + colours[status], new Date(t1 * 1000 * 1000), new Date(t2 * 1000 * 1000)]);
          }

          t2 = t1;
          status = boolToStatus(data[i].value);

          if (i + 1 === data.length) {
            // This is wrong, the last time doesn't look correct
            dataTable.addRow(['Heartbeat', status, makeTooltip(status, t1, t2), 'color: ' + colours[status], new Date(t1 * 1000 * 1000), new Date(t2 * 1000 * 1000)]);
          }
        }
      }

      var options = getOptions();
      var chart = new window.google.visualization.Timeline(document.getElementById(scope.target));
      chart.draw(dataTable, options);
    };

    var timer = setTimeout(function() {
      window.google.charts.setOnLoadCallback(chart);
    }, 500);
    $timeout.cancel(timer);
  };

  return {
    link: link,
    scope: {
      mac: '@',
      loc: '@',
      target: '@',
      height: '@'
    },
    require: '^clientChart',
  };

}]);

app.directive('dashClientsChart', ['$timeout', 'Report', '$routeParams', 'COLOURS', 'gettextCatalog', 'ClientDetails', function($timeout, Report, $routeParams, COLOURS, gettextCatalog, ClientDetails) {

  var link = function(scope,element,attrs,controller) {

    var c, timer, formatted, data;

    scope.type = 'client.uniques';
    scope.loading = true;
    var colours = COLOURS.split(' ');

    ClientDetails.client.version = '4';
    ClientDetails.client.ap_mac = undefined;

    // controller.$scope.$on('resizeClientChart', function (evt,type){
    //   drawChart();
    // });

    function chart() {

      var params = {
        type: scope.type,
        period: '7d' // can be removed soon when loyalty dynamic
      };

      controller.getStats(params).then(function(res) {
        drawChart(res);
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
      scope.loading = undefined;
    };

    function drawChart(resp) {
      $timeout.cancel(timer);
      if (window.google && window.google.visualization) {
        var format = gettextCatalog.getString('MMM dd, yyyy');

        colours[1] = colours[0];
        var opts = controller.options;

        opts.title = 'none';
        opts.height = '350';
        opts.colors = ['#225566'];
        opts.curveType = 'function';
        opts.legend = { position: 'none' };
        opts.series = {
          0: {
            targetAxisIndex: 0, visibleInLegend: false, pointSize: 0, lineWidth: 1
          },
          1: {
            targetAxisIndex: 1, lineWidth: 2.5
          }
        };
        opts.vAxes = {
          0: {
            textPosition: 'none',
            viewWindow:{
              max: 10,
              min: 0
            }
          },
          1: {
            viewWindow:{
              min: 0
            }
          },
        };

        opts.hAxis = {
          lineWidth: 4,
          gridlines: {
            count: 10,
            color: '#f3f3f3',
          },
          minorGridlines: {
            count: 2,
            color: '#f3f3f3',
          },
          format: format
        };

        opts.explorer = {
          maxZoomOut: 0,
          keepInBounds: true,
          axis: 'none',
          actions: [],
        };

        if (data === undefined && resp && resp.data) {

          data = new window.google.visualization.DataTable();
          data.addColumn('datetime', 'Date');
          data.addColumn('number', 'dummySeries');
          data.addColumn('number', gettextCatalog.getString('clients'));

          var len = resp.data.length;
          for(var i = 0; i < len; i++) {
            var time = new Date(Math.floor(resp.data[i].timestamp));
            var count = resp.data[i].value;
            data.addRow([time, null, count]);
          }

          var date_formatter = new window.google.visualization.DateFormat({
            pattern: format
          });

          date_formatter.format(data,0);

          var formatter = new window.google.visualization.NumberFormat(
            { pattern: '0' }
          );
          formatter.format(data,2);
        }

        // if (window.google && window.google.visualization) {
        c = new window.google.visualization.LineChart(document.getElementById('dash-clients-chart'));
        c.draw(data, opts);

        scope.noData = undefined;
        scope.loading = undefined;
      }
    }

    var timeout = $timeout(function() {
      window.google.charts.setOnLoadCallback(chart());
    }, 500);

  };

  return {
    link: link,
    scope: {
      mac: '@',
      loc: '@',
      version: '@'
    },
    require: '^clientChart',
    templateUrl: 'components/charts/locations/_clients_chart.html',
  };

}]);

app.directive('loadChart', ['Report', '$routeParams', '$timeout', 'gettextCatalog', 'COLOURS', 'ClientDetails', function(Report, $routeParams, $timeout, gettextCatalog, COLOURS, ClientDetails) {

  var link = function(scope,element,attrs,controller) {

    var a, data;
    var c, timer, json;
    var rate = 'false';
    scope.loading = true;
    scope.type  = 'devices.load5';
    var colours = COLOURS.split(' ');

    // Depreciate soon
    if (ClientDetails.client.version === '3.0') {
      scope.type  = 'devices.load';
    }
    var opts = controller.options;

    controller.$scope.$on('resizeClientChart', function (evt, type){
      if (a) {
        drawChart();
      }
    });

    controller.$scope.$on('loadClientChart', function (evt, type){
      a = undefined;
      chart();
    });

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
        rate: rate,
      };
      controller.getStats(params).then(function(data) {
        json = data;
        drawChart();
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

    function drawChart() {

      var len, time, suffix;

      var drawChartCallback = function() {

        if (json.multi === true) {
        }

        scope.title = gettextCatalog.getString('Average Load (%)');

        if (a === undefined) {
          data = new window.google.visualization.DataTable();
          data.addColumn('datetime', gettextCatalog.getString('Date'));
          data.addColumn('number', 'dummySeries');
          data.addColumn('number', gettextCatalog.getString('Load Average'));

          for(var i = 0; i < json.data.length; i++) {
            time = new Date(json.data[i].timestamp*1000);
            var load = (json.data[i].value*100);
            if (load > 100) {
              load = 100;
            }
            data.addRow([time, null, load]);
          }
        }

        var date_formatter = new window.google.visualization.DateFormat({
          pattern: gettextCatalog.getString('MMM dd, yyyy hh:mm:ss a')
        });
        date_formatter.format(data,0);

        var formatter = new window.google.visualization.NumberFormat(
          {suffix: '%'}
        );
        formatter.format(data,2);

        opts.colors = colours;
        opts.vAxes = {
          0: {
            textPosition: 'none',
            viewWindow:{
              max: 10,
              min: 0
            }
          },
          1: {
            viewWindow:{
              min: 0
            }
          },
        };
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
          minValue: 0,
          maxValue: 100
        };
        opts.hAxis = {
          gridlines: {
            count: -1,
            units: {
              days: {format: [gettextCatalog.getString('MMM dd')]},
              hours: {format: [gettextCatalog.getString('hh:mm a')]},
              minutes: {format: [gettextCatalog.getString('hh:mm a')]}
            }
          },
          minorGridlines: {
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
          actions: ['dragToZoom', 'rightClickToReset'],
        };
        if (scope.fs) {
          opts.height = 600;
        } else {
          opts.height = 250;
        }

        c = new window.google.visualization.LineChart(document.getElementById('load-chart'));
        scope.noData = undefined;
        scope.loading = undefined;

        a = true;
        c.draw(data, opts);
      };
      window.google.charts.setOnLoadCallback(drawChartCallback);
    }

    setTimeout(function() {
      window.google.charts.setOnLoadCallback(chart);
    }, 500);
  };

  return {
    link: link,
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
        //fn: scope.fn.value
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

    // function drawChart(json) {

    $timeout.cancel(timer);
    var drawChartCallback = function() {
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
        },
        minorGridlines: {
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
        // }
        // window.google.charts.setOnLoadCallback(drawChartCallback);
      scope.noData = undefined;
      scope.loading = undefined;
    };

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
        //fn: scope.fn.value
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
      var drawChartCallback = function() {
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
      };

      window.google.charts.setOnLoadCallback(drawChartCallback);
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

app.directive('interfaceChart', ['Report', '$routeParams', '$timeout', 'gettextCatalog', 'ClientDetails', function(Report, $routeParams, $timeout, gettextCatalog, ClientDetails) {

  var link = function(scope,element,attrs,controller) {

    var a, data, c, timer, json;
    scope.loading = true;
    scope.type  = 'interfaces.snr';
    scope.resource = 'device';
    var rate = false;

    // ClientDetails.client.version = '4';

    controller.$scope.$on('resizeClientChart', function (evt,type){
      if (a) {
        drawChart();
      }
    });

    controller.$scope.$on('loadClientChart', function (evt, type){
      a = undefined;
      chart();
    });

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

    function chart() {
      var params = {
        type: scope.type,
        resource: scope.resource,
        rate: rate,
        interface: '*'
      };
      controller.getStats(params).then(function(data) {
        json = data;
        drawChart();
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

    function drawChart() {

      var opts = controller.options;
      opts.series = {
        0: {
          targetAxisIndex: 0, visibleInLegend: false, pointSize: 0, lineWidth: 0
        },
        1: {
          targetAxisIndex: 1, lineWidth: 2.5
        }
      };

      var suffix;
      // $timeout.cancel(timer);
      // var drawChartCallback = function() {

      // vAxis set to only have values on negative graphs
      if (scope.type === 'interfaces.snr' ) {
        suffix = 'dB';
        opts.vAxes = {
          0: {
            textPosition: 'none',
            viewWindow:{
              max: 100,
              min: 0
            }
          },
          1: {
            viewWindow:{
              min: 0
            }
          }
        };
      // } else if (scope.type === 'noise' || scope.type === 'signal') {
      //   suffix = 'dBm';
      //   opts.vAxis = {
      //     minValue: -100,
      //     maxValue: 0
      //   };
      // } else if (scope.type === 'quality') {
      //   suffix = '%';
      //   opts.vAxis = {};
      }

      opts.legend = { position: 'bottom' };
      opts.series = {
        0: {
          targetAxisIndex: 0, visibleInLegend: false, pointSize: 0, lineWidth: 0
        },
        1: {
          targetAxisIndex: 1
        },
        2: {
          targetAxisIndex: 1
        },
        3: {
          targetAxisIndex: 1
        },
        4: {
          targetAxisIndex: 1
        },
        5: {
          targetAxisIndex: 1
        },
        6: {
          targetAxisIndex: 1
        },
        7: {
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
        },
        minorGridlines: {
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

      if (!a) {
        a = true;

        data = new window.google.visualization.DataTable();
        data.addColumn('datetime', 'Date');
        data.addColumn('number', 'dummySeries');

        data = new window.google.visualization.DataTable();
        data.addColumn('datetime', gettextCatalog.getString('Date'));
        data.addColumn('number', 'dummySeries');

        for(var i = 0; i < json.data.length; i++) {
          var name;
          for (var j = 0; j < json.meta.length; j++) {
            if (json.meta[j].interface === json.data[i].tags.interface) {
              var freq = json.meta[j].freq;
              if (freq === '2') {
                freq = '2.4Ghz';
              } else {
                freq = '5Ghz';
              }
              name = json.meta[j].ssid + ' ('+ freq +')';
              break;
            }
            if (name === undefined) {
              name = 'N/A';
            }
          }
          data.addColumn('number', name);
        }

        for(var x = 0; x < json.data[0].data.length; x++) {
          var time;
          var array = [];

          time = new Date(json.data[0].data[x].timestamp*1000);
          array.push(time);
          array.push(null);

          for(var k = 0; k < json.data.length; k++) {
            var val = 0;
            var d = json.data[k].data[x];
            if (d && d.value > 0) {
              val = (d.value);
            }

            // Temp hack to fix broken data
            if (scope.type === 'interfaces.snr' && val >= 95 ) {
              val = 0;
            }
            array.push(val);
          }

          data.addRow(array);
        }
      }

      var date_formatter = new window.google.visualization.DateFormat({
        pattern: gettextCatalog.getString('MMM dd, yyyy hh:mm:ss a')
      });
      date_formatter.format(data,0);

      var formatter = new window.google.visualization.NumberFormat(
        {suffix: suffix, pattern: '0'}
      );

      for (var i = 0; i < data.getNumberOfColumns(); i++){
        formatter.format(data, i);
      }

      c = new window.google.visualization.LineChart(document.getElementById('snr-chart'));
      c.draw(data, opts);
      scope.noData = undefined;
      scope.loading = undefined;
    }

    setTimeout(function() {
      window.google.charts.setOnLoadCallback(chart);
      $timeout.cancel(timer);
    }, 500);
  };

  return {
    link: link,
    scope: {
      mac: '@',
      loc: '@'
    },
    require: '^clientChart',
    templateUrl: 'components/charts/devices/_snr_chart.html',
  };

}]);
