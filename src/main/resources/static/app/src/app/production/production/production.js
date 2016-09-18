angular.module('IOne-Production').config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/production', {
        controller: 'ProductionController',
        templateUrl: 'app/src/app/production/production/production.html'
    })
}]);

angular.module('IOne-Production').controller('ProductionController', function ($scope, Production, ProductionPic, ProductionBom, ProductionArea,
                                                                               ProductionBrand, ProductionCustom, ProductionItemCustom, ProductionCatalogueDetails,
                                                                               $mdDialog, $timeout, Constant, Upload, ProductionUnit, ProductionTagService) {
    $scope.listFilterOption = {
        status: Constant.STATUS[0].value,
        confirm: Constant.CONFIRM[0].value,
        release: Constant.RELEASE[0].value,
        prodType: Constant.PROD_TYPE[0].value,
        stopProd: Constant.STOP_PRODUCTION[0].value
    };

    $scope.UNIT_STATUS = Constant.STATUS;

    $scope.listFilterDisplayOption = {
        showStatusFilterMenu: true,
        showConfirmFilterMenu: true,
        showReleaseFilerMenu: true,
        showProdTypeFilterMenu: true,
        showStopProdFilterMenu: true
    };
    $scope.formMenuDisplayOption = {
        '100-add': {display: true, name: '新增', uuid: 'E27EB9F5-CD9E-4F9D-9EA5-DE0FE901E337'},
        '101-delete': {display: true, name: '删除', uuid: '15663443-643D-4C85-841B-169F838FC9FE'},
        '102-edit': {display: true, name: '编辑', uuid: 'A160CF71-11AD-451A-9917-C78D26731C1F'},
        '103-copy': {display: false, name: '复制', uuid: 'E2AD5A24-7DF2-4514-BA09-D3FE8D5F9E25'},
        '104-status': {display: true, name: '启用', uuid: '98212872-75D3-4DB8-894A-CEFDBFA0630C'},
        '105-confirm': {display: true, name: '审核', uuid: 'ECACA0A5-3B3B-4248-AD00-2A2A6C3F46BE'},
        '106-release': {display: true, name: '发布', uuid: '8A98B157-9A7A-4982-9A91-A906EF29B5B2'},

        '200-cancel': {display: true, name: '取消新增', uuid: '6AE5AD61-02B7-4C3B-B820-D4E7581BAC4A'},
        '201-save': {display: true, name: '保存', uuid: 'E22F8EA9-6B3F-47FB-A3C1-E32BAE953161'},

        '300-add': {display: false, name: '新增节点', uuid: 'EB74628F-4354-4E89-BC6B-16AD1D56E494'},
        '301-delete': {display: false, name: '删除节点', uuid: '3AA9227E-BDBC-462B-914D-7A95EF1C0BA7'},
        '302-save': {display: true, name: '保存', uuid: 'EB910C25-3CDF-4E71-9D9A-EADA6F289261'},
        '303-cancel': {display: true, name: '取消修改', uuid: 'BEC26D9A-7A75-485C-AB97-69A83B27E2F4'},
        '304-quit': {display: true, name: '退出编辑', uuid: '889D6CC7-4027-46D9-A2F1-31E26ABB92AE'}
    };

    $scope.pageOption = {
        sizePerPage: 21,
        currentPage: 0,
        totalPage: 0,
        totalElements: 0,
        displayModel: 0  //0 : image + text //1 : image
    };

    $scope.searchQuery = {
        no: '',
        name: ''
    };

    ProductionArea.getAll().success(function (data) {
        $scope.productionAreas = data;
    });

    ProductionBrand.getAll($scope.RES_UUID_MAP.PRODUCTION.PRODUCTION.LIST_PAGE.RES_UUID).success(function (data) {
        $scope.productionBrands = data;
    });


    $scope.refreshProduction = function () {
        Production.getAll($scope.pageOption.sizePerPage,
            $scope.pageOption.currentPage,
            $scope.listFilterOption.confirm,
            $scope.listFilterOption.release,
            $scope.listFilterOption.status,
            $scope.listFilterOption.prodType,
            $scope.listFilterOption.stopProd,
            $scope.searchQuery.no,
            $scope.searchQuery.name,
            $scope.RES_UUID_MAP.PRODUCTION.PRODUCTION.LIST_PAGE.RES_UUID).success(function (data) {
                $scope.allProductionsData = data;
                $scope.pageOption.totalPage = data.totalPages;
                $scope.pageOption.totalElements = data.totalElements;
            }
        );
    };

    $scope.$watch('listFilterOption', function () {
        $scope.pageOption.currentPage = 0;
        $scope.pageOption.totalPage = 0;
        $scope.pageOption.totalElements = 0;
        $scope.refreshProduction();
    }, true);

    $scope.openQuickView = function ($event, production) {
        $mdDialog.show({
            controller: 'QuickViewController',
            templateUrl: 'app/src/app/production/production/quick_view.html',
            parent: angular.element(document.body),
            targetEvent: event,
            locals: {
                productionUuid: production.uuid
            }
        }).then(function (data) {

        });

        $event.stopPropagation();
        $event.preventDefault();
    };

    $scope.showStatusConfirmReleaseMenu = function (isShow) {
        $scope.formMenuDisplayOption['104-status'].display = isShow;
        $scope.formMenuDisplayOption['105-confirm'].display = isShow;
        $scope.formMenuDisplayOption['106-release'].display = isShow;
    };

    $scope.listTabSelected = function () {
        $scope.refreshProduction();
        $scope.selectedItem = null;
        $scope.changeViewStatus(Constant.UI_STATUS.VIEW_UI_STATUS, 0);

        $scope.showStatusConfirmReleaseMenu(true);
    };

    $scope.editItem = function (production) {
        Production.get(production.uuid, $scope.RES_UUID_MAP.PRODUCTION.PRODUCTION.FORM_PAGE.RES_UUID).success(function (data) {
            $scope.selectedItem = data;
            $scope.selectedItem.brandUuid = $scope.selectedItem.brand.uuid;

            if ($scope.selectedItem) {
                //Get pics
                ProductionPic.getAll($scope.selectedItem.uuid).success(function (data) {
                    $scope.picsData = data;
                    $scope.selectedItemPics = [];
                    $scope.selectedItemPics.push($scope.getImageFullPath($scope.selectedItem.path));

                    angular.forEach($scope.picsData.content, function (item) {
                        if (item.path != null) {
                            $scope.selectedItemPics.push($scope.getImageFullPath(item.path));
                        }
                    });
                });

                //Get boms
                if ($scope.selectedItem.type == Constant.PROD_TYPE[1].value) {
                    ProductionBom.getAll($scope.selectedItem.uuid).success(function (data) {
                        $scope.selectedItemBoms = data;

                        $scope.selectedItemBomsLength = 0;
                        angular.forEach($scope.selectedItemBoms.content, function (data) {
                            $scope.selectedItemBomsLength += data.quantity;
                        });
                    });
                }

                //Get units
                ProductionUnit.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage,
                    $scope.selectedItem.uuid).success(function (data) {
                    $scope.selectedItem.unitList = data.content;
                }).error(function (resp) {
                    //$scope.showError('获取单位换算率失败:' + data.message);
                    $scope.selectedItem.unitList = [];
                });

                //Get all custom
                ProductionCustom.getAll().success(function (data) {
                    $scope.allCustoms = data;
                    $scope.allCustomsScopes = {};

                    angular.forEach($scope.allCustoms.content, function (custom) {
                        ProductionCustom.getCustom(custom.uuid).success(function (data) {
                            var value = {};
                            angular.forEach(data.content, function (item) {
                                value[item.uuid] = item;
                            });
                            $scope.allCustomsScopes[custom.uuid] = value;
                        })
                    });

                    //Get customization
                    ProductionItemCustom.get($scope.selectedItem.uuid).success(function (data) {
                        $scope.selectedItemCustoms = data;
                        angular.forEach($scope.selectedItemCustoms.content, function (value) {
                            value.informationUuids = JSON.parse(value.information);
                        })
                    });
                });

                ProductionCatalogueDetails.getByProduction($scope.selectedItem.uuid, 1000, 0).success(function (data) {
                    $scope.selectedItemCatalogues = data;
                    angular.forEach($scope.selectedItemCatalogues.content, function (eachCatalogue, index) {
                        var itemCtgs = {};
                        itemCtgs.catalogues = [];
                        var itemCatalogues = eachCatalogue.catalogue;
                        itemCtgs.catalogues[0] = itemCatalogues;
                        var i = 1;
                        while (itemCatalogues.parentCatalogue !== null) {
                            itemCtgs.catalogues[i] = itemCatalogues.parentCatalogue;
                            itemCatalogues = itemCatalogues.parentCatalogue;
                            i++;
                        }
                        //console.info(itemCtgs);
                        itemCtgs.catalogues = itemCtgs.catalogues.reverse();
                        $scope.selectedItemCatalogues.content[index].itemCtgs = itemCtgs;
                    });
                    //console.info($scope.selectedItemCatalogues);
                });

                //Get all production tags
                $scope.getProductionTags($scope.selectedItem.uuid);
            }
        });
        $scope.changeViewStatus(Constant.UI_STATUS.PRE_EDIT_UI_STATUS, 1);
    };

    $scope.formTabSelected = function () {
        if ($scope.ui_status == Constant.UI_STATUS.PRE_EDIT_UI_STATUS) {
            $scope.showStatusConfirmReleaseMenu(true);
        } else {
            $scope.showStatusConfirmReleaseMenu(false);
        }

        $scope.getMenuAuthData($scope.RES_UUID_MAP.PRODUCTION.PRODUCTION.FORM_PAGE.RES_UUID).success(function (data) {
            $scope.menuAuthDataMap = $scope.menuDataMap(data);
        });
    };

    //Save modification.
    $scope.modifyMenuAction = function () {
        if ($scope.selectedItem) {
            Production.modify($scope.selectedItem).success(function () {
                $scope.showInfo('修改商品数据成功。');
            }).error(function (data) {
                $scope.showError('修改失败:' + data.message);
                //$scope.showError(data.content);
                $scope.cancelModifyMenuAction();
            });
        }
    };

    $scope.cancelModifyMenuAction = function () {
        Production.get($scope.selectedItem.uuid).success(function (data) {
            $scope.selectedItem = data;
            $scope.selectedItem.brandUuid = $scope.selectedItem.brand.uuid;
        })
    };

    $scope.exitModifyMenuAction = function () {
        $scope.cancelModifyMenuAction();
        $scope.changeViewStatus($scope.UI_STATUS.PRE_EDIT_UI_STATUS, 1);
    };

    $scope.preAddMenuAction = function () {
        $scope.selectedItem = {
            stopProductionFlag: 'N',
            eshopType: '1',
            type: '1',
            assemblingFlag: '0',
            customizationFlag: 'Y',
            confirm: '1',
            status: '1',
            release: '1'
        };
        $scope.selectedItemPics = [];
        $scope.selectedItemBoms = {};
        $scope.selectedItemBoms.content = [];
        $scope.selectedItemCustoms = {};
        $scope.selectedItemCustoms.content = [];
        $scope.changeViewStatus($scope.UI_STATUS.EDIT_UI_STATUS_ADD, 1);
    };

    $scope.addMenuAction = function () {
        if ($scope.selectedItem) {
            Production.add($scope.selectedItem).success(function (data) {
                $scope.selectedItem = data;
                $scope.editItem($scope.selectedItem);
                //$scope.changeViewStatus($scope.UI_STATUS.PRE_EDIT_UI_STATUS, 1);
                $scope.changeViewStatus($scope.UI_STATUS.EDIT_UI_STATUS_MODIFY, 1);
                $scope.showInfo('新增商品成功。');
            }).error(function (data) {
                //$scope.showError($scope.getAllError(data));
                if (data.code == "Duplicated") {
                    $scope.showError('新增失败:' + Constant.PRODUCT_ERRORS[data.code].message);
                } else {
                    $scope.showError('新增失败:' + data.message);
                }
            });
        }
    };

    $scope.cancelAddMenuAction = function () {
        $scope.listTabSelected();
    };

    $scope.deleteMenuAction = function () {
        $scope.showConfirm('确认删除吗？', '删除的商品不可恢复。', function () {
            if ($scope.selectedItem) {
                Production.delete($scope.selectedItem.uuid).success(function () {
                    $scope.showInfo('删除成功。');
                    $scope.changeViewStatus($scope.UI_STATUS.EDIT_UI_STATUS_DELETE, 0);
                });
            }
        });
    };

    $scope.openBomSelectDlg = function () {
        $mdDialog.show({
            controller: 'SelectBomController',
            templateUrl: 'app/src/app/production/production/addBomDlg.html',
            parent: angular.element(document.body),
            targetEvent: event,
            locals: {
                selectedItem: $scope.selectedItem,
                selectedBom: {}
            }
        }).then(function (data) {
            if (data.itemUuid == data.parentItemUuid) {
                $scope.showError('新增BOM失败:不能将商品本身添加到BOM');
            } else {
                ProductionBom.add($scope.selectedItem.uuid, data).success(function (newBom) {
                    $scope.selectedItemBoms.content.push(newBom);
                    $scope.showInfo('新增BOM成功。');
                }).error(function (data) {
                    $scope.showError('新增BOM失败:' + data.message);
                })
            }
        });
    };

    $scope.openModifyBomDlg = function (bom) {
        $mdDialog.show({
            controller: 'SelectBomController',
            templateUrl: 'app/src/app/production/production/addBomDlg.html',
            parent: angular.element(document.body),
            targetEvent: event,
            locals: {
                selectedItem: $scope.selectedItem,
                selectedBom: bom
            }
        }).then(function (data) {
            if (data.item.uuid == data.parentItemUuid) {
                $scope.showError('修改BOM失败:不能将商品本身添加到BOM');
            } else {
                ProductionBom.modify($scope.selectedItem.uuid, bom).success(function () {
                    $scope.showInfo('修改BOM成功。');
                }).error(function (data) {
                    $scope.showError('修改BOM失败:' + data.message);
                });
            }
        });
    };

    $scope.openAddCustomDlg = function () {
        $mdDialog.show({
            controller: 'CustomController',
            templateUrl: 'app/src/app/production/production/addCustomDlg.html',
            parent: angular.element(document.body),
            targetEvent: event,
            locals: {
                selectedItem: $scope.selectedItem,
                allCustoms: $scope.allCustoms,
                allCustomsScopes: $scope.allCustomsScopes,
                custom: null,
                op: 'add'
            }
        }).then(function (data) {
            var itemCustom = {
                itemCustomUuid: data.selectedCustom.itemCustom.uuid,
                information: data.selectedCustom.information,
                itemUuid: $scope.selectedItem.uuid,
                no: Math.random().toString(36).substring(10),
                astrict: data.selectedCustom.astrict
            };
            ProductionItemCustom.add($scope.selectedItem.uuid, itemCustom).success(function (response) {
                response.informationUuids = data.selectedCustom.informationUuids;
                $scope.selectedItemCustoms.content.push(response);
                $scope.showInfo('新增自定义信息成功。');
            })
        });
    };

    $scope.openEditCustomDlg = function (custom) {
        $mdDialog.show({
            controller: 'CustomController',
            templateUrl: 'app/src/app/production/production/addCustomDlg.html',
            parent: angular.element(document.body),
            targetEvent: event,
            locals: {
                selectedItem: $scope.selectedItem,
                allCustoms: $scope.allCustoms,
                allCustomsScopes: $scope.allCustomsScopes,
                custom: custom,
                op: 'modify'
            }
        }).then(function (data) {
            ProductionItemCustom.modify($scope.selectedItem.uuid, custom.uuid, data.selectedCustom).success(function () {
                $scope.showInfo('修改自定义信息成功。');
            })
        });
    };

    $scope.deleteItemCustom = function (itemCustom) {
        $scope.showConfirm('确认删除吗？', '删除的自定义信息不可恢复。', function () {
            if (itemCustom) {
                ProductionItemCustom.delete($scope.selectedItem.uuid, itemCustom.uuid).success(function () {
                    angular.forEach($scope.selectedItemCustoms.content, function (item, index) {
                        if (itemCustom == item) {
                            $scope.selectedItemCustoms.content.splice(index, 1);
                        }
                    });
                    $scope.showInfo('删除成功。');
                });
            }
        });
    };

    $scope.deleteBom = function (bom) {
        $scope.showConfirm('确认删除吗？', '删除的BOM不可恢复。', function () {
            if (bom) {
                ProductionBom.delete($scope.selectedItem.uuid, bom.uuid).success(function () {
                    $scope.selectedItemBoms.content.splice($scope.selectedItemBoms.content.indexOf(bom), 1);
                    $scope.showInfo('删除BOM成功。');
                });
            }
        });
    };

    $scope.uploadImage = function (files, type) {
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
                        if (type == 0) { //Big pic
                            if ($scope.selectedItem && $scope.selectedItem.uuid) {
                                Production.addImage($scope.selectedItem.uuid, data.uuid).success(function (response) {
                                    $scope.selectedItemPics[0] = $scope.getImageFullPath(response.path) + '?time=' + new Date().getTime();
                                });

                            }
                        } else if (type == 1) {  //Small Pic
                            ProductionPic.add($scope.selectedItem).success(function (itemPath) {
                                ProductionPic.addImage($scope.selectedItem.uuid, itemPath.uuid, data.uuid).success(function (response) {
                                    $scope.picsData.content.push(response);
                                    $scope.selectedItemPics.push($scope.getImageFullPath(response.path));
                                });
                            });
                        }
                    });
                });
            }
        }
    };

    $scope.currentSmallImageIndex = {value: 0};
    $scope.deleteItemImage = function () {
        if ($scope.currentSmallImageIndex.value == 0 && !$scope.isDefaultImage($scope.selectedItemPics[0])) {
            Production.deleteImage($scope.selectedItem.uuid, 'item').success(function () {
                $scope.selectedItem.path = null;
                $scope.selectedItemPics[0] = $scope.DEFAULT_IMAGE_PATH;
            })
        } else if ($scope.currentSmallImageIndex.value > 0) {
            ProductionPic.deleteImage($scope.selectedItem.uuid, $scope.picsData.content[$scope.currentSmallImageIndex.value - 1].uuid).success(function () {
                $scope.picsData.content.splice($scope.currentSmallImageIndex.value - 1, 1);
                $scope.selectedItemPics.splice($scope.currentSmallImageIndex.value, 1);
            });
        }
    };

    $scope.colorProgress = {value: 0};
    $scope.uploadColorImage = function (files, custom) {
        $scope.colorProgress = {value: 0};
        if (files && files.length) {
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                Upload.upload({
                    url: Constant.BACKEND_BASE + '/files',
                    fields: {},
                    file: file
                }).progress(function (evt) {
                    $scope.colorProgress.value = Math.min(100, parseInt(99.0 * evt.loaded / evt.total));
                }).success(function (data) {
                    $timeout(function () {
                        ProductionColors.addImage(data.uuid).success(function (data) {

                        });
                    });
                });
            }
        }
    };

    //Set menu names
    $scope.$watchCollection('[selectedItem.status, selectedItem.confirm, selectedItem.release]', function () {
        if ($scope.selectedItem) {
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
    });

    $scope.handler = function (field, value) {
        if ($scope.selectedItem && $scope.selectedItem[field]) {
            $scope.selectedItem[field] = value;
            $scope.modifyMenuAction();
        }
    };
    $scope.statusMenuAction = function () {
        $scope.selectedItem.status == '1' ? $scope.handler('status', '2') : $scope.handler('status', '1');
    };
    $scope.confirmMenuAction = function () {
        $scope.selectedItem.confirm == '1' ? $scope.handler('confirm', '2') : $scope.handler('confirm', '1');
    };
    $scope.releaseMenuAction = function () {
        $scope.selectedItem.release == '1' ? $scope.handler('release', '2') : $scope.handler('release', '1');
    };
    $scope.openUnitEditDlg = function (item, selectedUnit) {
        $mdDialog.show({
            controller: 'UnitEditController',
            templateUrl: 'app/src/app/production/production/unitEditDlg.html',
            parent: angular.element(document.body),
            targetEvent: event,
            locals: {
                selectedItem: item,
                selectedUnit: selectedUnit == null ? null : {
                    "item": selectedUnit.item,
                    "uuid": selectedUnit.uuid,
                    "no": selectedUnit.no,
                    "numerator": selectedUnit.numerator,
                    "unit": selectedUnit.unit,
                    "denominator": selectedUnit.denominator,
                    "status": selectedUnit.status
                }
            }
        }).then(function (workingUnit) {
            if (workingUnit.operation === "ADD") {
                workingUnit.itemUuid = $scope.selectedItem.uuid;
                ProductionUnit.add(workingUnit).success(function (respUnit) {
                    $scope.selectedItem.unitList.push(respUnit);
                    $scope.showInfo('新增单位换算率成功。');
                }).error(function (resp) {
                    $scope.showError('新增单位换算率失败:' + resp.message);
                })
            } else if (workingUnit.operation === "EDIT") {
                ProductionUnit.modify(workingUnit).success(function (respUnit) {
                    ProductionUnit.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage,
                        $scope.selectedItem.uuid).success(function (data) {
                        $scope.selectedItem.unitList = data.content;
                    }).error(function (resp) {
                        $scope.showError('获取单位换算率数据失败:' + resp.message);
                    });
                    $scope.showInfo('修改单位换算率成功。');
                }).error(function (resp) {
                    $scope.showError('修改单位换算率失败:' + resp.message);
                })
            }
        });
    };

    $scope.deleteUnit = function (unit) {
        $scope.showConfirm('确认删除吗？', '删除的单位换算率数据不可恢复。', function () {
            ProductionUnit.delete(unit.uuid).success(function () {
                $scope.selectedItem.unitList.splice($scope.selectedItem.unitList.indexOf(unit), 1);
                $scope.showInfo('删除单位换算率成功。');
            }).error(function (resp) {
                $scope.showError('删除单位换算率失败:' + resp.message);
            })
        });
    };

    $scope.productionTags = [];
    $scope.getProductionTags = function (itemUuid) {
        ProductionTagService.getAll(itemUuid).success(function (data) {
            $scope.productionTags = data.content;
        });
    };
    $scope.openTagSelectDlg = function () {
        $mdDialog.show({
            controller: 'TagSelectDlgController',
            templateUrl: 'app/src/app/production/production/TagSelectDlg.html',
            parent: angular.element(document.body),
            targetEvent: event,
            locals: {}
        }).then(function (tagUuid) {
            ProductionTagService.add({itemUuid: $scope.selectedItem.uuid, tagUuid: tagUuid}).success(function () {
                $scope.showInfo('新增商品标签成功。');
                $scope.getProductionTags($scope.selectedItem.uuid);
            }).error(function (data) {
                $scope.showInfo('新增商品标签失敗。');
            });

        });
    };
    $scope.deleteProductionTag = function (uuid) {
        $scope.showConfirm('确认删除商品标签吗？', '', function () {
            ProductionTagService.delete(uuid).success(function () {
                $scope.getProductionTags($scope.selectedItem.uuid);
                $scope.showInfo('删除商品标签成功。');
            });
        });
    }
});

