angular.module('IOne-Production').config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/ass/workflowTemplate', {
        controller: 'WorkflowTemplateController',
        templateUrl: 'app/src/app/ass/workflowTemplate/workflowTemplate.html'
    })
}]);

angular.module('IOne-Production').controller('WorkflowTemplateController', function ($q, $scope, WorkflowTemplateMaster,
                                                                                     WorkflowTemplateDetail,
                                                                                     Constant,
                                                                                     RoleService,
                                                                                     $mdDialog,
                                                                                     GroupFunctionService,
                                                                                     ChannelService,
                                                                                     CBIEmployeeService) {
    $scope.disabledBatchConfirm = true;
    $scope.disabledBatchCancelConfirm = true;
    $scope.disabledBatchStatus = true;
    $scope.disabledBatchCancelStatus = true;
    $scope.selectedItemSize = 0;
    $scope.workingUIStatus = 0;  //0:master, 1:detail
    $scope.WORKFLOW_TYPES = Constant.WORKFLOW_TYPE;
    $scope.WORKFLOW_TRANSFER_TYPE = Constant.WORKFLOW_TRANSFER_TYPE;
    $scope.WORKFLOW_TRANSFER_SOURCE = Constant.WORKFLOW_TRANSFER_SOURCE;

    $scope.pageOption = {
        sizePerPage: 10,
        currentPage: 0,
        totalPage: 100,
        totalElements: 100
    };
    $scope.formMenuDisplayOption = {
        //新增:417B5F83-1DBF-433D-9FF7-2E599441395C
        '100-add': {display: true, name: '新增', uuid: '417B5F83-1DBF-433D-9FF7-2E599441395C'},
        //审核:745F718C-0D30-4592-BDB9-9CF87FEABC14
        '101-audit': {display: true, name: '审核', uuid: '745F718C-0D30-4592-BDB9-9CF87FEABC14'},
        //禁用:B8233C7A-DF65-4A0D-B266-7E2DFA7FFAAB
        '102-forbidden': {display: true, name: '禁用', uuid: 'B8233C7A-DF65-4A0D-B266-7E2DFA7FFAAB'},
        //批量审核:6958C223-5340-48CD-83FD-033E2533592E
        '103-batchAudit': {display: true, name: '批量审核', uuid: '6958C223-5340-48CD-83FD-033E2533592E'},
        //批量取审:C842DB84-E176-437F-8172-2E7D15722E62
        '104-batchSelectedAudit': {display: true, name: '批量取审', uuid: 'C842DB84-E176-437F-8172-2E7D15722E62'},
        //批量启用:8B48FC69-3321-4DC6-9969-A253F5450088
        '105-batchEnable': {display: true, name: '批量启用', uuid: '8B48FC69-3321-4DC6-9969-A253F5450088'},
        //批量禁用:EB22785C-3D52-4B84-A72C-5617E5FBDE37
        '106-batchForbidden': {display: true, name: '批量禁用', uuid: 'EB22785C-3D52-4B84-A72C-5617E5FBDE37'},
        //批量删除:362EA8AF-42BE-4C6C-822C-FB8BBF182737
        '107-batchDelete': {display: true, name: '批量删除', uuid: '362EA8AF-42BE-4C6C-822C-FB8BBF182737'},
        //修改:0E92D809-B5D4-4678-9106-B91BA592BB54
        '108-edit': {display: true, name: '修改', uuid: '0E92D809-B5D4-4678-9106-B91BA592BB54'},
        //点击新增（单身）：9CBCA9F0-F0E0-45A7-A3A2-BF820AAC1831
        '109-subAdd': {display: true, name: '点击新增', uuid: '9CBCA9F0-F0E0-45A7-A3A2-BF820AAC1831'},

        //表单-审核:A417128E-24C2-4B74-A82B-55DBBDC0E25B
        '200-audit': {display: true, name: '审核', uuid: 'A417128E-24C2-4B74-A82B-55DBBDC0E25B'},
        //表单-启用:B7EA476B-6568-457E-BE6F-D5B6D7DD8AA1
        '201-enable': {display: true, name: '启用', uuid: 'B7EA476B-6568-457E-BE6F-D5B6D7DD8AA1'},
        //表单-禁用:FE7881B9-2BCF-44A9-B133-D918E3E2F892
        '202-forbidden': {display: true, name: '禁用', uuid: 'FE7881B9-2BCF-44A9-B133-D918E3E2F892'},
        //表单-删除:C3BC0AC1-475E-4A59-89FB-16857A529B91
        '203-delete': {display: true, name: '删除', uuid: 'C3BC0AC1-475E-4A59-89FB-16857A529B91'},
        //表单-取消审核: 027A04EF-A9E7-425F-8B36-9B0E82AE4CAF
        '204-cancelAudit': {display: true, name: '取消审核', uuid: '027A04EF-A9E7-425F-8B36-9B0E82AE4CAF'}

    };

    $scope.listFilterOption = {
        status: Constant.STATUS[1].value,
        confirm: Constant.CONFIRM[1].value
    };

    $scope.sortByAction = function (field) {
        $scope.sortByField = field;
        $scope.sortType = '';
    };

    $scope.refreshList = function () {
        WorkflowTemplateMaster.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, $scope.listFilterOption).success(function (data) {
            $scope.itemList = data.content;
            $scope.pageOption.totalPage = data.totalPages;
            $scope.pageOption.totalElements = data.totalElements;
        });

        $scope.initGroupFunctionList();
        $scope.initChannelList();
        $scope.initEmployeeList();
        $scope.initRoleList();
    };

    $scope.$watch('listFilterOption', function () {
        $scope.pageOption.currentPage = 0;
        $scope.pageOption.totalPage = 0;
        $scope.pageOption.totalElements = 0;
        $scope.refreshList();
    }, true);

    $scope.initGroupFunctionList = function () {
        GroupFunctionService.getByStatus().success(function (dataList) {
            $scope.groupFunctionDataList = dataList;
        });
    };

    $scope.initChannelList = function () {
        ChannelService.getAll(100000000, 0, 0, 1, '', '').success(function (datalist) {
            $scope.channelDataList = datalist.content;
        });
    };

    $scope.initEmployeeList = function () {
        CBIEmployeeService.getAll(100000000, 0, 0, 0, 0, '').success(function (datalist) {
            $scope.employeeDataList = datalist.content;
        });
    };

    $scope.initRoleList = function () {
        RoleService.get('').success(function (data) {
            $scope.roleList = data.content;

        });
    };

    $scope.setDetailsName = function (detailList) {
        angular.forEach(detailList, function (detail) {
            angular.forEach($scope.roleList, function (role) {
                if (role.uuid == detail.transferRole) {
                    detail.transferRoleName = role.name;
                }
            });

            if (detail.transferSource == Constant.WORKFLOW_TRANSFER_SOURCE[1].value) {
                angular.forEach($scope.groupFunctionDataList, function (groupFunc) {
                    if (groupFunc.uuid == detail.transferData) {
                        detail.transferDataName = groupFunc.function.name;
                    }
                });
            } else if (detail.transferSource == Constant.WORKFLOW_TRANSFER_SOURCE[2].value) {
                angular.forEach($scope.channelDataList, function (channel) {
                    if (channel.uuid == detail.transferData) {
                        detail.transferDataName = channel.name;
                    }
                });
            } else if (detail.transferSource == Constant.WORKFLOW_TRANSFER_SOURCE[3].value) {
                angular.forEach($scope.employeeDataList, function (employee) {
                    if (employee.uuid == detail.transferData) {
                        detail.transferDataName = employee.name;
                    }
                });
            }
        });
    };

    $scope.selectAllFlag = false;

    /**
     * Show left detail panel when clicking the title
     */
    $scope.showDetailPanelAction = function (item) {
        $scope.selectedItem = item;
        $scope.refreshDetails(item);

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
            $scope.refreshDetails(item);
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

        if (domain == 'ASS_FLOW_TEMPLATE_MST') {
            $scope.workingUIStatus = 0;
            $scope.editingItem = source;
        } else {
            $scope.workingUIStatus = 1;
            $scope.editingDetail = source;
        }

        $scope.status = 'edit';
        $scope.desc = desc;
        $scope.source = source;
        $scope.domain = domain;
    };

    /**
     * Add new item which will take the ui to the edit page.
     */
    $scope.preAddItemAction = function (source, domain, desc) {
        $scope.changeViewStatus(Constant.UI_STATUS.EDIT_UI_STATUS);

        if (domain == 'ASS_FLOW_TEMPLATE_MST') {
            $scope.workingUIStatus = 0;
            $scope.editingItem = source;
        } else {
            $scope.workingUIStatus = 1;
            $scope.editingDetail = source;
        }


        $scope.status = 'add';
        $scope.desc = desc;
        $scope.domain = domain;
        //$scope.source = source;
    };

    $scope.updateWorkingUIStatus = function (domain) {
        if (domain == 'ASS_FLOW_TEMPLATE_MST') {
            $scope.workingUIStatus = 0;
        } else {
            $scope.workingUIStatus = 1;
        }
    };

    /**
     * Save object according current status and domain.
     */
    $scope.saveItemAction = function () {
        if ($scope.status == 'add') {
            if ($scope.domain == 'ASS_FLOW_TEMPLATE_MST') {
                WorkflowTemplateMaster.add($scope.editingItem).success(function (data) {
                    $scope.showInfo('新增工作流模板单头成功');
                    $scope.changeViewStatus(Constant.UI_STATUS.VIEW_UI_STATUS);
                    $scope.refreshList();
                }).error(function (response) {
                    $scope.showError('新增工作流模板单头失败: ' + response.message);
                });
                $scope.refreshList();
            } else if ($scope.domain == 'ASS_FLOW_TEMPLATE_DTL') {
                WorkflowTemplateDetail.add($scope.selectedItem.uuid, $scope.editingDetail).success(function (data) {
                    $scope.showInfo('新增工作流模板单身成功');
                    $scope.changeViewStatus(Constant.UI_STATUS.VIEW_UI_STATUS);
                    $scope.refreshDetails($scope.selectedItem);
                }).error(function (response) {
                    $scope.showError('新增工作流模板单身成功: ' + response.message);
                });
            }
        } else if ($scope.status == 'edit') {
            if ($scope.domain == 'ASS_FLOW_TEMPLATE_MST') {
                if ($scope.editingItem.status == Constant.STATUS[1].value && $scope.editingItem.confirm != Constant.CONFIRM[2].value) {
                    WorkflowTemplateMaster.modify($scope.editingItem.uuid, $scope.editingItem).success(function (data) {
                        $scope.showInfo('修改工作流模板单成功。');
                        $scope.changeViewStatus(Constant.UI_STATUS.VIEW_UI_STATUS);
                        //$scope.refreshList();
                    }).error(function (response) {
                        $scope.showError('修改工作流模板单失败。' + response.message);
                    });
                } else {
                    $scope.showError($scope.source.no + ' 不允许修改：有效且未审核的记录才可以修改！');
                }
            } else if ($scope.domain == 'ASS_FLOW_TEMPLATE_DTL') {
                WorkflowTemplateDetail.modify($scope.selectedItem.uuid, $scope.editingDetail.uuid, $scope.editingDetail).success(function (data) {
                    $scope.showInfo('修改工作流模板单身成功。');
                    $scope.changeViewStatus(Constant.UI_STATUS.VIEW_UI_STATUS);

                    $scope.setDetailsName(new Array($scope.editingDetail));
                }).error(function (response) {
                    $scope.showError('修改工作流模板单身失败。' + response.message);
                });
            }
        }
    };

    $scope.refreshDetails = function (item) {
        WorkflowTemplateDetail.get(item.uuid).success(function (data) {
            item.detailList = data.content;
            $scope.setDetailsName(item.detailList);
        });
    };

    $scope.selectItemAction = function (event, item) {
        $scope.stopEventPropagation(event);
        item.selectedRef = !item.selected;

        if (item.selected == false
            || item.selected == undefined
            || item.selected == null) {
            $scope.selectedItemSize += 1;
        } else {
            $scope.selectedItemSize -= 1;
            $scope.selectAllFlag = false;
        }
        $scope.disableBatchMenuButtons();
    };

    $scope.confirmClickAction = function (event, item) {
        $scope.stopEventPropagation(event);
        console.info('confirm...');

        $scope.stopEventPropagation(event);
        console.info('status...');

        var msg = "确认取消审核吗？";
        var input = '1';
        var resultMsg = "取消审核成功！";
        if (item.confirm != '2') {
            msg = "确认审核吗？";
            input = '2';
            resultMsg = "审核成功！";
        }

        $scope.showConfirm(msg, '', function () {
            WorkflowTemplateMaster.modify(item.uuid, {'confirm': input}).success(function () {
                item.confirm = input;
                $scope.showInfo(resultMsg);
            }).error(function (response) {
                $scope.showError(response.message);
            });
        });
    };

    $scope.statusClickAction = function (event, item) {
        $scope.stopEventPropagation(event);
        console.info('status...');

        var msg = "确认禁用吗？";
        var input = '2';
        var resultMsg = "禁用成功！";
        if (item.status != '1') {
            msg = "确认启用吗？";
            input = '1';
            resultMsg = "启用成功！";
        }

        $scope.showConfirm(msg, '', function () {
            WorkflowTemplateMaster.modify(item.uuid, {'status': input}).success(function () {
                item.status = input;
                $scope.showInfo(resultMsg);
            }).error(function (response) {
                $scope.showError(response.message);
            });
        });
    };

    $scope.releaseClickAction = function (event, item) {
        $scope.stopEventPropagation(event);
        console.info('release...');
        //TODO ...
    };

    $scope.deleteClickAction = function (event, item) {
        $scope.stopEventPropagation(event);

        $scope.showConfirm('确认删除吗', '', function () {
            if (item.status == Constant.STATUS[1].value && item.confirm != Constant.CONFIRM[2].value) {
                var response = WorkflowTemplateMaster.delete(item.uuid).success(function () {
                    $scope.selectedItem = null;
                    $scope.refreshList();
                }).error(function (response) {
                    $scope.showError('删除失败：' + response.message);
                });
            } else {
                $scope.showError('不允许删除：有效且未审核的记录才可以删除！');
            }
        });
    };

    /**
     * Delete detail item
     */
    $scope.deleteDetailAction = function (item, detail) {
        $scope.stopEventPropagation(event);

        $scope.showConfirm('确认删除吗', '', function () {
            var response = WorkflowTemplateDetail.delete(item.uuid, detail.uuid).success(function () {
                WorkflowTemplateDetail.get(item.uuid).success(function (data) {
                    item.detailList = data.content;
                    $scope.setDetailsName(item.detailList);
                    $scope.showInfo('删除成功！');
                }).error(function (response) {
                    $scope.showError('删除成功后刷新数据失败：' + response.message);
                });
            }).error(function (response) {
                $scope.showError('删除失败：' + response.message);
            });
        });
    };

    $scope.confirmAllClickAction = function (event) {
        $scope.stopEventPropagation(event);

        if ($scope.selectedItemSize == 0) {
            $scope.showWarn('请先选择记录！');
            return;
        }
        $scope.showConfirm('确认审核吗', '', function () {
            var promises = [];
            var bError = false;
            angular.forEach($scope.itemList, function (item) {
                if (item.selected) {
                    var response = WorkflowTemplateMaster.modify(item.uuid, {'confirm': '2'}).success(function () {
                        item.confirm = '2';
                    }).error(function (response) {
                        bError = true;
                        $scope.showError(item.no + ' 审核失败：' + response.message);
                    });
                    promises.push(response);
                }
            });
            $q.all(promises).then(function (data) {
                if (!bError) {
                    $scope.showInfo('审核成功！');
                }
                $scope.disableBatchMenuButtons();
            });
        });
    };

    $scope.cancelConfirmAllClickAction = function (event) {
        $scope.stopEventPropagation(event);

        if ($scope.selectedItemSize == 0) {
            $scope.showWarn('请先选择记录！');
            return;
        }
        $scope.showConfirm('确认取消审核吗', '', function () {
            var promises = [];
            var bError = false;
            angular.forEach($scope.itemList, function (item) {
                if (item.selected) {
                    var response = WorkflowTemplateMaster.modify(item.uuid, {'confirm': '1'}).success(function () {
                        item.confirm = '1';
                    }).error(function (response) {
                        bError = true;
                        $scope.showError(item.no + ' 取消审核失败：' + response.message);
                    });
                    promises.push(response);
                }
            });
            $q.all(promises).then(function (data) {
                if (!bError) {
                    $scope.showInfo('取消审核成功！');
                    $scope.disableBatchMenuButtons();
                }
            });
        });
    };

    $scope.statusAllClickAction = function (event) {
        $scope.stopEventPropagation(event);

        if ($scope.selectedItemSize == 0) {
            $scope.showWarn('请先选择记录！');
            return;
        }
        $scope.showConfirm('确认启用吗', '', function () {
            var promises = [];
            var bError = false;
            angular.forEach($scope.itemList, function (item) {
                if (item.selected) {
                    var response = WorkflowTemplateMaster.modify(item.uuid, {'status': '1'}).success(function () {
                        item.status = '1';
                    }).error(function (response) {
                        bError = true;
                        $scope.showError(item.no + ' 启用失败：' + response.message);
                    });
                    promises.push(response);
                }
            });
            $q.all(promises).then(function (data) {
                if (!bError) {
                    $scope.showInfo('启用成功！');
                    $scope.disableBatchMenuButtons();
                }
            });
        });
    };

    $scope.cancelStatusAllClickAction = function (event) {
        $scope.stopEventPropagation(event);

        if ($scope.selectedItemSize == 0) {
            $scope.showWarn('请先选择记录！');
            return;
        }
        $scope.showConfirm('确认禁用吗', '', function () {
            var promises = [];
            var bError = false;
            angular.forEach($scope.itemList, function (item) {
                if (item.selected) {
                    var response = WorkflowTemplateMaster.modify(item.uuid, {'status': '2'}).success(function () {
                        item.status = '2';
                    }).error(function (response) {
                        bError = true;
                        $scope.showError(item.no + ' 禁用失败：' + response.message);
                    });
                    promises.push(response);
                }
            });
            $q.all(promises).then(function (data) {
                if (!bError) {
                    $scope.showInfo('禁用成功！');
                    $scope.disableBatchMenuButtons();
                }
            });
        });
    };

    $scope.releaseAllClickAction = function (event) {
        $scope.stopEventPropagation(event);
        console.info('release all...');
        //TODO ...
    };

    $scope.deleteAllClickAction = function (event) {
        $scope.stopEventPropagation(event);

        if ($scope.selectedItemSize == 0) {
            $scope.showWarn('请先选择记录！');
            return;
        }

        $scope.showConfirm('确认删除吗', '', function () {
            var promises = [];
            var bError = false;
            angular.forEach($scope.itemList, function (item) {
                if (item.selected) {
                    if (item.status == Constant.STATUS[1].value && item.confirm != Constant.CONFIRM[2].value) {
                        var response = WorkflowTemplateMaster.delete(item.uuid).success(function () {
                            $scope.refreshList();
                        }).error(function (response) {
                            bError = true;
                            $scope.showError(item.workflowName + '删除失败：' + response.message);
                        });
                        promises.push(response);
                    } else {
                        bError = true;
                        $scope.showError(item.workflowName + ' 不允许删除：有效且未审核的记录才可以删除！');
                    }
                }
            });
            $q.all(promises).then(function (data) {
                if (!bError) {
                    $scope.showInfo('删除成功！');
                    $scope.disableBatchMenuButtons();
                }
            });
        });
    };

    $scope.selectAllAction = function () {
        angular.forEach($scope.itemList, function (item) {
            if ($scope.selectAllFlag) {
                item.selected = true;
            } else {
                item.selected = false;
            }
            item.selectedRef = item.selected;
        });

        $scope.selectedItemSize = 0;
        if ($scope.selectAllFlag) {
            angular.forEach($scope.itemList, function (item) {
                $scope.selectedItemSize++;
            })
        }
        $scope.disableBatchMenuButtons();
    };

    $scope.disableBatchMenuButtons = function () {
        var selectedCount = 0;
        var confirm = '';
        var status = '';
        var diffConfirm = false;
        var diffStatus = false;
        angular.forEach($scope.itemList, function (item, index) {
            if (item.selectedRef) {
                selectedCount++;
                if (confirm == '') {
                    confirm = item.confirm;
                } else {
                    if (confirm != item.confirm) {
                        diffConfirm = true;
                    }
                }
                if (status == '') {
                    status = item.status;
                } else {
                    if (status != item.status) {
                        diffStatus = true;
                    }
                }
            }
        });

        if (selectedCount == 0) {
            $scope.disabledBatchConfirm = true;
            $scope.disabledBatchCancelConfirm = true;
            $scope.disabledBatchStatus = true;
            $scope.disabledBatchCancelStatus = true;
        } else {
            if (diffConfirm == true) {
                $scope.disabledBatchConfirm = true;
                $scope.disabledBatchCancelConfirm = true;
            } else if (confirm == '2') {
                $scope.disabledBatchConfirm = true;
                $scope.disabledBatchCancelConfirm = false;
            } else {
                $scope.disabledBatchConfirm = false;
                $scope.disabledBatchCancelConfirm = true;
            }

            if (diffStatus == true) {
                $scope.disabledBatchStatus = true;
                $scope.disabledBatchCancelStatus = true;
            } else if (status == '1') {
                $scope.disabledBatchStatus = true;
                $scope.disabledBatchCancelStatus = false;
            } else {
                $scope.disabledBatchStatus = false;
                $scope.disabledBatchCancelStatus = true;
            }
        }
    };

    $scope.openTransferDataDlg = function (detail) {
        $mdDialog.show({
            controller: 'SelectTransferDataController',
            templateUrl: 'app/src/app/ass/workflowTemplate/selectTransferDataDlg.html',
            parent: angular.element(document.body),
            targetEvent: event,
            locals: {
                editingDetail: detail
            }
        }).then(function (editedDetail) {
            detail = editedDetail;
        });
    };
});

