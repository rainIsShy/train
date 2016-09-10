angular.module('IOne-Production').config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/ass/workflow', {
        controller: 'WorkflowController',
        templateUrl: 'app/src/app/ass/workflow/workflow.html'
    })
}]);

angular.module('IOne-Production').controller('WorkflowController', function ($scope, $http, WorkflowService, WorkflowDetailService, ChannelService, RoleService, CBIEmployeeService, GroupFunctionService, FunctionService, Constant, $mdDialog, $q) {
    $scope.WORKFLOW_TYPE = Constant.WORKFLOW_TYPE;
    $scope.WORKFLOW_TRANSFER_TYPE = Constant.WORKFLOW_TRANSFER_TYPE;
    $scope.WORKFLOW_TRANSFER_SOURCE = Constant.WORKFLOW_TRANSFER_SOURCE;
    $scope.selected = [];
    $scope.selectedDetail = [];
    $scope.selectedItemsCount = 0;//已选中单据数
    $scope.addTransferSource = "1";


    $scope.formMenuDisplayOption = {
        //清单-新增
        '100-add': {display: true, name: '新增', uuid: '2FFC2D74-4D10-4EEC-9892-4E36AF5FDA46'},
        //表单-删除
        '101-delete': {display: true, name: '删除', uuid: '874FC59B-3D7D-4AC9-88AD-342DA232C8E1'},
        //表单-变更
        '102-edit': {display: true, name: '变更', uuid: '4D19704A-4F5B-40A0-AD52-131D1472C0CD'},
        //清单-审核
        '103-audit': {display: true, name: '审核', uuid: '51822FB5-5EF5-4106-8ACE-21012331E825'},
        //清单-取消审核
        '104-revertAudit': {display: true, name: '取消审核', uuid: '7BEE7F47-2937-4121-B107-2FBA6D894402'},
        //清单-全选
        '105-selectAll': {display: true, name: '全选', uuid: '5267329f-62ac-46db-b65c-c9b6ae84a4af'},
        //清单-查询
        '106-query': {display: true, name: '查询', uuid: '5f32bc9a-52e6-488e-ba13-b9ea2aedda0b'},
        //表单-取消新增
        '200-cancel': {display: true, name: '取消新增', uuid: 'DE4C5380-C0C2-4FA4-9A68-5B1037A3C850'},
        //表单-保存
        '201-save': {display: true, name: '保存', uuid: '06743864-0C5A-40A7-9006-4EE90882D281'},
        //表单-修改-保存
        '302-save': {display: true, name: '保存', uuid: 'b9cb7031-1f8e-4c82-8434-a8122591e685'},
        //表单-修改-取消修改
        '303-cancel': {display: true, name: '取消修改', uuid: '141cc15b-ff38-41f9-b1ca-be6a7f776a46'},
        //表单-修改-退出编辑
        '304-quit': {display: true, name: '退出编辑', uuid: '32c85c89-663d-4d82-ba40-91cd049c3ff0'},
        //表单-新增
        '202-add': {display: true, name: '新增', uuid: '28B4012D-CFC3-4C3F-A62B-83AFF04E273C'},
        //表单审核
        '203-audit': {display: true, name: '审核', uuid: '6F8B6FA5-1193-40D0-95F0-E7113D205BA7'},
        //表单取消审核
        '204-revertAudit': {display: true, name: '取消审核', uuid: '06178343-E280-46A6-AC54-C6EE2B3E1A9E'}
    };


    $scope.formMenuAction = function (menuId, $event) {
        //Main menu
        if(menuId == 100) {
            $scope.preAddMenuAction();
        } else if(menuId == 101) {
            $scope.deleteMenuAction();
        } else if (menuId == 102) {
            $scope.changeViewStatus($scope.UI_STATUS.EDIT_UI_STATUS_MODIFY, 1);
        } else if (menuId == 103) {  //審核
            $scope.auditMenuAction();
        } else if (menuId == 104) {  //取消審核
            $scope.revertAuditMenuAction();
        } else if (menuId == 105) {
            $scope.selectAllMenuAction;
        }

        //Add menu
        if (menuId == 200) {
            $scope.cancelAddMenuAction();
        } else if (menuId == 201) {
            $scope.addMenuAction();
        } else if (menuId == 202) {
            $scope.preAddMenuAction();
        } else if (menuId == 203) {
            $scope.auditMenuAction();
        } else if (menuId == 204) {
            $scope.revertAuditMenuAction();
        }

        //Modify menu
        if(menuId == 302) {
            $scope.modifyMenuAction();
        } else if(menuId == 303) {
            $scope.cancelModifyMenuAction();
        } else if(menuId == 304) {
            $scope.exitModifyMenuAction();
        }

    };

    $scope.pageOption = {
        sizePerPage: 10,
        currentPage: 0,
        totalPage: 100,
        totalElements: 100
    };

    $scope.listFilterOption = {
        confirm: Constant.CONFIRM[0].value,
        status: Constant.STATUS[0].value
    };

    $scope.sortByAction = function (field) {
        $scope.sortByField = field;
        $scope.sortType = '';
    };

    $scope.refreshList = function () {
        confirm = $scope.listFilterOption.confirm;

        WorkflowService.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, $scope.listFilterOption.confirm, $scope.listFilterOption.workflowName, '').success(function (data) {
            $scope.workflowMstList = data;
            $scope.pageOption.totalPage = data.totalPages;
            $scope.pageOption.totalElements = data.totalElements;
            angular.forEach($scope.workflowMstList.content, function (item) {
                $scope.refreshDetailList(item.uuid, item);

            });
        });
    };

    $scope.$watch('listFilterOption', function () {
        $scope.pageOption.currentPage = 0;
        $scope.pageOption.totalPage = 0;
        $scope.pageOption.totalElements = 0;

        $scope.refreshList();
    }, true);



    //新增 100-add 初始化所有栏位
    $scope.preAddMenuAction = function () {
        //选中的清空
        $scope.selectedItem  = {
            workflowName : '',
            channel : '',
            channelUuid : '',
            workflowTemplate :'',
            workflowTemplateUuid : '',
            channelUuid : '',
            workFlowType: '',
            detail: []
        };

        //新定义 清空选中的子项 先放着
        $scope.selectedItemDetail = null;
        // $scope.OrderDetailList = null;
        //显示 保存和取消新增 的菜单
        $scope.changeViewStatus($scope.UI_STATUS.EDIT_UI_STATUS_ADD, 1);
    };

    //101-delete 刪除
    $scope.deleteMenuAction = function (orderDetail) {
        $scope.showConfirm('确认删除吗？', '删除的产品不可恢复。', function () {
            if ($scope.selectedItem) {
                WorkflowService.delete($scope.selectedItem.uuid).success(function () {
                    $scope.refreshList();
                    $scope.changeViewStatus(Constant.UI_STATUS.PRE_EDIT_UI_STATUS, 0);
                }).error(function (response) {
                    $scope.showError($scope.getError(response));
                });
            }
        });
    };

    //审核
    $scope.auditMenuAction = function () {
        if ((!$scope.selected || $scope.selected.length == 0) && $scope.selectedTabIndex == 0) {
            $scope.showError('请选择待审核销售单。');
            return;
        }

        if ($scope.ui_status == Constant.UI_STATUS.PRE_EDIT_UI_STATUS && $scope.selectedTabIndex == 1) {
            if ($scope.selectedItem.confirm == '2') {
                $scope.showError('该单已经审核完成。');
                return;
            }

        }
        $scope.showConfirm('确认审核吗？', '', function () {
            if ($scope.ui_status == Constant.UI_STATUS.PRE_EDIT_UI_STATUS && $scope.selectedTabIndex == 1) {
                $scope.selectedItem.confirm = '2';
                console.log("123");
                console.log($scope.selectedItem);
                $scope.getMasterDataToBindFieldByUuid($scope.selectedItem.uuid);
                WorkflowService.modify($scope.selectedItem.uuid, $scope.selectedItem).success(function (data) {

                    // $scope.resetButtonDisabled();
                    // $scope.changeButtonStatus($scope.selectedItem);
                    $scope.getMasterDataToBindFieldByUuid($scope.selectedItem.uuid);
                    $scope.showInfo('审核成功。');
                }).error(function (data) {
                    $scope.showError(data.message);
                });
            } else if ($scope.ui_status == Constant.UI_STATUS.VIEW_UI_STATUS && $scope.selectedTabIndex == 0) {

                var promises = [];
                angular.forEach($scope.selected, function (item) {
                    item.confirm = "2";
                    var response = WorkflowService.modify(item.uuid, item).success(function () {
                    });
                    promises.push(response);
                });
                $q.all(promises).then(function (data) {
                    $scope.refreshList();
                    $scope.showInfo('审核成功。');
                    $scope.selectAllFlag = false;
                }, function (data) {
                    $scope.showError(data.data.message);
                });
            }

        });
    };
    //未审核
    $scope.revertAuditMenuAction = function () {
        if ((!$scope.selected || $scope.selected.length == 0) && $scope.selectedTabIndex == 0) {
            $scope.showError('请选择待取消审核销售单。');
            return;
        }
        if ($scope.ui_status == Constant.UI_STATUS.VIEW_UI_STATUS && $scope.selectedTabIndex == 0) {
            var threwNos = '';
            angular.forEach($scope.selected, function (item) {
                if (item.transferPsoFlag == '1') {
                    threwNos = threwNos + item.no + ","
                }
            });
            if (threwNos != '') {
                threwNos = threwNos.substr(0, threwNos.length - 1);
                $scope.showError('存在已抛转的销售单，不允许取消审核：' + threwNos);
                return;
            }
        }

        if ($scope.ui_status == Constant.UI_STATUS.PRE_EDIT_UI_STATUS && $scope.selectedTabIndex == 1) {
            if ($scope.selectedItem.confirm == '1') {
                $scope.showError('该单已是未审核。');
                return;
            }

        }

        $scope.showConfirm('确认取消审核吗？', '', function () {
            if ($scope.ui_status == Constant.UI_STATUS.PRE_EDIT_UI_STATUS && $scope.selectedTabIndex == 1) {
                $scope.selectedItem.confirm = "1";
                WorkflowService.modify($scope.selectedItem.uuid, $scope.selectedItem).success(function () {
                    $scope.selectedItem.confirm = '1';
                    // $scope.resetButtonDisabled();
                    // $scope.changeButtonStatus($scope.selectedItem);
                    $scope.showInfo('取消审核成功。');
                }).error(function (data) {
                    $scope.showError(data.message);
                });
            } else if ($scope.ui_status == Constant.UI_STATUS.VIEW_UI_STATUS && $scope.selectedTabIndex == 0) {
                //update $scope.selected
                var promises = [];
                angular.forEach($scope.selected, function (item) {
                    item.confirm = "1";
                    var response = WorkflowService.modify(item.uuid, item).success(function () {
                    });
                    promises.push(response);
                });
                $q.all(promises).then(function (data) {
                    $scope.refreshList();
                    $scope.showInfo('取消审核成功。');
                    $scope.selectAllFlag = false;
                }, function (data) {
                    $scope.showError(data.data.message);
                });
            }
        });
    };

    //取消新增 200-cancel 回到清单
    $scope.cancelAddMenuAction = function () {
        $scope.listTabSelected();
    };

    //201-save 保存
    $scope.addMenuAction = function () {
        console.log($scope.selectedItem);
        if($scope.ui_status == $scope.UI_STATUS.EDIT_UI_STATUS_ADD) {
            WorkflowService.add($scope.selectedItem).success(function(data) {
                $scope.refreshList();
                $scope.bindSelectItemData(data);
                $scope.changeViewStatus($scope.UI_STATUS.PRE_EDIT_UI_STATUS, 1);
                $scope.showInfo('新增成功');
            }).error(function (data) {
                $scope.showError($scope.getAllError(data));
                $scope.showError(data.message);
            });
        }
    };


    //保存修改 302-save
    $scope.modifyMenuAction = function () {
        console.log($scope.selectedItem.uuid);
        WorkflowService.modify($scope.selectedItem.uuid, $scope.selectedItem).success(function (data) {
            $scope.getMasterDataToBindFieldByUuid($scope.selectedItem.uuid);

            $scope.changeViewStatus(Constant.UI_STATUS.PRE_EDIT_UI_STATUS, 1);
            $scope.showInfo('修改成功。');
        }).error(function (data) {
            $scope.showError(data.message);
            $scope.cancelModifyMenuAction();
        });

    };

    //取消修改 303-cancel  重抓单头
    $scope.cancelModifyMenuAction = function () {
        WorkflowService.get($scope.selectedItem.uuid).success(function(data) {
            $scope.bindSelectItemData(data);
            $scope.changeViewStatus(Constant.UI_STATUS.PRE_EDIT_UI_STATUS, 1);
        });
    };

    //退出编辑 304-quit
    $scope.exitModifyMenuAction = function () {
        $scope.cancelModifyMenuAction();
        $scope.changeViewStatus($scope.UI_STATUS.PRE_EDIT_UI_STATUS, 1);
    };

    $scope.workflowDeleteMenuAction = function(subItemUuid) {

        $scope.showConfirm('确认删除吗？', '', function () {
            if ($scope.selectedItem) {
                WorkflowDetailService.delete($scope.selectedItem.uuid,subItemUuid.uuid).success(function () {
                    $scope.refreshDetailList($scope.selectedItem.uuid, $scope.selectedItem);
                    $scope.showInfo('删除成功。');
                }).error(function (response) {
                    $scope.showError($scope.getError(response));
                });
            }
        });
    };

    $scope.listTabSelected = function () {
        $scope.refreshList();
        $scope.selectedItem = null;
        $scope.changeViewStatus(Constant.UI_STATUS.VIEW_UI_STATUS, 0);
    };


    $scope.getMasterDataToBindFieldByUuid = function(uuid) {
        WorkflowService.get(uuid).success(function(data) {
            $scope.bindSelectItemData(data);
        });
    };

    //查看详情，跳转到表单 选中的是selectedItem
    $scope.editItem = function (item) {
        $scope.bindSelectItemData(item);
        $scope.changeViewStatus(Constant.UI_STATUS.PRE_EDIT_UI_STATUS, 1);
    };


    $scope.bindSelectItemData = function(item) {
        $scope.selectedDetail = [];
        $scope.menuList.selectAll = false;
        $scope.selectedItem = item;
        $scope.selectedItem.channel = item.channel["name"];
        $scope.selectedItem.channelUuid = item.channel["uuid"];
        $scope.selectedItem.workflowTemplate = item.workflowTemplate.workflowName;
        $scope.selectedItem.workflowTemplateUuid = item.workflowTemplate.uuid;
        $scope.refreshDetailList($scope.selectedItem.uuid, $scope.selectedItem);
    };

    $scope.refreshDetailList = function (masterUuid, master) {
        WorkflowDetailService.get(masterUuid).success(function (data) {
            angular.forEach(data.content, function (item) {
                //取得流轉角色
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
            });


            master.detail = [];
            master.detail = data.content;
        });
    };

    $scope.selectAllMenuAction = function () {
        if ($scope.ui_status == Constant.UI_STATUS.VIEW_UI_STATUS && $scope.selectedTabIndex == 0) { //清单全选
            if ($scope.menuList.selectAll == true) {
                angular.forEach($scope.workflowMstList.content, function (item) {
                    var idx = $scope.selected.indexOf(item);
                    if (idx < 0) {
                        $scope.selected.push(item);
                    }
                });

                $scope.selectedItemsCount = $scope.selected.length;
            } else if ($scope.menuList.selectAll == false) {
                $scope.selected = [];
                $scope.selectedItemsCount = 0;
            }
        }
    };

    //是否选中（是否存在数组中，返回1或0）
    $scope.exists = function (item, list) {
        return list.indexOf(item) > -1;
    };

    //切换选中否，往数组中增加或删除
    $scope.toggle = function (item, selected) {
        var idx = selected.indexOf(item);
        if (idx > -1) {
            selected.splice(idx, 1);
        }
        else {
            selected.push(item);
        }

        $scope.selectedItemsCount = selected.length;//单据数
    };

    //呼叫渠道開窗
    $scope.openDlg = function(table, desc, key) {
        var source = [];
        source.key = key;
        source.desc = desc;
        if (table == "OCM_BASE_CHAN") {
            source.srcUrl = "channels";
        } else if (table == "ASS_FLOW_TEMPLATE_MST") {
            source.srcUrl = "workflowTemplates";
        }

        $mdDialog.show({
            controller: 'ChannelSelectController',
            templateUrl: 'app/src/app/ass/workflow/workflowSelectList.html',
            parent: angular.element(document.body),
            // scope: $scope,
            targetEvent: event,
            locals: {
                source:  source
            }
        }).then(function(data) {
            // $scope.selectedItem.channel= data.nRow
            $scope.selectedItem[key] =  data.name;
            $scope.selectedItem[key + 'Uuid'] =  data.uuid;
            console.log("key :" + key + " $scope.selectedItem[key]" +$scope.selectedItem[key]+ " $scope.selectedItem[key + 'Uuid'] :" + $scope.selectedItem[key + 'Uuid']);

        });
    };

    //呼叫子單身新增或編輯開窗
    $scope.openAddDetailDlg = function (selectDetailItem, addTransferSource) {
        console.log("Transfer source;" + addTransferSource);
        var source = {
            flwoNo: '',
            flowName: '',
            transferType: '',
            transferSource: addTransferSource,
            transferData: '',
            transferDataName: '',
            transferRole: '',
            transferCondition: ''
        };

        $scope.DETAIL_UI_STATUS = selectDetailItem == null ? "add" : "edit";

        if (selectDetailItem != null) {
            source = selectDetailItem;
            console.log(selectDetailItem);
        }

        $mdDialog.show({
            controller: 'AddWorkflowDetailController',
            templateUrl: 'app/src/app/ass/workflow/workflowDetailAddDlg.html',
            parent: angular.element(document.body),
            targetEvent: event,
            locals: {
                source: source,
                status: $scope.DETAIL_UI_STATUS
            }
        }).then(function (data) {
            console.log("Master Id :" + $scope.selectedItem.uuid);
            console.log($scope.DETAIL_UI_STATUS);
            if ($scope.DETAIL_UI_STATUS == 'add') {
                console.log("Master Id :" + $scope.selectedItem.uuid);

                WorkflowDetailService.add($scope.selectedItem.uuid, data).success(function () {
                    $scope.refreshDetailList($scope.selectedItem.uuid, $scope.selectedItem);
                    $scope.showInfo('新增成功');
                }).error(function (data) {
                    $scope.showError(data.message);
                });
            } else if ($scope.DETAIL_UI_STATUS == 'edit') {
                WorkflowDetailService.modify($scope.selectedItem.uuid, data.uuid, data).success(function () {
                    $scope.refreshDetailList($scope.selectedItem.uuid, $scope.selectedItem);
                    $scope.showInfo('修改成功');
                }).error(function (data) {
                    $scope.showError(data.message);
                });
            }


        });
    };
});


