angular.module('IOne-Production').config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/sys/sysRes', {
        controller: 'SysResController',
        templateUrl: 'app/src/app/sys/sys_res/sysRes.html'
    })
}]);

angular.module('IOne-Production').controller('SysResController', function ($scope, SYSResService, Constant, $mdDialog) {
    $scope.editNodeDisabled = false;
    $scope.saveNodeDisabled = true;
    $scope.cancelModifyDisabled = true;
    $scope.quitDisabled = true;

    $scope.formMenuDisplayOption = {
        '102-edit': {display: true, name: '编辑', uuid: 'bb12d0d8-d4d4-4bcc-bdab-1807ff361da5'},
        '302-save': {display: true, name: '保存', uuid: '7b3fbc38-24de-4e46-a541-db25b2a5360c'},
        '303-cancel': {display: true, name: '取消修改', uuid: '27a19576-c2ff-4ed6-a719-a50311039e96'},
        '304-quit': {display: true, name: '退出编辑', uuid: '32a0dec9-71f5-4982-8c30-f73847db8e7d'}
    };

    $scope.initData = function () {
        $scope.headers = [
            {"type": 1, "name": "1级"},
            {"type": 2, "name": "2级"},
            {"type": 3, "name": "3级"}];
        $scope.selectedTemplateData = {};
    };
    $scope.initData();

    $scope.getMenuAuthData($scope.RES_UUID_MAP.SYS.SYS_BASE_RES.RES_UUID).success(function (data) {
        $scope.menuAuthDataMap = $scope.menuDataMap(data);
    });

    $scope.nodeDataClickHandler = function (selectedGrade, selectedItem) {
        angular.forEach($scope.selectedTemplateData[selectedGrade], function (node) {
            node.selected = false;
        });
        selectedItem.selected = true;
        $scope.selectedItem = selectedItem;
        $scope.clearChildren(selectedItem);
        SYSResService.getForParent(selectedItem.uuid).success(function (data) {
            if (data && data.content && data.content.length > 0) {
                $scope.selectedTemplateData[selectedGrade + 1] = data.content;
            }
            $scope.isRefreshing = false;
        }).error(function () {
            $scope.isRefreshing = false;
        });
        $scope.refreshAddNodeButtonDisplay();
    };

    //Refresh the data of one template
    $scope.refreshTemplateData = function (template, node) {
        //Refresh only when there is data for this template
        if (template && template.length > 0) {

            var dataHandler = function (template, node, data) {
                //template object
                var content = $scope.selectedTemplateData[template.uuid];
                if (content == undefined || content == null) {
                    content = [data];
                    $scope.selectedTemplateData[template.uuid] = content;
                }
            };

            //Get the first node data
            SYSResService.getForGrade(node.type).success(function (data) {
                dataHandler(template, node, data.content);
            });

        }
    };

    $scope.refreshAllTemplate = function () {
        SYSResService.getForGrade($scope.headers[0].type).success(function (data) {
            var setFirstOpen = false;

            if (data && data.content) {
                $scope.selectedTemplateData[$scope.headers[0].type] = data.content;
                $scope.refreshAddNodeButtonDisplay();
            }
        });
        $scope.selectedItem = null;
    };
    $scope.refreshAllTemplate();

    $scope.backup = function (item) {
        return {
            uuid: item.uuid,
            no: item.no,
            name: item.name,
            type: item.type,
            parentUuid: item.parentUuid
        }
    };

    $scope.changeToEditMode = function () {
        $scope.backupSelectedItem = $scope.backup($scope.selectedItem);
        $scope.changeViewStatus(Constant.UI_STATUS.EDIT_UI_STATUS, 0);
    };

    $scope.quitEditMode = function () {
        $scope.showConfirm('修改尚未保存，确认退出编辑吗？', '', function () {
            $scope.selectedItem = $scope.backupSelectedItem;
            $scope.changeViewStatus(Constant.UI_STATUS.VIEW_UI_STATUS, 0);
        });
    };

    $scope.cancelModification = function () {
        $scope.selectedItem = $scope.backupSelectedItem;
    };

    $scope.updateNodeData = function () {
        $scope.showConfirm('确认修改该节点数据吗？', '', function () {
            if ($scope.selectedItem) {
                SYSResService.modify($scope.selectedItem.uuid, $scope.selectedItem).success(function () {
                    $scope.showInfo('修改节点数据成功。');
                    $scope.changeViewStatus(Constant.UI_STATUS.VIEW_UI_STATUS, 0);
                }).error(function () {
                    $scope.showError('修改节点数据失败: ');
                });
            }
        });
    };

    $scope.refreshAddNodeButtonDisplay = function () {
        angular.forEach($scope.headers, function (header) {
            var showAddButton = ($scope.selectedTemplateData[header.type - 1] != null && $scope.selectedTemplateData[header.type - 1].length > 0) || header.type == 1;
            if ($scope.selectedTemplateData[header.type - 1] != null) {
                angular.forEach($scope.selectedTemplateData[header.type - 1], function (node) {
                    if (node.selected) {
                        showAddButton = true;
                    }
                });
            }
            header.showAddButton = showAddButton;
        });
    };

    //add node data
    $scope.addNodeData = function (type) {
        var parentUuid = null;
        var parentNodes = $scope.selectedTemplateData[type - 1];
        angular.forEach(parentNodes, function (parentNode) {
            if (parentNode.selected) {
                parentUuid = parentNode.uuid;
            }
        });

        $mdDialog.show({
            controller: 'DialogController',
            templateUrl: 'app/src/app/sys/sys_res/addSysRes.html',
            parent: angular.element(document.body),
            targetEvent: event
        }).then(function (data) {
            var Input = {
                no: data.no,
                name: data.name,
                type: type,
                parentUuid: parentUuid
            };
            SYSResService.add(Input).success(function (data) {
                data.selected = true;
                if ($scope.selectedTemplateData[type] == null) {
                    $scope.selectedTemplateData[type] = [data];
                } else {
                    $scope.selectedTemplateData[type].push(data);
                }
                var addItem;
                angular.forEach($scope.selectedTemplateData[type], function (v) {
                    if (v.uuid == data.uuid) {
                        addItem = v;
                    }

                });
                if (addItem != null) {
                    $scope.nodeDataClickHandler(type, addItem);
                }
                $scope.showInfo('新增数据成功。');
            }).error(function (response) {
                $scope.showError('新增数据失败: ' + response.message);
            });
        });
    };

    $scope.deleteNodeData = function ($event, item) {
        $scope.showConfirm('确认清除该节点数据吗？', '节点数据删除后不可恢复。', function () {
            SYSResService.delete(item.uuid).success(function () {
                var indexToDelete = -1;
                angular.forEach($scope.selectedTemplateData[item.type], function (v, index) {
                    if (v.uuid == item.uuid) {
                        indexToDelete = index;
                    }

                });
                $scope.selectedTemplateData[item.type].splice(indexToDelete, 1);

                //Delete all children
                if (item.selected) {
                    $scope.clearChildren(item);
                }
                $scope.showInfo('删除节点数据成功。');
            }).error(function (response) {
                $scope.showError('删除节点数据失败: ' + response.message);
            });
        });

        $event.stopPropagation();
        $event.preventDefault();
    };

    $scope.clearChildren = function (item) {
        for (var i = Number(item.type) + 1; i <= $scope.headers[$scope.headers.length - 1].type; i++) {
            if ($scope.selectedTemplateData[i] != null) {
                $scope.selectedTemplateData[i].splice(0);
            }
        }
    }
});