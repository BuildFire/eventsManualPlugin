describe('Unit : Event Manual Plugin content.DeepLinkPopupCtrl.controller.js', function () {
    var DeepLinkPopup, scope, $rootScope, $controller,modalInstance;
    beforeEach(module('eventsManualPluginContent'));
    var editor;
    beforeEach(inject(function (_$rootScope_, _$controller_) {
        $rootScope = _$rootScope_;
        scope = $rootScope.$new();
        $controller = _$controller_;
        modalInstance = {                    // Create a mock object using spies
            close: jasmine.createSpy('modalInstance.close'),
            dismiss: jasmine.createSpy('modalInstance.dismiss'),
            result: {
                then: jasmine.createSpy('modalInstance.result.then')
            }
        };
    }));

    beforeEach(function () {
        DeepLinkPopup = $controller('DeepLinkPopupCtrl', {
            $scope: scope,
            deepLink: "deeplinkURL",
            $modalInstance:modalInstance
        });
    });

    describe('It will test the defined methods', function () {
        it('it should pass if ContentHome is defined', function () {
            expect(DeepLinkPopup).not.toBeUndefined();
        });
        it('DeepLinkPopup.cancel should close modalInstance', function () {
            DeepLinkPopup.cancel();
            expect(modalInstance.dismiss).toHaveBeenCalledWith('Close');
        });
    });
});