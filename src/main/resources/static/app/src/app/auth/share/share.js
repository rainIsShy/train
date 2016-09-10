angular.module('IOne-Production').config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/auth/share', {
        controller: 'ShareController',
        templateUrl: 'app/src/app/auth/share/share.html'
    })
}]);

angular.module('IOne-Production').controller('ShareController', function($scope, $mdDialog, Constant, SysTable, ShareTreeMaster, ShareTreeDetail, ChannelService) {
    $scope.formMenuDisplayOption = {
        '100-add': {display: true, name: '新增', uuid: ''},
        '101-delete': {display: true, name: '删除', uuid: ''},
        '102-edit': {display: true, name: '编辑', uuid: ''},
        '103-copy': {display: false, name: '复制', uuid: ''},
        '104-status': {display: false, name: '启用', uuid: ''},
        '105-confirm': {display: false, name: '审核', uuid: ''},
        '106-release': {display: false, name: '发布', uuid: ''},

        '200-cancel': {display: true, name: '取消新增', uuid: ''},
        '201-save': {display: true, name: '保存', uuid: ''},

        '300-add': {display: true, name: '新增节点', uuid: ''},
        '301-delete': {display: true, name: '删除节点', uuid: ''},
        '302-save': {display: true, name: '保存', uuid: ''},
        '303-cancel': {display: true, name: '取消修改', uuid: ''},
        '304-quit': {display: true, name: '退出编辑', uuid: ''}
    };

    $scope.listFilterOption = {
        status :  Constant.STATUS[0].value
    };

    $scope.$watch('listFilterOption', function(newValue, oldValue) {
        if(newValue.status != oldValue.status) {
            $scope.refreshAllEntities();
        }
    }, true);

    $scope.listFilterDisplayOption = {
        showStatusFilterMenu : true,
        showConfirmFilterMenu : false,
        showReleaseFilerMenu : false,
        showProdTypeFilterMenu : false,
        showStopProdFilterMenu : false
    };

    $scope.refreshAllEntities = function() {
        $scope.allSysTable = SysTable.query();
        $scope.allShareTree = ShareTreeMaster.query({status: $scope.listFilterOption.status == 0 ? '' : $scope.listFilterOption.status, keyword: $scope.searchKeyword});
    };

    $scope.listTabSelected = function() {
        $scope.refreshAllEntities();
        $scope.selectedItem = null;
        $scope.shareTreeDetails = null;
        $scope.source = null;
        $scope.currentSelectedNode = null;
        $scope.changeViewStatus(Constant.UI_STATUS.VIEW_UI_STATUS, 0);
    };

    $scope.formTabSelected = function() {
        $scope.getMenuAuthData($scope.RES_UUID_MAP.AUTH.SHARE.RES_UUID).success(function(data) {
            $scope.menuAuthDataMap = $scope.menuDataMap(data);
        });
    };

    $scope.editItem = function(shareTree) {
        $scope.changeViewStatus(Constant.UI_STATUS.PRE_EDIT_UI_STATUS, 1);

        ShareTreeMaster.get({uuid: shareTree.uuid}, function(data) {
            $scope.selectedItem = data;
        });

        ShareTreeDetail.query({shareTreeUuid: shareTree.uuid}, function(data) {
            $scope.shareTreeDetails = data;
            $scope.refreshTreeModel(data);
        })
    };

    $scope.preAddMenuAction = function() {
        $scope.selectedItem = {};
        $scope.changeViewStatus($scope.UI_STATUS.EDIT_UI_STATUS_ADD, 1);
    };

    $scope.addNodeMenuAction = function() {
        if($scope.displayType == '2' && (!$scope.shareTreeDetails || $scope.shareTreeDetails.length == 0)) {
            $scope.showWarn('资源树未配置当前登录渠道用户，请联系集团用户新增渠道用户到资源树。');
            return;
        }
        $mdDialog.show({
            controller: 'AddNodeDialogController',
            templateUrl: 'app/src/app/auth/share/addNode.html',
            parent: angular.element(document.body),
            targetEvent: event
        }).then(function(data) {
            if($scope.shareTreeDetails) {
                for(var i = 0; i<$scope.shareTreeDetails.length; i++) {
                    if($scope.shareTreeDetails[i].channel && data.channel && $scope.shareTreeDetails[i].channel.uuid == data.channel) {
                        $scope.showError('同一个渠道只能关联到一个节点。');
                        return;
                    }
                }
            }

            ShareTreeDetail.save({shareTreeUuid: $scope.selectedItem.uuid}, {
                no: data.name,
                name: data.name,
                channelUuid: data.channel || '',
                parentUuid: $scope.source.length > 0 ? $scope.source[0].id : '',
                defaultFlag: data.defaultFlag,
                aamFlag: data.aamFlag
            }, function(data) {
                ShareTreeDetail.query({shareTreeUuid: $scope.selectedItem.uuid}, function(data) {
                    $scope.shareTreeDetails = data;
                    $scope.refreshTreeModel(data);
                });
            }, function() {
                $scope.showError("新增节点失败。");
            });
        });
    };

    $scope.deleteMenuAction = function() {
        $scope.showConfirm('确认删除吗？', '删除的数据不可恢复。', function() {
            if($scope.selectedItem) {
                ShareTreeMaster.delete({uuid: $scope.selectedItem.uuid}, {}, function() {
                    $scope.showInfo('删除成功。');
                    $scope.changeViewStatus($scope.UI_STATUS.EDIT_UI_STATUS_DELETE, 0);
                });
            }
        });
    };

    $scope.deleteNodeMenuAction = function() {
        if($scope.displayType == '2' && $scope.currentSelectedNode && $scope.currentSelectedNode.parentUuid == null) {
            $scope.showWarn("渠道用户不能删除自身节点。");
            return;
        }
        $scope.showConfirm('确认删除吗？', '删除的数据不可恢复。', function() {
            if($scope.selectedItem && $scope.currentSelectedNode) {
                ShareTreeDetail.delete({shareTreeUuid: $scope.selectedItem.uuid, uuid: $scope.currentSelectedNode.uuid}, {}, function() {
                    $scope.currentSelectedNode = null;
                    ShareTreeDetail.query({shareTreeUuid: $scope.selectedItem.uuid}, function(data) {
                        $scope.shareTreeDetails = data;
                        $scope.refreshTreeModel(data);
                    });

                    $scope.showInfo('删除成功。');
                }, function(response) {
                    $scope.showError('删除失败。');
                });
            }
        });
    };

    $scope.modifyMenuAction = function() {
        $scope.selectedItem.sysTableUuid = $scope.selectedItem.sysTable.uuid;
        ShareTreeMaster.update({uuid: $scope.selectedItem.uuid}, $scope.selectedItem, function() {
            $scope.showInfo('修改数据成功。');
        }, function() {
            $scope.showError('修改数据失败。');
        });
    };

    $scope.cancelModifyMenuAction = function() {
        ShareTreeMaster.get({uuid: $scope.selectedItem.uuid}, function(data) {
            $scope.selectedItem = data;
        })
    };

    $scope.exitModifyMenuAction = function() {
        $scope.cancelModifyMenuAction();
        $scope.changeViewStatus($scope.UI_STATUS.PRE_EDIT_UI_STATUS, 1);
    };

    $scope.cancelAddMenuAction = function() {
        $scope.listTabSelected();
    };

    $scope.addMenuAction = function() {
        for(var i = 0; i<$scope.allShareTree.length; i++) {
            if($scope.allShareTree[i].sysTable.uuid == $scope.selectedItem.sysTable.uuid) {
                $scope.showError('一个系统资源只能关联一个资源树。');
                return;
            }
        }
        $scope.selectedItem.sysTableUuid = $scope.selectedItem.sysTable.uuid;
        ShareTreeMaster.save({}, $scope.selectedItem, function(data) {
            $scope.selectedItem = data;
            $scope.changeViewStatus($scope.UI_STATUS.EDIT_UI_STATUS_MODIFY, 1);
            $scope.shareTreeDetails = [];
            $scope.refreshTreeModel([]);
            $scope.showInfo('新增数据成功。');
        }, function() {
            $scope.showError('新增数据失败。');
        });
    };

    $scope.sourceUpdateFlag = new Date();
    $scope.refreshTreeModel = function(shareTreeDetails) {
        var list = [];

        angular.forEach(shareTreeDetails, function(item) {
            list.push({
                id: item.uuid,
                uuid: item.uuid,
                name: item.name,
                channel: item.channel ? item.channel.name : '',
                parent: item.parentUuid || '',
                aamFlag: item.aamFlag
            });
        });
        $scope.source = list;
        $scope.sourceUpdateFlag = new Date();
    };

    $scope.changeTree = function(source, dest) {
        if(source && dest) {
            ShareTreeDetail.update({shareTreeUuid: $scope.selectedItem.uuid, uuid: source}, {
                parentUuid: dest
            });
        }
    };

    $scope.selectCallback = function(uuid) {
        angular.forEach($scope.shareTreeDetails, function(data) {
            if(data.uuid == uuid) {
                $scope.currentSelectedNode = data;
                $scope.$apply();
            }
        })
    };

    $scope.updateNodeHandler = function() {
        ShareTreeDetail.update({shareTreeUuid: $scope.selectedItem.uuid, uuid: $scope.currentSelectedNode.uuid}, $scope.currentSelectedNode, function() {
            $scope.showInfo("修改成功。");

            ShareTreeDetail.query({shareTreeUuid: $scope.selectedItem.uuid}, function(data) {
                $scope.shareTreeDetails = data;
                $scope.refreshTreeModel(data);
            });
        }, function(response) {
            $scope.showError($scope.getAllError(response.data));
        });
    };

    //---------------------------------Channel
    $scope.searchChannel = function() {
        $mdDialog.show({
            controller: 'ChannelSearchController',
            templateUrl: 'app/src/app/auth/share/selectChannel.html',
            parent: angular.element(document.body),
            targetEvent: event
        }).then(function(data) {
            $scope.currentSelectedNode.channel = data;
            $scope.currentSelectedNode.channelUuid = data.uuid;
            $scope.updateNodeHandler();
        });

    };
});

