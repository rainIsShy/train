angular.module('IOne-Production').config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/ass/assformFlow', {
        controller: 'AssFormFlowController',
        templateUrl: 'app/src/app/ass/assformFlow/assformFlow.html'
    })


}]);

angular.module('IOne-Production').controller('AssFormFlowController', function ($scope, AssFormFlowService, AssFormDetailService, OCMSupplierService, CBIEmployeeService, RoleService, FunctionService, Constant, $mdDialog) {
    $scope.ASSFORM_SERVICE_TYPE = Constant.ASSFORM_SERVICE_TYPE;
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

    $scope.queryEnter = function (e) {
        if (e.keyCode === 13) {
            $scope.pageOption.currentPage = 0;
            $scope.pageOption.totalPage = 0;
            $scope.pageOption.totalElements = 0;
            $scope.refreshList();
        }
    };

    $scope.refreshList = function () {
        AssFormFlowService.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, 'Y', '1', $scope.listFilterOption).success(function (data) {
            $scope.assFormFlowList = data.content;
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

    $scope.refreshDetailList = function (item) {
        AssFormDetailService.get(item.assForm.uuid).success(function (data) {
            item.detailList = data.content;
        });
    };

    //顯示目前己上傳的圖片
    $scope.showPictureImage = function (item) {
        $scope.pics = [];
        $scope.selectedItemPics = [];
        for (var i = 1; i <= 5; i++) {
            if (item.assForm["picture" + i] != '' && item.assForm["picture" + i] != null) {
                $scope.pics.push("picture" + i); //记逾目前有被保存的图片字段
                $scope.selectedItemPics.push($scope.getImageFullPath(item.assForm["picture" + i]));
            }
        }
    };

    $scope.refreshFlowDetailList = function (item) {
        AssFormFlowService.get(item.assForm.uuid).success(function (data) {
            item.flowDetailList = data.content;
            angular.forEach(item.flowDetailList, function (item) {
                if (item.transferRole != '' && item.transferRole != null) {
                    RoleService.get(item.transferRole).success(function (role) {
                        item.transferRoleName = role.name;
                    });
                }

                //取得流转组织/渠道
                if (item.transferSource == "1") {
                    // GroupFunctionService.getByUuid(item.transferData).success(function (tran) {
                    //     item.transferDataName = tran.function.name;
                    // });

                    FunctionService.get(item.transferData).success(function (tran) {
                        item.transferDataName = tran.name;
                    });
                } else if (item.transferSource == "2") {
                    ChannelService.get(item.transferData).success(function (tran) {
                        item.transferDataName = tran.name;
                    });
                } else if (item.transferSource == "3") {
                    CBIEmployeeService.get(item.transferData).success(function (tran) {
                        item.transferDataName = tran.name;
                    });
                }

                if (item.currentEmplUuid != null) {
                    CBIEmployeeService.get(item.currentEmplUuid).success(function (data) {
                        item.currentEmplName = data.name;
                    });
                }

                //判斷是否為正在審核關卡
                if (item.currentEmplUuid != null && item.flowStatus == '1' && item.confirm != '2') {
                    item.bgColor = {'background-color': '#76EEC6'};//green
                } else {
                    item.bgColor = {'background-color': 'lightgray'};//green
                }

            });

            if (item.flowDetailList.length > 0) {
                if (item.flowDetailList[0].confirm == '2') {
                    item.isProgress = true;
                }
            }
            $scope.currentStage = "";
        });
    };


    /**
     * Show left detail panel when clicking the title
     */
    $scope.showDetailPanelAction = function (item) {
        $scope.selectedItem = item;
        if ($scope.selectedItem.assForm.logisticsServiceProvider != '' && $scope.selectedItem.assForm.logisticsServiceProvider != null) {
            OCMSupplierService.get($scope.selectedItem.assForm.logisticsServiceProvider, '2').success(function (data) {
                if (data.totalElements > 0) {
                    $scope.selectedItem.assForm.logisticsServiceProviderName = data.content[0].name;
                }
            });
        }

        if ($scope.selectedItem.assForm.installationServiceProvider != '' && $scope.selectedItem.assForm.installationServiceProvider != null) {
            OCMSupplierService.get($scope.selectedItem.assForm.installationServiceProvider, '3').success(function (data) {
                if (data.totalElements > 0) {
                    $scope.selectedItem.assForm.installationServiceProviderName = data.content[0].name;
                }
            });
        }

        $scope.refreshDetailList(item);
        $scope.refreshFlowDetailList(item);
        $scope.showPictureImage(item);
    };

    /**
     * Show advanced search panel which you can add more search condition
     */
    $scope.showAdvancedSearchAction = function () {
        $scope.displayAdvancedSearPanel = !$scope.displayAdvancedSearPanel;
        $scope.selectedItem = null;
    };

    /**
     * Show more panel when clicking the 'show more' on every item
     */
    $scope.toggleMorePanelAction = function (item) {
        item.showMorePanel = !item.showMorePanel;
        if (item.showMorePanel) {
            $scope.refreshDetailList(item);
            $scope.refreshFlowDetailList(item);
        }
    };

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

    };


    /**
     * Save object according current status and domain.
     */
    $scope.saveItemAction = function () {
        if ($scope.status == 'add') {

        } else if ($scope.status == 'edit') {

        }
    };

    /**
     * Delete detail item
     */
    $scope.deleteDetailAction = function (detail) {

    };

    $scope.selectItemAction = function (event, item) {
        $scope.stopEventPropagation(event);
        //TODO ...
    };

    $scope.confirmClickAction = function (event, item) {
        $scope.stopEventPropagation(event);
        var source = [];

        $mdDialog.show({
            controller: 'AssFormFlowConfirmController',
            templateUrl: 'app/src/app/ass/assformFlow/assformFlowConfirm.html',
            parent: angular.element(document.body),
            // scope: $scope,
            targetEvent: event,
            locals: {
                source: source
            }
        }).then(function (data) {
            console.log(data);
            if (data.action == 'cancel') {
                item.confirm = '1'
            } else if (data.action == 'save') {

                item.confirm = "2";
                item.flowStatus = "2";
                item.followUpContent = data.followUpContent;
                AssFormFlowService.modify(item.uuid, item).success(function (data) {
                    if (item.transferType == '1') {
                        $scope.showInfo('审批成功!');
                    } else {
                        $scope.showInfo('結案成功!');
                    }
                    $scope.refreshList();
                }).error(function () {
                    $scope.showError('审批失败。');
                });
            }
        });
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
        console.info('delete...');
        //TODO ...
    };

    $scope.confirmAllClickAction = function (event) {

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
        console.info('delete all...');
        //TODO ...
    };

    $scope.selectAllAction = function () {
        angular.forEach($scope.itemList, function (item) {
            if ($scope.selectAllFlag) {
                item.selected = true;
            } else {
                item.selected = false;
            }
        })
    };

});

angular.module('IOne-Production').controller('AssFormFlowConfirmController', function ($scope, $http, SalesOrderMaster, OCMSupplierService, $mdDialog, Constant, source) {

    $scope.hideDlg = function (action) {
        var data = {
            followUpContent: $scope.followUpContent,
            action: action
        };
        console.log(data);
        $mdDialog.hide(data);
    };

    $scope.cancelDlg = function () {
        $mdDialog.cancel();
    };
});
