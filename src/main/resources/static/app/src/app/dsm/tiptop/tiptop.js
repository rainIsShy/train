angular.module('IOne-Production').config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/dsm/tiptop', {
        controller: 'TipTopController',
        templateUrl: 'app/src/app/dsm/tiptop/tiptop.html'

    })
}]);

angular.module('IOne-Production').controller('TipTopController', function ($scope, SynchronizationService, ChannelLevelService, ChannelService, OrderExtendDetail, Constant, $mdDialog, $q) {
    $scope.pageOption = {
        sizePerPage: 10,
        currentPage: 0,
        totalPage: 100,
        totalElements: 100
    };

    $scope.DB_TYPE = {
         1: {value: '1', name: '直营'},
         2: {value: '2', name: '经销商'}
    }

    $scope.selected = [];

    $scope.formMenuDisplayOption = {
        '100-query': {display: true, name: '查询', uuid: 'bc992fa3-944c-41f1-8866-1a2eadd028ab'},
        '102-add': {display: true, name: '新增', uuid: 'f0c705be-b91b-4e22-aed8-aad004b99505'},
        '103-delete': {display: true, name: '删除', uuid: 'd815c1c4-3bae-4c47-8dd1-220f7df88338'},
        '104-batchDelete': {display: true, name: '批量删除', uuid: 'a6339fb5-e468-48a1-89fd-7d1682a260ce'},
        '105-edit': {display: true, name: '编辑', uuid: '24f3ebb1-33c0-4368-b8bc-4787cc7b848a'},
        '106-detailDelete': {display: true, name: '删除', uuid: '9d1dd65d-be87-47a5-9d4f-815e21e4196f'},
        '107-detailAdd': {display: true, name: '点击新增', uuid: '8a3239a4-2a04-4fb2-ae92-1b75b2d697f0'}
    };

    $scope.listFilterOption = {
        status: Constant.STATUS[0].value,
        confirm: Constant.CONFIRM[0].value,
        release: Constant.RELEASE[0].value,
        dbType: $scope.DB_TYPE[1].value
    };

    $scope.sortByAction = function (field) {
        $scope.sortByField = field;
        $scope.sortType = '';
    };

    $scope.queryAction = function () {
        $scope.refreshList();
    };

    $scope.refreshList = function () {
        SynchronizationService.getAllParameter($scope.dbTypeKeyWord,$scope.keyWord).success(function (data) {
            $scope.itemList = data.content;
            $scope.getSynType();
        });
    };

    $scope.refreshSubList = function (item) {
        SynchronizationService.getAllParameter(item.syncType).success(function (data) {
            $scope.subItemList = data.content;
            item.detailList = $scope.subItemList;
        });
    };

    $scope.getSynType = function(){
        $scope.itemSynType = {};
        var tempSynType = [];
        angular.forEach($scope.itemList, function(item){
            if(tempSynType[item.syncType]){
                return;
            }
            tempSynType[item.syncType] = true;
            tempSynType.push(item);
        });
        $scope.itemSynType = tempSynType;
        $scope.tempSynTypePage =  Math.ceil(tempSynType.length/$scope.pageOption.sizePerPage);
        $scope.pageOption.totalPage = $scope.tempSynTypePage;
        $scope.pageOption.totalElements = tempSynType.length;
    }

    $scope.pageDetailOption = {
        sizePerPage: 10,
        currentPage: 0,
        totalPage: 100,
        totalElements: 100
    };

    $scope.$watch('listFilterOption', function () {
        $scope.pageOption.currentPage = 0;
        $scope.pageOption.totalPage = 0;
        $scope.pageOption.totalElements = 0;
        $scope.refreshList();
    }, true);


    $scope.queryEnter = function (e) {
        if (e.keyCode === 13) {
            $scope.pageOption.currentPage = 0;
            $scope.pageOption.totalPage = 0;
            $scope.pageOption.totalElements = 0;
            $scope.refreshList();
        }
    };

    $scope.selectAllFlag = false;


    $scope.showDetailPanelAction = function (item) {
        $scope.refreshSubList(item);
        $scope.selectedItem=item;
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
    $scope.editItemAction = function (source, desc) {
        $scope.changeViewStatus(Constant.UI_STATUS.EDIT_UI_STATUS);
        $scope.desc = desc;
        $scope.status = 'edit';
        $scope.addItem = source;
    };

    /**
     * Add new item which will take the ui to the edit page.
     */
    $scope.preAddItemAction = function (source, domain, desc) {
        $scope.changeViewStatus(Constant.UI_STATUS.EDIT_UI_STATUS);
        $scope.desc = desc;
        $scope.source = source;
        $scope.domain = domain;
        $scope.addItem = {};
        if ($scope.domain == 'ChannelLevelDetail') {
            $scope.status = 'add';
            $scope.addItem.syncType = $scope.selectedItem.syncType;
        }
        if ($scope.domain == 'ChannelLevelMaster') {
            $scope.status = 'addNew';
        }
    };

    /**
     * Save object according current status and domain.
     */
     $scope.saveItemAction = function () {
         $scope.addItem.dbType = $scope.listFilterOption.dbType;
         $scope.addItem.status = Constant.STATUS[1].value;
         $scope.addItem.confirm = Constant.CONFIRM[1].value;
         if($scope.status != 'edit'){
             SynchronizationService.add($scope.addItem).success(function(){
                 $scope.showInfo("新增成功!");
                 if($scope.domain == 'ChannelLevelDetail'){
                     $scope.refreshSubList($scope.selectedItem);
                     $scope.listItemAction();
                     $scope.showDetailPanelAction($scope.selectedItem);
                     return;
                 }
                 if($scope.domain == 'ChannelLevelMaster'){
                     $scope.refreshList();
                     $scope.listItemAction();
                     return;
                 }
             });
         }

         if($scope.status = 'edit'){
             SynchronizationService.modify($scope.addItem.uuid,$scope.addItem).success(function () {
                 $scope.showInfo("修改成功!");
                 $scope.refreshSubList($scope.selectedItem);
                 $scope.refreshList();
                 $scope.listItemAction();
             });
         }

     }

    /**
     * Delete detail item
     */
    $scope.deleteDetailAction = function (detail) {
        $scope.showConfirm('确认删除吗？', '删除后不可恢复。', function () {
            SynchronizationService.delete(detail.uuid).success(function (data) {
                $scope.showInfo("删除成功!");
                $scope.refreshSubList($scope.selectedItem);
                $scope.refreshList();
            });
        });
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
        console.info('confirm...');
        //TODO ...
    };

    $scope.statusClickAction = function (event, item) {
        $scope.stopEventPropagation(event);
        console.info('status...');
        //TODO ...
    };

    $scope.releaseClickAction = function (event, item) {
        $scope.stopEventPropagation(event);
        console.info('release...');
        //TODO ...
    };

     $scope.deleteClickAction = function (event, item) {
        $scope.stopEventPropagation(event);
        $scope.showConfirm('确认删除吗？', '删除后不可恢复。', function () {
            angular.forEach($scope.subItemList,function(listItem){
                if(item.syncType == listItem.syncType){
                    SynchronizationService.delete(listItem.uuid).success(function (data) {
                         $scope.showInfo("删除成功!");
                         $scope.refreshList();
                         $scope.selectedItem=null;
                         $scope.listItemAction();
                    });
                };
            });
        });
     };

    $scope.confirmAllClickAction = function (event) {
        $scope.stopEventPropagation(event);
        console.info('confirm all...');
        //TODO ...
    };

    $scope.statusAllClickAction = function (event) {
        $scope.stopEventPropagation(event);
        console.info('status all...');
        //TODO ...
    };

    $scope.releaseAllClickAction = function (event) {
        $scope.stopEventPropagation(event);
        console.info('release all...');
        //TODO ...
    };

    $scope.deleteAllClickAction = function (event) {
        $scope.stopEventPropagation(event);
        $scope.showConfirm('确认删除吗？', '删除后不可恢复。', function () {
            console.log($scope.selected);
            if ($scope.selected) {
                var promises = [];
                angular.forEach($scope.selected, function (item) {
                    angular.forEach($scope.itemList,function(listItem){
                        if(item.syncType == listItem.syncType){
                            var response = SynchronizationService.delete(listItem.uuid).success(function (data) {
                            })
                        };
                        promises.push(response);
                    });
                });
                $q.all(promises).then(function () {
                    $scope.showInfo('删除数据成功。');
                    $scope.refreshList();
                    $scope.selectItemCount = 0;
                    $scope.selected = [];
                });
            }
        });
    };

    $scope.selectAllAction = function () {
        if ($scope.selectAllFlag == true) {
            angular.forEach($scope.itemList, function (item) {
                item.selected = true;
                $scope.selected.push(item);
            });
        } else {
            angular.forEach($scope.itemList, function (item) {
                item.selected = false;
            });
            $scope.selected = [];
        }
    };

});


