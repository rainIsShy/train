angular.module('IOne-Production').config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/booking-slip-group', {
        controller: 'bookingSlipGroupController',
        templateUrl: 'app/src/app/order/booking_slip_group/bookingSlip.html'
    })
}]);

angular.module('IOne-Production').controller('bookingSlipGroupController', function($scope, bookingSlipGroup, ShoppingCartItemPic, $mdDialog, $timeout, Constant) {

       $scope.listFilterOption = {
           status :  Constant.STATUS[0].value,
           confirm : Constant.CONFIRM[0].value,
           release : Constant.RELEASE[0].value,
           prodType : Constant.PROD_TYPE[0].value
       };

       //initialize model value. need clarify relationship between effective and showAll
        $scope.orderListMenu = {
            effectiveType : false,
            confirm : Constant.AUDIT[0].value,
            status : Constant.STATUS[0].value,
            showQueryBar : true
        };
        //can not handle it like other menu function. must use this way to monitor model change
        $scope.orderListMenuFilter = {
            selectAll : false
        };
        $scope.$watch('orderListMenuFilter', function() {
            $scope.selectAllMenuAction();
        }, true);

       $scope.formMenuDisplayOption = {
             '100-add': {display: true, name: '新增'},
             '101-delete': {display: true, name: '删除'},
             '102-edit': {display: true, name: '编辑'},
             '103-copy': {display: false, name: '复制'},
             '104-status': {display: false, name: '启用'},
             '105-confirm': {display: false, name: '审核'},
             '106-release': {display: false, name: '发布'},

             '200-cancel': {display: true, name: '取消新增'},
             '201-save': {display: true, name: '保存'},

             '300-add': {display: false, name: '新增节点'},
             '301-delete': {display: false, name: '删除节点'},
             '302-save': {display: true, name: '保存'},
             '303-cancel': {display: true, name: '取消修改'},
             '304-quit': {display: true, name: '退出编辑'}
         };
       $scope.orderListMenuDisplayOption = {
             '400-selectAll': {display: true, name: '全选'},
             '401-audit': {display: true, name: '审核'},
             '402-return': {display: true, name: '退回'},
             '403-throw': {display: true, name: '抛转预订单'},
             '404-effective': {display: true, name: '失效作废'},
             '405-query': {display: true, name: '查询'},
             '406-orderId-input': {display: true, name: '销售单号'},
             '407-client-input': {display: true, name: '客户'},
         };
         $scope.itemOperationMenuDisplayOption = {
             '500-item-edit': {display: true, name: ''},
             '501-item-delete': {display: true, name: ''}
         };
      $scope.pageOption = {
        sizePerPage: 14,
        currentPage: 0,
        totalPage: 100,
        totalElements: 100
      };

       $scope.$watch('listFilterOption', function() {
            $scope.pageOption.currentPage = 0;
            $scope.pageOption.totalPage = 0;
            $scope.pageOption.totalElements = 0;
            $scope.refreshAllTemplate();
        }, true);

    $scope.refreshAllTemplate = function() {
        bookingSlipGroup.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, $scope.listFilterOption.confirm,
            $scope.listFilterOption.status, $scope.listFilterOption.release, $scope.listFilterOption.prodType)

            .success(function(data) {
                $scope.bookingSlipGroupList = data;
                $scope.pageOption.totalPage = data.totalPages;
                $scope.pageOption.totalElements = data.totalElements;
            }
        );
    };

    $scope.editItem = function(bookingSlipGroupItem) {
        $scope.selectedItem = bookingSlipGroupItem;
        $scope.changeViewStatus(Constant.UI_STATUS.PRE_EDIT_UI_STATUS, 1);
    };

    $scope.listTabSelected = function() {
        $scope.orderListMenu.showQueryBar = true;
        //because we will refresh data from server side. so need to set selectAll to false.
        $scope.orderListMenuDisplayOption['400-selectAll'].display = true;
        $scope.orderListMenuFilter.selectAll = false;

        $scope.refreshAllTemplate();
        $scope.selectedItem = null;
        $scope.changeViewStatus(Constant.UI_STATUS.VIEW_UI_STATUS, 0);
    };

    $scope.formTabSelected = function() {
         $scope.orderListMenu.showQueryBar = false;
         $scope.orderListMenuDisplayOption['400-selectAll'].display = false;
         if($scope.selectedItem) {
            //Get pics
            ShoppingCartItemPic.get($scope.selectedItem.uuid).success(function(data) {
                $scope.picsData = data;

                $scope.selectedItemPics = [];
                angular.forEach($scope.picsData.content, function(item) {
                    $scope.selectedItemPics.push(Constant.BACKEND_BASE + '/app/assets/' + item.path);
                });
            });
         }
    };

     $scope.prodInfoTabSelected = function() {

     };

     $scope.deliverInfoTabSelected = function() {

     };

     $scope.selected = [];
     $scope.selectedItemsCount = 0;
     $scope.selectedItemsTotalPrice = 0.00;
     $scope.toggle = function (item, selected) {
     //需要考虑灰化其他按钮 只有未审核和退回状态的单据才可以作废
          var idx = selected.indexOf(item);
          if (idx > -1) {
             selected.splice(idx, 1);
          }
          else {
             selected.push(item);
          }
            //recalculate
           $scope.selectedItemsTotalPrice = 0;
           angular.forEach( $scope.selected, function(item) {
                $scope.selectedItemsTotalPrice = $scope.selectedItemsTotalPrice + item.marketPrice ;
           });
           $scope.selectedItemsTotalPrice = $scope.selectedItemsTotalPrice.toFixed(2);
           $scope.selectedItemsCount = selected.length;


      };

     $scope.exists = function (item, list) {
       return list.indexOf(item) > -1;
     };

     $scope.selectAllMenuAction = function() {
     //需要考虑灰化其他按钮 只有未审核和退回状态的单据才可以作废
        if($scope.orderListMenuFilter.selectAll == true){
            angular.forEach( $scope.bookingSlipGroupList.content, function(item) {
            var idx = $scope.selected.indexOf(item);
            if (idx < 0) {
                 $scope.selected.push(item);
            }
           });
              //recalculate
           $scope.selectedItemsTotalPrice = 0;
           angular.forEach( $scope.selected, function(item) {
                $scope.selectedItemsTotalPrice = $scope.selectedItemsTotalPrice + item.marketPrice ;
           });
           $scope.selectedItemsTotalPrice = $scope.selectedItemsTotalPrice.toFixed(2);
           $scope.selectedItemsCount = $scope.selected.length;
        }else if($scope.orderListMenuFilter.selectAll == false){
           $scope.selected = [];
           $scope.selectedItemsCount = 0;
           $scope.selectedItemsTotalPrice = 0.00;
        }
     };

     $scope.effectiveMenuAction = function() {
         if( $scope.ui_status==Constant.UI_STATUS.PRE_EDIT_UI_STATUS &&  scope.selectedTabIndex==1){
                  //update $scope.selectedItem
               }else if($scope.ui_status==Constant.UI_STATUS.VIEW_UI_STATUS &&  scope.selectedTabIndex==0){
                 //update $scope.selected
          }
          bookingSlipGroup.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, $scope.listFilterOption.confirm,
          $scope.listFilterOption.status, $scope.listFilterOption.release, $scope.listFilterOption.prodType)

          .success(function(data) {
              $scope.bookingSlipGroupList = data;
              $scope.pageOption.totalPage = data.totalPages;
              $scope.pageOption.totalElements = data.totalElements;
          }
      );
     };
     $scope.auditMenuAction = function() {
          bookingSlipGroup.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, $scope.listFilterOption.confirm,
          $scope.listFilterOption.status, $scope.listFilterOption.release, $scope.listFilterOption.prodType)

          .success(function(data) {
              $scope.bookingSlipGroupList = data;
              $scope.pageOption.totalPage = data.totalPages;
              $scope.pageOption.totalElements = data.totalElements;
          }
      );
     };

     $scope.returnMenuAction = function() {
          bookingSlipGroup.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, $scope.listFilterOption.confirm,
          $scope.listFilterOption.status, $scope.listFilterOption.release, $scope.listFilterOption.prodType)

          .success(function(data) {
              $scope.bookingSlipGroupList = data;
              $scope.pageOption.totalPage = data.totalPages;
              $scope.pageOption.totalElements = data.totalElements;
          }
      );
     };

     $scope.throwMenuAction = function() {
          bookingSlipGroup.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, $scope.listFilterOption.confirm,
          $scope.listFilterOption.status, $scope.listFilterOption.release, $scope.listFilterOption.prodType)

          .success(function(data) {
              $scope.bookingSlipGroupList = data;
              $scope.pageOption.totalPage = data.totalPages;
              $scope.pageOption.totalElements = data.totalElements;
          }
      );
     };

     $scope.queryMenuAction = function() {
        startDate = $scope.orderListMenu.startDate;
        endDate = $scope.orderListMenu.endDate;
        orderId = $scope.orderListMenu.orderId;
        clientName = $scope.orderListMenu.clientName;
        confirm = $scope.orderListMenu.confirm;
        status = $scope.orderListMenu.status;

        bookingSlipGroup.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, $scope.listFilterOption.confirm,
          $scope.listFilterOption.status, $scope.listFilterOption.release, $scope.listFilterOption.prodType)

          .success(function(data) {
              $scope.bookingSlipGroupList = data;
              $scope.pageOption.totalPage = data.totalPages;
              $scope.pageOption.totalElements = data.totalElements;
          }
      );
     };

  //Save modification.
    $scope.modifyMenuAction = function() {
        if($scope.selectedItem) {
            bookingSlipGroup.modify($scope.selectedItem).success(function() {
                $scope.showInfo('修改商品数据成功。');
            });
        }
    };

    $scope.cancelModifyMenuAction = function() {
        bookingSlipGroup.get($scope.selectedItem.uuid).success(function(data) {
            $scope.selectedItem = data;
        })
    };

    $scope.exitModifyMenuAction = function() {
        $scope.cancelModifyMenuAction();
        $scope.changeViewStatus($scope.UI_STATUS.PRE_EDIT_UI_STATUS, 1);
    };

    $scope.preAddMenuAction = function() {

        $scope.selectedItem = {
            stopProductionFlag: 'N',
            type: '1'
        };
        $scope.selectedItemPics = [];
        $scope.selectedItemBoms = {};
        $scope.selectedItemCustoms = {};
        $scope.changeViewStatus($scope.UI_STATUS.EDIT_UI_STATUS_ADD, 1);
    };

      $scope.addMenuAction = function() {
           if($scope.selectedItem) {
               bookingSlipGroup.add($scope.selectedItem).success(function(data) {
                   $scope.selectedItem = data;
                   $scope.changeViewStatus($scope.UI_STATUS.PRE_EDIT_UI_STATUS, 1);

                   $scope.showInfo('新增商品成功。');
               })
           }
       };

       $scope.cancelAddMenuAction = function() {
           $scope.listTabSelected();
       };

       $scope.deleteMenuAction = function() {
           $scope.showConfirm('确认删除吗？', '删除的商品不可恢复。', function() {
               if($scope.selectedItem) {
                   bookingSlipGroup.delete($scope.selectedItem.uuid).success(function() {
                       $scope.showInfo('删除成功。');
                       $scope.changeViewStatus($scope.UI_STATUS.EDIT_UI_STATUS_DELETE, 0);
                   });
               }
           });
       };

  //Set menu names
     $scope.$watchCollection('[selectedItem.status, selectedItem.confirm, selectedItem.release]', function() {
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

    $scope.handler = function(field, value) {
        if($scope.selectedItem && $scope.selectedItem[field]) {
            $scope.selectedItem[field] = value;
            $scope.modifyMenuAction();
        }
    };
    $scope.statusMenuAction = function() {
        $scope.selectedItem.status == '1' ? $scope.handler('status', '2') : $scope.handler('status', '1');
    };
   $scope.confirmMenuAction = function() {
        if($scope.selectedItem.confirm == '2' && $scope.selectedItem.release == 2) {
            $scope.showWarn('已发布的数据不能取消审核。');
            return;
        }
        $scope.selectedItem.confirm == '1' ? $scope.handler('confirm', '2') : $scope.handler('confirm', '1');
    };
    $scope.releaseMenuAction = function() {
        if($scope.selectedItem.release == '1' && $scope.selectedItem.confirm == 1) {
            $scope.showWarn('未审核的数据不能发布。');
            return;
        }
        $scope.selectedItem.release == '1' ? $scope.handler('release', '2') : $scope.handler('release', '1');
    };
});
