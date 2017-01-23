'use strict';

var app = angular.module('myApp.google.maps.directives', []);

app.directive('googleMaps', function ($q,$compile,$timeout) {

  var _map;

  var link = function(scope,element,attrs) {

    var el = document.createElement('div');
    var lat = attrs.lat || 51.50889335149151;
    var lng = attrs.lng || -0.12989097040133;

    var zoom = 12;

    el.style.width = '100%';
    el.style.height = '100%';
    element.prepend(el);

    var myLatlng = new window.google.maps.LatLng(lat,lng);

    var createMap = function() {

      var mapOptions = {
        center: myLatlng,
        zoom: zoom,
        panControl: false,
        zoomControl: true,
        streetViewControl: false,
        zoomControlOptions: {
          style: window.google.maps.ZoomControlStyle.SMALL,
          position: window.google.maps.ControlPosition.LEFT_TOP
        }
      };
      scope.map = new window.google.maps.Map(el, mapOptions);
      scope.map.setOptions({styles: styles});

      _map.resolve(scope.map);

      // zoomListener();
    };

    $(window).resize(function() {
      if (this.resizeTO) {
        clearTimeout(this.resizeTO);
      }
      this.resizeTO = setTimeout(function() {
        $(this).trigger('resizeEnd');
      }, 500);
    });

    $(window).on('resizeEnd', function() {
      var center = scope.map.getCenter();
      window.google.maps.event.trigger(scope.map, 'resize');
      scope.map.setCenter(center);
    });

    var zoomListener = function() {
      window.google.maps.event.addListener(scope.map, 'zoom_changed', function() {
      });
    };


    var styles = [{
      'featureType': 'administrative',
      'elementType': 'labels.text.fill',
      'stylers': [{
        'color': '#444444'
      }]
    }, {
      'featureType': 'administrative.locality',
      'elementType': 'labels',
      'stylers': [{
        'visibility': 'on'
      }]
    }, {
      'featureType': 'landscape',
      'elementType': 'all',
      'stylers': [{
        'color': '#f2f2f2'
      }, {
        'visibility': 'simplified'
      }]
    }, {
      'featureType': 'poi',
      'elementType': 'all',
      'stylers': [{
        'visibility': 'on'
      }]
    }, {
      'featureType': 'poi',
      'elementType': 'geometry',
      'stylers': [{
        'visibility': 'simplified'
      }, {
        'saturation': '-65'
      }, {
        'lightness': '45'
      }, {
        'gamma': '1.78'
      }]
    }, {
      'featureType': 'poi',
      'elementType': 'labels',
      'stylers': [{
        'visibility': 'off'
      }]
    }, {
      'featureType': 'poi',
      'elementType': 'labels.icon',
      'stylers': [{
        'visibility': 'off'
      }]
    }, {
      'featureType': 'road',
      'elementType': 'all',
      'stylers': [{
        'saturation': -100
      }, {
        'lightness': 45
      }]
    }, {
      'featureType': 'road',
      'elementType': 'labels',
      'stylers': [{
        'visibility': 'on'
      }]
    }, {
      'featureType': 'road',
      'elementType': 'labels.icon',
      'stylers': [{
        'visibility': 'off'
      }]
    }, {
      'featureType': 'road.highway',
      'elementType': 'all',
      'stylers': [{
        'visibility': 'simplified'
      }]
    }, {
      'featureType': 'road.highway',
      'elementType': 'labels.icon',
      'stylers': [{
        'visibility': 'off'
      }]
    }, {
      'featureType': 'road.arterial',
      'elementType': 'labels.icon',
      'stylers': [{
        'visibility': 'off'
      }]
    }, {
      'featureType': 'transit.line',
      'elementType': 'geometry',
      'stylers': [{
        'saturation': '-33'
      }, {
        'lightness': '22'
      }, {
        'gamma': '2.08'
      }]
    }, {
      'featureType': 'transit.station.airport',
      'elementType': 'geometry',
      'stylers': [{
        'gamma': '2.08'
      }, {
        'hue': '#ffa200'
      }]
    }, {
      'featureType': 'transit.station.airport',
      'elementType': 'labels',
      'stylers': [{
        'visibility': 'off'
      }]
    }, {
      'featureType': 'transit.station.rail',
      'elementType': 'labels.text',
      'stylers': [{
        'visibility': 'off'
      }]
    }, {
      'featureType': 'transit.station.rail',
      'elementType': 'labels.icon',
      'stylers': [{
        'visibility': 'simplified'
      }, {
        'saturation': '-55'
      }, {
        'lightness': '-2'
      }, {
        'gamma': '1.88'
      }, {
        'hue': '#ffab00'
      }]
    }, {
      'featureType': 'water',
      'elementType': 'all',
      'stylers': [{
        'color': '#bbd9e5'
      }, {
        'visibility': 'simplified'
      }]
    }];

    $timeout(function() {
      createMap();
    },250);

  };

  return {
    link: link,
    scope: {
      update: '&'
    },
    transclude: true,
    replace: true,
    template: '<div ng-transclude></div>',
    controller: function($scope) {

      this.infoWindow = [];

      $scope.bounds = new window.google.maps.LatLngBounds();
      $scope.markers = [];
      _map = $q.defer();

      $scope.getMap = this.getMap = function() {
        return _map.promise;
      };

      this.deleteObject = function(group, obj) {
        var objs = obj.map[group];
        for (var name in objs) {
          objs[name] === obj && (delete objs[name]);
        }
        obj.map && obj.setMap && obj.setMap(null);
      };

      this.$scope = $scope;
    }

  };

});