//渠道及工作流模版的開窗畫面
angular.module('IOne-Production').controller('ChannelSelectController', function($scope, $http, $mdDialog, Constant, source) {
    $scope.srcUrl = source.srcUrl;
    $scope.desc = source.desc;

    $scope.pageOption = {
        sizePerPage: 10,
        currentPage: 0,
        totalPage: 100,
        totalElements: 100
    };

    $scope.refreshData = function () {
        var url = Constant.BACKEND_BASE + $scope.srcUrl + '?page=' + $scope.pageOption.currentPage + '&size=' + $scope.pageOption.sizePerPage;
        $http.get(url).success(function(data) {
            if(data) {
                if(data.content) {
                    $scope.dataList = data.content;
                    $scope.pageOption.totalPage = data.totalPages;
                    $scope.pageOption.totalElements = data.totalElements;
                    //若来源为workflowTemplate，workflowName，才可共用开窗画
                    if ($scope.srcUrl == "workflowTemplates") {
                        for (var i = 0; i < $scope.dataList.length; i++) {

                            for (j = 0; j<data.content.length; j++) {
                                if ($scope.dataList[i].uuid == data.content[j].uuid) {
                                    $scope.dataList[i].name = data.content[j].workflowName;
                                }
                            }
                        }

                    }
                } else {
                    $scope.dataList = data;
                }
            }
        })
    };

    $scope.refreshData();

    $scope.queryAction = function () {
        $scope.refreshData();
    };


    $scope.select = function (selectedObject) {
        $scope.selectedObject = selectedObject;
        $mdDialog.hide($scope.selectedObject);
    };

    $scope.hideDlg = function () {
        $mdDialog.hide();
    };

    $scope.cancelDlg = function() {
        $mdDialog.cancel();
    };
});

