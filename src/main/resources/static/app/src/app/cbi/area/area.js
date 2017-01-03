angular.module('IOne-Production').config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/cbi/area', {
        controller: 'CBIAreaController',
        templateUrl: 'app/src/app/cbi/area/area.html'
    })
}]);

angular.module('IOne-Production').controller('CBIAreaController', function ($scope, Area, MdmArea, Constant, $mdDialog) {
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

    $scope.initData = function () {
        $scope.headers = [
            {"grade": 1, "name": "1级"},
            {"grade": 2, "name": "2级"},
            {"grade": 3, "name": "3级"},
            {"grade": 4, "name": "4级"},
            {"grade": 5, "name": "5级"},
            {"grade": 6, "name": "6级"}
            ];
        $scope.secondHeaders = [
            {"grade": 7, "name": "淘宝省"},
            {"grade": 8, "name": "淘宝市"},
            {"grade": 9, "name": "淘宝区"},
            {"grade": 10, "name": "淘宝镇"},
            {"grade": 11, "name": "京东省"},
            {"grade": 12, "name": "京东市"},
            {"grade": 13, "name": "京东区"},
            {"grade": 14, "name": "城市类型"}
            ];

        $scope.selectedTemplateData = {};
    };
    $scope.initData();


    $scope.nodeDataClickHandler = function (selectedGrade, selectedItem) {
        angular.forEach($scope.selectedTemplateData[selectedGrade], function (node) {
            node.selected = false;
        });
        selectedItem.selected = true;
        $scope.selectedItem = selectedItem;
        $scope.backupSelectedItem = $scope.backup($scope.selectedItem);
        $scope.clearChildren(selectedItem);
        Area.getForParent(selectedItem.uuid).success(function (data) {
            if (data && data.content && data.content.length > 0) {
                $scope.selectedTemplateData[selectedGrade + 1] = data.content;
            }
            $scope.isRefreshing = false;
        }).error(function () {
            $scope.isRefreshing = false;
        });
        $scope.refreshAddNodeButtonDisplay();
    };

    $scope.selectTmallAndJdArea=function(selectedItem){
        MdmArea.getAll().success(function (data) {
            $scope.mdmAreaList=data.content;
            var secondMdmAreaList=[];

            angular.forEach($scope.mdmAreaList,function(data){
                if(data.area.uuid==selectedItem.uuid){
                    secondMdmAreaList.push(data);
                }
                $scope.secondMdmAreaList=secondMdmAreaList;
            });
        }).error(function () {
             $scope.showError("查询不成功,信息可能不存在");
        });
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
            Area.getForGrade(node.grade).success(function (data) {
                dataHandler(template, node, data.content);
            });

        }
    };

    $scope.refreshAllTemplate = function () {
        Area.getForGrade($scope.headers[0].grade).success(function (data) {
            var setFirstOpen = false;

            if (data && data.content) {
                $scope.selectedTemplateData[$scope.headers[0].grade] = data.content;
                $scope.refreshAddNodeButtonDisplay();
            }
        });
        $scope.selectedItem = null;
    };
    $scope.refreshAllTemplate();

    $scope.backup = function (area) {
        return {
            uuid: area.uuid,
            no: area.no,
            name: area.name,
            grade: area.grade,
            parentUuid: area.parentUuid,
            fullPath: area.fullPath
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
                Area.modify($scope.selectedItem).success(function () {
                    $scope.showInfo('修改节点数据成功。');
                    $scope.backupSelectedItem = $scope.backup($scope.selectedItem);
                }).error(function () {
                    $scope.showError('修改节点数据失败: ');
                    $scope.selectedItem.no= $scope.backupSelectedItem.no;
                    $scope.selectedItem.name= $scope.backupSelectedItem.name;
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
    $scope.addNodeData = function (grade) {
        var parentUuid = null;
        var parentNodes = $scope.selectedTemplateData[grade - 1];
        angular.forEach(parentNodes, function (parentNode) {
            if (parentNode.selected) {
                parentUuid = parentNode.uuid;
            }
        });

        $mdDialog.show({
            controller: 'DialogController',
            templateUrl: 'app/src/app/cbi/area/addArea.html',
            parent: angular.element(document.body),
            targetEvent: event
        }).then(function (data) {
            var areaInput = {
                no: data.no,
                name: data.name,
                grade: grade,
                parentUuid: parentUuid
            };
            Area.add(areaInput).success(function (data) {
                data.selected = true;
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
                $scope.showInfo('新增数据成功。');
            }).error(function (response) {
                $scope.showError('新增数据失败: ' + response.message);
            });
        });
    };

    $scope.deleteNodeData = function ($event, item) {
        $scope.showConfirm('确认清除该节点数据吗？', '节点数据删除后不可恢复。', function () {
            Area.delete(item.uuid).success(function () {
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
    $scope.maintenanceArea=function(selectedItem){
            $mdDialog.show({
            controller: 'MaintenanceController',
            templateUrl: 'app/src/app/cbi/area/maintenanceArea.html',
            parent: angular.element(document.body),
            targetEvent: event,
            locals: {
                parent: $scope,
                selectedItem: $scope.selectedItem,
            }
            });
        }

});

angular.module('IOne-Production').controller('MaintenanceController', function ($scope,$q,$mdToast,MdmArea,Area,$mdDialog, Constant, parent, selectedItem) {
        $scope.cityType={
            1: {value: '1', name: '直辖市'},
            2: {value: '2', name: '普通城市'}
        }


        $scope.selectedItem=selectedItem;
        listFilterOption = {
           status: Constant.STATUS[1].value,
           confirm: Constant.CONFIRM[2].value,
        };

        $scope.$watch('listFilterOption', function () {
                $scope.selectTmallAndJdArea();
        }, true);

        $scope.selectTmallAndJdArea=function(){
            MdmArea.getAll().success(function (data) {
            $scope.mdmAreaList=data.content;
            var secondMdmAreaList=[];

            angular.forEach($scope.mdmAreaList,function(data){
                if(data.area.uuid==selectedItem.uuid){
                    secondMdmAreaList.push(data);
                }
                $scope.secondMdmAreaItem=secondMdmAreaList[0];
            });
            }).error(function(){
                $scope.showError("地区信息加载失败,请重试");
            });

            Area.getOne(selectedItem.uuid).success(function (data) {
                    $scope.areaList=data;
            });
        };

        $scope.cancelDlg = function(){
            $mdDialog.cancel();
        }
        $scope.updateArea = function(){
         if ($scope.secondMdmAreaItem) {
            MdmArea.modify($scope.secondMdmAreaItem.uuid,$scope.secondMdmAreaItem).success(function () {
                toastr["success"]('修改节点数据成功。');
            }).error(function () {
                toastr["error"]('修改节点数据失败: ');
            });
        };
            $mdDialog.hide();
        }

        $scope.addArea = function(){
         if ($scope.secondMdmAreaItem) {
            $scope.secondMdmAreaItem.areaUuid=$scope.areaList.uuid;
            $scope.secondMdmAreaItem.cbiBaseAreaName=$scope.areaList.name;
            $scope.secondMdmAreaItem.cbiBaseAreaParentUuid=$scope.areaList.parentUuid;
            MdmArea.add($scope.secondMdmAreaItem).success(function () {
               toastr["success"]('添加数据成功。');
            }).error(function () {
               toastr["error"]('添加数据失败: ');

            });
        };
            $mdDialog.hide();
        }

});


