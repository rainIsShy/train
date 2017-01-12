angular.module('IOne-Production').config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/allotApp', {
        controller: 'AllotAppController',
        templateUrl: 'app/src/app/inv/allotApp/allotApp.html'
    })
}]);

angular.module('IOne-Production').controller('AllotAppController', function ($mdDialog, $scope, $location, Constant, OrderMaster, OrderDetail, AlloMasterService, AllotTypeService, ChannelLevelService, OCMChannelService) {

    $scope.allotQuery = {
        orderNo: $location.$$search.orderNo,
        orderUuid: $location.$$search.orderUuid,
        allotTypeNo: $location.$$search.allotTypeNo,
        channelUuid: $location.$$search.channelUuid

    };

    $scope.allotMaster = {
        no: '',
        applyDate: '',
        allotTypeNo: '',
        allotTypeName: '',
        outChannel: {},
        outChannelName: '',
        inChannel: {},
        inChannelName: '',
        area: {}
    };

    $scope.ALLOTTYPE = {
        6402: {value: '6402', name: '上馆'}, 6404: {value: 'N', name: '转馆'}
    };

    $scope.pageOption = {
        sizePerPage: 5,
        currentPage: 0,
        totalPage: 0,
        totalElements: 0
    };

    $scope.refreshList = function () {

        OrderDetail.getAllBySalesSampleType(
            $scope.pageOption.sizePerPage,
            $scope.pageOption.currentPage,
            $scope.allotQuery.orderUuid
        ).success(function (data) {
            $scope.itemList = data.content;
            $scope.pageOption.totalPage = data.totalPages;
            $scope.pageOption.totalElements = data.totalElements;
        });

    };

    $scope.initialApp = function () {
        $scope.changeViewStatus(Constant.UI_STATUS.VIEW_UI_STATUS);

        OrderMaster.get($scope.allotQuery.orderUuid).success(function (data) {
            $scope.allotQuery.orderNo = data.no;
            $scope.initData();
        });
    };;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

    $scope.initData = function () {
        $scope.allotTypeFlag = $scope.allotQuery.allotTypeNo == "6402" ? true : false;
        $scope.allotMaster.allotTypeNo = $scope.allotQuery.allotTypeNo;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
        AlloMasterService.getAllFromApp($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, 0, 0, $scope.allotQuery.allotTypeNo, $scope.allotQuery.orderNo).success(function (data) {
            if (data.totalElements > 0) {
                $scope.changeViewStatus(Constant.UI_STATUS.VIEW_UI_STATUS);
            } else {
                //可新增狀態
                $scope.changeViewStatus(Constant.UI_STATUS.EDIT_UI_STATUS);

                var formatDate = new Date();
                moment(formatDate).format('YYYY-MM-DD');
                $scope.allotMaster.applyDate = moment(formatDate).format('YYYY-MM-DD');
                $scope.allotMaster.allotTypeNo = $scope.allotQuery.allotTypeNo;

                $scope.refreshList();
                ChannelLevelService.getByChannelUuid($scope.allotQuery.channelUuid).success(function (data) {
                    $scope.channelLevelList = data.content;
                    angular.forEach($scope.channelLevelList, function (item) {
                        $scope.allotMaster.inChannel = item.channel;
                        //true: 上館; false:轉館
                        if ($scope.allotTypeFlag) {
                            OCMChannelService.get(item.parentOcmBaseChanUuid).success(function (data) {
                                $scope.allotMaster.outChannel = data;
                            });
                        } else {
                            ChannelLevelService.getByParentOcmBaseChanUuid(item.parentOcmBaseChanUuid).success(function (data) {
                                $scope.outChannelList = data.content;
                            });
                        }
                    });

                });
            }
        });


    };


    $scope.initialApp();
    // $scope.refreshList();

    $scope.openChannelDlg = function () {
        if (!$scope.allotTypeFlag) {
            $mdDialog.show({
                controller: 'AllotChannelSelectController',
                templateUrl: 'app/src/app/inv/allotApp/selectChannel.html',
                parent: angular.element(document.body),
                targetEvent: event,
                locals: {
                    domain: $scope.domain,
                    channelUuid: $scope.allotQuery.channelUuid
                }
            }).then(function (data) {
                $scope.allotMaster.outChannel = data.channel;
            });
        }
    };

    $scope.openAreaDlg = function () {
        $mdDialog.show({
            controller: 'AllotAreaSelectController',
            templateUrl: 'app/src/app/inv/allotApp/selectArea.html',
            parent: angular.element(document.body),
            targetEvent: event,
            locals: {}
        }).then(function (data) {
            $scope.allotMaster.area = data;
            console.log(data);
        });
    };

    $scope.openItemDlg = function () {
        $mdDialog.show({
            controller: 'AllotItemSelectController',
            templateUrl: 'app/src/app/inv/allotApp/selectItems.html',
            parent: angular.element(document.body),
            targetEvent: event,
            locals: {}
        }).then(function (data) {
            var orderDetail = {
                item: data
            };

            $scope.itemList.push(orderDetail);
            console.log($scope.itemList);
        });
    };

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
});

