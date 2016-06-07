'use strict';

describe('box icons', function () {

  var $scope;
  var element;

  beforeEach(module('myApp'));

  beforeEach(inject(function($compile, $rootScope) {
    $scope = $rootScope;
    element = angular.element("<box-icon></box-icon>");
    $compile(element)($rootScope);
  }));

});

describe('box labels', function () {

  var $scope;
  var element;

  beforeEach(module('myApp'));

  beforeEach(inject(function($compile, $rootScope) {
    $scope = $rootScope;
    $scope.box = {};
    element = angular.element("<span box-status-label='online'></span>");
    $compile(element)($rootScope);
    element.scope().$apply();
  }));

  it("should add the relevant css label to the box", function() {
    expect(element.hasClass('success')).toBe(true);
  });

});

describe('box heartbeat text colour', function () {

  var $scope;
  var element;
  var compile;

  beforeEach(module('myApp'));

  beforeEach(inject(function($compile, $rootScope) {
    $scope = $rootScope;
    $scope.box = {}
    compile = $compile
  }))

  it("should add the relevant css label to the box", function() {
    element = angular.element("<span box-heartbeating='true'></span>");
    compile(element)($scope)
    element.scope().$apply();
    expect(element.hasClass('text-success')).toBe(true)
  });

  it("should add the relevant css label to the box", function() {
    element = angular.element("<span box-heartbeating='false'></span>");
    compile(element)($scope)
    element.scope().$apply();
    expect(element.hasClass('text-danger')).toBe(true)
  });

});

describe('box disconnect message', function () {

  var $scope;
  var element;
  var compile;

  beforeEach(module('myApp'));

  beforeEach(inject(function($compile, $rootScope) {
    $scope = $rootScope;
    $scope.box = {};
    compile = $compile;
  }));

  it("should add the right disconnect reason to the page, connecitivyt", function() {
    element = angular.element("<span box-disconnect='connectivity'></span>");
    compile(element)($scope);
    element.scope().$apply();
    expect(element.html()).toBe('Disconnect reason: <b>lost connectivity.</b>');
  });

  it("should add the right disconnect reason to the page, power", function() {
    element = angular.element("<span box-disconnect='power'></span>");
    compile(element)($scope);
    element.scope().$apply();
    expect(element.html()).toBe('Disconnect reason: <b>lost power.</b>');
  });
});

