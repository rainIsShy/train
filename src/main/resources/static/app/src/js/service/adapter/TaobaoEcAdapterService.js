/**
 * Created by xavier on 2016/9/5.
 */
angular.module('IOne-Production').service('TaoBaoAdapterService', function ($http, $rootScope) {

    var ecAdapterUrl = $rootScope.globals.adapterInfo.ecAdapterServerUrl;

    this.syncByTids = function (tids, controllerScope, successCallBack) {
        var url = ecAdapterUrl + '/taobao/trades?';
        angular.forEach(tids, function (tid) {
            url += '&tids=' + tid;
        });

        return $http.get(url).success(function (response, status) {
            if (status == 200) {
                successCallBack(response);
            } else {
                controllerScope.showError('執行失敗');
            }
        }).error(function (response) {
            if (response == null) {
                controllerScope.showError("[" + (status + '') + "]Connect Server Fail");
            } else {
                controllerScope.showError("[" + (status + '') + "]" + response.message);
            }
        });
    };

    this.syncByDate = function (startDate, endDate, controllerScope, successCallBack) {
        var url = ecAdapterUrl + '/taobao/trades?sync=byTime';
        var obj = {
            'startTime': startDate,
            'endTime': endDate
        };

        return $http.post(url, obj).success(function (response, status) {
            if (status == 200) {
                successCallBack(response);
            } else {
                controllerScope.showError('執行失敗');
            }
        }).error(function (response) {
            if (response == null) {
                controllerScope.showError("[" + (status + '') + "]Connect Server Fail");
            } else {
                controllerScope.showError("[" + (status + '') + "]" + response.message);
            }
        });
        ;
    };

    this.updateProfile = function (updateProfileObj, controllerScope, successCallBack) {
        var url = ecAdapterUrl + '/taobao/updateProfile';
        return $http.post(url, updateProfileObj).success(function (response, status) {
            if (status == 200) {
                successCallBack(response);
            } else {
                controllerScope.showError('執行失敗');
            }
        }).error(function (response) {
            if (response == null) {
                controllerScope.showError("[" + (status + '') + "]Connect Server Fail");
            } else {
                controllerScope.showError("[" + (status + '') + "]" + response.message);
            }
        });
        ;
    };

    //电商接口平台CURD
    this.insertConfig = function (insertObj, controllerScope, successCallBack) {
        var url = ecAdapterUrl + '/taobao/config/insert';
        angular.forEach(insertObj, function (item) {
            item.createUserUuid = $rootScope.globals.currentUser.userUuid;
        });
        return $http.post(url, insertObj).success(function (response, status) {
            if (status == 200) {
                successCallBack(response);
            } else {
                controllerScope.showError('新增失败');
            }
        }).error(function (response) {
            if (response == null) {
                controllerScope.showError("[" + (status + '') + "]Connect Server Fail");
            } else {
                controllerScope.showError("[" + (status + '') + "]" + response.message);
            }
        });
    };

    this.updateConfig = function (updateObj, controllerScope, successCallBack) {
        var url = ecAdapterUrl + '/taobao/config/update';
        angular.forEach(updateObj, function (item) {
            delete(item.createDate);
            delete(item.modifiedDate);
            item.modifierUuid = $rootScope.globals.currentUser.userUuid;
        });
        return $http.patch(url, updateObj).success(function (response, status) {
            if (status == 200) {
                successCallBack(response);
            } else {
                controllerScope.showError('更新失败');
            }
        }).error(function (response) {
            if (response == null) {
                controllerScope.showError("[" + (status + '') + "]Connect Server Fail");
            } else {
                controllerScope.showError("[" + (status + '') + "]" + response.message);
            }
        });
    };

    this.deleteConfig = function (deleteObj, controllerScope, successCallBack) {
        var url = ecAdapterUrl + '/taobao/config/delete';
        return $http.delete(url, deleteObj).success(function (response, status) {
            if (status == 200) {
                successCallBack(response);
            } else {
                controllerScope.showError('删除失败');
            }
        }).error(function (response) {
            if (response == null) {
                controllerScope.showError("[" + (status + '') + "]Connect Server Fail");
            } else {
                controllerScope.showError("[" + (status + '') + "]" + response.message);
            }
        });
    };

    this.queryConfig = function (sizePerPage, page, confirm, status, no, name, keyWord, resUuid) {
        confirm = confirm == 0 ? '' : confirm;
        status = status == 0 ? '' : status;
        var url = ecAdapterUrl + '/taobao/config/list?size=' + sizePerPage
            + '&page=' + page
            + '&confirm=' + confirm
            + '&status=' + status;
        if (no !== undefined && no !== null && no !== '') {
            url = url + '&no=' + no;
        }
        if (name !== undefined && name !== null && name !== '') {
            url = url + '&name=' + name;
        }
        if (keyWord !== undefined && keyWord !== null && keyWord !== '') {
            url = url + '&keyWord=' + keyWord;
        }
        if (resUuid !== undefined && resUuid !== null) {
            url = url + '&resUuid=' + resUuid;
        }
        return $http.get(url);
    };
});