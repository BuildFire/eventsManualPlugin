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
        WidgetHome.flag = false;
        $scope.dt = new Date();
        WidgetHome.getLastDateOfMonth = function (date) {
          return moment(date).endOf('month').format('DD');
        };
        WidgetHome.getFirstDateOfMonth = function (date) {
          return moment(date).startOf('month').format('DD');
        };
        var configureDate = new Date();
        //var eventEndDate = moment(configureDate.getFullYear()+"-"+moment(configureDate).format("MM")+"-"+'01').unix()*1000;
        var eventRecEndDate = configureDate.getFullYear() + "-" + moment(configureDate).format("MM") + "-" + WidgetHome.getLastDateOfMonth(configureDate) + "T23:59:59" + moment(new Date()).format("Z");
        var eventStartDate = configureDate.getFullYear() + "-" + moment(configureDate).format("MM") + "-" + WidgetHome.getFirstDateOfMonth(configureDate) + "T00:00:00" + moment(new Date()).format("Z");
        var recurringEndDate = configureDate.getFullYear() + "-" + moment(configureDate).format("MM") + "-" + WidgetHome.getLastDateOfMonth(configureDate) + "T00:00:00" + moment(new Date()).format("Z");
        var eventRecEndDateCheck = null;
        $rootScope.showFeed = true;
        $rootScope.deviceHeight = window.innerHeight;
        $rootScope.deviceWidth = window.innerWidth || 320;
        var searchOptions = {
          //skip: 0,
          //limit: PAGINATION.eventsCount,
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
        var getRepeatUnit = function (repeatType) {
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
        };

        //translates days from the result object to the number for recurring.js and places in array
        var getRepeatDays = function (days) {
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
        };

        //returns the last day of the month based on current date
        var getLastDayMonth = function () {
          var month = currentDate.getMonth();
          var year = currentDate.getFullYear();
          var last_day = new Date(year, month + 1, 0);
          last_day = last_day.toISOString();
          return last_day;
        };

        //this function will add repeating events to the result array to the repeat_until date passed in
        var expandRepeatingEvents = function (result, repeat_until, AllEvent) {
          var repeat_results = [];
          for (var i = 0; i < result.length; i++) {
            if (result[i].data.repeat.isRepeating && result[i].data.repeat.repeatType) {
              var repeat_unit = getRepeatUnit(result[i].data.repeat.repeatType);
              if (repeat_unit === "w") {    //daily repeats do not specify day
                if (!result[i].data.repeat.days) {
                  result[i].data.repeat.days = {}
                }
                if (!Object.keys(result[i].data.repeat.days).length) {
                  switch (new Date(result[i].data.repeat.startDate).getDay()) {
                    case 0:
                      result[i].data.repeat.days.sunday = true;
                      break;
                    case 1:
                      result[i].data.repeat.days.monday = true;
                      break;
                    case 2:
                      result[i].data.repeat.days.tuesday = true;
                      break;
                    case 3:
                      result[i].data.repeat.days.wednesday = true;
                      break;
                    case 4:
                      result[i].data.repeat.days.thursday = true;
                      break;
                    case 5:
                      result[i].data.repeat.days.friday = true;
                      break;
                    case 6:
                      result[i].data.repeat.days.saturday = true;
                      break;
                  }
                  var repeat_days = getRepeatDays(result[i].data.repeat.days);
                } else
                  var repeat_days = getRepeatDays(result[i].data.repeat.days);
              }

              if ((result[i].data.repeat.startDate && result[i].data.repeat.endOn == undefined) && new Date(result[i].data.repeat.startDate).getMonth() >= new Date(eventRecEndDate).getMonth()) {
                recurringEndDate = configureDate.getFullYear() + "-" + moment(configureDate).format("MM") + "-" + WidgetHome.getLastDateOfMonth(configureDate) + "T00:00:00" + moment(new Date()).format("Z");
              }
              var pattern = {
                // start: AllEvent?result[i].data.repeat.startDate:+new Date(result[i].data.repeat.startDate) < timeStampInMiliSec && +new Date(result[i].data.startDate) < timeStampInMiliSec? timeStampInMiliSec : result[i].data.repeat.startDate,
                start: result[i].data.repeat.startDate,
                every: result[i].data.repeat.repeatCount ? result[i].data.repeat.repeatCount : 1,
                unit: repeat_unit,
                end_condition: 'until',
                //until: result[i].data.repeat.isRepeating && result[i].data.repeat.endOn ? result[i].data.repeat.endOn : repeat_until,
                //until: +new Date(eventEndDate) < +new Date(result[i].data.repeat.endOn) || new Date(result[i].data.repeat.endOn)=='Invalid Date'?recurringEndDate:result[i].data.repeat.endOn,
                until: +new Date(eventRecEndDate) < +new Date(result[i].data.repeat.endOn) ? eventRecEndDate : result[i].data.repeat.endOn,
                days: repeat_days
              };

              if (result[i].data.repeat.endOn == undefined && result[i].data.repeat.end !== 'NEVER') {
                var recurringEndDate = moment(result[i].data.repeat.startDate).format('YYYY') + "-" + moment(result[i].data.repeat.startDate).format("MM") + "-" + WidgetHome.getLastDateOfMonth(result[i].data.repeat.startDate) + "T00:00:00" + moment(new Date()).format("Z");
                pattern.until = recurringEndDate;
              }

              if (result[i].data.repeat.endOn == undefined && result[i].data.repeat.end == 'NEVER') {
                pattern.until = eventRecEndDate;
              }

              if (result[i].data.repeat.end == 'AFTER') {
                pattern.end_condition = 'for';
                pattern.rfor = result[i].data.repeat.endAfter;
              }

              //use recurring.js from https://www.npmjs.com/package/recurring-date
              var r = new RecurringDate(pattern);
              var dates = r.generate();
              //add repeating events to the result
              for (var j = 0; j < dates.length; j++) {
                var temp_result = JSON.parse(JSON.stringify(result[i]));
                temp_result.data.startDate = Date.parse(dates[j]);
                temp_result.data.startTime = result[i].data.startTime;
                if (temp_result.data.startDate >= +new Date(eventStartDate) && temp_result.data.startDate <= +new Date(eventRecEndDate))
                  if (AllEvent)
                    repeat_results.push(temp_result);
                  else if (temp_result.data.startDate >= timeStampInMiliSec) {
                    repeat_results.push(temp_result);
                  }
              }
            } else {
              //save the result even if it is not repeating.

              if (result[i].data.startDate >= +new Date(eventStartDate) && result[i].data.startDate <= +new Date(eventRecEndDate))
                if (AllEvent)
                  repeat_results.push(result[i]);
                else if (result[i].data.startDate >= timeStampInMiliSec) {
                  repeat_results.push(result[i]);
                }
            }
          }
          //sort the list by start date
          repeat_results.sort(function (a, b) {
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
        };

        var getManualEvents = function () {
          WidgetHome.isCalled = false;
          WidgetHome.NoDataFound = false;
          Buildfire.spinner.show();
          var successEvents = function (result) {
            var repeat_until = getLastDayMonth();
            var resultRepeating = expandRepeatingEvents(result, repeat_until, false);
            if (resultRepeating || JSON.parse(localStorage.getItem("pluginLoadedFirst"))) {
              Buildfire.spinner.hide();
              if (!WidgetHome.events) {
                WidgetHome.events = [];
              }
              WidgetHome.events = WidgetHome.events.length ? WidgetHome.events.concat(resultRepeating) : resultRepeating;

              searchOptions.skip = searchOptions.skip + PAGINATION.eventsCount;

              WidgetHome.isCalled = true;
              //if (result.length <= PAGINATION.eventsCount) {
              //  WidgetHome.busy = false;
              //}
              //else {
              //  WidgetHome.busy = true;
              //}
              WidgetHome.clickEvent = false;
              WidgetHome.isCalled = true;
              $(".glyphicon").css('pointer-events', 'auto');
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
            if (WidgetHome.events.length)
              WidgetHome.NoDataFound = false;
            else
              WidgetHome.NoDataFound = true;
          }, errorEvents = function () {
            Buildfire.spinner.hide();
            console.log("Error fetching events");
          };
          WidgetHome.getAllEvents();
          //   searchOptions.filter = {"$or": [{"$json.startDate": {"$gt": timeStampInMiliSec}}, {"$json.startDate": {"$eq": timeStampInMiliSec}}, {"$json.repeat.startDate": {"$gt": timeStampInMiliSec}}, {"$json.repeat.startDate": {"$eq": timeStampInMiliSec}}]};
          DataStore.search({}, TAG_NAMES.EVENTS_MANUAL).then(successEvents, errorEvents);
        };

        WidgetHome.getAllEvents = function () {
          var successEventsAll = function (resultAll) {
              if (resultAll.length || JSON.parse(localStorage.getItem("pluginLoadedFirst"))) {
                WidgetHome.allEvents = [];
                var repeat_until = getLastDayMonth();
                resultAll = expandRepeatingEvents(resultAll, repeat_until, true);
                WidgetHome.allEvents = resultAll;
                $scope.$broadcast('refreshDatepickers');
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
          $(".text-muted").parent().addClass('disableCircle');
          WidgetHome.flag = false;
          formattedDate = $scope.dt.getFullYear() + "-" + moment($scope.dt).format("MM") + "-" + ("0" + $scope.dt.getDate()).slice(-2) + "T00:00:00" + WidgetHome.getUTCZone();
          timeStampInMiliSec = +new Date(formattedDate);
          if (!WidgetHome.clickEvent) {
            if ($rootScope.chnagedMonth == undefined) {
              configureDate = new Date();
              eventStartDate = configureDate.getFullYear() + "-" + moment(configureDate).format("MM") + "-" + WidgetHome.getFirstDateOfMonth(configureDate) + "T00:00:00" + moment(new Date()).format("Z");
              eventRecEndDate = configureDate.getFullYear() + "-" + moment(configureDate).format("MM") + "-" + WidgetHome.getLastDateOfMonth(configureDate) + "T23:59:59" + moment(new Date()).format("Z");
              WidgetHome.calledDate = +new Date(configureDate.getFullYear() + "-" + moment(configureDate).format("MM") + "-01" + "T00:00:00" + moment(new Date()).format("Z"))
              WidgetHome.clickEvent = true;
              WidgetHome.events = null;
              searchOptions.skip = 0;
              WidgetHome.busy = false;
              WidgetHome.disabled = true;
              WidgetHome.calledDate = timeStampInMiliSec;
              $(".glyphicon").css('pointer-events', 'none');
              WidgetHome.loadMore();
            } else {
              configureDate = new Date($rootScope.chnagedMonth);
              eventStartDate = configureDate.getFullYear() + "-" + moment(configureDate).format("MM") + "-" + WidgetHome.getFirstDateOfMonth(configureDate) + "T00:00:00" + moment(new Date()).format("Z");
              eventRecEndDate = configureDate.getFullYear() + "-" + moment(configureDate).format("MM") + "-" + WidgetHome.getLastDateOfMonth(configureDate) + "T23:59:59" + moment(new Date()).format("Z");
              WidgetHome.calledDate = +new Date(configureDate.getFullYear() + "-" + moment(configureDate).format("MM") + "-01" + "T00:00:00" + moment(new Date()).format("Z"))
              if (eventRecEndDateCheck != eventRecEndDate) {
                formattedDate = currentDate.getFullYear() + "-" + moment(currentDate).format("MM") + "-" + ("0" + currentDate.getDate()).slice(-2) + "T00:00:00" + moment(new Date()).format("Z");
                timeStampInMiliSec = +new Date(formattedDate);
                eventRecEndDateCheck = eventRecEndDate;
              }
              WidgetHome.clickEvent = true;
              WidgetHome.events = null;
              searchOptions.skip = 0;
              WidgetHome.busy = false;
              WidgetHome.disabled = true;
              WidgetHome.calledDate = timeStampInMiliSec;
              $(".glyphicon").css('pointer-events', 'none');
              WidgetHome.loadMore();
            }
          }

        };

        WidgetHome.addEvents = function (e, i, toggle) {
          WidgetHome.flag = true;
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
          var eventStartDate = new Date(event.data.startDate);
          var eventEndDate;
          if (event.data.endDate == '') {
            eventEndDate = eventStartDate;
          } else {
            eventEndDate = new Date(event.data.endDate);
          }
          if (event.data.repeat.isRepeating) {
            eventEndDate = eventStartDate;
          }
          //if (event.data.endDate == '') {
          //  eventEndDate = new Date(event.data.startDate + " " + "11:59 PM")
          //}
          //else {
          //  eventEndDate = new Date(event.data.endDate + " " + event.data.endTime);
          //}


          //  console.log("------------------",WidgetHome.getAddedEventToLocalStorage(event.id))
          //  WidgetHome.setAddedEventToLocalStorage(event.id);
          if (WidgetHome.getAddedEventToLocalStorage(event.id) != -1) {
            alert("Event already added in calendar");
          }
          console.log("inCal3:", eventEndDate, event, eventStartDate);
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
              return 'eventDate avoid-clicks-none';
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
                  WidgetHome.allEvents = [];
                  searchOptions = {
                    //skip: 0,
                    //limit: PAGINATION.eventsCount,
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

        buildfire.datastore.onRefresh(function () {
          WidgetHome.clickEvent = true;
          WidgetHome.events = null;
          WidgetHome.allEvents = null;
          searchOptions.skip = 0;
          WidgetHome.busy = false;
          WidgetHome.disabled = true;
          configureDate = new Date();
          eventStartDate = configureDate.getFullYear() + "-" + moment(configureDate).format("MM") + "-" + WidgetHome.getFirstDateOfMonth(configureDate) + "T00:00:00" + moment(new Date()).format("Z");
          eventRecEndDate = configureDate.getFullYear() + "-" + moment(configureDate).format("MM") + "-" + WidgetHome.getLastDateOfMonth(configureDate) + "T23:59:59" + moment(new Date()).format("Z");
          WidgetHome.calledDate = +new Date(configureDate.getFullYear() + "-" + moment(configureDate).format("MM") + "-01" + "T00:00:00" + moment(new Date()).format("Z"))
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
          if ($rootScope.showFeed) {
            WidgetHome.events = null;
            WidgetHome.allEvents = [];
            searchOptions.skip = 0;
            WidgetHome.busy = false;
            WidgetHome.loadMore();
          }
          DataStore.onUpdate().then(null, null, onUpdateCallback);
        });

        init();

      }])
})(window.angular, window.buildfire);
