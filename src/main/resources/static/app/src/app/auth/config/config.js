angular.module('IOne-Production').config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/auth/config', {
        controller: 'AuthConfigController',
        templateUrl: 'app/src/app/auth/config/config.html'
    })
}]);

angular.module('IOne-Production').controller('AuthConfigController', function($scope, $http, Constant, SysCptService, $mdDialog,
                                                                              SysMenusService, UserService, DataBanService, DataPermitService,
                                                                              CptService, MenuService, ResService, RoleService, FunctionService) {
    $scope.userPageOption = {
        sizePerPage: 10,
        currentPage: 0,
        totalPage: 0,
        totalElements: 10,
        displayModel: 0  //0 : image + text //1 : image
    };

    $scope.rolePageOption = {
        sizePerPage: 10,
        currentPage: 0,
        totalPage: 0,
        totalElements: 10,
        displayModel: 0  //0 : image + text //1 : image
    };

    $scope.functionPageOption = {
        sizePerPage: 10,
        currentPage: 0,
        totalPage: 0,
        totalElements: 10,
        displayModel: 0  //0 : image + text //1 : image
    };

    $scope.formMenuDisplayOption = {
        '100-add': {display: false, name: '新增', uuid: ''},
        '101-delete': {display: false, name: '删除', uuid: ''},
        '102-edit': {display: true, name: '编辑', uuid: '27E2D251-BAC4-41E6-AB0C-B8BA64F58E3A'},
        '103-copy': {display: false, name: '复制', uuid: '333566DF-308E-43BB-BE05-9B11FA612470'},
        '104-status': {display: false, name: '启用', uuid: ''},
        '105-confirm': {display: false, name: '审核', uuid: ''},
        '106-release': {display: false, name: '发布', uuid: ''},

        '200-cancel': {display: false, name: '取消新增', uuid: ''},
        '201-save': {display: false, name: '保存', uuid: ''},

        '300-add': {display: false, name: '新增节点', uuid: ''},
        '301-delete': {display: false, name: '删除节点', uuid: ''},
        '302-save': {display: false, name: '保存', uuid: '5DB55B26-4DEF-421D-B0EF-2D01BAC55595'},
        '303-cancel': {display: false, name: '取消修改', uuid: ''},
        '304-quit': {display: true, name: '退出编辑', uuid: 'D9B1BB56-1320-4BFE-ABC8-CD7ED6751B2B'}
    };

    $scope.searchKeyword = {
        func: '',
        role: '',
        user: ''
    };

    //Get all possible names of system cpts.
    SysCptService.getAllAvailableNames().success(function(data) {
        $scope.allSysCptNames = data;
    });

    $scope.toggleTreeNode = function(tree, node) {
        //tree.toggle();

        $scope.selectedTreeNode = node;

        //Get cpt only where
        if (node && node.nodes && node.nodes.length == 0) {
            $scope.cptList = null;
            $scope.menuList = null;
            $scope.permitDataList = null;
            $scope.banDataList = null;
            $scope.detailCpts = null;
            $scope.detailMenus = null;

            $scope.selectedSysMenu = null;
            $scope.selectedSysCpt = null;

            SysCptService.getAll(node.uuid).success(function(data) {
                $scope.cptList = data;

                CptService.getAll($scope.entityType, $scope.selectedItem.uuid, '', node.uuid).success(function(data) {
                    $scope.detailCpts = data;

                    angular.forEach(data, function(value, index) {
                        angular.forEach($scope.cptList, function(cpt) {
                            if(cpt.uuid == value.sysCpt.uuid && value.displayFlag == '1') {
                                cpt.checked = true;
                            }
                        })
                    });
                });
            });

            SysMenusService.getAll(node.uuid).success(function(data) {
                $scope.menuList = data;

                //Get all data of current selected user or role or function for menus.
                MenuService.getAll($scope.entityType, $scope.selectedItem.uuid, '', node.uuid).success(function(data) {
                    $scope.detailMenus = data;

                    angular.forEach(data, function(value, index) {
                        angular.forEach($scope.menuList.content, function(menu) {
                            if(menu.uuid == value.sysMenu.uuid) {
                                menu.checked = true;
                            }
                        })
                    });
                });
            });


        }
    };

    $scope.getResTree = function() {
        if($scope.isNotValid($scope.resTree)) {
            $http.get(Constant.BACKEND_BASE + '/sysRess/resTree').success(function(data) {
                $scope.resTree = data;
            });
        }
    };

    $scope.iterateResTree = function(tree) {
        angular.forEach(tree, function(data, value) {
            if($scope.isValid($scope.currentEntityResMap[data.uuid])) {
                data.checked = true;
            } else {
                data.checked = false;
            }

            if (data.nodes.length > 0) {
                $scope.iterateResTree(data.nodes);
            }
        })
    };

    $scope.getResTree();

    $scope.cptClickHandler = function(type, cpt) {
        if($scope.selectedItem == undefined) {
            $scope.showWarn('请从列表中选择一个职能，角色或者账号。');
            return
        }
        $scope.permitDataList = null;
        $scope.banDataList = null;
        $scope.$parent.selectedSysCptObject = null;
        $scope.selectedSysCpt = cpt;

        DataPermitService.getAllValues(type, $scope.selectedItem.uuid, cpt.uuid, cpt.sysRes.uuid).success(function(data) {
            $scope.permitDataList = data;
        });
        DataBanService.getAllValues(type, $scope.selectedItem.uuid, cpt.uuid, cpt.sysRes.uuid).success(function(data) {
            $scope.banDataList = data;
        });
    };

    $scope.menuClickHandler = function(type, menu) {
        $scope.selectedSysMenu = menu;
    };

    $scope.getFunctions = function() {
        FunctionService.getAll($scope.functionPageOption.sizePerPage, $scope.functionPageOption.currentPage, '', $scope.searchKeyword.func).success(function(data) {
            $scope.allFunctions = data;
            $scope.functionPageOption.totalPage = data.totalPages;
            $scope.functionPageOption.totalElements = data.totalElements;
        });
    };

    $scope.getRoles = function() {
        RoleService.getAll($scope.rolePageOption.sizePerPage, $scope.rolePageOption.currentPage, '', $scope.searchKeyword.role).success(function(data) {
            $scope.allRoles = data;
            $scope.rolePageOption.totalPage = data.totalPages;
            $scope.rolePageOption.totalElements = data.totalElements;
        });
    };

    $scope.userType = 1;
    $scope.getUsers = function() {
        UserService.getAll($scope.userPageOption.sizePerPage, $scope.userPageOption.currentPage, '', $scope.userType, '', $scope.searchKeyword.user).success(function(data) {
            $scope.allUsers = data;
            $scope.userPageOption.totalPage = data.totalPages;
            $scope.userPageOption.totalElements = data.totalElements;
        });
    };

    $scope.refreshUsers = function() {
        $scope.getUsers();
        $scope.selectedItem = null;
    };

    $scope.getFunctions();
    $scope.getRoles();
    $scope.getUsers();

    $scope.selectEntity = function(entity, type) {
        $scope.entityType = type; //'user'
        $scope.selectedItem = entity;
        $scope.selectedEntityTabIndex = type - 1;
        $scope.selectedTreeNode = null;
        $scope.cptList = null;
        $scope.menuList = null;
        $scope.permitDataList = null;
        $scope.banDataList = null;
        $scope.detailCpts = null;
        $scope.detailMenus = null;
        $scope.detailRes = null;

        $scope.selectedSysCpt = null;
        $scope.selectedSysMenu = null;

        ResService.getAll($scope.entityType, $scope.selectedItem.uuid).success(function(data) {
            $scope.detailRes = data;

            $scope.currentEntityResMap = {};
            angular.forEach($scope.detailRes, function(value, index) {
                $scope.currentEntityResMap[value.sysRes.uuid] = value;
            });

            $scope.iterateResTree($scope.resTree);
        });
    };

    $scope.listTabSelected = function() {
        $scope.changeViewStatus(Constant.UI_STATUS.VIEW_UI_STATUS, 0);
    };

    $scope.formTabSelected = function() {
        $scope.getMenuAuthData($scope.RES_UUID_MAP.AUTH.CONFIG.FORM_PAGE.RES_UUID).success(function(data) {
            $scope.menuAuthDataMap = $scope.menuDataMap(data);
        });
    };

    $scope.editItem = function(item) {
        $scope.selectedItem = item;
        $scope.changeViewStatus(Constant.UI_STATUS.EDIT_UI_STATUS_ADD, 1);
    };

    $scope.resTreeCheckBoxHandler = function(node) {
        if($scope.isEditing && $scope.entityType && $scope.selectedItem) {
            if(node.checked == false) {
                ResService.add($scope.entityType, $scope.selectedItem.uuid, node.uuid).success(function(data) {
                    $scope.detailRes.push(data);
                });
            } else {
                //Find the menu or data and delete it.
                angular.forEach($scope.detailRes, function(value, index) {
                    if(value.sysRes.uuid == node.uuid) {
                        ResService.delete(value.uuid);
                    }
                })
            }
        }
    };

    $scope.menuCheckBoxHandler = function(sysMenu) {
        if($scope.isEditing && $scope.entityType && $scope.selectedItem) {
            if(sysMenu.checked == undefined || sysMenu.checked == false) {
                MenuService.add($scope.entityType, $scope.selectedItem.uuid, sysMenu.uuid).success(function(data) {
                    $scope.detailMenus.push(data);
                });
            } else {
                angular.forEach($scope.detailMenus, function(value, index) {
                    if(value.sysMenu.uuid == sysMenu.uuid) {
                        MenuService.delete(value.uuid);
                    }
                })
            }
        }
    };

    $scope.cptCheckBoxHandler = function(sysCpt) {
        if($scope.isEditing && $scope.entityType && $scope.selectedItem) {
            if(sysCpt.checked == undefined || sysCpt.checked == false) {
                //需要判断当前是否已经存在。
                var currentCpt = null;
                for(var i = 0; i<$scope.detailCpts.length ; i++) {
                    if($scope.detailCpts[i].sysCpt && $scope.detailCpts[i].sysCpt.uuid == sysCpt.uuid) {
                        currentCpt = $scope.detailCpts[i];
                        break;
                    }
                }
                if(currentCpt) {
                    currentCpt.displayFlag = 1;
                    CptService.modify(currentCpt);

                } else {
                    CptService.add($scope.entityType, $scope.selectedItem.uuid, sysCpt.uuid, 1).success(function(data) {
                        $scope.detailCpts.push(data);
                    });
                }
            } else {
                angular.forEach($scope.detailCpts, function(value, index) {
                    if(value.sysCpt && value.sysCpt.uuid == sysCpt.uuid) {
                        value.displayFlag = 2;
                        CptService.modify(value);
                    }
                })
            }
        }
    };

    $scope.exitModifyMenuAction = function() {
        $scope.changeViewStatus($scope.UI_STATUS.PRE_EDIT_UI_STATUS, 1);
    };

    $scope.canAddPermitBanData = function() {
        if($scope.selectedSysCpt && $scope.isEditing) {
            return true;
        } else {
            return false;
        }
    };

    $scope.addPermitData = function() {
        $mdDialog.show({
            controller: 'DataListController',
            templateUrl: 'app/src/app/auth/config/dataListDlg.html',
            parent: angular.element(document.body),
            targetEvent: event,
            locals: {
                selectedSysRes: $scope.selectedTreeNode,
                selectedSysCpt: $scope.selectedSysCpt
            }
        }).then(function(data) {
            DataPermitService.add($scope.entityType, $scope.selectedItem.uuid, data.selectedData.valueUuid, $scope.selectedSysCpt.uuid).success(function(response) {
                if($scope.permitDataList) {
                    if(data.selectedObject) {
                        $scope.permitDataList.push(data.selectedObject);
                    } else {
                        $scope.permitDataList.push(response)
                    }
                }
            });
        });
    };

    $scope.deletePermitData = function(data) {
        if($scope.selectedSysCpt.objectFlag == '1') {
            DataPermitService.delete(null, $scope.entityType, $scope.selectedItem.uuid, data.uuid || data.UUID, $scope.selectedSysCpt.uuid).success(function() {
                $scope.permitDataList.splice($scope.permitDataList.indexOf(data), 1);
            });
        } else {
            DataPermitService.delete(data.uuid).success(function() {
                $scope.permitDataList.splice($scope.permitDataList.indexOf(data), 1);
            });
        }
    };

    $scope.addBanData = function() {
        $mdDialog.show({
            controller: 'DataListController',
            templateUrl: 'app/src/app/auth/config/dataListDlg.html',
            parent: angular.element(document.body),
            targetEvent: event,
            locals: {
                selectedSysRes: $scope.selectedTreeNode,
                selectedSysCpt: $scope.selectedSysCpt
            }
        }).then(function(data) {
            DataBanService.add($scope.entityType, $scope.selectedItem.uuid, data.selectedData.valueUuid, $scope.selectedSysCpt.uuid).success(function(response) {
                if($scope.banDataList) {
                    if(data.selectedObject) {
                        $scope.banDataList.push(data.selectedObject);
                    } else {
                        $scope.banDataList.push(response)
                    }
                }
            });
        });
    };

    $scope.deleteBanData = function(data) {
        if($scope.selectedSysCpt.objectFlag == '1') {
            DataBanService.delete(null, $scope.entityType, $scope.selectedItem.uuid, data.uuid || data.UUID, $scope.selectedSysCpt.uuid).success(function() {
                $scope.banDataList.splice($scope.banDataList.indexOf(data), 1);
            });
        } else {
            DataBanService.delete(data.uuid).success(function() {
                $scope.banDataList.splice($scope.banDataList.indexOf(data), 1);
            });
        }
    };


    $scope.addSysCpt = function() {
        $mdDialog.show({
            controller: 'AddSysCptController',
            templateUrl: 'app/src/app/auth/config/addSysCptDlg.html',
            parent: angular.element(document.body),
            targetEvent: event,
            locals: {
                allSysCptNames: $scope.allSysCptNames
            }
        }).then(function(data) {
            SysCptService.add(data.sysCpt.name, data.sysCpt.value, $scope.selectedTreeNode.uuid, data.sysCpt.objectFlag).success(function(data) {
                $scope.cptList = $scope.cptList || [];
                $scope.cptList.push(data);
                CptService.getAll($scope.entityType, $scope.selectedItem.uuid, '', $scope.selectedTreeNode.uuid).success(function(data) {
                    $scope.detailCpts = data;

                    angular.forEach(data, function(value, index) {
                        angular.forEach($scope.cptList, function(cpt) {
                            if(value.sysCpt && cpt.uuid == value.sysCpt.uuid && value.displayFlag == '1') {
                                cpt.checked = true;
                            }
                        })
                    });
                });
            })
        });
    };

    $scope.deleteSysCpt = function(sysCpt) {
        $scope.showConfirm('确认删除吗？', '允许和禁止数据会被同步删除。', function() {
            if(sysCpt) {
                SysCptService.delete(sysCpt.uuid).success(function() {
                    $scope.cptList.splice($scope.cptList.indexOf(sysCpt), 1);
                    $scope.permitDataList = null;
                    $scope.banDataList = null;
                    $scope.showInfo('删除成功。');
                });
            }
        });
    }
});

