angular.module('IOne-Production').config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/shopping-cart', {
        controller: 'ShoppingCartController',
        templateUrl: 'app/src/app/order/shopping_cart/shoppingCart.html'
    })
}]);

angular.module('IOne-Production').controller('ShoppingCartController', function ($scope, ShoppingCart, ShoppingCartItemPic, $mdDialog, $timeout, Constant, ChannelPriceService) {
    $scope.shoppingCart = {
        employeeName: '',
        clientName: '',
    };

    $scope.pageOption = {
        sizePerPage: 10,
        currentPage: 0,
        totalPage: 100,
        totalElements: 100
    };
    $scope.detailLoad = function () {
        angular.forEach($scope.shoppingCartList, function (item) {
            $scope.dataLoad(item);
        });
    };
    $scope.searchShoppingCartList = function (pageCallback) {
        if (pageCallback || $scope.shoppingCartList == null) {

            if ($scope.shoppingCart.employeeName !== undefined) {
                employeeName = $scope.shoppingCart.employeeName;
            } else {
                employeeName = null;
            }

            if ($scope.shoppingCart.clientName !== undefined) {
                customerName = $scope.shoppingCart.clientName;
            } else {
                customerName = null;
            }

            ShoppingCart.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, employeeName, customerName, RES_UUID_MAP.PSO.CART.LIST_PAGE.RES_UUID, "/All")

                .success(function (data) {
                    $scope.shoppingCartList = data;
                    $scope.pageOption.totalPage = data.totalPages;
                    $scope.pageOption.totalElements = data.totalElements;
                    $scope.pageOption.totalPage = data.totalPages;
                }).then(function (data) {
                angular.forEach(data.data.content, function (item) {
                    $scope.dataLoad(item);
                });
                }
            );
        }
    };

    $scope.dataLoad = function (shoppingCartItem) {
        console.log(shoppingCartItem);
        if (shoppingCartItem.itemDetails == null) {

            ShoppingCart.getAll(1000, 0, shoppingCartItem.employeeName, shoppingCartItem.customerName, RES_UUID_MAP.PSO.CART.LIST_PAGE.RES_UUID, "", shoppingCartItem.customerNo, shoppingCartItem.employeeNo)
                .success(function (data) {
                        shoppingCartItem.itemDetails = data.content;
                    }
                );
        }
    };


    $scope.editItem = function (shoppingCartItem) {
        $scope.selectedItem = shoppingCartItem;
        console.log(shoppingCartItem);
        $scope.changeViewStatus(Constant.UI_STATUS.PRE_EDIT_UI_STATUS, 1);

    };
    $scope.listTabSelected = function () {
        $scope.searchShoppingCartList(false);
        $scope.selectedItem = null;
        $scope.changeViewStatus(Constant.UI_STATUS.VIEW_UI_STATUS, 0);
        $scope.getMenuAuthData($scope.RES_UUID_MAP.PSO.CART.LIST_PAGE.RES_UUID).success(function (data) {
            $scope.menuAuthDataMap = $scope.menuDataMap(data);
        });
    };

    $scope.formTabSelected = function () {
        $scope.getMenuAuthData($scope.RES_UUID_MAP.PSO.CART.FORM_PAGE.RES_UUID).success(function (data) {
            $scope.menuAuthDataMap = $scope.menuDataMap(data);
        });
    };

});