describe('box services, reboots, deletes, etc', function () {

  var $scope,
      element,
      deferred,
      q,
      location,
      locationFactory,
      payloadFactory,
      firmwareFactory,
      zoneFactory,
      networkFactory,
      clientFactory,
      intercomFactory,
      $location,
      routeParams,
      $timeout,
      boxFactory;

  beforeEach(module('components/boxes/new/_add.html'));

  beforeEach(module('myApp', function($provide) {
    locationFactory = {
      query: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      shortquery: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    };
    firmwareFactory = {
      query: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    },
    payloadFactory = {
      create: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    },
    boxFactory = {
      alerts: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      update: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      save: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      reset: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      reboot: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      transfer: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      destroy: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      status: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      detect: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
    };
    zoneFactory = {
      query: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      update: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    };
    networkFactory = {
      get: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    };
    clientFactory = {
      disconnect: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    };
    intercomFactory = {
      showNewMessage: function () {
        return 123;
      }
    };
    $provide.value("Box", boxFactory);
    $provide.value("Payload", payloadFactory);
    $provide.value("Firmware", firmwareFactory);
    $provide.value("Location", locationFactory);
    $provide.value("Client", clientFactory);
    $provide.value("Intercom", intercomFactory);
    $provide.value("Zone", zoneFactory);
    $provide.value("Network", networkFactory);

  }));

  beforeEach(inject(function($compile, $rootScope, $q, $location) {
    $scope = $rootScope;
    q = $q;
    location = $location;
  }));

  describe("should get the status of the box", function() {

    beforeEach(inject(function($compile, $rootScope, $q, _$location_, $routeParams) {
      $location = _$location_;
      $scope.box = {state: 'online'};
      element = angular.element("<box-status></box-status>");
      $compile(element)($rootScope);
      $scope.$digest();
    }));

    it("should return the status of the box", function() {
      spyOn(boxFactory, 'status').andCallThrough();

      // element.isolateScope().update();
      // expect(element.isolateScope().state).toBe('updating');

      var box = {state: 'online'}
      deferred.resolve(box);
      $scope.$digest();

      // expect(element.isolateScope().state).toBe('processing');
    });

  });

  describe("should resync the boxes", function() {

    beforeEach(inject(function($compile, $rootScope, $q, _$location_, $routeParams) {
      $location = _$location_;
      $scope.box = {state: 'online'};
      element = angular.element("<box-resync state='box.state'></box-resync>");
      $compile(element)($rootScope);
      $scope.$digest();
    }));

    it("should resync a box!", function() {
      spyOn(boxFactory, 'update').andCallThrough();
      spyOn(window, 'confirm').andReturn(true);

      element.isolateScope().resync();
      expect(element.isolateScope().state).toBe('updating');

      var box = {id: 123};
      deferred.resolve(box);
      $scope.$digest();

      expect(element.isolateScope().state).toBe('processing');
    });

    it("should NOT resync a box!", function() {
      spyOn(window, 'confirm').andReturn(true);
      spyOn(boxFactory, 'update').andCallThrough();

      element.isolateScope().resync();
      expect(element.isolateScope().state).toBe('updating');

      var box = {id: 123}
      deferred.reject(box);
      $scope.$digest();

      expect(element.isolateScope().state).toBe('failed');
    });
  });

  describe("adding a box v2", function() {

    beforeEach(inject(function($compile, $rootScope, $q, _$location_, $routeParams) {
      routeParams = $routeParams;
      routeParams.location_id = '123';
      $location = _$location_;
      element = angular.element("<add-box-wizard></add-box-wizard>");
      $compile(element)($scope);
    }));

    it("should select a box add type and move to stage 1", function() {
      $scope.$digest();
      element.isolateScope().setup.type = 'ct';
      expect(element.isolateScope().location.slug).toBe('123');
      expect(element.isolateScope().setup.stage).toBe(1);

      element.isolateScope().nextStage();
      expect(element.isolateScope().setup.stage).toBe(2);
      expect($location.search().type).toBe('ct');
      expect($location.search().stage).toBe(2);
      expect(element.isolateScope().setup.detecting).toBe(undefined);

      element.isolateScope().nextStage();
      expect(element.isolateScope().setup.stage).toBe(3);
      expect($location.search().type).toBe('ct');
      expect($location.search().stage).toBe(3);
    });


    it("should load page with params and be on ct, stage 2", function() {
      routeParams.stage = '2';
      routeParams.type = 'ct';
      $scope.$digest();
      expect(element.isolateScope().setup.stage).toBe(2);
      expect(element.isolateScope().setup.type).toBe('ct');
      expect(element.isolateScope().setup.detecting).toBe(undefined);
    });

    it("should load page with params and be on ct, stage 3.", function() {

      spyOn(boxFactory, 'detect').andCallThrough();
      spyOn(boxFactory, 'save').andCallThrough();

      var rogues = [{ type: 'AirRouter', mac: '123', existing: true}, { type: 'AirRouter', mac: '111', existing: false}]
      routeParams.stage = '3';
      routeParams.type = 'ct';
      $scope.$digest();

      expect(element.isolateScope().setup.stage).toBe(3);
      expect(element.isolateScope().setup.type).toBe('ct');
      expect(element.isolateScope().setup.detecting).toBe(true);
    });

    it("should load page with params and be on ct, stage 4. Then create the box and all is well.", function() {

      spyOn(boxFactory, 'detect').andCallThrough();
      spyOn(boxFactory, 'save').andCallThrough();

      var rogues = [{ type: 'AirRouter', mac: '123', existing: true}, { type: 'AirRouter', mac: '111', existing: false}]
      routeParams.stage = '4';
      routeParams.type = 'ct';
      $scope.$digest();

      expect(element.isolateScope().setup.stage).toBe(4);
      expect(element.isolateScope().setup.type).toBe('ct');
      // expect(element.isolateScope().setup.detecting).toBe(true);

      deferred.resolve(rogues);
      $scope.$digest();
      expect(element.isolateScope().setup.detecting).toBe(undefined);
      expect(element.isolateScope().rogues.length).toBe(1);
      expect(element.isolateScope().existing.length).toBe(1);
      expect(element.isolateScope().existing[0].mac).toBe('123');
      expect(element.isolateScope().rogues[0].mac).toBe('111');

      element.isolateScope().createBoxFromRogues();
      expect(element.isolateScope().box.discovery).toBe(true);
      expect(element.isolateScope().creating).toBe(true);

      var box = { slug: 'sluggy' };
      deferred.resolve(box);
      $scope.$digest();
      expect(element.isolateScope().creating).toBe(undefined);
      expect(element.isolateScope().created).toBe(true);
    });

    it("should load page with params and be on ct, stage 2 and add by mac", function() {
      $scope.$digest();

      spyOn(boxFactory, 'detect').andCallThrough();
      spyOn(boxFactory, 'save').andCallThrough();

      var mac = '12:22:11:22:33:44';
      var box = { mac: mac };
      element.isolateScope().addBoxOldFashion(box);
      expect(element.isolateScope().creating).toBe(true);
      expect(element.isolateScope().box.calledstationid).toBe(mac);
      expect(element.isolateScope().box.is_polkaspots).toBe(true);

      deferred.resolve(box);
      $scope.$digest();

      expect(element.isolateScope().creating).toBe(undefined);
      expect(element.isolateScope().created).toBe(true);
    });

    it("should add a box by mac and mark as non-ps - for meraki etc.", function() {
      $scope.$digest();
      var mac = '12:22:11:22:33:44';

      spyOn(boxFactory, 'detect').andCallThrough();
      spyOn(boxFactory, 'save').andCallThrough();

      var box = { mac: mac };
      element.isolateScope().setup = { type: 'third' };
      element.isolateScope().addBoxOldFashion(box);
      expect(element.isolateScope().creating).toBe(true);
      expect(element.isolateScope().box.calledstationid).toBe(mac);
      expect(element.isolateScope().box.is_polkaspots).toBe(false);

      deferred.resolve(box);
      $scope.$digest();

      expect(element.isolateScope().creating).toBe(undefined);
      expect(element.isolateScope().created).toBe(true);
    });

    it("should redirect to the box page", function() {
      $scope.$digest();
      element.isolateScope().showBox();
      expect($location.path()).toBe('/locations/123/boxes')
    });

  });

  describe("reboot", function() {

    beforeEach(inject(function($compile, $rootScope, $q) {
      $scope.box = {slug: 123}
      element = angular.element("<reboot box=\'box\'></reboot>");
      $compile(element)($rootScope);
    }));

    it("should successfully reboot the device from the directive", function() {
      spyOn(window, 'confirm').andReturn(true);
      element.isolateScope().box = { allowed_job: true };
      spyOn(boxFactory, 'reboot').andCallThrough();
      element.isolateScope().rebootBox();
      $scope.$digest();
      expect(element.isolateScope().box.state).toBe('rebooting');
      expect(element.isolateScope().box.processing).toBe(true);
      deferred.resolve({slug: 123});
      $scope.$digest();
      expect(boxFactory.reboot).toHaveBeenCalled();
      expect(element.isolateScope().box.processing).toBe(undefined);
      expect(element.isolateScope().box.state).toBe('rebooting');
    });

    it("should not reboot the device from the directive", function() {
      spyOn(window, 'confirm').andReturn(true);
      element.isolateScope().box = { allowed_job: true };
      spyOn(boxFactory, 'reboot').andCallThrough();
      element.isolateScope().rebootBox();
      $scope.$digest();
      deferred.reject({data: {errors: { base: [123]}}});
      $scope.$digest();
      expect(boxFactory.reboot).toHaveBeenCalled();
      expect(element.isolateScope().box.rebooted).toBe(undefined);
      expect(element.isolateScope().box.state).toBe('online');
    });

    it("should not reboot the device from the directive because can reboot is false", function() {
      spyOn(window, 'confirm').andReturn(true);
      element.isolateScope().box = { allowed_job: false, state: 'offline' };
      spyOn(boxFactory, 'reboot').andCallThrough();
      element.isolateScope().rebootBox();
      $scope.$digest();
      expect(element.isolateScope().box.rebooted).toBe(undefined);
      expect(element.isolateScope().box.state).toBe('offline');
    });

  });

  describe("alerts", function() {

    beforeEach(inject(function($compile, $rootScope, $q) {
      element = angular.element("<div box-alerts></div>");
      $compile(element)($rootScope)
      $scope.box = {is_monitored: false};
      $scope.status ={};
    }))

    it("should successfully enable the alerts from the directive", function() {
      expect($scope.box.is_monitored).toBe(false)
      spyOn(boxFactory, 'alerts').andCallThrough()
      var cont = element.find('input').controller('ngModel');
      cont.$setViewValue(true);
      expect($scope.box.alerts).toBe('enabling');
      // expect($scope.box.processing).toBe(true)
      deferred.resolve({slug: 123, is_monitored: true});
      $scope.$digest()
      expect($scope.status.processing).toBe(undefined)
      expect(boxFactory.alerts).toHaveBeenCalled();
      expect($scope.box.is_monitored).toBe(true)
      // expect($scope.box.processing).toBe(undefined)
      expect($scope.box.alerts).toBe('complete')
    })

    it("should not enable the alerts from the directive", function() {
      $scope.box.is_monitored = false;
      spyOn(boxFactory, 'alerts').andCallThrough()
      var cont = element.find('input').controller('ngModel');
      cont.$setViewValue(true);
      // expect($scope.box.processing).toBe(true)
      deferred.reject({data: {errors: { base: [123]}}});
      $scope.$digest()
      expect(boxFactory.alerts).toHaveBeenCalled();
      expect($scope.box.errors[0]).toBe(123)
      // expect($scope.box.processing).toBe(undefined)
    });

  });

  describe("reset", function() {

    beforeEach(inject(function($compile, $rootScope, $q) {
      $scope.status ={};
      $scope.box = {
        allowed_job: true,
        state: 'online'
      };
      element = angular.element("<div box-reset></div>");
      $compile(element)($rootScope)
      $scope.$digest()
    }))

    it("should successfully reset a box", function() {
      expect($scope.status.processing).toBe(undefined);
      spyOn(boxFactory, 'reset').andCallThrough()
      // expect(element.find('#confirm-reset').hasClass('ng-hide')).toBe(true);

      // element.find('#process-reset').click();
      // $scope.$digest()
      // expect($scope.box.resetting).toBe(true);
      // expect(element.find('#confirm-reset').hasClass('ng-hide')).toBe(false)
      // expect(element.find('#process-reset').hasClass('ng-hide')).toBe(true)

      // $scope.reset = 'reset';
      // $scope.$digest();
      // expect(element.find('#process-reset').hasClass('ng-hide')).toBe(false);

      // element.find('p').click();
      // $scope.$digest()

      // $scope.resetBox();
      // // expect($scope.box.state).toBe('online');
      // expect($scope.reset).toBe(undefined);
      // expect($scope.box.resetting).toBe(undefined);


      // deferred.resolve({slug: 123});
      // $scope.$digest()
      // expect(boxFactory.reset).toHaveBeenCalled();
      // expect($scope.box.state).toBe('resetting');
      // expect($scope.box.allowed_job).toBe(false);
    })

    it("should not reset a box", function() {
      // Annoying test //
      // spyOn(window, 'confirm').andReturn(true);
      // spyOn(boxFactory, 'reset').andCallThrough()

      // element.isolateScope().resetBox();
      // // element.find('p').click();
      // // $scope.$digest()

      // // $scope.reset = 'reset';
      // // $scope.$digest();

      // // element.find('p').click();
      // // $scope.$digest()

      // deferred.reject({data: {errors: { base: [123]}}});
      // $scope.$digest()
      // expect(boxFactory.reset).toHaveBeenCalled();
      // expect($scope.box.state).toBe('failed');
      // expect($scope.box.errors[0]).toBe(123);
    })

    it("should cancel a reset", function() {
      spyOn(boxFactory, 'reset').andCallThrough()

      $scope.box.allowed_job = false;
      $scope.reset = true;
      $scope.box.resetting = true;

      $scope.cancel();
      $scope.$digest();

      expect($scope.reset).toBe(undefined)
      expect($scope.box.resetting).toBe(undefined)
    })

    xit("should add the button to the page", function() {
      expect(element.html()).toBe('<p ng-show="box.allowed_job &amp;&amp; status.processing !== true" class="btn btn-danger" ng-click="resetBox()">Reset</p><p ng-show="!box.allowed_job || status.processing === true" ng-disabled="true" class="btn btn-danger">Reset</p>');
    });

  })

  describe("delete with confirmation dialog", function() {

    beforeEach(inject(function($compile, $rootScope, $q, $routeParams) {
      routeParams = $routeParams;
      routeParams.location_id = 123123;
      element = angular.element("<div box-delete-confirm></div>");
      $compile(element)($rootScope)
      $scope.status ={};
      $scope.box = {location_slug: 123123};
    }))

    it("should successfully delete a box", function() {
      spyOn(boxFactory, 'destroy').andCallThrough()

      // Button disabled //
      // expect(element.find('#delete')[0]).hasClass('ng-disabled').toBe('true')
      var cont = element.find('input').controller('ngModel');

      // Type delete //
      cont.$setViewValue('delete');
      expect($scope.box.delete_word).toBe('delete')

      // Delete box //
      element.find('#delete').click()
      expect($scope.box.processing).toBe(true);
      expect($scope.box.state).toBe('deleting');
      deferred.resolve({slug: 123});
      $scope.$digest()
      expect(boxFactory.destroy).toHaveBeenCalled();
      expect(location.path()).toBe('/locations/123123/boxes');
    })

    it("should add success message to the page", function() {
      expect(element.html() === undefined).toBe(false);
      //('<div ng-show="box.deleting"><p>Type the word '<strong>delete</strong>' in the box below.</p><input ng-model="box.delete_word" class="form-control ng-pristine ng-untouched ng-valid" type="text" placeholder="Yes, I know what I'm doing"></div><p ng-hide="box.deleting" class="button tiny alert" ng-click="deleteConfirm()">Delete</p><p><span ng-disabled="box.delete_word != 'delete'" ng-show="box.deleting" class="button tiny alert" ng-click="deleteMe()" id="delete">Delete</span><span ng-show="box.deleting" class="text-danger" ng-click="box.deleting = undefined"> Cancel</span></p>');
    });

    describe("disconnect a client", function() {

      beforeEach(inject(function($compile, $rootScope, $q) {
        $scope.clients = []
        $scope.clients.push({session_id: 123});
        element = angular.element("<client-disconnect><p>GO</p></client-disconnect>");
        $compile(element)($rootScope)
        $scope.status ={};
        $scope.box = {
          allowed_job: true
        };
      }))

      it("should successfully disconnect a user from a box", function() {
        $scope.$index = 0
        spyOn(clientFactory, 'disconnect').andCallThrough()
        spyOn(window, 'confirm').andReturn(true);
        element.find('#disconnect').click();
        expect($scope.clients[0].status).toBe('disconnecting');
        expect($scope.client.status).toBe('disconnecting');

        deferred.resolve({slug: 123, is_monitored: true});
        $scope.$digest()
        expect($scope.client.status).toBe('disconnected');
        expect(clientFactory.disconnect).toHaveBeenCalled();
      })

      it("should fail to disconnect a user from a box", function() {
        $scope.$index = 0
        spyOn(clientFactory, 'disconnect').andCallThrough()
        spyOn(window, 'confirm').andReturn(true);
        element.find('#disconnect').click();
        expect($scope.clients[0].status).toBe('disconnecting');
        expect($scope.client.status).toBe('disconnecting');

        deferred.reject({data: {errors: { base: [123]}}});
        $scope.$digest()
        expect($scope.client.status).toBe('online');
        expect(clientFactory.disconnect).toHaveBeenCalled();
      })

    })

  })

  describe("adding a box to a zone from the show page", function() {

    beforeEach(inject(function($compile, $rootScope, $q, _$location_, $routeParams) {
      routeParams = $routeParams;
      routeParams.location_id = 123;

      $location = _$location_;
      $scope.box = { id: 999 };
      element = angular.element("<add-box-zone box-id=\'{{ box.id }}\'></add-box-zone>");
      $compile(element)($rootScope);
    }));

    xit("should list the zones", function() {
      spyOn(zoneFactory, 'query').andCallThrough()
      spyOn(networkFactory, 'get').andCallThrough()
      element.isolateScope().getZones();
      expect(element.isolateScope().loading).toEqual(true)

      var zone = { zones: [{ name: 123, boxes: [123] } ]};
      deferred.resolve(zone);
      $scope.$digest()
      expect(element.isolateScope().zones).toEqual(zone.zones)

      var network = { name: 123 };
      deferred.resolve([network]);
      $scope.$digest()
      expect(element.isolateScope().networks).toEqual([network])
      expect(element.isolateScope().loading).toEqual(undefined)
    });

    it("should find a box in a zone and splice it", function() {
      spyOn(zoneFactory, 'query').andCallThrough()
      spyOn(networkFactory, 'get').andCallThrough()
      element.isolateScope().getZones();
      expect(element.isolateScope().loading).toEqual(true)

      var zone = { zones: [{ name: 123, boxes: [999,123] }, { name: 'test', boxes: [] } ] };
      var network = { name: 123 };

      deferred.resolve(zone);
      $scope.$digest()

      deferred.resolve([network]);
      $scope.$digest()

      expect(element.isolateScope().zones.length).toEqual(1)
    });

    it("should add a box to a zone", function() {
      spyOn(zoneFactory, 'update').andCallThrough()
      var zone = { name: 123, id: 222 };
      var network = { name: 123 };
      // element.isolateScope().globalZone = {}
      // element.isolateScope().globalZone.zones = [];
      element.isolateScope().zones = [zone]
      element.isolateScope().network = network
      element.isolateScope().zone = zone
      element.isolateScope().update(222);
      expect(element.isolateScope().updating).toEqual(true)

      deferred.resolve(zone);
      $scope.$digest()
      expect(element.isolateScope().zones).toEqual(undefined)
      expect(element.isolateScope().networks).toEqual(undefined)
      expect(element.isolateScope().updating).toEqual(undefined)
    });

  });

  describe("tranfer a box", function() {

    beforeEach(inject(function($injector, $compile, $rootScope, $q, $templateCache) {
      element = angular.element("<div box-transfer></div>");
      $compile(element)($rootScope)
      $scope.status ={};
      $scope.box = {location_slug: 123123};
      $scope.data = {}
      $scope.location = {};
      var location = {
        location_name: 'my location',
        unique_id: 123
      }
    }))

    it("should successfully transfer a box", function() {
      spyOn(boxFactory, 'transfer').andCallThrough()
      spyOn(locationFactory, 'shortquery').andCallThrough()
      element.find('#transfer-dialog').click()
      expect($scope.box.processing).toBe(true);

      // Wont because data.selected ain't, erm, selected //
      element.find('#transfer-box').click()
      deferred.resolve([{slug: 123}]);
      $scope.$digest()
      expect(boxFactory.transfer).not.toHaveBeenCalled();

      var cont = element.find('input').controller('ngModel');
      cont.$setViewValue("1231231231231231231");
      expect($scope.box.transfer_to).toBe("1231231231231231231");
      element.find('#transfer-box').click()
      deferred.resolve({slug: 123});
      $scope.$digest()
      expect(boxFactory.transfer).toHaveBeenCalled();
      expect($scope.box.state).toBe('transferring')
      expect($scope.box.processing).toBe(undefined);
    })

    it("should not transfer a box", function() {
      spyOn(boxFactory, 'transfer').andCallThrough()
      element.find('#transfer-dialog').click()

      // Wont because data.selected ain't, erm, selected //
      $scope.box.transfer_to = 123
      element.find('#transfer-box').click()
      deferred.reject({data: {errors: { base: [123]}}});
      $scope.$digest()
      expect(boxFactory.transfer).toHaveBeenCalled();
      expect($scope.error).toBe(true);
    })

    it("should add success message to the page", function() {
      expect(element.html()).toBe('<!-- ngIf: box.state === \'transferring\' --><div ng-show="box.state !== \'transferring\'"><p class="button tiny" ng-click="transferBox()" id="transfer-dialog">Transfer</p><p ng-show="box.deleting" ng-disabled="true" class="button tiny">Deleting...</p></div>');
    });
  });

  describe("firmware upgrades", function() {

    beforeEach(inject(function($compile, $rootScope, $q) {
      $scope.box = { state: 'online' }
      element = angular.element("<div upgrade-box box='box'></div>");
      $compile(element)($rootScope);
    }));

    it("should successfully upgrade a box", function() {
      $scope.box = { allowed_job: true };
      spyOn(payloadFactory, 'create').andCallThrough();
      element.isolateScope().upgradeBox();
      $scope.$digest();
      expect(element.isolateScope().processing).toBe(true)

      deferred.resolve({slug: 123});
      $scope.$digest();

      expect(payloadFactory.create).toHaveBeenCalled();
      expect($scope.box.state).toBe('processing')
      expect(element.isolateScope().processing).toBe(undefined)
      // expect($scope.box.upgrade_processig).toBe(true)
    });

    it("should NOT successfully upgrade the box", function() {
      // spyOn(window, 'confirm').andReturn(true);
      $scope.box = { allowed_job: true };
      spyOn(payloadFactory, 'create').andCallThrough();
      element.isolateScope().upgradeBox();
      $scope.$digest();
      expect(element.isolateScope().processing).toBe(true)

      deferred.reject({data: { message: "123" }});
      $scope.$digest();

      expect(payloadFactory.create).toHaveBeenCalled();
      expect(element.isolateScope().errors).toBe('123')
      expect(element.isolateScope().processing).toBe(undefined)
    });

  });

  describe("adding a box with firmware download init", function() {

    beforeEach(inject(function($compile, $rootScope, $q, _$location_, $routeParams) {
      routeParams = $routeParams;
      routeParams.location_id = 123;
      $scope.box = {  }

      $location = _$location_;
      element = angular.element("<download-firmware></download-firmware>");
      $compile(element)($rootScope);
      $scope.$digest();
    }));

    it("should try and add a box to ct and the list the firmwares", function() {
      spyOn(boxFactory, 'save').andCallThrough();
      spyOn(firmwareFactory, 'query').andCallThrough();

      expect(element.isolateScope().firwares).toBe(undefined)
      // expect(element.isolateScope().mac).toBe('my-mac')

      // var box = {mac: '11:22:33:44:55:66', state: 'new'}
      // element.isolateScope().box = box;

      // element.isolateScope().addBox()
      // expect(element.isolateScope().loading).toBe(true)
      // expect(element.isolateScope().box.self_install).toBe(true)

      // deferred.resolve(box);
      // $scope.$digest();

      // expect(element.isolateScope().loading).toBe(true)
      // // expect(location.search().mac).toBe(box.mac)

      // var firmwares = [{name: 123}]
      // deferred.resolve(firmwares);
      // $scope.$digest();
      // expect(element.isolateScope().firmwares.length).toBe(1)
      // expect(element.isolateScope().loading).toBe(undefined)
    });

    // it("should try and add a box to ct and NOT list the firmwares because already added", function() {
    //   spyOn(boxFactory, 'save').andCallThrough();
    //   spyOn(firmwareFactory, 'query').andCallThrough();

    //   expect(element.isolateScope().firwares).toBe(undefined)

    //   var box = {calledstationid: '11:22:33:44:55:66', state: 'new'}
    //   element.isolateScope().box = box;

    //   element.isolateScope().addBox()
    //   expect(element.isolateScope().loading).toBe(true)
    //   expect(element.isolateScope().box.self_install).toBe(true)

    //   var err = {data: {message: [{a:123}]}}
    //   deferred.reject(err);
    //   $scope.$digest();

    //   expect(element.isolateScope().box.state).toBe(undefined)
    //   expect(element.isolateScope().loading).toBe(undefined)
    //   expect(element.isolateScope().errors.length).toBe(1)
    // });
  });

  describe("adding a box with firmware download init - has mac in route params so just gets the firmies", function() {

    // beforeEach(inject(function($compile, $rootScope, $q, _$location_, $routeParams) {
    //   routeParams = $routeParams;
    //   routeParams.location_id = 123;
    //   routeParams.mac = 'my-mac'
    //   // window.intercom = jasmine.createSpy();
    //   $scope.box = {  }

    //   $location = _$location_;
    //   element = angular.element("<download-firmware></download-firmware>");
    //   $compile(element)($rootScope);
    //   $scope.$digest();
    // }));

    // it("should try and add a box to ct and the list the firmwares", function() {
    //   spyOn(boxFactory, 'save').andCallThrough();
    //   spyOn(firmwareFactory, 'query').andCallThrough();

    //   expect(element.isolateScope().firwares).toBe(undefined)
    //   expect(element.isolateScope().mac).toBe('my-mac')

    //   var box = {mac: '11:22:33:44:55:66', state: 'new'}
    //   element.isolateScope().box = box;

    //   var firmwares = [{name: 123}]
    //   deferred.resolve(firmwares);
    //   $scope.$digest();
    //   expect(element.isolateScope().firmwares.length).toBe(1)
    //   expect(element.isolateScope().loading).toBe(undefined)
    // });
  });

});

