describe('Locations', function() {

  describe('New Location view', function() {

    beforeEach(function() {
      // browser.get('components/locations/new/index.html');
    });

    it('should create "phones" model with 3 phones', function() {
      var scope = {},
        ctrl = new LocationsCtrlNew(scope);

      expect(scope.phones.length).toBe(3);
    });

  });

});

