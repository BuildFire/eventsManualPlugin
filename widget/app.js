'use strict';

(function (angular, buildfire) {
  angular.module('eventsManualPluginWidget', ['ngRoute', 'ui.bootstrap'])
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
  });
})(window.angular, window.buildfire);
