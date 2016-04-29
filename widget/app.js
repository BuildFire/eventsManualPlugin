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

      //buildfire.navigation.onBackButtonClick = function () {
      //  var reg = /^\/event/;
      //  if (reg.test($location.path()) && $rootScope.showFeed == false) {
      //    buildfire.messaging.sendMessageToControl({});
      //    //   buildfire.history.pop();
      //    $rootScope.showFeed = true;
      //    Location.goTo('#/');
      //  }
      //  else {
      //    buildfire.navigation._goBackOne();
      //  }
      //};
        buildfire.history.onPop(function(data, err){
          buildfire.messaging.sendMessageToControl({});
          $rootScope.showFeed = true;
          Location.goTo('#/');
        })
    }]);
})(window.angular, window.buildfire, window);