angular.module('IOne-Production').controller('UnitEditController', function ($scope, $mdDialog, Production, selectedItem, selectedUnit) {
    $scope.selectedItem = selectedItem;

    if (selectedUnit == null) {
        $scope.workingUnit = {};
        $scope.workingUnit.operation = "ADD";
    } else {
        $scope.workingUnit = selectedUnit;
        $scope.workingUnit.operation = "EDIT";
    }

    $scope.hideDlg = function () {
        $mdDialog.hide($scope.workingUnit);
    };

    $scope.cancelDlg = function () {
        $mdDialog.cancel();
    };
});

angular.module('IOne-Production').controller('QuickViewController', function ($scope, $mdDialog, Production, ProductionBom, ProductionPic, productionUuid, Constant) {
    $scope.getImageFullPath = function (path) {
        if (path == null) {
            return Constant.BACKEND_BASE + '/app/img/item.jpeg';
        }
        if (path && path.indexOf('IMAGE') == 0) {
            return Constant.BACKEND_BASE + '/app/assets/' + path;
        } else {
            return Constant.BACKEND_BASE + '/app/assets/IMAGE/' + path;
        }
    };

    //Retrieve the production again.
    Production.get(productionUuid).success(function (data) {
        $scope.production = data;

        //Get boms
        if ($scope.production.type == Constant.PROD_TYPE[1].value) {
            ProductionBom.getAll(productionUuid).success(function (data) {
                $scope.boms = data;
                $scope.bomsLength = $scope.boms ? $scope.boms.content.length : 0;
            });
        }

        //Get pics
        ProductionPic.getAll(productionUuid).success(function (data) {
            $scope.picsData = data;

            $scope.pics = [];
            $scope.pics.push($scope.getImageFullPath($scope.production.path));
            angular.forEach($scope.picsData.content, function (item) {
                if ($scope.pics.indexOf(Constant.BACKEND_BASE + '/app/assets/' + item.path) == -1) {
                    $scope.pics.push(Constant.BACKEND_BASE + '/app/assets/' + item.path);
                }
            });
        });
    });

    $scope.cancelDlg = function () {
        $mdDialog.cancel();
    };
});

