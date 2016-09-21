/**
 * Production management system.
 */
angular.module('IOne', ['ngRoute', 'ngResource', 'ngMaterial', 'ngCookies', 'IOne-directives', 'IOne-Production', 'IOne-Constant', 'ngFileUpload', 'IOne-Auth', 'ui.tree', 'ngMdIcons', 'ngMessages']);

toastr.options = {
    "closeButton": true,
    "debug": false,
    "newestOnTop": false,
    "progressBar": false,
    "positionClass": "toast-bottom-right",
    "preventDuplicates": false,
    "onclick": null,
    "showDuration": "300",
    "hideDuration": "1000",
    "timeOut": "5000",
    "extendedTimeOut": "1000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
};

angular.module('IOne').config(function($mdThemingProvider, $mdIconProvider) {
     $mdThemingProvider.theme('default')
        .primaryPalette('grey');
//        .accentPalette('grey', {
//           'default': '900',
//           'hue-1': '700',
//           'hue-2': '400'
//        });
     $mdThemingProvider.theme('docs-dark', 'default').dark();
     $mdIconProvider
           .iconSet('social', '../bower_components/angular-materialimg/demos/icon/demoSvgIconSets/assets/social-icons.svg', 24)
           .defaultIconSet('../bower_components/angular-material/demos/icon/demoSvgIconSets/assets/core-icons.svg', 24);
});

angular.module('IOne').factory('AuthInterceptor', function($rootScope, $q, $cookieStore) {
    return {
        request: function(config) {
            // keep user logged in after page refresh
            $rootScope.globals = $cookieStore.get('globals') || {};

            if ($rootScope.globals.currentUser || config.url == "/auth/login" || config.url == "/auth/logout") {
                return config;
            } else {
                return $q.reject('Unauthorized access.');
            }
        },
        responseError: function(error) {
            if (error.status === 401 || error.status === 403) {
                $rootScope.$broadcast('IONE_LOGOUT_EVENT');
            }
            return $q.reject(error);
        }
    };
});

angular.module('IOne').config(['$httpProvider', function($httpProvider) {
    $httpProvider.interceptors.push('AuthInterceptor');
}]);


angular.module('IOne').run(function($rootScope, $cookieStore, $window, $http) {
    // keep user logged in after page refresh
    $rootScope.globals = $cookieStore.get('globals') || {};
    $rootScope.autoLogin = $cookieStore.get('autoLogin') || 0;

    if ($rootScope.globals.currentUser) {
        $http.defaults.headers.common['Authorization'] = 'Basic ' + $rootScope.globals.currentUser.authdata; // jshint ignore:line
    } else {
        $window.location.href = '/app/login.html';
    }
});

/**
 * Main Controller for whole UI as the parent of all sub controllers.
 * All other controllers can share this controller and share data here.
 */
