angular.module('IOne-Production').config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/inv/allo', {
        controller: 'AlloController',
        templateUrl: '/app/src/app/inv/allo/allo.html'
    })
}]);


angular.module('IOne-Production').controller('AlloController', function ($scope, $q, $mdDialog, $timeout, Constant, AlloMasterService, AlloDetailService, AllotExtendDetailService) {
    $scope.pageOption = {
        sizePerPage: 10,
        currentPage: 0,
        totalPage: 100,
        totalElements: 100
    };

    $scope.detailPageOption = {
        sizePerPage: 10,
        currentPage: 0,
        totalPage: 100,
        totalElements: 100
    };

    $scope.listFilterOption = {
        status: Constant.STATUS[0].value,
        confirm: Constant.CONFIRM[0].value,
        transferFlag: Constant.CONFIRM[0].value,
        release: Constant.RELEASE[0].value,
        no: '',
        applyDateStart: '',
        applyDateEnd: ''
    };

    $scope.sortByAction = function (field) {
        $scope.sortByField = field;
        $scope.sortType = '';
    };

    $scope.$watch('listFilterOption', function () {
        $scope.pageOption.currentPage = 0;
        $scope.pageOption.totalPage = 0;
        $scope.pageOption.totalElements = 0;
        $scope.refreshList();
    }, true);

    $scope.clickCustom = function (extends2) {
        console.log($scope.selectedSubTab);
        $scope.selectedExtends2 = extends2;
        $scope.changeSubTabIndexs(2);
        console.log($scope.selectedSubTab);
    };

    $scope.selected = [];
    $scope.selectAllFlag = false;

    $scope.queryDateFormat = function (date) {
        console.log(date);
        if (date != undefined) {
            if (date != null || date != '') {
                var formatDate = new Date(date);
                return moment(formatDate).format('YYYY-MM-DD');
            } else {
                return null;
            }
        } else {
            return null;
        }
    };

    $scope.refreshList = function () {
        var applyDateStart = '';
        var applyDateEnd = '';
        if ($scope.listFilterOption.applyDateStart != '') {
            applyDateStart = $scope.queryDateFormat($scope.listFilterOption.applyDateStart);
        }

        if ($scope.listFilterOption.applyDateEnd != '') {
            applyDateEnd = $scope.queryDateFormat($scope.listFilterOption.applyDateEnd);
        }

        AlloMasterService.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, $scope.listFilterOption.confirm, $scope.listFilterOption.status, $scope.listFilterOption.transferFlag, $scope.listFilterOption.no, applyDateStart, applyDateEnd, RES_UUID_MAP.OCM.PROMOTION.RES_UUID).success(function (data) {
            $scope.itemList = data.content;
            $scope.pageOption.totalPage = data.totalPages;
            $scope.pageOption.totalElements = data.totalElements;
            angular.forEach($scope.itemList, function (item) {
                item.showMorePanel = false;
                $scope.refreshDetailList(item, false);

            });
        });
    };

    $scope.refreshDetailList = function (item, showExtend) {
        AlloDetailService.get(item.uuid).success(function (data) {
            item.detailList = data.content;
            if (showExtend) {
                $scope.refreshSubDetail(item.detailList)
            }
        });
    };


    $scope.refreshSubDetail = function (detailList) {
        var subDeatilList = [];
        var promises = [];
        angular.forEach(detailList, function (detail) {
            var response = AllotExtendDetailService.get(detail.uuid).success(function (subDetailList) {
                angular.forEach(subDetailList.content, function (subDetail) {
                    subDeatilList.push(subDetail);
                });
            });
            promises.push(response);
        });

        $q.all(promises).then(function () {
            $scope.subDataList = subDeatilList;
            console.log($scope.subDataList);
        });
    };;;;;;;;;;;;;;;;;;;;;;


    $scope.refreshList();


    $scope.showDetailPanelAction = function (item) {
        $scope.selectedItem = item;
        $scope.refreshDetailList(item, true);

    };

    $scope.toggleDetailMorePanelAction = function (detail) {
        detail.showMorePanel = !detail.showMorePanel;
    };

    $scope.toggleMorePanelAction = function (item) {
        item.showMorePanel = !item.showMorePanel;


    };

    $scope.selectItemAction = function (event, item) {
        $scope.stopEventPropagation(event);
        var idx = $scope.selected.indexOf(item);
        if (idx > -1) {
            $scope.selected.splice(idx, 1);
        }
        else {
            $scope.selected.push(item);
        }
        $scope.selectItemCount = $scope.selected.length;
    };

    $scope.confirmClickAction = function (event, item) {
        $scope.stopEventPropagation(event);

        if (item.confirm == '1') {
            $scope.showConfirm('确认审核吗？', '', function () {
                alloMasterUpdateInput = {
                    uuid: item.uuid,
                    confirm: '2'
                };
                AlloMasterService.modify(item.uuid, alloMasterUpdateInput).success(function (data) {
                    item.confirm = '2';
                    $scope.refreshList();
                    $scope.showInfo("审核成功!");
                });
            });
        } else {
            $scope.showConfirm('确认取消审核吗？', '', function () {
                alloMasterUpdateInput = {
                    uuid: item.uuid,
                    confirm: '1'
                };
                AlloMasterService.modify(item.uuid, alloMasterUpdateInput).success(function (data) {
                    item.confirm = '1';
                    $scope.refreshList();
                    $scope.showInfo("取消审核成功!");
                });
            });
        }
    };

    $scope.transferClickAction = function (event, item) {

    };


});