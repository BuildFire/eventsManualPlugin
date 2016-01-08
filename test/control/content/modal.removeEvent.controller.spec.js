describe('Unit : Event Manual Plugin content.RemoveEventPopupCtrl.controller.js', function () {
    var RemoveEventPopup, scope, $rootScope, $controller,modalInstance;
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
        RemoveEventPopup = $controller('RemoveEventPopupCtrl', {
            $scope: scope,
            eventsManualData: {},
            $modalInstance:modalInstance
        });
    });

    describe('It will test the defined methods', function () {
        it('it should pass if RemoveEventPopup is defined', function () {
            expect(RemoveEventPopup).not.toBeUndefined();
        });
        it('RemoveEventPopup.cancel should close modalInstance', function () {
            RemoveEventPopup.cancel();
            expect(modalInstance.dismiss).toHaveBeenCalledWith('No');
        });
        it('RemoveEventPopup.ok should close modalInstance', function () {
            RemoveEventPopup.ok();
            expect(modalInstance.close).toHaveBeenCalledWith('yes');
        });
    });
});
