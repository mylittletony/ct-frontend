'use strict';

describe('Commands', function () {

  var $scope,
      element,
      deferred,
      q,
      location,
      commandFactory;

  beforeEach(module('myApp', function($provide) {
    commandFactory = {
      create: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      query: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    };
    $provide.value("Command", commandFactory);

  }));

  beforeEach(inject(function($compile, $rootScope, $q, $location) {
    $scope = $rootScope;
    q = $q;
    location = $location;
  }))

  describe("command list, in selection box", function() {

    beforeEach(inject(function($compile, $rootScope, $q) {
      $scope.loading_commands = true;
      $scope.commands = [{
        unique_id: 123456,
        description: 'Reboot'
      }];
      element = angular.element('<command-select commands=\'commands\'></command-select>');
      $compile(element)($rootScope)
      $scope.$digest();
    }))

    it("should successfully delete a command", function() {
      spyOn(commandFactory, 'query').andCallThrough()
      var cont = element.find('#commands').controller('ngModel');

      deferred.resolve(element.isolateScope().commands);
      $scope.$digest();
      expect(element.isolateScope().commands).toBe(element.isolateScope().commands)

      cont.$setViewValue("123456");
      expect(element.isolateScope().command.selected).toBe("123456")
    })

  })
})
