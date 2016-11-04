angular.module('IOne-directives').directive('listMenu', function(Constant) {
    return {
        templateUrl: 'app/src/js/directive/listMenu.html',
        link: function($scope) {
        }
     }
});

angular.module('IOne-directives').directive('formMenu', function(Constant) {
    return {
        templateUrl: 'app/src/js/directive/formMenu.html',
        link: function($scope) {
            $scope.menuAction = function(menuId, $event) {
                //Main menu
                if(menuId == 100) {
                    $scope.preAddMenuAction();
                } else if(menuId == 101) {
                    $scope.deleteMenuAction();
                } else if(menuId == 102) {
                    $scope.changeViewStatus($scope.UI_STATUS.EDIT_UI_STATUS_MODIFY, 1);
                } else if(menuId == 103) {
                    $scope.copyMenuAction();
                } else if(menuId == 104) {
                    $scope.statusMenuAction();
                } else if(menuId == 105) {
                    $scope.confirmMenuAction();
                } else if(menuId == 106) {
                    $scope.releaseMenuAction();
                } else if(menuId == 107) {
                    $scope.changeMenuAction();
                } else if(menuId == 108) {
                    $scope.changeHistoryMenuAction();
                 } else if(menuId == 109) {
                     $scope.copyChannelPrice();
                 }

                //Add menu
                if(menuId == 200) {
                    $scope.cancelAddMenuAction();
                } else if(menuId == 201) {
                    $scope.addMenuAction();
                } else if(menuId == 202) {
                    $scope.continueAddMenuAction();
                }


                //Modify menu
                if(menuId == 300) {
                    $scope.addNodeMenuAction($event);
                } else if(menuId == 301) {
                    $scope.deleteNodeMenuAction($event);
                } else if(menuId == 302) {
                    $scope.modifyMenuAction();
                } else if(menuId == 303) {
                    $scope.cancelModifyMenuAction();
                } else if(menuId == 304) {
                    $scope.exitModifyMenuAction();
                }

            }
        }
    }

});

angular.module('IOne-directives').directive('orderListMenu', function(Constant) {
    return {
        templateUrl: 'app/src/js/directive/orderListMenu.html',
        link: function($scope) {
          $scope.orderListMenuAction = function(menuId, $event) {
                //Main menu
                if(menuId == 400) {
                    $scope.selectAllMenuAction();
                } else if(menuId == 401) {
                    $scope.auditMenuAction();
                } else if(menuId == 402) {
                    $scope.returnMenuAction();
                } else if(menuId == 403) {
                    $scope.throwMenuAction();
                } else if(menuId == 404) {
                    $scope.effectiveMenuAction();
                } else if(menuId == 405) {
                    $scope.queryMenuAction();
                } else if(menuId == 406) {
                    $scope.revertAuditMenuAction();
                } else if (menuId == 407) {
                    $scope.oneOffSync();
                } else if (menuId == 408) {
                    $scope.preAddMenuAction();
                } else if (menuId == 409) {
                    $scope.rollbackTransfer();
                } else if (menuId == 410) {
                    $scope.auditTransfer();
                }
           }
        }
    }
});

angular.module('IOne-directives').directive('orderFormMenu', function(Constant) {
    return {
        templateUrl: 'app/src/js/directive/orderFormMenu.html',
        link: function($scope) {
            $scope.orderListMenuAction = function(menuId, $event) {
                //Main menu
                if(menuId == 410) {
                    $scope.selectAllMenuAction();
                } else if(menuId == 411) {
                    $scope.auditMenuAction();
                } else if(menuId == 412) {
                    $scope.returnMenuAction();
                } else if(menuId == 413) {
                    $scope.throwMenuAction();
                } else if(menuId == 414) {
                    $scope.effectiveMenuAction();
                } else if(menuId == 416) {
                    $scope.revertAuditMenuAction();
                } else if(menuId == 417) {
                    $scope.printAction();
                } else if(menuId == 418) {
                    $scope.oneOffSync();
                } else if(menuId == 419) {
                    $scope.rollbackTransfer();
                } else if (menuId == 420) {
                    $scope.changePurchaseFlag(2);
                } else if (menuId == 421) {
                    $scope.changePurchaseFlag(3);
                } else if (menuId == 422) {
                    $scope.auditTransferForm();
                }
            }
        }
    }
});

angular.module('IOne-directives').directive('itemOperationMenu', function(Constant) {
    return {
        templateUrl: 'app/src/js/directive/itemOperationMenu.html',
        link: function($scope) {
          $scope.itemOperationMenuAction = function(menuId, $event) {
                //Main menu
                if(menuId == 500) {
                    $scope.itemEditMenuAction();
                } else if(menuId == 501) {
                    $scope.itemDeleteMenuAction();
                }
           }
        }
    }
});


angular.module('IOne-directives').directive('ocmListMenu', function(Constant) {
    return {
        templateUrl: 'app/src/js/directive/ocmListMenu.html',
        link: function($scope) {
          $scope.ocmListMenuAction = function(menuId, $event) {
                //Main menu
                if(menuId == 600) {
                    $scope.queryMenuAction();
                } else if(menuId == 601) {
                    $scope.selectAllMenuAction();
                } else if(menuId == 602) {
                    $scope.auditMenuAction();
                } else if(menuId == 603) {
                    $scope.revertAuditMenuAction();
                } else if(menuId == 604) {
                    $scope.validStatusMenuAction();
                } else if(menuId == 605) {
                    $scope.invalidStatusMenuAction();
                }

           }
        }
    }
});

