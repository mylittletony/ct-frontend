'use strict';

describe('port_forwards form', function () {

  var $scope,
      element,
      deferred,
      q,
      location,
      $httpBackend,
      portForwardFactory;

  beforeEach(module('myApp', function($provide) {
    portForwardFactory = {
      update: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    };
    $provide.value("PortForward", portForwardFactory);

  }));

  beforeEach(module('components/boxes/port_forwards/form.html')); // The external template file referenced by templateUrl
  beforeEach(module('components/layouts/submit.html')); // The external template file referenced by templateUrl

  beforeEach(inject(function($compile, $rootScope, $q, $location) {
    $scope = $rootScope;
    q = $q;
    location = $location;
  }))

  describe("port_forward delete", function() {

    beforeEach(inject(function($compile, $rootScope, $q, $injector) {
      $scope.myForm = {};
      $scope.port_forwards = [{a:123}]
      $scope.port_forward = {
        id: 123
      };
      $scope.box = {
        slug: 123
      };

      element = angular.element('<div port-forward-form></div>');
      $compile(element)($rootScope)
      element.scope().$apply();
    }))


    // xit("should add another port_forward to the form / array", function() {
    //   expect($scope.port_forwards.length).toBe(1);
    //   element.find('#add_rule').click();
    //   expect($scope.port_forwards.length).toBe(2);
    // })

    // xit("should remove a port_forward rule from the form / array", function() {
    //   expect($scope.port_forwards.length).toBe(1);
    //   element.find('#remove-rule').click();
    //   expect($scope.port_forwards.length).toBe(1);
    //   expect($scope.port_forwards[0]._destroy).toBe ('1')
    //   expect($scope.myForm.$pristine).toBe (false);
    // })

    it("should ensure the fields are validated", function() {
      spyOn(portForwardFactory, 'update').andCallThrough()
      expect($scope.port_forwards.length).toBe(1);
      expect($scope.myForm.$pristine).toBe (true);

      // Invalid elements //
      element.find('#update').click();
      expect(portForwardFactory.update).not.toHaveBeenCalled();

      // Valid shit //
      $scope.myForm.errors = 123; // So we know it's cleared //
      var cont = element.find('input[name*="source"]').controller('ngModel');
      cont.$setViewValue("10.12.13.14/8");
      var cont = element.find('input[name*="forward_to_ip"]').controller('ngModel');
      cont.$setViewValue("10.12.13.14");
      var cont = element.find('input[name*="forward_to_port"]').controller('ngModel');
      cont.$setViewValue("10");
      var cont = element.find('input[name*="destination_port"]').controller('ngModel');
      cont.$setViewValue("10");

      $scope.$apply(); // <-- This will resolve the promise created above

      expect($scope.myForm.$pristine).toBe (false);
      expect($scope.myForm.$invalid).toBe (false);
    })

    it("should submit the form successfully", function() {
      spyOn(portForwardFactory, 'update').andCallThrough()
      expect($scope.port_forwards.length).toBe(1);

      var pf = $scope.port_forwards[0]
      pf.source = "10.1.1.1/24"
      pf.forward_to_port = 10
      pf.destination_port = 10
      pf.forward_to_ip = '1.2.3.4'
      $scope.myForm.$pristine = false

      $scope.$apply()

      expect($scope.myForm.$pristine).toBe (false);
      expect($scope.myForm.$invalid).toBe (false);

      element.find('#update').click();
      expect(portForwardFactory.update).toHaveBeenCalled();
      deferred.resolve({data: {errors: { base: [123]}}});
      $scope.$apply()

      expect($scope.box.port_forwards_attributes).toBe ($scope.port_forwards)
      expect($scope.myForm.success).toBe (true)
      expect($scope.myForm.errors).toBe (undefined)
      expect($scope.myForm.updating).toBe (undefined)

    })

    it("should submit the form UNsuccessfully CT 422", function() {
      spyOn(portForwardFactory, 'update').andCallThrough()
      expect($scope.port_forwards.length).toBe(1);

      var pf = $scope.port_forwards[0]
      pf.source = "10.1.1.1/24"
      pf.forward_to_port = 10
      pf.destination_port = 10
      pf.forward_to_ip = '1.2.3.4'
      $scope.myForm.$pristine = false

      $scope.$apply()

      expect($scope.myForm.$pristine).toBe (false);
      expect($scope.myForm.$invalid).toBe (false);

      element.find('#update').click();
      expect(portForwardFactory.update).toHaveBeenCalled();
      deferred.reject({data: {errors: { base: [123]}}});
      $scope.$apply()
      expect($scope.box.port_forwards_attributes).toBe ($scope.port_forwards)
      expect($scope.myForm.success).toBe (undefined)
      expect(JSON.stringify($scope.myForm.errors)).toBe (JSON.stringify({ base : [ 123 ] }))
    })

  })

})