angular.module('IOne').controller('MainController', function($rootScope, $scope, $mdUtil, $mdSidenav, $location, $timeout, $cookieStore, Constant,
                                                             $mdToast, $mdDialog, $window, $http, AuthenticationService, MenuService, ResService, OrderMaster,
                                                             SalesOrderMaster, UserService, PsoOrderChangeMaster, SalesOrderChangeMaster,
                                                             PsoOrderReturnMaster, PSOReturnSalesOrdersMasterService, Receipts, Receipt2s) {
    ////////////////UPDATE SERVER LINK///////////////////////////
    Constant.BACKEND_BASE = $rootScope.globals.adapterInfo.i1ServerUrl;

    ////////////////UPDATE SERVER LINK///////////////////////////
    Constant.BACKEND_BASE = $rootScope.globals.adapterInfo.i1ServerUrl;

    /////////////////////////////////////////////////////////////
    $scope.currentUser = $scope.globals.currentUser.username;
    $scope.displayName = $cookieStore.get('displayName');
    $scope.displayType = $cookieStore.get('displayType');

    ///////////////////////////////////Nav, will refactor to a single controller
    $scope.menuAction = function(mainMenu, menu) {
        $scope.path(menu.link);
        $scope.selectedMenuId = menu.id;
        $scope.selectedMainMenu = mainMenu;
        $scope.selectedMenu = menu;
        $scope.changeViewStatus(Constant.UI_STATUS.VIEW_UI_STATUS, 0);
    };
    $scope.menuList = Constant.MENU_LIST;
    $scope.selectedMenuId = $location.path();
    ///////////////////////////////////////////////////////////////////////////////

    if($(window).innerWidth() <= 960) {
        $scope.lockMenuFlag = false;
        $mdSidenav('leftMenu').close();
    } else {
        $scope.lockMenuFlag = true;
    }
    $scope.lockMenu = function(lock) {
        if($(window).innerWidth() <= 960) {
            $scope.lockMenuFlag = false;
            $mdSidenav('leftMenu').toggle();
        } else {
            $scope.lockMenuFlag = lock;
        }
    };

    $scope.path = function(url) {
        $location.path(url);
    };

    $scope.showInfo = function(info) {
        toastr["success"](info)
    };

    $scope.showError = function(info) {
        toastr["error"](info)
    };

    $scope.showWarn = function(info) {
        toastr["warning"](info)
    };

    $scope.showConfirm = function(title, content, success_fn, fail_fn) {
        // Appending dialog to document.body to cover sidenav in docs app
        var confirm = $mdDialog.confirm()
            .parent(angular.element(document.body))
            .title(title)
            .content(content)
            .ok('确认')
            .cancel('取消');
        $mdDialog.show(confirm).then(success_fn, fail_fn);
    };

    $scope.DEFAULT_IMAGE_PATH = Constant.BACKEND_BASE + '/app/img/item.jpeg';
    $scope.getImageFullPath = function(path) {
        if(path == null) {
            return $scope.DEFAULT_IMAGE_PATH;
        }
        if(path && path.indexOf('IMAGE') == 0) {
            return Constant.BACKEND_BASE + '/app/assets/' + path;
        } else {
            return Constant.BACKEND_BASE + '/app/assets/IMAGE/' + path;
        }
    };

    $scope.isDefaultImage = function(path) {
        if(path == $scope.DEFAULT_IMAGE_PATH) {
            return true;
        } else {
            return false;
        }
    };

    $scope.logout = function () {
        AuthenticationService.Logout().success(function() {
            AuthenticationService.ClearCredentials();
            $window.location.href = '/app/login.html';
        });
    };

    $rootScope.$on('IONE_LOGOUT_EVENT', function() {
        //$scope.logout();
    });

    //////////////////////////////////////////////////////////////////////////////
    //All ui status
    //Current ui status
    $scope.UI_STATUS = Constant.UI_STATUS;
    $scope.ui_status = $scope.UI_STATUS.VIEW_UI_STATUS;
    $scope.selectedTabIndex = 0;

    $scope.selectedSubTab = {
        index : 0
    };

    $scope.listTabName = '清单';
    $scope.formTabName = '表单(预览模式)';

    $scope.changeViewStatus = function(status, index) {
        $scope.ui_status = status;
        $scope.selectedTabIndex = index;

        if($scope.ui_status == Constant.UI_STATUS.PRE_EDIT_UI_STATUS
            || $scope.ui_status == Constant.UI_STATUS.EDIT_UI_STATUS_DELETE
            || $scope.ui_status == Constant.UI_STATUS.VIEW_UI_STATUS) {
            $scope.formTabName = '表单(预览模式)';
            $scope.isEditing = false;
        } else if ($scope.ui_status == Constant.UI_STATUS.EDIT_UI_STATUS_ADD
            || $scope.ui_status == Constant.UI_STATUS.EDIT_UI_STATUS_COPY
            || $scope.ui_status == Constant.UI_STATUS.EDIT_UI_STATUS_MODIFY) {
            $scope.formTabName = '表单(编辑模式)';
            $scope.isEditing = true;
        }
    };

    $scope.changeSubTabIndexs = function( index) {
         $scope.selectedSubTab.index = index;
    };

    //////////////////////////////////////////////////////////////////////////////
    //Filter results of the list page.
    $scope.STATUS = Constant.STATUS;
    $scope.CONFIRM = Constant.CONFIRM;
    $scope.RELEASE = Constant.RELEASE;
    $scope.PROD_TYPE = Constant.PROD_TYPE;
    $scope.STOP_PRODUCTION = Constant.STOP_PRODUCTION;

    $scope.AUDIT = Constant.AUDIT;
    $scope.DELIVERY_MODE = Constant.DELIVERY_MODE;
    $scope.TRANSFER_PSO_FLAG = Constant.TRANSFER_PSO_FLAG;
    $scope.TRANSFER_FLAG = Constant.TRANSFER_FLAG;
    $scope.CUSTOMIZE_FLAG = Constant.CUSTOMIZE_FLAG;
    $scope.SALE_TYPE = Constant.SALE_TYPE;
    $scope.USER_TYPE = Constant.USER_TYPE;
    $scope.FUNCTION_TYPE = Constant.FUNCTION_TYPE;
    $scope.ROLE_TYPE = Constant.ROLE_TYPE;
    $scope.SELLER_FLAG = Constant.SELLER_FLAG;
    $scope.TAOBAO_STATUS = Constant.TAOBAO_STATUS;
    $scope.REFUND_STATUS = Constant.REFUND_STATUS;
    $scope.NUM_IID = Constant.NUM_IID;
    $scope.ORDER_FLAG = Constant.ORDER_FLAG;
    $scope.RETURN_FLAG = Constant.RETURN_FLAG;
    $scope.GENDER_FLAG = Constant.GENDER_FLAG;
    $scope.PAY_PARTY = Constant.PAY_PARTY;
    $scope.EMPLOYEE_STATUS = Constant.EMPLOYEE_STATUS;
    $scope.PAID_TYPE = Constant.PAID_TYPE;
    $scope.PERFORM_FLAG = Constant.PERFORM_FLAG;
    $scope.PAY_TYPE = Constant.PAY_TYPE;
    $scope.APPORTION_TYPE = Constant.APPORTION_TYPE;
    $scope.CHANNEL_FLAG = Constant.CHANNEL_FLAG;
    $scope.MALL_FLAG = Constant.MALL_FLAG;
    $scope.ORDER_CHANGE_FLAG = Constant.ORDER_CHANGE_FLAG;
    $scope.PURCHASE_TYPE = Constant.PURCHASE_TYPE;
    $scope.CARD_TYPE = Constant.CARD_TYPE;
    $scope.COST_TYPE = Constant.COST_TYPE;
    $scope.SUPPLY_TYPE = Constant.SUPPLY_TYPE;

    $scope.ITEM_CUSTOM_TYPE = Constant.ITEM_CUSTOM_TYPE;
    $scope.ITEM_CUSTOM_STYLE = Constant.ITEM_CUSTOM_STYLE;
    $scope.ITEM_CUSTOM_ASTRICT = Constant.ITEM_CUSTOM_ASTRICT;
    $scope.ITEM_CUSTOM_APP_DISPLAY = Constant.ITEM_CUSTOM_APP_DISPLAY;
    $scope.ITEM_CUSTOM_APP_CHOOSE = Constant.ITEM_CUSTOM_APP_CHOOSE;
    $scope.ITEM_CUSTOM_CUSTOM_FLAG = Constant.ITEM_CUSTOM_CUSTOM_FLAG;
    $scope.REFERENCE_FLAG = Constant.REFERENCE_FLAG;


    $scope.getError = function(response) {
        if(response && response.content) {
            return response.content;
        } else {
            return '';
        }
    };

    $scope.getAllError = function(response) {
        if(response && response.content && response.content.fieldErrors) {
            var result = [];

            if(response.content.fieldErrors) {
                angular.forEach(response.content.fieldErrors, function(error) {
                    result.push(error.field + ': ' + error.message + "; ");
                });
            }

            if(response.content.globalErrors) {
                angular.forEach(response.content.globalErrors, function(error) {
                    result.push(error.message);
                });
            }

            return result;
        } else {
            return '';
        }
    };

    $scope.isNotValid = function(data) {
        if(data == null || data == undefined) {
            return true;
        }
        return false;
    };

    $scope.isValid = function(data) {
        return !$scope.isNotValid(data);
    };

    $scope.RES_UUID_MAP = RES_UUID_MAP;
    $scope.INVALID_VALUE = Constant.INVALID_VALUE;

    $scope.getMenuAuthData = function(sysResUuid) {
        return MenuService.getAll('', '', '', sysResUuid, true);
    };

    //Default menu auth data
    $scope.menuAuthDataMap = {};
    $scope.menuDataMap = function(menuDataList) {
        var map = {};
        angular.forEach(menuDataList, function(value, index) {
            map[value.sysMenu.uuid] = value;
        });

        return map;
    };

    //Get all sys resources including role and function
    ResService.getAll('', '', true).success(function(data) {
        $scope.resDataMap = {};
        angular.forEach(data, function(value, index) {
            $scope.resDataMap[value.sysRes.uuid] = value;
        });
    });


    $scope.isAdmin = function() {
        return $scope.currentUser == 'admin';
    };

    OrderMaster.getOrderMasterCount(Constant.AUDIT[1].value, Constant.STATUS[1].value, Constant.TRANSFER_PSO_FLAG[2].value, RES_UUID_MAP.PSO.ORDER.LIST_PAGE.RES_UUID).success(function (data) {
        $scope.menuList[1].subList[1].suffix = data;
    });
    SalesOrderMaster.getOrderMasterCount(Constant.AUDIT[1].value, Constant.STATUS[1].value, Constant.TRANSFER_PSO_FLAG[2].value, RES_UUID_MAP.PSO.SO.LIST_PAGE.RES_UUID).success(function (data) {
        $scope.menuList[1].subList[2].suffix = data;
    });
    //变更
    PsoOrderChangeMaster.getOrderMasterCount(Constant.CONFIRM[1].value, Constant.STATUS[1].value, Constant.TRANSFER_PSO_FLAG[2].value, RES_UUID_MAP.PSO.ORDER_CHANGE.RES_UUID).success(function (data) {
        $scope.menuList[1].subList[4].suffix = data;
    });
    SalesOrderChangeMaster.getOrderMasterCount(Constant.CONFIRM[1].value, Constant.STATUS[1].value, Constant.TRANSFER_PSO_FLAG[2].value, RES_UUID_MAP.PSO.SO_CHANGE.RES_UUID).success(function (data) {
        $scope.menuList[1].subList[6].suffix = data;
    });
    //退货
    PsoOrderReturnMaster.getReturnOrderMasterCount(Constant.CONFIRM[1].value, Constant.STATUS[1].value, Constant.TRANSFER_PSO_FLAG[2].value, RES_UUID_MAP.PSO.ORDER_RETURN.RES_UUID).success(function (data) {
        $scope.menuList[1].subList[7].suffix = data;
    });
    PSOReturnSalesOrdersMasterService.getReturnOrderMasterCount(Constant.AUDIT[1].value, Constant.STATUS[1].value, Constant.TRANSFER_PSO_FLAG[2].value, RES_UUID_MAP.PSO.SO_RETURN.RES_UUID).success(function (data) {
        $scope.menuList[1].subList[8].suffix = data;
    });
    //收退银
    Receipts.getReceiptOrderMasterCount(Constant.CONFIRM[1].value, RES_UUID_MAP.PSO.ORDER_RECEIPT.RES_UUID).success(function (data) {
        $scope.menuList[1].subList[9].suffix = data;
    });
    Receipt2s.getReceiptOrderMasterCount(Constant.CONFIRM[1].value, RES_UUID_MAP.PSO.SO_RECEIPT.RES_UUID).success(function (data) {
        $scope.menuList[1].subList[10].suffix = data;
    });

    $scope.stopEventPropagation = function(event) {
        event.stopPropagation();
    }

    $scope.changeCurrentUserPw = function() {
        $mdDialog.show({
            controller: 'ChangeCurrentUserPwController',
            templateUrl: 'app/src/app/auth/user/changePassword.html',
            parent: angular.element(document.body),
            targetEvent: event
        }).then(function(data) {
            $scope.userPassword = data;
            UserService.modifyPassword($scope.userPassword).success(function() {
                             $scope.showInfo('修改密码成功。');
                    }).error(function(data) {
                           $scope.showError(data.message);
                    });
        });
    };
});