describe('box charts', function () {

  var $scope,
      element,
      deferred,
      q,
      location,
      $location,
      routeParams,
      reportFactory,
      heartbeatFactory,
      speedtestFactory,
      firmwareFactory,
      boxFactory;

  beforeEach(module('myApp', function($provide) {
    heartbeatFactory = {
      query: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
    };
    firmwareFactory = {
      query: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
    };
    boxFactory = {
      query: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
    };
    reportFactory = {
      clients: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      speedtests: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      bitrate: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      quality: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      signal: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
    };
    $provide.value("Box", boxFactory);
    $provide.value("Heartbeat", heartbeatFactory);
    $provide.value("Report", reportFactory);
    $provide.value("Firmware", firmwareFactory);
  }));

  beforeEach(inject(function($compile, $rootScope, $q, $location) {
    $scope = $rootScope;
    q = $q;
    location = $location;
  }));

  describe("loads clients for home page", function() {

    beforeEach(inject(function($compile, $rootScope, $q, _$location_, $routeParams) {
      $scope.chart = { asdf: 123123 };
      $scope.box = { ap_mac: 123456 }
      element = angular.element('<box-clients-graph chart="chart" ap-mac="{{ box.ap_mac }}"></box-clients-graph>');
      $compile(element)($rootScope);
      $scope.$digest();
    }));

    it("should display the clients chart", function() {
      spyOn(boxFactory, 'query').andCallThrough();
      spyOn(reportFactory, 'clients').andCallThrough();
      expect(element.scope().chart.loading).toBe(true);

      var chart = { timeline: [], _stats: {} }
      deferred.resolve(chart);
      $scope.$digest();

      expect($scope.chart).toBe(chart.timeline);
    });

  });

  describe("adjusts the interval and distance vars for home page", function() {

    beforeEach(inject(function($compile, $rootScope, $q, _$location_, $routeParams) {
      $scope.chart = { asdf: 123123 };
      $scope.box = { ap_mac: 123456 }
      $location = _$location_;
      element = angular.element('<adjust-interval></adjust-interval>');
      $compile(element)($rootScope);
      $scope.$digest();
    }));

    it("should update the clients chart with int and distance", function() {

      $scope.adjustInterval(30)
      $scope.$digest();

      expect($location.search().interval).toBe('day');
      expect($location.search().distance).toBe(30);

      $scope.adjustInterval(7,'week')
      $scope.$digest();

      expect($location.search().interval).toBe('week');
      expect($location.search().distance).toBe(7);

    });

  });

  describe("loads interface stats", function() {

    beforeEach(inject(function($compile, $rootScope, $q, _$location_, $routeParams) {
      $scope.chart = { asdf: 123123 };
      $scope.box = { ap_mac: 123456 }
      element = angular.element('<box-int-stats chart="chart" ap-mac="{{ box.ap_mac }}" chart="chart"></box-int-stats>');
      $compile(element)($rootScope);
      $scope.$digest();
    }));

    it("should get the stats!", function() {
      spyOn(boxFactory, 'query').andCallThrough();
      spyOn(reportFactory, 'signal').andCallThrough();
      // expect(element.scope().chart.loading).toBe(true);

      var chart = { stats: { "24": 123, start_date: "456" } }
      deferred.resolve(chart);
      $scope.$digest();

      expect($scope.chart.interval).toBe('quarter');
      expect($scope.chart.distance).toBe('24hr');
      // expect($scope.interface2).toBe(chart.stats[);

    });

  });

  describe("loads speedtests", function() {

    beforeEach(inject(function($compile, $rootScope, $q, _$location_, $routeParams) {
      $scope.chart = { asdf: 123123 };
      $scope.box = { ap_mac: 123456 }
      element = angular.element('<speedtest-chart ap-mac="{{ box.ap_mac }}" chart="chart"></speedtest-chart>');
      $compile(element)($rootScope);
      $scope.$apply();
    }));

    it("should get the speedtest stats!", function() {
      spyOn(reportFactory, 'speedtests').andCallThrough();
      expect(element.scope().chart.loading).toBe(true);

      var chart = { data: 123 }
      deferred.resolve(chart);
      $scope.$digest();

      expect($scope.chart).toBe(chart);
    });

  });

  describe("loads heartbeats", function() {

    beforeEach(inject(function($compile, $rootScope, $q, _$location_, $routeParams) {
      $scope.hb = { };
      $scope.start_date = undefined;
      $scope.box = { slug: 123456 }
      element = angular.element('<heartbeat-chart slug="{{box.slug}}" data="hb"></heartbeat-chart>');
      $compile(element)($rootScope);
      $scope.$apply();
    }));

    // FUCKING WANKER COCK HIGHCHARTS //

    xit("should format this fucking heartbeat stats!", function() {
      spyOn(heartbeatFactory, 'query').andCallThrough();

      var hb = {heartbeats: {"1419937200":1,"1419966000":0,"1419976800":0,"1420250400":1}}
      deferred.resolve(hb);
      $scope.$apply();

      var a = { online : [ { x : 0, low : 1419937200000, high : 1419966000000 } ], offline : [ { x : 0, low : 1419966000000, high : 1420250400000 } ] }

      expect($scope.start_date).toBe(1419937200)
      expect(JSON.stringify($scope.data)).toBe(JSON.stringify(a))
    });

  });

});

