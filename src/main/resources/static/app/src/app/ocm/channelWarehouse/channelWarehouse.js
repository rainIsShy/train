angular.module('IOne-Production').config(['$routeProvider', function ($routeProvider){
    $routeProvider.when('/channelWarehouse',{
        controller: 'ChannelWarehouseRelationController',
        templateUrl: 'app/src/app/ocm/channelWarehouse/channelWarehouse.html'
    })
}]);

angular.module('IOne-Production').controller('ChannelWarehouseRelationController', function ($scope, $q, ChannelService, ChannelWarehouseRelationService,$mdDialog, $timeout, Constant){
    //initial model value

    $scope.listFilterItem = {
        itemUuids: []
    };

    $scope.ocmListMenu = {
        selectAll : false,
        status: Constant.STATUS[0].value,
        confirm: Constant.CONFIRM[0].value,
        showQueryBar : true
    };

     $scope.formMenuDisplayOption = {
        '100-add': {display: true, name: '新增', uuid: '452A0E53-2BAD-44F3-BD75-DE919C1C9DAC'},
        '101-delete': {display: true, name: '删除', uuid: 'BF6AC3DC-D9C5-400C-8C66-D9FCF74E49A1'},
        '102-edit': {display: true, name: '编辑', uuid: '169AA869-6A62-4287-9136-40886E7246ED'},

        '200-cancel': {display: true, name: '取消新增', uuid: '8536C6CE-75F0-46F4-9CFA-A3DE2AB371CE'},
        '201-save': {display: true, name: '保存', uuid: 'C03E7689-267F-4A6B-AA7D-88A99C9CEFF0'},


        '302-save': {display: true, name: '保存', uuid: '01673539-3C67-4E76-B616-3767B07E6922'},
        '303-cancel': {display: true, name: '取消修改', uuid: 'FD70B726-FF76-45B4-B667-BB778B3C2AA9'},
        '304-quit': {display: true, name: '退出编辑', uuid: '63367BAD-6D79-4994-B420-EBFAA30D8357'},

        '611-selectAll': {display: true, name: '全选', uuid: ''},
        '612-audit': {display: true, name: '默认仓库', uuid: '07CE2BF9-3D4A-4290-A53D-A6ACD9B53D89'},
        '613-revertAudit': {display: true, name: '取消默认', uuid: '539F19A0-66FD-4812-BA22-2D9FE91EA7EE'},
        '614-valid': {display: true, name: '有效', uuid: '9ECF3001-3E5F-41FC-8B54-74FD1CDB7161'},
        '615-invalid': {display: true, name: '无效', uuid: '3F09E969-7653-4F30-9D4C-C3FB8CA31B66'}
    };


   $scope.ocmListMenuDisplayOption = {
         '600-query': {display: true, name: '查询', uuid: 'ABF33FF5-D32C-4E8C-8AF1-6436E00AC244'},
         '601-selectAll': {display: true, name: '全选', uuid: 'AAA16052-5A07-4582-A6FB-D45AE5A7A4A0'},
         '602-audit': {display: true, name: '审核', uuid: '07CE2BF9-3D4A-4290-A53D-A6ACD9B53D89'},
         '603-revertAudit': {display: true, name: '取消审核', uuid: '539F19A0-66FD-4812-BA22-2D9FE91EA7EE'},
         '604-valid': {display: true, name: '有效', uuid: '9ECF3001-3E5F-41FC-8B54-74FD1CDB7161'},
         '605-invalid': {display: true, name: '无效', uuid: '3F09E969-7653-4F30-9D4C-C3FB8CA31B66'},
     };


     $scope.pageOption = {
       sizePerPage: 14,
       currentPage: 0,
       totalPage: 100,
       totalElements: 100
     };

     $scope.editItem = function (channelRelation) {
         $scope.selectedItem = channelRelation;
         $scope.changeViewStatus(Constant.UI_STATUS.PRE_EDIT_UI_STATUS, 1);
         $scope.pageOption.currentPage = 0;
         $scope.pageOption.totalPage = 0;
         $scope.pageOption.totalElements = 0;
         $scope.listFilterItem.itemUuids.length = 0;
         $scope.queryChannelRelationWithPaging();
     };

     $scope.queryChannelRelationWithPaging = function () {
         $scope.ocmListMenu.selectAll = false;
         $scope.selected = [];
         $scope.resetInitialValue();

         ChannelWarehouseRelationService.getAllWithPaging($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, $scope.selectedItem.uuid)
             .success(function (data) {
                 $scope.channelRelationList = data;
                 $scope.pageOption.totalPage = data.totalPages;
                 $scope.pageOption.totalElements = data.totalElements;
             });
     };

     $scope.searchChannelRelationWithPaging=function(no,name){
         ChannelWarehouseRelationService.getAllWithPaging($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, $scope.selectedItem.uuid)
              .success(function (data) {
                  var dataResult = [];
                  angular.forEach(data.content,function(item){
                     if(no == item.warehouse.no || name == item.warehouse.name){
                         dataResult.push(item);
                     }

                     if(no == undefined && name == undefined){
                         dataResult.push(item);
                     }
                     if(no == "" && name == undefined){
                         dataResult.push(item);
                     }
                     if(no == undefined && name == ""){
                          dataResult.push(item);
                     }
                     if(no == "" && name == ""){
                           dataResult.push(item);
                     }

                 });
                 $scope.channelRelationList.content = dataResult;
                 $scope.pageOption.totalPage = data.totalPages;
                 $scope.pageOption.totalElements = data.totalElements;
              });
     }



    $scope.resetInitialValue = function () {
        $scope.revert_audit_button_disabled = 0;
        $scope.audit_button_disabled = 0;
        $scope.valid_status_button_disabled = 0;
        $scope.invalid_status_button_disabled = 0;
    };




    $scope.queryMenuAction = function () {
        $scope.resetInitialValue();
        $scope.selected = [];
        $scope.ocmListMenu.selectAll = false;
        if($scope.ocmListMenu.channelNo !== undefined){
            channelNo = $scope.ocmListMenu.channelNo;
        }else{
            channelNo =null;
        }
        if ($scope.ocmListMenu.channelName !== undefined) {
            channelName = $scope.ocmListMenu.channelName;
        }else {
            channelName = null;
        }
        confirm = $scope.ocmListMenu.confirm;
        status = $scope.ocmListMenu.status;
        ChannelService.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, confirm,
            status, channelName, channelNo, RES_UUID_MAP.OCM.CHANNEL_WAREHOUSE.LIST_PAGE.RES_UUID)
            .success(function (data) {
                $scope.ChannelList = data;
                $scope.pageOption.totalPage = data.totalPages;
                $scope.pageOption.totalElements = data.totalElements;
                angular.forEach($scope.ChannelList.content, function (channel) {
                     ChannelWarehouseRelationService.getAll(channel.uuid).success(function (data) {
                            channel.count=data.content.length;
                      });
                    });
            });
    };




    $scope.listTabSelected = function () {
        $scope.ocmListMenu.showQueryBar = true;
        $scope.queryMenuAction();
        $scope.changeViewStatus(Constant.UI_STATUS.VIEW_UI_STATUS, 0);
        $scope.selected = [];
        $scope.channelRelationList = [];
        $scope.selectedItem = null;
        $scope.areaCode = null;
        $scope.areaName = null;

        $scope.getMenuAuthData($scope.RES_UUID_MAP.OCM.CHANNEL_SERIES_RELATION.FORM_PAGE.RES_UUID).success(function (data) {
            $scope.menuAuthDataMap = $scope.menuDataMap(data);
        });
    };



    $scope.formTabSelected = function () {
        $scope.ocmListMenu.showQueryBar = false;
        $scope.selected = [];
        $scope.getMenuAuthData($scope.RES_UUID_MAP.OCM.CHANNEL_RELATION.FORM_PAGE.RES_UUID).success(function (data) {
            $scope.menuAuthDataMap = $scope.menuDataMap(data);
        });
    };

    $scope.selected = [];

    $scope.toggle = function (item, selected) {
        var idx = selected.indexOf(item);
        if (idx > -1) {
            selected.splice(idx, 1);
        }
        else {
            selected.push(item);
        }
        $scope.ocmListMenu.effectiveType = item.status;

        if ($scope.ui_status == Constant.UI_STATUS.PRE_EDIT_UI_STATUS && $scope.selectedTabIndex == 1) {
            $scope.changeButtonStatus();
        }else{
            $scope.changeButtonStatus();
        }

    };

    $scope.exists = function (item, list) {
        return list.indexOf(item) > -1;
    };


    $scope.changeButtonStatus = function () {
        $scope.resetInitialValue();
        var firstLoop = true;
        angular.forEach($scope.selected, function (channelRelation) {
            $scope.changeButtonStatusByStatus(channelRelation);
            if (firstLoop) {
                firstLoop = false;
                $scope.firstLoopStatus = channelRelation.status;
                $scope.firstLoopConfirm = channelRelation.returnWarehouseFlag;
            } else {
                if ($scope.firstLoopStatus !== channelRelation.status) {
                    $scope.valid_status_button_disabled = 1;
                    $scope.invalid_status_button_disabled = 1;
                }
                if ($scope.firstLoopConfirm !== channelRelation.returnWarehouseFlag) {
                    $scope.audit_button_disabled = "N";
                    $scope.revert_audit_button_disabled = "Y";
                }
            }
        });
    };

   $scope.changeButtonStatusByStatus = function (channelRelation) {

        if (channelRelation.status == Constant.STATUS[1].value) {
            $scope.valid_status_button_disabled = 1;
        } else {
            $scope.invalid_status_button_disabled = 1;
        }

        if (channelRelation.returnWarehouseFlag == Constant.DEFAULT_WAREHOUSE[0].value) {
            $scope.audit_button_disabled = "N";
        } else {
            $scope.revert_audit_button_disabled = "Y";
        }
        console.log($scope.revert_audit_button_disabled);
    };

    $scope.selectAllMenuAction = function () {
        if ($scope.ocmListMenu.selectAll == true) {
            $scope.selected = [];
            if ($scope.ui_status == Constant.UI_STATUS.PRE_EDIT_UI_STATUS && $scope.selectedTabIndex == 1) {
                angular.forEach($scope.channelRelationList.content, function (item) {
                    $scope.selected.push(item);
                });
                $scope.changeButtonStatus();
            } else if ($scope.ui_status == Constant.UI_STATUS.VIEW_UI_STATUS && $scope.selectedTabIndex == 0) {
                angular.forEach($scope.ChannelList.content, function (item) {
                    $scope.selected.push(item);
                });
            }
        } else if ($scope.ocmListMenu.selectAll == false) {
            $scope.selected = [];
        }
    };

    $scope.validStatusMenuAction = function () {
        if ($scope.selected.length > 0) {
            $scope.showConfirm('确认修改启用状态为有效吗？', '', function () {
                if ($scope.ui_status == Constant.UI_STATUS.PRE_EDIT_UI_STATUS && $scope.selectedTabIndex == 1) {
                    var promises = [];
                    angular.forEach($scope.selected, function (channelRelation) {
                        var ChannelRelationUpdateInput = {
                            status: Constant.STATUS[1].value
                        };
                        var response = ChannelSeriesRelationService.modify(channelRelation.uuid, ChannelRelationUpdateInput).success(function () {

                        });
                        promises.push(response);
                    });
                    $q.all(promises).then(function () {
                        $scope.showInfo('修改数据成功。');
                        $scope.editItem($scope.selectedItem);
                    })
                } else if ($scope.ui_status == Constant.UI_STATUS.VIEW_UI_STATUS && $scope.selectedTabIndex == 0) {
                    var promises = [];
                    angular.forEach($scope.selected, function (channel) {

                        var ChannelRelationUpdateInput = {
                            status: Constant.STATUS[1].value
                        };
                        var response = ChannelService.modify(channel.uuid, ChannelRelationUpdateInput).success(function (data) {
                        });
                        promises.push(response);

                    });
                    $q.all(promises).then(function (data) {
                        $scope.showInfo('修改数据成功。');
                        $scope.queryMenuAction();
                    })
                }
            });
        }

    };

    $scope.invalidStatusMenuAction = function () {
        if ($scope.selected.length > 0) {
            $scope.showConfirm('确认修改启用状态为无效吗？', '', function () {
                if ($scope.ui_status == Constant.UI_STATUS.PRE_EDIT_UI_STATUS && $scope.selectedTabIndex == 1) {
                    var promises = [];
                    angular.forEach($scope.selected, function (channelRelation) {
                        var channelRelationUpdateInput = {
                            status: Constant.STATUS[2].value
                        };
                        var response = ChannelWarehouseRelationService.modify(channelRelation.uuid, channelRelationUpdateInput).success(function () {

                        });
                        promises.push(response);
                    });
                    $q.all(promises).then(function () {
                        $scope.showInfo('修改数据成功。');
                        $scope.editItem($scope.selectedItem);
                    })
                } else if ($scope.ui_status == Constant.UI_STATUS.VIEW_UI_STATUS && $scope.selectedTabIndex == 0) {
                    var promises = [];
                    angular.forEach($scope.selected, function (channel) {
                        var channelRelationUpdateInput = {
                            status: Constant.STATUS[2].value
                        };
                        var response = ChannelService.modify(channel.uuid, channelRelationUpdateInput).success(function (data) {
                        });
                        promises.push(response);
                    });
                    $q.all(promises).then(function () {
                        $scope.showInfo('修改数据成功。');
                        $scope.queryMenuAction();
                    })
                }
            });
        }

    };





    //Save modification.
    $scope.modifyMenuAction = function () {
        if ($scope.channelRelationList) {
            var promises = [];
            angular.forEach($scope.channelRelationList.content, function (channelRelation) {
                var response = ChannelWarehouseRelationService.modify(channelRelation.uuid, channelRelation).success(function (data) {
                });
                promises.push(response);
            });
            $q.all(promises).then(function () {
                $scope.showInfo('修改数据成功。');
            })
        }
    };

    $scope.cancelModifyMenuAction = function () {
        $scope.queryChannelRelationWithPaging();
    };

    $scope.exitModifyMenuAction = function () {
        $scope.cancelModifyMenuAction();
        $scope.changeViewStatus($scope.UI_STATUS.PRE_EDIT_UI_STATUS, 1);
        $scope.ocmListMenu.selectAll == false;
    };

    $scope.preAddMenuAction = function () {
        $scope.openProductionSelectDlg();
    };


    $scope.addMenuAction = function () {
        if ($scope.channelRelationList.content != undefined && $scope.channelRelationList.content.length > 0) {
            var promises = [];

            angular.forEach($scope.channelRelationList.content, function (channelRelation) {
                channelRelation.channelUuid = $scope.selectedItem.uuid;
                channelRelation.seriesUuid = channelRelation.series.uuid;
                var channelRelationResponse = ChannelWarehouseRelationService.add(channelRelation).error(function (data) {
                    $scope.showError("重复添加");
                });
                promises.push(channelRelationResponse);
            });

            $q.all(promises).then(function (data) {
                $scope.showInfo('新增渠道区域信息成功。');
                $scope.editItem($scope.selectedItem);
            }, function (data) {
                $scope.showInfo('新增渠道区域信息完成。');
                $scope.editItem($scope.selectedItem);
            });
        } else {
            $scope.channelRelationList = $scope.ExistedChannelRelationList;
        }
        $scope.changeViewStatus($scope.UI_STATUS.PRE_EDIT_UI_STATUS, 1);
    };

    $scope.cancelAddMenuAction = function () {
        $scope.editItem($scope.selectedItem);
    };

    $scope.deleteMenuAction = function () {
        if ($scope.selected.length > 0) {
            $scope.showConfirm('确认删除吗？', '删除的渠道区域信息不可恢复。', function () {
                if ($scope.selected) {
                    var promises = [];
                    angular.forEach($scope.selected, function (channelItemInfo) {
                        var response = ChannelWarehouseRelationService.delete(channelItemInfo.uuid).success(function (data) {
                        });
                        promises.push(response);
                    });
                    $q.all(promises).then(function () {
                        $scope.showInfo('删除数据成功。');
                        $scope.editItem($scope.selectedItem);
                    });
                }
            });
        }
    };

    $scope.populateChannelRelation = function (data) {
        $scope.logining = false;
        $scope.queryChannelRelationWithPaging();
    };

    $scope.openProductionSelectDlg = function () {
        $mdDialog.show({
            controller: 'AddWarehouseController',
            templateUrl: 'app/src/app/ocm/channelWarehouse/addchannelWarehouse.html',
            parent: angular.element(document.body),
            //targetEvent: event,
            locals: {
                Series: $scope.selectedItem,
                channel: $scope.selectedItem,
                listFilterItem: $scope.listFilterItem.itemUuids,
                op: 'add'
            }
        }).then(function (data) {
            $scope.logining = true;
            $scope.populateChannelRelation(data);
        });
    };

});


