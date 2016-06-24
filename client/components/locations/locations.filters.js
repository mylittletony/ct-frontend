'use strict';

/* Filters */

var app = angular.module('myApp.locations.filters', []);

app.filter('humanData', function() {
  return function(bytes, precision) {
    if(bytes === 0 || bytes === '' || bytes === undefined || bytes === null) {
      return '0 Bytes';
    } else {
      var k = 1000;
      var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
      var i = Math.floor(Math.log(bytes) / Math.log(k));
      return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
    }
  };
});

app.filter('sentenceCase', function() {
  return function(input) {
    input = input || '';
    return input.charAt(0).toUpperCase() + input.slice(1);
  };
});

app.filter('titleCase', function() {
  return function(input) {
    if ( typeof input === 'string' ) {
      input = input || '';
      return input.replace(/_/g, ' ').replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
    } else {
      return input;
    }
  };
});

app.filter('uppercase', function() {
  return function(input) {
    input = input || '';
    return input.toUpperCase();
  };
});

app.filter('lowercase', function() {
  return function(input) {
    input = input || '';
    return input.toLowerCase();
  };
});

app.filter('mbps', function() {
  return function(bytes, precision) {
    if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) {
      return '-';
    }
    if (bytes === 0) {
      return '0 Mbps';
    }
    if (typeof precision === 'undefined') {
      precision = 1;
    }
    var units = ['Kbps', 'Mbps', 'Gbps', 'Tbps'],
      number = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) +  '' + units[number];
  };
});

app.filter('bitsToBytes', function() {
  return function(bits, precision) {
    if (isNaN(parseFloat(bits)) || !isFinite(bits)) {
      return '-';
    }
    if (bits === 0) {
      return '0 Mbps';
    }
    if (typeof precision === 'undefined') {
      precision = 1;
    }
    var i = Math.floor( Math.log(bits) / Math.log(1000) );
    return ( bits / Math.pow(1000, i) ).toFixed(2) * 1 + ' ' + ['b/s', 'Kb/s', 'Mb/s', 'Gb/s', 'Tb/s'][i];
  };
});

app.filter('humanTime', ['$window', function(window) {
  return function(input) {
    if ( input === undefined || input === null) {
      return 'N/A';
    } else {
      return window.moment.utc(input*1000).format('MMMM Do YYYY, h:mm:ss a');
    }
  };
}]);

app.filter('mysqlTime', ['$window', function(window) {
  return function(input) {
    if ( input === undefined || input === null) {
      return 'N/A';
    } else {
      return window.moment(input).format('MMM Do, HH:mm:ss');
    }
  };
}]);

app.filter('humanTimeShort', [function() {
  return function(input) {
    if ( input === undefined || input === null) {
      return 'N/A';
    } else {
      return window.moment.utc(input*1000).format('MMM Do, H:mm:ss');
    }
  };
}]);

app.filter('humanTimeShortest', [function() {
  return function(input) {
    if ( input === undefined || input === null) {
      return 'N/A';
    } else {
      return window.moment.utc(input*1000).format('MMMM D, H:mm:ss');
    }
  };
}]);

app.filter('humanised', ['$window', function(window) {
    return function(input) {
      if ( input === undefined || input === null) {
        return '-';
      } else {
        var d = '';
        if (input < 60) {
          d = 's';
        }
        // return window.moment.duration(input, 'seconds').format('hh:mm:ss');
        return window.moment.duration(input, 'seconds').format('HH:mm:ss') + d;
      }
    };
}]);

app.filter('lastSeen', [function() {
  return function(input) {
    if ( input === undefined || input === null) {
      return 'N/A';
    } else {
      return window.moment.utc(input*1000).format('MMM Do h:mm:ssa');
    }
  };
}]);

app.filter('humanBoolean', ['$window', function(window) {
  return function(input) {
    if ( input === undefined || input === null) {
      return 'N/A';
    } else {
      if ( input === true ) {
        return 'enabled';
      } else {
        return 'disabled';
      }
    }
  };
}]);

app.filter('updateCreate', ['$window', function(window) {
  return function(input) {
    if ( input === undefined || input === null || input === '') {
      return 'Create';
    } else {
      return 'Update';
    }
  };
}]);

app.filter('emptyFilter', ['$window', function(window) {
  return function(input) {
    if ( input === undefined || input === null || input === '') {
      return 'N/A';
    } else {
      return input; 
    }
  };
}]);
