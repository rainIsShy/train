angular.module('IOne-Production').config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/fam/discountCard', {
        controller: 'DiscountCardController',
        templateUrl: 'app/src/app/fam/dis_card/discountCard.html'
    })
}]);

angular.module('IOne-Production').controller('DiscountCardController', function ($scope, $q, DiscountCardService, DiscountChanService, $mdDialog, Constant) {
    $scope.PROMULGATOR = Constant.PROMULGATOR;
    $scope.REFUND_TYPE = Constant.REFUND_TYPE;
    $scope.CARD_CONDITION = Constant.CARD_CONDITION;

    $scope.localTemp = {
        startTime: new Date(),
        overTime: new Date()
    };
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

    $scope.menuDisplayOption = {
        '405-delete': {display: true, name: '删除', uuid: 'b2915045-fc3c-4b93-993b-b6c8ccb03dbd'},
        '406-query': {display: true, name: '查询', uuid: '08273e82-b124-4f73-bcae-b445bd9b8a0f'},
        '415-deleteAll': {display: true, name: '批量删除', uuid: '0aa6bcff-8eb6-43f8-bad8-270aab636eda'},
    };

    $scope.refreshList = function () {
        DiscountCardService.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, $scope.listFilterOption.confirm, $scope.listFilterOption.status,
            $scope.listFilterOption.no, $scope.listFilterOption.name, $scope.listFilterOption.keyWord, $scope.RES_UUID_MAP.CBI.EMPL.RES_UUID).success(function (data) {
            $scope.itemList = data.content;
            $scope.pageOption.totalPage = data.totalPages;
            $scope.pageOption.totalElements = data.totalElements;

            $scope.selectAllFlag = false;
            if ($scope.selectedItem != null) {
                angular.forEach($scope.itemList, function (item) {
                    if (item.uuid == $scope.selectedItem.uuid) {
                        $scope.showDetailPanelAction(item);
                    }
                });
            }
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
    $scope.selectDetailAllFlag = false;

    /**
     * Add new item which will take the ui to the edit page.
     */
    $scope.preAddItemAction = function (source, domain, desc) {
        $scope.changeViewStatus(Constant.UI_STATUS.EDIT_UI_STATUS);
        $scope.status = 'add';
        $scope.desc = desc;
        $scope.source = source;
        $scope.domain = domain;
        if (domain == "FAM_BASE_DISCOUNT_CARD") {
            $scope.source["promulgator"] = "4";
            $scope.source["costType"] = "1";
            $scope.source["refundType"] = "Y";
            $scope.source["specificCardFlag"] = "Y";
            $scope.source["cardCondition"] = "4";
        } else if (domain == "FAM_BASE_DISCOUNT_CARD_CHAN") {
            $scope.source["discountCard"] = $scope.selectedItem;
            $scope.source.discountCardUuid = $scope.selectedItem.uuid;

        }
    };


    /**
     * Show left detail panel when clicking the title
     */
    $scope.showDetailPanelAction = function (item) {
        $scope.selectedItem = item;
//        item.detailList = $scope.subItemList;
        $scope.showDisChannel(item);
    };


    $scope.returnToListAction = function (event, item) {
        $scope.stopEventPropagation(event);
        $scope.selectedItem = null;

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
            item.detailList = item;
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
        if (domain == "FAM_BASE_DISCOUNT_CARD") {
            $scope.selectedItemBackUp = angular.copy($scope.selectedItem);
            $scope.selectedItemBackUp.startTime = angular.copy(fixDate($scope.selectedItemBackUp.startTime));
            $scope.selectedItemBackUp.overtime = angular.copy(fixDate($scope.selectedItemBackUp.overtime));
        } else if (domain == "FAM_BASE_DISCOUNT_CARD_CHAN") {
            $scope.selectedItemDetailBackUp = angular.copy($scope.source);
            $scope.selectedItemDetailBackUp.startTime = angular.copy(fixDate($scope.selectedItemDetailBackUp.startTime));
            $scope.selectedItemDetailBackUp.overtime = angular.copy(fixDate($scope.selectedItemDetailBackUp.overtime));
        }
    };


    /**
     * Save object according current status and domain.
     */
    $scope.saveItemAction = function () {
        if ($scope.status == 'add') {

            if ($scope.domain == 'FAM_BASE_DISCOUNT_CARD') {
                var checkSave = $scope.checkSaveAction($scope.source.startTime, $scope.source.overTime);
                if (checkSave) {
                    $scope.localTemp.startTime = $scope.source.startTime;
                    $scope.localTemp.overTime = $scope.source.overTime;
                    $scope.source.startTime = fixDate($scope.source.startTime);
                    $scope.source.overTime = fixDate($scope.source.overTime);
                    DiscountCardService.add($scope.source).success(function (data) {
                        $scope.source.startTime = $scope.localTemp.startTime;
                        $scope.source.overTime = $scope.localTemp.overTime;
                        $scope.showInfo('新增数据成功。');
                        $scope.refreshList();
                    }).error(function () {
                        $scope.source.startTime = $scope.localTemp.startTime;
                        $scope.source.overTime = $scope.localTemp.overTime;
                        $scope.refreshList();
                        $scope.showError('新增失败：' + '<br>' + data.message);
                    });
                }
                else {
                    $scope.refreshList();
                }

            } else if ($scope.domain == 'FAM_BASE_DISCOUNT_CARD_CHAN') {
                var discardStartTime = $scope.source.discountCard.startTime;
                var discardOverTime = $scope.source.discountCard.overTime;
                var checkSave = $scope.checkChanSaveAction($scope.source.startTime, $scope.source.overTime, discardStartTime, discardOverTime);
                if (checkSave) {
                    $scope.localTemp.startTime = $scope.source.startTime;
                    $scope.localTemp.overTime = $scope.source.overTime;
                    $scope.source.startTime = fixDate($scope.source.startTime);
                    $scope.source.overTime = fixDate($scope.source.overTime);
                    DiscountChanService.add($scope.source).success(function (data) {
                        $scope.source.startTime = $scope.localTemp.startTime;
                        $scope.source.overTime = $scope.localTemp.overTime;
                        $scope.showDisChannel(data.discountCard);
                        $scope.showInfo('新增数据成功。');
                    }).error(function () {
                        $scope.source.startTime = $scope.localTemp.startTime;
                        $scope.source.overTime = $scope.localTemp.overTime;
                        $scope.refreshList();
                        $scope.showError('新增失败：' + '<br>' + data.message);
                    });
                }
                else {
                    $scope.showDisChannel($scope.source.discountCard);
                }
            }
        } else if ($scope.status == 'edit') {
            if ($scope.domain == 'FAM_BASE_DISCOUNT_CARD') {
                var checkSave = $scope.checkSaveAction($scope.source.startTime, $scope.source.overTime);
                if (checkSave) {
                    $scope.localTemp.startTime = $scope.source.startTime;
                    $scope.localTemp.overTime = $scope.source.overTime;
                    $scope.source.startTime = fixDate($scope.source.startTime);
                    $scope.source.overTime = fixDate($scope.source.overTime);
                    DiscountCardService.modify($scope.source.uuid, $scope.source).success(function (data) {
                        //$scope.source.startTime = $scope.localTemp.startTime;
                        //$scope.source.overTime = $scope.localTemp.overTime;
                        data.startTime=fixDate(data.startTime);
                        data.overTime=fixDate(data.overTime);
                        $scope.source = data;
                        $scope.selectedItem = data;
                        $scope.selectedItemBackUp = angular.copy($scope.selectedItem);
                        $scope.refreshList();
                        $scope.showInfo('修改数据成功。');
                    }).error(function (data) {
                        //$scope.source.startTime = $scope.localTemp.startTime;
                        //$scope.source.overTime = $scope.localTemp.overTime;
                        $scope.source = angular.copy($scope.selectedItemBackUp);
                        $scope.selectedItem = angular.copy($scope.selectedItemBackUp);
                        $scope.refreshList();
                        $scope.showError('修改失败：' + '<br>' + data.message);
                    });
                }

            } else if ($scope.domain == 'FAM_BASE_DISCOUNT_CARD_CHAN') {
                var discardStartTime = $scope.source.discountCard.startTime;
                var discardOverTime = $scope.source.discountCard.overTime;
                var checkSave = $scope.checkChanSaveAction($scope.source.startTime, $scope.source.overTime, discardStartTime, discardOverTime);
                if (checkSave) {
                    $scope.localTemp.startTime = $scope.source.startTime;
                    $scope.localTemp.overTime = $scope.source.overTime;
                    $scope.source.startTime = fixDate($scope.source.startTime);
                    $scope.source.overTime = fixDate($scope.source.overTime);
                    DiscountChanService.modify($scope.source.uuid, $scope.source).success(function (data) {
                        //$scope.source.startTime = $scope.localTemp.startTime;
                        //$scope.source.overTime = $scope.localTemp.overTime;
                        data.startTime=fixDate(data.startTime);
                        data.overTime=fixDate(data.overTime);
                        $scope.source = data;
                        $scope.selectedItemDetailBackUp = angular.copy(data);
                        $scope.showInfo('修改数据成功。');
                        $scope.showDisChannel(data.discountCard);
                    }).error(function (data) {
                        //$scope.source.startTime = $scope.localTemp.startTime;
                        //$scope.source.overTime = $scope.localTemp.overTime;
                        $scope.source = angular.copy($scope.selectedItemDetailBackUp);
                        $scope.refreshList();
                        $scope.showError('修改失败：' + '<br>' + data.message);
                    });
                }
                else {
                    $scope.showDisChannel($scope.source.discountCard);
                }

            }
        }
    };

    $scope.checkSaveAction = function (startTime, overTime) {
        var breakException = {};
        if (startTime > overTime) {
            $scope.showError('开始时间不得晚於的結束时间。');
            $scope.refreshList();
            return false;
        }
        if ($scope.domain == 'FAM_BASE_DISCOUNT_CARD') {
            angular.forEach($scope.subItemList, function (subItem) {
                if (!$scope.checkChanSaveAction(subItem.startTime, subItem.overTime, startTime, overTime)) {
                    throw breakException;
                }
            });
        }
        return true;
    };

    $scope.checkChanSaveAction = function (startTime, overTime, discardStartTime, discardOverTime) {
        startTime = fixDate(startTime);
        overTime = fixDate(overTime);
        discardStartTime = fixDate(discardStartTime);
        discardOverTime = fixDate(discardOverTime);
        console.log("startTime[" + startTime + "],overTime[" + overTime + "],discardOverTime[" + discardOverTime + "] ,discardOverTime[" + discardOverTime + "]");
        if (startTime > overTime) {
            $scope.showError('开始时间不得晚於的結束时间。');
            return false;
        } else if (startTime < discardStartTime) {
            console.log("startTime[" + startTime + "],discardStartTime[" + discardStartTime + "] -->可用门店开始时间不得早于卡券的开始时间");
            $scope.showError(($scope.domain == 'FAM_BASE_DISCOUNT_CARD') ? '已有门店开始时间早于您所设定的卡券时间，请先调整门店开始时间' : '可用门店开始时间不得早于卡券的开始时间。');
            $scope.refreshList();
            return false;
        } else if (overTime > discardOverTime) {
            console.log("overTime[" + overTime + "],discardOverTime[" + discardOverTime + "] -->可用门店結束时间不得晚于卡券的結束时间");
            $scope.showError(($scope.domain == 'FAM_BASE_DISCOUNT_CARD') ? '已有门店结束时间早于您所设定的卡券时间，请先调整门店结束时间' : '可用门店結束时间不得晚于卡券的結束时间。');
            $scope.refreshList();
            return false;
        } else {
            return true;
        }
    };

    $scope.deleteClickAction = function (event, item) {
        $scope.stopEventPropagation(event);
        $scope.showConfirm('确认删除吗？', '删除后不可恢复。', function () {
            DiscountCardService.delete(item.uuid).success(function () {
                $scope.selectedItem = null;
                $scope.refreshList();
                $scope.showInfo('删除数据成功。');
                $scope.selectItemCount = 0;
            });
        });
    };

    $scope.deleteAllClickAction = function (event) {
        $scope.stopEventPropagation(event);
        if ($scope.selected.length > 0) {
            $scope.showConfirm('确认删除吗？', '删除后不可恢复。', function () {
                if ($scope.selected) {
                    var promises = [];
                    angular.forEach($scope.selected, function (item) {
                        var response = DiscountCardService.delete(item.uuid).success(function (data) {
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


    /**
     * Delete Detail Item
     **/
    $scope.deleteDetailAction = function (item) {
        $scope.showConfirm('确认删除吗？', '删除后不可恢复。', function () {
            DiscountChanService.delete(item.uuid).success(function () {
                $scope.showDisChannel(item.discountCard);
                $scope.showInfo('删除数据成功。');
            });
        });
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

    $scope.selectDetailAllAction = function () {
        if ($scope.selectDetailAllFlag == true) {
            angular.forEach($scope.subItemList, function (item) {
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

    $scope.exists = function (item, selected) {
        return selected.indexOf(item) > -1;
    };

    $scope.selected = [];
    $scope.detailSelected = [];


    /**
     * Show Discount Channel Detail Data
     */
    $scope.showDisChannel = function (discount) {
        if (discount.uuid != undefined) {
            DiscountChanService.get(discount.uuid).success(function (data) {
                console.log($scope.subItemList);
                $scope.subItemList = data.content;

            });

        }
    };

    /**
     *  Fix DateTime
     */
    var fixDate = function (dt) {
        var confDeliverDate = null;
        if (dt != null) {
            var myDate = new Date(dt);
            confDeliverDate = moment(myDate).format('YYYY-MM-DD');
        }
        return confDeliverDate;

    };


    $scope.openBatchUpdateChan = function (item) {
        $mdDialog.show({
            controller: 'ChanUpdateController',
            templateUrl: 'app/src/app/fam/dis_card/batchUpdateChan.html',
            parent: angular.element(document.body),
            //scope: $scope,
            targetEvent: event,
            locals: {
                editingItem: item
            }
        }).then(function (editingItem) {
            var promises = [];
            var discardStartTime = confDeliverDate = moment(new Date(editingItem[0].discountCard.startTime)).format('YYYY-MM-DD');
            var discardOverTime = confDeliverDate = moment(new Date(editingItem[0].discountCard.overTime)).format('YYYY-MM-DD');

            if (editingItem[0].batStartTime < discardStartTime || editingItem[0].batStartTime > discardOverTime) {
                $scope.showError("开始时间须介於卡券日期");
                return;
            }

            if (editingItem[0].batOverTime < discardStartTime || editingItem[0].batOverTime > discardOverTime) {
                $scope.showError("结束时间须介於卡券日期");
                return;
            }

            angular.forEach(editingItem, function (item) {
                var postData = {
                    "startTime": item.batStartTime,
                    "overTime": item.batOverTime
                };
                var response = DiscountChanService.modify(item.uuid, postData).success(function (data) {

                });
                promises.push(response);
            });

            $q.all(promises).then(function () {
                $scope.selectDetailAllFlag = false;
                $scope.showInfo('修改数据成功。');
                $scope.showDisChannel(item[0].discountCard);
                $scope.detailSelected = [];
                $scope.selectDetailItemCount = 0;

            });

        });
    };

});

angular.module('IOne-Production').controller('ChanUpdateController', function ($scope, Constant, $mdDialog, editingItem) {
    $scope.editingItem = editingItem;


    $scope.saveDetail = function () {
        var batStartTime = moment(new Date($scope.batStartTime)).format('YYYY-MM-DD');
        var batOverTime = moment(new Date($scope.batOverTime)).format('YYYY-MM-DD');
        angular.forEach($scope.editingItem, function (item) {
            item.batStartTime = batStartTime;
            item.batOverTime = batOverTime;

        });
        $mdDialog.hide($scope.editingItem);
    };

    $scope.cancelDlg = function () {
        $mdDialog.cancel();
    };
});

