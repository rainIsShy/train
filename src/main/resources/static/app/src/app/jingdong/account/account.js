angular.module('IOne-Production').config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/jingdong-accounts', {
        controller: 'JdAccountController',
        templateUrl: 'app/src/app/jingdong/account/account.html'
    })
}]);

angular.module('IOne-Production').controller('JdAccountController', function ($scope, $q, JdAccountService, $mdDialog, Constant, $timeout, Upload) {
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
        '401-confirm': {display: true, name: '审核', uuid: 'D8D7F4CB-FEFA-4058-8C6D-2B963EEE0CAB'},
        '402-confirmRevert': {display: true, name: '取消审核', uuid: '71A76BDD-5228-4195-ADCD-49E002CFA050'},
        '403-status': {display: true, name: '启用', uuid: '00E6B823-61D4-48C7-BACD-E9F873BE03CD'},
        '404-statusRevert': {display: true, name: '取消启用', uuid: '76410D25-995F-4E35-930C-66A1647411D7'},
        '405-delete': {display: true, name: '删除', uuid: 'F689543A-1187-47E6-9793-6EF930C1EF4A'},
        '406-query': {display: true, name: '查询', uuid: '589FDC07-6890-4C9A-AD6B-BFB4890C61C6'},

        '411-confirmAll': {display: true, name: '批量审核', uuid: '52A72E73-6B3E-484C-925B-60ADF9AF62E3'},
        '412-confirmRevertAll': {display: true, name: '批量取消审核', uuid: '27441051-7289-4BF2-8DF0-61FB7F650DCC'},
        '413-statusAll': {display: true, name: '批量启用', uuid: '58A509E5-BBBF-4986-A500-D30A102FD631'},
        '414-statusRevertAll': {display: true, name: '批量取消启用', uuid: '915D42A0-418E-4C0E-8797-0F1316D19CA0'},
        '415-deleteAll': {display: true, name: '批量删除', uuid: '5DBE6F45-5BFD-44A1-832C-AEC40C138480'},
        '416-import': {display: true, name: '批量导入', uuid: '5DBE6F45-5BFD-44A1-832C-AEC40C138480'},
    };

    $scope.refreshList = function () {
        JdAccountService.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, $scope.listFilterOption.confirm, $scope.listFilterOption.status,
            $scope.theMax, $scope.RES_UUID_MAP.EPS.JINGDONG_ACCOUNTS.RES_UUID).success(function (data) {
            $scope.itemList = data.content;
            $scope.pageOption.totalPage = data.totalPages;
            $scope.pageOption.totalElements = data.totalElements;

            $scope.resetButtonDisabled();
            $scope.selectAllFlag = false;
            $scope.selected = [];

        });
    };

    $scope.getMenuAuthData($scope.RES_UUID_MAP.EPS.JINGDONG_ACCOUNTS.RES_UUID).success(function (data) {
        $scope.menuAuthDataMap = $scope.menuDataMap(data);
    });

    $scope.$watch('listFilterOption', function () {
        $scope.pageOption.currentPage = 0;
        $scope.pageOption.totalPage = 0;
        $scope.pageOption.totalElements = 0;
        $scope.refreshList();
    }, true);

    $scope.selectAllFlag = false;

    /**
     * Show left detail panel when clicking the title
     */
    $scope.showDetailPanelAction = function (item) {
        $scope.selectedItem = item;
        item.detailList = $scope.subItemList;
        $scope.changeButtonStatusSingle(item);
    };


    $scope.returnToListAction = function (event, item) {
        $scope.stopEventPropagation(event);
        $scope.selectedItem = null;
        $scope.changeButtonStatusAll();
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
            if ($scope.domain == 'EPS_JD_ACCOUNT') {
                JdAccountService.add($scope.source).success(function (data) {
                    $scope.showInfo('新增数据成功。');
                }).error(function () {
                    $scope.showError('新增失败。');
                });

            }
        } else if ($scope.status == 'edit') {
            if ($scope.domain == 'EPS_JD_ACCOUNT') {
                JdAccountService.modify($scope.source.uuid, $scope.source).success(function (data) {
                    $scope.showInfo('修改数据成功。');
                }).error(function () {
                    $scope.showError('修改失败。');
                });
            }
        }
    };

    $scope.confirmClickAction = function (event, item) {
        $scope.stopEventPropagation(event);
        $scope.showConfirm('确认审核吗？', '', function () {
            var EmployeeUpdateInput = {
                uuid: item.uuid,
                confirm: Constant.CONFIRM[2].value
            };
            JdAccountService.modify(EmployeeUpdateInput.uuid, EmployeeUpdateInput).success(function () {
                $scope.selectedItem.confirm = Constant.CONFIRM[2].value;
                $scope.changeButtonStatusSingle($scope.selectedItem);
                $scope.showInfo('修改数据成功。');
            }).error(function (response) {
                          $scope.showError(response.message);
                      });
        });
    };

    $scope.confirmRevertClickAction = function (event, item) {
        $scope.stopEventPropagation(event);
        $scope.showConfirm('确认取消审核吗？', '', function () {
            var EmployeeUpdateInput = {
                uuid: item.uuid,
                confirm: Constant.CONFIRM[1].value
            };
            JdAccountService.modify(EmployeeUpdateInput.uuid, EmployeeUpdateInput).success(function () {
                $scope.selectedItem.confirm = Constant.CONFIRM[1].value;
                 $scope.changeButtonStatusSingle($scope.selectedItem);
                $scope.showInfo('修改数据成功。');
            }).error(function (response) {
                          $scope.showError(response.message);
                      });
        });
    };

    $scope.confirmSwitchAction = function (event, item) {
        $scope.stopEventPropagation(event);
        if (item.confirm == 2) {
            $scope.showConfirm('确认取消审核吗？', '', function () {
                var EmployeeUpdateInput = {
                    uuid: item.uuid,
                    confirm: Constant.CONFIRM[1].value
                };
                JdAccountService.modify(EmployeeUpdateInput.uuid, EmployeeUpdateInput).success(function () {
                    $scope.changeButtonStatusAll();
                    $scope.showInfo('修改数据成功。');
                }).error(function (response) {
                                            $scope.showError(response.message);
                                        });
            }, function () {
                item.confirm = Constant.CONFIRM[2].value
            });
        } else if (item.confirm == 1) {
            $scope.showConfirm('确认审核吗？', '', function () {
                var EmployeeUpdateInput = {
                    uuid: item.uuid,
                    confirm: Constant.CONFIRM[2].value
                };
                JdAccountService.modify(EmployeeUpdateInput.uuid, EmployeeUpdateInput).success(function () {
                    $scope.changeButtonStatusAll();
                    $scope.showInfo('修改数据成功。');
                }).error(function (response) {
                                            $scope.showError(response.message);
                                        });
            }, function () {
                item.confirm = Constant.CONFIRM[1].value;
            });
        }

    };


    $scope.statusClickAction = function (event, item) {
        $scope.stopEventPropagation(event);
        $scope.showConfirm('确认修改启用状态为有效吗？', '', function () {
            var EmployeeUpdateInput = {
                uuid: item.uuid,
                status: Constant.STATUS[1].value
            };
            JdAccountService.modify(EmployeeUpdateInput.uuid, EmployeeUpdateInput).success(function () {
                $scope.selectedItem.status = Constant.STATUS[1].value;
                 $scope.changeButtonStatusSingle($scope.selectedItem);
                $scope.showInfo('修改数据成功。');
            }).error(function (response) {
                                        $scope.showError(response.message);
                                    });
        });
    };

    $scope.statusRevertClickAction = function (event, item) {
        $scope.stopEventPropagation(event);
        $scope.showConfirm('确认修改启用状态为无效吗？', '', function () {
            var EmployeeUpdateInput = {
                uuid: item.uuid,
                status: Constant.STATUS[2].value
            };
            JdAccountService.modify(EmployeeUpdateInput.uuid, EmployeeUpdateInput).success(function () {
                $scope.selectedItem.status = Constant.STATUS[2].value;
                 $scope.changeButtonStatusSingle($scope.selectedItem);
                $scope.showInfo('修改数据成功。');
            }).error(function (response) {
                                        $scope.showError(response.message);
                                    });
        });
    };


    $scope.statusSwithAction = function (event, item) {
        $scope.stopEventPropagation(event);
        if (item.status == 2) {
            $scope.showConfirm('确认修改启用状态为有效吗？', '', function () {
                var EmployeeUpdateInput = {
                    uuid: item.uuid,
                    status: Constant.STATUS[1].value
                };
                JdAccountService.modify(EmployeeUpdateInput.uuid, EmployeeUpdateInput).success(function () {
                    $scope.changeButtonStatusAll();
                    $scope.showInfo('修改数据成功。');
                }).error(function (response) {
                                            $scope.showError(response.message);
                                        });
            }, function () {
                item.status = Constant.STATUS[2].value;
            });
        } else if (item.status == 1) {
            $scope.showConfirm('确认修改启用状态为无效吗？', '', function () {
                var EmployeeUpdateInput = {
                    uuid: item.uuid,
                    status: Constant.STATUS[2].value
                };
                JdAccountService.modify(EmployeeUpdateInput.uuid, EmployeeUpdateInput).success(function () {
                    $scope.changeButtonStatusAll();
                    $scope.showInfo('修改数据成功。');
                }).error(function (response) {
                                            $scope.showError(response.message);
                                        });
            }, function () {
                item.status = Constant.STATUS[1].value;
            });
        }
    };


    $scope.deleteClickAction = function (event, item) {
        $scope.stopEventPropagation(event);
        $scope.showConfirm('确认删除吗？', '删除后不可恢复。', function () {
            JdAccountService.delete(item.uuid).success(function () {
                $scope.selectedItem = null;
                $scope.refreshList();
                $scope.showInfo('删除数据成功。');
            });
        });
    };


    $scope.confirmAllClickAction = function (event) {
        $scope.stopEventPropagation(event);
        if ($scope.selected.length > 0) {
            $scope.showConfirm('确认批量审核吗？', '', function () {
                if ($scope.selected) {
                    var promises = [];
                    angular.forEach($scope.selected, function (item) {
                        var EmployeeUpdateInput = {
                            uuid: item.uuid,
                            confirm: Constant.CONFIRM[2].value
                        };
                        var response = JdAccountService.modify(EmployeeUpdateInput.uuid, EmployeeUpdateInput).success(function (data) {
                        });
                        promises.push(response);
                    });
                    $q.all(promises).then(function () {
                        $scope.showInfo('修改数据成功。');
                        $scope.refreshList();
                    });
                }
            });
        }
    };

    $scope.confirmRevertAllClickAction = function (event) {
        $scope.stopEventPropagation(event);
        if ($scope.selected.length > 0) {
            $scope.showConfirm('确认批量取消审核吗？', '', function () {
                if ($scope.selected) {
                    var promises = [];
                    angular.forEach($scope.selected, function (item) {
                        var EmployeeUpdateInput = {
                            uuid: item.uuid,
                            confirm: Constant.CONFIRM[1].value
                        };
                        var response = JdAccountService.modify(EmployeeUpdateInput.uuid, EmployeeUpdateInput).success(function (data) {
                        });
                        promises.push(response);
                    });
                    $q.all(promises).then(function () {
                        $scope.showInfo('修改数据成功。');
                        $scope.refreshList();
                    });
                }
            });
        }
    };

    $scope.statusAllClickAction = function (event) {
        $scope.stopEventPropagation(event);
        if ($scope.selected.length > 0) {
            $scope.showConfirm('确认批量修改启用状态为有效吗？', '', function () {
                if ($scope.selected) {
                    var promises = [];
                    angular.forEach($scope.selected, function (item) {
                        var EmployeeUpdateInput = {
                            uuid: item.uuid,
                            status: Constant.STATUS[1].value
                        };
                        var response = JdAccountService.modify(EmployeeUpdateInput.uuid, EmployeeUpdateInput).success(function (data) {
                        });
                        promises.push(response);
                    });
                    $q.all(promises).then(function () {
                        $scope.showInfo('修改数据成功。');
                        $scope.refreshList();
                    });
                }
            });
        }
    };

    $scope.statusRevertAllClickAction = function (event) {
        $scope.stopEventPropagation(event);
        if ($scope.selected.length > 0) {
            $scope.showConfirm('确认批量修改启用状态为无效吗？', '', function () {
                if ($scope.selected) {
                    var promises = [];
                    angular.forEach($scope.selected, function (item) {
                        var EmployeeUpdateInput = {
                            uuid: item.uuid,
                            status: Constant.STATUS[2].value
                        };
                        var response = JdAccountService.modify(EmployeeUpdateInput.uuid, EmployeeUpdateInput).success(function (data) {
                        });
                        promises.push(response);
                    });
                    $q.all(promises).then(function () {
                        $scope.showInfo('修改数据成功。');
                        $scope.refreshList();
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
                        var response = JdAccountService.delete(item.uuid).success(function (data) {
                        });
                        promises.push(response);
                    });
                    $q.all(promises).then(function () {
                        $scope.showInfo('删除数据成功。');
                        $scope.refreshList();

                    });
                }
            });
        }
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
        $scope.changeButtonStatusAll();
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
        $scope.changeButtonStatusAll();

    };
    $scope.exists = function (item, selected) {
        return selected.indexOf(item) > -1;
    };

    $scope.selected = [];

    $scope.resetButtonDisabled = function () {
        $scope.confirmClick = 0;
        $scope.confirmRevertClick = 0;
        $scope.statusClick = 0;
        $scope.statusRevertClick = 0;
        $scope.deleteClick = 0;

    };

    $scope.resetButtonDisabledAll = function () {
        $scope.deleteAllClick = 0;
        $scope.statusRevertAllClick = 0;
        $scope.statusAllClick = 0;
        $scope.confirmRevertAllClick = 0;
        $scope.confirmAllClick = 0;
    };

    $scope.changeButtonStatusAll = function () {
        $scope.resetButtonDisabledAll();
        angular.forEach($scope.selected, function (employee) {
            $scope.processChangeButtonStatusAll(employee);
        });
    };

    $scope.changeButtonStatusSingle = function (employee) {
        $scope.resetButtonDisabled();
        $scope.processChangeButtonStatus(employee);
    };

    $scope.processChangeButtonStatus = function (employee) {
        //confirm:1=未审核/2=已审核/3=审核中/4=退回   status:"1=有效/2=无效
        // 未审核和退回状态的单据
        if (employee.confirm == 1 || employee.item == 4) {
            $scope.confirmRevertClick = 1;
        }

        // 已审核和审核中状态的单据
        if (employee.confirm == 2 || employee.item == 3) {
            $scope.confirmClick = 1;
            $scope.statusRevertClick = 1;
        }

        //有效单据
        if (employee.status == 1) {
            $scope.statusClick = 1;
        }

        //无效单据
        if (employee.status == 2) {
            $scope.statusRevertClick = 1;
            $scope.confirmClick = 1;

        }
    };

      $scope.processChangeButtonStatusAll = function (employee) {
        //confirm:1=未审核/2=已审核/3=审核中/4=退回   status:"1=有效/2=无效
        // 未审核和退回状态的单据
        if (employee.confirm == 1 || employee.item == 4) {
            $scope.confirmRevertAllClick = 1;
        }

        // 已审核和审核中状态的单据
        if (employee.confirm == 2 || employee.item == 3) {
            $scope.confirmAllClick = 1;

            $scope.statusRevertAllClick = 1;
        }

        //有效单据
        if (employee.status == 1) {
            $scope.statusAllClick = 1;
        }

        //无效单据
        if (employee.status == 2) {
            $scope.statusRevertAllClick = 1;
            $scope.confirmAllClick = 1;
        }
    };

    $scope.showUserRoles = function (user) {
        if (user.baseUser == undefined) {
            UserService.getUser(user.uuid, 3).success(function (data) {
                user.baseUser = data.content[0];

                UserRoleService.get(user.baseUser.uuid).success(function (data) {
                    user.userRoleList = data;
                });
            });
        }
    };


    $scope.addUserRole = function () {
        $mdDialog.show({
            controller: 'RoleListController',
            templateUrl: 'app/src/app/auth/user/addRoleDlg.html',
            parent: angular.element(document.body),
            targetEvent: event,
            locals: {}
        }).then(function (data) {
            UserRoleService.add($scope.selectedItem.user.uuid, data.selectedRole.uuid).success(function (data) {
                $scope.selectedItem.user.userRoleList = $scope.selectedItem.user.userRoleList || [];
                $scope.selectedItem.user.userRoleList.push(data);
            }).error(function () {
                $scope.showError("新增角色失败，该角色可能已存在。")
            })
        });
    };

    $scope.deleteUserRole = function (userRole) {
        UserRoleService.delete(userRole.uuid).success(function () {
            $scope.selectedItem.user.userRoleList.splice($scope.selectedItem.user.userRoleList.indexOf(userRole), 1);
        })
    };

    //图片路径
    $scope.getEmployeeImageFullPath = function (path, sex) {
        if (path == null || path == undefined) {
            if (sex == 1) {
                return Constant.BACKEND_BASE + '/app/img/male.png';
            } else if (sex == 2) {
                return Constant.BACKEND_BASE + '/app/img/female.png';
            } else {
                return Constant.BACKEND_BASE + '/app/img/unknown.png';
            }
        }
        if (path && path.indexOf('IMAGE') == 0) {
            return Constant.BACKEND_BASE + '/app/assets/' + path;
        } else {
            return Constant.BACKEND_BASE + '/app/assets/IMAGE/' + path;
        }
    };

    //上传图片
    $scope.uploadImage = function (files) {
        $scope.progress = {value: 0};
        if (files && files.length) {
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                Upload.upload({
                    url: Constant.BACKEND_BASE + '/files',
                    fields: {},
                    file: file
                }).progress(function (evt) {
                    $scope.progress.value = Math.min(100, parseInt(99.0 * evt.loaded / evt.total));
                }).success(function (data) {
                    $timeout(function () {
                        if ($scope.selectedItem && $scope.selectedItem.uuid) {
                            JdAccountService.addImage($scope.selectedItem.uuid, data.uuid).success(function (response) {
                                $scope.showInfo("上传成功");
                                $scope.selectedItem.employeeImg = $scope.getEmployeeImageFullPath(response.picPath, response.sex) + '?time=' + new Date().getTime();
                            });
                        }
                    });
                });
            }
        }
    };


    $scope.upload = function (files) {
        $scope.progress = {value: 0};
        if (files && files.length) {
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                Upload.upload({
                    url: Constant.BACKEND_BASE + '/files',
                    fields: {},
                    file: file
                }).progress(function (evt) {
                    $scope.progress.value = Math.min(100, parseInt(99.0 * evt.loaded / evt.total));
                }).success(function (data) {
                    $timeout(function () {
                        JdAccountService.importFile(data.uuid).success(function (response) {
                            $scope.showInfo("导入成功");
                        }).error(function (data) {
                            $scope.showError('导入失败。' + data.message);
                        });
                    });
                });
            }
        }
    };

});
