angular.module('IOne-Production').config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/fam/refundWay', {
        controller: 'RefundWayController',
        templateUrl: 'app/src/app/fam/refund_way/refundWay.html'
    })
}]);

angular.module('IOne-Production').controller('RefundWayController', function ($scope, $q, RefundWayService, DiscountChanService, $mdDialog, Constant) {
    $scope.PAY_TYPE = Constant.PAY_TYPE;
    $scope.FUND_TYPE = Constant.FUND_TYPE;

    $scope.pageOption = {
        sizePerPage: 10,
        currentPage: 0,
        totalPage: 100,
        totalElements: 100
    };

    $scope.listFilterOption = {
        status: Constant.STATUS[0].value,
        confirm: Constant.CONFIRM[0].value,
        release: Constant.RELEASE[0].value
    };

    $scope.sortByAction = function (field) {
        $scope.sortByField = field;
        $scope.sortType = '';
    };

    $scope.refreshList = function () {
        RefundWayService.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, $scope.listFilterOption.no, $scope.listFilterOption.name, $scope.listFilterOption.keyWord, '').success(function (data) {
            $scope.itemList = data.content;
            $scope.pageOption.totalPage = data.totalPages;
            $scope.pageOption.totalElements = data.totalElements;
        });
    };

    $scope.$watch('listFilterOption', function () {
        $scope.pageOption.currentPage = 0;
        $scope.pageOption.totalPage = 0;
        $scope.pageOption.totalElements = 0;
        $scope.refreshList();
    }, true);

    $scope.queryEnter = function (e) {
        if (e.keyCode === 13) {
            $scope.pageOption.currentPage = 0;
            $scope.pageOption.totalPage = 0;
            $scope.pageOption.totalElements = 0;
            $scope.refreshList();
        }
    };

    $scope.selectAllFlag = false;

    /**
     * Show left detail panel when clicking the title
     */
    $scope.showDetailPanelAction = function (item) {
        $scope.selectedItem = item;
    };

//    /**
//     * Show advanced search panel which you can add more search condition
//     */
//    $scope.showAdvancedSearchAction = function() {
//        $scope.displayAdvancedSearPanel = !$scope.displayAdvancedSearPanel;
//        $scope.selectedItem = null;
//    };

//    /**
//     * Show more panel when clicking the 'show more' on every item
//     */
//    $scope.toggleMorePanelAction = function(item) {
//        item.showMorePanel = !item.showMorePanel;
//
//        if(item.showMorePanel) {
//            item.detailList = $scope.subItemList;
//        }
//    };

    /**
     * Toggle the advanced panel for detail item in the list
     */
    $scope.toggleDetailMorePanelAction = function (detail) {
        detail.showMorePanel = !detail.showMorePanel;
    };

    /**
     * Change status to list all items
     */
    $scope.listItemAction = function () {
        $scope.changeViewStatus(Constant.UI_STATUS.VIEW_UI_STATUS);
        $scope.refreshList();
    };

    /**
     * Set stauts to 'edit' to edit an object. The panel will be generated automatically.
     */
    $scope.editItemAction = function (source, domain, desc) {
        $scope.changeViewStatus(Constant.UI_STATUS.EDIT_UI_STATUS);
        $scope.status = 'edit';
        $scope.desc = desc;
        $scope.source = source;
        $scope.domain = domain;
        $scope.selectedItemBackUp = angular.copy($scope.selectedItem);
    };

    /**
     * Add new item which will take the ui to the edit page.
     */
    $scope.preAddItemAction = function (source, domain, desc) {
        $scope.changeViewStatus(Constant.UI_STATUS.EDIT_UI_STATUS);
        $scope.status = 'add';
        $scope.desc = desc;
        $scope.source = source;
        $scope.domain = domain;
    };

    /**
     * Save object according current status and domain.
     */
    $scope.saveItemAction = function () {
        if ($scope.status == 'add') {
            RefundWayService.add($scope.source).success(function (data) {
                $scope.showInfo('新增数据成功。');
                $scope.refreshList();
            }).error(function (data) {
                $scope.showError('新增失败:' + '<br>' + data.message);
            });
        } else if ($scope.status = 'edit') {
            RefundWayService.modify($scope.source.uuid, $scope.source).success(function (data) {
                $scope.refreshList();
                $scope.showInfo('修改数据成功。');
                $scope.source = data;
                $scope.selectedItem = data;
                $scope.selectedItemBackUp = angular.copy($scope.selectedItem);
            }).error(function (data) {
                $scope.showError('修改失败:' + '<br>' + data.message);
                $scope.source = angular.copy($scope.selectedItemBackUp);
                $scope.selectedItem = angular.copy($scope.selectedItemBackUp);
            });
        }
    };

    $scope.selected = [];

    $scope.selectItemAction = function (event, item, selected) {
        $scope.stopEventPropagation(event);
        var idx = selected.indexOf(item);
        if (idx > -1) {
            selected.splice(idx, 1);
        }
        else {
            selected.push(item);
        }
        $scope.selectItemCount = $scope.selected.length;

    };

    $scope.exists = function (item, selected) {
        return selected.indexOf(item) > -1;
    };


    $scope.confirmClickAction = function (event, item) {
        $scope.stopEventPropagation(event);
        console.info('confirm...');
        //TODO ...
    };

    $scope.statusClickAction = function (event, item) {
        $scope.stopEventPropagation(event);
        console.info('status...');
        //TODO ...
    };

    $scope.releaseClickAction = function (event, item) {
        $scope.stopEventPropagation(event);
        console.info('release...');
        //TODO ...
    };

    $scope.deleteClickAction = function (event, item) {
        $scope.stopEventPropagation(event);
        $scope.showConfirm('确认删除吗？', '删除后不可恢复。', function () {
            RefundWayService.delete(item.uuid).success(function () {
                $scope.selectedItem = null;
                $scope.refreshList();
                $scope.showInfo('删除数据成功。');
                $scope.selectItemCount = 0;
            });
        });
    };

    $scope.confirmAllClickAction = function (event) {
        $scope.stopEventPropagation(event);
        console.info('confirm all...');
        //TODO ...
    };

    $scope.statusAllClickAction = function (event) {
        $scope.stopEventPropagation(event);
        console.info('status all...');
        //TODO ...
    };

    $scope.releaseAllClickAction = function (event) {
        $scope.stopEventPropagation(event);
        console.info('release all...');
        //TODO ...
    };

    $scope.deleteAllClickAction = function (event) {
        $scope.stopEventPropagation(event);
        if ($scope.selected.length > 0) {
            $scope.showConfirm('确认删除吗？', '删除后不可恢复。', function () {
                if ($scope.selected) {
                    var promises = [];
                    angular.forEach($scope.selected, function (item) {
                        var response = RefundWayService.delete(item.uuid).success(function (data) {
                        });
                        promises.push(response);
                    });
                    $q.all(promises).then(function () {
                        $scope.showInfo('删除数据成功。');
                        $scope.refreshList();
                        $scope.selectItemCount = 0;
                    });
                }
            });
        }
    };

    $scope.selectAllAction = function () {
        if ($scope.selectAllFlag == true) {
            angular.forEach($scope.itemList, function (item) {
                var idx = $scope.selected.indexOf(item);
                if (idx < 0) {
                    $scope.selected.push(item);
                }
            });

        } else if ($scope.selectAllFlag == false) {
            $scope.selected = [];
        }

        $scope.selectItemCount = $scope.selected.length;
    };

});



