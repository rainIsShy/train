angular.module('IOne-Production').config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/reports', {
        controller: 'ReportsController',
        templateUrl: 'app/src/app/report/report/report.html'
    });
    $routeProvider.when('/reports/:reportId', {
        controller: 'ReportQueryController',
        templateUrl: 'app/src/app/report/report/query.html'
    });
}]);

angular.module('IOne-Production').service('ReportFileService', function($http, Constant) {
    this.getAll = function(size, page, no, name, sql) {
        return $http.get(Constant.BACKEND_BASE + '/reportFiles', {params: {
            size: size,
            page: page,
            no: no,
            name: name,
            sql: sql
        }});
    };

    this.get = function(uuid) {
        return $http.get(Constant.BACKEND_BASE + '/reportFiles/' + uuid);
    };

    this.add = function(data) {
        if(data.filter) {
            data.filter = JSON.stringify(data.filter);
        }
        return $http.post(Constant.BACKEND_BASE + '/reportFiles', data);
    };

    this.modify = function(data) {
        if(data.filter) {
            data.filter = JSON.stringify(data.filter);
        }
        return $http.patch(Constant.BACKEND_BASE + '/reportFiles/' + data.uuid, data);
    };

    this.delete = function(uuid) {
        return $http.delete(Constant.BACKEND_BASE + '/reportFiles/' + uuid);
    };
});

angular.module('IOne-Production').controller('ReportsController', function($scope, Constant, ReportFileService, $mdDialog) {
    $scope.pageOption = {
        sizePerPage: 10,
        currentPage: 0,
        totalPage: 100,
        totalElements: 100
    };

    $scope.listFilterOption = {
        no : '',
        name: '',
        sql: ''
    };

    $scope.sortByAction = function(field) {
        $scope.sortByField = field;
        $scope.sortType = '';
    };

    $scope.openReportQuery = function(report) {
        $scope.path('/reports/' + report.uuid);
    };

    $scope.refreshList = function() {
        ReportFileService.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage,
            $scope.listFilterOption.no, $scope.listFilterOption.name, $scope.listFilterOption.sql
        ).success(function(data) {
            $scope.itemList = data.content;
            angular.forEach($scope.itemList, function(item) {
                if(item.filter) {
                    item.filter = JSON.parse(item.filter);
                }
            });

            $scope.pageOption.totalPage = data.totalPages;
            $scope.pageOption.totalElements = data.totalElements;
        });
    };
    $scope.itemList = [];
    $scope.refreshList();

    $scope.selectAllFlag = false;

    /**
     * Show left detail panel when clicking the title
     */
    $scope.showDetailPanelAction = function(item) {
        $scope.selectedItem = item;
    };

    /**
     * Show advanced search panel which you can add more search condition
     */
    $scope.showAdvancedSearchAction = function() {
        $scope.displayAdvancedSearPanel = !$scope.displayAdvancedSearPanel;
        $scope.selectedItem = null;
    };

    /**
     * Show more panel when clicking the 'show more' on every item
     */
    $scope.toggleMorePanelAction = function(item) {
        item.showMorePanel = !item.showMorePanel;

        if(item.showMorePanel) {
            item.detailList = $scope.subItemList;
        }
    };

    /**
     * Toggle the advanced panel for detail item in the list
     */
    $scope.toggleDetailMorePanelAction = function(detail) {
        detail.showMorePanel = !detail.showMorePanel;
    };

    /**
     * Change status to list all items
     */
    $scope.listItemAction = function() {
        $scope.changeViewStatus(Constant.UI_STATUS.VIEW_UI_STATUS);
    };

    $scope.add = function() {
        $mdDialog.show({
            controller: 'ReportQueryAddController',
            templateUrl: 'app/src/app/report/report/editDlg.html',
            parent: angular.element(document.body),
            targetEvent: event,
            locals: {
                item: null
            }
        }).then(function(data) {
            ReportFileService.add(data).success(function(response) {
                if(response.filter) {
                    response.filter = JSON.parse(response.filter)
                }
                $scope.itemList.push(response);
                $scope.showInfo('新增成功');
            });
        });
    };

    $scope.edit = function(item) {
        $mdDialog.show({
            controller: 'ReportQueryAddController',
            templateUrl: 'app/src/app/report/report/editDlg.html',
            parent: angular.element(document.body),
            targetEvent: event,
            locals: {
                item: item
            }
        }).then(function(data) {
            ReportFileService.modify(data).success(function(response) {
                if(item.filter) {
                    item.filter = JSON.parse(item.filter);
                }
                $scope.showInfo('修改成功');
            }).error(function() {
                $scope.showError('修改失败');
            });
        });
    };

    $scope.selectItemAction = function(event, item) {
        $scope.stopEventPropagation(event);
        //TODO ...
    };

    $scope.deleteClickAction = function(event, item) {
        $scope.stopEventPropagation(event);

        $scope.showConfirm('', '确认删除？', function () {
            ReportFileService.delete(item.uuid).success(function() {
                $scope.selectedItem = null;
                $scope.itemList.splice($scope.itemList.indexOf(item), 1);
                $scope.showInfo('删除成功');
            })
        });
    };

    $scope.deleteAllClickAction = function(event, item) {
        $scope.stopEventPropagation(event);

        $scope.showConfirm('', '确认删除所选记录？', function () {
            angular.forEach($scope.itemList, function(item) {
                if(item.selected) {
                    ReportFileService.delete(item.uuid).success(function() {
                        $scope.selectedItem = null;
                        $scope.itemList.splice($scope.itemList.indexOf(item), 1);
                        $scope.showInfo('删除成功');
                    })
                }
            })
        });
    };

    $scope.selectAllAction = function() {
        angular.forEach($scope.itemList, function(item) {
            if($scope.selectAllFlag) {
                item.selected = true;
            } else {
                item.selected = false;
            }
        })
    };
});