angular.module('IOne-Production').controller('AddNodeDialogController', function($scope, $mdDialog, ChannelService) {
    $scope.pageOption = {
        sizePerPage: 21,
        currentPage: 0,
        totalPage: 0,
        totalElements: 0,
        displayModel: 0  //0 : image + text //1 : image
    };

    $scope.refreshChannel = function() {
        ChannelService.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, 0, 0, $scope.searchKeyword).success(function(data) {
            $scope.allChannel = data;
            $scope.pageOption.totalElements = data.totalElements;
            $scope.pageOption.totalPage = data.totalPages;
        });
    };

    $scope.refreshChannel();

    $scope.selectChannel = function(channel) {
        $scope.searchChannelFlag = false;
        $scope.data.channel = channel.uuid;
    };

    $scope.data = {};
    $scope.hideDlg = function() {
        $mdDialog.hide($scope.data);
    };

    $scope.cancelDlg = function() {
        $mdDialog.cancel();
    };
});


angular.module('IOne-Production').controller('ChannelSearchController', function($scope, $mdDialog, ChannelService) {
    $scope.pageOption = {
        sizePerPage: 21,
        currentPage: 0,
        totalPage: 0,
        totalElements: 0,
        displayModel: 0  //0 : image + text //1 : image
    };

    $scope.refreshChannel = function() {
        ChannelService.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, 0, 0, $scope.searchKeyword).success(function(data) {
            $scope.allChannel = data;
            $scope.pageOption.totalElements = data.totalElements;
            $scope.pageOption.totalPage = data.totalPages;
        });
    };

    $scope.refreshChannel();

    $scope.selectChannel = function(channel) {
        $scope.channel = channel;
        $mdDialog.hide($scope.channel);
    };

    $scope.hideDlg = function() {
        $mdDialog.hide($scope.channel);
    };

    $scope.cancelDlg = function() {
        $mdDialog.cancel();
    };
});