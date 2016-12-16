angular.module('IOne-Production').config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/inv/allo', {
        controller: 'AlloController',
        templateUrl: '/app/src/app/inv/allo/allo.html'
    })
}]);


angular.module('IOne-Production').controller('AlloController', function ($scope, $q, $mdDialog, $timeout, Constant, AlloMasterService, AlloDetailService, AllotExtendDetailService, AllotExtendDetail2Service, OrderItemCustomDetail, OrderCustomScope) {
    $scope.pageOption = {
        sizePerPage: 10,
        currentPage: 0,
        totalPage: 100,
        totalElements: 100
    };

    $scope.detailPageOption = {
        sizePerPage: 10,
        currentPage: 0,
        totalPage: 100,
        totalElements: 100
    };

    $scope.menuDisplayOption = {
        '101-confirm': {display: true, name: '审核', uuid: '305cf7f1-2831-4644-9ce0-89f74e51c77d'},
        '102-cancelConfirm': {display: true, name: '取消审核', uuid: '2f0ce2dd-b89f-4863-91cc-793a399713ce'},
        '103-enableStatus': {display: true, name: '启用', uuid: '9ab617b5-4e65-4964-99ad-7df131b09753'},
        '104-disableStatus': {display: true, name: '取消启用', uuid: '86b3d0c6-5c15-4711-8312-2b52e0d37b57'},
        '106-query': {display: true, name: '查询', uuid: '5933629c-b62a-4195-b3c2-3dbd2d602e26'},
        '107-transfer': {display: true, name: '抛转', uuid: '9d7a83c8-2892-4bb0-aae9-31ee5a4ab7d8'},
        '108-unTransfer': {display: true, name: '抛转还原', uuid: 'bee84282-9e3f-43a1-b0c3-b999cc7939b9'},

        '201-batchConfirm': {display: true, name: '批量审核', uuid: '30227911-a5e7-4381-b852-13ab981a556f'},
        '202-batchCancelConfirm': {display: true, name: '批量取消审核', uuid: 'dde1cd28-8882-4b80-83b6-fa79bdcd5bbb'},
        '203-batchEnableStatus': {display: true, name: '批量启用', uuid: '4a17aa8d-9bfb-49a9-aea4-c3d61ddd73ab'},
        '204-batchDisableStatus': {display: true, name: '批量取消启用', uuid: '0f79bcb1-69b6-4247-9a9a-22c1736268d8'}
    };


    // Check authorization
    $scope.isAuthorized = function (option) {

        if ($scope.menuDisplayOption[option].display &&
            ($scope.menuAuthDataMap[$scope.menuDisplayOption[option].uuid] ||
            $scope.isAdmin() || !$scope.menuDisplayOption[option].uuid)) {
            return true;
        }

        return false;
    };


    $scope.disableConfirmMenuItem = function (item) {
        if (item !== null && item !== undefined) {
            return (item.transferFlag != 2 || item.status == 2)
        }
        return false;
    };
    $scope.disableStatusMenuItem = function (item) {
        if (item !== null && item !== undefined) {
            return item.confirm != 1;
        }
        return false;
    };
    $scope.disableTransferMenuItem = function (item) {
        if (item !== null && item !== undefined) {
            return item.confirm == '1';
        }
        return false;
    };
    $scope.showConfirmMenuItem = function (item) {
        if (item !== null && item !== undefined) {
            return item.confirm == 1 && item.status == 1 && $scope.isAuthorized('101-confirm');
        }
        return false;
    };


    $scope.showCancelConfirmMenuItem = function (item) {
        if (item !== null && item !== undefined) {
            return item.confirm == 2 && $scope.isAuthorized('102-cancelConfirm');
        }
        return false;
    };


    $scope.showEnableStatusMenuItem = function (item) {
        if (item !== null && item !== undefined) {
            return item.status == 2 && $scope.isAuthorized('103-enableStatus');
        }
        return false;
    };

    $scope.showDisableStatusMenuItem = function (item) {
        if (item !== null && item !== undefined) {
            return item.status == 1 && $scope.isAuthorized('104-disableStatus');
        }
        return false;
    };


    // Batch operations
    $scope.canBatchConfirm = function () {
        if ($scope.selected.length > 0) {
            for (var i = 0; i < $scope.selected.length; i++) {
                if ($scope.selected[i].confirm == Constant.CONFIRM[2].value || $scope.selected[i].status == Constant.STATUS[2].value) {
                    return false;
                }
            }
            return true;
        }
        return false;
    };

    $scope.canBatchCancelConfirm = function () {
        if ($scope.selected.length > 0) {
            for (var i = 0; i < $scope.selected.length; i++) {
                if ($scope.selected[i].confirm == Constant.CONFIRM[1].value) {
                    return false;
                }
            }
            return true;
        }
        return false;
    };

    $scope.canBatchEnableStatus = function () {
        if ($scope.selected.length > 0) {
            for (var i = 0; i < $scope.selected.length; i++) {
                if ($scope.selected[i].status == Constant.STATUS[1].value) {
                    return false;
                }
            }
            return true;
        }
        return false;
    };

    $scope.canBatchDisableStatus = function () {
        if ($scope.selected.length > 0) {
            for (var i = 0; i < $scope.selected.length; i++) {
                if ($scope.selected[i].status == Constant.STATUS[2].value) {
                    return false;
                }
            }
            return true;
        }
        return false;
    };


    $scope.listFilterOption = {
        status: Constant.STATUS[0].value,
        confirm: Constant.CONFIRM[0].value,
        transferFlag: Constant.CONFIRM[0].value,
        release: Constant.RELEASE[0].value,
        no: '',
        applyDateStart: '',
        applyDateEnd: ''
    };

    $scope.sortByAction = function (field) {
        $scope.sortByField = field;
        $scope.sortType = '';
    };

    $scope.$watch('listFilterOption', function () {
        $scope.pageOption.currentPage = 0;
        $scope.pageOption.totalPage = 0;
        $scope.pageOption.totalElements = 0;
        $scope.refreshList();
    }, true);

    $scope.clickCustom = function (extends2) {
        console.log($scope.selectedSubTab);
        $scope.selectedExtends2 = extends2;
        $scope.changeSubTabIndexs(2);
        console.log($scope.selectedSubTab);
    };

    $scope.selected = [];
    $scope.selectAllFlag = false;

    $scope.queryDateFormat = function (date) {
        console.log(date);
        if (date != undefined) {
            if (date != null || date != '') {
                var formatDate = new Date(date);
                return moment(formatDate).format('YYYY-MM-DD');
            } else {
                return null;
            }
        } else {
            return null;
        }
    };

    $scope.refreshList = function () {
        var applyDateStart = '';
        var applyDateEnd = '';
        if ($scope.listFilterOption.applyDateStart != '') {
            applyDateStart = $scope.queryDateFormat($scope.listFilterOption.applyDateStart);
        }

        if ($scope.listFilterOption.applyDateEnd != '') {
            applyDateEnd = $scope.queryDateFormat($scope.listFilterOption.applyDateEnd);
        }

        AlloMasterService.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, $scope.listFilterOption.confirm, $scope.listFilterOption.status, $scope.listFilterOption.transferFlag, $scope.listFilterOption.no, applyDateStart, applyDateEnd, RES_UUID_MAP.INV.ALLO.RES_UUID).success(function (data) {
            $scope.itemList = data.content;
            $scope.pageOption.totalPage = data.totalPages;
            $scope.pageOption.totalElements = data.totalElements;
            angular.forEach($scope.itemList, function (item) {
                item.showMorePanel = false;
                $scope.refreshDetailList(item, false);

            });
        });
    };

    $scope.refreshDetailList = function (item, showExtend) {
        AlloDetailService.get(item.uuid).success(function (data) {
            item.detailList = data.content;
            if (showExtend) {
                $scope.refreshSubDetail(item.detailList)
            }
        });
    };


    $scope.refreshSubDetail = function (detailList) {
        var subDeatilList = [];
        var promises = [];
        angular.forEach(detailList, function (detail) {
            var response = AllotExtendDetailService.get(detail.uuid).success(function (subDetailList) {
                angular.forEach(subDetailList.content, function (subDetail) {
                    subDeatilList.push(subDetail);
                });
            });
            promises.push(response);
        });

        $q.all(promises).then(function () {
            $scope.subDataList = subDeatilList;
        });
    };


    $scope.refreshList();


    $scope.showDetailPanelAction = function (item) {
        $scope.selectedItem = item;
        $scope.refreshDetailList(item, true);

    };

    $scope.toggleDetailMorePanelAction = function (detail) {
        detail.showMorePanel = !detail.showMorePanel;
    };

    $scope.toggleMorePanelAction = function (item) {
        item.showMorePanel = !item.showMorePanel;


    };

    $scope.selectItemAction = function (event, item) {
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

    // 審核/取消審核
    $scope.confirmClickAction = function (event, item) {
        $scope.stopEventPropagation(event);
        if (item.confirm == '1') {
            if (item.status == 2) {
                return;
            }
            $scope.showConfirm('确认审核吗？', '', function () {
                alloMasterUpdateInput = {
                    uuid: item.uuid,
                    confirm: '2'
                };
                console.log(item.uuid);
                AlloMasterService.modify(item.uuid, alloMasterUpdateInput).success(function (data) {
                    item.confirm = '2';
                    $scope.refreshList();
                    $scope.refreshDetailList(item, true);
                    $scope.showInfo("审核成功!");

                });
            }, function () {
                item.confirm = '1';
            });
        } else {
            if (item.transferFlag == 1) {
                return;
            }
            $scope.showConfirm('确认取消审核吗？', '', function () {

                alloMasterUpdateInput = {
                    uuid: item.uuid,
                    confirm: '1'
                };
                AlloMasterService.modify(item.uuid, alloMasterUpdateInput).success(function (data) {
                    item.confirm = '1';
                    $scope.refreshList();
                    $scope.refreshDetailList(item, true);
                    $scope.showInfo("取消审核成功!");

                });
            }, function () {
                item.confirm = '2';
            });
        }
    };

    //启用 | 作废
    $scope.statusClickAction = function (event, item) {
        $scope.stopEventPropagation(event);
        if (item.status == '1') {
            if (item.confirm == 2) {
                return;
            }
            $scope.showConfirm('确认作废吗？', '', function () {
                alloMasterUpdateInput = {
                    uuid: item.uuid,
                    status: '2'
                };
                AlloMasterService.modify(item.uuid, alloMasterUpdateInput).success(function (data) {
                    item.status = '2';
                    $scope.refreshList();
                    $scope.refreshDetailList(item, true);
                    $scope.showInfo("作废成功!");
                });
            }, function () {
                item.status = '1';
            });
        } else {
            $scope.showConfirm('确认启用吗？', '', function () {
                alloMasterUpdateInput = {
                    uuid: item.uuid,
                    status: '1'
                };
                AlloMasterService.modify(item.uuid, alloMasterUpdateInput).success(function (data) {
                    item.status = '1';
                    $scope.refreshList();
                    $scope.refreshDetailList(item, true);
                    $scope.showInfo("启用成功!");
                });
            }, function () {
                item.status = '2';
            });
        }
    };

    $scope.transferClickAction = function (event, item) {

        $scope.stopEventPropagation(event);
        if (item.transferFlag == '2') {
            //未经審核不允許拋轉
            if (item.confirm != 2) {
                return;
            }
            $scope.showConfirm('确认抛转吗？', '', function () {
                alloMasterUpdateInput = {
                    uuid: item.uuid,
                    transferFlag: '1'
                };
                AlloMasterService.modify(item.uuid, alloMasterUpdateInput).success(function (data) {
                    item.transferFlag = '1';
                    $scope.refreshList();
                    $scope.refreshDetailList(item, true);
                    $scope.showInfo("抛转成功!");
                });
            }, function () {
                item.transferFlag = '2';
            });
        } else {
            $scope.showConfirm('确认抛转还原吗？', '', function () {
                alloMasterUpdateInput = {
                    uuid: item.uuid,
                    transferFlag: '2'
                };
                AlloMasterService.modify(item.uuid, alloMasterUpdateInput).success(function (data) {
                    item.transferFlag = '2';
                    $scope.refreshList();
                    $scope.refreshDetailList(item, true);
                    $scope.showInfo("抛转还原成功!");
                });
            }, function () {
                item.transferFlag = '1';
            });
        }
    };

    //批次新增 for confirm, status, transfer flag
    $scope.batchUpdate = function (BATCH_DATA) {
        if ($scope.selected.length <= 0) {
            $scope.showError("请勾选数据!");

        } else {
            var uuids = "";
            angular.forEach($scope.selected, function (item) {
                uuids = item.uuid + "," + uuids;
            });

            $scope.showConfirm(BATCH_DATA.QUESTION_MSG, '', function () {
                AlloMasterService.batchUpdate(uuids, BATCH_DATA.INPUT).success(function (data) {
                    $scope.refreshList();
                    $scope.showInfo(BATCH_DATA.SUCCESS_MSG);
                    $scope.selected = [];
                });
            });
        }
    };

    $scope.confirmAllClickAction = function (event, confirm) {
        if (confirm) {
            var BATCH_DATA = {
                QUESTION_MSG: '确认审核吗',
                SUCCESS_MSG: '审核成功!',
                INPUT: {
                    confirm: '2'
                }
            }
        } else {
            var BATCH_DATA = {
                QUESTION_MSG: '确认取消审核吗？',
                SUCCESS_MSG: '取消审核成功!',
                INPUT: {
                    confirm: '1'
                }
            }
        }

        $scope.stopEventPropagation(event);
        $scope.batchUpdate(BATCH_DATA);
    };


    $scope.statusAllClickAction = function (event, status) {
        if (status) {
            var BATCH_DATA = {
                QUESTION_MSG: '确认启用吗',
                SUCCESS_MSG: '启用成功!',
                INPUT: {
                    status: '1'
                }
            }
        } else {
            var BATCH_DATA = {
                QUESTION_MSG: '确认作发吗？',
                SUCCESS_MSG: '作发成功!',
                INPUT: {
                    status: '2'
                }
            }
        }

        $scope.stopEventPropagation(event);
        $scope.batchUpdate(BATCH_DATA);
    };

    $scope.editItemCustomFromDetail = function (detail) {
        angular.forEach($scope.subDataList, function (extend) {
            if ((extend.allotDetail.uuid == detail.uuid) && extend.customizeFlag == '1') {
                $scope.editItemCustom(extend);
            }
        });


        angular.forEach($scope.OrderExtendDetailList, function (extend) {
            if ((extend.pmmOrderDetail.uuid == orderDetail.uuid) && extend.customizeFlag == '1') {
                console.log(extend);
                $scope.editItemCustom(extend);
            }
        });
    };

    $scope.editItemCustom = function (extendDetail) {
        $scope.selectedExtendDetail = extendDetail;
        $scope.changeSubTabIndexs(2);
        //get item all the custom detail
        OrderItemCustomDetail.getCustomDetail(extendDetail.item.uuid).success(function (data) {
            $scope.allCustomsScopes = {};
            $scope.selectedItemCustoms = data;
            angular.forEach($scope.selectedItemCustoms.content, function (value) {
                value.informationUuids = JSON.parse(value.information);
            });

            angular.forEach($scope.selectedItemCustoms.content, function (itemCustomDetail) {
                angular.forEach(itemCustomDetail.informationUuids, function (informationUuid) {
                    OrderCustomScope.getCustomScope(itemCustomDetail.itemCustom.uuid, informationUuid).success(function (data) {
                        if ($scope.allCustomsScopes[itemCustomDetail.itemCustom.uuid] == undefined) {
                            var value = {};
                            value[data.uuid] = data;
                            $scope.allCustomsScopes[itemCustomDetail.itemCustom.uuid] = value;
                        } else {
                            var value = $scope.allCustomsScopes[itemCustomDetail.itemCustom.uuid];
                            value[data.uuid] = data;
                            $scope.allCustomsScopes[itemCustomDetail.itemCustom.uuid] = value;
                        }
                    })
                });
            });
        });
        var extendsUuid = $scope.selectedExtendDetail.uuid;
        AllotExtendDetail2Service.get(extendsUuid).success(function (data) {
            $scope.extendDetail2List = data.content;
            angular.forEach($scope.extendDetail2List, function (value) {
                value.informationUuids = JSON.parse(value.information);
            })
        })
    };

    $scope.openAddCustomDlg = function () {
        console.log($scope.selectedExtendDetail);
        $mdDialog.show({
            controller: 'AllotExtendDetail2Controller',
            templateUrl: 'app/src/app/inv/allo/addCustomDlg.html',
            parent: angular.element(document.body),
            targetEvent: event,
            locals: {
                allCustomsScopes: $scope.allCustomsScopes,
                custom: null,
                allCustoms: $scope.selectedItemCustoms,
                op: 'add',
                itemUuid: $scope.selectedExtendDetail.packageItem.uuid
            }
        }).then(function (data) {
            var extend2UpdateInput = {
                allotExtendDetailUuid: $scope.selectedExtendDetail.uuid,
                no: Math.random().toString(36).substring(10),
                itemUuid: $scope.selectedExtendDetail.item.uuid,
                itemCustomUuid: data.selectedCustom.itemCustom.uuid,
                information: data.selectedCustom.informationScope
            };

            var masterUuid = $scope.selectedExtendDetail.allotDetail.allotMaster.uuid;
            var extendDetailUuid = $scope.selectedExtendDetail.uuid;

            AllotExtendDetail2Service.add(extendDetailUuid, extend2UpdateInput).success(function (response) {
                response.informationUuids = data.selectedCustom.informationUuids;
                // $scope.extendDetail2List.push(response);

                $scope.refreshDetailList($scope.selectedItem, true);
                $scope.editItemCustom($scope.selectedExtendDetail);
                $scope.showInfo('新增自定义信息成功。');
            })
        });
    };

    $scope.openEditCustomDlg = function (custom) {
        console.log(custom);
        $mdDialog.show({
            controller: 'AllotExtendDetail2Controller',
            templateUrl: 'app/src/app/inv/allo/addCustomDlg.html',
            parent: angular.element(document.body),
            targetEvent: event,
            locals: {
                allCustoms: $scope.selectedItemCustoms,
                allCustomsScopes: $scope.allCustomsScopes,
                custom: custom,
                op: 'modify',
                itemUuid: $scope.selectedExtendDetail.packageItem.uuid
            }
        }).then(function (data) {
            var masterUuid = $scope.selectedExtendDetail.allotDetail.allotMaster.uuid;
            var extendDetailUuid = $scope.selectedExtendDetail.uuid;
            var detailUuid = $scope.selectedExtendDetail.allotDetail.uuid;

            var extend2UpdateInput = {
                itemCustomUuid: data.selectedCustom.itemCustom.uuid,
                // information: data.selectedCustom.information
                information: data.selectedCustom.informationScope
            };

            AllotExtendDetail2Service.modify(extendDetailUuid, custom.uuid, extend2UpdateInput).success(function () {
                $scope.extendDetail2List = [];
                $scope.refreshDetailList($scope.selectedItem, true);
                $scope.editItemCustom($scope.selectedExtendDetail);
                $scope.showInfo('修改自定义信息成功。');
            })
        });
    };

    $scope.deleteItemCustom = function (extends2) {
        console.log(extends2);
        $scope.showConfirm('确认删除吗？', '删除的自定义信息不可恢复。', function () {
            if (extends2) {
                var extendDetailUuid = $scope.selectedExtendDetail.uuid;
                AllotExtendDetail2Service.delete(extendDetailUuid, extends2.uuid).success(function () {
                    $scope.refreshDetailList($scope.selectedItem, true);
                    $scope.editItemCustom($scope.selectedExtendDetail);
                    $scope.showInfo('删除成功。');
                });
            }
        });
    };


});


