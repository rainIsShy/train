/**
 * productions management module
 */
angular.module('IOne-Production').config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/catalogue', {
        controller: 'ProductionSummaryController',
        templateUrl: 'app/src/app/production/template/template.html'
    })
}]);

angular.module('IOne-Production').controller('ProductionSummaryController', function($scope, CatalogueTemplate, Constant, $mdDialog, $timeout){
    $scope.listFilterOption = {
        status :  Constant.STATUS[0].value,
        confirm : Constant.CONFIRM[0].value,
        release : Constant.RELEASE[0].value,
        prodType : Constant.PROD_TYPE[0].value
    };

    $scope.listFilterDisplayOption = {
        showStatusFilterMenu : true,
        showConfirmFilterMenu : true,
        showReleaseFilerMenu : true,
        showProdTypeFilterMenu : false
    };
    $scope.formMenuDisplayOption = {
        '100-add': {display: true, name: '新增', uuid: '6D732D25-EB09-43EB-9C6E-37638E3BAAE3'},
        '101-delete': {display: true, name: '删除', uuid: '02EAB922-634E-44B3-A730-0F198FCB7EC6'},
        '102-edit': {display: true, name: '编辑', uuid: '77C6275F-5D0B-40C8-BEE4-5256DCC1FE48'},
        '103-copy': {display: true, name: '复制', uuid: '6D7BF5D4-1816-4F3A-97EE-53A8C7C712A8'},
        '104-status': {display: true, name: '启用', uuid: '61BCFEAD-E537-4787-9499-C03C94E84A88'},
        '105-confirm': {display: true, name: '审核', uuid: '393C5A01-EA77-4168-A6BB-9C2B03C53F29'},
        '106-release': {display: true, name: '发布', uuid: '5BCDC24B-2578-4295-AD6C-0063437C0F70'},

        '200-cancel': {display: true, name: '取消新增', uuid: '2C517ACE-3E23-47C8-938C-CE36C5B6576F'},
        '201-save': {display: true, name: '保存', uuid: 'E69D9D85-F22A-4394-A433-246BED5ECBA9'},

        '300-add': {display: true, name: '新增节点', uuid: '14F52550-42FE-466F-A067-8A46CDA749EF'},
        '301-delete': {display: true, name: '删除节点', uuid: '30BEA4BA-6C8A-4061-AF05-04681BEBDFA3'},
        '302-save': {display: true, name: '保存', uuid: '95E9E7C3-F995-4BA8-A4BB-B989D76456A8'},
        '303-cancel': {display: true, name: '取消修改', uuid: 'C36D8E23-BF25-4335-92E8-3CCB45DB11AE'},
        '304-quit': {display: true, name: '退出编辑', uuid: 'FAC025DE-E9B8-4706-B31C-853AABE172CF'}
    };

    $scope.pageOption = {
        sizePerPage: 15,
        currentPage: 0,
        totalPage: 100,
        totalElements: 100
    };

    $scope.refreshAllTemplate = function() {
        CatalogueTemplate.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, $scope.listFilterOption.status, $scope.listFilterOption.confirm, $scope.listFilterOption.release).success(function(data) {
            $scope.catalogueTemplates = data;
            $scope.pageOption.totalPage = data.totalPages;
            $scope.pageOption.totalElements = data.totalElements;

            if(data && data.content) {
                angular.forEach(data.content, function(content) {

                    if(content && content.details) {
                        //display them all by default.
                        content.display = true;
                        //Put a index in the node to easy the use of mdChips
                        angular.forEach(content.details, function(node, index) {
                            node.index = index;
                        });
                    }
                });
            }
        });
        $scope.selectedItem = null;
        $scope.selectedTemplateNode = null;
    };

    $scope.listTabSelected = function() {
        $scope.refreshAllTemplate();
        $scope.changeViewStatus(Constant.UI_STATUS.VIEW_UI_STATUS, 0);
    };

    $scope.formTabSelected = function() {
        $scope.getMenuAuthData($scope.RES_UUID_MAP.PRODUCTION.TEMPLATE.FORM_PAGE.RES_UUID).success(function(data) {
            $scope.menuAuthDataMap = $scope.menuDataMap(data);
        });
    };

    $scope.$watch('listFilterOption', function() {
        $scope.refreshAllTemplate();
    }, true);

    $scope.editItem = function(item) {
        $scope.selectedItem = item;
        $scope.changeViewStatus(Constant.UI_STATUS.PRE_EDIT_UI_STATUS, 1);
    };

    $scope.modifyMenuAction = function() {
        if($scope.selectedItem) {
            CatalogueTemplate.modify($scope.selectedItem).success(function() {
                $scope.showInfo('修改模板成功。');
            }).error(function(data) {
                $scope.showError(data.content);
                $scope.cancelModifyMenuAction();
            });
        }

        if($scope.selectedTemplateNode) {
            if($scope.selectedTemplateNode.uuid == null || $scope.selectedTemplateNode.uuid == undefined) {
                CatalogueTemplate.addNode($scope.selectedItem.uuid, $scope.selectedTemplateNode).success(function(data) {
                    $scope.selectedTemplateNode.uuid = data.uuid;
                    $scope.showInfo('新建节点成功。');
                }).error(function(data){
                    if(data && data.content) {
                        $scope.showError(data.content);
                    }

                });
            } else {
                CatalogueTemplate.modifyNode($scope.selectedItem.uuid, $scope.selectedTemplateNode).success(function(data) {
                    $scope.selectedTemplateNode = data;
                    $scope.showInfo('修改节点成功。');
                });
            }

        }
    };

    $scope.deleteMenuAction = function() {
        $scope.showConfirm('确认删除吗？', '删除的模板不可恢复。', function() {
            if($scope.selectedItem) {
                CatalogueTemplate.delete($scope.selectedItem.uuid).success(function() {
                    $scope.showInfo('删除成功。');
                    $scope.changeViewStatus($scope.UI_STATUS.EDIT_UI_STATUS_DELETE, 0);
                }).error(function(response) {
                    $scope.showError($scope.getError(response));
                });
            }
        });
    };

    $scope.cancelAddMenuAction = function() {
        $scope.listTabSelected();
    };

    $scope.preAddMenuAction = function() {
        $scope.selectedItem = CatalogueTemplate.createDefault();
        $scope.selectedTemplateNode = null;
        $scope.changeViewStatus($scope.UI_STATUS.EDIT_UI_STATUS_ADD, 1);
    };

    $scope.addMenuAction = function() {
        if($scope.selectedItem && (angular.isUndefined($scope.selectedItem.uuid) || $scope.selectedItem.uuid == null)) {
            CatalogueTemplate.add($scope.selectedItem).success(function(data) {
                $scope.selectedItem = data;
                $scope.selectedTemplateNode = null;
                $scope.changeViewStatus($scope.UI_STATUS.EDIT_UI_STATUS_MODIFY, 1);

                $scope.showInfo('新增模板成功。');
            })
        }
    };

    $scope.copyMenuAction = function() {
        $mdDialog.show({
            controller: 'DialogController',
            templateUrl: 'app/src/app/production/template/addTemplate.html',
            parent: angular.element(document.body),
            targetEvent: event
        }).then(function(data) {
            for(var i = 0; i<$scope.catalogueTemplates.content.length; i++) {
                if($scope.catalogueTemplates.content[i].no == data.no) {
                    $scope.showError('编号已存在，请选择其它编号。');
                    return;
                }
            }
            CatalogueTemplate.copy($scope.selectedItem, {no: data.no, name: data.name}).success(function(data) {
                $scope.selectedItem = data;
                $scope.selectedTemplateNode = null;

                $scope.changeViewStatus($scope.UI_STATUS.EDIT_UI_STATUS_MODIFY, 1);
                $scope.showInfo('模板拷贝成功。');
            });
        });
    };

    $scope.addNodeMenuAction = function(event) {
        if($scope.isNotPersistedNode() == true) {
            $scope.showWarn('请先保存当前节点。');
            return;
        }

        var newNode = CatalogueTemplate.createDefaultTemplateNode();

        $mdDialog.show({
            controller: 'DialogController',
            templateUrl: 'app/src/app/production/template/addNode.html',
            parent: angular.element(document.body),
            targetEvent: event
        }).then(function(data) {
            //Set parent uuid and put back to main list
            if($scope.selectedItem.details.length == 0) {
                $scope.selectedItem.details.push(newNode);
            } else if ($scope.selectedItem.details.length > 0) {
                if($scope.selectedTemplateNode) {
                    //Insert
                    newNode.parentUuid = $scope.selectedTemplateNode.uuid;
                    $scope.selectedItem.details.splice($scope.selectedTemplateNode.index + 1, 0, newNode);
                } else {
                    //Append
                    newNode.parentUuid = $scope.selectedItem.details[$scope.selectedItem.details.length - 1].uuid;
                    $scope.selectedItem.details.push(newNode);
                }
            }
            newNode.no = data.no;
            newNode.name = data.name;

            //Re-assign all index.
            angular.forEach($scope.selectedItem.details, function(value, index) {
                value.index = index;
            });

            $scope.selectedTemplateNode = newNode;
        });
    };

    $scope.selectNodeHandler = function(node) {
        if($scope.isNotPersistedNode() == true) {
            $scope.showWarn('请先保存当前节点。');
            return;
        }
        $scope.selectedTemplateNode = node;
    };

    //Set menu names
    $scope.$watch('selectedItem', function() {
        if($scope.selectedItem) {
            if ($scope.selectedItem.status == '1') {
                $scope.formMenuDisplayOption['104-status'].name = '禁用';
            } else if ($scope.selectedItem.status == '2') {
                $scope.formMenuDisplayOption['104-status'].name = '启用';
            }

            if ($scope.selectedItem.confirm == '1') {
                $scope.formMenuDisplayOption['105-confirm'].name = '审核';
            } else if ($scope.selectedItem.confirm == '2') {
                $scope.formMenuDisplayOption['105-confirm'].name = '反审核';
            }

            if ($scope.selectedItem.release == '1') {
                $scope.formMenuDisplayOption['106-release'].name = '发布';
            } else if ($scope.selectedItem.release == '2') {
                $scope.formMenuDisplayOption['106-release'].name = '反发布';
            }
        }
    }, true);

    $scope.handler = function(field, value) {
        if($scope.selectedItem && $scope.selectedItem[field]) {
            $scope.selectedItem[field] = value;
            $scope.selectedTemplateNode = null;
            $scope.modifyMenuAction();
        }
    };
    $scope.statusMenuAction = function() {
        $scope.selectedItem.status == '1' ? $scope.handler('status', '2') : $scope.handler('status', '1');
    };
    $scope.confirmMenuAction = function() {
        $scope.selectedItem.confirm == '1' ? $scope.handler('confirm', '2') : $scope.handler('confirm', '1');
    };
    $scope.releaseMenuAction = function() {
        $scope.selectedItem.release == '1' ? $scope.handler('release', '2') : $scope.handler('release', '1');
    };

    $scope.isNotPersistedNode = function() {
        if($scope.selectedTemplateNode && ($scope.selectedTemplateNode.uuid == null && $scope.selectedTemplateNode.uuid == undefined )) {
            return true;
        } else {
            return false;
        }
    };

    $scope.deleteNodeMenuAction = function(node) {
        $scope.showConfirm('确认删除吗？', '删除的模板节点不可恢复。', function() {
            if(node) {
                $scope.selectedTemplateNode = node;
            }
            if($scope.selectedTemplateNode) {
                if(!$scope.isNotPersistedNode()) {
                    CatalogueTemplate.deleteNode($scope.selectedItem.uuid, $scope.selectedTemplateNode.uuid).success(function() {
                        $scope.showInfo('删除节点成功。');

                        $scope.selectedItem.details.splice($scope.selectedTemplateNode.index, 1);
                        $scope.selectedTemplateNode = null;
                    });
                } else {
                    $scope.selectedItem.details.splice($scope.selectedTemplateNode.index, 1);
                    $scope.selectedTemplateNode = null;
                }
            } else {
                $scope.showWarn('请选择节点。');
            }
        });

        $event.stopPropagation();
        $event.preventDefault();
    };

    $scope.cancelModifyMenuAction = function() {
        CatalogueTemplate.get($scope.selectedItem.uuid).success(function(data) {
            $scope.selectedItem = data;
            $scope.selectedTemplateNode = null;
        })
    };

    $scope.exitModifyMenuAction = function() {
        $scope.cancelModifyMenuAction();
        $scope.changeViewStatus($scope.UI_STATUS.PRE_EDIT_UI_STATUS, 1);
    };
});

angular.module('IOne-Production').controller('DialogController', function($scope, $mdDialog) {
    $scope.data = {};
    $scope.hideDlg = function() {
        $mdDialog.hide($scope.data);
    };

    $scope.cancelDlg = function() {
        $mdDialog.cancel();
    };
});