angular.module('IOne-Production').config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/dsm/rule', {
        controller: 'DSMRuleController',
        templateUrl: 'app/src/app/dsm/rule/rule.html'
    })
}]);


angular.module('IOne-Production').controller('DSMRuleController', function($scope, Constant, DsmRuleService, DsmAdaptorsService) {
    $scope.listFilterOption = {
        status :  Constant.STATUS[0].value
    };

    $scope.$watch('listFilterOption', function(newValue, oldValue) {
        if(newValue.status != oldValue.status) {
            $scope.pageOption.currentPage = 0;
            $scope.pageOption.totalPage = 0;
            $scope.pageOption.totalElements = 0;
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

        '300-add': {display: false, name: '新增节点', uuid: ''},
        '301-delete': {display: false, name: '删除节点', uuid: ''},
        '302-save': {display: true, name: '保存', uuid: ''},
        '303-cancel': {display: true, name: '取消修改', uuid: ''},
        '304-quit': {display: true, name: '退出编辑', uuid: ''}
    };

    $scope.refreshAllEntities = function() {
        DsmRuleService.query({}, function (data) {
            $scope.allEntities = data;
        });
    };

    $scope.loadSrcObject = function() {
        DsmAdaptorsService.getObjectFromAdaptor($scope.selectedItem.srcAdaptor).success(function(data) {
            $scope.srcObjectList = data;
        });
    };

    $scope.loadSrcObjectFields = function() {
        DsmAdaptorsService.getFieldsFromObject($scope.selectedItem.srcAdaptor).success(function(data) {
            $scope.srcObjectList = data;
        });
    };

    $scope.listTabSelected = function() {
        $scope.refreshAllEntities();
        $scope.selectedItem = null;
        $scope.changeViewStatus(Constant.UI_STATUS.VIEW_UI_STATUS, 0);
    };

    $scope.formTabSelected = function() {
        DsmAdaptorsService.getAdaptors().success(function(data) {
            $scope.adaptorList = data;
        });
    };

    $scope.editItem = function(rule) {
        $scope.selectedItem = rule;
        $scope.changeViewStatus(Constant.UI_STATUS.PRE_EDIT_UI_STATUS, 1);
    };

    $scope.preAddMenuAction = function() {
        $scope.selectedItem = {
            srcAdaptor: '',
            dstAdaptor: '',
            rule: {
                tables: {
                    src: [],
                    dst: {
                        name: ''
                    }
                },
                columns: {}
            }
        };
        $scope.changeViewStatus($scope.UI_STATUS.EDIT_UI_STATUS_ADD, 1);
    };

    $scope.addMenuAction = function() {
        DsmRuleService.save({}, $scope.selectedItem, function(data) {
            $scope.changeViewStatus($scope.UI_STATUS.EDIT_UI_STATUS_MODIFY, 1);
            $scope.showInfo("新增规则成功。");
        }, function() {
            $scope.showError("新增规则失败。");
        });
    }
});