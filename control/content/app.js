'use strict';

(function (angular, buildfire) {
  angular.module('eventsManualPluginContent', ['ngRoute', 'ui.tinymce', 'ui.bootstrap', 'ui.sortable', 'infinite-scroll', 'ngAnimate','utils'])
    //injected ngRoute for routing
    .config(['$routeProvider', function ($routeProvider) {
      $routeProvider
        .when('/', {
          templateUrl: 'templates/home.html',
          controllerAs: 'ContentHome',
          controller: 'ContentHomeCtrl'
        })
        .when('/event', {
          templateUrl: 'templates/event.html',
          controllerAs: 'ContentEvent',
          controller: 'ContentEventCtrl'
        })
        .when('/event/:id', {
          templateUrl: 'templates/event.html',
          controllerAs: 'ContentEvent',
          controller: 'ContentEventCtrl'
        })
        .otherwise('/');
    }])
    .directive('googleLocationSearch', function () {
      return {
        restrict: 'A',
        scope: {setLocationInController: '&callbackFn'},
        link: function (scope, element, attributes) {
          var options = {
            types: ['geocode']
          };
          var autocomplete = new google.maps.places.Autocomplete(element[0], options);
          google.maps.event.addListener(autocomplete, 'place_changed', function () {
            var location = autocomplete.getPlace().formatted_address;
            if (autocomplete.getPlace().geometry) {
              var coordinates = [autocomplete.getPlace().geometry.location.lng(), autocomplete.getPlace().geometry.location.lat()];
              scope.setLocationInController({
                data: {
                  location: location,
                  coordinates: coordinates
                }
              });
            }
          });
        }
      };
    })
    .directive("googleMap", ['VersionCheckService',function (VersionCheckService) {
      return {
        template: "<div></div>",
        replace: true,
        scope: {coordinates: '=', draggedGeoData: '&draggedFn'},
        link: function (scope, elem, attrs) {
          var geocoder = new google.maps.Geocoder();
          var location;
          scope.$watch('coordinates', function (newValue, oldValue) {
            if (newValue) {
              scope.coordinates = newValue;
              if (scope.coordinates.length) {
                const options =  {
                  center: new google.maps.LatLng(scope.coordinates[1], scope.coordinates[0]),
                  streetViewControl: false,
                  mapTypeControl: false,
                  zoom: 15,
                  mapTypeId: google.maps.MapTypeId.ROADMAP,
                  mapId: 'contentMap'
                }
                if (VersionCheckService.isCameraControlVersion()) {
                  options.cameraControl = false;
                } else {
                  options.zoomControl = false;
                }
                var map = new google.maps.Map(elem[0],options);
                var marker = new google.maps.marker.AdvancedMarkerElement({
                  position: new google.maps.LatLng(scope.coordinates[1], scope.coordinates[0]),
                  map: map,
                  gmpDraggable: true
                });

                var styleOptions = {
                  name: "Report Error Hide Style"
                };
                var MAP_STYLE = [
                  {
                    stylers: [
                      {visibility: "on"}
                    ]
                  }];
                var mapType = new google.maps.StyledMapType(MAP_STYLE, styleOptions);
                map.mapTypes.set("Report Error Hide Style", mapType);
                map.setMapTypeId("Report Error Hide Style");
              }
              google.maps.event.addListener(marker, 'dragend', function (event) {
                scope.coordinates = [event.latLng.lng(), event.latLng.lat()];
                geocoder.geocode({
                  latLng: marker.position
                }, function (responses) {
                  if (responses && responses.length > 0) {
                    scope.location = responses[0].formatted_address;
                    scope.draggedGeoData({
                      data: {
                        location: scope.location,
                        coordinates: scope.coordinates
                      }
                    });
                  } else {
                    location = 'Cannot determine address at this location.';
                  }

                });
              });
            }

          }, true);
        }
      }
    }])
    .directive('ngEnter', function () {
      return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
          if (event.which === 13) {
            var val = $(element).val(),
              regex = /^[0-9\-\., ]+$/g;
            if (regex.test(val)) {
              scope.$apply(function () {
                scope.$eval(attrs.ngEnter);
              });

              event.preventDefault();
            }
          }
        });
      };
    })
    .filter('getImageUrl', function () {
      return function (url, width, height, type) {
        if (type == 'resize')
          return buildfire.imageLib.resizeImage(url, {
            width: width,
            height: height
          });
        else
          return buildfire.imageLib.cropImage(url, {
            width: width,
            height: height
          });
      }
    })
    .filter('getTimeZone', function () {

      var timeZoneObbr = {
        "+0000": "GMT",
        "-0100": "EGT",
        "-1000": "CKT",
        "+0100": "WAT",
        "+1000": "AEST",
        "-1100": "SST",
        "-1200": "Y",
        "+1030": "ACDT",
        "+1100": "AEDT",
        "-0200": "BRST",
        "-0230": "NDT",
        "-0300": "ADT",
        "+1200": "NZST",
        "+1245": "CHAST",
        "-0330": "NST",
        "+1300": "WST",
        "+1345": "CHADT",
        "+1400": "LINT",
        "+0200": "EET",
        "+0300": "AST",
        "+0330": "IRST",
        "+0400": "GET",
        "-0400": "AST",
        "+0430": "IRDT",
        "+0500": "PKT",
        "-0430": "VET",
        "+0530": "IST",
        "+0545": "NPT",
        "+0600": "BST",
        "-0500": "EST",
        "-0600": "CST",
        "+0630": "MMT",
        "-0700": "MST",
        "+0700": "ICT",
        "-0800": "PST",
        "+0800": "CST",
        "-0900": "AKST",
        "+0845": "ACWST",
        "+0900": "JST",
        "-0930": "MART",
        "+0930": "ACST"
      };
      return function (input) {
        return timeZoneObbr[input];
      };
    })
    .directive('dateTime', function () {
      return {
        require: 'ngModel',
        scope: {},
        link: function (scope, elem, attrs, ngModel) {
          ngModel.$formatters.push(function (value) {
            //to view
            return new Date(value);
          });
          ngModel.$parsers.push(function (value) {
            //to model
            return +new Date(value);
          });
        }
      };
    })
    .service('ScriptLoaderService', ['$q', function ($q) {
      this.loadScript = function () {
        const { apiKeys } = buildfire.getContext();
        const { googleMapKey } = apiKeys;
        const url = ` https://maps.googleapis.com/maps/api/js?v=weekly&key=${googleMapKey}&libraries=places,marker`;

        const deferred = $q.defer();

        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = url;

        script.onload = function () {
          console.info(`Successfully loaded script: ${url}`);
          deferred.resolve();
        };

        script.onerror = function () {
          console.error(`Failed to load script: ${url}`);
          deferred.reject('Failed to load script.');
        };

        document.head.appendChild(script);
        return deferred.promise;
      };
    }])

    .run(['Location', '$rootScope','ScriptLoaderService', function (Location, $rootScope, ScriptLoaderService) {

      ScriptLoaderService.loadScript()
        .then(() => {
          console.info("Successfully loaded Google's Maps SDK.");
        })
        .catch(() => {
          console.error("Failed to load Google Maps SDK.");
        });

      buildfire.messaging.onReceivedMessage = function (msg) {
        switch (msg.type) {
          case 'OpenItem':
            Location.goTo("#/event/" + msg.id);
            break;
          default:
            Location.goToHome();
        }
      };

      buildfire.history.onPop(function (data, err) {
        if (data.label != "Event") {
          Location.goToHome();
        }
      });
    }]);
})(window.angular, window.buildfire);
