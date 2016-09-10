angular.module('IOne-Production').config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/cbi/department', {
        controller: 'DepartmentController',
        templateUrl: 'app/src/app/cbi/department/departmentList.html'
    })
}]);

angular.module('IOne-Production').controller('DepartmentController', function ($q, $mdDialog, $scope, Department, Constant) {
    $scope.disabledBatchConfirm = true;
    $scope.disabledBatchCancelConfirm = true;
    $scope.disabledBatchStatus = true;
    $scope.disabledBatchCancelStatus = true;
    $scope.selectedItemSize = 0;

    $scope.pageOption = {
        sizePerPage: 10,
        currentPage: 0,
        totalPage: 100,
        totalElements: 100
    };

    $scope.listFilterOption = {
        status: Constant.STATUS[1].value,
        confirm: Constant.CONFIRM[1].value
    };

    $scope.sortByAction = function (field) {
        $scope.sortByField = field;
        $scope.sortType = '';
    };

    $scope.refreshList = function () {
        Department.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, $scope.listFilterOption).success(function (data) {
            $scope.itemList = data.content;
            $scope.pageOption.totalPage = data.totalPages;
            $scope.pageOption.totalElements = data.totalElements;
            $scope.selectedItemSize = 0;
        });
    };

    $scope.$watch('listFilterOption', function () {
        $scope.pageOption.currentPage = 0;
        $scope.pageOption.totalPage = 0;
        $scope.pageOption.totalElements = 0;
        $scope.refreshList();
    }, true);

    $scope.subItemList = [];

    $scope.selectAllFlag = false;

    /**
     * Show left detail panel when clicking the title
     */
    $scope.showDetailPanelAction = function (item) {
        $scope.selectedItem = item;
        $scope.initBody(item);
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
    };

    /**
     * Save object according current status and domain.
     */
    $scope.saveItemAction = function () {
        if ($scope.status == 'add') {
            if ($scope.domain == 'CBI_BASE_DELIV_WAY') {
                Department.add($scope.source).success(function (data) {
                    $scope.showInfo('新增送货方式成功。');
                    $scope.changeViewStatus(Constant.UI_STATUS.VIEW_UI_STATUS);
                    $scope.refreshList();
                }).error(function (response) {
                    $scope.showError('新增送货方式失败: ' + response.message);
                });
                $scope.refreshList();
            }
        } else if ($scope.status == 'edit') {
            if ($scope.domain == 'CBI_BASE_DELIV_WAY') {
                if($scope.source.status ==  Constant.STATUS[1].value && $scope.source.confirm != Constant.CONFIRM[2].value) {
                    Department.modify($scope.source.uuid, $scope.source).success(function (data) {
                        $scope.showInfo('修改送货方式成功。');
                        $scope.changeViewStatus(Constant.UI_STATUS.VIEW_UI_STATUS);
                        $scope.refreshList();
                    }).error(function (response) {
                        $scope.showError('修改送货方式失败。' + response.message);
                    });
                } else {
                    $scope.showError($scope.source.no + ' 不允许修改：有效且未审核的记录才可以修改！');
                }



            }
        }
    };

    /**
     * Delete detail item
     */
    $scope.deleteDetailAction = function (detail) {
        //TODO ...
    };

    $scope.selectItemAction = function (event, item) {
        $scope.stopEventPropagation(event);
        item.selectedRef = !item.selected;

        if (item.selected == false
            || item.selected == undefined
            || item.selected == null) {
            $scope.selectedItemSize += 1;
        } else {
            $scope.selectedItemSize -= 1;
            $scope.selectAllFlag = false;
        }
        $scope.disableBatchMenuButtons();
    };

    $scope.confirmClickAction = function (event, item) {
        $scope.stopEventPropagation(event);
        console.info('confirm...');

        $scope.stopEventPropagation(event);
        console.info('status...');

        var msg = "确认取消审核吗？";
        var input = '1';
        var resultMsg = "取消审核成功！";
        if (item.confirm != '2') {
            msg = "确认审核吗？";
            input = '2';
            resultMsg = "审核成功！";
        }

        $scope.showConfirm(msg, '', function () {
            Department.modify(item.uuid, {'confirm': input}).success(function () {
                item.confirm = input;
                $scope.showInfo(resultMsg);
            }).error(function (response) {
                $scope.showError(response.message);
            });
        });
    };

    $scope.statusClickAction = function (event, item) {
        $scope.stopEventPropagation(event);
        console.info('status...');

        var msg = "确认禁用吗？";
        var input = '2';
        var resultMsg = "禁用成功！";
        if (item.status != '1') {
            msg = "确认启用吗？";
            input = '1';
            resultMsg = "启用成功！";
        }

        $scope.showConfirm(msg, '', function () {
            Department.modify(item.uuid, {'status': input}).success(function () {
                item.status = input;
                $scope.showInfo(resultMsg);
            }).error(function (response) {
                $scope.showError(response.message);
            });
        });
    };

    $scope.releaseClickAction = function (event, item) {
        $scope.stopEventPropagation(event);
        console.info('release...');
        //TODO ...
    };

    $scope.deleteClickAction = function (event, item) {
        $scope.stopEventPropagation(event);
        console.info('delete...');
        //TODO ...
    };

    $scope.confirmAllClickAction = function (event) {
        $scope.stopEventPropagation(event);

        if($scope.selectedItemSize == 0){
            $scope.showWarn('请先选择记录！');
            return;
        }
        $scope.showConfirm('确认审核吗', '', function () {
            var promises = [];
            var bError = false;
            angular.forEach($scope.itemList, function (item) {
                if (item.selected) {
                    var response = Department.modify(item.uuid, {'confirm': '2'}).success(function () {
                        item.confirm = '2';
                    }).error(function (response) {
                        bError = true;
                        $scope.showError(item.no + ' 审核失败：' + response.message);
                    });
                    promises.push(response);
                }
            });
            $q.all(promises).then(function (data) {
                if (!bError) {
                    $scope.showInfo('审核成功！');
                }
                $scope.disableBatchMenuButtons();
            });
        });
    };

    $scope.cancelConfirmAllClickAction = function (event) {
        $scope.stopEventPropagation(event);

        if($scope.selectedItemSize == 0){
            $scope.showWarn('请先选择记录！');
            return;
        }
        $scope.showConfirm('确认取消审核吗', '', function () {
            var promises = [];
            var bError = false;
            angular.forEach($scope.itemList, function (item) {
                if (item.selected) {
                    var response = Department.modify(item.uuid, {'confirm': '1'}).success(function () {
                        item.confirm = '1';
                    }).error(function (response) {
                        bError = true;
                        $scope.showError(item.no + ' 取消审核失败：' + response.message);
                    });
                    promises.push(response);
                }
            });
            $q.all(promises).then(function (data) {
                if (!bError) {
                    $scope.showInfo('取消审核成功！');
                    $scope.disableBatchMenuButtons();
                }
            });
        });
    };

    $scope.statusAllClickAction = function (event) {
        $scope.stopEventPropagation(event);

        if($scope.selectedItemSize == 0){
            $scope.showWarn('请先选择记录！');
            return;
        }
        $scope.showConfirm('确认启用吗', '', function () {
            var promises = [];
            var bError = false;
            angular.forEach($scope.itemList, function (item) {
                if (item.selected) {
                    var response = Department.modify(item.uuid, {'status': '1'}).success(function () {
                        item.status = '1';
                    }).error(function (response) {
                        bError = true;
                        $scope.showError(item.no + ' 启用失败：' + response.message);
                    });
                    promises.push(response);
                }
            });
            $q.all(promises).then(function (data) {
                if (!bError) {
                    $scope.showInfo('启用成功！');
                    $scope.disableBatchMenuButtons();
                }
            });
        });
    };

    $scope.cancelStatusAllClickAction = function (event) {
        $scope.stopEventPropagation(event);

        if($scope.selectedItemSize == 0){
            $scope.showWarn('请先选择记录！');
            return;
        }
        $scope.showConfirm('确认禁用吗', '', function () {
            var promises = [];
            var bError = false;
            angular.forEach($scope.itemList, function (item) {
                if (item.selected) {
                    var response = Department.modify(item.uuid, {'status': '2'}).success(function () {
                        item.status = '2';
                    }).error(function (response) {
                        bError = true;
                        $scope.showError(item.no + ' 禁用失败：' + response.message);
                    });
                    promises.push(response);
                }
            });
            $q.all(promises).then(function (data) {
                if (!bError) {
                    $scope.showInfo('禁用成功！');
                    $scope.disableBatchMenuButtons();
                }
            });
        });
    };

    $scope.releaseAllClickAction = function (event) {
        $scope.stopEventPropagation(event);
        console.info('release all...');
        //TODO ...
    };

    $scope.deleteAllClickAction = function (event) {
        $scope.stopEventPropagation(event);

        if($scope.selectedItemSize == 0){
            $scope.showWarn('请先选择记录！');
            return;
        }

        $scope.showConfirm('确认删除吗', '', function () {
            var promises = [];
            var bError = false;
            angular.forEach($scope.itemList, function (item) {
                if (item.selected) {
                    if(item.status ==  Constant.STATUS[1].value && item.confirm != Constant.CONFIRM[2].value) {
                        var response = Department.delete(item.uuid).success(function () {
                            $scope.refreshList();
                        }).error(function (response) {
                            bError = true;
                            $scope.showError(item.no + ' 删除失败：' + response.message);
                        });
                        promises.push(response);
                    } else {
                        bError = true;
                        $scope.showError(item.no + ' 不允许删除：有效且未审核的记录才可以删除！');
                    }
                }
            });
            $q.all(promises).then(function (data) {
                if (!bError) {
                    $scope.showInfo('删除成功！');
                    $scope.disableBatchMenuButtons();
                }
            });
        });
    };

    $scope.selectAllAction = function () {
        angular.forEach($scope.itemList, function (item) {
            if ($scope.selectAllFlag) {
                item.selected = true;
            } else {
                item.selected = false;
            }
            item.selectedRef = item.selected;
        });

        $scope.selectedItemSize = 0;
        if ($scope.selectAllFlag) {
            angular.forEach($scope.itemList, function (item) {
                $scope.selectedItemSize++;
            })
        }
        $scope.disableBatchMenuButtons();
    };

    $scope.disableBatchMenuButtons = function () {
        var selectedCount = 0;
        var confirm = '';
        var status = '';
        var diffConfirm = false;
        var diffStatus = false;
        angular.forEach($scope.itemList, function (item, index) {
            if (item.selectedRef) {
                selectedCount++;
                if (confirm == '') {
                    confirm = item.confirm;
                } else {
                    if (confirm != item.confirm) {
                        diffConfirm = true;
                    }
                }
                if (status == '') {
                    status = item.status;
                } else {
                    if (status != item.status) {
                        diffStatus = true;
                    }
                }
            }
        });

        if (selectedCount == 0) {
            $scope.disabledBatchConfirm = true;
            $scope.disabledBatchCancelConfirm = true;
            $scope.disabledBatchStatus = true;
            $scope.disabledBatchCancelStatus = true;
        } else {
            if (diffConfirm == true) {
                $scope.disabledBatchConfirm = true;
                $scope.disabledBatchCancelConfirm = true;
            } else if (confirm == '2') {
                $scope.disabledBatchConfirm = true;
                $scope.disabledBatchCancelConfirm = false;
            } else {
                $scope.disabledBatchConfirm = false;
                $scope.disabledBatchCancelConfirm = true;
            }

            if (diffStatus == true) {
                $scope.disabledBatchStatus = true;
                $scope.disabledBatchCancelStatus = true;
            } else if (status == '1') {
                $scope.disabledBatchStatus = true;
                $scope.disabledBatchCancelStatus = false;
            } else {
                $scope.disabledBatchStatus = false;
                $scope.disabledBatchCancelStatus = true;
            }
        }
    };

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////    Department Editor    /////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////
    $scope.editNodeDisabled = false;
    $scope.saveNodeDisabled = true;
    $scope.cancelModifyDisabled = true;
    $scope.quitDisabled = true;

    $scope.formMenuDisplayOption = {
        '102-edit': {display: true, name: '编辑', uuid: 'D7C5647E-6604-41563-8CC2-DF5B3EAB5F70'},
        '302-save': {display: true, name: '保存', uuid: '56F359CF-3FR4-5T4D-B321-D45816621291'},
        '303-cancel': {display: true, name: '取消修改', uuid: '4B958029-E637-4B22-B30F-94AAE55EA680'},
        '304-quit': {display: true, name: '退出编辑', uuid: 'D7BAA884-3F9C-4165-BF58-C22C2C69259A'}
    };

    $scope.initHeaders = function () {
        $scope.headers = [
            {"grade": 1, "name": "1级"},
            {"grade": 2, "name": "2级"},
            {"grade": 3, "name": "3级"},
            {"grade": 4, "name": "4级"},
            {"grade": 5, "name": "5级"},
            {"grade": 6, "name": "6级"}];
        $scope.selectedTemplateData = {};
    };
    $scope.initHeaders();

    $scope.initBody = function (item) {
        $scope.selectedTemplateData = {};
        item.grade = 1;
        $scope.selectedTemplateData[$scope.headers[0].grade] = new Array(item);
        $scope.refreshAddNodeButtonDisplay();
        $scope.nodeDataClickHandler($scope.headers[0].grade, item);
    };
    //$scope.initBody();


    $scope.nodeDataClickHandler = function (selectedGrade, selectedNode) {
        angular.forEach($scope.selectedTemplateData[selectedGrade], function (node) {
            node.selected = false;
        });
        selectedNode.selected = true;
        $scope.selectedNode = selectedNode;
        $scope.backupSelectedNode = $scope.backup(selectedNode);
        $scope.clearChildren(selectedNode);
        Department.getForParent(selectedNode.uuid).success(function (data) {
            if (data && data.content && data.content.length > 0) {
                angular.forEach(data.content, function (item) {
                    item.grade = selectedGrade + 1;
                });
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

            dataHandler(template, node, $scope.selectedItem);
        }
    };

    $scope.backup = function (department) {
        return {
            uuid: department.uuid,
            no: department.no,
            name: department.name,
            status: department.status,
            confirm: department.confirm,
            fullPath: department.fullPath,
            grade: department.grade
        }
    };

    $scope.changeToEditMode = function () {
        $scope.backupSelectedNode = $scope.backup($scope.selectedNode);
        $scope.changeViewStatus(Constant.UI_STATUS.EDIT_UI_STATUS, 0);
    };

    $scope.quitEditMode = function () {
        $scope.showConfirm('修改尚未保存，确认退出编辑吗？', '', function () {
            $scope.selectedNode = $scope.backupSelectedNode;
            $scope.changeViewStatus(Constant.UI_STATUS.VIEW_UI_STATUS, 0);
        });
    };

    $scope.cancelModification = function () {
        if($scope.backupSelectedNode != null) {
            $scope.selectedNode = $scope.backupSelectedNode;
        }
    };

    $scope.updateNodeData = function () {
        $scope.showConfirm('确认修改该节点数据吗？', '', function () {
            if ($scope.selectedNode) {
                $scope.selectedNode.belongCbiBaseDeptUuid = $scope.selectedNode.parentUuid;
                Department.modify($scope.selectedNode.uuid, $scope.selectedNode).success(function (data) {
                    $scope.showInfo('修改节点数据成功。');
                    $scope.selectedNode.no = data.no;
                    $scope.selectedNode.name = data.name;
                    $scope.selectedNode.fullPath = data.fullPath;
                    $scope.selectedNode.parentUuid = data.belongCbiBaseDeptUuid;
                    $scope.selectedNode.belongCbiBaseDeptUuid = data.belongCbiBaseDeptUuid;
                    $scope.backupSelectedNode = $scope.backup($scope.selectedNode);
                }).error(function (data) {
                    $scope.showError('修改节点数据失败: ' + data.message);
                    $scope.selectedNode.no = $scope.backupSelectedNode.no;
                    $scope.selectedNode.name = $scope.backupSelectedNode.name;
                    $scope.selectedNode.fullPath = $scope.backupSelectedNode.fullPath;
                    $scope.selectedNode.parentUuid = $scope.backupSelectedNode.belongCbiBaseDeptUuid;
                    $scope.selectedNode.belongCbiBaseDeptUuid = $scope.backupSelectedNode.belongCbiBaseDeptUuid;
                });
            }
        });
    };

    $scope.refreshAddNodeButtonDisplay = function () {
        angular.forEach($scope.headers, function (header) {
            var showAddButton = ($scope.selectedTemplateData[header.grade - 1] != null && $scope.selectedTemplateData[header.grade - 1].length > 0) || header.grade == 1;
            if ($scope.selectedTemplateData[header.grade - 1] != null) {
                angular.forEach($scope.selectedTemplateData[header.grade - 1], function (node) {
                    if (node.selected) {
                        showAddButton = true;
                    }
                });
            }
            header.showAddButton = showAddButton;
        });
    };

    //add node data
    $scope.addNodeData = function (grade, bRefreshList) {
        var parentUuid = null;
        var parentName = null;
        var fullPath = [];
        var parentNodes = $scope.selectedTemplateData[grade - 1];
        angular.forEach(parentNodes, function (parentNode) {
            if (parentNode.selected) {
                parentUuid = parentNode.uuid;
                parentName = parentNode.name;
                fullPath = [].concat(parentNode.fullPath);
            }
        });

        $mdDialog.show({
            controller: 'DepartmentDlgController',
            templateUrl: 'app/src/app/cbi/department/addDepartment.html',
            parent: angular.element(document.body),
            targetEvent: event,
            locals: {
                parentName: parentName
            }
        }).then(function (data) {
            var departmentInput = {
                no: data.no,
                name: data.name,
                status: data.status,
                confirm: data.confirm,
                belongCbiBaseDeptUuid: parentUuid
            };
            Department.add(departmentInput).success(function (data) {
                fullPath.push(data.name);
                data.fullPath = fullPath;
                data.selected = true;
                data.grade = grade;

                if(bRefreshList){
                    // In list page, just push added item into item list
                    $scope.itemList.push(data);
                } else {
                    if ($scope.selectedTemplateData[grade] == null) {
                        $scope.selectedTemplateData[grade] = [data];
                    } else {
                        $scope.selectedTemplateData[grade].push(data);
                    }
                    var addItem;
                    angular.forEach($scope.selectedTemplateData[grade], function (v) {
                        if (v.uuid == data.uuid) {
                            addItem = v;
                        }

                    });
                    if (addItem != null) {
                        $scope.nodeDataClickHandler(grade, addItem);
                    }
                }
                $scope.showInfo('新增数据成功。');
            }).error(function (response) {
                $scope.showError('新增数据失败: ' + response.message);
            });
        });
    };

    $scope.deleteNodeData = function ($event, item) {
        $scope.showConfirm('确认清除该节点数据吗？', '节点数据删除后不可恢复。', function () {
            Department.delete(item.uuid).success(function () {
                var indexToDelete = -1;
                angular.forEach($scope.selectedTemplateData[item.grade], function (v, index) {
                    if (v.uuid == item.uuid) {
                        indexToDelete = index;
                    }

                });
                $scope.selectedTemplateData[item.grade].splice(indexToDelete, 1);

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
        for (var i = Number(item.grade) + 1; i <= $scope.headers[$scope.headers.length - 1].grade; i++) {
            if ($scope.selectedTemplateData[i] != null) {
                $scope.selectedTemplateData[i].splice(0);
            }
        }
    }

    $scope.openSelectParentDlg = function () {
        $mdDialog.show({
            controller: 'SelectParentDptDlgController',
            templateUrl: 'app/src/app/cbi/department/selectParentDptDlg.html',
            parent: angular.element(document.body),
            targetEvent: event
        }).then(function (parent) {
            $scope.selectedNode.parentUuid = parent.uuid;
            $scope.selectedNode.parentName = parent.name;
            parent.fullPath.push($scope.selectedNode.name)
            $scope.selectedNode.fullPath = parent.fullPath;
        });
    };
});

angular.module('IOne-Production').controller('DepartmentDlgController', function($scope, $mdDialog, parentName) {
    $scope.parentName = parentName;

    $scope.hideDlg = function() {
        $mdDialog.hide($scope.data);
    };

    $scope.cancelDlg = function() {
        $mdDialog.cancel();
    };
});

angular.module('IOne-Production').controller('SelectParentDptDlgController', function ($scope, $mdDialog, Constant, Department) {
    $scope.pageOption = {
        sizePerPage: 5,
        currentPage: 0,
        totalPage: 0,
        totalElements: 0,
        displayModel: 0
    };

    $scope.filter = {
        confirm: Constant.CONFIRM[2].value,
        status: Constant.STATUS[1].value
    };

    $scope.refreshDepartmentList = function (bResetPage) {
        Department.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, $scope.filter).success(function (data) {
            $scope.departmentList = data.content;
            $scope.pageOption.totalElements = data.totalElements;
            $scope.pageOption.totalPage = data.totalPages;
        });
    };

    $scope.refreshDepartmentList();

    $scope.selectDepartment = function (department) {
        //$scope.department = department;
        $mdDialog.hide(department);
    };

    $scope.cancelDlg = function () {
        $mdDialog.cancel();
    };
});