angular.module('IOne-Production').controller('DataListController', function($mdDialog, $scope, $http, Constant, selectedSysRes, selectedSysCpt) {
    $scope.selectedSysCpt = selectedSysCpt;
    $scope.selectedSysRes = selectedSysRes;

    if($scope.selectedSysCpt.objectFlag == '1') {
        var url = Constant.BACKEND_BASE + "/";

        if(SYS_CPT_API_MAP[$scope.selectedSysCpt.value]) {
            url += SYS_CPT_API_MAP[$scope.selectedSysCpt.value]
        } else {
            url += $scope.selectedSysCpt.value + 's';
        }

        url += '?resUuid=' + selectedSysRes.uuid + '&size=1000000';
        console.log('the url is : ' + url);
        $http.get(url).success(function(data) {
            if(angular.isDefined(data.content)) {
                $scope.dataList = data.content;
            } else {
                $scope.dataList = data;
            }
        });
    }

    $scope.selectedData = {
        valueUuid: ''
    };

    $scope.selectAction = function(item) {
        $scope.searching = false;
        $scope.selectedData.valueUuid = $scope.selectedSysCpt.objectFlag == '1'? item['uuid'] : item;
    };

    $scope.$watch('selectedData.valueUuid', function() {
        angular.forEach($scope.dataList, function(value, index) {
            if(value.uuid == $scope.selectedData.valueUuid) {
                $scope.selectedObject = value;
            }
        });
    });

    $scope.hideDlg = function() {
        $mdDialog.hide({
            'selectedData' : $scope.selectedData,
            'selectedObject' : $scope.selectedObject
        });
    };

    $scope.cancelDlg = function() {
        $mdDialog.cancel();
    };
});



angular.module('IOne-Production').controller('AddSysCptController', function($mdDialog, $scope, allSysCptNames) {
    $scope.allSysCptNames = allSysCptNames;
    $scope.sysCpt = {
        name: '',
        value: '',
        objectFlag: "1"
    };
    $scope.hideDlg = function() {
        $mdDialog.hide({
            'sysCpt' : $scope.sysCpt
        });
    };

    $scope.selectAction = function(value) {
        $scope.sysCpt.value = value.value;
        $scope.sysCpt.objectFlag = value.objectFlag;
        $scope.searching = false;
    };

    $scope.$watch('sysCpt.value', function() {
        $scope.sysCpt.objectFlag = $scope.allSysCptNames[$scope.sysCpt.value].objectFlag;
    });

    $scope.cancelDlg = function() {
        $mdDialog.cancel();
    };
});