'use strict';

describe('heartbeats filters', function () {

  beforeEach(module('myApp'));
  var $filter;

  describe('client data transfer filters', function () {

    beforeEach(inject(function($injector) {
      inject(function (_$filter_) {
        $filter = $injector.get('$filter')('truncate');
      });
    }))

    it('should truncate without length', function() {
      expect($filter('simon has a long location name')).toBe('simon h...');
    });

    it('should truncate with a length', function() {
      expect($filter('simon has a long location name', 25)).toBe('simon has a long locat...');
    });

    it('should truncate with a over length', function() {
      expect($filter('simon has a long location name', 205)).toBe('simon has a long location name');
    });

  });

});
