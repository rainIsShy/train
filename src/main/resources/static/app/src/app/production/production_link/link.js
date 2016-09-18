angular.module('IOne-Production').config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/production-link', {
        controller: 'ProductionLinkController',
        templateUrl: 'app/src/app/production/production_link/link.html'
    })
}]);

angular.module('IOne-Production').filter('itemsInCatalogue', function() {
    return function(linkData) {
        var result = [];

        angular.forEach(linkData, function(value) {
        })
    }
});

angular.module('IOne-Production').controller('ProductionLinkController', function ($scope, Catalogue, CatalogueTemplate, Constant, ProductionCatalogueDetails, $mdDialog, $timeout, $q) {

    $scope.listFilterOption = {
        status :  Constant.STATUS[0].value,
        confirm : Constant.CONFIRM[0].value,
        release : Constant.RELEASE[0].value,
        prodType : Constant.PROD_TYPE[0].value
    };

    $scope.$watch('listFilterOption', function() {
        $scope.refreshAllTemplate();
    }, true);

    $scope.listFilterDisplayOption = {
        showStatusFilterMenu : true,
        showConfirmFilterMenu : true,
        showReleaseFilerMenu : true,
        showProdTypeFilterMenu : false
    };
    $scope.formMenuDisplayOption = {
        '100-add': {display: true, name: '新增', uuid: '5B0C4134-94B9-49AD-9910-857FDE94C1E4'},
        '101-delete': {display: false, name: '删除', uuid: '2CB9DB1A-C12F-487F-8FD3-B299B8DDE675'},
        '102-edit': {display: true, name: '编辑', uuid: 'E86C6155-8DAC-40C4-90C4-531FE49E23DC'},
        '103-copy': {display: false, name: '复制', uuid: '5471D690-BF92-44AE-889F-291E7ABE443C'},
        '104-status': {display: true, name: '启用', uuid: 'C4FB55D6-8293-41B8-9A16-CB2BC851E1AC'},
        '105-confirm': {display: true, name: '审核', uuid: 'AC193DD9-EAC8-4BBE-AD1B-E1DFBB062DD9'},
        '106-release': {display: true, name: '发布', uuid: '2ACE4698-8EF8-4A55-B668-45601CA95013'},
        '107-change': {display: true, name: '生成关联', uuid: 'ac1964cf-fffb-44ac-ac3b-5d58ad437785'},

        '200-cancel': {display: true, name: '取消新增', uuid: 'ADD763EE-0F54-4AB7-B79D-DBA7FA46B0A3'},
        '201-save': {display: true, name: '保存', uuid: '63235E5A-2240-4631-B876-6774C773F5BE'},

        '300-add': {display: false, name: '新增数据', uuid: '570DD5D6-2070-4E2C-979F-05DB01744E98'},
        '301-delete': {display: true, name: '删除数据', uuid: '9CA7007B-9936-4BBC-945B-D98D0DC472F7'},
        '302-save': {display: false, name: '保存', uuid: '56180CAC-C289-4A3C-A894-E3F35A5E6C81'},
        '303-cancel': {display: false, name: '取消修改', uuid: '0E5A36EC-C2BE-4617-988E-BEE2FF7E39C5'},
        '304-quit': {display: true, name: '退出编辑', uuid: '02BB4D61-A764-4591-912E-5B33EDED7B79'}
    };

    $scope.deleteNodeDisabled = true;

    $scope.pageOption = {
        sizePerPage: 10000,
        currentPage: 0,
        totalPage: 0,
        totalElements: 0
    };

    $scope.pageOptionForProd = {
        sizePerPage: 36,
        currentPage: 0,
        totalPage: 0,
        totalElements: 0
    };

    $scope.itemSearchParam = {
        confirm: 0,
        release: 2,
        status: 0,
        eshopType: 0,
        assemblingFlag: ''
    };

    //Start from node2.
    //{
    // templateUuid: [node1data, node2data, node3data, ...],
    // templateUuid: [node1data, node2data, node3data, ...]
    //}
    $scope.selectedTemplateData = {};

    $scope.nodeDataClickHandler = function($event) {
        if($event && $event.stopPropagation) {
            $event.stopPropagation();
        }
        if($event && $event.preventDefault) {
            $event.preventDefault();
        }
    };

    $scope.nodeDataChangeHandler = function(template, node, nodeDataList, nodeDataUuid) {
        if($scope.isRefreshing) {
            return;
        }
        $scope.selectedItem = template;
        //Delete all sub data of current node
        $scope.selectedTemplateData[template.uuid].splice(node.index + 1);
        $scope.selectedTemplateNode = node;
        $scope.selectedTemplateNodeDataUuid = nodeDataUuid;

        angular.forEach(nodeDataList, function(item) {
            if(item.uuid == nodeDataUuid) {
                item.selected = true;
                $scope.selectedTemplateNodeData = item;
            } else {
                item.selected = false;
            }
        });

        $scope.refreshUI(template);
        $scope.refreshProduction(nodeDataUuid);

        var nextNode = template.details[node.index + 1];

        //Already the last node
        if(nextNode == undefined || nextNode == undefined) {

        } else {
            $scope.isRefreshing = true;
            Catalogue.get(nextNode.uuid, nodeDataUuid).success(function(data) {
                if(data && data.content && data.content.length > 0) {
                    $scope.selectedTemplateData[template.uuid].push(data.content);
                }
                $scope.isRefreshing = false;
            }).error(function() {
                $scope.isRefreshing = false;
            });
        }
    };

    $scope.refreshUI = function(template) {
        $scope.selectedTemplateNodeDataUI[template.uuid] = {};

        angular.forEach(template.details, function(item) {
            $scope.selectedTemplateNodeDataUI[template.uuid][item.index] = item.name;

            if($scope.selectedTemplateData[template.uuid][item.index]) {
                angular.forEach($scope.selectedTemplateData[template.uuid][item.index], function(data) {
                    if(angular.isDefined(data.selected) && data.selected) {
                        $scope.selectedTemplateNodeDataUI[template.uuid][item.index] = data.name;
                    }
                });
            }
        })
    };

    $scope.searchQuery = {
        no: '',
        name: ''
    };

    $scope.refreshProduction = function(catalogueUuid) {
        ProductionCatalogueDetails.getByCatalogue(catalogueUuid,
            $scope.pageOptionForProd.sizePerPage,
            $scope.pageOptionForProd.currentPage,
            $scope.searchQuery.no,
            $scope.searchQuery.name,
            $scope.RES_UUID_MAP.PRODUCTION.PRODUCTION_LINK.LIST_PAGE.RES_UUID
        ).success(function(data) {
            $scope.linkData = data;
            $scope.pageOptionForProd.totalPage = data.totalPages;
            $scope.pageOptionForProd.totalElements = data.totalElements;
        });
    };

    //Refresh the data of one template
    $scope.refreshTemplateData = function(template, node) {
        //Refresh only when there is data for this template
        if(template && template.details && template.details.length > 0) {

            var dataHandler = function(template, node, data) {
                angular.forEach(data, function(item) {
                    item.catalogueTemplateDetail.index = node.index;
                });
                //template object
                var content = $scope.selectedTemplateData[template.uuid];
                if(content == undefined || content == null){
                    content = [data];
                    $scope.selectedTemplateData[template.uuid] = content;
                    $scope.refreshUI(template);
                }
            };

            //Get the first node data
            Catalogue.getForRoot(node.uuid).success(function(data) {
                dataHandler(template, node, data.content);
            });

        }
    };

    //Refresh Template
    $scope.refreshAllTemplate = function() {
        CatalogueTemplate.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, $scope.listFilterOption.status, $scope.listFilterOption.confirm, $scope.listFilterOption.release).success(function(data) {
            $scope.catalogueTemplates = data;
            $scope.pageOption.totalPage = data.totalPages;
            $scope.pageOption.totalElements = data.totalElements;

            var setFirstOpen = false;

            if(data && data.content) {
                $scope.selectedTemplateData = {};
                $scope.selectedTemplateNodeDataUI = {};
                angular.forEach(data.content, function(content) {

                    if(content && content.details) {
                        //display them all by default.
                        content.display = true;
                        content.open = false;

                        content.dataStatus = content.dataStatus == null ? 2 : 1;
                        content.dataConfirm = content.dataConfirm == null ? 1 : 2;
                        content.dataRelease = content.dataRelease == null ? 1 : 2;

                        //Put a index in the node to easy the use of mdChips
                        angular.forEach(content.details, function(node, index) {
                            node.index = index;
                        });

                        //Open the first one by default.
                        if(content.details.length > 0) {
                            if(setFirstOpen == false) {
                                content.open = true;
                                setFirstOpen = true;
                            }
                            //Get the data of first root node
                            $scope.refreshTemplateData(content, content.details[0]);
                        }
                    }
                });
            }
        });

        $scope.selectedItem = null;
        $scope.selectedTemplateNode = null;
        $scope.selectedTemplateNodeData = null;
        $scope.selectedTemplateNodeDataUuid = null;
    };

    $scope.listTabSelected = function() {
        $scope.refreshAllTemplate();
        $scope.changeViewStatus(Constant.UI_STATUS.VIEW_UI_STATUS, 0);
    };

    $scope.formTabSelected = function() {
        $scope.getMenuAuthData($scope.RES_UUID_MAP.PRODUCTION.PRODUCTION_LINK.FORM_PAGE.RES_UUID).success(function(data) {
            $scope.menuAuthDataMap = $scope.menuDataMap(data);
        });
    };

    $scope.editItem = function($event, item) {
        if($scope.selectedItem && item.uuid != $scope.selectedItem.uuid) {
            $scope.linkData = null;
            $scope.selectedTemplateNode = null;
            $scope.selectedTemplateNodeData = null;
            $scope.selectedTemplateNodeDataUuid = '';
        }

        $scope.selectedItem = item;
        $scope.selectedLinkItem = null;
        $scope.changeViewStatus(Constant.UI_STATUS.PRE_EDIT_UI_STATUS, 1);
    };

    $scope.addCatalogueDetail = function(production) {
        if (production && $scope.selectedTemplateNogdeData) {
            ProductionCatalogueDetails.addLink($scope.selectedTemplateNodeData.uuid, production.uuid).success(function(data){
                $scope.showInfo('新增商品关联成功。');

                if($scope.linkData == null) {
                    $scope.linkData = {
                        content: []
                    }
                }
                $scope.linkData.content.push(data);
                production.display = false;
            });
        }
    };

    $scope.deleteCatalogueDetail = function(production) {
        $scope.showConfirm('确认删除吗？', '删除的数据不可恢复。', function() {
            if(production) {
                ProductionCatalogueDetails.delete(production.uuid).success(function(){
                    $scope.linkData.content.splice($scope.linkData.content.indexOf(production), 1);
                    $scope.pageOptionForProd.totalElements--;
                    $scope.deleteNodeDisabled = true;
                    $scope.showInfo('删除数据成功。');
                });
            }
        });
    };

    $scope.exitModifyMenuAction = function() {
        $scope.changeViewStatus($scope.UI_STATUS.PRE_EDIT_UI_STATUS, 1);
    };

    $scope.selectProductionInLink = function(production) {
        angular.forEach($scope.linkData.content, function(value, index) {
            value.selected = false;
        });

        production.selected = true;
        $scope.selectedLinkItem = production;
        $scope.deleteNodeDisabled = false;
    };

    $scope.deleteNodeMenuAction = function() {
        if($scope.selectedLinkItem) {
            $scope.deleteCatalogueDetail($scope.selectedLinkItem);
        }
    };

    $scope.preAddMenuAction = function() {
        $mdDialog.show({
            controller: 'AddNewController',
            templateUrl: 'app/src/app/production/production_link/addNewDlg.html',
            parent: angular.element(document.body),
            targetEvent: event,
            locals: {
                catalogueTemplates: $scope.catalogueTemplates
            }
        }).then(function(data) {
            $scope.selectedItem = data;
            //Get the data of first root node
            $scope.refreshTemplateData($scope.selectedItem, $scope.selectedItem.details[0]);
            $scope.refreshUI($scope.selectedItem);
            $scope.changeViewStatus(Constant.UI_STATUS.EDIT_UI_STATUS_MODIFY, 1);
        });
    };

    $scope.changeMenuAction = function () {
        var catalogueUuidArray = [];

        //取得該目錄樹下的所有目錄uuid
        angular.forEach($scope.selectedTemplateData[$scope.selectedItem.uuid], function (catalogueList) {
            angular.forEach(catalogueList, function (catalogue) {
                console.log(catalogue.name);
                catalogueUuidArray.push(catalogue.uuid);
            });
        });


        var promises = [];
        for (var i = 0; i < catalogueUuidArray.length; i++) {
            console.log(catalogueUuidArray[i]);
            var response = ProductionCatalogueDetails.autoRelate(catalogueUuidArray[i]).success(function (data) {
                console.log(data);
            });
            promises.push(response);
        }
        $q.all(promises).then(function () {
            $scope.showInfo('关联成功');
        });


    };

    //Set menu names
    $scope.$watch('selectedLinkItem', function() {
        if($scope.selectedLinkItem) {
            if ($scope.selectedLinkItem.status == '1') {
                $scope.formMenuDisplayOption['104-status'].name = '禁用';
            } else if ($scope.selectedLinkItem.status == '2') {
                $scope.formMenuDisplayOption['104-status'].name = '启用';
            }

            if ($scope.selectedLinkItem.confirm == '1') {
                $scope.formMenuDisplayOption['105-confirm'].name = '审核';
            } else if ($scope.selectedLinkItem.confirm == '2') {
                $scope.formMenuDisplayOption['105-confirm'].name = '反审核';
            }

            if ($scope.selectedLinkItem.release == '1') {
                $scope.formMenuDisplayOption['106-release'].name = '发布';
            } else if ($scope.selectedLinkItem.release == '2') {
                $scope.formMenuDisplayOption['106-release'].name = '反发布';
            }
        }
    }, true);

    $scope.handler = function(field, value) {
        if($scope.selectedLinkItem && $scope.selectedLinkItem[field]) {
            $scope.selectedLinkItem[field] = value;
            ProductionCatalogueDetails.modify($scope.selectedLinkItem.uuid, $scope.selectedLinkItem).success(function() {
                $scope.showInfo('修改数据成功。');
            });
        }
    };
    $scope.statusMenuAction = function() {
        if($scope.selectedLinkItem) {
            $scope.selectedLinkItem.status == '1' ? $scope.handler('status', '2') : $scope.handler('status', '1');
        } else {
            $scope.showWarn("请选择一个已关联商品。");
        }
    };
    $scope.confirmMenuAction = function() {
        if($scope.selectedLinkItem) {
            if($scope.selectedLinkItem.confirm == '2' && $scope.selectedLinkItem.release == 2) {
                $scope.showWarn('已发布的数据不能取消审核。');
                return;
            }
            $scope.selectedLinkItem.confirm == '1' ? $scope.handler('confirm', '2') : $scope.handler('confirm', '1');
        } else {
            $scope.showWarn("请选择一个已关联商品。");
        }
    };
    $scope.releaseMenuAction = function() {
        if($scope.selectedLinkItem) {
            if($scope.selectedLinkItem.release == '1' && $scope.selectedLinkItem.confirm == 1) {
                $scope.showWarn('未审核的数据不能发布。');
                return;
            }
            $scope.selectedLinkItem.release == '1' ? $scope.handler('release', '2') : $scope.handler('release', '1');
        } else {
            $scope.showWarn("请选择一个已关联商品。");
        }
    };

    $scope.openQuickView = function($event, production) {
        $mdDialog.show({
            controller: 'QuickViewController',
            templateUrl: 'app/src/app/production/production/quick_view.html',
            parent: angular.element(document.body),
            targetEvent: event,
            locals: {
                productionUuid: production.uuid
            }
        }).then(function(data) {

        });

        $event.stopPropagation();
        $event.preventDefault();
    };
});

angular.module('IOne-Production').controller('AddNewController', function($scope, $mdDialog, catalogueTemplates) {
    $scope.catalogueTemplates = catalogueTemplates;

    $scope.hideDlg = function(index) {
        $mdDialog.hide($scope.catalogueTemplates.content[index]);
    };

    $scope.cancelDlg = function() {
        $mdDialog.cancel();
    };
});