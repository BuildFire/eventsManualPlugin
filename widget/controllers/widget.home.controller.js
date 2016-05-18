'use strict';

(function (angular, buildfire) {
  angular.module('eventsManualPluginWidget')
    .controller('WidgetHomeCtrl', ['$scope', 'TAG_NAMES', 'LAYOUTS', 'DataStore', 'PAGINATION', 'Buildfire', 'Location', 'EventCache', '$rootScope',
      function ($scope, TAG_NAMES, LAYOUTS, DataStore, PAGINATION, Buildfire, Location, EventCache, $rootScope) {
        console.log('Widget Home controller loaded------------------');
        var WidgetHome = this;
        WidgetHome.data = null;
        WidgetHome.swiped = [];
        WidgetHome.events = [];
        WidgetHome.allEvents = null;
        WidgetHome.busy = false;
        WidgetHome.clickEvent = false;
        WidgetHome.calledDate = null;
        $scope.dt = new Date();
        $rootScope.showFeed = true;
        $rootScope.deviceHeight = window.innerHeight;
        $rootScope.deviceWidth = window.innerWidth || 320;
        var searchOptions = {
          skip: 0,
          limit: PAGINATION.eventsCount,
          sort: {"startDate": 1}
        };
        var currentDate = new Date();
        var formattedDate = currentDate.getFullYear() + "-" + moment(currentDate).format("MM") + "-" + ("0" + currentDate.getDate()).slice(-2) + "T00:00:00" + moment(new Date()).format("Z");
        var timeStampInMiliSec = +new Date(formattedDate);
        var currentLayout = "";
        WidgetHome.NoDataFound = false;

        WidgetHome.getUTCZone = function () {
          //return moment(new Date()).utc().format("Z");
          return moment(new Date()).format("Z")
        };

        WidgetHome.partOfTime = function (format, paramTime) {
          return moment(new Date(paramTime)).format(format);
        };

        //translates the repeatType for recurring.js
        var getRepeatUnit = function(repeatType) {
          var repeat_unit;
          switch (repeatType) {
            case "Weekly":
              repeat_unit = "w";
              break;
            case "Daily":
              repeat_unit = "d";
              break;
            case "Monthly":
              repeat_unit = "m";
              break;
            case "Yearly":
              repeat_unit = "y";
              break;
          }
          return repeat_unit;
        }

        //translates days from the result object to the number for recurring.js and places in array
        var getRepeatDays = function(days) {
          var repeat_days = [];
          if (days.sunday) {
            repeat_days.push(0);
          }
          if (days.saturday) {
            repeat_days.push(6);
          }
          if (days.friday) {
            repeat_days.push(5);
          }
          if (days.thursday) {
            repeat_days.push(4);
          }
          if (days.wednesday) {
            repeat_days.push(3);
          }
          if (days.tuesday) {
            repeat_days.push(2);
          }
          if (days.monday) {
            repeat_days.push(1);
          }
          return repeat_days;
        }

        //returns the last day of the month based on current date
        var getLastDayMonth = function() {
          var month = currentDate.getMonth();
          var year = currentDate.getFullYear();
          var last_day = new Date(year, month + 1, 0);
          last_day = last_day.toISOString();
          return last_day;
        }

        //this function will add repeating events to the result array to the repeat_until date passed in
        var expandRepeatingEvents = function(result, repeat_until) {
           var repeat_results = [];
           for (var i = 0; i < result.length; i++) {
              if (result[i].data.repeat.isRepeating) {
                var repeat_unit = getRepeatUnit(result[i].data.repeat.repeatType);
                if (repeat_unit === "w") {    //daily repeats do not specify day
                  var repeat_days = getRepeatDays(result[i].data.repeat.days);
                }
                var pattern = {
                  start: result[i].data.repeat.startDate,
                  every: 1,
                  unit: repeat_unit,
                  end_condition: 'until',
                  until: repeat_until,
                  days: repeat_days
                };

                //use recurring.js from https://www.npmjs.com/package/recurring-date
                var r = new RecurringDate(pattern);
                var dates = r.generate();
                //add repeating events to the result
                for (var j = 0; j < dates.length; j++) {
                    var temp_result = JSON.parse(JSON.stringify(result[i]));
                    temp_result.data.startDate = Date.parse(dates[j]);
                    temp_result.data.startTime = Date.parse(dates[j]);
                    repeat_results.push(temp_result);
                }
              } else {
                //save the result even if it is not repeating.
                repeat_results.push(result[i]);
              }
           }
           //sort the list by start date
           repeat_results.sort(function (a, b){
             if (a.data.startDate > b.data.startDate) {
               return 1;
             }
             if (a.data.startDate < b.data.startDate) {
               return -1;
             }
             // a must be equal to b
             return 0;
           });
           return repeat_results;
        }

        var getManualEvents = function () {
          WidgetHome.isCalled = false;
          WidgetHome.NoDataFound = false;
          Buildfire.spinner.show();
          var successEvents = function (result) {
            var repeat_until = getLastDayMonth();
            result = expandRepeatingEvents(result, repeat_until);
            if (result.length || JSON.parse(localStorage.getItem("pluginLoadedFirst"))) {
              Buildfire.spinner.hide();
              if(!WidgetHome.events){
                WidgetHome.events = [];
              }
              console.log("===========================", WidgetHome.events.length);
              WidgetHome.events = WidgetHome.events.length ? WidgetHome.events.concat(result) : result;

              searchOptions.skip = searchOptions.skip + PAGINATION.eventsCount;
              WidgetHome.isCalled = true;
              if (result.length <= PAGINATION.eventsCount) {
                WidgetHome.busy = false;
              }
              else {
                WidgetHome.busy = true;
              }
              WidgetHome.clickEvent = false;
              WidgetHome.isCalled = true;
            }
            else {
              if (!result.length && !JSON.parse(localStorage.getItem("pluginLoadedFirst"))) {
                WidgetHome.NoDataFound = false;
              }
              if (!result.length && JSON.parse(localStorage.getItem("pluginLoadedFirst"))) {
                WidgetHome.NoDataFound = true;
              }
              if (result.length && !JSON.parse(localStorage.getItem("pluginLoadedFirst"))) {
                WidgetHome.NoDataFound = false;
              }
              WidgetHome.clickEvent = false;
              WidgetHome.dummyData = [{
                data: {
                  address: {},
                  addressTitle: "",
                  carouselImages: [],
                  dateCreated: 1451982804551,
                  deepLinkUrl: "",
                  description: "",
                  endDate: 1461522600000,
                  isAllDay: true,
                  links: [],
                  listImage: "",
                  repeat: {},
                  startDate: 1461522600000,
                  timeDisplay: "",
                  timezone: "",
                  title: "Lorem Ipsum Event"
                }
              }]

            }
            if (result.length || WidgetHome.events.length)
              WidgetHome.NoDataFound = false;
            else
              WidgetHome.NoDataFound = true;
          }, errorEvents = function () {
            Buildfire.spinner.hide();
            console.log("Error fetching events");
          };
          var successEventsAll = function (resultAll) {
              if (resultAll.length || JSON.parse(localStorage.getItem("pluginLoadedFirst"))) {
                WidgetHome.allEvents = [];
                var repeat_until = getLastDayMonth();
                resultAll = expandRepeatingEvents(resultAll, repeat_until);
                WidgetHome.allEvents = resultAll;
              } else {
                WidgetHome.dummyData = [{
                  data: {
                    address: {},
                    addressTitle: "",
                    carouselImages: [],
                    dateCreated: 1451982804551,
                    deepLinkUrl: "",
                    description: "",
                    endDate: 1461522600000,
                    isAllDay: true,
                    links: [],
                    listImage: "",
                    repeat: {},
                    startDate: 1461522600000,
                    timeDisplay: "",
                    timezone: "",
                    title: "Lorem Ipsum Event"
                  }
                }];
                WidgetHome.allEvents = WidgetHome.dummyData;
                WidgetHome.NoDataFound = false;
                WidgetHome.events = WidgetHome.dummyData;
                searchOptions.skip = searchOptions.skip + PAGINATION.eventsCount;
                localStorage.setItem('pluginLoadedFirst', false);
              }
            },
            errorEventsAll = function (error) {
              console.log("error", error)
            };

          DataStore.search({}, TAG_NAMES.EVENTS_MANUAL).then(successEventsAll, errorEventsAll);
          searchOptions.filter = {"$or": [{"$json.startDate": {"$gt": timeStampInMiliSec}}, {"$json.startDate": {"$eq": timeStampInMiliSec}}]};
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
          formattedDate = $scope.dt.getFullYear() + "-" + moment($scope.dt).format("MM") + "-" + ("0" + $scope.dt.getDate()).slice(-2) + "T00:00:00" + WidgetHome.getUTCZone();
          timeStampInMiliSec = +new Date(formattedDate);
          if (WidgetHome.calledDate !== timeStampInMiliSec) {
            WidgetHome.clickEvent = true;
            WidgetHome.events = null;
            searchOptions.skip = 0;
            WidgetHome.busy = false;
            WidgetHome.disabled = true;
            WidgetHome.calledDate = timeStampInMiliSec;
            WidgetHome.loadMore();
          }
        };

        WidgetHome.addEvents = function (e, i, toggle) {
          toggle ? WidgetHome.swiped[i] = true : WidgetHome.swiped[i] = false;
        };

        WidgetHome.setAddedEventToLocalStorage = function (eventId) {
          var addedEvents = [];
          addedEvents = JSON.parse(localStorage.getItem('localAddedEvents'));
          if (!addedEvents) {
            addedEvents = [];
          }
          addedEvents.push(eventId);
          localStorage.setItem('localAddedEvents', JSON.stringify(addedEvents));
        };

        WidgetHome.getAddedEventToLocalStorage = function (eventId) {
          var localStorageSavedEvents = [];
          localStorageSavedEvents = JSON.parse(localStorage.getItem('localAddedEvents'));
          if (!localStorageSavedEvents) {
            localStorageSavedEvents = [];
          }
          return localStorageSavedEvents.indexOf(eventId);
        };

        WidgetHome.addEventsToCalendar = function (event, i) {
          /*Add to calendar event will add here*/
          var eventStartDate = new Date(event.data.startDate + " " + event.data.startTime);
          var eventEndDate;
          if (event.data.endDate == '') {
            eventEndDate = new Date(event.data.startDate + " " + "11:59 PM")
          }
          else {
            eventEndDate = new Date(event.data.endDate + " " + event.data.endTime);
          }
          //  console.log("------------------",WidgetHome.getAddedEventToLocalStorage(event.id))
          //  WidgetHome.setAddedEventToLocalStorage(event.id);
          if (WidgetHome.getAddedEventToLocalStorage(event.id) != -1) {
            alert("Event already added in calendar");
          }
          console.log("inCal3:", eventEndDate, event);
          if (buildfire.device && buildfire.device.calendar && WidgetHome.getAddedEventToLocalStorage(event.id) == -1) {
            buildfire.device.calendar.addEvent(
              {
                title: event.data.title
                ,
                location: event.data.address.location
                ,
                notes: event.data.description
                ,
                startDate: new Date(eventStartDate.getFullYear(), eventStartDate.getMonth(), eventStartDate.getDate(), eventStartDate.getHours(), eventStartDate.getMinutes(), eventStartDate.getSeconds())
                ,
                endDate: new Date(eventEndDate.getFullYear(), eventEndDate.getMonth(), eventEndDate.getDate(), eventEndDate.getHours(), eventEndDate.getMinutes(), eventEndDate.getSeconds())
                ,
                options: {
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
                if (err)
                  console.log("******************" + err);
                else {
                  WidgetHome.swiped[i] = false;
                  console.log('worked ' + JSON.stringify(result));
                  WidgetHome.setAddedEventToLocalStorage(event.id);
                  alert("Event added to calendar");
                  $scope.$digest();
                }
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
                  //  WidgetHome.busy = false;
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

        buildfire.datastore.onRefresh(function () {
          WidgetHome.clickEvent = true;
          WidgetHome.events = null;
          WidgetHome.allEvents = null;
          searchOptions.skip = 0;
          WidgetHome.busy = false;
          WidgetHome.disabled = true;
          $scope.dt = new Date();
          formattedDate = currentDate.getFullYear() + "-" + moment(currentDate).format("MM") + "-" + ("0" + currentDate.getDate()).slice(-2) + "T00:00:00" + moment(new Date()).format("Z");
          timeStampInMiliSec = +new Date(formattedDate);
          WidgetHome.loadMore();
        });


        $scope.$on("$destroy", function () {
          DataStore.clearListener();
        });

        $rootScope.$on("ROUTE_CHANGED", function (e) {
          buildfire.datastore.onRefresh(function () {
            WidgetHome.clickEvent = true;
            WidgetHome.events = null;
            WidgetHome.allEvents = null;
            searchOptions.skip = 0;
            WidgetHome.busy = false;
            WidgetHome.disabled = true;
            $scope.dt = new Date();
            formattedDate = currentDate.getFullYear() + "-" + moment(currentDate).format("MM") + "-" + ("0" + currentDate.getDate()).slice(-2) + "T00:00:00" + moment(new Date()).format("Z");
            timeStampInMiliSec = +new Date(formattedDate);
            WidgetHome.loadMore();
          });
          DataStore.onUpdate().then(null, null, onUpdateCallback);
        });

        init();

      }])
})(window.angular, window.buildfire);
