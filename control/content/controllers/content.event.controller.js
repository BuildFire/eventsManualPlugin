'use strict';
(function (angular, buildfire) {
  angular
    .module('eventsManualPluginContent')
    .controller('ContentEventCtrl', ['$scope', '$routeParams', 'Buildfire', 'DataStore', 'TAG_NAMES', 'ADDRESS_TYPE', '$location', 'Utils', '$timeout',
      function ($scope, $routeParams, Buildfire, DataStore, TAG_NAMES, ADDRESS_TYPE, $location, Utils, $timeout) {
        var ContentEvent = this;
        var currentUserDate = +new Date();
        ContentEvent.isValidRecurrance = true;
        var _data = {
          "title": "",
          "listImage": "",
          "deepLinkUrl": "",
          "carouselImages": [],
          "startDate": "",
          "endDate": "",
          "isAllDay": "",
          "timezone": "",
          "timeDisplay": "",
          "repeat": {},
          "addressTitle": "",
          "address": {},
          "description": "",
          "links": []
        };

        //Scroll current view to top when page loaded.
        if (buildfire.navigation.scrollTop) {
          buildfire.navigation.scrollTop();
        }
        ContentEvent.event = {
          data: angular.copy(_data)
        };
        ContentEvent.isUpdating = false;
        ContentEvent.isNewEventInserted = false;
        ContentEvent.unchangedData = true;
        ContentEvent.displayTiming = "USER";

        ContentEvent.returnDAteWithoutTime = function (date) {
          var _date  = new Date(date);
          return +new Date(
            _date.getFullYear(),
            _date.getMonth(),
            _date.getDate()
          );
        };

        ContentEvent.isValidEvent = function (event) {

          if ((+new Date(event.startTime) >= +new Date(event.endTime))) {
          ContentEvent.event.data.endDate = ContentEvent.event.data.startDate;
          ContentEvent.event.data.endTime = moment(ContentEvent.event.data.startTime).add('10', 'minute');
        }
          balanceDateTime();
          if (event.isAllDay) {
            // Check if start date of the event is not less than repeat event starts on date
            if (event.repeat && event.repeat.isRepeating && event.repeat.startDate)
              return (event.startDate && event.title && (+new Date(event.startDate) <= (+new Date(event.repeat.startDate))));
            else
              return (event.startDate && event.title);
          }
          else if (event.endTime) {
            // Check if start date of the event is not less than repeat event starts on date
            if (event.repeat && event.repeat.isRepeating && event.repeat.startDate)
              return (event.startDate && event.title && event.startTime && (+new Date(event.startTime) < +new Date(event.endTime)) && (+new Date(ContentEvent.returnDAteWithoutTime(event.startDate)) <= (+new Date(event.repeat.startDate))));
            else
              return (event.startDate && event.title && event.startTime && (+new Date(event.startTime) < +new Date(event.endTime)));
          }
          else {
            // Check if start date of the event is not less than repeat event starts on date
            if (event.repeat && event.repeat.isRepeating && event.repeat.startDate)
              return (event.startDate && event.title && event.startTime && (+new Date(ContentEvent.returnDAteWithoutTime(event.startDate)) <= (+new Date(event.repeat.startDate))));
            else
              return (event.startDate && event.title && event.startTime);
          }

        };

        var updateMasterEvent = function (event) {
          ContentEvent.masterEvent = angular.copy(event);
        };

        var isUnchanged = function (event) {
          return angular.equals(event, ContentEvent.masterEvent);
        };

        function balanceDateTime() {

          var _obj = {};
          if (ContentEvent.event.data.startTime != ContentEvent.event.data.startDate && +ContentEvent.event.data.startTime) {
            _obj.time = new Date(ContentEvent.event.data.startTime);
            _obj.date = new Date(ContentEvent.event.data.startDate);
            ContentEvent.event.data.startDate = +new Date(
              _obj.date.getFullYear(),
              _obj.date.getMonth(),
              _obj.date.getDate(),
              _obj.time.getHours(),
              _obj.time.getMinutes()
            );
            ContentEvent.event.data.startTime = ContentEvent.event.data.startDate;
          }
          if (!ContentEvent.event.data.endDate || ContentEvent.event.data.endDate <= 0) {
            ContentEvent.event.data.endDate = ContentEvent.event.data.startDate;
          } else if (ContentEvent.event.data.endTime != ContentEvent.event.data.endDate && +ContentEvent.event.data.endTime) {
            _obj.time = new Date(ContentEvent.event.data.endTime);
            _obj.date = new Date(ContentEvent.event.data.endDate);
            ContentEvent.event.data.endDate = +new Date(
              _obj.date.getFullYear(),
              _obj.date.getMonth(),
              _obj.date.getDate(),
              _obj.time.getHours(),
              _obj.time.getMinutes()
            );
            ContentEvent.event.data.endTime = ContentEvent.event.data.endDate;
          }
        }

        ContentEvent.getItem = function (id) {
          var successEvents = function (result) {
            console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&", result);
            ContentEvent.event = result;
            balanceDateTime();
            if (!ContentEvent.event.data.repeat.repeatCount)
              ContentEvent.event.data.repeat.repeatCount = 1;
            if (ContentEvent.event.data.isAllDay) {
              ContentEvent.event.data.timezone = "";
              ContentEvent.event.data.timeDisplay = "USER";
              ContentEvent.displayTiming = "USER"
            }
            if (ContentEvent.event.data.address && ContentEvent.event.data.address.location) {
              ContentEvent.currentAddress = ContentEvent.event.data.address.location;
              ContentEvent.currentCoordinates = ContentEvent.event.data.address.location_coordinates;
            }
            if (ContentEvent.event.data.listImage) {
              listImage.loadbackground(ContentEvent.event.data.listImage);
            }
            if (ContentEvent.event.data.timeDisplay && ContentEvent.event.data.timeDisplay == 'SELECTED') {
              ContentEvent.displayTiming = ContentEvent.event.data.timeDisplay == "USER";
            }
            if (ContentEvent.event.data.repeat) {
              if (ContentEvent.event.data.repeat.endOn)
                ContentEvent.event.data.repeat.endOn = new Date(ContentEvent.event.data.repeat.endOn);
            }
            if (ContentEvent.event.data.repeat) {
              if (ContentEvent.event.data.repeat.startDate) {
                ContentEvent.event.data.repeat.startDate = new Date(ContentEvent.event.data.repeat.startDate);
                if (!ContentEvent.event.data.repeat.days) {
                  ContentEvent.event.data.repeat.days = {}
                }
                if (!Object.keys(ContentEvent.event.data.repeat.days).length) {
                  //ContentEvent.event.data.repeat.days=[];
                  switch (ContentEvent.event.data.repeat.startDate.getDay()) {
                    case 0:
                      ContentEvent.event.data.repeat.days.sunday = true;
                      break;
                    case 1:
                      ContentEvent.event.data.repeat.days.monday = true;
                      break;
                    case 2:
                      ContentEvent.event.data.repeat.days.tuesday = true;
                      break;
                    case 3:
                      ContentEvent.event.data.repeat.days.wednesday = true;
                      break;
                    case 4:
                      ContentEvent.event.data.repeat.days.thursday = true;
                      break;
                    case 5:
                      ContentEvent.event.data.repeat.days.friday = true;
                      break;
                    case 6:
                      ContentEvent.event.data.repeat.days.saturday = true;
                      break;

                  }
                }

              }
            }
            if (!ContentEvent.event.data.carouselImages)
              editor.loadItems([]);
            else
              editor.loadItems(ContentEvent.event.data.carouselImages);
            _data.dateCreated = result.data.dateCreated;
            updateMasterEvent(ContentEvent.event);
          }, errorEvents = function () {
            throw console.error('There was a problem fetching your data', err);
          };
          DataStore.getById(id, TAG_NAMES.EVENTS_MANUAL).then(successEvents, errorEvents);
        };

        ContentEvent.descriptionWYSIWYGOptions = {
          plugins: 'advlist autolink link image lists charmap print preview',
          skin: 'lightgray',
          trusted: true,
          theme: 'modern'
        };

        ContentEvent.setZeeroValue = function () {
          if (!ContentEvent.event.data.repeat.repeatCount || ContentEvent.event.data.repeat.repeatCount == 0)
            ContentEvent.event.data.repeat.repeatCount = 1;
        };
        ContentEvent.setZeeroValueEndAfter = function () {
          if (!ContentEvent.event.data.repeat.endAfter || ContentEvent.event.data.repeat.endAfter == 0)
            ContentEvent.event.data.repeat.endAfter = 1;
        };
        /**
         * link and sortable options
         */
        var linkOptions = {"icon": "true"};

        ContentEvent.linksSortableOptions = {
          handle: '> .cursor-grab'
        };

        ContentEvent.validCoordinatesFailure = false;

        // create a new instance of the buildfire carousel editor
        var editor = new Buildfire.components.carousel.editor("#carousel");
        // this method will be called when a new item added to the list
        editor.onAddItems = function (items) {
          if (!ContentEvent.event.data.carouselImages)
            ContentEvent.event.data.carouselImages = [];
          ContentEvent.event.data.carouselImages.push.apply(ContentEvent.event.data.carouselImages, items);
          $scope.$digest();
        };
        // this method will be called when an item deleted from the list
        editor.onDeleteItem = function (item, index) {
          ContentEvent.event.data.carouselImages.splice(index, 1);
          $scope.$digest();
        };
        // this method will be called when you edit item details
        editor.onItemChange = function (item, index) {
          ContentEvent.event.data.carouselImages.splice(index, 1, item);
          $scope.$digest();
        };
        // this method will be called when you change the order of items
        editor.onOrderChange = function (item, oldIndex, newIndex) {
          var items = ContentEvent.event.data.carouselImages,
            tmp = items[oldIndex],
            i;

          if (oldIndex < newIndex) {
            for (i = oldIndex + 1; i <= newIndex; i++) {
              items[i - 1] = items[i];
            }
          } else {
            for (i = oldIndex - 1; i >= newIndex; i--) {
              items[i + 1] = items[i];
            }
          }
          items[newIndex] = tmp;

          ContentEvent.event.data.carouselImages = items;
          $scope.$digest();
        };

        ContentEvent.addNewEvent = function () {
          ContentEvent.isNewEventInserted = true;
          ContentEvent.event.data.dateCreated = +new Date();
          localStorage.setItem('pluginLoadedFirst', true);

          ContentEvent.autoFillDates();

          var successEvents = function (result) {
            console.log("Inserted", result.id);
            ContentEvent.isUpdating = false;
            ContentEvent.event.id = result.id;
            _data.dateCreated = ContentEvent.event.data.dateCreated;
            updateMasterEvent(ContentEvent.event);
            ContentEvent.event.data.deepLinkUrl = Buildfire.deeplink.createLink({id: result.id});
            if (ContentEvent.event.id) {
              buildfire.messaging.sendMessageToWidget({
                id: ContentEvent.event.id,
                type: 'AddNewItem'
              });
            }
          }, errorEvents = function () {
            ContentEvent.isNewEventInserted = false;
            return console.error('There was a problem saving your data');
          };
          if (ContentEvent.event.data.repeat) {
            if (ContentEvent.event.data.repeat.endOn)
              ContentEvent.event.data.repeat.endOn = +new Date(ContentEvent.event.data.repeat.endOn);
          }
          DataStore.insert(ContentEvent.event.data, TAG_NAMES.EVENTS_MANUAL).then(successEvents, errorEvents);
        };

        ContentEvent.updateEventData = function () {
          if (ContentEvent.event.data.repeat) {
            if (ContentEvent.event.data.repeat.endOn)
              ContentEvent.event.data.repeat.endOn = +new Date(ContentEvent.event.data.repeat.endOn);
          }
          if (ContentEvent.event.data.repeat) {
            if (ContentEvent.event.data.repeat.end == 'NEVER') {
              ContentEvent.event.data.repeat.endOn = null;
            }
            $scope.$digest();
          }
          if (ContentEvent.event.data.isAllDay) {
            ContentEvent.event.data.timezone = "";
            ContentEvent.event.data.timeDisplay = "USER";
            ContentEvent.displayTiming = "USER"
          }
          if (ContentEvent.event.data.repeat) {
            if (ContentEvent.event.data.repeat.startDate != ContentEvent.event.lastSavedStartDate) {
              //   ContentEvent.event.data.repeat.startDate = +new Date(ContentEvent.event.data.repeat.startDate);
              switch (ContentEvent.event.data.repeat.startDate.getDay()) {
                case 0:
                  ContentEvent.event.data.repeat.days = {};
                  ContentEvent.event.data.repeat.days.sunday = true;
                  break;
                case 1:
                  ContentEvent.event.data.repeat.days = {};
                  ContentEvent.event.data.repeat.days.monday = true;
                  break;
                case 2:
                  ContentEvent.event.data.repeat.days = {};
                  ContentEvent.event.data.repeat.days.tuesday = true;
                  break;
                case 3:
                  ContentEvent.event.data.repeat.days = {};
                  ContentEvent.event.data.repeat.days.wednesday = true;
                  break;
                case 4:
                  ContentEvent.event.data.repeat.days = {};
                  ContentEvent.event.data.repeat.days.thursday = true;
                  break;
                case 5:
                  ContentEvent.event.data.repeat.days = {};
                  ContentEvent.event.data.repeat.days.friday = true;
                  break;
                case 6:
                  ContentEvent.event.data.repeat.days = {};
                  ContentEvent.event.data.repeat.days.saturday = true;
                  break;
              }
              ContentEvent.event.lastSavedStartDate = ContentEvent.event.data.repeat.startDate;
              $scope.$apply();
            }
          }
          balanceDateTime();
          DataStore.update(ContentEvent.event.id, ContentEvent.event.data, TAG_NAMES.EVENTS_MANUAL, function (err) {
            ContentEvent.isUpdating = false;
            if (err)
              return console.error('There was a problem saving your data');
          })
        };

        ContentEvent.autoFillDates = function () {
          var _endDateObj, _startTimeObj = {};
          if (!ContentEvent.event.data.isAllDay) {
            _startTimeObj.date = new Date(ContentEvent.event.data.startTime);
            _startTimeObj.minutes = _startTimeObj.date.getHours() * 60;
            _startTimeObj.minutes += _startTimeObj.date.getMinutes();
            _startTimeObj.millis = _startTimeObj.minutes * 60 * 1000;

            ContentEvent.event.data.startDate += _startTimeObj.millis;
            ContentEvent.event.data.startTime = ContentEvent.event.data.startDate;
            ContentEvent.event.data.endDate = ContentEvent.event.data.startDate;

            _endDateObj = new Date(ContentEvent.event.data.startDate);
            _endDateObj.setHours(_endDateObj.getHours() + 1);

            ContentEvent.event.data.endTime = _endDateObj.getTime();
          } else {
            ContentEvent.event.data.endDate = ContentEvent.event.data.startDate;
          }
        };

        var tmrDelayForEvent = null;

        var updateItemsWithDelay = function (event) {
          clearTimeout(tmrDelayForEvent);
          ContentEvent.isUpdating = false;
          ContentEvent.unchangedData = angular.equals(_data, ContentEvent.event.data);
          if (ContentEvent.event.data.repeat) {
              ContentEvent.event.data.repeat.startDate = new Date(ContentEvent.event.data.startDate);
          }

          ContentEvent.isEventValid = ContentEvent.isValidEvent(ContentEvent.event.data);
          console.log("________________", ContentEvent.isEventValid);
          if (!ContentEvent.isUpdating && !isUnchanged(ContentEvent.event) && ContentEvent.isEventValid) {
            tmrDelayForEvent = setTimeout(function () {
              if (event.id) {
                ContentEvent.updateEventData();
              } else if (!ContentEvent.isNewEventInserted) {
                ContentEvent.addNewEvent();
              }
            }, 300);
          }
        };

        ContentEvent.changeRepeatType = function (type) {
          ContentEvent.event.data.repeat = {
            startDate:new Date(ContentEvent.event.data.startDate)
          };
          ContentEvent.event.data.repeat.isRepeating = true;
          ContentEvent.event.data.repeat.repeatType = type;
          ContentEvent.event.data.repeat.repeatCount = 1;
          //if (type == 'Weekly') {
          //  ContentEvent.isValidRecurrance = false;
          //} else {
          //  ContentEvent.isValidRecurrance = true;
          //}
        };

        ContentEvent.startOnDateChange = function () {
          if (ContentEvent.event.data.repeat.startDate) {
            ContentEvent.isValidRecurrance = true;
          } else {
            ContentEvent.isValidRecurrance = false;
          }
        }
        /**
         * Add dynamic link
         */

        ContentEvent.addLink = function () {
          var options = {showIcons: false};
          var callback = function (error, result) {
            if (error) {
              return console.error('Error:', error);
            }
            if (!ContentEvent.event.data.links)
              ContentEvent.event.data.links = [];
            if (result.title)
              ContentEvent.event.data.links.push(result);
            $scope.$digest();
          };
          Buildfire.actionItems.showDialog(null, options, callback);
        };

        /**
         * Remove dynamic link
         */

        ContentEvent.removeLink = function (index) {
          if (ContentEvent.event.data && ContentEvent.event.data.links) {
            ContentEvent.event.data.links.splice(index, 1);
          }
        };

        /**
         * Edit dynamic link
         */

        ContentEvent.editLink = function (link, index) {
          Buildfire.actionItems.showDialog(link, linkOptions, function editLinkCallback(error, result) {
            if (error) {
              return console.error('Error:', error);
            }
            if (!ContentEvent.event.data.links) {
              ContentEvent.event.data.links = [];
            }
            if (result === null) {
              return console.error('Error:Can not save data, Null record found.');
            }
            ContentEvent.event.data.links.splice(index, 1, result);
            $scope.$digest();
          });
        };

        /**
         * Save selected place from google autocomplete as address
         */

        ContentEvent.setLocation = function (data) {
          ContentEvent.event.data.address = {
            type: ADDRESS_TYPE.LOCATION,
            location: data.location,
            location_coordinates: data.coordinates
          };
          ContentEvent.currentAddress = ContentEvent.event.data.address.location;
          ContentEvent.currentCoordinates = ContentEvent.event.data.address.location_coordinates;
          $scope.$digest();
        };

        /**
         * Change the address and map to dragged marker location
         */

        ContentEvent.setDraggedLocation = function (data) {
          ContentEvent.event.data.address = {
            type: ADDRESS_TYPE.LOCATION,
            location: data.location,
            location_coordinates: data.coordinates
          };
          ContentEvent.currentAddress = ContentEvent.event.data.address.location;
          ContentEvent.currentCoordinates = ContentEvent.event.data.address.location_coordinates;
          $scope.$digest();
        };

        /* Build fire thumbnail component to add thumbnail image*/
        var listImage = new Buildfire.components.images.thumbnail("#listImage", {
          title: "List Image",
          dimensionsLabel: "500x500"
        });

        listImage.onChange = function (url) {
          ContentEvent.event.data.listImage = url;
          if (!$scope.$$phase && !$scope.$root.$$phase) {
            $scope.$apply();
          }
        };

        listImage.onDelete = function (url) {
          ContentEvent.event.data.listImage = "";
          if (!$scope.$$phase && !$scope.$root.$$phase) {
            $scope.$apply();
          }
        };

        ContentEvent.clearAddress = function () {
          if (!ContentEvent.currentAddress) {
            ContentEvent.event.data.address = null;
            ContentEvent.currentCoordinates = null;
          }
        };

        ContentEvent.setCoordinates = function () {
          function successCallback(resp) {
            if (resp) {
              ContentEvent.event.data.address = {
                type: ADDRESS_TYPE.COORDINATES,
                location: resp.formatted_address || ContentEvent.currentAddress,
                location_coordinates: [ContentEvent.currentAddress.split(",")[0].trim(), ContentEvent.currentAddress.split(",")[1].trim()]
              };
              ContentEvent.currentAddress = ContentEvent.event.data.address.location;
              ContentEvent.currentCoordinates = ContentEvent.event.data.address.location_coordinates;
            } else {
              errorCallback();
            }
          }

          function errorCallback(err) {
            ContentEvent.validCoordinatesFailure = true;
            $timeout(function () {
              ContentEvent.validCoordinatesFailure = false;
            }, 5000);
          }

          Utils.validLongLats(ContentEvent.currentAddress).then(successCallback, errorCallback);
        };

        ContentEvent.gotToHome = function () {
          buildfire.history.pop();
          $location.path('#/');
        };

        ContentEvent.setEndDay = function () {
          if (ContentEvent.event.data.startDate && ContentEvent.event.data.isAllDay)
            ContentEvent.event.data.endDate = ContentEvent.event.data.startDate;
        };

        ContentEvent.showUserTimeZone = function () {
          var timezone = jstz.determine();
          return timezone.name() || "";
        };

        updateMasterEvent(ContentEvent.event);

        if ($routeParams.id) {
          ContentEvent.getItem($routeParams.id);

          /*
           Send message to widget that this page has been opened
           */
          buildfire.messaging.sendMessageToWidget({
            id: $routeParams.id,
            type: 'OpenItem'
          });
        }

        $scope.$watch(function () {
          return ContentEvent.event;
        }, updateItemsWithDelay, true);

      }]);
})(window.angular, window.buildfire);