angular.module('IOne-Production').config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/dsm/stopSale', {
        controller: 'StopSaleController',
        templateUrl: 'app/src/app/dsm/stopSale/stopSale.html'
    })
}]);

angular.module('IOne-Production').controller('StopSaleController', function ($scope, $q, $mdDialog, Constant) {

});