app.directive('googleMarker', function ($timeout,$compile) {

  var link = function(scope,element,attrs,controller,transclude) {

    var infoWindow = new window.google.maps.InfoWindow();
    var contentString = '';
    var markers = controller.$scope.markers;
    var bounds = controller.$scope.bounds;
    var image;
    var marker;

    attrs.$observe('slug', function(val){

      if (val !== '') {

        controller.getMap().then(function(map) {

          var template = element.html().trim();
          var myLatLng = new window.google.maps.LatLng(attrs.lat,attrs.lng);

          infoWindow.__template = template.replace(/\s?ng-non-bindable[='"]+/,"");

          infoWindow.__compile = function() {
            marker && (scope['this'] = marker);
            var el = $compile(infoWindow.__template)(scope);
            infoWindow.setContent(template);
            scope.$apply();
          };

          infoWindow.__open = function() {
            infoWindow.__compile();
            infoWindow.open(map, marker);
          };

          var color = attrs.state === 'online' ? 'green' : 'red';

          if (attrs.spot === 'true') {
            var spot = attrs.state === 'online' ? 'online' : 'orange';
            image = {
              url: 'https://d3e9l1phmgx8f2.cloudfront.net/images/icons/'+ spot +'.png',
              size: new google.maps.Size(32,32),
              scaledSize: new google.maps.Size(10,10),
              origin: new google.maps.Point(0,0),
              anchor: new google.maps.Point(0, 0)
            };
          } else if (attrs.icon !== '') {
            image = {
              url: 'https://d3e9l1phmgx8f2.cloudfront.net/images/manufacturer-images/'+ attrs.icon + '',
              size: new google.maps.Size(44,44),
              scaledSize: new google.maps.Size(22,22),
              // strokeColor: 'green',
              // labelClass: c,
              origin: new google.maps.Point(0,0),
              anchor: new google.maps.Point(10, 40)
            };
          } else if (attrs.circle === '') {
            image = {
              url: 'https://d3e9l1phmgx8f2.cloudfront.net/images/maps/spotlight-poi_hdpi_'+ color +'.png',
              size: new google.maps.Size(44,80),
              scaledSize: new google.maps.Size(22,40),
              origin: new google.maps.Point(0,0),
              anchor: new google.maps.Point(10, 40)
            };
          }

          var c = attrs.state === 'online' ? 'online' : 'orange';
          marker = new window.google.maps.Marker({
            position: myLatLng,
            map: map,
            draggable: attrs.draggable === 'true',
            icon: image
          });

          if (attrs.circle === 'true') {
            if (attrs.norm) {
              var scale = (attrs.norm / 100);
              marker.setIcon(getIcon(scale)); //getIcon returns a circle symbol
            }
          }

          controller.infoWindow.push(infoWindow);

          markers.push(marker);
          if (attrs.zoom) {
            map.setZoom(3);
          } else {
            bounds.extend(myLatLng);
            map.fitBounds(bounds);
            overrideCloseBounds();
          }

          window.google.maps.event.addListener(marker, 'dragend', function(event) {
            var options = {};
            options.lat = event.latLng.lat();
            options.lng = event.latLng.lng();
            options.zoom = map.getZoom();
            options.slug = attrs.slug;
            controller.$scope.update({options: options});
          });

          var showInfoWindow = function() {
            var win = controller.infoWindow;
            for (var i=0; i<controller.infoWindow.length; i++) {
              controller.infoWindow[i].close();
            }
            infoWindow.__open();
          };

          window.google.maps.event.addListener(marker, 'click', function() {
            showInfoWindow();
          });

          scope.$on('$destroy', function(event, map) {
            controller.deleteObject('markers', marker);
          });

          function getIcon(scale) {
            return {
              path: window.google.maps.SymbolPath.CIRCLE,
              fillColor: attrs.colour || 'green',
              fillOpacity: .6,
              strokeColor: 'white',
              strokeWeight: 0.5,
              scale: scale * Math.pow(1.4, map.getZoom()) // Bigger circles as you zoom in
            };
          }

          function overrideCloseBounds() {
            var listener = window.google.maps.event.addListener(map, "idle", function() {
              var zoom = map.getZoom();
              map.setZoom(zoom > 12 ? 12 : zoom)
              google.maps.event.removeListener(listener);
            });
          }

        });

      }

    });

  };

  return {
    link: link,
    require: '^googleMaps',
    restrict: 'E',
    scope: true
  };

});

app.directive('googleMarkerMovable', function ($timeout,$compile) {

  var link = function(scope,element,attrs,controller,transclude) {

    function setMarkers(obj, map) {

      console.log('Starting the magic');

      if (markers && markers.length) {
        for (var aa in markers) {
          markers[aa].setMap(null);
          markers[aa] = undefined;
        }
      }

      var aps = {};
      var cc = 0;
      var markers = [];
      var array = [];
      var position;
      var key;
      var bounds = new window.google.maps.LatLngBounds();

      for (var i = 0; i < obj.length; i++) {
        var a = obj[i];
        array.push(a.slug);
      }

      var noiseFactor = 0.00003;
      var noiseFactorS = 0.000001;
      var randomGaussian = function() {
        var u1 = Math.random();
        var u2 = Math.random();
        return Math.sqrt(-2*Math.log(u1))*Math.sin(2 * Math.PI * u2);
      };

      for (var k in aps) {
        if (array.indexOf(k) === -1 ) {
          aps[k].marker.setMap(null);
          delete aps[k];
        }
      }

      var deleteMarkers = function (key, count) {
        if (markers.length) {
          console.log('Deleting', count, 'markers');
          for (var i = 0; i < markers.length; i++) {
            if (markers[i].ap === key) {
              if ( parseInt(i) < (count) ) {
                markers[i].setMap(null);
                markers.splice(i, 1);
              } else { break; }
            }
          }
          console.log('Length after trim', markers.length);
        }
      };

      if ( attrs.moving !== 'true' ) {

        for (var i = 0; i < obj.length; i++) {

          var ap  = obj[i];
          key = ap.slug;
          if (!aps[key]) {

            position = new window.google.maps.LatLng(ap.latitude, ap.longitude);

            ap.marker = new window.google.maps.Marker({
              position: new google.maps.LatLng(ap.latitude, ap.longitude),
              map: map
            });
            var scale = (ap.norm / 100) * Math.pow(1.25, 15);
            ap.marker.setIcon(getIcon(scale));
            aps[key] = obj[i];
          } else  {
            aps[key].val = ap.val;
            position = new window.google.maps.LatLng(aps[key].latitude, aps[key].longitude);
          }

          bounds.extend(position);
          map.fitBounds(bounds);

        }

      } else if ( attrs.moving === 'true' ) {

        // var ap;
        var loop = function () {
          cc++;
          console.log('In array: ', markers.length)

          for (var i = 0; i < obj.length; i++) {

            var old_val = 0;
            key = obj[i].slug;

            if ( aps[key] ) {
              old_val = aps[key].old_val;
            }

            var ap = obj[i];
            // ap.val = Math.floor(Math.random() * 10 ) + 1  //ap.val;

            ap.old_val = ap.norm;

            var clients = ap.norm - old_val;

            if (clients > 0 ) {

              position = new window.google.maps.LatLng(ap.latitude, ap.longitude);

              for ( var j = 0; j < (clients); j++ ) {

                var lat = parseFloat(ap.latitude) + (noiseFactor * randomGaussian());
                var lng = parseFloat(ap.longitude) + (noiseFactor * randomGaussian());

                var m = new window.google.maps.Marker({
                  ap: key,
                  position: new google.maps.LatLng(lat, lng),
                  map: map
                });

                m.setIcon(getIcon(4));

                aps[key] = obj[i];
                markers.push(m);

              }
            } else if (clients < 0 ) {
              deleteMarkers(key, Math.abs(clients));
            }

            if (cc > 1) {
              for (var n in markers) {
                var marker = markers[n];
                var lt = parseFloat(marker.position.G) + (noiseFactorS * randomGaussian());
                var ln = parseFloat(marker.position.K) + (noiseFactorS * randomGaussian());
                marker.setPosition( new google.maps.LatLng( lt, ln ) );
              }

            }

            bounds.extend(position);
            map.fitBounds(bounds);

          }

          loopMarkers();

        };

        var t;
        var loopMarkers = function() {
          $timeout(function() {
            loop();
          }, 35000);
        };

        loop();

      }

    }


    function getIcon(scale) {
      return {
        path: window.google.maps.SymbolPath.CIRCLE,
        // fillColor: attrs.colour || '#12944E',
        fillColor: attrs.colour || '#017fdd',
        fillOpacity: 0.5,
        strokeColor: 'transparent',
        strokeWeight: 0.5,
        scale: scale,
      };
    }


    var running;
    attrs.$observe('markers', function(val){

      if (val !== '' && !running) {
        running = true;
        var newMarker = JSON.parse(attrs.markers)[0];
        controller.getMap().then(function(map) {
          setMarkers(newMarker, map);
        });

      }

    });

  };

  return {
    link: link,
    require: '^googleMaps',
    restrict: 'E',
    scope: true
  };

});