angular.module('IOne-Production').controller('SelectBomController', function ($scope, $mdDialog, Production, selectedItem, selectedBom) {
    $scope.selectedItem = selectedItem;
    $scope.bom = selectedBom || {};

    $scope.bomItemSearchParam = {
        confirm: 2,
        release: 2,
        status: 1
    };

    if ($scope.bom.effectiveDate) {
        $scope.bom.effectiveDateUI = new Date($scope.bom.effectiveDate);
    } else {
        $scope.bom.effectiveDateUI = new Date();
    }

    if ($scope.bom.expiredDate) {
        $scope.bom.expiredDateUI = new Date($scope.bom.expiredDate);
    } else {
        $scope.bom.expiredDateUI = new Date();
    }

    $scope.selectBom = function (bomProduction) {
        $scope.bom.item = bomProduction;
        $scope.bom.itemUuid = bomProduction.uuid;
        $scope.bom.parentItemUuid = selectedItem.uuid;
    };

    $scope.hideDlg = function () {
        $scope.bom.effectiveDate = moment($scope.bom.effectiveDateUI).format('YYYY-MM-DD');
        $scope.bom.expiredDate = moment($scope.bom.expiredDateUI).format('YYYY-MM-DD');

        $mdDialog.hide($scope.bom);
    };

    $scope.cancelDlg = function () {
        $mdDialog.cancel();
    };
});