angular.module('IOne-Production').controller('AllotExtendDetail2Controller', function ($scope, $mdDialog, allCustoms, allCustomsScopes, custom, op, ItemRelationService, itemUuid) {

    $scope.allCustoms = allCustoms.content;
    $scope.allCustomsScopes = allCustomsScopes;
    $scope.selectedCustom = custom;
    $scope.op = op;
    $scope.itemUuid = itemUuid;

    if ($scope.selectedCustom) {
        angular.forEach($scope.selectedCustom.informationUuids, function (value) {
            angular.forEach($scope.allCustomsScopes[$scope.selectedCustom.itemCustom.uuid], function (item) {
                if (item.uuid == value) {
                    item.checked = true;
                }
            })
        });

        ItemRelationService.getAll($scope.itemUuid, $scope.selectedCustom.itemCustom.uuid, $scope.selectedCustom.informationUuids).success(function (itemRelationData) {
            $scope.itemRelationList = itemRelationData.content;
            $scope.selectedCustom.informationScope = $scope.selectedCustom.information;
        });
    } else {
        $scope.selectedCustom = {
            informationUuids: [],
            //astrict: 2
            itemCustom: {astrict: 2}
        };
    }

    $scope.customChangeHandler = function (customUuid) {
        angular.forEach($scope.allCustoms, function (value) {
            if (value.itemCustom.uuid == customUuid) {
                $scope.selectedCustom.itemCustom = value.itemCustom;
            }
        });

        angular.forEach($scope.allCustomsScopes[$scope.selectedCustom.itemCustom.uuid], function (item) {
            item.checked = false;
        });

        angular.forEach($scope.selectedCustom.informationUuids, function (value, index) {
            angular.forEach($scope.allCustomsScopes[$scope.selectedCustom.itemCustom.uuid], function (item) {
                if (item.uuid == value) {
                    item.checked = true;
                }
            })
        });
        if ($scope.selectedCustom.itemCustom.scopeUuid != undefined) {
            $scope.selectedCustom.itemCustom.scopeUuid = null;
        }

    };

    $scope.checkBoxChangeHandler = function (data, selected) {
        if (selected == true) {
            $scope.selectedCustom.informationUuids.push(data.uuid);
        } else {
            angular.forEach($scope.selectedCustom.informationUuids, function (value, index) {
                if (value == data.uuid) {
                    $scope.selectedCustom.informationUuids.splice(index, 1);
                }
            });
        }
        if ($scope.selectedCustom.informationUuids.length > 0) {
            ItemRelationService.getAll($scope.itemUuid, $scope.selectedCustom.itemCustom.uuid, $scope.selectedCustom.informationUuids).success(function (itemRelationData) {
                $scope.itemRelationList = itemRelationData.content;
            });
        } else {
            $scope.itemRelationList = null;
            $scope.selectedCustom.informationScope = null;
        }
    };

    $scope.radioChangeHandler = function () {
        $scope.selectedCustom.informationUuids = [];
        $scope.selectedCustom.informationUuids.push($scope.selectedCustom.itemCustom.scopeUuid);
    };


    $scope.hideDlg = function () {
        $scope.selectedCustom.information = JSON.stringify($scope.selectedCustom.informationUuids);
        $mdDialog.hide({
            'selectedCustom': $scope.selectedCustom
        });
    };

    $scope.cancelDlg = function () {
        $mdDialog.cancel();
    };
});
