'use strict';

(function (angular, buildfire, window) {
  angular.module('eventsManualPluginWidget', ['ngRoute', 'ngTouch', 'ui.bootstrap', 'infinite-scroll', 'ngAnimate','utils'])
    .config(['$routeProvider', '$compileProvider', function ($routeProvider, $compileProvider) {

      /**
       * To make href urls safe on mobile
       */
      $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension|cdvfile|file):/);


      $routeProvider
        .when('/', {
          template: '<div></div>'
        })
        .when('/event/:id', {
          templateUrl: 'templates/eventDetails.html',
          controller: 'WidgetEventCtrl',
          controllerAs: 'WidgetEvent'
        })
        .otherwise('/');
    }])
    .filter('getMonth', function () {
      var monthsObj = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
      return function (input) {
        return monthsObj[new Date(input).getMonth()];
      };
    })
    .filter('getDate', function () {
      return function (input) {
        return new Date(input).getDate();
      };
    })
    /*.filter('getImageUrl', ['Buildfire', function (Buildfire) {
      filter.$stateful = true;
      function filter(url, width, height, type) {
        var _imgUrl;
        if (!_imgUrl) {
          if (type == 'resize') {
            Buildfire.imageLib.local.resizeImage(url, {
              width: width,
              height: height
            }, function (err, imgUrl) {
              _imgUrl = imgUrl;
            });
          } else {
            Buildfire.imageLib.local.cropImage(url, {
              width: width,
              height: height
            }, function (err, imgUrl) {
              _imgUrl = imgUrl;
            });
          }
        }

        return _imgUrl;
      }
      return filter;
    }])*/
    .filter('cropImage', [function () {
      function filter (url, width, height, noDefault) {
        var _imgUrl;
        filter.$stateful = true;
        if(noDefault)
        {
          if(!url)
            return '';
        }
        if (!_imgUrl) {
          buildfire.imageLib.local.cropImage(url, {
            width: width,
            height: height
          }, function (err, imgUrl) {
            _imgUrl = imgUrl;
          });
        }
        return _imgUrl;
      }
      return filter;
    }])
    .directive('backImg', ["$filter", "$rootScope", "$window" , function ($filter, $rootScope, $window) {
      return function (scope, element, attrs) {
        attrs.$observe('backImg', function (value) {
          var img = '';
          if (value) {
            buildfire.imageLib.local.cropImage(value, {
                width: $rootScope.deviceWidth,
               height: $rootScope.deviceHeight
            }, function (err, imgUrl) {
              img = imgUrl;
              element.attr("style", 'background:url(' + img + ') !important;background-size:cover !important');
              element.css({
                'background-size': 'cover !important'
              });
            });

          }
          else {
            img = "";
            element.attr("style", '');
            element.css({
              'background-size': 'cover !important'
            });
          }
        });
      };
    }])
    .filter('getTimeZone', function () {
      var timezone = jstz.determine();
      console.log(timezone.name());
      return function (input) {
        return moment.tz(timezone.name()).format("z");
      };
    })
    .directive("buildFireCarousel", ["$rootScope", "$timeout", function ($rootScope, $timeout) {
      return {
        restrict: 'A',
        link: function (scope, elem, attrs) {
          $timeout(function () {
            $rootScope.$broadcast("Carousel:LOADED");
          });
        }
      };
    }])
    .directive("googleMap", ['ScriptLoaderService','VersionCheckService',function (ScriptLoaderService,VersionCheckService) {
      return {
        template: "<div></div>",
        replace: true,
        scope: {coordinates: '='},
        link: function (scope, elem, attrs) {
          scope.$watch('coordinates', function (newValue, oldValue) {
            if (newValue) {
              scope.coordinates = newValue;
              if (scope.coordinates.length) {
                ScriptLoaderService.loadScript()
                  .then(() => {
                    const options =  {
                      center: new google.maps.LatLng(scope.coordinates[1], scope.coordinates[0]),
                      streetViewControl: false,
                      mapTypeControl: false,
                      zoom: 15,
                      mapTypeId: google.maps.MapTypeId.ROADMAP,
                      mapId: 'widgetMap'
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

                    marker.addListener('click', function () {

                      buildfire.getContext(function (err, context) {
                        if (context) {
                          if (context.device && context.device.platform.toLowerCase() == 'ios')
                            window.open("maps://maps.apple.com?q=" + scope.coordinates[1] + "," + scope.coordinates[0]);
                          else
                            window.open("http://maps.google.com/maps?daddr=" + scope.coordinates[1] + "," + scope.coordinates[0]);
                        }
                      });
                    });
                  })
                  .catch(() => {
                    console.error("Failed to load Google Maps SDK.");
                    buildfire.dialog.alert({
                      title: 'Error',
                      message: 'Failed to load Google Maps API.',
                    });
                  });
              }
            }
          }, true);
          window.gm_authFailure = function () {
            console.error("Invalid Google Maps API key.");
            buildfire.dialog.alert({
              title: 'Error',
              message: 'Failed to load Google Maps API.',
            });
          };
        }
      }
    }])
    .directive("loadImage", ['Buildfire', function (Buildfire) {
      return {
        restrict: 'A',
        link: function (scope, element, attrs) {
          element.attr("src", "../../../styles/media/holder-" + attrs.loadImage + ".gif");

          var _img = attrs.finalSrc;
          if (attrs.cropType == 'resize') {
            Buildfire.imageLib.local.resizeImage(_img, {
              width: attrs.cropWidth,
              height: attrs.cropHeight
            }, function (err, imgUrl) {
              _img = imgUrl;
              replaceImg(_img);
            });
          } else {
            Buildfire.imageLib.local.cropImage(_img, {
              width: attrs.cropWidth,
              height: attrs.cropHeight
            }, function (err, imgUrl) {
              _img = imgUrl;
              replaceImg(_img);
            });
          }

          function replaceImg(finalSrc) {
            var elem = $("<img>");
            elem[0].onload = function () {
              element.attr("src", finalSrc);
              elem.remove();
            };
            elem.attr("src", finalSrc);
          }
        }
      };
    }])
    .service('ScriptLoaderService', ['$q', function ($q) {
      this.loadScript = function () {
        const {apiKeys} = buildfire.getContext();
        const {googleMapKey} = apiKeys;

        const url = `https://maps.googleapis.com/maps/api/js?v=weekly&key=${googleMapKey}&libraries=marker`;

        const deferred = $q.defer();

        // Check if the script is already in the document
        const existingScript = document.getElementById('googleMapsScript');
        if (existingScript) {
          // If the script is already in the document, remove it
          existingScript.parentNode.removeChild(existingScript);
        }

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
    .run(['Location', '$location', '$rootScope', 'ScriptLoaderService', function (Location, $location, $rootScope,ScriptLoaderService) {

      buildfire.messaging.onReceivedMessage = function (msg) {
        console.log('$location--------------------------------------------', $location, msg);
        switch (msg.type) {
          case 'AddNewItem':
            Location.goTo("#/event/" + msg.id + "?stopSwitch=true");
            break;
          case 'OpenItem':
            Location.goTo("#/event/" + msg.id);
            break;
          default:
            if ($rootScope.showFeed == false)
              Location.goToHome();
        }
      };

      buildfire.history.onPop(function (data, err) {
        buildfire.messaging.sendMessageToControl({});
        $rootScope.showFeed = true;
        Location.goTo('#/');
      });
    }]).config(function ($provide) {    //This directive is used to add watch in the calendar widget
      $provide.decorator('datepickerDirective', ['$delegate', '$rootScope', function ($delegate, $rootScope) {
        var directive = $delegate[0];
        var link = directive.link;
        directive.compile = function () {
          return function (scope, element, attrs, ctrls) {
            link.apply(this, arguments);
            var datepickerCtrl = ctrls[0]
              , ngModelCtrl = ctrls[1]; //New Change for refreshing views
            scope.$watch(function () {
              return ctrls[0].activeDate;

            }, function (oldValue, newValue) {
              if (oldValue.getMonth() !== newValue.getMonth()) {
                $rootScope.chnagedMonth = oldValue;
              }
             }, true);
            if (ngModelCtrl) { //New Change for refreshing views
              // Listen for 'refreshDatepickers' event...//New Change for refreshing views
              scope.$on('refreshDatepickers', function refreshView() {//New Change for refreshing views
                datepickerCtrl.refreshView();//New Change for refreshing views
              });//New Change for refreshing views
            }//New Change for refreshing views
          }
        };
        return $delegate;
      }]);
    });
})(window.angular, window.buildfire, window);
