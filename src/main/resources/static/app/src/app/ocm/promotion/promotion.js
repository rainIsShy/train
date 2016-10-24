angular.module('IOne-Production').config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/promotion', {
        controller: 'ChannelPromotionController',
        templateUrl: 'app/src/app/ocm/promotion/promotion.html'
    })
}]);

angular.module('IOne-Production').controller('ChannelPromotionController', function ($scope, ChannelPromotionService, PromotionProductService, PromotionChannelService, Constant, $mdDialog, $q) {
    $scope.pageOption = {
        sizePerPage: 10,
        currentPage: 0,
        totalPage: 100,
        totalElements: 100
    };

    $scope.selected = [];

    $scope.menuDisplayOption = {
        '101-confirm': {display: true, name: '审核', uuid: '9c72a6aa-05d5-418f-ba23-cbf12cee7d5b'},
        '102-cancelConfirm': {display: true, name: '取消审核', uuid: 'ace28639-d8b7-4e05-b5f9-680331c1248d'},
        '103-enableStatus': {display: true, name: '启用', uuid: '171bc9ce-cd16-4254-9b73-40f3db792f2b'},
        '104-disableStatus': {display: true, name: '取消启用', uuid: '6dcce17d-8943-4812-b992-0a1e370bb49c'},
        '105-delete': {display: true, name: '删除', uuid: 'cbe0e957-4609-47fa-a793-11efebd32d4b'},
        '106-query': {display: true, name: '查询', uuid: '726ad142-73bc-4c0e-8fee-4e4873c266e3'},
        '107-add': {display: true, name: '新增', uuid: 'c5b1baef-8b52-45ee-a055-87f4e88417b7'},
        '108-edit': {display: true, name: '编辑', uuid: 'aca65674-441b-4859-b1ac-bd4297c64d84'},

        '109-detailAdd': {display: true, name: '点击新增', uuid: '6066e123-a635-47fe-a2ad-7a7d700fd9a0'},
        '110-detailEdit': {display: true, name: '编辑', uuid: 'f100f38c-267f-4903-b470-dc8e00ac6c7c'},
        '111-detailDelete': {display: true, name: '删除', uuid: 'fa879963-2aa8-4a1c-b3b8-bf1514f194b0'},

        '201-batchConfirm': {display: true, name: '批量审核', uuid: '59c0c024-365e-41eb-9f2b-140420a4b7cd'},
        '202-batchCancelConfirm': {display: true, name: '批量取消审核', uuid: 'ace28639-d8b7-4e05-b5f9-680331c1248d'},
        '203-batchEnableStatus': {display: true, name: '批量启用', uuid: '38363453-a18f-4c00-a630-280bfa42262b'},
        '204-batchDisableStatus': {display: true, name: '批量取消启用', uuid: '2cf70548-c911-4ed4-9e0b-934a446b1a45'},
        '205-batchDelete': {display: true, name: '批量刪除', uuid: 'd710408e-fbba-41a6-b340-bd3398b2db15'}
    };

    $scope.getMenuAuthData($scope.RES_UUID_MAP.OCM.PROMOTION.RES_UUID).success(function (data) {
        $scope.menuAuthDataMap = $scope.menuDataMap(data);
    });


    // Check authorization
    $scope.isAuthorized = function (option) {
        if ($scope.menuDisplayOption[option].display &&
            ($scope.menuAuthDataMap[$scope.menuDisplayOption[option].uuid] ||
            $scope.isAdmin() || !$scope.menuDisplayOption[option].uuid)) {
            return true;
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

    $scope.showDeleteMenuItem = function () {
        return $scope.isAuthorized('105-delete');
    };

    $scope.showQueryButton = function () {
        return $scope.isAuthorized('106-query');
    };

    $scope.showAddButton = function () {
        return $scope.isAuthorized('107-add');
    };

    $scope.showEditButton = function () {
        return $scope.isAuthorized('108-edit');
    };

    $scope.showBatchConfirmMenuItem = function () {
        return $scope.isAuthorized('101-confirm');
    };

    $scope.showBatchCancelConfirmMenuItem = function () {
        return $scope.isAuthorized('102-cancelConfirm');
    };

    $scope.showBatchEnableStatusMenuItem = function () {
        return $scope.isAuthorized('103-enableStatus');
    };

    $scope.showBatchDisableStatusMenuItem = function () {
        return $scope.isAuthorized('104-disableStatus');
    };

    $scope.showDetailAddButton = function () {
        return $scope.isAuthorized('109-detailAdd');
    };

    $scope.showDetailEditButton = function () {
        return $scope.isAuthorized('110-detailEdit');
    };

    $scope.showDetailDeleteButton = function () {
        return $scope.isAuthorized('111-detailDelete');
    };

    $scope.showBatchMenu = function () {
        return $scope.showBatchConfirmMenuItem() || $scope.showBatchCancelConfirmMenuItem() ||
            $scope.showBatchDisableStatusMenuItem() || $scope.showBatchEnableStatusMenuItem();
    };

    $scope.canEditItem = function (item) {
        if (item !== null && item !== undefined) {
            if (item.confirm == 1 && item.status == 1) {
                return true;
            }
        }

        return false;
    };

    $scope.canDeleteItem = function (item) {
        if (item !== null && item !== undefined) {
            if (item.confirm == 1 && item.status == 1) {
                return true;
            }
        }

        return false;
    };

    $scope.canDetailAction = function (item) {
        if (item !== null && item !== undefined) {
            if (item.confirm == 1) {
                return true;
            }
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
        release: Constant.RELEASE[0].value
    };

    $scope.sortByAction = function (field) {
        $scope.sortByField = field;
        $scope.sortType = '';
    };

    $scope.refreshList = function () {
        var startQueryDate = $scope.queryDateFormat($scope.listFilterOption.startPromotionDate);
        var endQueryDate = $scope.queryDateFormat($scope.listFilterOption.endPromotionDate);

        ChannelPromotionService.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, $scope.listFilterOption.confirm, $scope.listFilterOption.status, '', '', $scope.listFilterOption.keyword, startQueryDate, endQueryDate, RES_UUID_MAP.OCM.PROMOTION.RES_UUID).success(function (data) {
            $scope.itemList = data.content;
            $scope.pageOption.totalPage = data.totalPages;
            $scope.pageOption.totalElements = data.totalElements;
        });
    };

    $scope.refreshProductList = function (item) {
        PromotionProductService.get(item.uuid).success(function (data) {
            $scope.prodList = data.content;
            // $scope.productPageOption.totalPage = data.totalPages;
            // $scope.productPageOption.totalElements = data.totalElements;
        });
    };

    $scope.refreshChannelList = function (item) {
        PromotionChannelService.get(item.uuid).success(function (data) {
            $scope.channelList = data.content;
            // $scope.productPageOption.totalPage = data.totalPages;
            // $scope.productPageOption.totalElements = data.totalElements;
        });
    };

    $scope.queryDateFormat = function (date) {
        if (date !== undefined) {
            if (date !== null) {
                var formatDate = new Date(date);
                return moment(formatDate).format('YYYY-MM-DD');
            } else {
                return null;
            }
        } else {
            return null;
        }
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

    $scope.queryAction = function () {
        $scope.refreshList();

    };

    $scope.selectAllFlag = false;

    /**
     * Show left detail panel when clicking the title
     */
    $scope.showDetailPanelAction = function (item) {
        $scope.selectedItem = item;
        //OrderDetail.get($scope.selectedItem.uuid).success(function(data) {
        //    $scope.orderDetailList = data.content;
        //});
        // item.detailList = $scope.subItemList;
        $scope.refreshProductList(item);
        $scope.refreshChannelList(item);

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
            item.detailList = $scope.subItemList;
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
        if (domain == 'OCM_PROM_MST') {
            $scope.addItem = source;
            $scope.addItem.startPromotionDate = source.startPromotionDate != null ? new Date(source.startPromotionDate) : '';
            $scope.addItem.endPromotionDate = source.endPromotionDate != null ? new Date(source.endPromotionDate) : '';
            $scope.addItem.startPurchaseDate = source.startPurchaseDate != null ? new Date(source.startPurchaseDate) : '';
            $scope.addItem.endPurchaseDate = source.endPurchaseDate != null ? new Date(source.endPurchaseDate) : '';
        } else {
            $scope.addDetailItem = source;
        }
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
        if (domain == 'OCM_PROM_MST') {
            // $scope.status = 'addMaster';
            $scope.addItem = {};
        } else if (domain == 'OCM_PROM_PRODUCT_DTL' || domain == 'OCM_PROM_CHANNEL_DTL') {
            // $scope.status = 'addDetail';
            $scope.addDetailItem = {};
        }
    };

    /**
     * Save object according current status and domain.
     */
    $scope.saveItemAction = function () {
        if ($scope.status == 'add') {
            if ($scope.domain == 'OCM_PROM_MST') {
                if ($scope.validForm()) {

                    ChannelPromotionService.getByNo($scope.addItem.no).success(function (data) {
                        if (data.totalElements > 0) {
                            $scope.showError("活动主题编号重覆!");
                        } else {
                            ChannelPromotionService.add($scope.addItem).success(function (data) {
                                $scope.refreshList();
                                $scope.showInfo("新增成功!");
                                $scope.listItemAction();
                                $scope.selectedItem = data;
                                $scope.refreshProductList($scope.selectedItem);
                            });
                        }
                    });

                }
            } else if ($scope.domain == 'OCM_PROM_PRODUCT_DTL') {
                PromotionProductService.add($scope.selectedItem.uuid, $scope.addDetailItem).success(function () {
                    $scope.refreshProductList($scope.selectedItem);
                    $scope.showInfo("新增商品成功!");
                    $scope.listItemAction();
                });
            } else if ($scope.domain == 'OCM_PROM_CHANNEL_DTL') {
                PromotionChannelService.add($scope.selectedItem.uuid, $scope.addDetailItem).success(function () {
                    $scope.refreshChannelList($scope.selectedItem);
                    $scope.showInfo("新增渠道成功!");
                    $scope.listItemAction();
                });
            }
        } else if ($scope.status == 'edit') {
            if ($scope.domain == 'OCM_PROM_MST') {
                if (!$scope.validForm()) {
                    return;
                }
                ChannelPromotionService.modify($scope.selectedItem.uuid, $scope.selectedItem).success(function () {
                    $scope.refreshList();
                    $scope.showInfo("修改成功!");
                    $scope.listItemAction();
                    $scope.selectedItem = data;
                });
            } else if ($scope.domain == 'OCM_PROM_PRODUCT_DTL') {
                PromotionProductService.modify($scope.selectedItem.uuid, $scope.addDetailItem.uuid, $scope.addDetailItem).success(function () {
                    $scope.refreshProductList($scope.selectedItem);
                    $scope.listItemAction();
                    $scope.showInfo("修改商品成功!");

                });
            } else if ($scope.domain == 'OCM_PROM_CHANNEL_DTL') {
                PromotionChannelService.modify($scope.selectedItem.uuid, $scope.addDetailItem.uuid, $scope.addDetailItem).success(function () {
                    $scope.refreshChannelList($scope.selectedItem);
                    $scope.listItemAction();
                    $scope.showInfo("修改渠道成功!");

                });
            }
        }
    };

    $scope.validForm = function () {
        var isPass = true;
        if (angular.isUndefined($scope.addItem.no) || $scope.addItem.no == '') {
            $scope.showError('請輸入活动主题编号');
            isPass = false;
        }
        if (angular.isUndefined($scope.addItem.name) || $scope.addItem.name == '') {
            $scope.showError('請輸入活动主题名称');
            isPass = false;
        }
        console.log();
        if ($scope.addItem.salePromotionDesc == '' || angular.isUndefined($scope.addItem.salePromotionDesc)) {
            $scope.showError('請輸入活动内容');
            isPass = false;
        }
        if ($scope.addItem.startPromotionDate == null) {
            $scope.showError('請輸入活动开始日期');
            isPass = false;
        }

        if ($scope.addItem.endPromotionDate == null) {
            $scope.showError('請輸入活动开始日期');
            isPass = false;
        }

        if ($scope.addItem.startPromotionDate > $scope.addItem.endPromotionDate) {
            $scope.showError('活动起始日期不可大於活动结束日期');
            isPass = false;
        }

        if ($scope.addItem.startPurchaseDate == null) {
            $scope.showError('請輸入可采购起始日期');
            isPass = false;
        }
        if ($scope.addItem.endPurchaseDate == null) {
            $scope.showError('請輸入可采购结束日期');
            isPass = false;
        }

        if ($scope.addItem.startPurchaseDate > $scope.addItem.endPurchaseDate) {
            $scope.showError('可采购起始日期不可大於可采购结束日期');
            isPass = false;
        }


        return isPass;
    };

    /**
     * Delete detail item
     */
    $scope.deleteProdDetailAction = function (detail) {
        $scope.showConfirm('确认删除吗？', '删除后不可恢复。', function () {
            if ($scope.selectedItem) {
                PromotionProductService.delete(detail.promotion.uuid, detail.uuid).success(function () {
                    $scope.refreshProductList($scope.selectedItem);
                    $scope.showInfo("刪除商品成功!");
                });
            }
        });
    };

    $scope.deleteChannelDetailAction = function (detail) {
        $scope.showConfirm('确认删除吗？', '删除后不可恢复。', function () {
            if ($scope.selectedItem) {
                PromotionChannelService.delete(detail.promotion.uuid, detail.uuid).success(function () {
                    $scope.refreshChannelList($scope.selectedItem);
                    $scope.showInfo("刪除渠道成功!");
                });
            }
        });
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

    $scope.confirmClickAction = function (event, item) {
        $scope.stopEventPropagation(event);

        if (item.confirm == '1') {
            $scope.showConfirm('确认审核吗？', '', function () {
                promotionUpdateInput = {
                    uuid: item.uuid,
                    confirm: '2'
                };
                ChannelPromotionService.modify(item.uuid, promotionUpdateInput).success(function (data) {
                    item.confirm = '2';
                    item.confirmDate = data.confirmDate;
                    $scope.refreshList();
                    $scope.showInfo("审核成功!");
                });
            });
        } else {
            $scope.showConfirm('确认取消审核吗？', '', function () {
                promotionUpdateInput = {
                    uuid: item.uuid,
                    confirm: '1',
                    confirmDate: null
                };
                ChannelPromotionService.modify(item.uuid, promotionUpdateInput).success(function (data) {
                    item.confirm = '1';
                    item.confirmDate = null;
                    $scope.refreshList();
                    $scope.showInfo("取消审核成功!");
                });
            });
        }
    };

    $scope.statusClickAction = function (event, item) {
        $scope.stopEventPropagation(event);
        if (item.status == '2') {
            $scope.showConfirm('确认启用吗？', '', function () {
                var promotionUpdateInput = {
                    uuid: item.uuid,
                    status: '1'
                };
                ChannelPromotionService.modify(item.uuid, promotionUpdateInput).success(function () {
                    item.status = '1';
                    $scope.refreshList();
                    $scope.showInfo("启用成功!");
                });
            });
        } else {
            $scope.showConfirm('确认取消启用吗？', '', function () {
                var promotionUpdateInput = {
                    uuid: item.uuid,
                    status: '2'
                };
                ChannelPromotionService.modify(item.uuid, promotionUpdateInput).success(function () {
                    item.status = '2';
                    $scope.refreshList();
                    $scope.showInfo("取消启用成功!");
                });
            });
        }

    };

    $scope.releaseClickAction = function (event, item) {
        $scope.stopEventPropagation(event);
        console.info('release...');
        //TODO ...
    };

    $scope.deleteClickAction = function (event, item) {
        $scope.stopEventPropagation(event);
        $scope.showConfirm('确认删除吗？', '删除后不可恢复。', function () {
            if ($scope.selectedItem) {
                ChannelPromotionService.delete(item.uuid).success(function () {
                    $scope.refreshList();

                    $scope.showInfo("刪除促销活动成功!");
                    $scope.selectedItem = null
                });
            }
        });
    };

    $scope.confirmAllClickAction = function (event) {
        if ($scope.selected.length > 0) {
            $scope.showConfirm('确认批量启用吗？', '', function () {
                var promotionUpdateInput = {
                    confirm: '2'
                };
                if ($scope.selected) {
                    var promises = [];
                    angular.forEach($scope.selected, function (item) {
                        var response = ChannelPromotionService.modify(item.uuid, promotionUpdateInput).success(function () {
                        });
                        promises.push(response);
                    });
                    $q.all(promises).then(function () {
                        $scope.showInfo('审核启用成功。');
                        $scope.refreshList();
                        $scope.selectItemCount = 0;
                        $scope.selected = [];
                    });
                }
            });
        }
    };

    $scope.unConfirmAllClickAction = function (event) {
        $scope.stopEventPropagation(event);
        if ($scope.selected.length > 0) {
            $scope.showConfirm('确认批量启用吗？', '', function () {
                var promotionUpdateInput = {
                    confirm: '1'
                };
                if ($scope.selected) {
                    var promises = [];
                    angular.forEach($scope.selected, function (item) {
                        var response = ChannelPromotionService.modify(item.uuid, promotionUpdateInput).success(function () {
                        });
                        promises.push(response);
                    });
                    $q.all(promises).then(function () {
                        $scope.showInfo('取消审核成功。');
                        $scope.refreshList();
                        $scope.selectItemCount = 0;
                        $scope.selected = [];
                    });
                }
            });
        }
    };

    $scope.statusAllClickAction = function (event) {
        $scope.stopEventPropagation(event);
        if ($scope.selected.length > 0) {
            $scope.showConfirm('确认批量启用吗？', '', function () {
                var promotionUpdateInput = {
                    status: '1'
                };
                if ($scope.selected) {
                    var promises = [];
                    angular.forEach($scope.selected, function (item) {
                        var response = ChannelPromotionService.modify(item.uuid, promotionUpdateInput).success(function () {
                        });
                        promises.push(response);
                    });
                    $q.all(promises).then(function () {
                        $scope.showInfo('批量启用成功。');
                        $scope.refreshList();
                        $scope.selectItemCount = 0;
                        $scope.selected = [];
                    });
                }
            });
        }
    };


    $scope.releaseAllClickAction = function (event) {
        $scope.stopEventPropagation(event);
        if ($scope.selected.length > 0) {
            $scope.showConfirm('确认批量取消启用吗？', '', function () {
                var promotionUpdateInput = {
                    status: '2'
                };
                if ($scope.selected) {
                    var promises = [];
                    angular.forEach($scope.selected, function (item) {
                        var response = ChannelPromotionService.modify(item.uuid, promotionUpdateInput).success(function () {
                        });
                        promises.push(response);
                    });
                    $q.all(promises).then(function () {
                        $scope.showInfo('批量取消启用成功。');
                        $scope.refreshList();
                        $scope.selectItemCount = 0;
                        $scope.selected = [];
                    });
                }
            });
        }
    };

    $scope.deleteAllClickAction = function (event) {
        $scope.stopEventPropagation(event);
        if ($scope.selected.length > 0) {
            $scope.showConfirm('确认删除吗？', '删除后不可恢复。', function () {
                if ($scope.selected) {
                    var promises = [];
                    angular.forEach($scope.selected, function (item) {
                        var response = ChannelPromotionService.delete(item.uuid).success(function (data) {
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
        angular.forEach($scope.itemList, function (item) {
            if ($scope.selectAllFlag) {
                item.selected = true;
            } else {
                item.selected = false;
            }
        })
    };

    $scope.openItemDlg = function () {
        $mdDialog.show({
            controller: 'PromotionItemSelectController',
            templateUrl: 'app/src/app/ocm/promotion/selectItems.html',
            parent: angular.element(document.body),
            targetEvent: event,
            locals: {}
        }).then(function (data) {
            $scope.addDetailItem.item = data;
            $scope.addDetailItem.itemUuid = data.uuid;
        });
    };

    $scope.openChannelDlg = function () {
        $mdDialog.show({
            controller: 'PromotionChannelSelectController',
            templateUrl: 'app/src/app/ocm/promotion/selectChannel.html',
            parent: angular.element(document.body),
            targetEvent: event,
            locals: {}
        }).then(function (data) {
            $scope.addDetailItem.channel = data;
            $scope.addDetailItem.channelUuid = data.uuid;

        });
    };
});


angular.module('IOne-Production').controller('PromotionItemSelectController', function ($scope, $q, $mdDialog, Production) {
    $scope.pageOption = {
        sizePerPage: 10,
        currentPage: 0,
        totalPage: 0,
        totalElements: 0
    };

    $scope.refreshData = function () {
        Production.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, 2, 2, 1, '', '', $scope.searchNo, $scope.searchName, RES_UUID_MAP.OCM.PROMOTION.RES_UUID).success(function (data) {
            $scope.allData = data;
            $scope.pageOption.totalElements = data.totalElements;
            $scope.pageOption.totalPage = data.totalPages;
        });
    };

    $scope.refreshData();

    $scope.selectData = function (item) {
        $mdDialog.hide(item);
    };

    $scope.hideDlg = function () {
        $mdDialog.hide();
    };

    $scope.cancelDlg = function () {
        $mdDialog.cancel();
    };

});

angular.module('IOne-Production').controller('PromotionChannelSelectController', function ($scope, $q, $mdDialog, ChannelService) {
    $scope.pageOption = {
        sizePerPage: 10,
        currentPage: 0,
        totalPage: 0,
        totalElements: 0
    };

    $scope.refreshChannel = function () {
        ChannelService.getAllGlobalQuery($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, 0, 0, $scope.searchKeyword).success(function (data) {
            $scope.allChannel = data;
            $scope.pageOption.totalElements = data.totalElements;
            $scope.pageOption.totalPage = data.totalPages;
        });
    };

    $scope.refreshChannel();

    $scope.selectData = function (item) {
        $mdDialog.hide(item);
    };


    $scope.hideDlg = function () {
        $mdDialog.hide();
    };

    $scope.cancelDlg = function () {
        $mdDialog.cancel();
    };

});