angular.module('IOne-Production').controller('AddWarehouseController', function ($scope,$q,$mdToast, $mdDialog, Warehouse, ChannelWarehouseRelationService, Constant, channel, listFilterItem) {
    $scope.listFilterItem = listFilterItem;
    $scope.channel = channel;
    $scope.pageOptionForProd = {
        sizePerPage: 1000,
        currentPage: 0,
        totalPage: 0,
        totalElements: 0
    };

    $scope.editItem = function (channel) {
             $scope.selectedItem = channel;
             $scope.pageOption.currentPage = 0;
             $scope.pageOption.totalPage = 0;
             $scope.pageOption.totalElements = 0;
         };



    $scope.resetInitialValue = function () {
            $scope.revert_audit_button_disabled = 0;
            $scope.audit_button_disabled = 0;
            $scope.valid_status_button_disabled = 0;
            $scope.invalid_status_button_disabled = 0;
        }

    $scope.ocmListMenu = {
            selectAll : true,
            status: Constant.STATUS[0].value,
            confirm: Constant.CONFIRM[0].value,
            showQueryBar : true
        };

    $scope.pageOption = {
        sizePerPage: 10,
        currentPage: 0,
        totalPage: 100,
        totalElements: 100
    };

    $scope.listFilterOption = {
        status: Constant.STATUS[1].value,
        confirm: Constant.CONFIRM[2].value,
        release: Constant.RELEASE[2].value
    };

    $scope.listFilterOptionSecond = {
        select: {
            status: Constant.STATUS[0].value,
            confirm: Constant.CONFIRM[0].value
        },
            no: '',
            name: '',
            keyWord: ''
    };

    $scope.$watch('listFilterOption', function () {
        $scope.refreshAllTemplate();
    }, true);

    $scope.selectedTemplateData = {};


    $scope.refreshAllTemplate = function () {
         ChannelWarehouseRelationService.getAllWithPaging($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, $scope.channel.uuid)
            .success(function (data) {
            $scope.channelRelationList = data;
            $scope.pageOption.totalPage = data.totalPages;
            $scope.pageOption.totalElements = data.totalElements;

            Warehouse.getAll(100,0, $scope.listFilterOptionSecond).success(function (data) {
                var dataResult = [];
                angular.forEach(data.content, function (item) {
                    if ($scope.listFilterItem.indexOf(item.uuid) == -1){
                            dataResult.push(item);
                    }
                });
            if($scope.channelRelationList.content.length==0){
                $scope.allProductionsData = dataResult;
                $scope.pageOption.totalPage = data.totalPages;
                $scope.pageOption.totalElements = data.totalElements;
                }else{
                angular.forEach($scope.channelRelationList.content, function (item2) {
                     for(var i=0;i<dataResult.length-1;i++){
                     if(item2.warehouse.uuid == dataResult[i].uuid){
                         dataResult.splice(i,1);
                }
                }
                     $scope.allProductionsData = dataResult;
                     $scope.pageOption.totalPage = data.totalPages;
                     $scope.pageOption.totalElements = data.totalElements;
                });
             }
            });
        });

        $scope.selectedItem = null;
        $scope.selectedTemplateNode = null;
        $scope.selectedTemplateNodeData = null;
        $scope.selectedTemplateNodeDataUuid = null;
    };

    $scope.select = function (selectedObject) {
        if(selectedObject.length == 0){
           toastr["warning"]("请选择需要添加的仓库");
        }else{
            $scope.selectedTemplateNode = selectedObject;
            $mdDialog.hide($scope.selectedTemplateNode);
        if ($scope.selectedTemplateNode != undefined && $scope.selectedTemplateNode.length > 0) {
                    var promises = [];
                    angular.forEach($scope.selectedTemplateNode, function (channelRelation) {
                        channelRelation.channelUuid = $scope.channel.uuid;
                        channelRelation.warehouseUuid = channelRelation.uuid;
                        var channelRelationResponse = ChannelWarehouseRelationService.add(channelRelation).error(function (data) {
                            toastr["error"]("重复添加");
                        });
                        promises.push(channelRelationResponse);
                    });

                    $q.all(promises).then(function (data) {
                        toastr["success"]("新增渠道仓库信息成功。");
                        $scope.editItem($scope.selectedItem);
                    }, function (data) {
                        toastr["success"]('新增渠道仓库信息完成。');
                        $scope.editItem($scope.selectedItem);
                    });
                } else {
                    $scope.channelRelationList = $scope.ExistedChannelRelationList;
                }
                  $scope.cancelDlg();
                  $scope.editItem($scope.channel);
        }
    };

    $scope.cancelDlg = function () {
        $mdDialog.cancel();
    };

    $scope.selected = [];

    $scope.addSeriesToggle = function (item, selected) {
            var idx = selected.indexOf(item);
            if (idx > -1) {
                selected.splice(idx, 1);
            }
            else {
                selected.push(item);
            }
        };
    $scope.exists = function (item, list) {
            return list.indexOf(item) > -1;
    };

   $scope.selectAllMenuAction = function (no,name) {
             if ($scope.ocmListMenu.selectAll == true) {
                    $scope.selected = [];
                    if(no == undefined && name == undefined){
                    angular.forEach($scope.allProductionsData, function (item) {
                          $scope.selected.push(item);
                          $scope.ocmListMenu.selectAll = false;
                         });
                    }

                    angular.forEach($scope.allProductionsData, function (item) {
                    if(item.no.indexOf(no)>-1 || item.name.indexOf(name)>-1){
                         $scope.selected.push(item);
                    }
                    $scope.ocmListMenu.selectAll = false;
                    });

             }else if ($scope.ocmListMenu.selectAll == false) {
                 $scope.selected = [];
                 $scope.ocmListMenu.selectAll = true;
             }
        };
});