angular.module('IOne-Production').controller('SelectTransferDataController', function ($scope,
                                                                                       $mdDialog,
                                                                                       Constant,
                                                                                       editingDetail,
                                                                                       GroupFunctionService,
                                                                                       ChannelService,
                                                                                       CBIEmployeeService) {
    $scope.WORKFLOW_CHANNEL_FLAG = Constant.CHANNEL_FLAG;
    $scope.WORKFLOW_TRANSFER_TYPE = Constant.WORKFLOW_TRANSFER_TYPE;
    $scope.WORKFLOW_TRANSFER_SOURCE = Constant.WORKFLOW_TRANSFER_SOURCE;
    $scope.workingDetail = editingDetail;
    $scope.channelPageOption = {
        sizePerPage: 10,
        currentPage: 0,
        totalPage: 100,
        totalElements: 100
    };
    $scope.employeePageOption = {
        sizePerPage: 10,
        currentPage: 0,
        totalPage: 100,
        totalElements: 100
    };

    $scope.refreshGroupList = function () {
        GroupFunctionService.getByStatus().success(function (dataList) {
            $scope.groupFunctionDataList = dataList;
        });
    };

    $scope.refreshChannelList = function () {
        ChannelService.getAll($scope.channelPageOption.sizePerPage, $scope.channelPageOption.currentPage, 0, 1, '', '').success(function (datalist) {
            $scope.channelDataList = datalist.content;
        });
    };

    $scope.refreshEmployeeList = function () {
        CBIEmployeeService.getAll($scope.employeePageOption.sizePerPage, $scope.employeePageOption.currentPage, 0, 0, 0, '').success(function (datalist) {
            $scope.employeeDataList = datalist.content;
        });
    };

    if ($scope.workingDetail.transferSource == Constant.WORKFLOW_TRANSFER_SOURCE[1].value) {
        $scope.refreshGroupList();
    } else if ($scope.workingDetail.transferSource == Constant.WORKFLOW_TRANSFER_SOURCE[2].value) {
        $scope.refreshChannelList();
    } else if ($scope.workingDetail.transferSource == Constant.WORKFLOW_TRANSFER_SOURCE[3].value) {
        $scope.refreshEmployeeList();
    }

    $scope.selectItem = function (item) {
        if ($scope.workingDetail.transferSource == Constant.WORKFLOW_TRANSFER_SOURCE[1].value) {
            $scope.workingDetail.transferDataName = item.function.name;
            $scope.workingDetail.transferData = item.uuid;
        } else if ($scope.workingDetail.transferSource == Constant.WORKFLOW_TRANSFER_SOURCE[2].value) {
            $scope.workingDetail.transferDataName = item.name;
            $scope.workingDetail.transferData = item.uuid;
        } else if ($scope.workingDetail.transferSource == Constant.WORKFLOW_TRANSFER_SOURCE[3].value) {
            $scope.workingDetail.transferDataName = item.name;
            $scope.workingDetail.transferData = item.uuid;
        }
        $scope.hideDlg($scope.workingDetail);
    };

    $scope.hideDlg = function (workingDetail) {
        $mdDialog.hide(workingDetail);
    };
    $scope.cancelDlg = function () {
        $mdDialog.cancel();
    };
});
