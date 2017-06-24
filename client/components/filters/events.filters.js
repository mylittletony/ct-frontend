'use strict';

/* Filters */

var app = angular.module('myApp.events.filters', []);

app.filter('eventLevel', ['gettextCatalog', function(gettextCatalog) {
  return function(input, cmd) {
    switch(input) {
      case 0:
        return gettextCatalog.getString("Debug");
      case 1:
        return gettextCatalog.getString("Info");
      case 2:
        return gettextCatalog.getString("Alert");
    }
  };
}]);

app.filter('translateEventObj', ['gettextCatalog', function(gettextCatalog) {
  return function(input) {
    if ( input === undefined || input === null || input === '') {
      return gettextCatalog.getString('N/A');
    } else {
      switch(input) {
        case 'box':
          return gettextCatalog.getString('Box');
        case 'zone':
          return gettextCatalog.getString('Zone');
        case 'client':
          return gettextCatalog.getString('Client');
        case 'action':
          return gettextCatalog.getString('Actions');
        case 'email':
          return gettextCatalog.getString('Email');
        case 'trigger':
          return gettextCatalog.getString('Trigger');
        case 'voucher':
          return gettextCatalog.getString('Voucher');
        case 'guest':
          return gettextCatalog.getString('Guest');
        case 'location':
          return gettextCatalog.getString('Location');
        case 'network':
          return gettextCatalog.getString('Network');
        case 'rogue':
          return gettextCatalog.getString('Rogue');
        case 'splash':
          return gettextCatalog.getString('Splash');
        case 'store':
          return gettextCatalog.getString('Store');
        case 'social':
          return gettextCatalog.getString('Social');
        case 'user':
          return gettextCatalog.getString('User');
        case 'projects':
          return gettextCatalog.getString('Projects');
        case 'project_user':
          return gettextCatalog.getString('Project Users');
        default:
          return input;
      }
    }
  };
}]);

app.filter('eventSummary', [function() {
  return function(input,type) {

    if (input === undefined || input === '') {
      return 'Unknown';
    }

    var action = 'unknown';
    var x = type.split('.');
    if (x.length === 2) {
      action = x[1];
    }

    switch(action) {
      case 'upgrade_failed':
        action = 'Failed upgrade for';
        break;
      case 'run':
        action = 'Inbound action trigger';
        break;
      case 'purchase':
        action = 'Purchased voucher at';
        break;
      case 'upgrade_success':
        action = 'Completed upgrade for';
        break;
      case 'upgrade':
        action = 'Upgraded';
        break;
      case 'update':
        action = 'Updated';
        break;
      case 'create':
        action = 'Created';
        break;
      case 'destroy':
        action = 'Deleted';
        break;
      case 'resync':
        action = 'Re-synced';
        break;
      case 'reboot':
        action = 'Rebooted';
        break;
      case 'password':
        action = 'Password changed for';
        break;
      case 'reset':
        action = 'Reset';
        break;
      case 'invite':
        action = 'Invited';
        break;
      case 'revoke':
        action = 'Revoked';
        break;
      case 'enable':
        action = 'Enabled';
        break;
      case 'disable':
        action = 'Disabled';
        break;
    }

    var msg = action + ' ' + input;
    return msg;
  };
}]);