angular.module('IOne-Production').controller('AllotChannelSelectController', function ($scope, $mdDialog, ChannelLevelService, domain, channelUuid) {
    $scope.pageOption = {
        sizePerPage: 5,
        currentPage: 0,
        totalPage: 0,
        totalElements: 0,
        displayModel: 0  //0 : image + text //1 : image
    };

    console.log(channelUuid);
    $scope.domain = domain;
    $scope.channelUuid = channelUuid;
    console.log($scope.channelUuid);


    $scope.refreshChannel = function () {
        ChannelLevelService.getByChannelUuid($scope.channelUuid).success(function (data) {
            $scope.channelLevelList = data.content;
            console.log($scope.channelLevelList);
            angular.forEach($scope.channelLevelList, function (channel) {
                console.log(channel);
                ChannelLevelService.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, 0, 0, '', '', '', '', channel.parentOcmBaseChanUuid, '', '').success(function (data) {
                    $scope.allChannel = data.content;
                    console.log($scope.allChannel);
                });
            });
        });

    };

    $scope.refreshChannel();

    $scope.selectChannel = function (item) {
        $scope.channel = item;
        $mdDialog.hide($scope.channel);
    };

    $scope.hideDlg = function () {
        $mdDialog.hide($scope.channel);
    };
    $scope.cancelDlg = function () {
        $mdDialog.cancel();
    };
});

angular.module('IOne-Production').controller('AllotAreaSelectController', function ($scope, $mdDialog, Area) {
    $scope.pageOption = {
        sizePerPage: 5,
        currentPage: 0,
        totalPage: 0,
        totalElements: 0
    };


    $scope.refreshArea = function () {
        var grade2Uuid = '723F3CCA-79C5-4C00-BEAF-C74622B54142';
        Area.getGradeAndParentUuid(3, grade2Uuid).success(function (data) {
            $scope.areaGrade3List = data.content;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
            console.log($scope.areaGrade3List);
        });
    };


    $scope.refreshSubArea = function (grade, parentUuid) {
        console.log(grade);
        console.log(parentUuid);
        Area.getGradeAndParentUuid(grade, parentUuid).success(function (data) {
            if (grade == '4') {
                $scope.areaGrade4List = data.content
            } else {
                $scope.areaGrade5List = data.content
            }

            console.log(data.content);
        });
    };

    $scope.refreshArea();

    $scope.selectArea = function (item) {
        $scope.selectedItem = item;

        $mdDialog.hide($scope.selectedItem);
    };

    $scope.hideDlg = function (item) {
        $scope.selectedItem = item;
        $mdDialog.hide($scope.selectedItem);
    };
    $scope.cancelDlg = function () {
        $mdDialog.cancel();
    };
});


angular.module('IOne-Production').controller('AllotItemSelectController', function ($scope, $mdDialog, Constant, Catalogue, ProductionCatalogueDetails) {
    $scope.pageOption = {
        sizePerPage: 16,
        currentPage: 0,
        totalPage: 0,
        totalElements: 0,
        displayModel: 0  //0 : image + text //1 : image
    };

    var today = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');

    $scope.refreshProduction = function (catalogueUuid) {
        ProductionCatalogueDetails.getAllByAppCatalogue($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, catalogueUuid, today).success(function (data) {
                console.log(data);
                $scope.allProductionsData = data;
                $scope.pageOption.totalPage = data.totalPages;
                $scope.pageOption.totalElements = data.totalElements;
            }
        );
    };

    $scope.refreshCatalogue = function () {
        Catalogue.getAppCatalogue(today).success(function (data) {
            $scope.catalogueList = data.content;
        });
    };;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

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

    $scope.refreshCatalogue();
    $scope.refreshProduction('');

    $scope.selectItem = function (item) {
        $scope.selectedItem = item;
        $mdDialog.hide($scope.selectedItem);
    };

    $scope.hideDlg = function (item) {
        $mdDialog.hide(item);
    };
    $scope.cancelDlg = function () {
        $mdDialog.cancel();
    };
});