angular.module('IOne-directives').directive('ocmFormMenu', function(Constant) {
    return {
        templateUrl: 'app/src/js/directive/ocmFormMenu.html',
        link: function($scope) {
          $scope.ocmListMenuAction = function(menuId, $event) {
                if(menuId == 611) {
                    $scope.selectAllMenuAction();
                 } else if(menuId == 612) {
                    $scope.auditMenuAction();
                } else if(menuId == 613) {
                    $scope.revertAuditMenuAction();
                } else if(menuId == 614) {
                    $scope.validStatusMenuAction();
                } else if(menuId == 615) {
                    $scope.invalidStatusMenuAction();
                }

           }
        }
    }
});

angular.module('IOne-directives').directive('taobaoOrderListMenu', function(Constant) {
    return {
        templateUrl: 'app/src/js/directive/taobaoOrderListMenu.html',
        link: function($scope) {
            //全选 审核 失效作废 查询 取消审核 对应执行方法
            $scope.taobaoOrderListMenuAction = function(menuId, $event) {
                if(menuId == 400) {
                    $scope.selectAllMenuAction();
                } else if(menuId == 401) {
                    $scope.auditMenuAction();
                } else if(menuId == 403) {
                    $scope.throwMenuAction();
                } else if(menuId == 404) {
                    $scope.effectiveMenuAction();
                } else if(menuId == 405) {
                    $scope.queryMenuAction();
                } else if(menuId == 406) {
                    $scope.revertAuditMenuAction();
                } else if(menuId == 407) {
                    $scope.mergeMenuAuction();
                } else if(menuId == 408) {
                    $scope.unConfirmMenuAction();
                }else if(menuId == 409) {
                    $scope.deliveryMenuAction();
                }else if(menuId == 410) {
                    $scope.syncMenuAction();
                }
            }
        }
    }
});

angular.module('IOne-directives').directive('ecommerceOrderListMenu', function(Constant) {
    return {
        templateUrl: 'app/src/js/directive/ecommerceOrderListMenu.html',
        link: function($scope) {
            //全选 审核 失效作废 查询 取消审核 对应执行方法
            $scope.ecommerceOrderListMenuAction = function(menuId, $event) {
                if(menuId == 400) {
                    $scope.selectAllMenuAction();
                } else if(menuId == 401) {
                    $scope.auditMenuAction();
                } else if(menuId == 403) {
                    $scope.throwMenuAction();
                } else if(menuId == 404) {
                    $scope.effectiveMenuAction();
                } else if(menuId == 405) {
                    $scope.queryMenuAction();
                } else if(menuId == 406) {
                    $scope.revertAuditMenuAction();
                }  else if(menuId == 407) {  //清单新增
                    $scope.preAddMenuAction();
                }else if(menuId == 408) {
                     $scope.cancelThrowMenuAction();
                } else if (menuId == 409) {
                    $scope.o2oOverdueMenuAction();
                } else if (menuId == 410) {
                    $scope.rollbackTransfer();
                }

            }
        }
    }
});
angular.module('IOne-directives').directive('ecommerceOrderFormMenu', function(Constant) {
    return {
        templateUrl: 'app/src/js/directive/ecommerceOrderFormMenu.html',
        link: function($scope) {
            $scope.ecommerceOrderListMenuAction = function(menuId, $event) {
                //Main menu
                if(menuId == 410) {
                    $scope.selectAllMenuAction();
                } else if(menuId == 411) {
                    $scope.auditMenuAction();
                } else if(menuId == 412) {
                    $scope.returnMenuAction();
                } else if(menuId == 413) {
                    $scope.throwMenuAction();
                } else if(menuId == 414) {
                    $scope.effectiveMenuAction();
                }else if(menuId == 416) {
                    $scope.revertAuditMenuAction();
                }else if(menuId == 417) {
                    $scope.cancelThrowMenuAction();
                }else if(menuId == 418) {
                    $scope.printAction();
                }else if(menuId == 420) {
                    $scope.rollbackTransfer();
                }
            }
        }
    }
});

angular.module('IOne-directives').directive('ecommerceChangeListMenu', function(Constant) {
    return {
        templateUrl: 'app/src/js/directive/ecommerceChangeListMenu.html',
        link: function($scope) {
            //全选 审核 失效作废 查询 取消审核 对应执行方法
            $scope.ecommerceChangeListMenuAction = function(menuId, $event) {
                if(menuId == 400) {
                    $scope.selectAllMenuAction();
                } else if(menuId == 401) {
                    $scope.auditMenuAction();
                } else if(menuId == 403) {
                    $scope.throwMenuAction();
                } else if(menuId == 404) {
                    $scope.effectiveMenuAction();
                } else if(menuId == 405) {
                    $scope.queryMenuAction();
                } else if(menuId == 406) {
                    $scope.revertAuditMenuAction();
                }
            }
        }
    }
});