'use strict';

(function (angular, buildfire, window) {
  angular.module('eventsManualPluginWidget')
    .controller('WidgetEventCtrl', ['$scope', 'DataStore', 'TAG_NAMES', 'LAYOUTS', '$routeParams', '$sce', '$rootScope', 'Buildfire', '$location', 'EventCache',
      function ($scope, DataStore, TAG_NAMES, LAYOUTS, $routeParams, $sce, $rootScope, Buildfire, $location, EventCache) {

        var WidgetEvent = this;
        WidgetEvent.data = {};
        WidgetEvent.event = {};
        var breadCrumbFlag = true;
        var currentListLayout = null;
        $rootScope.deviceHeight = window.innerHeight;
        $rootScope.deviceWidth = window.innerWidth || 320;
        $rootScope.backgroundImage="";
        buildfire.history.get('pluginBreadcrumbsOnly', function (err, result) {
          if(result && result.length) {
            result.forEach(function(breadCrumb) {
              if(breadCrumb.label == 'Event') {
                breadCrumbFlag = false;
              }
            });
          }
          if(breadCrumbFlag) {
            buildfire.history.push('Event', { elementToShow: 'Event' });
          }
        });

        //create new instance of buildfire carousel viewer
        WidgetEvent.view = null;

        var _searchObj = $location.search();

        if ($routeParams.id && !_searchObj.stopSwitch) {
          $rootScope.showFeed = false;
          buildfire.messaging.sendMessageToControl({
            id: $routeParams.id,
            type: 'OpenItem'
          });
        }

        WidgetEvent.listeners = {};
        WidgetEvent.getUTCZone = function () {
          //return moment(new Date()).utc().format("Z");
          return moment(new Date()).format("Z")
        };

        WidgetEvent.partOfTime = function (format, paramTime) {
          return moment(new Date(paramTime)).format(format);
        };

        var getEventDetails = function (url) {
          var success = function (result) {
              $rootScope.showFeed = false;
              WidgetEvent.event = result;
            }
            , error = function (err) {
              $rootScope.showFeed = false;
              console.error('Error In Fetching Event', err);
            };
          if ($routeParams.id) {
            if (EventCache.getCache()) {
              $rootScope.showFeed = false;
              WidgetEvent.event = EventCache.getCache();
            }
            else
              DataStore.getById($routeParams.id, TAG_NAMES.EVENTS_MANUAL).then(success, error);
          }
        };

        /*declare the device width heights*/
        WidgetEvent.deviceHeight = window.innerHeight;
        WidgetEvent.deviceWidth = window.innerWidth;

        /*initialize the device width heights*/
        var initDeviceSize = function (callback) {
          WidgetEvent.deviceHeight = window.innerHeight;
          WidgetEvent.deviceWidth = window.innerWidth;
          if (callback) {
            if (WidgetEvent.deviceWidth == 0 || WidgetEvent.deviceHeight == 0) {
              setTimeout(function () {
                initDeviceSize(callback);
              }, 500);
            } else {
              callback();
              if (!$scope.$$phase && !$scope.$root.$$phase) {
                $scope.$apply();
              }
            }
          }
        };

        /*crop image on the basis of width heights*/
        WidgetEvent.cropImage = function (url, settings) {
          var options = {};
          if (!url) {
            return "";
          }
          else {
            if (settings.height) {
              options.height = settings.height;
            }
            if (settings.width) {
              options.width = settings.width;
            }
            return Buildfire.imageLib.cropImage(url, options);
          }
        };

        WidgetEvent.safeHtml = function (html) {
          if (html)
            return $sce.trustAsHtml(html);
        };

        WidgetEvent.executeActionItem = function (actionItem) {
          buildfire.actionItems.execute(actionItem, function () {

          });
        };

        //Check is description is empty or not
        WidgetEvent.showDescription = function (description) {
          return !(description == '<p><br data-mce-bogus="1"></p>');
        };

        WidgetEvent.setAddedEventToLocalStorage = function (eventId) {
          var addedEvents = [];
          addedEvents = JSON.parse(localStorage.getItem('localAddedEvents'));
          if (!addedEvents) {
            addedEvents = [];
          }
          addedEvents.push(eventId);
          localStorage.setItem('localAddedEvents', JSON.stringify(addedEvents));
        }

        WidgetEvent.getAddedEventToLocalStorage = function (eventId) {
          var localStorageSavedEvents = [];
          localStorageSavedEvents = JSON.parse(localStorage.getItem('localAddedEvents'));
          if (!localStorageSavedEvents) {
            localStorageSavedEvents = [];
          }
          return localStorageSavedEvents.indexOf(eventId);
        }

        WidgetEvent.addEventsToCalendar = function (event) {
          /*Add to calendar event will add here*/
          var eventStartDate = new Date(event.data.startDate + " " + event.data.startTime);
          var eventEndDate;
          if (event.data.endDate == '') {
            eventEndDate = new Date(event.data.startDate + " " + "11:59 PM")
          }
          else {
            eventEndDate = new Date(event.data.endDate + " " + event.data.endTime);
          }
          if (WidgetEvent.getAddedEventToLocalStorage(event.id) != -1) {
            alert("Event already added in calendar");
          }
          console.log("inCal3:", eventEndDate, event);
          if (buildfire.device && buildfire.device.calendar && WidgetEvent.getAddedEventToLocalStorage(event.id) == -1) {
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
                  console.log('worked ' + JSON.stringify(result));
                  WidgetEvent.setAddedEventToLocalStorage(event.id);
                  alert("Event added to calendar");
                  $scope.$digest();
                }
              }
            );
          }
          console.log(">>>>>>>>", event);
        };

        /*update data on change event*/
        var onUpdateCallback = function (event) {
          setTimeout(function () {
            $scope.$digest();
            if (event && event.tag) {
              switch (event.tag) {
                case TAG_NAMES.EVENTS_MANUAL_INFO:
                  WidgetEvent.data = event.data;
                  if (!WidgetEvent.data.design)
                    WidgetEvent.data.design = {};
                  if (!WidgetEvent.data.design.itemDetailsLayout) {
                    WidgetEvent.data.design.itemDetailsLayout = LAYOUTS.itemDetailsLayout[0].name;
                  }
                  currentListLayout = WidgetEvent.data.design.itemDetailsLayout;
                  if(WidgetEvent.data.design.itemDetailsBgImage){
                    $rootScope.backgroundImage = WidgetEvent.data.design.itemDetailsBgImage;
                  }else
                  {
                    $rootScope.backgroundImage = "";
                  }
                  break;
                case TAG_NAMES.EVENTS_MANUAL:
                  WidgetEvent.event.data = event.data;
                  if (WidgetEvent.view) {
                    console.log("_____________________________");
                    WidgetEvent.view.loadItems(WidgetEvent.event.data.carouselImages, null, WidgetEvent.data.design.itemDetailsLayout == 'Event_Item_1' ? "WideScreen" : "Square");
                  }
                  break;
              }
              $scope.$digest();
              $rootScope.$digest();
            }
          }, 0);
        };

        /*
         * Fetch user's data from datastore
         */
        var init = function () {
          var success = function (result) {
              WidgetEvent.data = result.data;
              if (!WidgetEvent.data.design)
                WidgetEvent.data.design = {};
              if (!WidgetEvent.data.design.itemDetailsLayout) {
                WidgetEvent.data.design.itemDetailsLayout = LAYOUTS.itemDetailsLayout[0].name;
              }
              if(WidgetEvent.data.design.itemDetailsBgImage){
                $rootScope.backgroundImage = WidgetEvent.data.design.itemDetailsBgImage;
              }
              else
              {
                $rootScope.backgroundImage = "";
              }
              getEventDetails();
            }
            , error = function (err) {
              console.error('Error while getting data', err);
            };
          DataStore.get(TAG_NAMES.EVENTS_MANUAL_INFO).then(success, error);
        };

        init();

        DataStore.onUpdate().then(null, null, onUpdateCallback);


        WidgetEvent.listeners["Carousel:LOADED"] = $rootScope.$on("Carousel:LOADED", function () {
          WidgetEvent.view = new buildfire.components.carousel.view("#carousel", [], WidgetEvent.data.design.itemDetailsLayout == 'Event_Item_1' ? "WideScreen" : "Square");

          if (WidgetEvent.event.data && WidgetEvent.event.data.carouselImages) {
            WidgetEvent.view.loadItems(WidgetEvent.event.data.carouselImages, null, WidgetEvent.data.design.itemDetailsLayout == 'Event_Item_1' ? "WideScreen" : "Square");
          } else {
            WidgetEvent.view.loadItems([]);
          }
        });

        WidgetEvent.onAddressClick = function (long, lat) {
          buildfire.getContext(function (err, context) {
            if (context) {
              if (context.device && context.device.platform == 'ios')
                window.open("maps://maps.google.com/maps?daddr=" + lat + "," + long);
              else
                window.open("http://maps.google.com/maps?daddr=" + lat + "," + long);
            }
          });
        };
        buildfire.datastore.onRefresh(function () {

        });

        $scope.$on("$destroy", function () {
          DataStore.clearListener();
          $rootScope.$broadcast('ROUTE_CHANGED');
          for (var i in WidgetEvent.listeners) {
            if (WidgetEvent.listeners.hasOwnProperty(i)) {
              WidgetEvent.listeners[i]();
            }
          }
        });

      }]);
})(window.angular, window.buildfire, window);
