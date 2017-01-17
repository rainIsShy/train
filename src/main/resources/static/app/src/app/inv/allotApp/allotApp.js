angular.module('IOne-Production').config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/allotApp', {
        controller: 'AllotAppController',
        templateUrl: 'app/src/app/inv/allotApp/allotApp.html'
    })
}]);

angular.module('IOne-Production').controller('AllotAppController', function ($mdDialog, $scope, $location, Constant, OrderMaster, OrderDetail, AlloMasterService, AlloDetailService, AllotTypeService, ChannelLevelService, OCMChannelService, CBIEmployeeService, ChannelPriceService) {

    $scope.allotQuery = {
        orderUuid: $location.$$search.orderUuid,
        allotTypeNo: $location.$$search.allotTypeNo,
        channelUuid: $location.$$search.channelUuid

    };

    $scope.allotMaster = {
        no: '',
        applyDate: '',
        allotTypeNo: '',
        allotTypeUuid: '',
        allotTypeName: '',
        outChannel: {},
        outChannelName: '',
        inChannel: {},
        inChannelName: '',
        psoOrderMstNo: '',
        area: {},
        employeeUuid: '',
        departmentUuid: ''
    };

    $scope.ALLOTTYPE = {
        6402: {value: '6402', name: '上馆'}, 6404: {value: 'N', name: '转馆'}
    };

    $scope.pageOption = {
        sizePerPage: 5,
        currentPage: 0,
        totalPage: 0,
        totalElements: 0
    };

    $scope.deleteDetailUuids = [];

    $scope.refreshList = function () {
        OrderDetail.getAllBySalesSampleType($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, $scope.allotQuery.orderUuid).success(function (data) {
            $scope.itemList = data.content;
            $scope.pageOption.totalPage = data.totalPages;
            $scope.pageOption.totalElements = data.totalElements;

            angular.forEach($scope.itemList, function (orderDetail) {
                orderDetail.allotPrice = 0;
                orderDetail.allotQty = 1;
                ChannelPriceService.getByChannelUuidAndItemUuid($scope.allotQuery.channelUuid, orderDetail.item.uuid).success(function (data) {
                    console.log(data);
                    if (data.content) {
                        orderDetail.allotPrice = data.content[0].standardPrice
                    }
                });
            })
        });
    };


    $scope.refreshAllotDetailList = function (allotMasterUuid) {
        AlloDetailService.get(allotMasterUuid).success(function (data) {
            $scope.itemList = data.content;
            angular.forEach($scope.itemList, function (detail) {
                detail.deliverDate = new Date(detail.deliverDate);
            });
            $scope.pageOption.totalPage = data.totalPages;
            $scope.pageOption.totalElements = data.totalElements;
        });
    };

    $scope.initialApp = function () {
        $scope.changeViewStatus(Constant.UI_STATUS.VIEW_UI_STATUS);

        $scope.allotTypeFlag = $scope.allotQuery.allotTypeNo == "6402" ? true : false;
        $scope.allotMaster.allotTypeNo = $scope.allotQuery.allotTypeNo;
        $scope.getAllotType($scope.allotQuery.allotTypeNo);

        OrderMaster.get($scope.allotQuery.orderUuid).success(function (data) {
            $scope.allotQuery.orderNo = data.no;
            $scope.initData();
        });
    };

    $scope.initData = function () {

        AlloMasterService.getAllFromApp($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, 0, 0, $scope.allotQuery.allotTypeNo, $scope.allotQuery.orderNo).success(function (data) {
            if (data.totalElements > 0) {
                $scope.changeViewStatus(Constant.UI_STATUS.VIEW_UI_STATUS);
                if (data.content) {
                    $scope.allotMaster = data.content[0];
                    $scope.allotMaster.applyDate = $scope.getFormatDate($scope.allotMaster.applyDate);
                    $scope.allotMaster.allotTypeNo = $scope.allotMaster.allotType.no;
                    $scope.refreshAllotDetailList($scope.allotMaster.uuid);
                }
            } else {
                //可新增狀態
                $scope.changeViewStatus(Constant.UI_STATUS.EDIT_UI_STATUS);
                $scope.status = 'add';

                $scope.allotMaster.applyDate = moment(new Date()).format('YYYY-MM-DD');
                $scope.allotMaster.allotTypeNo = $scope.allotQuery.allotTypeNo;

                $scope.setCurrentEmployee($scope.currentUser);
                $scope.refreshList();

                ChannelLevelService.getByChannelUuid($scope.allotQuery.channelUuid).success(function (data) {
                    $scope.channelLevelList = data.content;
                    angular.forEach($scope.channelLevelList, function (item) {
                        if (item.channel.area != null) {
                            $scope.allotMaster.area = item.channel.area;
                        }

                        $scope.allotMaster.inChannel = item.channel;
                        //true: 上館; false:轉館
                        if ($scope.allotTypeFlag) {
                            OCMChannelService.get(item.parentOcmBaseChanUuid).success(function (data) {
                                $scope.allotMaster.outChannel = data;
                            });
                        } else {
                            ChannelLevelService.getByParentOcmBaseChanUuid(item.parentOcmBaseChanUuid).success(function (data) {
                                $scope.outChannelList = data.content;
                            });
                        }
                    });

                });
            }
        });
    };

    $scope.getFormatDate = function (date) {
        return moment(date).format('YYYY-MM-DD');
    };

    //取得目前登入人員的員工uuid，部門uuid
    $scope.setCurrentEmployee = function (no) {
        CBIEmployeeService.getByNo(no).success(function (data) {
            if (data.content[0]) {
                $scope.allotMaster.employeeUuid = data.content[0].uuid;
                $scope.allotMaster.departmentUuid = data.content[0].department.uuid;
            }
        });
    };
    $scope.getAllotType = function (no) {
        AllotTypeService.getByNo(no).success(function (data) {
            if (data.content[0]) {
                $scope.allotMaster.allotTypeUuid = data.content[0].uuid;
            }
        });
    };

    $scope.initialApp();

    $scope.changeDeliverDate = function () {
        angular.forEach($scope.itemList, function (detail) {
            detail.deliverDate = new Date($scope.allotMaster.deliverDate);
        });
    };

    $scope.openChannelDlg = function () {
        if (!$scope.allotTypeFlag) {
            $mdDialog.show({
                controller: 'AllotChannelSelectController',
                templateUrl: 'app/src/app/inv/allotApp/selectChannel.html',
                parent: angular.element(document.body),
                targetEvent: event,
                locals: {
                    domain: $scope.domain,
                    channelUuid: $scope.allotQuery.channelUuid
                }
            }).then(function (data) {
                $scope.allotMaster.outChannel = data.channel;
            });
        }
    };

    $scope.openAreaDlg = function () {
        $mdDialog.show({
            controller: 'AllotAreaSelectController',
            templateUrl: 'app/src/app/inv/allotApp/selectArea.html',
            parent: angular.element(document.body),
            targetEvent: event,
            locals: {}
        }).then(function (data) {
            $scope.allotMaster.area = data;
        });
    };

    $scope.openItemDlg = function () {
        $mdDialog.show({
            controller: 'AllotItemSelectController',
            templateUrl: 'app/src/app/inv/allotApp/selectItems.html',
            parent: angular.element(document.body),
            targetEvent: event,
            locals: {
                channelUuid: $scope.allotQuery.channelUuid
            }
        }).then(function (data) {
            var orderDetail = {
                item: data,
                allotPrice: 0,
                allotQty: 1
            };
            orderDetail.allotQty = 1;

            ChannelPriceService.getByChannelUuidAndItemUuid($scope.allotQuery.channelUuid, data.uuid).success(function (data) {
                if (data.totalElements > 0) {
                    orderDetail.allotPrice = data.content[0].standardPrice
                }
                $scope.itemList.push(orderDetail);
            });
        });
    };

    $scope.editClickAction = function () {
        $scope.changeViewStatus(Constant.UI_STATUS.EDIT_UI_STATUS);
        $scope.status = $scope.allotMaster.no != null ? 'edit' : 'add';
    };


    $scope.cancelEditClickAction = function () {
        $scope.changeViewStatus(Constant.UI_STATUS.VIEW_UI_STATUS);
    };


    $scope.deleteClickAction = function (orderDetail) {
        $scope.showConfirm('确认删除吗？', '删除后不可恢复。', function () {
            if (orderDetail.uuid != null) {
                $scope.deleteDetailUuids.push(orderDetail.uuid);
            }
            $scope.itemList.splice($scope.itemList.indexOf(orderDetail), 1);
        });
    };

    $scope.validField = function () {
        var validation = true;
        if ($scope.allotMaster.outChannel.uuid == null) {
            $scope.showError('请选择拨出门店!');
            validation = false;
        }

        if ($scope.allotMaster.inChannel.uuid == null) {
            $scope.showError('请选择拨入门店!');
            validation = false;
        }

        if ($scope.allotMaster.area.uuid == null) {
            $scope.showError('请选择配送区域!');
            validation = false;
        }

        angular.forEach($scope.itemList, function (detail) {
            if (detail.allotQty == 0) {
                $scope.showError('请填写商品数量!');
                validation = false;
            }

            if (detail.deliverDate == null) {
                $scope.showError('请填写配送日期!');
                validation = false;
            }
        });
    };

    $scope.saveClickAction = function () {

        if (!$scope.validField()) {
            return;
        }
        if ($scope.status == 'add') {
            var detailInputs = [];

            angular.forEach($scope.itemList, function (detail) {
                var AllotDetailInput = {
                    itemUuid: detail.item.uuid,
                    allotPrice: detail.allotPrice,
                    allotQty: detail.allotQty,
                    oriAllotAmt: detail.allotPrice * detail.allotQty,
                    oriAllotAmtTax: detail.allotPrice * detail.allotQty,
                    customizeFlag: detail.item.customizationFlag == 'Y' ? '1' : '2',
                    deliverDate: detail.deliverDate,
                    oriDeliverDate: detail.deliverDate,
                    remark: detail.remark,
                    itemAttribute: detail.item.informationScope
                };
                detailInputs.push(AllotDetailInput);
            });

            var AllotMasterInput = {
                allotTypeUuid: $scope.allotMaster.allotTypeUuid,
                applyDate: $scope.allotMaster.applyDate,
                channelUuid: $scope.allotQuery.channelUuid,
                ocmBaseChanOutUuid: $scope.allotMaster.outChannel.uuid,
                ocmBaseChanInUuid: $scope.allotMaster.inChannel.uuid,
                areaUuid: $scope.allotMaster.area.uuid,
                storeAddress: $scope.allotMaster.outChannel.name + '调货到' + $scope.allotMaster.inChannel.name,
                psoOrderMstNo: $scope.allotQuery.orderNo,
                employeeUuid: $scope.allotMaster.employeeUuid,
                departmentUuid: $scope.allotMaster.departmentUuid,
                remark: $scope.allotMaster.remark,
                details: detailInputs
            };

            console.log(AllotMasterInput);
            $scope.showConfirm('是否确认生成调拨单？', '', function () {
                AlloMasterService.add(AllotMasterInput).success(function (data) {
                    $scope.initialApp();
                });
            });
        } else if ($scope.status == 'edit') {

            var detailInputs = [];
            var detailUpdateInputs = [];

            angular.forEach($scope.itemList, function (detail) {
                if (detail.uuid != null) {
                    var AllotDetailUpdateInput = {
                        uuid: detail.uuid,
                        allotPrice: detail.allotPrice,
                        allotQty: detail.allotQty,
                        oriAllotAmt: detail.allotPrice * detail.allotQty,
                        oriAllotAmtTax: detail.allotPrice * detail.allotQty,
                        customizeFlag: detail.item.customizationFlag == 'Y' ? '1' : '2',
                        deliverDate: detail.deliverDate,
                        oriDeliverDate: detail.deliverDate,
                        remark: detail.remark
                    };
                    detailUpdateInputs.push(AllotDetailUpdateInput);
                } else {
                    var AllotDetailInput = {
                        itemUuid: detail.item.uuid,
                        allotPrice: detail.allotPrice,
                        allotQty: detail.allotQty,
                        oriAllotAmt: detail.allotPrice * detail.allotQty,
                        oriAllotAmtTax: detail.allotPrice * detail.allotQty,
                        customizeFlag: detail.item.customizationFlag == 'Y' ? '1' : '2',
                        deliverDate: detail.deliverDate,
                        oriDeliverDate: detail.deliverDate,
                        remark: detail.remark,
                        itemAttribute: detail.item.informationScope
                    };
                    detailInputs.push(AllotDetailInput);
                }
            });

            var AllotMasterUpdateInput = {
                uuid: $scope.allotMaster.uuid,
                ocmBaseChanOutUuid: $scope.allotMaster.outChannel.uuid,
                ocmBaseChanInUuid: $scope.allotMaster.inChannel.uuid,
                areaUuid: $scope.allotMaster.area.uuid,
                storeAddress: $scope.allotMaster.outChannel.name + '调货到' + $scope.allotMaster.inChannel.name,
                remark: $scope.allotMaster.remark,
                detailInputs: detailInputs,
                details: detailUpdateInputs,
                deleteDetailUuids: $scope.deleteDetailUuids
            };
            console.log(AllotMasterUpdateInput);

            $scope.showConfirm('是否确认修改调拨单？', '', function () {
                AlloMasterService.modify(AllotMasterUpdateInput.uuid, AllotMasterUpdateInput).success(function (data) {
                    $scope.initialApp();
                });
            });
        }
    };

    $scope.getImageFullPath = function (path) {
        if (path == null) {
            return Constant.BACKEND_BASE + '/app/img/item.jpeg';
        }
        if (path && path.indexOf('IMAGE') == 0) {
            return Constant.BACKEND_BASE + '/app/assets/' + path;
        } else {
            return Constant.BACKEND_BASE + '/app/assets/IMAGE/' + path;
        }
    };


});

