angular.module('IOne-Production').config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/eps/report/plmBaseItemFile', {
        controller: 'EpsOrderReport_plmBaseItemFile_controller',
        templateUrl: 'app/src/app/eps/report/plmBaseItemFile.html'
    })
}]);
angular.module('IOne-Production').controller('EpsOrderReport_plmBaseItemFile_controller', function ($scope, EPSMaster, EPSReceipts, Constant, $mdDialog, $q) {

});