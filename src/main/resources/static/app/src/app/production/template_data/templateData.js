angular.module('IOne-Production').config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/catalogue-data', {
        controller: 'CatalogueDataController',
        templateUrl: 'app/src/app/production/template_data/templateData.html'
    })
}]);

angular.module('IOne-Production').controller('CatalogueDataController', function ($scope, CatalogueTemplate, Catalogue, ProductionCatalogueDetails, CatalogueTagService, Constant, $mdDialog, Upload, $timeout) {
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
        '100-add': {display: true, name: '新增', uuid: '48C4F8B0-3881-4167-B043-B7D8A9537547'},
        '101-delete': {display: true, name: '删除', uuid: 'F116804B-600C-405F-AEC9-F9667D1845D0'},
        '102-edit': {display: true, name: '编辑', uuid: 'D7C3747E-6604-4113-8CC2-DF5A2EAB5F70'},
        '103-copy': {display: false, name: '复制', uuid: '73BED5D4-6858-44B9-92EF-D9EE1E9EED89'},
        '104-status': {display: true, name: '启用', uuid: '5122C79B-DC78-4E1F-8945-35394D1F4200'},
        '105-confirm': {display: true, name: '审核', uuid: '303BF9B5-079E-4970-8269-CC5FC2D5222D'},
        '106-release': {display: true, name: '发布', uuid: '43420AA2-F2FB-4676-A3D3-96A732D076FA'},

        '200-cancel': {display: true, name: '取消新增', uuid: 'A8E3B147-B890-47F7-8131-5DA261A34C1C'},
        '201-save': {display: true, name: '保存', uuid: 'E6051673-5316-4CC4-9208-24A5BE671E8F'},

        '300-add': {display: true, name: '新增数据', uuid: '82DB999C-0155-40C8-9B96-01C3DD428804'},
        '301-delete': {display: true, name: '删除数据', uuid: '46F359CF-8331-42DC-8D48-24B631FBB0D4'},
        '302-save': {display: true, name: '保存', uuid: '13CFCD62-2FE4-4E3D-A352-F32814B21880'},
        '303-cancel': {display: true, name: '取消修改', uuid: '4B958029-E637-4B22-B30F-94AAE55EA680'},
        '304-quit': {display: true, name: '退出编辑', uuid: 'D7BAA884-3F9C-4165-BF58-C22C2C69259A'}
    };

    $scope.pageOption = {
        sizePerPage: 10000,
        currentPage: 0,
        totalPage: 100,
        totalElements: 100
    };

    //Disable add and modify node when no data selected.
    $scope.$watch('selectedTemplateNodeData', function() {
        if($scope.selectedTemplateNodeData == null) {
            $scope.addNodeDisabled = true;
            $scope.deleteNodeDisabled = true;
        } else {
            $scope.addNodeDisabled = false;
            $scope.deleteNodeDisabled = false;
        }
    });

    $scope.$watchCollection('[backupNodeData, selectedTemplateNodeData]', function() {
        if($scope.backupNodeData == null || $scope.selectedTemplateNodeData == null) {
            $scope.cancelModifyDisabled = true;
        } else {
            $scope.cancelModifyDisabled = false;
        }
    });

    //Start from node2.
    //{
    // templateUuid: [node1data, node2data, node3data, ...],
    // templateUuid: [node1data, node2data, node3data, ...]
    //}
    $scope.selectedTemplateData = {};

    $scope.nodeDataClickHandler = function(template, node, nodeDataList, nodeData) {
        if($scope.isRefreshing) {
            return;
        }
        //Delete all sub data of current node
        $scope.selectedTemplateData[template.uuid].splice(node.index + 1);
        //Set current one as selected.
        angular.forEach(nodeDataList, function(data) {
            data.selected = false;
        });
        nodeData.selected = true;
        $scope.selectedTemplateNode = node;
        $scope.selectedTemplateNodeData = nodeData;

        $scope.backupNodeData = Catalogue.backup(nodeData);

        var nextNode = template.details[node.index + 1];

        //Already the last node
        if(nextNode == undefined || nextNode == undefined) {
            return;
        } else {
            $scope.isRefreshing = true;
            Catalogue.get(nextNode.uuid, nodeData.uuid).success(function(data) {
                if(data && data.content && data.content.length > 0) {
                    $scope.selectedTemplateData[template.uuid].push(data.content);
                }
                $scope.isRefreshing = false;
            }).error(function() {
                $scope.isRefreshing = false;
            });
        }

        $scope.getCatalogueTags($scope.selectedTemplateNodeData.uuid);
    };

    //Refresh the data of one template
    $scope.refreshTemplateData = function(template, node) {
        //Refresh only when there is data for this template
        if(template && template.details && template.details.length > 0) {

            var dataHandler = function(template, node, data) {
                //template object
                var content = $scope.selectedTemplateData[template.uuid];
                if(content == undefined || content == null){
                    content = [data];
                    $scope.selectedTemplateData[template.uuid] = content;
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
        CatalogueTemplate.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, $scope.listFilterOption.status, $scope.listFilterOption.confirm, $scope.listFilterOption.release, true).success(function(data) {
            $scope.catalogueTemplates = data;
            $scope.pageOption.totalPage = data.totalPages;
            $scope.pageOption.totalElements = data.totalElements;

            var setFirstOpen = false;

            if(data && data.content) {
                $scope.selectedTemplateData = {};
                angular.forEach(data.content, function(content) {

                    if(content && content.details) {
                        //display them all by default.
                        content.display = true;
                        content.open = false;

                        content.dataStatus = (content.dataStatus == null ? '2' : content.dataStatus);
                        content.dataConfirm = (content.dataConfirm == null ? '1' : content.dataConfirm);
                        content.dataRelease = (content.dataRelease == null ? '1' : content.dataRelease);

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
    };

    //add node data
    $scope.addNodeData = function(template, templateNode) {
        $mdDialog.show({
            controller: 'DialogController',
            templateUrl: 'app/src/app/production/template_data/addNodeData.html',
            parent: angular.element(document.body),
            targetEvent: event
        }).then(function(data) {
            var newTemplateNodeData = {
                no: data.no,
                name: data.name,
                templateDetailUuid: templateNode.uuid
            };

            //Set parent Uuid.
            if(templateNode.parentUuid) {
                angular.forEach($scope.selectedTemplateData[template.uuid][templateNode.index - 1], function(item, index) {
                    if(item.selected) {
                        newTemplateNodeData.parentUuid = item.uuid;
                    }
                });
            }
            Catalogue.add(newTemplateNodeData).success(function(data) {
                $scope.selectedTemplateData[template.uuid][templateNode.index] = $scope.selectedTemplateData[template.uuid][templateNode.index] || [];
                $scope.selectedTemplateData[template.uuid][templateNode.index].push(data);
                $scope.changeViewStatus($scope.UI_STATUS.EDIT_UI_STATUS_MODIFY, 1);

                $scope.nodeDataClickHandler(template, templateNode, $scope.selectedTemplateData[template.uuid][templateNode.index], data);
                $scope.showInfo('新增节点数据成功。');
            });
        });
    };

    $scope.deleteNodeData = function($event, templateNodeDataList, index, templateNodeData, templateNode) {
        //Check if there are production in the catalogue first.
        ProductionCatalogueDetails.getByCatalogue(templateNodeData.uuid, 1, 0).success(function(data) {
            if(data.content.length == 0) {
                $scope.showConfirm('确认清除该节点数据吗？', '节点数据删除后不可恢复。', function() {
                    Catalogue.delete(templateNodeData.uuid).success(function() {
                        templateNodeDataList.splice(index, 1);  //Delete from client cache.
                        $scope.selectedTemplateData[$scope.selectedItem.uuid].splice(templateNode.index + 1); //Delete all children
                        $scope.selectedTemplateNodeData = null;
                        $scope.backupNodeData = null;

                        $scope.showInfo('删除节点数据成功。');
                    }).error(function() {
                        $scope.showError('删除节点数据失败，请确保该节点下没有关联的商品。');
                    });
                });
            } else {
                $scope.showWarn('不可以删除存在关联商品的目录。');
            }
        });

        $event.stopPropagation();
        $event.preventDefault();
    };

    $scope.listTabSelected = function() {
        $scope.refreshAllTemplate();
        $scope.changeViewStatus(Constant.UI_STATUS.VIEW_UI_STATUS, 0);
    };

    $scope.formTabSelected = function() {
        $scope.getMenuAuthData($scope.RES_UUID_MAP.PRODUCTION.TEMPLATE_DATA.FORM_PAGE.RES_UUID).success(function(data) {
            $scope.menuAuthDataMap = $scope.menuDataMap(data);
        });
    };

    $scope.editItem = function($event, item) {
        $scope.selectedItem = item;
        $scope.selectedTemplateNode = null;
        $scope.backupNodeData = null;

        if($scope.selectedTemplateNodeData) {
            $scope.selectedTemplateNodeData.selected = false;
            $scope.selectedTemplateNodeData = null;
        }
        $scope.changeViewStatus(Constant.UI_STATUS.PRE_EDIT_UI_STATUS, 1);
    };

    $scope.toggleItem = function($event, template) {
        template.open = !template.open;

        $event.stopPropagation();
        $event.preventDefault();
    };

    $scope.preAddMenuAction = function() {
        $mdDialog.show({
            controller: 'TemplateSelectController',
            templateUrl: 'app/src/app/production/template_data/templateList.html',
            parent: angular.element(document.body),
            targetEvent: event,
            locals: {
                catalogueTemplates: $scope.catalogueTemplates,
                selectedTemplateData: $scope.selectedTemplateData
            }
        }).then(function(data) {
            $scope.selectedItem = data;
            $scope.selectedItem.open = true;
            $scope.refreshTemplateData(data, data.details[0]);
            $scope.selectedTemplateNode = null;
            $scope.selectedTemplateNodeData = null;
            $scope.backupNodeData = null;
            $scope.changeViewStatus(Constant.UI_STATUS.EDIT_UI_STATUS_MODIFY, 1);
        });
    };

    $scope.cancelAddMenuAction = function() {
        $scope.listTabSelected();
    };

    $scope.modifyMenuAction = function() {
        if($scope.selectedTemplateNodeData) {
            Catalogue.modify($scope.selectedTemplateNodeData).success(function() {
                $scope.backupNodeData = null;
                $scope.showInfo('修改节点数据成功。');
            })
        }
    };

    //Set menu names
    $scope.$watch('selectedItem', function() {
        if($scope.selectedItem) {
            if ($scope.selectedItem.dataStatus == '1') {
                $scope.formMenuDisplayOption['104-status'].name = '禁用';
            } else if ($scope.selectedItem.dataStatus == '2') {
                $scope.formMenuDisplayOption['104-status'].name = '启用';
            }

            if ($scope.selectedItem.dataConfirm == '1') {
                $scope.formMenuDisplayOption['105-confirm'].name = '审核';
            } else if ($scope.selectedItem.dataConfirm == '2') {
                $scope.formMenuDisplayOption['105-confirm'].name = '反审核';
            }

            if ($scope.selectedItem.dataRelease == '1') {
                $scope.formMenuDisplayOption['106-release'].name = '发布';
            } else if ($scope.selectedItem.dataRelease == '2') {
                $scope.formMenuDisplayOption['106-release'].name = '反发布';
            }
        }
    }, true);

    $scope.modifyFromPanelHandler = function() {
        CatalogueTemplate.modify($scope.selectedItem).success(function() {
            $scope.showInfo('修改模板数据成功。');
        }).error(function(data) {
            $scope.showError(data.content);
            $scope.cancelModifyMenuAction();
        });
    };

    $scope.handler = function(field, value) {
        if($scope.selectedItem && $scope.selectedItem[field]) {
            $scope.selectedItem[field] = value;
            $scope.modifyFromPanelHandler();
        }
    };
    $scope.statusMenuAction = function() {
        $scope.selectedItem.dataStatus == '1' ? $scope.handler('dataStatus', '2') : $scope.handler('dataStatus', '1');
    };
    $scope.confirmMenuAction = function() {
        $scope.selectedItem.dataConfirm == '1' ? $scope.handler('dataConfirm', '2') : $scope.handler('dataConfirm', '1');
    };
    $scope.releaseMenuAction = function() {
        $scope.selectedItem.dataRelease == '1' ? $scope.handler('dataRelease', '2') : $scope.handler('dataRelease', '1');
    };

    $scope.cancelModifyMenuAction = function() {
        $scope.selectedTemplateNodeData = Catalogue.recover($scope.selectedTemplateNodeData, $scope.backupNodeData);
    };

    $scope.exitModifyMenuAction = function() {
        $scope.cancelModifyMenuAction();
        $scope.changeViewStatus($scope.UI_STATUS.PRE_EDIT_UI_STATUS, 1);
    };

    $scope.deleteNodeMenuAction = function($event) {
        if($scope.selectedTemplateNodeData) {
            var selectedTemplateDataList = $scope.selectedTemplateData[$scope.selectedItem.uuid][$scope.selectedTemplateNode.index];
            var index = -1;

            angular.forEach(selectedTemplateDataList, function(item, idx) {
                if($scope.selectedTemplateNodeData == item) {
                    index = idx;
                }
            });

            if(index != -1) {
                $scope.deleteNodeData($event, $scope.selectedTemplateData[$scope.selectedItem.uuid][$scope.selectedTemplateNode.index], index, $scope.selectedTemplateNodeData, $scope.selectedTemplateNode);
            }

        } else {
            $scope.showWarn('请先选择一个节点数据。');
        }
    };

    $scope.addNodeMenuAction = function($event) {
        $scope.addNodeData($scope.selectedItem, $scope.selectedTemplateNode);
    };

    $scope.deleteMenuAction = function() {
        $scope.showConfirm('确认清除整个模板数据吗？', '模板数据删除后不可恢复。', function() {
            CatalogueTemplate.clearData($scope.selectedItem.uuid).success(function() {
                $scope.showInfo('清除模板数据成功。');
            });
        });
    };

    $scope.uploadImage = function(files) {
        $scope.progress = {value: 0};

        if (files && files.length) {
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                Upload.upload({
                    url: Constant.BACKEND_BASE + '/files',
                    fields: {
                    },
                    file: file
                }).progress(function (evt) {
                    $scope.progress.value = Math.min(100, parseInt(99.0 * evt.loaded / evt.total));
                }).success(function (data) {
                    $timeout(function() {
                        $scope.progress.value = 100;

                        if($scope.selectedTemplateNodeData && $scope.selectedTemplateNodeData.uuid) {
                            Catalogue.addImage($scope.selectedTemplateNodeData.uuid, data.uuid).success(function(response) {
                                $scope.selectedTemplateNodeData.path = response.path + '?time=' + new Date().getTime();
                            });
                        }
                    });
                });
            }
        }
    };

    $scope.catalogueTags = [];
    $scope.getCatalogueTags = function (itemUuid) {
        CatalogueTagService.getAll(itemUuid).success(function (data) {
            $scope.catalogueTags = data.content;
        });
    };
    $scope.openTagSelectDlg = function () {
        $mdDialog.show({
            controller: 'CatalogueTagSelectDlgController',
            templateUrl: 'app/src/app/production/template_data/catalogueTagSelectDlg.html',
            parent: angular.element(document.body),
            targetEvent: event,
            locals: {}
        }).then(function (tagUuid) {
            CatalogueTagService.add({
                catalogueUuid: $scope.selectedTemplateNodeData.uuid,
                tagUuid: tagUuid
            }).success(function () {
                $scope.showInfo('新增目录标签成功。');
                $scope.getCatalogueTags($scope.selectedTemplateNodeData.uuid);
            }).error(function (data) {
                $scope.showInfo('新增目录标签失敗。');
            });

        });
    };
    $scope.deleteCatalogueTag = function (uuid) {
        $scope.showConfirm('确认删除目录标签吗？', '', function () {
            CatalogueTagService.delete(uuid).success(function () {
                $scope.getCatalogueTags($scope.selectedTemplateNodeData.uuid);
                $scope.showInfo('删除目录标签成功。');
            });
        });
    }

});

angular.module('IOne-Production').controller('TemplateSelectController', function($scope, $mdDialog, CatalogueTemplate, catalogueTemplates, selectedTemplateData) {
    $scope.catalogueTemplates = catalogueTemplates;
    $scope.selectedTemplateData = selectedTemplateData;

    $scope.hideDlg = function(index) {
        $mdDialog.hide($scope.catalogueTemplates.content[index]);
    };

    $scope.cancelDlg = function() {
        $mdDialog.cancel();
    };
});


angular.module('IOne-Production').controller('CatalogueTagSelectDlgController', function ($scope, $mdDialog, $mdToast, TagService) {
    $scope.pageOption = {
        sizePerPage: 5,
        currentPage: 0,
        totalPage: 0,
        totalElements: 0,
        displayModel: 0  //0 : image + text //1 : image
    };
    var tagQuery = {confirm: 2, status: 1};
    $scope.tags = [];
    $scope.keyWord = "";
    $scope.refreshPage = function (isRefresh) {
        $scope.pageOption.currentPage = isRefresh ? 0 : $scope.pageOption.currentPage;
        TagService.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, tagQuery.confirm, tagQuery.status, null, null, $scope.keyWord).success(function (data) {
            $scope.pageOption.totalPage = data.totalPages;
            $scope.pageOption.totalElements = data.totalElements;
            $scope.tags = data.content;

        });
    };
    $scope.addProductionTag = function (tagUuid) {
        $mdDialog.hide(tagUuid);
    };
    $scope.cancelDlg = function () {
        $mdDialog.cancel();
    };

    $scope.refreshPage();
});