// 新增工作流子流程
angular.module('IOne-Production').controller('AddWorkflowDetailController', function ($scope, $mdDialog, source, status, Constant, RoleService, CBIEmployeeService, ChannelService, GroupFunctionService) {
    $scope.UI_STATUS = status;
    $scope.WORKFLOW_CHANNEL_FLAG = Constant.CHANNEL_FLAG;
    $scope.WORKFLOW_TRANSFER_TYPE = Constant.WORKFLOW_TRANSFER_TYPE;
    $scope.WORKFLOW_TRANSFER_SOURCE = Constant.WORKFLOW_TRANSFER_SOURCE;
    $scope.addWorflowDetail = source;

    $scope.chanPageOption = {
        sizePerPage: 10,
        currentPage: 0,
        totalPage: 100,
        totalElements: 100
    };

    $scope.empPageOption = {
        sizePerPage: 10,
        currentPage: 0,
        totalPage: 100,
        totalElements: 100
    };

    RoleService.get('').success(function (data) {
        $scope.roleList = data.content;

    });

    $scope.isShowTranSrcPanel = false;

    $scope.openTranSrcDlg = function () {
        $scope.isShowTranSrcPanel = true;

        if ($scope.addWorflowDetail.transferSource == "1") {
            GroupFunctionService.getByStatus().success(function (dataList) {
                $scope.groupFunctionDataList = dataList;
            });
        } else if ($scope.addWorflowDetail.transferSource == "2") {
            $scope.refreshChanList();
        } else if ($scope.addWorflowDetail.transferSource == "3") {
            $scope.refreshEmpList();
        }
    };

    //渠道開窗
    $scope.refreshChanList = function () {
        ChannelService.getAll($scope.chanPageOption.sizePerPage, $scope.chanPageOption.currentPage, 0, 1, '', '').success(function (datalist) {
            $scope.chanDataList = datalist.content;
        });
    };


    $scope.refreshEmpList = function () {
        CBIEmployeeService.getAll($scope.empPageOption.sizePerPage, $scope.empPageOption.currentPage, 0, 0, 0, '').success(function (datalist) {
            $scope.empDataList = datalist.content;
        });
    };

    $scope.selectSourceItem = function (item) {
        if ($scope.addWorflowDetail.transferSource == '1') {
            $scope.addWorflowDetail.transferDataName = item.function.name;
            $scope.addWorflowDetail.transferData = item.function.uuid;
            
        } else if ($scope.addWorflowDetail.transferSource == '2') {
            $scope.addWorflowDetail.transferDataName = item.name;
            $scope.addWorflowDetail.transferData = item.uuid;
        } else if ($scope.addWorflowDetail.transferSource == '3') {
            $scope.addWorflowDetail.transferDataName = item.name;
            $scope.addWorflowDetail.transferData = item.uuid;
        }
        $scope.hideTranSrcPanel();

    };

    $scope.hideTranSrcPanel = function () {
        $scope.isShowTranSrcPanel = false;
    };


    $scope.hideDlg = function () {
        $mdDialog.hide($scope.addWorflowDetail);
    };
    $scope.cancelDlg = function () {
        $mdDialog.cancel();
    };
});