//Header controller
angular.module('IOne').controller('HeaderController', function($scope) {

});

//Footer controller
angular.module('IOne').controller('FooterController', function($scope) {

});

angular.module('IOne-Test', ['ngMaterial']);
angular.module('IOne-Test').controller('RuleSQLController', function($http, $scope) {
    $scope.search = function() {
        $http.get('/rules/sql/' + $scope.ruleUUID).success(function(data) {
            $scope.sqlList = data;
        });
    };
    $scope.run = function() {
        $http.get('/rules/run/', {params: {ruleUuid: $scope.ruleUUID, uuid: $scope.mainUUID, insertOrUpdate: !$scope.insertOrUpdate}}).success(function(data) {
            $scope.sqlList = data;
        });
    };

    $scope.runSql = function(sql) {
        $http.get('/rules/data/', {params: {sql: sql}}).success(function(data) {
            $scope.data = data;

            if(data.length > 0) {
                $scope.keys = Object.keys($scope.data[0]);
            }
        });
    };

});

angular.module('IOne').controller('ChangeCurrentUserPwController', function($scope, $mdDialog) {
    $scope.user = null;
    $scope.hideDlg = function() {
        if($scope.user == null){
            toastr["error"]("请输入原始密码以及新密码");
        }else{
               if( $scope.user.password == null){
                    toastr["error"]("原始密码为空");
                }else if($scope.user.newPassword == null){
                    toastr["error"]("新密码为空");
                }else  if($scope.user.newPassword == $scope.user.newPasswordConfirm){
                      $mdDialog.hide($scope.user);
                }else{
                   toastr["error"]("新密码不一致");
                   //$scope.showError()
                }
        }

    };

    $scope.cancelDlg = function() {
        $mdDialog.cancel();
    };
});