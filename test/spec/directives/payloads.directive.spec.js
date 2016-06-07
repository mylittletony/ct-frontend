'use strict';

describe('payloads deletion', function () {

  var $scope,
      element,
      deferred,
      q,
      location,
      payloadFactory;

  beforeEach(module('myApp', function($provide) {
    payloadFactory = {
      destroy: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    };
    $provide.value("Payload", payloadFactory);

  }));

  beforeEach(inject(function($compile, $rootScope, $q, $location) {
    $scope = $rootScope;
    q = $q;
    location = $location;
  }))

  describe("payload delete", function() {

    beforeEach(inject(function($compile, $rootScope, $q) {
      $scope.payloads = [{a:123}]
      $scope.payload = {
        id: 123
      };
      $scope.box = {
        slug: 123
      };
      element = angular.element('<div box=\'{{box.slug}}\' payload-delete><p>RS</p></div>');
      $compile(element)($rootScope)
    }))

    it("should successfully delete a payload", function() {
      spyOn(window, 'confirm').andReturn(true);
      spyOn(payloadFactory, 'destroy').andCallThrough()
      expect($scope.payloads.length).toBe(1);
      element.find('p').click();
      deferred.resolve({slug: 123, is_monitored: true});
      $scope.$apply()
      expect(payloadFactory.destroy).toHaveBeenCalled();
      expect($scope.payloads.length).toBe(0);
    })

    it("should not delete a payload", function() {
      spyOn(window, 'confirm').andReturn(true);
      spyOn(payloadFactory, 'destroy').andCallThrough()
      expect($scope.payloads.length).toBe(1);
      element.find('p').click();
      deferred.reject({data: { errors: "error"}});
      $scope.$apply()
      expect(payloadFactory.destroy).toHaveBeenCalled();
      expect($scope.payloads.length).toBe(1);
      expect($scope.errors.base).toBe("There was a problem deleting the payload.");
    })

    it("should not confirm the dialog to delete payload", function() {
      spyOn(window, 'confirm').andReturn(false);
      spyOn(payloadFactory, 'destroy').andCallThrough()
      element.find('p').click();
      expect($scope.payloads.length).toBe(1);
    })

  })
})

describe('bulk payload create', function () {

  var $scope,
      element,
      deferred,
      q,
      location,
      payloadFactory;

  beforeEach(module('myApp', function($provide) {
    payloadFactory = {
      create: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    };
    $provide.value("Payload", payloadFactory);

  }));

  beforeEach(inject(function($compile, $rootScope, $q, $location) {
    $scope = $rootScope;
    q = $q;
    location = $location;
  }))

})