angular.module('IOne-Production').controller('CustomController', function ($scope, $mdDialog, Production, ProductionCustom, selectedItem, allCustoms, allCustomsScopes, custom, op) {
    $scope.selectedItem = selectedItem;
    $scope.allCustoms = allCustoms.content;
    $scope.allCustomsScopes = allCustomsScopes;
    $scope.selectedCustom = custom;
    $scope.op = op;

    if ($scope.selectedCustom) {
        angular.forEach($scope.selectedCustom.informationUuids, function (value, index) {
            angular.forEach($scope.allCustomsScopes[$scope.selectedCustom.itemCustom.uuid], function (item) {
                if (item.uuid == value) {
                    item.checked = true;
                }
            })
        });

    } else {
        $scope.selectedCustom = {
            informationUuids: []
        };
    }

    $scope.customChangeHandler = function (customUuid) {
        angular.forEach($scope.allCustoms, function (value, index) {
            if (value.uuid == customUuid) {
                $scope.selectedCustom.itemCustom = value;
                $scope.selectedCustom.astrict = value.astrict;
            }
        });

        angular.forEach($scope.allCustomsScopes[$scope.selectedCustom.itemCustom.uuid], function (item) {
            item.checked = false;
        });

        angular.forEach($scope.selectedCustom.informationUuids, function (value, index) {
            angular.forEach($scope.allCustomsScopes[$scope.selectedCustom.itemCustom.uuid], function (item) {
                if (item.uuid == value) {
                    item.checked = true;
                }
            })
        });
    };

    $scope.checkBoxChangeHandler = function (data, selected) {
        if (selected == true) {
            $scope.selectedCustom.informationUuids.push(data.uuid);
        } else {
            angular.forEach($scope.selectedCustom.informationUuids, function (value, index) {
                if (value == data.uuid) {
                    $scope.selectedCustom.informationUuids.splice(index, 1);
                }
            });
        }
    };

    $scope.hideDlg = function () {
        $scope.selectedCustom.information = JSON.stringify($scope.selectedCustom.informationUuids);
        $mdDialog.hide({
            'selectedCustom': $scope.selectedCustom
        });
    };

    $scope.cancelDlg = function () {
        $mdDialog.cancel();
    };
});

angular.module('IOne-Production').controller('TagSelectDlgController', function ($scope, $mdDialog, $mdToast, TagService) {
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