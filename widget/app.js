'use strict';

(function (angular, buildfire,window) {
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
    })
    .filter('getTimeZone', function () {

      var timeZoneObbr =
      {
        "+00:00": "GMT",
        "-01:00": "EGT",
        "-10:00": "CKT",
        "+01:00": "WAT",
        "+10:00": "AEST",
        "-11:00": "SST",
        "-12:00": "Y",
        "+10:30": "ACDT",
        "+11:00": "AEDT",
        "-02:00": "BRST",
        "-02:30": "NDT",
        "-03:00": "ADT",
        "+12:00": "NZST",
        "+12:45": "CHAST",
        "-03:30": "NST",
        "+13:00": "WST",
        "+13:45": "CHADT",
        "+14:00": "LINT",
        "+02:00": "EET",
        "+03:00": "AST",
        "+03:30": "IRST",
        "+04:00": "GET",
        "-04:00": "AST",
        "+04:30": "IRDT",
        "+05:00": "PKT",
        "-04:30": "VET",
        "+05:30": "IST",
        "+05:45": "NPT",
        "+06:00": "BST",
        "-05:00": "EST",
        "-06:00": "CST",
        "+06:30": "MMT",
        "-07:00": "MST",
        "+07:00": "ICT",
        "-08:00": "PST",
        "+08:00": "CST",
        "-09:00": "AKST",
        "+08:45": "ACWST",
        "+09:00": "JST",
        "-09:30": "MART",
        "+09:30": "ACST"
      }
      return function (input) {
        return timeZoneObbr[input];
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
    .run(['Location', '$location', '$rootScope', function (Location, $location, $rootScope) {

      buildfire.messaging.onReceivedMessage = function (msg) {
        switch (msg.type) {
          case 'AddNewItem':
            Location.goTo("#/event/" + msg.id + "?stopSwitch=true");
            break;
          case 'OpenItem':
            Location.goTo("#/event/" + msg.id);
            break;
          default:
            Location.goToHome();
        }
      };

      buildfire.navigation.onBackButtonClick = function () {
        var reg = /^\/event/;
        if (reg.test($location.path())) {
          buildfire.messaging.sendMessageToControl({});
          buildfire.history.pop();
          $rootScope.showFeed = true;
          Location.goTo('#/');
        }
        else {
            buildfire.navigation._goBackOne();
        }
      };
    }]);
})(window.angular, window.buildfire, window);
