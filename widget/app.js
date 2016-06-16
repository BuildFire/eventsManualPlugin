'use strict';

(function (angular, buildfire, window) {
  angular.module('eventsManualPluginWidget', ['ngRoute', 'ngTouch', 'ui.bootstrap', 'infinite-scroll', 'ngAnimate'])
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
    }).filter('cropImage', [function () {
      return function (url, width, height, noDefault) {
        if(noDefault)
        {
          if(!url)
            return '';
        }
        return buildfire.imageLib.cropImage(url, {
          width: width,
          height: height
        });
      };
    }])
    .directive('backImg', ["$filter", "$rootScope", "$window" , function ($filter, $rootScope, $window) {
      return function (scope, element, attrs) {
        attrs.$observe('backImg', function (value) {
          var img = '';
          if (value) {
            img = $filter("cropImage")(value, $window.innerWidth, $window.innerHeight, true);
            element.attr("style", 'background:url(' + img + ') !important');
            element.css({
              'background-size': 'cover'
            });
          }
          else {
            img = "";
            element.attr("style", '');
            element.css({
              'background-size': 'cover'
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
    .directive("googleMap", function () {
      return {
        template: "<div></div>",
        replace: true,
        scope: {coordinates: '='},
        link: function (scope, elem, attrs) {
          scope.$watch('coordinates', function (newValue, oldValue) {
            if (newValue) {
              scope.coordinates = newValue;
              if (scope.coordinates.length) {
                var map = new google.maps.Map(elem[0], {
                  center: new google.maps.LatLng(scope.coordinates[1], scope.coordinates[0]),
                  zoomControl: false,
                  streetViewControl: false,
                  mapTypeControl: false,
                  zoom: 15,
                  mapTypeId: google.maps.MapTypeId.ROADMAP
                });
                var marker = new google.maps.Marker({
                  position: new google.maps.LatLng(scope.coordinates[1], scope.coordinates[0]),
                  map: map
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
                      if (context.device && context.device.platform == 'ios')
                        window.open("maps://maps.google.com/maps?daddr=" + scope.coordinates[1] + "," + scope.coordinates[0]);
                      else
                        window.open("http://maps.google.com/maps?daddr=" + scope.coordinates[1] + "," + scope.coordinates[0]);
                    }
                  });
                });
              }
            }
          }, true);
        }
      }
    })
    .directive("loadImage", [function () {
      return {
        restrict: 'A',
        link: function (scope, element, attrs) {
          element.attr("src", "../../../styles/media/holder-" + attrs.loadImage + ".gif");

          var elem = $("<img>");
          elem[0].onload = function () {
            element.attr("src", attrs.finalSrc);
            elem.remove();
          };
          elem.attr("src", attrs.finalSrc);
        }
      };
    }])
    .run(['Location', '$location', '$rootScope', function (Location, $location, $rootScope) {

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