describe('payload creation', function () {

  var $scope,
      element,
      deferred,
      q,
      location,
      $httpBackend,
      payloadFactory,
      commandFactory;

  beforeEach(module('myApp', function($provide) {
    payloadFactory = {
      create: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    },
    commandFactory = {
      query: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    };
    $provide.value("Payload", payloadFactory);
    $provide.value("Command", commandFactory);
  }));

  beforeEach(module('components/boxes/payloads/_bulk.html'));

  beforeEach(inject(function($compile, $rootScope, $q, $location, _$httpBackend_, $injector) {

    $httpBackend = _$httpBackend_;
    $httpBackend = $injector.get('$httpBackend');

    $httpBackend.when('GET', 'http://127.0.0.1:8080/api/v1/commands')
      .respond(200, [{}]);

    $scope = $rootScope;
    q = $q;
    location = $location;
  }))


  describe("single payload create", function() {

    beforeEach(inject(function($compile, $rootScope, $q) {
      $scope.commands = [{a:123}]
      $scope.command = {
        id: 123
      };
      $scope.box = {
        slug: 123
      };
      $scope.commands = [{
        unique_id: 123456,
        description: 'Reboot'
      }]
      element = angular.element('<run-payload></run-payload>');
      $compile(element)($rootScope)
    }))

    xit("should successfully run and save a payload", function() {
      spyOn(payloadFactory, 'create').andCallThrough()

      // Selects payload from the list //
      var cont = element.find('#commands').controller('ngModel');
      cont.$setViewValue("123456");

      // Saves output via checkbox //
      var checkbox = element.find(':checkbox').controller('ngModel');
      checkbox.$setViewValue(true);
      expect($scope.command.selected).toBe("123456")
      expect($scope.command.save).toBe(true)

      // Runs the payload on CT //
      element.find("p").click()
      expect($scope.command.processing).toBe(true)
      deferred.resolve({slug: 123, is_monitored: true});
      $scope.$apply()

      // Expectations //
      expect(payloadFactory.create).toHaveBeenCalled();
      expect($scope.box.success).toBe(true)
    })
  })

  describe("bulk payload create", function() {

    beforeEach(inject(function($compile, $rootScope, $q)  {

      $scope.status = {};
      // $scope.commands = [{a:123}]
      // $scope.command = {
      //   id: 123
      // };
      $scope.box = {
        slug: 123
      };
      // $scope.commands = [{
      //   unique_id: 123456,
      //   description: 'Reboot'
      // }]
      $scope.boxes = [
        { slug: 123 },
        { slug: 456, selected: true },
        { slug: 789, selected: true }
      ];
      element = angular.element('<run-bulk-payload></run-bulk-payload>');
      $compile(element)($rootScope);
    }));

    // it("should successfully add a button to the page to run a bulk update, mother fucker", function() {
    //   var command = { id: 123 };
    //   spyOn(commandFactory, 'query').andCallThrough();
    //   expect(element.html()).toBe('');
    //   $scope.$apply();

    //   // Has now select a box to run pl on //
    //   expect(element.html()).not.toBe('');
    //   expect($scope.selection.length).toBe(2);

    //   // CLick the Button To Run it //
    //   expect(commandFactory.query).not.toHaveBeenCalled();
    //   expect($scope.status.processing).toBe(undefined);
    //   expect(element.find('#bulk-payloads').hasClass('ng-hide')).toBe(true);

    //   element.find('#list-payloads').click();
    //   expect($scope.loading_commands).toBe(true);
    //   expect($scope.command === undefined).toBe(false);
    //   expect($scope.payload === undefined).toBe(false);
    //   expect($scope.status === undefined).toBe(false);
    //   expect($scope.payloads === undefined).toBe(false);
    //   deferred.resolve([command]);
    //   $scope.$apply();
    //   expect(commandFactory.query).toHaveBeenCalled();
    //   expect($scope.status.processing).toBe(true);
    //   expect(element.find('#bulk-payloads').hasClass('ng-hide')).toBe(false);
    //   expect($scope.commands[0]).toBe(command);
    //   expect($scope.loading_commands).toBe(undefined);

    //   // Actually running the cmd //
    //   expect(element.find('#run-payload').hasClass('ng-hide')).toBe(true);
    //   $scope.command.selected = 1;
    //   $scope.$apply();
    //   expect(element.find('#run-payload').hasClass('ng-hide')).toBe(false);
    //   element.find('#run-payload').click();
    //   expect($scope.status.processing).toBe(undefined);
    //   expect($scope.command.processing).toBe(true);

    //   // Now actually run command //
    //   deferred.resolve();
    //   $scope.$apply();
    //   expect($scope.command.processing).toBe(undefined);
    //   expect($scope.command.completed).toBe(true);
    //   expect($scope.notifications).toBe('Payload Queued Successfully.');

    // });

    // it("should cancel running a payload", function() {
    //   $scope.$apply();

    //   $scope.status = {processing: true};
    //   $scope.command = {processing: true};
    //   $scope.selection = [];
    //   $scope.selection.push({a:123});

    //   $scope.cancel();
    //   $scope.$apply();

    //   expect($scope.status.processing).toBe(undefined);
    //   expect($scope.command.processing).toBe(undefined);
    //   expect($scope.selection.length).toBe(0);

    // });
  });
});

