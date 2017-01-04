angular.module('IOne-Production').config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/inventoryDetailApp', {
        controller: 'InventoryDetailAppController',
        templateUrl: 'app/src/app/inv/app/inventoryDetailApp.html'
    })
}]);

angular.module('IOne-Production').controller('InventoryDetailAppController', function ($mdDialog, $scope, $location, Production, InventoryDetailService) {

    $scope.inventoryDetailQuery = {
        warehouseKeyWord: '',
        itemKeyWord: '',
        itemUuid: $location.$$search.itemUuid
    };

    $scope.pageOption = {
        sizePerPage: 5,
        currentPage: 0,
        totalPage: 0,
        totalElements: 0
    };

    $scope.refreshList = function () {
        Production.getInventory(
            $scope.pageOption.sizePerPage,
            $scope.pageOption.currentPage,
            $scope.inventoryDetailQuery.itemUuid
        ).success(function (data) {
            $scope.allInventoryDetailData = data.content;
            $scope.pageOption.totalPage = data.totalPages;
            $scope.pageOption.totalElements = data.totalElements;
        });
    };

    $scope.refreshList();

});

