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

    $(window).resize(function() {
      if (this.resizeTO) {
        clearTimeout(this.resizeTO);
      }
      this.resizeTO = setTimeout(function() {
        $(this).trigger('resizeEnd');
      }, 150);
    });

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

      $timeout.cancel(timer);

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
      var suffix =  gettextCatalog.getString('Mbps');
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
        $scope.$broadcast('loadClientChart');
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

      this.v1 = function(params, deferred) {
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
      };

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
        if ($scope.client.version === '4') {
          this.v2(params, deferred);
        } else {
          this.v1(params, deferred);
        }
        return deferred.promise;
      };
    }
  };

}]);

app.directive('txChart', ['$timeout', 'Report', '$routeParams', 'gettextCatalog', '$filter', 'ClientDetails', function($timeout, Report, $routeParams, gettextCatalog, $filter, ClientDetails) {

  var link = function(scope,element,attrs,controller) {

    ClientDetails.client.version = '4';

    var a, data;
    var c, timer, json;
    var opts = controller.options;
    var rate = $routeParams.rate;
    if (rate === undefined && rate !== 'true' && rate !== 'false') {
      rate = 'true';
    }

    // Update when testing clients //
    scope.type     = 'devices.rx,devices.tx';

    scope.loading  = true;
    scope.fn       = {key: gettextCatalog.getString('mean'), value:'mean'};
    scope.resource = 'client';
    scope.noData   = undefined;

    controller.$scope.$on('loadClientChart', function (evt,type){
      // if (type && type === 'device') {
      //   scope.resource = 'device';
      // }

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

    // function test(data, datas) {
    //   var len = datas.length;
    //   var time;
    //   for(var i = 0; i < len; i++) {
    //     // console.log(json.data[i])
    //     //   if (scope.type === 'device_tx' || scope.type === 'tx' || scope.type === 'usage') {

    //     //     var outbound = 0;
    //     var inbound = (datas[i].value / (1000*1000)) * 8;
    //     time = new Date(datas[i].timestamp*1000);
    //     console.log(time);

    //     //     if (json.outbound && json.outbound[i] && json.outbound[i].value) {
    //     //       outbound = json.outbound[i].value;
    //     //     }

    //     data.addRow([time, null, inbound]);
    //     // data.addRow([time, null, inbound / (1000*1000), outbound / (1000*1000) ]);


    //     //   } else if (scope.type === 'txfailed') {

    //     //     time = new Date(json.txfailed[i].time / (1000*1000));
    //     //     var val = 0;
    //     //     if (json.txfailed && json.txfailed[i] && json.txfailed[i].value) {
    //     //       val = json.txfailed[i].value;
    //     //     }
    //     //     data.addRow([time, null, val]);

    //     //   } else if (scope.type === 'txretries') {

    //     //     time = new Date(json.txretries[i].time / (1000*1000));
    //     //     data.addRow([time, null, json.txretries[i].value]);

    //     //   }
    //   }
    // }

    function drawChart() {

      var len, time, suffix;

      var drawChartCallback = function() {

        if (json.multi === true) {
          // alert(123)
        }

        // a = true;

        // if (json.txfailed || json.txretries || json.inbound) {

        suffix = 'Mbps';
        scope.title = gettextCatalog.getString('Device Traffic ('+suffix+')');

        //   if (scope.type === 'usage') {
        //     scope.title = gettextCatalog.getString('WiFi Usage');
        //     suffix = 'MB';
        //   } else if (scope.resource === 'device') {
        //     scope.title = gettextCatalog.getString('Device Traffic (Mbps)');
        //     suffix = 'Mbps';
        //   } else if (scope.type === 'tx') {
        //     scope.title = gettextCatalog.getString('WiFi Traffic (Mbps)');
        //     suffix = 'Mbps';
        //   } else if (scope.type === 'txfailed') {
        //     scope.title = gettextCatalog.getString('Failed Tx Count');
        //     suffix = undefined;
        //   } else if (scope.type === 'txretries') {
        //     scope.title = gettextCatalog.getString('Tx Retries');
        //     suffix = undefined;
        //   }

        if (a === undefined) {
          data = new window.google.visualization.DataTable();
          data.addColumn('datetime', gettextCatalog.getString('Date'));
          data.addColumn('number', 'dummySeries');
          // if (scope.type === 'device_tx' || scope.type === 'tx' || scope.type === 'usage') {
          //   len = json.inbound.length;
          data.addColumn('number', gettextCatalog.getString('Inbound'));
          if (json.multi) {
            data.addColumn('number', gettextCatalog.getString('Outbound'));
          }
          // data.addColumn('number', gettextCatalog.getString('Outbound'));
          // data.addColumn('number', gettextCatalog.getString('Outbound'));
          // } else if (scope.type === 'txfailed') {
          //   len = json.txfailed.length;
          //   data.addColumn('number', gettextCatalog.getString('Tx Failed'));
          // } else if (scope.type === 'txretries') {
          //   len = json.txretries.length;
          //   data.addColumn('number', gettextCatalog.getString('Tx Retries'));
          // }

          if (json.multi === true) {
            var s1 = json.data[0].data;
            var s2 = json.data[1].data;

            for(var i = 0; i < json.data[0].data.length; i++) {
              time = new Date(s1[i].timestamp*1000);
              var inbound = (s1[i].value / (1000*1000)) * 8;
              var outbound = (s2[i].value / (1000*1000)) * -8;
              data.addRow([time, null, inbound, outbound]);
            }
          }
        }

        var date_formatter = new window.google.visualization.DateFormat({
          pattern: gettextCatalog.getString('MMM dd, yyyy hh:mm:ss a')
        });
        // date_formatter.format(data,0);

        var formatter = new window.google.visualization.NumberFormat(
          {suffix: suffix}
        );
        formatter.format(data,2);
        // if (scope.type === 'tx' || scope.type === 'usage' || scope.type === 'device_tx') {
        formatter.format(data,3);
        // }

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
        // } else {
        //   clearChart();
        // }
      };
      window.google.charts.setOnLoadCallback(drawChartCallback);
    }

    chart();
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

app.directive('usageChart', ['$timeout', 'Report', '$routeParams', 'COLOURS', 'gettextCatalog', function($timeout, Report, $routeParams, COLOURS, gettextCatalog) {

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
        type:         scope.type,
        metric_type:  'device.usage',
        resource:     scope.resource
      };
      controller.getStats(params).then(function(resp) {
        if (resp.v === 2) {
          // Sort when old data is depreciated
          for (var i in resp.stats) {
            var key = resp.stats[i].key;
            if (key === 'outbound') {
              data.usage.outbound = resp.stats[i].value;
            } else if (key === 'inbound') {
              data.usage.inbound = resp.stats[i].value;
            }
          }
        } else {
          data = resp;
        }

        if (data.usage.inbound === 0 && data.usage.outbound === 0) {
          data.usage.inbound = 1;
        }
        drawChart(data.usage);
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
      var drawChartCallback = function() {
        var data = new window.google.visualization.DataTable();
        data.addColumn('string', gettextCatalog.getString('Inbound'));
        data.addColumn('number', gettextCatalog.getString('Outbound'));
        data.addRows([
          [gettextCatalog.getString('Outbound'), json.outbound / (1000*1000) || 0],
          [gettextCatalog.getString('Inbound'), json.inbound / (1000*1000) || 0]
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
      };

      window.google.charts.setOnLoadCallback(drawChartCallback);

      scope.noData = undefined;
      scope.loading = undefined;
    }

    chart();
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

app.directive('dashUsageChart', ['$timeout', 'Report', '$routeParams', 'COLOURS', 'gettextCatalog', function($timeout, Report, $routeParams, COLOURS, gettextCatalog) {

  var link = function(scope,element,attrs,controller) {

    var c, timer, data;
    scope.loading = true;
    var colours = ['#16ac5b', '#225566', '#007788', '#0088AA', '#0088BB', '#BBCCCC'];
    var formatted = { usage: { inbound: 1 } };

    controller.$scope.$on('loadClientChart', function (evt,type){
      drawChart();
    });

    function chart() {
      var params = {
        type:         scope.type,
        metric_type:  'device.usage',
        resource:     scope.resource
      };
      controller.getStats(params).then(function(resp) {
        if (resp.v === 2) {
          // Sort when old data is depreciated
          for (var i in resp.stats) {
            var key = resp.stats[i].key;
            if (key === 'outbound') {
              formatted.usage.outbound = resp.stats[i].value;
            } else if (key === 'inbound') {
              formatted.usage.inbound = resp.stats[i].value;
            }
          }
        } else {
          formatted = resp;
        }

        if (formatted.usage.inbound === 0 && formatted.usage.outbound === 0) {
          formatted.usage.inbound = 1;
        }
        drawChart(formatted.usage);
      }, function() {
        clearChart();
      });
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
      var drawChartCallback = function() {

        var opts = controller.options;
        opts.explorer = undefined;
        opts.pieHole = 0.8;
        opts.legend = { position: 'bottom' };
        opts.title = 'none';
        opts.pieSliceText = 'none';
        opts.height = '350';
        opts.colors = colours;

        if (data === undefined && json) {
          data = new window.google.visualization.DataTable();
          data.addColumn('string', gettextCatalog.getString('Inbound'));
          data.addColumn('number', gettextCatalog.getString('Outbound'));
          data.addRows([
            [ gettextCatalog.getString('Outbound'), json.outbound / (1000*1000) || 0 ],
            [ gettextCatalog.getString('Inbound'), json.inbound / (1000*1000) || 0 ]
          ]);
        }

        var formatter = new window.google.visualization.NumberFormat(
          {suffix: 'Mb', pattern: '#,###,###'}
        );

        formatter.format(data, 1);

        c = new window.google.visualization.PieChart(document.getElementById('dash-usage-chart'));
        c.draw(data, opts);
      };

      window.google.charts.setOnLoadCallback(drawChartCallback);

      scope.noData = undefined;
      scope.loading = undefined;
    }

    chart();
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
    var colours = ['#16ac5b', '#225566', '#007788', '#0088AA', '#0088BB', '#BBCCCC'];

    controller.$scope.$on('loadClientChart', function (evt,type){
      drawChart();
    });

    function chart() {
      var params = {
        type:         scope.type,
        metric_type:  'device.caps',
        resource:     scope.resource
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

      $timeout.cancel(timer);
      var drawChartCallback = function() {

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
          for (var i in formatted.stats) {
            if (formatted.stats[i].key === 'two') {
              data.addRow(['2.4Ghz', formatted.stats[i].value]);
            } else if (formatted.stats[i].key === 'five') {
              data.addRow(['5Ghz', formatted.stats[i].value]);
            }
          }
        }

        var formatter = new window.google.visualization.NumberFormat(
          {suffix: '%', pattern: ''}
        );

        formatter.format(data, 1);

        c = new window.google.visualization.PieChart(document.getElementById('caps-chart'));
        c.draw(data, opts);
      };

      window.google.charts.setOnLoadCallback(drawChartCallback);

      scope.noData = undefined;
      scope.loading = undefined;
    }

    chart();
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
    var colours = ['#16ac5b', '#225566', '#007788', '#0088AA', '#0088BB', '#BBCCCC'];

    controller.$scope.$on('loadClientChart', function (evt,type){
      drawChart();
    });

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

      $timeout.cancel(timer);
      var drawChartCallback = function() {

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
          data = new window.google.visualization.DataTable();
          data.addColumn('string', gettextCatalog.getString('2.4Ghz'));
          data.addColumn('number', gettextCatalog.getString('5Ghz'));
          for (var i in formatted.stats) {
            if (formatted.stats[i].key === 'new') {
              data.addRow(['New', formatted.stats[i].value]);
            } else if (formatted.stats[i].key === 'returning') {
              data.addRow(['Returning', formatted.stats[i].value]);
            }
          }

          var formatter = new window.google.visualization.NumberFormat(
            {suffix: '%', pattern: '###,###,###'}
          );

          formatter.format(data, 1);
        }

        c = new window.google.visualization.PieChart(document.getElementById('dash-loyalty-chart'));
        c.draw(data, opts);
      };

      window.google.charts.setOnLoadCallback(drawChartCallback);

      scope.noData = undefined;
      scope.loading = undefined;
    }

    chart();
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
    var colours = ['#16ac5b', '#ef562d', '#5587a2', '#d13076', '#0c4c8a', '#5c7148'];

    controller.$scope.$on('loadClientChart', function (evt,type){
      drawChart();
    });

    scope.refresh = function() {
      chart();
    };

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

    chart();
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

    window.google.charts.setOnLoadCallback(chart);

    var data;

    $(window).resize(function() {
      if (this.resizeTO) {
        clearTimeout(this.resizeTO);
      }
      this.resizeTO = setTimeout(function() {
        $(this).trigger('resizeEnd');
      }, 250);
    });

    $(window).on('resizeEnd', function() {
      chart();
    });

    function getOptions() {
      return {
        colors: ['#4caf50', '#af504c'],
        timeline: {
                    colorByRowLabel:  false,
                    showBarLabels: false,
                    showRowLabels: false
                  },
        avoidOverlappingGridLines: false,
        height: 45,
        width: 200,
        tooltip: {isHtml: true}
      };
    }

    function boolToStatus(value) {
      return value ? 'Online' : 'Offline'
    }

    function prefixNumber(number) {
      return (number < 10 ? '0' + number : number)
    }

    function formatDate(date) {
      date = new Date(date);
      var timeFormatted = prefixNumber(date.getHours()) + ':' + prefixNumber(date.getMinutes());
      var dateFormatted = prefixNumber(date.getDate()) + '/' + prefixNumber(date.getMonth()) + '/' + date.getFullYear().toString().slice(-2);
      var datetimeFormatted = timeFormatted + ' ' + dateFormatted;
      return datetimeFormatted
    }

    function duration(start, end) {
      return (end - start) / 60000
    }

    function makeTooltip(status, startTime, endTime) {
      var tooltip = '<div class="heartbeats-tooltip" style="width: 250px; height: 120px; left 5px; top: 30px; pointer-events: none; font-weight: bold;">' +
        '<div class="heartbeats-tooltip-item-list" style="height: 35px">' +
          '<div class="heartbeats-tooltip-item">' +
            '<span style="font-family: Arial">' + status + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="heartbeats-tooltip-separator" style="height: 1px; margin: 0; padding: 0; background-color: #dddddd;"></div>' +
        '<div class="heartbeats-tooltip-item-list" style="height: 65px">' +
          '<div class="heartbeats-tooltip-item" style="height: 30px;">' +
            '<span style="font-family: Arial; font-size: 12px; color: rgb(0, 0, 0); margin: 0px; text-decoration: none; font-weight: bold;">Heartbeat:</span>' +
            '<span style="font-family: Arial; font-size: 12px; color: rgb(0, 0, 0); margin: 0px; text-decoration: none; font-weight: normal;"> ' + formatDate(startTime) + ' - ' + formatDate(endTime) + ' </span>' +
          '</div>' +
           '<div class="heartbeats-tooltip-item" style="height: 30px;">' +
            '<span style="font-family: Arial; font-size: 12px; color: rgb(0, 0, 0); margin: 0px; text-decoration: none; font-weight: bold;">Duration:</span>' +
            '<span style="font-family: Arial; font-size: 12px; color: rgb(0, 0, 0); margin: 0px; text-decoration: none; font-weight: normal;">' + duration(startTime, endTime) + ' minutes</span>' +
          '</div>' +
        '</div>' +
      '</div>';

      return tooltip
    }

    function chart() {

      var params = {
        metric_type:  'device.heartbeats',
        ap_mac: scope.mac
      };
      controller.getStats(params).then(function(resp) {
        var time = resp.data[0].timestamp;
        var value = boolToStatus(resp.data[0].value);
        data = [
          [value, time]
        ];
        for (var i = 0; i < 109; i++) {
          time = time - 600000;
          value = boolToStatus(Math.random() >= 0.2);
          data.push([value, time]);
        }

        data.reverse();

        var dataTable = new google.visualization.DataTable();

        dataTable.addColumn({ type: 'string', id: 'Heartbeat' });
        dataTable.addColumn({ type: 'string', id: 'Status' });
        dataTable.addColumn({ type: 'string', role: 'tooltip', p: {html: 'true'}})
        dataTable.addColumn({ type: 'datetime', id: 'Start' });
        dataTable.addColumn({ type: 'datetime', id: 'End' });

        var status;
        var lastTime;

        for (var i = 0; i < data.length; i++) {
          var thisTime = data[i][1]
          if (i != 0) {
            dataTable.addRow(['Heartbeat', status, makeTooltip(status, lastTime, thisTime), new Date(lastTime), new Date(thisTime)]);
          }
          status = data[i][0];
          lastTime = thisTime;
          if (i + 1 == data.length) {
            dataTable.addRow(['Heartbeat', status, makeTooltip(status, lastTime, thisTime), new Date(lastTime), new Date(thisTime)])
          }
        };

        var options = getOptions();

        var chart = new google.visualization.Timeline(document.getElementById(scope.target));
        chart.draw(dataTable, options);
      });
    }

  };

  return {
    link: link,
    scope: {
      mac: '@',
      loc: '@',
      target: '@'
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

    // var maxDate = moment().utc().endOf('day').toDate();
    // var minDate = moment().utc().subtract(7, 'days').startOf('day').toDate();

    // var minDateEpoch = Math.floor(minDate.getTime() / 1000);
    // var maxDateEpoch = Math.floor(maxDate.getTime() / 1000);

    controller.$scope.$on('loadClientChart', function (evt,type){
      drawChart();
    });

    // scope.refresh = function() {
    //   alert(123);
    //   chart();
    // };

    function chart() {

      var params = {
        type: scope.type,
        // start_time: minDateEpoch,
        // end_time: maxDateEpoch
      };

      controller.getStats(params).then(function(res) {
        drawChart(res);
      }, function() {
        clearChart();
        console.log('No data returned for query');
      });
    }

    var renderChart = function() {
      window.google.charts.setOnLoadCallback(drawChart(data));
    };

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
          }
        };

        opts.explorer = {
          maxZoomOut: 0,
          keepInBounds: true,
          axis: 'none',
          actions: [],
        };

        var dateFormatter = new window.google.visualization.DateFormat({formatType: format, timeZone: 0});

        if (data === undefined && resp && resp.data) {

          data = new window.google.visualization.DataTable();
          data.addColumn('datetime', 'Date');
          data.addColumn('number', 'dummySeries');
          data.addColumn('number', 'clients');

          var len = resp.data.length;
          for(var i = 0; i < len; i++) {
            var time = dateFormatter.formatValue(new Date(Math.floor(resp.data[i].timestamp)));
            time = new Date(time);
            var count = resp.data[i].value;
            data.addRow([time, null, count]);
          }

          var date_formatter = new window.google.visualization.DateFormat({
            pattern: gettextCatalog.getString(format)
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
    }, 250);

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

app.directive('loadChart', ['Report', '$routeParams', '$timeout', 'gettextCatalog', 'ClientDetails', function(Report, $routeParams, $timeout, gettextCatalog, ClientDetails) {

  var link = function(scope,element,attrs,controller) {

    ClientDetails.client.version = '4';

    var a, data;
    var c, timer, json;
    var rate = 'false';
    scope.loading = true;
    scope.type  = 'devices.load5';
    var opts = controller.options;

    controller.$scope.$on('loadClientChart', function (evt, type){
      a = undefined;
      chart();
    });

    // scope.refresh = function() {
    //   chart();
    // };

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
        // fn: scope.fn.value
      };
      controller.getStats(params).then(function(data) {
        json = data;
        drawChart();
          // window.google.charts.setOnLoadCallback(drawChart(data.timeline));
        // } else {
        //  clearChart();
        // }
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
          // alert(123)
        }

        // a = true;

        // if (json.txfailed || json.txretries || json.inbound) {

        scope.title = gettextCatalog.getString('Average Load (%)');

        //   if (scope.type === 'usage') {
        //     scope.title = gettextCatalog.getString('WiFi Usage');
        //     suffix = 'MB';
        //   } else if (scope.resource === 'device') {
        //     scope.title = gettextCatalog.getString('Device Traffic (Mbps)');
        //     suffix = 'Mbps';
        //   } else if (scope.type === 'tx') {
        //     scope.title = gettextCatalog.getString('WiFi Traffic (Mbps)');
        //     suffix = 'Mbps';
        //   } else if (scope.type === 'txfailed') {
        //     scope.title = gettextCatalog.getString('Failed Tx Count');
        //     suffix = undefined;
        //   } else if (scope.type === 'txretries') {
        //     scope.title = gettextCatalog.getString('Tx Retries');
        //     suffix = undefined;
        //   }

        if (a === undefined) {
          data = new window.google.visualization.DataTable();
          data.addColumn('datetime', gettextCatalog.getString('Date'));
          data.addColumn('number', 'dummySeries');
          data.addColumn('number', gettextCatalog.getString('Load Average'));

          for(var i = 0; i < json.data.length; i++) {
              time = new Date(json.data[i].timestamp*1000);
              var load = (json.data[i].value*100);
              data.addRow([time, null, load]);
          }
        }

        var date_formatter = new window.google.visualization.DateFormat({
          pattern: gettextCatalog.getString('MMM dd, yyyy hh:mm:ss a')
        });
        // date_formatter.format(data,0);

        var formatter = new window.google.visualization.NumberFormat(
          {suffix: '%'}
        );
        formatter.format(data,2);

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

        c = new window.google.visualization.LineChart(document.getElementById('load-chart'));
        scope.noData = undefined;
        scope.loading = undefined;

        a = true;
        c.draw(data, opts);
        // } else {
        //   clearChart();
        // }
      };
      window.google.charts.setOnLoadCallback(drawChartCallback);
    }

    chart();
    // function drawChart(json) {

    //   $timeout.cancel(timer);

    //   var drawChartCallback = function() {
    //     var data = new window.google.visualization.DataTable();
    //     data.addColumn('datetime', 'Date');
    //     data.addColumn('number', 'dummySeries');
    //     data.addColumn('number', gettextCatalog.getString('Load Average'));
    //     var len = json.load.length;
    //     for(var i = 0; i < len; i++) {
    //       var load = json.load[i].value;
    //       if (!load) {
    //         load = 0;
    //       }
    //       var time = new Date(json.load[i].time / (1000*1000));
    //       data.addRow([time, null, load*100]);
    //     }

    //     var date_formatter = new window.google.visualization.DateFormat({
    //       pattern: gettextCatalog.getString('MMM dd, yyyy hh:mm:ss a')
    //     });
    //     date_formatter.format(data,0);

    //     var formatter = new window.google.visualization.NumberFormat(
    //       { pattern: '0', suffix: '%' }
    //     );
    //     formatter.format(data,2);

    //     var opts = controller.options;
    //     opts.legend = { position: 'none' };
    //     opts.series = {
    //       0: {
    //         targetAxisIndex: 0, visibleInLegend: false, pointSize: 0, lineWidth: 0
    //       },
    //       1: {
    //         targetAxisIndex: 1
    //       },
    //       2: {
    //         targetAxisIndex: 1
    //       }
    //     };
    //     opts.vAxis = {
    //     };
    //     opts.hAxis = {
    //       gridlines: {
    //         count: -1,
    //         units: {
    //           days: {format: [gettextCatalog.getString('MMM dd')]},
    //           hours: {format: [gettextCatalog.getString('hh:mm a')]},
    //           minutes: {format: [gettextCatalog.getString('hh:mm a')]}
    //         }
    //       },
    //       minorGridlines: {
    //         count: -1,
    //         units: {
    //           days: {format: [gettextCatalog.getString('MMM dd')]},
    //           hours: {format: [gettextCatalog.getString('hh:mm a')]},
    //           minutes: {format: [gettextCatalog.getString('hh:mm a')]}
    //         }
    //       }
    //     };

    //     opts.explorer = {
    //       maxZoomOut:2,
    //       keepInBounds: true,
    //       axis: 'horizontal',
    //       actions: [ 'dragToZoom', 'rightClickToReset'],
    //     };
    //     if (scope.fs) {
    //       opts.height = 600;
    //     } else {
    //       opts.height = 250;
    //     }
    //     c = new window.google.visualization.LineChart(document.getElementById('load-chart'));
    //     c.draw(data, opts);
    //   };

    //   window.google.charts.setOnLoadCallback(drawChartCallback);
    //   scope.noData = undefined;
    //   scope.loading = undefined;
    // }

    // // The resize event triggers the graphs to load
    // // Not ideal, but good for responsive layouts atm
    // $(window).trigger('resize');

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

    function drawChart(json) {

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
      }
      window.google.charts.setOnLoadCallback(drawChartCallback);
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

    ClientDetails.client.version = '4';

    controller.$scope.$on('loadClientChart', function (evt,type){
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

    // scope.refresh = function() {
    //   chart();
    // };

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

    // function transpose(array) {
    //   return array[0].map(function (_, c) {
    //     return array.map(function (r) {
    //       return typeof r[c] == 'undefined' ? {value: null} : r[c];
    //     });
    //   });
    // }

    function drawChart() {

      console.log(json)

      $timeout.cancel(timer);
      var drawChartCallback = function() {
        data = new window.google.visualization.DataTable();
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
        // var ifaces = [];
        // var ifaceData = [];
        // for (var k in json) {
        //   if (typeof json[k] !== 'function') {
        //     ifaces.push(k);
        //     ifaceData.push(json[k].values);
        //     data.addColumn('number', k);
        //   }
        // }

        // for (var i = 2; i < ifaces.length + 2; i++) {
        //   opts.series[i] = { targetAxisIndex: 1 }
        // }

        // var allRows = transpose(ifaceData);

        // var first = json[ifaces[0]];

        // if (true) {
        // if (first && first.values && first.values.length) {
        //   var len = first.values.length;

        //   for(var i = 0; i < len; i++) {

        //     var time = (first.values[i].time);
        //     var t = new Date(time / (1000*1000));

        //     var rowEntry = allRows[i].map(function(e) { return e.value })
        //     rowEntry.unshift(t, null);

        //     data.addRow(rowEntry);
        //   }

          var suffix;

          // vAxis set to only have values on negative graphs
          if (scope.type === 'interfaces.snr' ) {
            suffix = 'dB';
            opts.vAxis = {};
          } else if (scope.type === 'noise' || scope.type === 'signal') {
            suffix = 'dBm';
            opts.vAxis = {
              minValue: -100,
              maxValue: 0
            };
          } else if (scope.type === 'quality') {
            suffix = '%';
            opts.vAxis = {};
          }

        //   var date_formatter = new window.google.visualization.DateFormat({
        //     pattern: gettextCatalog.getString('MMM dd, yyyy hh:mm:ss a')
        //   });
        //   date_formatter.format(data,0);

        //   var formatter = new window.google.visualization.NumberFormat(
        //     {suffix: suffix, pattern: '0'}
        //   );

        //   for (i = 0; i < data.getNumberOfColumns(); i++){
        //     formatter.format(data,i);
        //   }

        if (a === undefined) {
          data = new window.google.visualization.DataTable();
          data.addColumn('datetime', gettextCatalog.getString('Date'));
          data.addColumn('number', 'dummySeries');
          // if (scope.type === 'device_tx' || scope.type === 'tx' || scope.type === 'usage') {
          //   len = json.inbound.length;
          // data.addColumn('number', gettextCatalog.getString('Inbound'));
          // if (json.multi) {
          //   data.addColumn('number', gettextCatalog.getString('Outbound'));
          // }

          // var s1 = json.data[0].data;
          // var s2 = json.data[1].data;

          // for(var i = 0; i < json.data[0].data.length; i++) {
          //   time = new Date(s1[i].timestamp*1000);
          //   var inbound = (s1[i].value / (1000*1000)) * 8;
          //   var outbound = (s2[i].value / (1000*1000)) * -8;
          //   data.addRow([time, null, inbound, outbound]);
          // }
          //

          for(var i = 0; i < json.data.length; i++) {
            var name;
            for (var j = 0; j < json.meta.length; j++) {
              if (json.meta[j].interface === json.data[i].tags.interface) {
                name = json.meta[j].ssid;
                break;
              }
              if (name === undefined) {
                name = 'N/A';
              }
            }
            data.addColumn('number', name);
          }

          for(var i = 0; i < json.data[0].data.length; i++) {
            var time;
            var a = [];
            time = new Date(json.data[0].data[i].timestamp*1000);

            a.push(time)
            a.push(null)

            for(var j = 0; j < json.data.length; j++) {
              var val = (json.data[j].data[i].value);

              // Temp hack to fix broken data
              if (scope.type === 'interfaces.snr' && val >= 95 ) {
                val = 0;
              }
              a.push(val);
            }

            // time = new Date([i].timestamp*1000);
            // console.log(time)
            // var inbound = (s1[i].value / (1000*1000)) * 8;
            // var outbound = (s2[i].value / (1000*1000)) * -8;
            data.addRow(a);
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
          c = new window.google.visualization.LineChart(document.getElementById('snr-chart'));
          c.draw(data, opts);
          scope.noData = undefined;
          scope.loading = undefined;
        // } else {
        //   scope.noData = true;
        //   scope.loading = undefined;
        // }
      };
      window.google.charts.setOnLoadCallback(drawChartCallback);
    }

    chart();
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

app.directive('locationChart', ['Report', '$routeParams', '$timeout', '$location', 'gettextCatalog', 'ClientDetails', function(Report, $routeParams, $timeout, $location, gettextCatalog, ClientDetails) {

  var link = function(scope,element,attrs,controller) {

    // Can be removed when we migrate everything to v4 //
    ClientDetails.client.version = '3';
    ClientDetails.client.ap_mac = undefined;

    scope.type = $routeParams.type || 'client.uniques';
    var c, timer, data;
    var json = {};
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
      } else if (scope.type === 'client.uniques') {
        ClientDetails.client.version = '4';
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

    var maxDate = moment().utc().endOf('day').toDate();
    var minDate = moment().utc().subtract(7, 'days').startOf('day').toDate();

    var minDateEpoch = Math.floor(minDate.getTime() / 1000);
    var maxDateEpoch = Math.floor(maxDate.getTime() / 1000);

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
        interval: scope.interval,
        fill: '0',
        start_time: minDateEpoch,
        end_time: maxDateEpoch
      };

      controller.getStats(params).then(function(res) {

        if (res && (res.timeline && res.timeline.stats) || res.v === 2) {
          // Depreciate this when we've moved all to v4 //
          if (res.v === 2) {
            var array = [];
            for (var i in res.data) {
              var stats = {};
              stats.count = res.data[i].value;
              stats.time = res.data[i].timestamp / 1000;
              array.push(stats);
            }
            json = {
              timeline: {
                stats: array
              },
              _stats: {
                start: res.start_time
              }
            };
          } else {
            json = res;
          }
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
      var max = moment().utc().startOf('day').toDate();

      $timeout.cancel(timer);
      var drawChartCallback = function() {
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

        var format = gettextCatalog.getString('MMM dd, yyyy');
        var date_formatter = new window.google.visualization.DateFormat({
          pattern: gettextCatalog.getString(format)
        });
        date_formatter.format(data,0);

        // Formats the tooltips but not the gridline //
        // var formatter = new window.google.visualization.DateFormat({pattern: format, timeZone: +0});
        // formatter.format(data, 0);

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
          format:  format,
          viewWindow: {
            // min: minDate,
            max: max
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
      };
      window.google.charts.setOnLoadCallback(drawChartCallback);
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
      } else if (scope.type === 'client.uniques') {
        scope.title = gettextCatalog.getString('Wireless Clients');
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
