angular.module('IOne-Production').config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/inv/inventoryDetail', {
        controller: 'InventoryDetailController',
        templateUrl: 'app/src/app/inv/inventoryDetail.html'
    })
}]);

angular.module('IOne-Production').controller('InventoryDetailController', function ($scope, InventoryDetailService) {

    $scope.inventoryDetailQuery = {
        warehouseNO : '',
        warehouseName : '',
        itemFileNo : '',
        itemFileName : '',
        itemFileStandard : ''
    };

    // 搜索清單數值
    $scope.pageOption = {
        sizePerPage: 5, // 报表每页5笔分页显示
        currentPage: 0,
        totalPage: 0,
        totalElements: 0,
        displayModel: 0  //0 : image + text //1 : image
    };

    $scope.enterKeyDown = function(e){
        var keycode = window.event?e.keyCode:e.which;
        if(keycode === 13){
            $scope.queryReport();
        }
    }

    // [搜索] 按钮
    $scope.queryReport = function () {
        InventoryDetailService.getAll(
            $scope.pageOption.currentPage,
            $scope.pageOption.sizePerPage,
            $scope.inventoryDetailQuery
        ).success(function (data) {
            $scope.allInventoryDetailData = data;
            $scope.pageOption.totalPage = data.totalPages;
            $scope.pageOption.totalElements = data.totalElements;
        });
    };
});