angular.module('IOne-Production').controller('AllotChannelSelectController', function ($scope, $mdDialog, ChannelLevelService, domain, channelUuid) {
    $scope.pageOption = {
        sizePerPage: 5,
        currentPage: 0,
        totalPage: 0,
        totalElements: 0,
        displayModel: 0  //0 : image + text //1 : image
    };

    $scope.domain = domain;
    $scope.channelUuid = channelUuid;

    $scope.refreshChannel = function () {
        ChannelLevelService.getByChannelUuid($scope.channelUuid).success(function (data) {
            $scope.channelLevelList = data.content;
            angular.forEach($scope.channelLevelList, function (channel) {
                ChannelLevelService.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, 0, 0, '', '', '', '', channel.parentOcmBaseChanUuid, $scope.channelUuid, '').success(function (data) {
                    $scope.allChannel = data.content;
                });
            });
        });

    };

    $scope.refreshChannel();

    $scope.selectChannel = function (item) {
        $scope.channel = item;
        $mdDialog.hide($scope.channel);
    };

    $scope.hideDlg = function () {
        $mdDialog.hide($scope.channel);
    };
    $scope.cancelDlg = function () {
        $mdDialog.cancel();
    };
});

angular.module('IOne-Production').controller('AllotAreaSelectController', function ($scope, $mdDialog, Area) {
    $scope.pageOption = {
        sizePerPage: 5,
        currentPage: 0,
        totalPage: 0,
        totalElements: 0
    };


    $scope.refreshArea = function () {
        var grade2Uuid = '723F3CCA-79C5-4C00-BEAF-C74622B54142';
        Area.getGradeAndParentUuid(3, grade2Uuid).success(function (data) {
            $scope.areaGrade3List = data.content;
        });
    };


    $scope.refreshSubArea = function (grade, parentUuid) {
        Area.getGradeAndParentUuid(grade, parentUuid).success(function (data) {
            if (grade == '4') {
                $scope.areaGrade4List = data.content
            } else {
                $scope.areaGrade5List = data.content
            }
        });
    };

    $scope.refreshArea();

    $scope.selectArea = function (item) {
        $scope.selectedItem = item;

        $mdDialog.hide($scope.selectedItem);
    };

    $scope.hideDlg = function (item) {
        $scope.selectedItem = item;
        $mdDialog.hide($scope.selectedItem);
    };
    $scope.cancelDlg = function () {
        $mdDialog.cancel();
    };
});


