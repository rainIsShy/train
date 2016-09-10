angular.module('IOne-Production').config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/ass/assform', {
        controller: 'AssFormController',
        templateUrl: 'app/src/app/ass/assform/assform.html'
    })


}]);

angular.module('IOne-Production').controller('AssFormController', function ($scope, AssFormMasterService, AssFormDetailService, AssFormFlowService, OCMSupplierService, ChannelService, RoleService, CBIEmployeeService, GroupFunctionService, FunctionService, WorkflowService, Constant, $mdDialog, $q, $timeout, Upload) {
    $scope.ASSFORM_SERVICE_TYPE = Constant.ASSFORM_SERVICE_TYPE;
    $scope.WORKFLOW_TRANSFER_TYPE = Constant.WORKFLOW_TRANSFER_TYPE;
    $scope.selected = [];
    $scope.detailSelected = [];

    $scope.pageOption = {
        sizePerPage: 10,
        currentPage: 0,
        totalPage: 100,
        totalElements: 100
    };
    $scope.formMenuDisplayOption = {
        //新增:36880486-CE68-40CC-8DFA-357E366301AA
        '100-add': {display: true, name: '新增', uuid: '36880486-CE68-40CC-8DFA-357E366301AA'},
        //保存:32B78CF6-4E7F-4741-B52F-607B50FF4745
        '101-save': {display: true, name: '保存', uuid: '32B78CF6-4E7F-4741-B52F-607B50FF4745'},
        //修改:D9EB9ED1-E3CB-4DC1-9538-DE1A70AB0C36
        '102-edit': {display: true, name: '修改', uuid: 'D9EB9ED1-E3CB-4DC1-9538-DE1A70AB0C36'},
        //删除:CDC8E10B-DE05-4965-993C-81981924477B
        '103-delete': {display: true, name: '删除', uuid: 'CDC8E10B-DE05-4965-993C-81981924477B'},
        //批量删除:E5B9CC3A-D7DB-4CC5-9F39-49374B4BF87E
        '104-batchDelete': {display: true, name: '批量删除', uuid: 'E5B9CC3A-D7DB-4CC5-9F39-49374B4BF87E'},
        //單身-批量删除:8DC65F11-7B9B-44DE-B51B-5DDB53ACA735
        '105-subBatchDelete': {display: true, name: '批量删除', uuid: '8DC65F11-7B9B-44DE-B51B-5DDB53ACA735'}

    };
    $scope.listFilterOption = {
        status: Constant.STATUS[0].value,
        confirm: Constant.CONFIRM[0].value,
        release: Constant.RELEASE[0].value,
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
        AssFormMasterService.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, $scope.listFilterOption, '', '', '', '', '', '', '').success(function (data) {
            $scope.assFormMstList = data.content;
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
        AssFormDetailService.get(item.uuid).success(function (data) {
            item.detailList = data.content;
        });
    };

    $scope.refreshFlowDetailList = function (item) {
        AssFormFlowService.get(item.uuid).success(function (data) {
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

    $scope.selectAllFlag = false;
    $scope.selectDetailAllFlag = false;

    /**
     * Show left detail panel when clicking the title
     */
    $scope.showDetailPanelAction = function (item) {
        $scope.selectedItem = item;
        $scope.selectedItem.salesOrderMasterNo = $scope.selectedItem.salesOrderMaster.no;
        $scope.selectedItem.salesOrderMasterUuid = $scope.selectedItem.salesOrderMaster.uuid;
        $scope.selectedItem.logisticsServiceProviderUuid = $scope.selectedItem.logisticsServiceProvider;
        $scope.selectedItem.installationServiceProviderUuid = $scope.selectedItem.installationServiceProvider;
        if ($scope.selectedItem.logisticsServiceProvider != '' && $scope.selectedItem.logisticsServiceProvider != null) {
            OCMSupplierService.get($scope.selectedItem.logisticsServiceProvider, '2').success(function (data) {
                if (data.totalElements > 0) {
                    $scope.selectedItem.logisticsServiceProviderName = data.content[0].name;
                }
            });
        }

        if ($scope.selectedItem.installationServiceProvider != '' && $scope.selectedItem.installationServiceProvider != null) {
            OCMSupplierService.get($scope.selectedItem.installationServiceProvider, '3').success(function (data) {
                if (data.totalElements > 0) {
                    $scope.selectedItem.installationServiceProviderName = data.content[0].name;
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
            // console.log(item);
            // $scope.showPictureImage(item);
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
        if ($scope.ui_status == Constant.UI_STATUS.EDIT_UI_STATUS_ADD) {
            $scope.selectedItem = null;
        }

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
        $scope.selectedItemPics = [];

        $scope.showPictureImage($scope.selectedItem);
    };

    /**
     * Add new item which will take the ui to the edit page.
     */
    $scope.preAddItemAction = function (source, domain, desc) {
        $scope.changeViewStatus(Constant.UI_STATUS.EDIT_UI_STATUS);
        $scope.selectedItem = {
            salesOrderMasterUuid: '',
            serviceType: '',
            logisticsServiceProvider: '',
            installationServiceProvider: '',
            refundAmount: '',
            description: ''
        };
        $scope.status = 'add';
        $scope.desc = desc;
        $scope.source = source;
        $scope.domain = domain;
        $scope.pics = [];
        $scope.selectedItemPics = [];
        $scope.changeViewStatus($scope.UI_STATUS.EDIT_UI_STATUS_ADD);
    };

    /**
     * Save object according current status and domain.
     */
    $scope.saveItemAction = function () {
        if ($scope.status == 'add') {
            WorkflowService.getByCurrentUser().success(function (result) {
                if (result.totalElements > 0) {
                    AssFormMasterService.add($scope.selectedItem).success(function (data) {
                        $scope.showInfo('新增数据成功。');
                        $scope.refreshList();
                        // $scope.refreshDetailList($scope.selectedItem);
                        // $scope.refreshFlowDetailList($scope.selectedItem);
                    }).error(function () {
                        $scope.showError('新增失败。');
                    });
                } else {
                    $scope.showError('该用户无工作流可使用!');
                }
            });

        } else if ($scope.status == 'edit') {
            AssFormMasterService.modify($scope.selectedItem.uuid, $scope.selectedItem).success(function (data) {
                $scope.showInfo('修改数据成功。');
                $scope.refreshList();
            }).error(function () {
                $scope.showError('修改失败。');
            });
        }
    };

    /**
     * Delete detail item
     */
    $scope.deleteDetailAction = function (detail) {
        $scope.showConfirm('确认删除吗？', '删除后不可恢复。', function () {
            AssFormDetailService.delete($scope.selectedItem.uuid, detail.uuid).success(function () {
                $scope.refreshDetailList($scope.selectedItem);
                $scope.showInfo('删除数据成功。');
            });
        });
    };

    $scope.deleteDetailAllAction = function (detailSelected) {
        var promises = [];
        $scope.showConfirm('确认删除吗？', '删除后不可恢复。', function () {
            angular.forEach(detailSelected, function (item) {
                var response = AssFormDetailService.delete(item.assForm.uuid, item.uuid).success(function () {

                });
                promises.push(response);
            });
            $q.all(promises).then(function () {
                $scope.showInfo('删除数据成功。');
                $scope.refreshDetailList($scope.selectedItem);
                $scope.detailSelected = [];
            });
        });
    };

    $scope.selectItemAction = function (event, item, selected) {
        $scope.stopEventPropagation(event);
        var idx = $scope.selected.indexOf(item);
        if (idx > -1) {
            $scope.selected.splice(idx, 1);
        }
        else {
            $scope.selected.push(item);
        }
        $scope.selectItemCount = $scope.selected.length;
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
        if ($scope.selectedItem.flowDetailList.length > 0) {
            if ($scope.selectedItem.flowDetailList[0].confirm == '2') {
                $scope.showError("流程己审批，无法删除!");
                return;
            }
        }
        $scope.showConfirm('确认删除吗？', '删除后不可恢复。', function () {
            AssFormMasterService.delete(item.uuid).success(function () {
                $scope.selectedItem = null;
                $scope.refreshList();
                $scope.showInfo('删除数据成功。');
            });
        });
    };




    $scope.deleteAllClickAction = function (event) {
        $scope.stopEventPropagation(event);
        var mainProcess = [];
        if ($scope.selected.length > 0) {
            var errorInfo = [];
            angular.forEach($scope.selected, function (item) {
                var response = AssFormFlowService.get(item.uuid).success(function (data) {
                    item.flowDetailList = data.content;
                    if (item.flowDetailList.length > 0) {
                        if (item.flowDetailList[0].confirm == '2') {
                            $scope.showError('预订单号：' + item.flowDetailList[0].assForm.salesOrderMaster.no + '流程己审批，无法删除!');
                            errorInfo.push("error");

                        }

                    }

                });
                mainProcess.push(response);

            });
            $q.all(mainProcess).then(function () {
                if (errorInfo.length == 0) {
                    $scope.showConfirm('确认删除吗？', '删除后不可恢复。', function () {
                        if ($scope.selected) {
                            var promises = [];
                            angular.forEach($scope.selected, function (item) {
                                var response = AssFormMasterService.delete(item.uuid).success(function (data) {
                                });
                                promises.push(response);
                            });
                            $q.all(promises).then(function () {
                                $scope.showInfo('删除数据成功。');
                                $scope.refreshList();
                                $scope.selectItemCount = 0;
                                $scope.selected = [];
                            });
                        }
                    });
                }
            });
        }
    };


    $scope.selectAllAction = function () {
        console.log($scope.selectAllFlag);
        if ($scope.selectAllFlag == true) {
            angular.forEach($scope.assFormMstList, function (item) {
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


    $scope.exists = function (item, selected) {
        return selected.indexOf(item) > -1;
    };

    $scope.selectDetailItemAction = function (event, item, detailSelected) {
        $scope.stopEventPropagation(event);
        var idx = detailSelected.indexOf(item);
        if (idx > -1) {
            detailSelected.splice(idx, 1);
        }
        else {
            detailSelected.push(item);
        }
        $scope.selectDetailItemCount = $scope.detailSelected.length;

    };

    $scope.selectDetailAllAction = function () {
        if ($scope.selectDetailAllFlag == true) {
            angular.forEach($scope.selectedItem.detailList, function (item) {
                var idx = $scope.detailSelected.indexOf(item);
                if (idx < 0) {
                    $scope.detailSelected.push(item);
                }
            });

        } else if ($scope.selectDetailAllFlag == false) {
            $scope.detailSelected = [];
        }

        $scope.selectDetailItemCount = $scope.detailSelected.length;
    };


    $scope.getSupplierName = function (field, uuid, salesType) {
        OCMSupplierService.get(uuid).success(function (data) {
            if (data.totalElements > 0) {
                field = data.content[0].name;
            }

        });

    };

    $scope.currentSmallImageIndex = {value: 0};
    $scope.uploadImage = function (files, type) {
        $scope.progress = {value: 0};
        if (files && files.length) {
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                Upload.upload({
                    url: Constant.BACKEND_BASE + '/files',
                    fields: {},
                    file: file
                }).progress(function (evt) {
                    $scope.progress.value = Math.min(100, parseInt(99.0 * evt.loaded / evt.total));
                }).success(function (data) {
                    $timeout(function () {
                        if ($scope.selectedItem && $scope.selectedItem.uuid) {
                            AssFormMasterService.addImage($scope.selectedItem.uuid, data.uuid).success(function (response) {

                                $scope.showPictureImage(response);
                            });

                        }
                    });
                });
            }
        }
    };

    //删除图片
    $scope.deleteItemImage = function () {
        // if($scope.currentSmallImageIndex.value > 0) {
        AssFormMasterService.deleteImage($scope.selectedItem.uuid, $scope.pics[$scope.currentSmallImageIndex.value]).success(function (data) {
            // $scope.pics.splice($scope.currentSmallImageIndex.value - 1, 1);
            // $scope.selectedItemPics.splice($scope.currentSmallImageIndex.value, 1);
            $scope.showPictureImage(data);
        });
        // }
    };

    //顯示目前己上傳的圖片
    $scope.showPictureImage = function (item) {
        $scope.pics = [];
        $scope.selectedItemPics = [];
        for (var i = 1; i <= 5; i++) {
            if (item["picture" + i] != '' && item["picture" + i] != null) {
                $scope.pics.push("picture" + i); //记逾目前有被保存的图片字段
                $scope.selectedItemPics.push($scope.getImageFullPath(item["picture" + i]));
            }
        }
        $scope.selectedItem = item;
    };

    $scope.getImageFullPath = function (path) {
        return Constant.BACKEND_BASE + '/app/assets/IMAGE/' + path;
    };

    $scope.openDlg = function (table, title) {
        var source = [];
        source.table = table;
        source.title = title;
        $mdDialog.show({
            controller: 'AssFormSelectController',
            templateUrl: 'app/src/app/ass/assform/assformSelectList.html',

            parent: angular.element(document.body),
            // scope: $scope,
            targetEvent: event,
            locals: {
                source: source
            }
        }).then(function (data) {
            if (table == 'LOGISTICS_SERVICE_PROVIDER') {
                $scope.selectedItem["logisticsServiceProviderName"] = data.name;
                $scope.selectedItem.logisticsServiceProvider = data.uuid;
            } else if (table == 'INSTALLATION_SERVICE_PROVIDER') {
                $scope.selectedItem["installationServiceProviderName"] = data.name;
                $scope.selectedItem["installationServiceProvider"] = data.uuid;
            } else if (table == 'PSO_SO_MST') {
                $scope.selectedItem["salesOrderMasterNo"] = data.no;
                $scope.selectedItem["salesOrderMasterUuid"] = data.uuid;
            }
        });
    };
});

angular.module('IOne-Production').controller('AssFormSelectController', function ($scope, $http, SalesOrderMaster, OCMSupplierService, $mdDialog, Constant, source) {
    $scope.datasource = source.table;
    $scope.title = source.title;
    $scope.pageOption = {
        sizePerPage: 10,
        currentPage: 0,
        totalPage: 100,
        totalElements: 100
    };

    $scope.refreshData = function (no) {
        if ($scope.datasource == 'PSO_SO_MST') {
            SalesOrderMaster.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, '2', '', "1", no, '', '', '', '', '', '', '', '', '', '', '').success(function (data) {

                if (data.content) {
                    $scope.dataList = data.content;
                    $scope.pageOption.totalPage = data.totalPages;
                    $scope.pageOption.totalElements = data.totalElements;
                } else {
                    $scope.dataList = data;
                }
            });
        } else if ($scope.datasource == 'LOGISTICS_SERVICE_PROVIDER') {
            OCMSupplierService.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, '', '', '', '', '2', '', '').success(function (data) {
                if (data.content) {
                    $scope.dataList = data.content;
                    $scope.pageOption.totalPage = data.totalPages;
                    $scope.pageOption.totalElements = data.totalElements;
                } else {
                    $scope.dataList = data;
                }
            });
        } else if ($scope.datasource == 'INSTALLATION_SERVICE_PROVIDER') {
            OCMSupplierService.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, '', '', '', '', '3').success(function (data) {
                if (data.content) {
                    $scope.dataList = data.content;
                    $scope.pageOption.totalPage = data.totalPages;
                    $scope.pageOption.totalElements = data.totalElements;
                } else {
                    $scope.dataList = data;
                }
            });
        }


    };

    $scope.refreshData();

    $scope.queryAction = function (no) {
        $scope.refreshData(no);
    };


    $scope.select = function (selectedObject) {
        $scope.selectedObject = selectedObject;
        $mdDialog.hide($scope.selectedObject);
    };

    $scope.hideDlg = function () {
        $mdDialog.hide();
    };

    $scope.cancelDlg = function () {
        $mdDialog.cancel();
    };
});
