'use strict';

(function (angular) {
  angular.module('eventsManualPluginWidget')
    .controller('WidgetHomeCtrl', ['$scope', 'TAG_NAMES', 'LAYOUTS', 'DataStore', 'PAGINATION', 'Buildfire', 'Location', 'EventCache',
      function ($scope, TAG_NAMES, LAYOUTS, DataStore, PAGINATION, Buildfire, Location, EventCache) {
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
        var formattedDate = currentDate.getFullYear() + "-" + moment(currentDate).format("MM") + "-" + ("0" + currentDate.getDate()).slice(-2) + "T00:00:00" + moment(new Date()).format("Z");
        var timeStampInMiliSec = +new Date(formattedDate);
        var currentLayout = "";

        WidgetHome.getUTCZone = function () {
          //return moment(new Date()).utc().format("Z");
          return moment(new Date()).format("Z")
        };

        WidgetHome.partOfTime = function (format, paramTime) {
          return moment(new Date(paramTime)).format(format);
        };

        WidgetHome.convertToZone = function (result) {
          for (var event = 0; event < result.length; event++) {
            WidgetHome.completeDateStart = moment(new Date(result[event].data.startDate))
              .add(WidgetHome.partOfTime('HH', result[event].data.startTime), 'hour')
              .add(WidgetHome.partOfTime('mm', result[event].data.startTime), 'minute')
              .add(WidgetHome.partOfTime('ss', result[event].data.startTime), 'second');
            WidgetHome.completeDateEnd = moment(new Date(result[event].data.endDate))
              .add(WidgetHome.partOfTime('HH', result[event].data.endTime), 'hour')
              .add(WidgetHome.partOfTime('mm', result[event].data.endTime), 'minute')
              .add(WidgetHome.partOfTime('ss', result[event].data.endTime), 'second');
            result[event].data.startDate = moment(WidgetHome.completeDateStart)
              .utcOffset(result[event].data.timeDisplay == 'SELECTED' && result[event].data.timezone["value"] ? result[event].data.timezone["value"] : WidgetHome.getUTCZone()).format('MMM D, YYYY');
            result[event].data.startTime = moment(WidgetHome.completeDateStart)
              .utcOffset(result[event].data.timeDisplay == 'SELECTED' && result[event].data.timezone["value"] ? result[event].data.timezone["value"] : WidgetHome.getUTCZone()).format('hh:mm A');
            result[event].data.endDate = moment(WidgetHome.completeDateEnd)
              .utcOffset(result[event].data.timeDisplay == 'SELECTED' && result[event].data.timezone["value"] ? result[event].data.timezone["value"] : WidgetHome.getUTCZone()).format('MMM D, YYYY');
            result[event].data.endTime = moment(WidgetHome.completeDateEnd)
              .utcOffset(result[event].data.timeDisplay == 'SELECTED' && result[event].data.timezone["value"] ? result[event].data.timezone["value"] : WidgetHome.getUTCZone()).format('hh:mm A');
            result[event].data.upadtedTtimeZone = moment(WidgetHome.completeDateEnd)
              .utcOffset(result[event].data.timeDisplay == 'SELECTED' && result[event].data.timezone["value"] ? result[event].data.timezone["value"] : WidgetHome.getUTCZone()).format('Z');
          }

        };
        var getManualEvents = function () {
          Buildfire.spinner.show();
          var successEvents = function (result) {
            Buildfire.spinner.hide();
            WidgetHome.convertToZone(result);
            WidgetHome.events = WidgetHome.events.length ? WidgetHome.events.concat(result) : result;
            searchOptions.skip = searchOptions.skip + PAGINATION.eventsCount;
            if (result.length == PAGINATION.eventsCount) {
              WidgetHome.busy = false;
            }
            WidgetHome.clickEvent = false;
          }, errorEvents = function () {
            Buildfire.spinner.hide();
            console.log("Error fetching events");
          };
          var successEventsAll = function (resultAll) {
                WidgetHome.allEvents = [];
                WidgetHome.convertToZone(resultAll);
                WidgetHome.allEvents = resultAll;
              },
              errorEventsAll = function (error) {
                console.log("error", error)
              };

          DataStore.search({}, TAG_NAMES.EVENTS_MANUAL).then(successEventsAll, errorEventsAll);
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
              currentLayout = WidgetHome.data.design.itemDetailsLayout;
            }
            , error = function (err) {
              if (err && err.code !== STATUS_CODE.NOT_FOUND) {
                console.error('Error while getting data', err);
              }
            };

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
          formattedDate = $scope.dt.getFullYear() + "-" + moment($scope.dt).format("MM") + "-" + ("0" + $scope.dt.getDate()).slice(-2) + "T00:00:00" + WidgetHome.getUTCZone();
          timeStampInMiliSec = +new Date(formattedDate);
          WidgetHome.loadMore();
        };

        WidgetHome.addEvents = function (e, i, toggle) {
          toggle ? WidgetHome.swiped[i] = true : WidgetHome.swiped[i] = false;
        };

        WidgetHome.addEventsToCalendar = function (event) {
          /*Add to calendar event will add here*/
          alert(">>>>>>>>>>>>>>>>>>>>>>>>>>>");
          alert("inCal:" + buildfire.device.calendar);
          if (buildfire.device && buildfire.device.calendar) {
            buildfire.device.calendar.addEvent(
              {
                title: event.data.title
                , location: event.data.address.location
                , notes: event.data.description
                , startDate: new Date(event.data.startDate)
                , endDate: new Date(event.data.endDate)
                , options: {
                firstReminderMinutes: 120
                ,
                secondReminderMinutes: 5
                ,
                recurrence: event.data.repeat.repeatType
                ,
                recurrenceEndDate: event.data.repeat.repeatType ? new Date(event.data.repeat.endOn) : new Date(2025, 6, 1, 0, 0, 0, 0, 0)
              }
              }
              ,
              function (err, result) {
                alert("Done");
                if (err)
                  alert("******************" + err);
                else
                  alert('worked ' + JSON.stringify(result));
              }
            );
          }
          console.log(">>>>>>>>", event);
        };

        WidgetHome.loadMore = function () {
          if (WidgetHome.busy) return;
          WidgetHome.busy = true;
          getManualEvents();
        };

        /*This method is used to navigate to particular event details page*/
        WidgetHome.openDetailsPage = function (event) {
          EventCache.setCache(event);
          Location.goTo('#/event/' + event.id);
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

                  if (currentLayout && currentLayout != WidgetHome.data.design.itemDetailsLayout) {
                    if (WidgetHome.events && WidgetHome.events.length) {
                      var id = WidgetHome.events[0].id;
                      Location.goTo("#/event/" + id);
                    }
                  }


                  break;
                case TAG_NAMES.EVENTS_MANUAL:
                  WidgetHome.events = [];
                     WidgetHome.allEvents = null;
                  searchOptions = {
                    skip: 0,
                    limit: PAGINATION.eventsCount,
                    sort: {"startDate": 1}
                  };
                    WidgetHome.busy = false;
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
