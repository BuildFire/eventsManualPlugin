'use strict';

(function (angular, buildfire) {
  angular.module('eventsManualPluginWidget', ['ngRoute', 'ui.bootstrap', 'infinite-scroll'])
    .config(['$routeProvider', function ($routeProvider) {
      $routeProvider
        .when('/', {
          templateUrl: 'templates/home.html',
          controllerAs: 'WidgetHome',
          controller: 'WidgetHomeCtrl'
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
    .filter('getTime', function () {
      return function (input) {
        return moment(new Date(input)).format('hh:mm A');
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
    .directive("buildFireCarousel", ["$rootScope", function ($rootScope) {
      return {
        restrict: 'A',
        link: function (scope, elem, attrs) {
          $rootScope.$broadcast("Carousel:LOADED");
        }
      };
    }])
    .run(['Location', function (Location) {
      buildfire.messaging.onReceivedMessage = function (msg) {
        alert("Called widget>>>"+msg.type + msg.id);
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
    }]);
})(window.angular, window.buildfire);
