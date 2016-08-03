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

app.filter('humanDate', ['$window', 'gettextCatalog', function(window, gettextCatalog) {
  return function(input) {
    if ( input === undefined || input === null) {
      return gettextCatalog.getString('N/A');
    } else {
      return window.moment.unix(input).format('MMMM Do YYYY');
    }
  };
}]);

app.filter('humanTime', ['$window', 'gettextCatalog', function(window, gettextCatalog) {
  return function(input) {
    if ( input === undefined || input === null) {
      return gettextCatalog.getString('N/A');
    } else {
      return window.moment.unix(input).format('MMMM Do YYYY, h:mm:ss a');
    }
  };
}]);

app.filter('mysqlTime', ['$window', 'gettextCatalog', function(window, gettextCatalog) {
  return function(input) {
    if ( input === undefined || input === null) {
      return gettextCatalog.getString('N/A');
    } else {
      return window.moment(input).format('MMM Do, HH:mm:ss');
    }
  };
}]);

app.filter('humanTimeShort', ['gettextCatalog', function(gettextCatalog) {
  return function(input) {
    if ( input === undefined || input === null) {
      return gettextCatalog.getString('N/A');
    } else {
      var time = moment.unix(input).format('MMM Do, H:mm:ss');
      return time;
    }
  };
}]);

app.filter('humanTimeShortest', ['gettextCatalog', function(gettextCatalog) {
  return function(input) {
    if ( input === undefined || input === null) {
      return gettextCatalog.getString('N/A');
    } else {
      return window.moment.unix(input).format('MMMM D, H:mm:ss');
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

app.filter('lastSeen', ['gettextCatalog', function(gettextCatalog) {
  return function(input) {
    if ( input === undefined || input === null) {
      return gettextCatalog.getString('N/A');
    } else {
      return window.moment.unix(input).format('MMM Do h:mm:ssa');
      // return window.moment.utc(input*1000).format('MMM Do h:mm:ssa');
    }
  };
}]);

app.filter('humanBoolean', ['$window', 'gettextCatalog', function(window, gettextCatalog) {
  return function(input) {
    if ( input === undefined || input === null) {
      return gettextCatalog.getString('N/A');
    } else {
      if ( input === true ) {
        return gettextCatalog.getString('Enabled');
      } else {
        return gettextCatalog.getString('Disabled');
      }
    }
  };
}]);

app.filter('booleanToggle', ['$window', 'gettextCatalog', function(window, gettextCatalog) {
  return function(input) {
    if ( input === undefined || input === null) {
      return gettextCatalog.getString('N/A');
    } else {
      if ( input === true ) {
        return gettextCatalog.getString('Enable');
      } else {
        return gettextCatalog.getString('Disable');
      }
    }
  };
}]);

app.filter('updateCreate', ['$window', 'gettextCatalog', function(window, gettextCatalog) {
  return function(input) {
    if ( input === undefined || input === null || input === '') {
      return gettextCatalog.getString('Create');
    } else {
      return gettextCatalog.getString('Update');
    }
  };
}]);

app.filter('emptyFilter', ['$window', 'gettextCatalog', function(window, gettextCatalog) {
  return function(input) {
    if ( input === undefined || input === null || input === '') {
      return gettextCatalog.getString('N/A');
    } else {
      return input;
    }
  };
}]);

app.filter('splashStatus', ['$window', 'gettextCatalog', function(window, gettextCatalog) {
  return function(online,status) {
    if ( online ) {
      if ( status == 'dnat' ) {
        return gettextCatalog.getString('Not logged in');
      } else {
        return gettextCatalog.getString('Online');
      }
    } else {
      return gettextCatalog.getString('Offline');
    }
  };
}]);

app.filter('roleFilter', ['gettextCatalog', function(gettextCatalog) {
  return function(input) {
    if ( input === undefined || input === null || input === '') {
      return gettextCatalog.getString('N/A');
    } else {
      input = input.toString();
      switch(input) {
        case '100':
          return gettextCatalog.getString('Owner');
        case '110':
          return gettextCatalog.getString('Administrator');
        case '120':
          return gettextCatalog.getString('Editor');
        case '130':
          return gettextCatalog.getString('Supporter');
        case '140':
          return gettextCatalog.getString('Observer');
        case '200':
          return gettextCatalog.getString('Brand Owner');
        case '201':
          return gettextCatalog.getString('Member');
        case '205':
          return gettextCatalog.getString('Brand Ambassador');
        case '210':
          return gettextCatalog.getString('Brand Super');
        default:
          return gettextCatalog.getString('N/A');
      }
    }
  };
}]);

app.filter('policyType', ['gettextCatalog', function(gettextCatalog) {
  return function(input) {
    if ( input !== '' ) {
      switch(input) {
        case 'layer2':
          return gettextCatalog.getString('WiFi');
        case 'layer3':
          return gettextCatalog.getString('Firewall');
        case 'splash':
          return gettextCatalog.getString('Splash');
      }
    } else {
      return input;
    }
  };
}]);

app.filter('toString', [function() {
  return function(input) {
    if ( input !== '' ) {
      return input.join(', ');
    } else {
      return input;
    }
  };
}]);
