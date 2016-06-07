'use strict';

describe('heartbeats filters', function () {

  beforeEach(module('myApp'));
  var $filter;

  describe('online offline', function () {

    beforeEach(inject(function($injector) {
      inject(function (_$filter_) {
        $filter = $injector.get('$filter')('heartbeatOnline');
      });
    }))

    it('should convert true to online', function() {
      expect($filter('true')).toBe('Online');
    });

    it('should convert false to online', function() {
      expect($filter('false')).toBe('Offline');
    });

  });

  describe('disconnect reason', function () {

    beforeEach(inject(function($injector) {
      inject(function (_$filter_) {
        $filter = $injector.get('$filter')('disconnectReason');
      });
    }))

    it('should say box lost connection', function() {
      expect($filter('connectivity')).toBe('Lost Connection');
    });

    it('should say box lost power', function() {
      expect($filter('power')).toBe('Lost Power');
    });

    it('should say unknown', function() {
      expect($filter('')).toBe('Unknown');
    });

  });

});
