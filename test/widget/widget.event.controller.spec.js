describe('Unit : event Manual Plugin widget.manual.controller.js', function () {
  var DataStore, WidgetEvent, scope, $rootScope, $controller, Buildfire, ActionItems, TAG_NAMES, STATUS_CODE, LAYOUTS, STATUS_MESSAGES, CONTENT_TYPE, q;
  beforeEach(module('eventsManualPluginWidget'));
  var editor;
  beforeEach(inject(function (_$rootScope_, _$q_, _$controller_, _TAG_NAMES_, _STATUS_CODE_, _LAYOUTS_, _STATUS_MESSAGES_) {
    $rootScope = _$rootScope_;
    q = _$q_;
    scope = $rootScope.$new();
    $controller = _$controller_;
    TAG_NAMES = _TAG_NAMES_;
    STATUS_CODE = _STATUS_CODE_;
    STATUS_MESSAGES = _STATUS_MESSAGES_;
    LAYOUTS = _LAYOUTS_;
    Buildfire = {
      components: {
        carousel: {
          editor: function (name) {
            return {}
          },
          viewer: function (name) {
            return {}
          }
        }
      }
    };
    ActionItems = jasmine.createSpyObj('ActionItems', ['showDialog']);
    Buildfire.components.carousel = jasmine.createSpyObj('Buildfire.components.carousel', ['editor', 'onAddItems']);
    Buildfire.imageLib= jasmine.createSpyObj('imageLib', ['cropImage', '']);
    Buildfire.imageLib= jasmine.createSpyObj('imageLib', ['cropImage', '']);

    DataStore = jasmine.createSpyObj('DataStore', ['get']);

  }));

  beforeEach(function () {
    WidgetEvent = $controller('WidgetEventCtrl', {
      $scope: scope,
      $q: q,
      Buildfire: Buildfire,
      TAG_NAMES: TAG_NAMES,
      ActionItems: ActionItems,
      STATUS_CODE: STATUS_CODE,
      CONTENT_TYPE: CONTENT_TYPE,
      LAYOUTS: LAYOUTS
    });


  });

  describe('Units: units should be Defined', function () {


  });

  describe('$destroy', function () {
    it('should invoke when get $destroy', function () {
      $rootScope.$broadcast('$destroy');
    });
  });

  describe('Carousel:LOADED', function () {
    it('should invoke when get Carousel:LOADED', function () {
        WidgetEvent.view = {
        loadItems: function() {}
      };
      $rootScope.$broadcast(' ');
    });
  });

  describe('WidgetEvent.getUTCZone', function () {
    it('should invoke when WidgetEvent.getUTCZone is called', function () {
      WidgetEvent.getUTCZone();
    });
  });
  describe('WidgetEvent.partOfTime', function () {
    it('should invoke when WidgetEvent.partOfTime is called', function () {
      var format='HH', paramTime = '2015-10-23T03:24:07.391Z0.9960675491020083'
      WidgetEvent.partOfTime(format,paramTime);
    });
  });

  describe('WidgetEvent.cropImage', function () {
    it('should invoke when WidgetEvent.cropImage is called', function () {
      var setting={};
      setting.height='212';
      setting.width='212';
      WidgetEvent.cropImage('/asa/asa',setting);
    });
  });

  describe('WidgetEvent.safeHtml', function () {
    it('should invoke when WidgetEvent.safeHtml is called', function () {

      WidgetEvent.safeHtml('dasdas');
    });
  });

  describe('WidgetEvent.executeActionItem', function () {
    it('should invoke when WidgetEvent.executeActionItem is called', function () {

      WidgetEvent.executeActionItem({});
    });
  });

  describe('WidgetEvent.showDescription', function () {
    it('should invoke when WidgetEvent.showDescription is called', function () {

      WidgetEvent.showDescription({});
    });
  });

  xdescribe('WidgetEvent.addEventsToCalendar', function () {
    it('should invoke when WidgetEvent.addEventsToCalendar is called', function () {

      WidgetEvent.addEventsToCalendar({});
    });
  });

  describe('WidgetEvent.onAddressClick', function () {
    it('should invoke when WidgetEvent.onAddressClick is called', function () {

      WidgetEvent.onAddressClick(121,121);
    });
  });



});