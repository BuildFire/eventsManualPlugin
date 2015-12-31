describe('Unit : Event Manual Plugin content.home.controller.js', function () {
    var ContentHome, scope, $rootScope, $controller, Buildfire, ActionItems, TAG_NAMES, STATUS_CODE, LAYOUTS, STATUS_MESSAGES, CONTENT_TYPE, q, Utils,buildfire;
    beforeEach(module('eventsManualPluginContent'));
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
        buildfire = {
            navigation:{
            scrollTop: function(){}
           }
        };

        ActionItems = jasmine.createSpyObj('ActionItems', ['showDialog']);
        Utils = jasmine.createSpyObj('Utils', ['validLongLats']);
        Buildfire.components.carousel = jasmine.createSpyObj('Buildfire.components.carousel', ['editor','onAddItems']);
        buildfire.navigation = jasmine.createSpyObj('buildfire.navigation', ['scrollTop']);

    }));

    beforeEach(function () {
        ContentHome = $controller('ContentHomeCtrl', {
            $scope: scope,
            $q: q,
            Buildfire: Buildfire,
            TAG_NAMES: TAG_NAMES,
            ActionItems: ActionItems,
            STATUS_CODE: STATUS_CODE,
            CONTENT_TYPE: CONTENT_TYPE,
            LAYOUTS: LAYOUTS,

            Utils:Utils
        });
    });

    describe('It will test the defined methods', function () {
        it('it should pass if ContentHome is defined', function () {
            expect(ContentHome).not.toBeUndefined();
        });

        it('it should test the passed html with tag', function () {
            var html = "<p>Test</p>"
            ContentHome.safeHtml(html)
        });
    });
    describe('ContentHome.getUTCZone', function () {
        it('should invoke when ContentHome.getUTCZone is called', function () {
            ContentHome.getUTCZone();
        });
    });
    describe('ContentHome.partOfTime', function () {
        it('should invoke when ContentHome.partOfTime is called', function () {
            var format='HH', paramTime = '2015-10-23T03:24:07.391Z0.9960675491020083'
            ContentHome.partOfTime(format,paramTime);
        });
    });

    describe('ContentHome.convertToZone', function () {
        it('should invoke when ContentHome.convertToZone is called', function () {
            var result={
                data: {
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

            }
        };
            ContentHome.convertToZone(result);
        });
    });
})
;