describe('box reboot', function () {

  var $scope,
      element,
      deferred,
      q,
      $httpBackend,
      boxFactory;

  beforeEach(module('myApp'));

  beforeEach(inject(function($compile, $rootScope, $q, _$httpBackend_, $injector) {
    $httpBackend = _$httpBackend_;
    $scope = $rootScope;
    q = $q;
    element = angular.element("<div reboot-box></div>");
    $compile(element)($rootScope)

    $httpBackend = $injector.get('$httpBackend');

  }))

});


describe('channel selection shit', function () {

  var $scope,
      element,
      deferred,
      q,
      compile,
      rootScope,
      $timeout,
      $httpBackend;

  beforeEach(module('myApp'));

  beforeEach(inject(function($compile, $rootScope, $q, _$httpBackend_, $injector, _$timeout_) {
    $httpBackend = _$httpBackend_;
    $timeout = _$timeout_;
    $scope = $rootScope;
    q = $q;
    compile = $compile;
    rootScope = $rootScope;
  }))

  xit("should successfully list 2.4ghz channels", function() {
    $scope.box = {
      dual_band: false,
      ht_mode_2: 'HT20'
    }
    element = angular.element("<box-channels></box-channels>");
    compile(element)(rootScope)
    element.scope().$apply();

    var template = '<div class="form-group ng-scope"><label for="nas_ht_mode_2">Mode</label><select ng-model="box.ht_mode_2" class="form-control ng-pristine ng-untouched ng-valid" ng-options="name for (name, value) in ht_mode" ng-change="updateChannels()" name="ht_mode_2" id="channel2"><option value="Auto / HT20" selected="selected">Auto / HT20</option><option value="HT40+">HT40+</option><option value="HT40-">HT40-</option></select><br><label for="channel"> 2.4Ghz Channel</label><select ng-model="box.channel" class="form-control ng-pristine ng-untouched ng-valid" ng-options="name for (name, value) in channels2" ng-change="myForm.$pristine = false" name="channel2"><option value="?" selected="selected"></option><option value="1">1</option><option value="10">10</option><option value="11">11</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option><option value="6">6</option><option value="7">7</option><option value="8">8</option><option value="9">9</option><option value="auto">auto</option></select><br><label for="nas_ht_mode_5">Mode</label><select ng-model="box.ht_mode_5" class="form-control ng-pristine ng-untouched ng-valid" ng-options="name for (name, value) in ht_mode" name="ht_mode_2" ng-change="updateChannels()" id="channel5"><option value="?" selected="selected"></option><option value="Auto / HT20">Auto / HT20</option><option value="HT40+">HT40+</option><option value="HT40-">HT40-</option></select><br><label for="channel5"> 5Ghz Channel</label><select ng-model="box.channel_5" class="form-control ng-pristine ng-untouched ng-valid" ng-options="name for (name, value) in channels5" ng-change="myForm.$pristine = false" name="channel5"><option value="?" selected="selected"></option></select></div>'

    expect(element.html()).toBe(template)
  });

  xit("should successfully list 5ghz channels", function() {
    $scope.box = {
      dual_band: true,
      ht_mode_2: 'HT20',
      ht_mode_5: 'HT20'
    }
    element = angular.element("<box-channels></box-channels>");
    compile(element)(rootScope)
    element.scope().$apply();

    var template = '<div class="form-group ng-scope"><label for="nas_ht_mode_2">Mode</label><select ng-model="box.ht_mode_2" class="form-control ng-pristine ng-untouched ng-valid" ng-options="name for (name, value) in ht_mode" ng-change="updateChannels()" name="ht_mode_2" id="channel2"><option value="Auto / HT20" selected="selected">Auto / HT20</option><option value="HT40+">HT40+</option><option value="HT40-">HT40-</option></select><br><label for="channel"> 2.4Ghz Channel</label><select ng-model="box.channel" class="form-control ng-pristine ng-untouched ng-valid" ng-options="name for (name, value) in channels2" ng-change="myForm.$pristine = false" name="channel2"><option value="?" selected="selected"></option><option value="1">1</option><option value="10">10</option><option value="11">11</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option><option value="6">6</option><option value="7">7</option><option value="8">8</option><option value="9">9</option><option value="auto">auto</option></select><br><label for="nas_ht_mode_5">Mode</label><select ng-model="box.ht_mode_5" class="form-control ng-pristine ng-untouched ng-valid" ng-options="name for (name, value) in ht_mode" name="ht_mode_2" ng-change="updateChannels()" id="channel5"><option value="Auto / HT20" selected="selected">Auto / HT20</option><option value="HT40+">HT40+</option><option value="HT40-">HT40-</option></select><br><label for="channel5"> 5Ghz Channel</label><select ng-model="box.channel_5" class="form-control ng-pristine ng-untouched ng-valid" ng-options="name for (name, value) in channels5" ng-change="myForm.$pristine = false" name="channel5"><option value="?" selected="selected"></option><option value="36">36</option><option value="40">40</option><option value="44">44</option><option value="48">48</option><option value="auto">auto</option></select></div>'

    expect(element.html()).toBe(template)
  });

  it("should successfully update the 2ghz channels", function() {

    $scope.myForm = {};
    $scope.myForm.$pristine = true;

    $scope.box = {
      dual_band: false,
      ht_mode_2: 'HT20'
    }
    element = angular.element("<box-channels></box-channels>");
    compile(element)(rootScope)
    element.scope().$apply();

    $timeout.flush()

    var channels2 = JSON.stringify({ auto : 'auto', 1 : '01', 2 : '02', 3 : '03', 4 : '04', 5 : '05', 6 : '06', 7 : '07', 8 : '08', 9 : '09', 10 : '10', 11 : '11' })
    expect(JSON.stringify($scope.channels2)).toBe(channels2)

    var cont = element.find('#channel2').controller('ngModel');
    cont.$setViewValue("HT40+");

    var channels2 = JSON.stringify({ auto : 'auto', 1 : '01', 2 : '02', 3 : '03', 4 : '04', 5 : '05', 6 : '06', 7 : '07' })
    expect(JSON.stringify($scope.channels2)).toBe(channels2)

    cont.$setViewValue("HT40-");

    var channels2 = JSON.stringify({ auto : 'auto', 5 : '05', 6 : '06', 7 : '07', 8 : '08', 9 : '09', 10 : '10', 11 : '11' })
    expect(JSON.stringify($scope.channels2)).toBe(channels2)

    expect($scope.myForm.$pristine).toBe(false);
  });

  it("should successfully update the 5ghz channels", function() {

    $scope.myForm = {};
    $scope.myForm.$pristine = true;

    $scope.box = {
      dual_band: true,
      ht_mode_2: 'HT20',
      ht_mode_5: 'HT40+'
    }
    element = angular.element("<box-channels></box-channels>");
    compile(element)(rootScope)
    element.scope().$apply();

    $timeout.flush()

    var channels2 = JSON.stringify({ auto : 'auto', 1 : '01', 2 : '02', 3 : '03', 4 : '04', 5 : '05', 6 : '06', 7 : '07', 8 : '08', 9 : '09', 10 : '10', 11 : '11' })
    var channels5 = JSON.stringify({"auto":"auto","36":"36","40":"40","44":"44","48":"48","52":"52","56":"56","60":"60","153":"153","157":"157","161":"161","165":"165"})
    expect(JSON.stringify($scope.channels2)).toBe(channels2)
    expect(JSON.stringify($scope.channels5)).toBe(channels5)

    var cont = element.find('#channel5').controller('ngModel');

    cont.$setViewValue("HT20");

    var channels5 = JSON.stringify({"auto":"auto","36":"36","40":"40","44":"44","48":"48","52":"52","56":"56","60":"60","64":"64","149":"149","153":"153","157":"157","161":"161","165":"165"})
    expect(JSON.stringify($scope.channels2)).toBe(channels2)
    expect(JSON.stringify($scope.channels5)).toBe(channels5)

    cont.$setViewValue("HT40-");

    var channels5 = JSON.stringify({"auto":"auto","40":"40","44":"44","48":"48","52":"52","56":"56","60":"60","64":"64","153":"153","157":"157","161":"161","165":"165"})
    expect(JSON.stringify($scope.channels2)).toBe(channels2)
    expect(JSON.stringify($scope.channels5)).toBe(channels5)

    expect($scope.myForm.$pristine).toBe(false);
  });

});