angular.module('IOne-Production').controller('AllotItemSelectController', function ($scope, $mdDialog, Constant, Catalogue, OrderItemCustomDetail, OrderCustomScope, ProductionCatalogueDetails, ItemRelationService, ProductionItemCustom, ProductionCustom, channelUuid) {
    $scope.pageOption = {
        sizePerPage: 12,
        currentPage: 0,
        totalPage: 0,
        totalElements: 0,
        displayModel: 0  //0 : image + text //1 : image
    };

    $scope.selectedCustom = {
        informationUuids: []
    };


    var today = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
    $scope.channelUuid = channelUuid;

    $scope.refreshProduction = function (searchItemNo, searchItemName) {
        $scope.searchItemNo = searchItemNo;
        $scope.searchItemName = searchItemName;
        ProductionCatalogueDetails.getAllByAppCatalogue($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, $scope.channelUuid, today, $scope.searchItemNo, $scope.searchItemName).success(function (data) {
            $scope.allProductionsData = data.content;
                $scope.pageOption.totalPage = data.totalPages;
                $scope.pageOption.totalElements = data.totalElements;
            }
        );
    };


    $scope.refreshProduction();
    $scope.itemCustomUuid = '126BA49C-271E-46F4-8D2D-A8A5A1D99CDD';

    $scope.selectItem = function (item) {
        $scope.selectedItem = item;
        $scope.showCustomTab = true;
        if ($scope.selectedItem.customizeFlag == 'Y') {
            $scope.showCustomTab = true;
            $scope.itemUuid = item.uuid;
            ProductionCustom.getInformationByCustom('393FF02F-2C10-4149-AFF3-E484D10BD9C5', $scope.itemCustomUuid).success(function (data) {
                if (data.totalElements > 0) {
                    $scope.informationList = data.content;
                }
            });
        } else {
            $mdDialog.hide($scope.selectedItem);
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
            ItemRelationService.getAll($scope.itemUuid, $scope.itemCustomUuid, $scope.selectedCustom.informationUuids).success(function (itemRelationData) {
                $scope.itemRelationList = itemRelationData.content;
            });
        } else {
            $scope.itemRelationList = null;
            $scope.selectedCustom.informationScope = null;
        }
    };

    $scope.getImageFullPath = function (path) {
        if (path == null) {
            return Constant.BACKEND_BASE + '/app/img/item.jpeg';
        }
        if (path && path.indexOf('IMAGE') == 0) {
            return Constant.BACKEND_BASE + '/app/assets/' + path;
        } else {
            return Constant.BACKEND_BASE + '/app/assets/IMAGE/' + path;
        }
    };

    $scope.hideDlg = function () {
        $scope.selectedItem.informationScope = $scope.selectedCustom.informationScope;
        $mdDialog.hide($scope.selectedItem);
    };
    $scope.cancelDlg = function () {
        $mdDialog.cancel();
    };
});



