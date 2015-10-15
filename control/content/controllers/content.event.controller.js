'use strict';
(function (angular) {
  angular
    .module('eventsManualPluginContent')
    .controller('ContentEventCtrl', ['$scope', '$routeParams', 'Buildfire', 'DataStore', 'TAG_NAMES', 'ADDRESS_TYPE', '$location', 'Utils', '$timeout',
      function ($scope, $routeParams, Buildfire, DataStore, TAG_NAMES, ADDRESS_TYPE, $location, Utils, $timeout) {
        var ContentEvent = this;
        var _data = {
          "title": "",
          "listImage": "",
          "deepLinkUrl": "",
          "carouselImages": [],
          "startDate": "",
          "endDate": "",
          "isAllDay": "",
          "timezone": "",
          "timeDisplay": {},
          "repeat": {},
          "addressTitle": "",
          "address": {},
          "description": "",
          "links": []

        };

        ContentEvent.event = {
          data: angular.copy(_data)
        };
        ContentEvent.isUpdating = false;
        ContentEvent.isNewEventInserted = false;
        ContentEvent.unchangedData = true;
        ContentEvent.displayTiming = "USER";

        ContentEvent.isValidEvent = function (event) {
          if (event.isAllDay)
            return (event.startDate && event.title);
          else
            return (event.startDate && event.title && event.startTime);
        };

        var updateMasterEvent = function (event) {
          ContentEvent.masterEvent = angular.copy(event);
        };

        var isUnchanged = function (event) {
          return angular.equals(event, ContentEvent.masterEvent);
        };

        ContentEvent.getItem = function (id) {
          var successEvents = function (result) {
            console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&", result);
            ContentEvent.event = result;
            if (ContentEvent.event.data.startDate)
              ContentEvent.event.data.startDate = new Date(result.data.startDate);
            if (ContentEvent.event.data.endDate)
              ContentEvent.event.data.endDate = new Date(result.data.endDate);
            if (ContentEvent.event.data.startTime)
              ContentEvent.event.data.startTime = new Date(result.data.startTime);
            if (ContentEvent.event.data.endTime)
              ContentEvent.event.data.endTime = new Date(result.data.endTime);
            if (ContentEvent.event.data.address && ContentEvent.event.data.address.location) {
              ContentEvent.currentAddress = ContentEvent.event.data.address.location;
              ContentEvent.currentCoordinates = ContentEvent.event.data.address.location_coordinates;
            }
            if (ContentEvent.event.data.listImage) {
              listImage.loadbackground(ContentEvent.event.data.listImage);
            }
            if (ContentEvent.event.data.timeDisplay) {
              ContentEvent.displayTiming = ContentEvent.event.data.timeDisplay;
            }
            if (ContentEvent.event.data.repeat) {
              if (ContentEvent.event.data.repeat.startDate)
                ContentEvent.event.data.repeat.startDate = new Date(ContentEvent.event.data.repeat.startDate);
              if (ContentEvent.event.data.repeat.endOn)
                ContentEvent.event.data.repeat.endOn = new Date(ContentEvent.event.data.repeat.endOn);
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

        ContentEvent.TimeZoneDropdownOptions = [
          {name: "(GMT -12:00) Eniwetok, Kwajalein", value: "-12.0"},
          {name: "(GMT -11:00) Midway Island, Samoa", value: "-11.0"},
          {name: "(GMT -10:00) Hawaii", value: "-10.0"},
          {name: "(GMT -9:00) Alaska", value: "-9.0"},
          {name: "(GMT -8:00) Pacific Time (US &amp; Canada)", value: "-8.0"},
          {name: "(GMT -7:00) Mountain Time (US &amp; Canada)", value: "-7:00"},
          {
            name: "(GMT -6:00) Central Time (US &amp; Canada), Mexico City",
            value: "-6:00"
          },
          {
            name: "(GMT -5:00) Eastern Time (US &amp; Canada), Bogota, Lima",
            value: "-5:00"
          },
          {
            name: "(GMT -4:00) Atlantic Time (Canada), Caracas, La Paz",
            value: "-4:00"
          },
          {name: "(GMT -3:30) Newfoundland", value: "-3:30"},
          {
            name: "(GMT -3:00) Brazil, Buenos Aires, Georgetown",
            value: "-3:00"
          },
          {name: "(GMT -2:00) Mid-Atlantic", value: "-2:00"},
          {name: "(GMT -1:00) Azores, Cape Verde Islands", value: "-1:00"},
          {
            name: "(GMT) Western Europe Time, London, Lisbon, Casablanca",
            value: "0.0"
          },
          {
            name: "(GMT +1:00 hour) Brussels, Copenhagen, Madrid, Paris",
            value: "1.0"
          },
          {name: "(GMT +2:00) Kaliningrad, South Africa", value: "2:00"},
          {
            name: "(GMT +3:00) Baghdad, Riyadh, Moscow, St. Petersburg",
            value: "3:00"
          },
          {name: "(GMT +3:30) Tehran", value: "3:30"},
          {name: "(GMT +4:00) Abu Dhabi, Muscat, Baku, Tbilisi", value: "4:00"},
          {name: "(GMT +4:30) Kabul", value: "4:30"},
          {
            name: "(GMT +5:00) Ekaterinburg, Islamabad, Karachi, Tashkent",
            value: "5:00"
          },
          {
            name: "(GMT +5:30) Bombay, Calcutta, Madras, New Delhi",
            value: '5:30'
          },
          {name: "(GMT +5:45) Kathmandu", value: "5:45"},
          {name: "(GMT +6:00) Almaty, Dhaka, Colombo", value: '6:00'},
          {name: "(GMT +7:00) Bangkok, Hanoi, Jakarta", value: "7:00"},
          {
            name: "(GMT +8:00) Beijing, Perth, Singapore, Hong Kong",
            value: "8:00"
          },
          {
            name: "(GMT +9:00) Tokyo, Seoul, Osaka, Sapporo, Yakutsk",
            value: "9:00"
          },
          {name: "(GMT +9:30) Adelaide, Darwin", value: "9:30"},
          {
            name: "(GMT +10:00) Eastern Australia, Guam, Vladivostok",
            value: "10:00"
          },
          {
            name: "(GMT +11:00) Magadan, Solomon Islands, New Caledonia",
            value: "11:00"
          },
          {
            name: "(GMT +12:00) Auckland, Wellington, Fiji, Kamchatka",
            value: "12:00"
          }

        ];

        ContentEvent.descriptionWYSIWYGOptions = {
          plugins: 'advlist autolink link image lists charmap print preview',
          skin: 'lightgray',
          trusted: true,
          theme: 'modern'
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
          var temp = ContentEvent.event.data.carouselImages[oldIndex];
          ContentEvent.event.data.carouselImages[oldIndex] = ContentEvent.event.data.carouselImages[newIndex];
          ContentEvent.event.data.carouselImages[newIndex] = temp;
          $scope.$digest();
        };

        ContentEvent.addNewEvent = function () {
          ContentEvent.isNewEventInserted = true;
          ContentEvent.event.data.dateCreated = +new Date();
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
          if (ContentEvent.event.data.startDate)
            ContentEvent.event.data.startDate = +new Date(ContentEvent.event.data.startDate);
          if (ContentEvent.event.data.startTime)
            ContentEvent.event.data.startTime = +new Date(ContentEvent.event.data.startTime);
          if (ContentEvent.event.data.endTime)
            ContentEvent.event.data.endTime = +new Date(ContentEvent.event.data.endTime);
          if (ContentEvent.event.data.endDate)
            ContentEvent.event.data.endDate = +new Date(ContentEvent.event.data.endDate);
          if (ContentEvent.event.data.repeat) {
            if (ContentEvent.event.data.repeat.startDate)
              ContentEvent.event.data.repeat.startDate = +new Date(ContentEvent.event.data.repeat.startDate);
            if (ContentEvent.event.data.repeat.endOn)
              ContentEvent.event.data.repeat.endOn = +new Date(ContentEvent.event.data.repeat.endOn);
          }
          DataStore.insert(ContentEvent.event.data, TAG_NAMES.EVENTS_MANUAL).then(successEvents, errorEvents);
        };

        ContentEvent.updateEventData = function () {
          if (ContentEvent.event.data.startDate)
            ContentEvent.event.data.startDate = +new Date(ContentEvent.event.data.startDate);
          if (ContentEvent.event.data.endDate)
            ContentEvent.event.data.endDate = +new Date(ContentEvent.event.data.endDate);
          if (ContentEvent.event.data.startTime)
            ContentEvent.event.data.startTime = +new Date(ContentEvent.event.data.startTime);
          if (ContentEvent.event.data.endTime)
            ContentEvent.event.data.endTime = +new Date(ContentEvent.event.data.endTime);
          if (ContentEvent.event.data.repeat) {
            if (ContentEvent.event.data.repeat.startDate)
              ContentEvent.event.data.repeat.startDate = +new Date(ContentEvent.event.data.repeat.startDate);
            if (ContentEvent.event.data.repeat.endOn)
              ContentEvent.event.data.repeat.endOn = +new Date(ContentEvent.event.data.repeat.endOn);
          }
          DataStore.update(ContentEvent.event.id, ContentEvent.event.data, TAG_NAMES.EVENTS_MANUAL, function (err) {
            ContentEvent.isUpdating = false;
            if (err)
              return console.error('There was a problem saving your data');
          })
        };

        var tmrDelayForEvent = null;

        var updateItemsWithDelay = function (event) {
          clearTimeout(tmrDelayForEvent);
          ContentEvent.isUpdating = false;
          ContentEvent.unchangedData = angular.equals(_data, ContentEvent.event.data);

          ContentEvent.isEventValid = ContentEvent.isValidEvent(ContentEvent.event.data);
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

        ContentEvent.changeTimeZone = function (timezone) {
          ContentEvent.event.data.timezone = timezone;
        };

        ContentEvent.changeRepeatType = function (type) {
          ContentEvent.event.data.repeat = {};
          ContentEvent.event.data.repeat.isRepeating = true;
          ContentEvent.event.data.repeat.repeatType = type;
        };

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
        var listImage = new Buildfire.components.images.thumbnail("#listImage", {title: "List Image",dimensionsLabel:"500x500"});

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

        ContentEvent.deleteEvent = function () {
          var event = ContentEvent.event;
          var successEvent = function (result) {
            $location.path('/');
          }, errorEvent = function () {
            return console.error('There was a problem deleting your data');
          };
          if (event.id) {
            DataStore.deleteById(event.id, TAG_NAMES.EVENTS_MANUAL).then(successEvent, errorEvent);
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
          $location.path('/');
        };

        ContentEvent.setEndDay = function () {
          if (ContentEvent.event.data.startDate && ContentEvent.event.data.isAllDay)
            ContentEvent.event.data.endDate = ContentEvent.event.data.startDate;
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
})(window.angular);