describe('listing boxes', function () {

  var $scope,
      element,
      deferred,
      q,
      location,
      locationFactory,
      payloadFactory,
      commandFactory,
      $location,
      routeParams,
      $httpBackend,
      boxFactory;

  beforeEach(module('components/boxes/list/list.html'));
  beforeEach(module('components/boxes/payloads/_bulk.html'));
  beforeEach(module('components/locations/layouts/sidebar.html'));
  beforeEach(module('components/boxes/index/sidebar.html'));

  beforeEach(module('myApp', function($provide) {
    locationFactory = {
      get: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      query: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    };
    boxFactory = {
      query: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
    };
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
    $provide.value("Box", boxFactory);
    $provide.value("Location", locationFactory);

  }));

  beforeEach(inject(function($compile, $rootScope, $q, $location, $injector) {
    $httpBackend = $injector.get('$httpBackend');
    $httpBackend.whenGET('template/pagination/pagination.html').respond("");
    $scope = $rootScope;
    q = $q;
    location = $location;
  }));

  describe("adds the list of boxes to the page - main index", function() {

    beforeEach(inject(function($compile, $rootScope, $q, _$location_, $routeParams) {
      routeParams = $routeParams;
      routeParams.location_id = 123;
      $location = _$location_;
      element = angular.element("<list-boxes></list-boxes>");
      $compile(element)($rootScope);
    }));

    it("should display the boxes!", function() {
      $scope.$digest();
      spyOn(boxFactory, 'query').andCallThrough();
      expect(element.isolateScope().loading).toBe(true)

      var boxes = { boxes: [{id: 123, clients_online: 12}], aggregations: { a: 123 } }
      deferred.resolve(boxes);
      $scope.$digest();
      expect(element.isolateScope().boxes).toBe(boxes.boxes)
      expect(element.isolateScope().aggregations).toBe(boxes.aggregations)
      expect(element.isolateScope().loading).toBe(undefined)

      // expect(element.isolateScope().onlineFilter).toBe('');
      // expect(element.isolateScope().onlineFilter).toBe('');
      expect(element.isolateScope().boxes.clients_online).toBe(12);
    });

    it("should not display the boxes!", function() {
      $scope.$digest();
      spyOn(boxFactory, 'query').andCallThrough();
      expect(element.isolateScope().loading).toBe(true)

      var boxes = { boxes: [{id: 123, clients_online: 12}] }
      deferred.reject(boxes);
      $scope.$digest();
      expect(element.isolateScope().boxes).toBe(undefined)
      expect(element.isolateScope().loading).toBe(undefined)
    });

    it("should clear the box query", function() {
      $scope.$digest();
      spyOn(boxFactory, 'query').andCallThrough();
      expect(element.isolateScope().loading).toBe(true)
      element.isolateScope().query = '123'
      element.isolateScope().clearQuery()
      element.isolateScope().$digest()
      expect(element.isolateScope().query).toBe(undefined);
    });

    // it("should cancel the payload", function() {
    //   $scope.$digest();
    //   spyOn(boxFactory, 'query').andCallThrough();
    //   expect(element.isolateScope().loading).toBe(true)
    //   element.isolateScope().status = { processing: '123' }
    //   element.isolateScope().payloads = { commands: '123' }
    //   element.isolateScope().cancelPayload()
    //   $scope.$digest()
    //   expect(element.isolateScope().status.processing).toBe(undefined);
    //   expect(element.isolateScope().payloads.commands).toBe(undefined);
    // });

    it("should enter something in the query and then call CT", function() {
      $scope.$digest();
      spyOn(boxFactory, 'query').andCallThrough();
      var boxes = { boxes: [{id: 123, clients_online: 12}], aggregations: { a: 123 } }
      deferred.resolve(boxes);
      $scope.$digest();
      expect(element.isolateScope().boxes).toBe(boxes.boxes)
      element.isolateScope().query = "simonsays";
      element.isolateScope().search('simonsays');

      $scope.$digest();
      expect(element.isolateScope().searching_ct).toBe(true);
      expect($location.search().q).toBe('simonsays')

      deferred.resolve([]);
      $scope.$digest();
      expect(element.isolateScope().searching_ct).toBe(undefined)
      expect(element.isolateScope().boxes).toBe(undefined)
    });

    it("should click the search button and call updateQ()", function() {
      $scope.$digest();
      spyOn(boxFactory, 'query').andCallThrough();
      element.isolateScope().updateQ();
      expect(element.isolateScope().searching_ct).toBe(true);

      deferred.resolve([]);
      element.isolateScope().$digest();
      expect(element.isolateScope().searching_ct).toBe(undefined);
    });

    it("should click a machine types checkbox and then call CT to update results", function() {
      $scope.$digest();
      spyOn(boxFactory, 'query').andCallThrough();
      var aggs = { "types":[{"count":11,"key":"Ubiquiti UniFi"},{"count":5,"key":"Ubiquiti AirRouter"}]}
      var boxes = { boxes: [{id: 123, clients_online: 12}], aggregations: aggs }
      deferred.resolve(boxes);
      $scope.$digest();

      expect(element.isolateScope().aggregations).toBe(aggs)
      element.isolateScope().mt_selection[0] = true;
      element.isolateScope().mts()
      $scope.$digest();
      // expect($scope.loading).toBe(true);

      expect(element.isolateScope().machine_type).toBe('Ubiquiti UniFi')
      deferred.resolve(boxes);
      $scope.$digest();
      expect(element.isolateScope().loading).toBe(undefined);
    })

    it("should click a firmwares checkbox and then call CT to update results", function() {
      $scope.$digest();
      spyOn(boxFactory, 'query').andCallThrough();
      var aggs = { "environments": [{"count":13,"key":"Unknown"},{"count":4,"key":"p_141203_00"},{"count":2,"key":"p_140511_00"},{"count":1,"key":"B_140812_00"} ] }
      var boxes = { boxes: [{id: 123, clients_online: 12}], aggregations: aggs }
      deferred.resolve(boxes);
      $scope.$digest();

      expect(element.isolateScope().aggregations).toBe(aggs)
      element.isolateScope().env_selection[0] = true;
      element.isolateScope().envs()
      $scope.$digest();

      expect(element.isolateScope().environment).toBe('Unknown')
      deferred.resolve(boxes);
      $scope.$digest();
      expect(element.isolateScope().loading).toBe(undefined);
    })

    it("should click a developments modes checkbox and then call CT to update results", function() {
      $scope.$digest();
      spyOn(boxFactory, 'query').andCallThrough();
      var aggs = { "firmwares":[{"count":13,"key":"Unknown"},{"count":4,"key":"p_141203_00"},{"count":2,"key":"p_140511_00"},{"count":1,"key":"B_140812_00"} ] }
      var boxes = { boxes: [{id: 123, clients_online: 12}], aggregations: aggs }
      deferred.resolve(boxes);
      $scope.$digest();

      expect(element.isolateScope().aggregations).toBe(aggs)
      element.isolateScope().fw_selection[0] = true;
      element.isolateScope().fws()
      $scope.$digest();

      expect(element.isolateScope().firmware).toBe('Unknown')
      deferred.resolve(boxes);
      $scope.$digest();
      expect(element.isolateScope().loading).toBe(undefined);
    })

    it("should click a states checkbox and then call CT to update results", function() {
      $scope.$digest();
      spyOn(boxFactory, 'query').andCallThrough();
      var aggs = { "states":[{"count":13,"key":"Unknown"},{"count":4,"key":"p_141203_00"},{"count":2,"key":"p_140511_00"},{"count":1,"key":"B_140812_00"} ] }
      var boxes = { boxes: [{id: 123, clients_online: 12}], aggregations: aggs }
      deferred.resolve(boxes);
      $scope.$digest();

      expect(element.isolateScope().aggregations).toBe(aggs)
      element.isolateScope().state_selection[0] = true;
      element.isolateScope().state_s()
      $scope.$digest();

      expect(element.isolateScope().state).toBe('Unknown')
      deferred.resolve(boxes);
      $scope.$digest();
      expect(element.isolateScope().loading).toBe(undefined);
    })
  })

  describe("adds the list of boxes to the page - locations index", function() {

    beforeEach(inject(function($compile, $rootScope, $q, _$location_, $routeParams) {
      routeParams = $routeParams;
      routeParams.location_id = 123;
      $location = _$location_;
      $scope.location = {}
      element = angular.element("<payloads-bulk><list-location-boxes location='location'></list-location-boxes></payloads-bulk>");
      $compile(element)($rootScope);
    }));

    it("should display the boxes!", function() {
      $scope.$digest();
      spyOn(boxFactory, 'query').andCallThrough();
      var listScope = element.find('list-location-boxes').isolateScope()

      expect(listScope.loading).toBe(true)
      expect(listScope.location.slug).toBe(123)

      var location = { slug: 13 }

      deferred.resolve(location);
      $scope.$digest();
      expect($scope.location).toEqual(location);

      var boxes = { boxes: [{id: 123, clients_online: 12}], aggregations: { a: 123 } }
      deferred.resolve(boxes);
      $scope.$digest();
      expect(listScope.boxes).toBe(boxes.boxes)
      expect(listScope.loading).toBe(undefined)
    });

  });

  describe("the boxes template and assorted methods", function() {

    beforeEach(inject(function($compile, $rootScope, $q, _$location_, $routeParams) {
      routeParams = $routeParams;
      routeParams.location_id = 123;
      $location = _$location_;
      $scope.boxes = [{slug: 'slug', allowed_job: true}, {slug: 'sluggy'}]
      element = angular.element("<boxes-template boxes=\'boxes\'></boxes-template>");
      $compile(element)($rootScope);
      $scope.$digest();
    }));

    it("should select only the online the boxes", function() {
      expect(element.isolateScope().boxes.length).toBe(2)
      element.isolateScope().selectall = true;

      element.isolateScope().selectAll()
      expect(element.isolateScope().selected['slug']).toBe(true)

      element.isolateScope().selectall = false;
      element.isolateScope().selectAll()
      expect(element.isolateScope().selected['slug']).toBe(undefined)
    });

  });

  describe("running the mass payloads on the boxes from the index", function() {

    beforeEach(inject(function($compile, $rootScope, $q, _$location_, $routeParams, $injector) {
      $httpBackend = $injector.get('$httpBackend');
      $httpBackend.whenGET('template/modal/backdrop.html').respond("");
      $httpBackend.whenGET('template/modal/window.html').respond("");
      routeParams = $routeParams;
      routeParams.location_id = 123;
      $location = _$location_;
      var box = { slug: 'slug' }
      $scope.boxes = [box]
      $scope.selected = {}
      element = angular.element("<payloads-bulk></payloads-bulk>");
      $compile(element)($rootScope);
      $scope.$digest();
    }));

    it("should run the payload on multiple boxes!", function() {
      var command = { id: 123 };

      var selected = {};
      selected['slug']    = true
      selected['no-slug'] = false

      element.isolateScope().runPayloads(selected)
      expect(element.isolateScope().selection[0]).toBe('slug')
      expect(element.isolateScope().selection[1]).toBe(undefined)

      spyOn(commandFactory, 'query').andCallThrough();
      spyOn(payloadFactory, 'create').andCallThrough();

      deferred.resolve([command]);
      $scope.$apply();
      expect(element.isolateScope().commands[0]).toBe(command);

      element.isolateScope().command = { selected: 123123 }

      element.isolateScope().runCommand();
      expect(element.isolateScope().command.processing).toBe(true)

      deferred.resolve([command]);
      $scope.$apply();
      expect(element.isolateScope().command.processing).toBe(undefined)
      expect(element.isolateScope().payloadSent).toBe(true)
      expect(element.isolateScope().selection.length).toBe(0)
    });

    it("should not run the payload on multiple boxes 422", function() {
      var command = { id: 123 };

      var selected = {};
      selected['slug']    = true
      selected['no-slug'] = false

      element.isolateScope().runPayloads(selected)

      spyOn(commandFactory, 'query').andCallThrough();
      spyOn(payloadFactory, 'create').andCallThrough();

      deferred.resolve([command]);
      $scope.$apply();
      expect(element.isolateScope().commands[0]).toBe(command);

      element.isolateScope().runCommand();
      expect(element.isolateScope().command.processing).toBe(true)

      deferred.reject()
      $scope.$apply();
      expect(element.isolateScope().command.processing).toBe(undefined)
      expect(element.isolateScope().payloadError).toBe(true)
    });

  });

});
