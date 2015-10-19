'use strict';

(function (angular) {
  angular.module('eventsManualPluginWidget')
    .controller('WidgetHomeCtrl', ['$scope', 'TAG_NAMES', 'LAYOUTS', 'DataStore', 'PAGINATION', 'Buildfire',
      function ($scope, TAG_NAMES, LAYOUTS, DataStore, PAGINATION, Buildfire) {
        var WidgetHome = this;
        WidgetHome.data = null;
        WidgetHome.swiped = [];
        WidgetHome.events = [];
        WidgetHome.allEvents = null;
        WidgetHome.busy = false;
        WidgetHome.clickEvent = false;
        $scope.dt = new Date();
        var searchOptions = {
          skip: 0,
          limit: PAGINATION.eventsCount,
          sort: {"startDate": 1}
        };
        var currentDate = new Date();
        var formattedDate = moment(currentDate).format("MMM") + " " + currentDate.getFullYear() + ", " + currentDate.getDate();
        var timeStampInMiliSec = +new Date("'" + formattedDate + "'");

        var getManualEvents = function () {
          alert(">>>>>>>>>>>>>>>>>>>");
          Buildfire.spinner.show();
          var successEvents = function (result) {
            alert("**************success"+result.length);
            Buildfire.spinner.hide();
            WidgetHome.events = WidgetHome.events.length ? WidgetHome.events.concat(result) : result;
            searchOptions.skip = searchOptions.skip + PAGINATION.eventsCount;
            if (result.length == PAGINATION.eventsCount) {
              WidgetHome.busy = false;
            }
            WidgetHome.clickEvent = false;
          }, errorEvents = function () {
            alert("**************error");
            Buildfire.spinner.hide();
            console.log("Error fetching events");
          };

          searchOptions.filter = {"$or": [{"data.startDate": {"$gt": timeStampInMiliSec}}, {"data.startDate": {"$eq": timeStampInMiliSec}}]};
          DataStore.search(searchOptions, TAG_NAMES.EVENTS_MANUAL).then(successEvents, errorEvents);
        };

        /**
         * init() function invocation to fetch previously saved user's data from datastore.
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
          var successEventsAll = function (resultAll) {
                WidgetHome.allEvents=[];
              WidgetHome.allEvents = resultAll;
            },
            errorEventsAll = function (error) {
              console.log("error", error)
            };

          DataStore.search({}, TAG_NAMES.EVENTS_MANUAL).then(successEventsAll, errorEventsAll);
          DataStore.get(TAG_NAMES.EVENTS_MANUAL_INFO).then(success, error);
        };

        /*
         * Fetch user's data from datastore
         */
        WidgetHome.getEvent = function () {
          WidgetHome.clickEvent = true;
          WidgetHome.events = {};
          searchOptions.skip = 0;
          WidgetHome.busy = false;
          WidgetHome.disabled = true;
          formattedDate = moment($scope.dt).format("MMM") + " " + $scope.dt.getFullYear() + ", " + $scope.dt.getDate();
          timeStampInMiliSec = +new Date("'" + formattedDate + "'");
          WidgetHome.loadMore();
        };

        WidgetHome.addEvents = function (e, i, toggle) {
          toggle ? WidgetHome.swiped[i] = true : WidgetHome.swiped[i] = false;
        };

        WidgetHome.addEventsToCalendar = function (event) {
          /*Add to calendar event will add here*/
          alert(">>>>>>>>>>>>>>>>>>>>>>>>>>>");
          alert("inCal:"+buildfire.device.calendar);
           if(buildfire.device && buildfire.device.calendar) {
           buildfire.device.calendar.addEvent(
               {
                 title: 'Dannys Birthday'
                 , location: event.data.address.location
                 , notes: 'Better bring a gift'
                 , startDate: event.data.startDate
                 , endDate: event.data.endDate
                 , options: {
                 firstReminderMinutes: 120
                 , secondReminderMinutes: 5
                 , recurrence: "yearly"
                 , recurrenceEndDate: new Date(2025, 6, 1, 0, 0, 0, 0, 0)
               }
               }
               ,
               function (err, result) {
                 alert("Done");
                 if (err)
                   alert("******************"+err);
                 else
                   alert('worked ' + JSON.stringify(result));
               }
           );
         }
          console.log(">>>>>>>>",event);
        };

        WidgetHome.loadMore = function () {
          alert("&&&&&&&&&&&&&Loadmore");
          if (WidgetHome.busy) return;
          WidgetHome.busy = true;
          getManualEvents();
        };

        $scope.getDayClass = function (date, mode) {

          var dayToCheck = new Date(date).setHours(0, 0, 0, 0);
          var currentDay;
          for (var i = 0; i < WidgetHome.allEvents.length; i++) {
            currentDay = new Date(WidgetHome.allEvents[i].data.startDate).setHours(0, 0, 0, 0);
            if (dayToCheck === currentDay) {
              return 'eventDate';
            }
          }
        };

        var onUpdateCallback = function (event) {
          setTimeout(function () {
            if (event && event.tag) {
              switch (event.tag) {
                case TAG_NAMES.EVENTS_MANUAL_INFO:
                  WidgetHome.data = event.data;
                  if (!WidgetHome.data.design)
                    WidgetHome.data.design = {};
                  if (!WidgetHome.data.design.itemDetailsLayout) {
                    WidgetHome.data.design.itemDetailsLayout = LAYOUTS.itemDetailsLayout[0].name;
                  }

                  break;
                case TAG_NAMES.EVENTS_MANUAL:
                  WidgetHome.events = [];
                  searchOptions = {
                    skip: 0,
                    limit: PAGINATION.eventsCount, 
                    sort: {"startDate": 1}
                  };
                  WidgetHome.loadMore();
                  break;
              }
              $scope.$digest();
            }
          }, 0);
        };

        /**
         * DataStore.onUpdate() is bound to listen any changes in datastore
         */
        DataStore.onUpdate().then(null, null, onUpdateCallback);

        $scope.$on("$destroy", function () {
          DataStore.clearListener();
        });

        init();

      }])
})(window.angular);
