'use strict';

(function (angular) {
  angular.module('eventsManualPluginWidget')
    .controller('WidgetHomeCtrl', ['$scope', 'TAG_NAMES', 'LAYOUTS', 'DataStore',
      function ($scope, TAG_NAMES, LAYOUTS, DataStore) {
        var WidgetHome = this;
        WidgetHome.data = null;
        WidgetHome.events =null;
        /*
         * Fetch user's data from datastore
         */
        var init = function () {
          var success = function (result) {
              WidgetHome.data = result.data;
              if (!WidgetHome.data.content)
                WidgetHome.data.content = {};
              if (!WidgetHome.data.design)
                WidgetHome.data.design = {};
              if (!WidgetHome.data.design.itemDetailsLayout) {
                WidgetHome.data.design.itemDetailsLayout = LAYOUTS.itemDetailsLayout[0].name;
              }
            }
            , error = function (err) {
              if (err && err.code !== STATUS_CODE.NOT_FOUND) {
                console.error('Error while getting data', err);
              }
            };
          var successEvents = function (result) {
            WidgetHome.events = result;

          }, errorEvents = function () {

          };
          DataStore.get(TAG_NAMES.EVENTS_MANUAL_INFO).then(success, error);
          DataStore.search({}, TAG_NAMES.EVENTS_MANUAL).then(successEvents, errorEvents);
        };

        init();
         $scope.getDayClass = function (date, mode) {

          var dayToCheck = new Date(date).setHours(0,0,0,0);
          var currentDay = new Date('2015-09-15T18:30:00.000Z').setHours(0,0,0,0);
          if (dayToCheck === currentDay) {
            return 'eventDate';
          }
        };
      }])
})(window.angular);