angular.module('IOne-Production').controller('ReportQueryAddController', function($scope, $routeParams, Constant, $mdDialog, item) {
    $scope.addFilterDlg = false;
    $scope.item = item || {};

    $scope.currentFilter = {};

    $scope.addFilter = function() {
        $scope.item.filter = $scope.item.filter || [];
        $scope.item.filter.push($scope.currentFilter);
    };

    $scope.deleteFilter = function(filterItem) {
        $scope.item.filter.splice($scope.item.filter.indexOf(filterItem), 1);
    };

    $scope.hideDlg = function() {
        $mdDialog.hide($scope.item);
    };

    $scope.cancelDlg = function() {
        $mdDialog.cancel();
    };
});


angular.module('IOne-Production').controller('ReportQueryController', function($scope, $http, $routeParams, $compile, $window, ReportFileService, Constant) {
    $scope.getTableWidth = function() {
        return $('#report-banner').width();
    };


    $scope.reportUuid = $routeParams.reportId;

    $scope.pageOption = {
        sizePerPage: 50,
        currentPage: 0,
        totalPage: 100,
        totalElements: 100
    };

    ReportFileService.get($scope.reportUuid).success(function(data) {
        $scope.report = data;
        if($scope.report.filter) {
            $scope.report.filter = JSON.parse($scope.report.filter);
        }
    });

    $scope.filterDataValue = {};

    $scope.queryData = function() {
        $scope.filterData = {};
        angular.forEach($scope.report.filter, function(item) {
            var newItem = {
                name: item.name,
                value: item.value,
                type: item.type,
                data: $scope.filterDataValue[item.value],
                like: item.like
            };

            $scope.filterData[item.value] = newItem;
        });

        $http.post(Constant.BACKEND_BASE + '/objects/data', {
            sql: $scope.report.sql,
            filter: $scope.filterData,
            page: $scope.pageOption.currentPage,
            size: $scope.pageOption.sizePerPage
        }).success(function(data) {
            $scope.reportData = data.content;
            $scope.pageOption.totalPage = data.totalPages;
            $scope.pageOption.totalElements = data.totalElements;
        })
    };

    $scope.exportData = function() {
        $scope.filterData = {};
        angular.forEach($scope.report.filter, function(item) {
            var newItem = {
                name: item.name,
                value: item.value,
                type: item.type,
                data: $scope.filterDataValue[item.value],
                like: item.like
            };

            $scope.filterData[item.value] = newItem;
        });

        $http.post(Constant.BACKEND_BASE + '/objects/export', {
            sql: $scope.report.sql,
            filter: $scope.filterData,
            page: $scope.pageOption.currentPage,
            size: $scope.pageOption.sizePerPage
        }).success(function(data) {
            if(data) {
                var anchor = angular.element('<a/>');
                anchor.attr({
                    href: 'data:attachment/csv;base64,' + encodeURI(btoa(unescape(encodeURIComponent(data)))),
                    target: '_blank',
                    download: 'export.csv'
                })[0].click();
            } else {
                $scope.showError('Failed to export data.');
            }
        })
    };
});
