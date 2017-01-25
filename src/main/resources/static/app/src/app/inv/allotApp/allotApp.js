angular.module('IOne-Production').config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/allotApp', {
        controller: 'AllotAppController',
        templateUrl: 'app/src/app/inv/allotApp/allotApp.html'
    })
}]);

angular.module('IOne-Production').controller('AllotAppController', function ($mdDialog, $scope, $location, Constant, OrderMaster, OrderDetail, AlloMasterService, AlloDetailService, AllotTypeService, ChannelLevelService, OCMChannelService, CBIEmployeeService, ChannelPriceService, Production) {

    $scope.appWork = {
        QUERY: 'queryApp',  //查询单
        MAINTAIN: 'maintain' //上馆转馆维护
    };
    var today = new Date();
    var lastWeek = today.setDate(today.getDate() + -7);
    var lastMonth = today.setMonth(today.getMonth() + -1);
    var lastThreeMonth = today.setMonth(today.getMonth() + -3);

    $scope.QUERY_MODE = {
        ALL: {value: '1', name: '全部', queryDate: '', count: 0},
        WEEK: {value: '2', name: '近一周', queryDate: moment(lastWeek).format('YYYY-MM-DD'), count: 0},
        LAST_MONTH: {value: '3', name: '近一个月', queryDate: moment(lastMonth).format('YYYY-MM-DD'), count: 0},
        LAST_THREE_MONTH: {value: '4', name: '近三个月', queryDate: moment(lastThreeMonth).format('YYYY-MM-DD'), count: 0}
    };

    //從url接收的參數
    $scope.allotQuery = {
        orderUuid: $location.$$search.orderUuid,
        allotTypeNo: $location.$$search.allotTypeNo,
        channelUuid: $location.$$search.channelUuid

    };

    $scope.QUERY_ALLOTTYPE = {
        0000: {value: '', name: '全部'},
        6401: {value: '6401', name: '新店上样'},
        6402: {value: '6402', name: '上馆'},
        6404: {value: '6404', name: '转馆'},
        9999: {value: '9999', name: '盘点'},
    };

    $scope.ALLOTTYPE = {
        6401: {value: '6401', name: '新店上样'},
        6402: {value: '6402', name: '上馆'},
        6404: {value: '6404', name: '转馆'},
        9999: {value: '9999', name: '盘点'},
    };

    $scope.listFilterOption = {
        confirm: Constant.CONFIRM[0].value,
        allotType: 0,
        channelUuid: $scope.allotQuery.channelUuid,
        currentQueryMode: $scope.QUERY_MODE['ALL'].value,
        currentQueryType: $scope.QUERY_MODE['ALL']
    };


    $scope.queryPageOption = {
        sizePerPage: 2,
        currentPage: 0,
        totalPage: 0,
        totalElements: 0
    };

    $scope.pageOption = {
        sizePerPage: 3,
        currentPage: 0,
        totalPage: 0,
        totalElements: 0
    };

    //查询画面清单
    $scope.refreshList = function (condition) {
        angular.forEach($scope.QUERY_MODE, function (queryMode) {

            AlloMasterService.getAllFromQueryApp($scope.queryPageOption.sizePerPage, $scope.queryPageOption.currentPage, $scope.listFilterOption.confirm, queryMode.queryDate, '', $scope.listFilterOption.channelUuid, $scope.listFilterOption.allotType).success(function (data) {
                //itemlist只塞符合目前查询的类型
                if (queryMode.value == condition.value) {
                    $scope.listFilterOption.currentQueryMode = condition.value;
                    $scope.listFilterOption.currentQueryType = condition;
                    $scope.allotMasterList = data.content;
                    $scope.queryPageOption.totalPage = data.totalPages;
                    $scope.queryPageOption.totalElements = data.totalElements;
                    $scope.refreshDetailList($scope.allotMasterList);
                }
                queryMode.count = data.totalElements;
            });
        })
    };
    $scope.refreshDetailList = function (allotMasterList) {
        angular.forEach(allotMasterList, function (data) {
            AlloDetailService.get(data.uuid).success(function (detail) {
                angular.forEach(data.detailList, function (detailItem) {
                    detailItem.deliverDate = new Date(detailItem.deliverDate);
                });
                data.detailList = detail.content;
            });
        });

    };

    $scope.changeSelectField = function (condition) {
        $scope.queryPageOption.currentPage = 0;
        $scope.refreshList(condition)
    };
    //要删除的商品
    $scope.deleteDetailUuids = [];

    //查询样品清单
    $scope.refreshOrderDetailList = function () {
        OrderDetail.getAllBySalesSampleType($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, $scope.allotQuery.orderUuid).success(function (data) {
            $scope.itemList = data.content;
            $scope.pageOption.totalPage = data.totalPages;
            $scope.pageOption.totalElements = data.totalElements;

            angular.forEach($scope.itemList, function (orderDetail) {
                orderDetail.allotPrice = 0;
                orderDetail.allotQty = 1;
                ChannelPriceService.getByChannelUuidAndItemUuid($scope.allotQuery.channelUuid, orderDetail.item.uuid).success(function (data) {
                    if (data.content) {
                        orderDetail.allotPrice = data.content[0].standardPrice;
                        Production.getDeliveryDate(data.content[0].item.uuid, $scope.allotQuery.channelUuid).success(function (data) {
                            orderDetail.deliverDate = new Date(data.deliverDate);
                            orderDetail.minDeliverDate = new Date(data.minDeliverDate);
                        });
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
                Production.getDeliveryDate(detail.item.uuid, $scope.allotQuery.channelUuid).success(function (data) {
                    detail.minDeliverDate = new Date(data.minDeliverDate);
                });
            });


            $scope.pageOption.totalPage = data.totalPages;
            $scope.pageOption.totalElements = data.totalElements;
        });
    };

    $scope.initialApp = function () {
        // $scope.changeViewStatus(Constant.UI_STATUS.VIEW_UI_STATUS);
        $scope.changeViewStatus(Constant.UI_STATUS.EDIT_UI_STATUS);
        $scope.allotTypeFlag = $scope.allotQuery.allotTypeNo == "6402" ? true : false;
        $scope.allotMaster.allotTypeNo = $scope.allotQuery.allotTypeNo;
        $scope.getAllotType($scope.allotQuery.allotTypeNo);

        OrderMaster.get($scope.allotQuery.orderUuid).success(function (data) {
            $scope.allotQuery.orderNo = data.no;
            $scope.initData();
        });
    };


    $scope.initCreateData = function () {
        //可新增狀態
        $scope.status = 'add';
        $scope.createAllotMaster();
        $scope.changeViewStatus(Constant.UI_STATUS.EDIT_UI_STATUS);
        $scope.allotMaster.applyDate = moment(new Date()).format('YYYY-MM-DD');
        $scope.allotMaster.allotTypeNo = $scope.allotQuery.allotTypeNo;
        $scope.setCurrentEmployee($scope.currentUser);

        //若不是從上館轉館單來的，不需要做預設查詢
        if (!angular.isUndefined($scope.allotQuery.orderUuid)) {
            $scope.refreshOrderDetailList();
        } else {
            $scope.itemList = [];
            $scope.allotMaster.allotTypeNo = $scope.ALLOTTYPE['6401'].value
        }

        $scope.changeAllotType();
    };

    $scope.editItem = function (item) {
        $scope.changeViewStatus(Constant.UI_STATUS.VIEW_UI_STATUS);
        $scope.allotMaster = item;
        $scope.allotMaster.applyDate = $scope.getFormatDate(item.applyDate);
        $scope.allotMaster.allotTypeNo = item.allotType.no;
        $scope.refreshAllotDetailList(item.uuid);
    };


    //提供上館/轉館APP時使用
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
                $scope.initCreateData();
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
        console.log(no);
        AllotTypeService.getByNo(no).success(function (data) {
            console.log(data);
            if (data.content[0]) {
                $scope.allotMaster.allotTypeUuid = data.content[0].uuid;
            }
        });
    };

    $scope.createAllotMaster = function () {
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
    };

    $scope.initAllotApp = function () {
        //判斷點擊是上館/轉館單，還是查詢單
        if ($scope.allotQuery.orderUuid != '' && $scope.allotQuery.allotTypeNo != null) {
            //初始化编辑画面的处理
            $scope.fromAppWork = $scope.appWork.MAINTAIN;
            $scope.createAllotMaster();
            $scope.initialApp();
        } else {
            //预设迈入查询画面
            $scope.fromAppWork = $scope.appWork.QUERY;
            $scope.changeViewStatus(Constant.UI_STATUS.VIEW_UI_STATUS);
            $scope.refreshList($scope.QUERY_MODE['ALL']);
        }
    };

    $scope.initAllotApp();

    //類型是否可編輯
    $scope.canAllotTypeEditAble = function () {
        if (($scope.allotQuery.orderUuid != '' && $scope.allotQuery.allotTypeNo != null) || $scope.ui_status == Constant.UI_STATUS.VIEW_UI_STATUS) {
            return false;
        } else {
            return true;
        }
    };
    $scope.changeAllotType = function () {
        $scope.allotMaster.outChannel = null;
        $scope.allotMaster.inChannel = null;
        $scope.allotMaster.area = null;
        $scope.getAllotType($scope.allotMaster.allotTypeNo);
        ChannelLevelService.getByChannelUuid($scope.allotQuery.channelUuid).success(function (data) {
            $scope.channelLevelList = data.content;
            angular.forEach($scope.channelLevelList, function (item) {
                if (item.channel.area != null) {
                    $scope.allotMaster.area = item.channel.area;
                }

                if ($scope.allotMaster.allotTypeNo == '9999') {
                    $scope.allotMaster.outChannel = item.channel;
                } else {
                    //盘点默认拨出门店为当前登录账号所属的OCM_BASE_CHAN_UUID
                    $scope.allotMaster.inChannel = item.channel;
                }


                if ($scope.allotMaster.allotTypeNo == '6401' || $scope.allotMaster.allotTypeNo == '6402') {
                    OCMChannelService.get(item.parentOcmBaseChanUuid).success(function (data) {
                        $scope.allotMaster.outChannel = data;
                    });
                } else if ($scope.allotMaster.allotTypeNo == '9999') {
                    //盤點拨入门店为当前登录账号所属门店OCM_BASE_CHAN_UUID的上级门店
                    OCMChannelService.get(item.parentOcmBaseChanUuid).success(function (data) {
                        $scope.allotMaster.inChannel = data;
                    });

                } else {
                    ChannelLevelService.getByParentOcmBaseChanUuid(item.parentOcmBaseChanUuid).success(function (data) {
                        $scope.outChannelList = data.content;
                    });
                }
            });
        });
    };

    $scope.changeDeliverDate = function () {
        angular.forEach($scope.itemList, function (detail) {
            if ($scope.allotMaster.deliverDate != null) {
                detail.deliverDate = new Date($scope.allotMaster.deliverDate);
            }
        });
    };


    //渠道开窗
    $scope.openChannelDlg = function (type) {
        if (!$scope.allotTypeFlag) {
            $mdDialog.show({
                controller: 'AllotChannelSelectController',
                templateUrl: 'app/src/app/inv/allotApp/selectChannel.html',
                parent: angular.element(document.body),
                targetEvent: event,
                locals: {
                    domain: $scope.domain,
                    channelType: type,
                    channelUuid: $scope.allotQuery.channelUuid
                }
            }).then(function (data) {
                if (type == 'out') {
                    $scope.allotMaster.outChannel = data.channel;
                } else {
                    $scope.allotMaster.inChannel = data.channel;
                }
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
            Production.getDeliveryDate(orderDetail.item.uuid, $scope.allotQuery.channelUuid).success(function (data) {
                orderDetail.deliverDate = new Date(data.deliverDate);
                orderDetail.minDeliverDate = new Date(data.minDeliverDate);
            });

            ChannelPriceService.getByChannelUuidAndItemUuid($scope.allotQuery.channelUuid, data.uuid).success(function (data) {
                if (data.totalElements > 0) {
                    orderDetail.allotPrice = data.content[0].standardPrice;
                    //取得最小配送天数

                }
                $scope.itemList.push(orderDetail);
            });
        });
    };

    $scope.editClickAction = function () {
        $scope.changeViewStatus(Constant.UI_STATUS.EDIT_UI_STATUS);
        $scope.status = $scope.allotMaster.no != null ? 'edit' : 'add';
    };

    $scope.clickBackAction = function () {
        $scope.changeViewStatus(Constant.UI_STATUS.VIEW_UI_STATUS);
        $scope.status = '';
        $scope.allotMaster = null;
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
        if ($scope.allotMaster.outChannel == null) {
            $scope.showError('请选择拨出门店!');
            validation = false;
        }

        if ($scope.allotMaster.inChannel == null) {
            $scope.showError('请选择拨入门店!');
            validation = false;
        }

        if ($scope.allotMaster.area == null) {
            $scope.showError('请选择配送区域!');
            validation = false;
        }

        if ($scope.allotMaster.allotTypeNo == null) {
            $scope.showError('请选择类型!');
            validation = false;
        }

        angular.forEach($scope.itemList, function (detail) {
            console.log(detail);
            if (detail.allotQty == 0) {
                $scope.showError('请填写商品数量!');
                validation = false;
            }

            if (detail.deliverDate == null) {
                $scope.showError('请填写配送日期!');
                validation = false;

            } else {
                var formatMinDeliverDate = moment(detail.minDeliverDate).format('YYYY-MM-DD');

                if (detail.deliverDate < detail.minDeliverDate) {
                    $scope.showError('配送日期不可小於' + formatMinDeliverDate + '!');
                    validation = false;
                }
            }
        });
        return validation;
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
                    customizeRemark: detail.customizeRemark,
                    itemAttribute: detail.item.informationScope
                };
                detailInputs.push(AllotDetailInput);
            });
            console.log;
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

            $scope.showConfirm('是否确认生成调拨单？', '', function () {
                AlloMasterService.add(AllotMasterInput).success(function (data) {
                    $scope.initAllotApp();
                    $scope.editItem(data);
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
                        customizeRemark: detail.customizeRemark
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
                        customizeRemark: detail.customizeRemark,
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

            $scope.showConfirm('是否确认修改调拨单？', '', function () {
                AlloMasterService.modify(AllotMasterUpdateInput.uuid, AllotMasterUpdateInput).success(function (data) {
                    $scope.initAllotApp();
                    $scope.editItem(data);
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

    $scope.getBackImage = function () {
        return Constant.BACKEND_BASE + '/app/img/back.png';
    }


});

angular.module('IOne-Production').controller('AllotChannelSelectController', function ($scope, $mdDialog, ChannelLevelService, domain, channelType, channelUuid) {
    $scope.domain = domain;
    $scope.channelUuid = channelUuid;

    $scope.pageOption = {
        sizePerPage: 5,
        currentPage: 0,
        totalPage: 0,
        totalElements: 0

    };

    $scope.refreshChannel = function () {
        ChannelLevelService.getByChannelUuid($scope.channelUuid).success(function (data) {
            console.log(data);
            $scope.channelLevelList = data.content;
            angular.forEach($scope.channelLevelList, function (channel) {
                ChannelLevelService.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, 0, 0, '', '', '', '', channel.parentOcmBaseChanUuid, '', '').success(function (data) {
                    console.log(data);
                    $scope.allChannel = data.content;
                    $scope.pageOption.totalElements = data.totalElements;
                    $scope.pageOption.totalPage = data.totalPages;
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

    $scope.selectedIndex = 0;
    $scope.refreshSubArea = function (grade, parentUuid) {
        Area.getGradeAndParentUuid(grade, parentUuid).success(function (data) {
            if (grade == '4') {
                $scope.areaGrade4List = data.content
            } else if (grade == '5') {
                if (data.content && data.totalElements == 1) {
                    $scope.selectArea(data.content[0]);
                } else {
                    $scope.areaGrade5List = data.content;
                }
            }
        });
    };

    $scope.refreshArea();

    $scope.listTabSelected = function (grade, parentUuid) {
        $scope.refreshSubArea(grade, parentUuid);
        if (grade == '4') {
            $scope.selectedIndex = 1;
        } else if (grade == '5') {
            $scope.selectedIndex = 2;
        }
    };

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
        sizePerPage: 6,
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

    $scope.refreshProduction = function (searchItemNo, searchItemName, searchStandard) {
        $scope.searchItemNo = searchItemNo;
        $scope.searchItemName = searchItemName;
        $scope.searchStandard = searchStandard;
        ProductionCatalogueDetails.getAllByAppCatalogue($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, $scope.channelUuid, today, $scope.searchItemNo, $scope.searchItemName, $scope.searchStandard).success(function (data) {
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
        if ($scope.selectedItem.customizationFlag == 'Y') {
            $scope.showCustomTab = true;
            $scope.itemUuid = item.uuid;
            ProductionCustom.getInformationByCustom($scope.itemUuid, $scope.itemCustomUuid).success(function (data) {
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



