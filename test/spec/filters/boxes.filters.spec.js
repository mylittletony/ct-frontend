'use strict';

describe('heartbeats filters', function () {

  beforeEach(module('myApp'));
  var $filter;

  describe('client data transfer filters', function () {

    beforeEach(inject(function($injector) {
      inject(function (_$filter_) {
        $filter = $injector.get('$filter')('clientDataDownload');
      });
    }))

    it('should convert true to online', function() {
      expect($filter('36302156/0')).toBe(34.62043380737305);
    });

  });

  describe('client data upload filters', function () {

    beforeEach(inject(function($injector) {
      inject(function (_$filter_) {
        $filter = $injector.get('$filter')('clientDataUpload');
      });
    }))

    it('should convert true to online', function() {
      expect($filter('1/386302156')).toBe(368.40644454956055);
    });

  });

  describe('client data human data formatting', function () {

    beforeEach(inject(function($injector) {
      inject(function (_$filter_) {
        $filter = $injector.get('$filter')('humanData');
      });
    }))

    it('should convert true to online', function() {
      expect($filter('368.123123')).toBe('368 Bytes');
      expect($filter(368*1024)).toBe('377 KB');
      expect($filter(368*1024*1024)).toBe('386 MB');
    });

  });

});
