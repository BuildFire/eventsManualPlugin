describe('Unit : Event Manual Plugin content.event.controller.js', function () {
    var ContentEvent, scope, $rootScope, $controller, Buildfire, ActionItems, TAG_NAMES, STATUS_CODE, LAYOUTS, STATUS_MESSAGES, CONTENT_TYPE, q, Utils;
    beforeEach(module('eventsManualPluginContent'));
    var editor;
    beforeEach(inject(function (_$rootScope_, _$q_, _Buildfire_, _$controller_, _TAG_NAMES_, _STATUS_CODE_, _LAYOUTS_, _STATUS_MESSAGES_) {
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
                },
                images: {
                    thumbnail: function () {

                    }
                }
            }
        };
        ActionItems = jasmine.createSpyObj('ActionItems', ['showDialog']);
        Utils = jasmine.createSpyObj('Utils', ['validLongLats']);
        //Buildfire.components.carousel = jasmine.createSpyObj('Buildfire.components.carousel', ['editor', 'onAddItems']);
        Buildfire.components.carousel = jasmine.createSpyObj('Buildfire.components.carousel', ['editor', '', '']);
        Buildfire.components.carousel.editor.and.callFake(function () {
            return {
                loadItems: function () {
                    console.log("editor.loadItems hasbeen called");
                }
            };
        });

    }));

    beforeEach(function () {
        ContentEvent = $controller('ContentEventCtrl', {
            $scope: scope,
            $q: q,
            Buildfire: Buildfire,
            TAG_NAMES: TAG_NAMES,
            ActionItems: ActionItems,
            STATUS_CODE: STATUS_CODE,
            CONTENT_TYPE: CONTENT_TYPE,
            LAYOUTS: LAYOUTS,
            Utils: Utils
        });
    });


    describe('It will test the defined methods', function () {
        it('it should pass if ContentEvent is defined', function () {
            expect(ContentEvent).not.toBeUndefined();
        });
        it('it should pass if ContentEvent.isvalidEvent returns startTime', function () {
            expect(ContentEvent.isValidEvent({
                startDate: '2-1-2016',
                title: 'Bday',
                startTime: '12:30am'
            })).toEqual('12:30am');
        });
        it('it should pass if ContentEvent.isvalidEvent isAllDay is there returns title', function () {
            expect(ContentEvent.isValidEvent({
                isAllDay: 'yes',
                startDate: '2-1-2016',
                title: 'Bday',
                startTime: '12:30am'
            })).toEqual('Bday');
        });
        it('it should pass if ContentEvent.isvalidEvent endTime is there returns title', function () {
            expect(ContentEvent.isValidEvent({
                startDate: 'Sun Oct 16 2016 00:00:00 GMT+0530 (IST)',
                title: 'Bday',
                startTime: 'Sun Oct 16 2016 00:00:00 GMT+0530 (IST)',
                endDate: 'Sun Oct 16 2016 00:00:00 GMT+0530 (IST)',
                endTime: 'Thu Jan 01 1970 12:59:00 GMT+0530 (IST)'
            })).toEqual(true);
        });
        it('it should pass if ContentEvent.isvalidEvent endTime is there returns title', function () {
          ContentEvent.event.data= {
                startDate: 'Sun Oct 16 2016 00:00:00 GMT+0530 (IST)',
                title: 'Bday',
                startTime: 'Sun Oct 16 2016 00:00:00 GMT+0530 (IST)',
                endDate: 'Sun Oct 16 2016 00:00:00 GMT+0530 (IST)',
                endTime: 'Thu Jan 01 1970 12:59:00 GMT+0530 (IST)',
              repeat:{
                  startDate:'Tue Jan 05 2016 00:00:00 GMT+0530 (IST)',
                  endOn:'Wed Jan 13 2016 00:00:00 GMT+0530 (IST)'
              }
            };
            ContentEvent.updateEventData();
            $rootScope.$apply();
            expect(ContentEvent.event.data.startDate).toEqual(1476556200000);
        });

    });
});