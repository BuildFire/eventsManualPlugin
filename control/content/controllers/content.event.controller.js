'use strict';
(function (angular) {
  angular
    .module('eventsManualPluginContent')
    .controller('ContentEventCtrl', ['$scope', '$routeParams', 'Buildfire', 'DataStore', 'TAG_NAMES', 'ADDRESS_TYPE', '$location', 'Utils','$timeout',
      function ($scope, $routeParams, Buildfire, DataStore, TAG_NAMES, ADDRESS_TYPE, $location, Utils,$timeout) {
        var ContentEvent = this;
        ContentEvent.event = {};
        ContentEvent.displayTiming = "SELECTED";

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
          if (!ContentEvent.event.carouselImages)
            ContentEvent.event.carouselImages = [];
          ContentEvent.event.carouselImages.push.apply(ContentEvent.event.carouselImages, items);
          $scope.$digest();
        };
        // this method will be called when an item deleted from the list
        editor.onDeleteItem = function (item, index) {
          ContentEvent.event.carouselImages.splice(index, 1);
          $scope.$digest();
        };
        // this method will be called when you edit item details
        editor.onItemChange = function (item, index) {
          ContentEvent.event.carouselImages.splice(index, 1, item);
          $scope.$digest();
        };
        // this method will be called when you change the order of items
        editor.onOrderChange = function (item, oldIndex, newIndex) {
          var temp = ContentEvent.event.carouselImages[oldIndex];
          ContentEvent.event.carouselImages[oldIndex] = ContentEvent.event.carouselImages[newIndex];
          ContentEvent.event.carouselImages[newIndex] = temp;
          $scope.$digest();
        };

        var tmrDelayForEvent = null;
        var updateItemsWithDelay = function () {
          if (tmrDelayForEvent) {
            clearTimeout(tmrDelayForEvent);
          }
          var success = function (result) {
              if (!ContentEvent.event.id)
                ContentEvent.event.id = result.id;
              console.info('Init success result:', result);
              if (tmrDelayForEvent)clearTimeout(tmrDelayForEvent);
            }
            , error = function (err) {

            };
          tmrDelayForEvent = setTimeout(function () {
            DataStore.insert(ContentEvent.event, TAG_NAMES.EVENTS_MANUAL).then(success, error);
          }, 500);
        };


        ContentEvent.changeTimeZone = function (timezone) {
          ContentEvent.event.timezone = timezone;
        };

        ContentEvent.changeRepeatType = function (type) {
          ContentEvent.event.repeat = {};
          ContentEvent.event.repeat.isRepeating = true;
          ContentEvent.event.repeat.repeatType = type;
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
            if (!ContentEvent.event.links)
              ContentEvent.event.links = [];
            ContentEvent.event.links.push(result);
            $scope.$digest();
          };
          Buildfire.actionItems.showDialog(null, options, callback);
        };

        /**
         * Remove dynamic link
         */

        ContentEvent.removeLink = function (index) {
          if (ContentEvent.event && ContentEvent.event.links) {
            ContentEvent.event.links.splice(index, 1);
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
            if (!ContentEvent.event.links) {
              ContentEvent.event.links = [];
            }
            if (result === null) {
              return console.error('Error:Can not save data, Null record found.');
            }
            ContentEvent.event.links.splice(index, 1, result);
            $scope.$digest();
          });
        };

        /**
         * Save selected place from google autocomplete as address
         */

        ContentEvent.setLocation = function (data) {
          ContentEvent.event.address = {
            type: ADDRESS_TYPE.LOCATION,
            location: data.location,
            location_coordinates: data.coordinates
          };
          ContentEvent.currentAddress = ContentEvent.event.address.location;
          ContentEvent.currentCoordinates = ContentEvent.event.address.location_coordinates;
          $scope.$digest();
        };

        /**
         * Change the address and map to dragged marker location
         */

        ContentEvent.setDraggedLocation = function (data) {
          ContentEvent.event.address = {
            type: ADDRESS_TYPE.LOCATION,
            location: data.location,
            location_coordinates: data.coordinates
          };
          ContentEvent.currentAddress = ContentEvent.event.address.location;
          ContentEvent.currentCoordinates = ContentEvent.event.address.location_coordinates;
          $scope.$digest();
        };

        /* Build fire thumbnail component to add thumbnail image*/
        var listImage = new Buildfire.components.images.thumbnail("#listImage", {title: "List Image"});
        listImage.onChange = function (url) {
          ContentEvent.event.listImage = url;
          if (!$scope.$$phase && !$scope.$root.$$phase) {
            $scope.$apply();
          }
        };

        listImage.onDelete = function (url) {
          ContentEvent.event.listImage = "";
          if (!$scope.$$phase && !$scope.$root.$$phase) {
            $scope.$apply();
          }
        };

        ContentEvent.deleteEvent = function () {
          var item = ContentEvent.event;
          if (item.id) {
            Buildfire.datastore.delete(item.id, TAG_NAMES.EVENTS_MANUAL, function (err, result) {
              if (err)
                return;
              $location.path('/');
            });
          }
        };

        ContentEvent.clearAddress = function () {
          if (!ContentEvent.currentAddress) {
            ContentEvent.event.address = null;
            ContentEvent.currentCoordinates = null;
          }
        };

        ContentEvent.setCoordinates = function () {
          function successCallback(resp) {
            if (resp) {
              ContentEvent.event.address = {
                type: ADDRESS_TYPE.COORDINATES,
                location: resp.formatted_address || ContentEvent.currentAddress,
                location_coordinates: [ContentEvent.currentAddress.split(",")[0].trim(), ContentEvent.currentAddress.split(",")[1].trim()]
              };
              ContentEvent.currentAddress = ContentEvent.event.address.location;
              ContentEvent.currentCoordinates = ContentEvent.event.address.location_coordinates;
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


        $scope.$watch(function () {
          return ContentEvent.event;
        }, updateItemsWithDelay, true);

      }]);
})(window.angular);
