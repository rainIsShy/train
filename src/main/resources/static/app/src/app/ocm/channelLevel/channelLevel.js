angular.module('IOne-Production').config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/channelLevel', {
        controller: 'ChannelLevelController',
        templateUrl: 'app/src/app/ocm/channelLevel/channelLevel.html'

    })
}]);

angular.module('IOne-Production').controller('ChannelLevelController', function ($scope, ChannelLevelService, ChannelService, OrderExtendDetail, Constant, $mdDialog, $q) {
    $scope.pageOption = {
        sizePerPage: 10,
        currentPage: 0,
        totalPage: 100,
        totalElements: 100
    };

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
        release: Constant.RELEASE[0].value
    };

    $scope.sortByAction = function (field) {
        $scope.sortByField = field;
        $scope.sortType = '';
    };

    $scope.queryAction = function () {
        $scope.refreshList();
    };

    $scope.refreshList = function () {
        ChannelService.getAllParent($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, 0, 0, $scope.keyword, $scope.keyword, RES_UUID_MAP.OCM.CHANNEL_LEVEL.RES_UUID).success(function (data) {
            $scope.itemList = data.content;
            // var mapTotalElements={};
            // var totalElements=0;
            // angular.forEach($scope.itemList,function(item){
            //     if(mapTotalElements[item.parentOcmBaseChanUuid]){
            //         return;
            //     }
            //     mapTotalElements[item.parentOcmBaseChanUuid]=true;
            //     totalElements=totalElements+1;
            // });

            // $scope.pageOption.totalElements = totalElements;
            // $scope.pageOption.totalPage = Math.floor($scope.pageOption.totalElements/$scope.pageOption.sizePerPage)+1;
            // $scope.getChannelParent();

            $scope.pageOption.totalElements = data.totalElements;
            $scope.pageOption.totalPage = data.totalPages;

            angular.forEach($scope.itemList, function (item) {
                item.detailList = [];
                $scope.getParentChannel(item);
                $scope.refreshSubList(item);
            });

        });
    };

    $scope.pageDetailOption = {
        sizePerPage: 10,
        currentPage: 0,
        totalPage: 100,
        totalElements: 100
    };

    $scope.refreshSubList = function (item) {
        ChannelLevelService.getAll($scope.pageDetailOption.sizePerPage, $scope.pageDetailOption.currentPage, '', '', '', '', '', '', item.uuid, item.uuid, RES_UUID_MAP.OCM.CHANNEL_LEVEL.RES_UUID).success(function (data) {
            $scope.subItemList = data.content;
            $scope.pageDetailOption.totalPage = data.totalPages;
            $scope.pageDetailOption.totalElements = data.totalElements;
            item.detailList = $scope.subItemList;

        });
    };

    $scope.getChannelName = function (item) {
        ChannelService.get(item.parentOcmBaseChanUuid).success(function (data) {
            item.parentOcmBaseChanName = data.name;
        });
    };

    $scope.getParentChannel = function (item) {
        ChannelLevelService.getByChannelUuid(item.uuid).success(function (data) {
            if (data.content) {
                angular.forEach(data.content, function (parent) {
                    item.parentOcmBaseChanUuid = parent.parentOcmBaseChanUuid;
                    $scope.getChannelName(item);
                })

            }
        });
    };

    // $scope.getChannelParent = function (){
    //     $scope.itemParent=[];
    //     var mapParentOcmBaseUuid = {};
    //     $scope.tempParentOcmBaseUuid = [];
    //     angular.forEach($scope.itemList,function(item){
    //         if(mapParentOcmBaseUuid[item.parentOcmBaseChanUuid]){
    //             return;
    //         }
    //         mapParentOcmBaseUuid[item.parentOcmBaseChanUuid] = true;
    //         $scope.tempParentOcmBaseUuid.push(item.parentOcmBaseChanUuid);
    //     });
    //
    //     var startCurrentPageTotal=$scope.pageOption.currentPage*$scope.pageOption.sizePerPage;
    //     var endCurrentPageTotal=startCurrentPageTotal+$scope.pageOption.sizePerPage;
    //     for(var i=startCurrentPageTotal;i<$scope.tempParentOcmBaseUuid.length;i++){
    //         ChannelService.get($scope.tempParentOcmBaseUuid[i]).success(function (data){
    //             $scope.itemParent.push(data);
    //         });
    //         if(i == $scope.tempParentOcmBaseUuid.length-1 || i == endCurrentPageTotal-1){
    //             break;
    //         }
    //     }
    //
    // };

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

    /**
     * Show left detail panel when clicking the title
     */
    $scope.showDetailPanelAction = function (item) {
        $scope.pageDetailOption.currentPage = 0;
        $scope.refreshSubList(item);
        // angular.forEach($scope.itemList,function(list){
        //     if(item.uuid==list.uuid){
        //         ChannelService.get(list.parentOcmBaseChanUuid).success(function (data){
        //             $scope.parentOcmBaseChanName = data.name;
        //             $scope.parentOcmBaseChanUuid = data.uuid;
        //         });
        //     }else{
        //             $scope.parentOcmBaseChanName=null;
        //             $scope.parentOcmBaseChanUuid = null;
        //     }
        // });
        $scope.selectedItem=item;
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
        console.log(item);
        item.showMorePanel = !item.showMorePanel;
        $scope.refreshSubList(item);
        if (item.showMorePanel) {
            // item.detailList = $scope.subItemList;
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
    $scope.editItemAction = function (source, desc) {
        $scope.changeViewStatus(Constant.UI_STATUS.EDIT_UI_STATUS);
        $scope.desc = desc;
        $scope.status = 'edit';
        $scope.addItem = {
            channelUuid: source.uuid,
            channelName: source.name,
            parentChannelUuid: source.parentOcmBaseChanUuid,
            parentChannelName: source.parentOcmBaseChanName
        };
        if($scope.status = 'edit'){
            $scope.addItem.parentChannelName = $scope.parentOcmBaseChanName;
        }
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
        $scope.tempParentChannelUuid=$scope.parentOcmBaseChanUuid;
        if ($scope.domain == 'ChannelLevelDetail') {
            $scope.status = 'add';
            $scope.addItem.parentOcmBaseChanUuid = $scope.selectedItem.uuid;
            $scope.addItem.parentChannelName = $scope.selectedItem.name;
        }
        if ($scope.domain == 'ChannelLevelMaster') {
            $scope.status = 'addParent';
            $scope.addItem.parentOcmBaseChanUuid = $scope.selectedItem.uuid;
            $scope.addItem.parentChannelName = $scope.selectedItem.name;
        }
    };

    /**
     * Save object according current status and domain.
     */
    $scope.saveItemAction = function () {
        if ($scope.addItem.channelUuid == $scope.addItem.parentChannelUuid) {
            $scope.showError('此上层渠道己存在层级中，无法新增!');
            return;
        }

        if ($scope.status == 'add' || $scope.status=='addParent') {
            ChannelLevelService.validLoop($scope.addItem.channelUuid, $scope.addItem.parentOcmBaseChanUuid).success(function (data) {
                if (data) {
                    if ($scope.domain == 'ChannelLevelMaster') {
                        if($scope.addItem.channelUuid == $scope.addItem.parentOcmBaseChanUuid){
                            $scope.showError('不可新增此上下级渠道!');
                            return;
                        }
                        ChannelLevelService.add($scope.addItem).success(function () {
                            $scope.showInfo("新增渠道成功!");
                            $scope.refreshList();
                            $scope.listItemAction();
                        });
                    } else if ($scope.domain == 'ChannelLevelDetail') {
                        console.log($scope.addItem);
                        if($scope.addItem.channelUuid == $scope.tempParentChannelUuid){
                            $scope.showError("此渠道己是上级渠道，无法新增!");
                            return;
                        }
                        ChannelLevelService.add($scope.addItem).success(function () {
                            $scope.showInfo("新增下层渠道成功!");
                            $scope.refreshSubList($scope.selectedItem);
                            $scope.refreshList();
                            $scope.listItemAction();
                        });
                    }

                } else {
                    $scope.showError("此上层渠道己存在层级中，无法新增!");
                }
            });
        } else if ($scope.status == 'edit') {
            ChannelLevelUpdateInput = {
                parentOcmBaseChanUuid: $scope.addItem.parentOcmBaseChanUuid
            };
            ChannelLevelService.validLoop($scope.addItem.channelUuid, $scope.addItem.parentOcmBaseChanUuid).success(function (data) {
                if (data) {
                    angular.forEach($scope.itemList,function(listItem){
                        if(listItem.channel.uuid == $scope.addItem.channelUuid){
                           $scope.tempModifyChannelLevel=true;
                           $scope.tempListItemUuid=listItem.uuid;

                        }
                    });
                    if($scope.tempModifyChannelLevel){
                        ChannelLevelService.modify($scope.tempListItemUuid, ChannelLevelUpdateInput).success(function () {
                            $scope.showInfo("修改成功!");
                            $scope.refreshSubList($scope.selectedItem);
                            $scope.refreshList();
                            $scope.listItemAction();
                            $scope.parentOcmBaseChanName=$scope.addItem.parentChannelName;
                        });
                        return;
                    }
                    $scope.tempChannelLevel=false;
                    angular.forEach($scope.itemList,function(item){
                        if(item.parentOcmBaseChanUuid == $scope.addItem.channelUuid && item.channel.uuid == $scope.addItem.parentOcmBaseChanUuid){
                            $scope.tempAddChannelLevel=true;

                        }
                    });
                    if($scope.tempAddChannelLevel){
                        $scope.showError("不可新增此上层渠道!");
                        return;
                    }
                    ChannelLevelService.add($scope.addItem).success(function () {
                        $scope.showInfo("维护上层渠道成功!");
                        $scope.showDetailPanelAction($scope.selectedItem);
                        $scope.refreshList();
                        $scope.listItemAction();
                        $scope.parentOcmBaseChanName=$scope.addItem.parentChannelName;

                    });
                } else {
                    $scope.showError("不可设置此上层渠道!");
                }
            });

        }
    };

    /**
     * Delete detail item
     */
    $scope.deleteDetailAction = function (detail) {
        $scope.showConfirm('确认删除吗？', '删除后不可恢复。', function () {
            ChannelLevelService.delete(detail.uuid).success(function (data) {
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
            angular.forEach($scope.itemList,function(listItem){
                if(item.uuid == listItem.parentOcmBaseChanUuid){
                    ChannelLevelService.delete(listItem.uuid).success(function (data) {
                         $scope.showInfo("删除成功!");
                         $scope.refreshList();
                         $scope.selectedItem=null;
                         $scope.listItemAction();
                    });
                }
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
                        if(item.uuid == listItem.parentOcmBaseChanUuid){
                            var response = ChannelLevelService.delete(listItem.uuid).success(function (data) {
                            })
                        }
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
            angular.forEach($scope.itemParent, function (item) {
                item.selected = true;
                $scope.selected.push(item);
            });
        } else {
            angular.forEach($scope.itemParent, function (item) {
                item.selected = false;
            });
            $scope.selected = [];
        }
    };


    $scope.openChannelDlg = function () {
        $mdDialog.show({
            controller: 'ChannelLevelSelectController',
            templateUrl: 'app/src/app/ocm/channelLevel/selectChannel.html',
            parent: angular.element(document.body),
            targetEvent: event,
            locals: {
                domain: $scope.domain,
                addItem: $scope.addItem,
                itemList:$scope.itemList
            }
        }).then(function (data) {
            $scope.addItem.channelUuid = data.uuid;
            $scope.addItem.channelName = data.name;

        });
    };

    $scope.openParentChannelDlg = function () {
        $mdDialog.show({
            controller: 'ParentChannelSelectController',
            templateUrl: 'app/src/app/ocm/channelLevel/selectParentChannel.html',
            parent: angular.element(document.body),
            targetEvent: event,
            locals: {
                addItem: $scope.addItem,
                itemList:$scope.itemList
            }
        }).then(function (data) {
            $scope.addItem.parentOcmBaseChanUuid = data.uuid;
            $scope.addItem.parentChannelName = data.name;

        });

    };

});

angular.module('IOne-Production').controller('ChannelLevelSelectController', function ($scope, $mdDialog, ChannelService, domain, addItem, itemList) {
    $scope.pageOption = {
        sizePerPage: 5,
        currentPage: 0,
        totalPage: 0,
        totalElements: 0,
        displayModel: 0  //0 : image + text //1 : image
    };
    $scope.domain = domain;
    $scope.addItem = addItem;
    $scope.itemList = itemList;
    console.log($scope.domain);
    $scope.refreshChannel = function () {
        ChannelService.getWithNoChannelLevel($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, 0, 0, $scope.searchKeyword, $scope.addItem.parentOcmBaseChanUuid).success(function (data) {
            $scope.allChannel = data;
            $scope.pageOption.totalElements = data.totalElements;
            $scope.pageOption.totalPage = data.totalPages;
        });
    };
    $scope.refreshChannel();
    $scope.selectChannel = function (channel) {
        $scope.channel = channel;
        $mdDialog.hide($scope.channel);
    };
    $scope.hideDlg = function () {
        $mdDialog.hide($scope.channel);
    };
    $scope.cancelDlg = function () {
        $mdDialog.cancel();
    };
});

angular.module('IOne-Production').controller('ParentChannelSelectController', function ($scope, $mdDialog, ChannelService, ChannelLevelService ,addItem, itemList) {
    $scope.pageOption = {
        sizePerPage: 5,
        currentPage: 0,
        totalPage: 0,
        totalElements: 0
    };
    $scope.addItem = addItem;
    $scope.itemList = itemList;
    console.log($scope.itemList);


    $scope.notLowerChannel = function () {
            ChannelService.getNotLowerChannel($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, 0, 0, $scope.searchKeyword ,'',$scope.addItem.channelUuid).success(function (data) {
                $scope.allChannel = data.content;
                $scope.pageOption.totalElements = data.totalElements;
                $scope.pageOption.totalPage = data.totalPages;
            });
        };
    $scope.notLowerChannel();

    $scope.selectChannel = function (channel) {
        $scope.channel = channel;
        $mdDialog.hide($scope.channel);
    };
    $scope.hideDlg = function () {
        $mdDialog.hide($scope.channel);
    };
    $scope.cancelDlg = function () {
        $mdDialog.cancel();
    };
});