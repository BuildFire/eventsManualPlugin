'use strict';

(function (angular) {
  angular.module('eventsManualPluginContent')
    .constant('TAG_NAMES', {
      EVENTS_MANUAL_INFO: 'eventsManualInfo',
      EVENTS_MANUAL: "eventsManual"
    })
    .constant('STATUS_CODE', {
      INSERTED: 'inserted',
      UPDATED: 'updated',
      NOT_FOUND: 'NOTFOUND',
      UNDEFINED_DATA: 'UNDEFINED_DATA',
      UNDEFINED_OPTIONS: 'UNDEFINED_OPTIONS',
      UNDEFINED_ID: 'UNDEFINED_ID',
      ITEM_ARRAY_FOUND: 'ITEM_ARRAY_FOUND',
      NOT_ITEM_ARRAY: 'NOT_ITEM_ARRAY'
    })
    .constant('STATUS_MESSAGES', {
      UNDEFINED_DATA: 'Undefined data provided',
      UNDEFINED_OPTIONS: 'Undefined options provided',
      UNDEFINED_ID: 'Undefined id provided',
      NOT_ITEM_ARRAY: 'Array of Items not provided',
      ITEM_ARRAY_FOUND: 'Array of Items provided'
    })
    .constant('LAYOUTS', {
      itemDetailsLayout: [
        {name: "Event_Item_1"},
        {name: "Event_Item_2"},
        {name: "Event_Item_3"},
        {name: "Event_Item_4"}
      ]
    })
    .constant('ADDRESS_TYPE', {
      LOCATION: 'Location',
      COORDINATES: "Coordinates"
    })
    .constant('GOOGLE_KEYS', {
      API_KEY: 'AIzaSyB0xpJ-AseoeusvT2PPWd5MOak58CR_B0c'
    })
    .constant('PAGINATION', {
      eventsCount: 10
    });
})(window.angular);