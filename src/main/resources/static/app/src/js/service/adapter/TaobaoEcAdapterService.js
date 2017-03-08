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
    this.insertConfig = function (insertObj, controllerScope, ecTypeNo, successCallBack) {
        var url = ecAdapterUrl + '/ec/config/'+ecTypeNo+'/insert';
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

    this.updateConfig = function (updateObj, controllerScope, updateEcTypeNo, uuid, successCallBack) {
        var url = ecAdapterUrl + '/ec/config/'+updateEcTypeNo+'/update/'+uuid;
        angular.forEach(updateObj, function (item) {
//            delete(item.createDate);
//            delete(item.modifiedDate);
//            item.modifierUuid = $rootScope.globals.currentUser.userUuid;
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

    this.deleteConfig = function (deleteObj, controllerScope, deleteEcTypeNo, uuid, successCallBack) {
        var url = ecAdapterUrl + '/ec/config/'+deleteEcTypeNo+'/delete/'+uuid;
        angular.forEach(deleteObj, function (item) {
            delete(item.createDate);
            delete(item.modifiedDate);
        });
        return $http({
            method: 'DELETE',
            url: url,
            data: deleteObj,
            headers: {'Content-Type': 'application/json;charset=utf-8'}
        }).success(function (response, status) {
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

    this.queryConfig = function (sizePerPage, page, confirm, status, platform, no, name, keyWord, resUuid, interface) {
        confirm = confirm == 0 ? '' : confirm;
        status = status == 0 ? '' : status;
        platform = platform == 0 ? '' : platform;
        var url = ecAdapterUrl + '/ec/config/'+interface+'/list?size=' + sizePerPage
            + '&page=' + page
            + '&confirm=' + confirm
            + '&status=' + status
            + '&platform='+ platform;
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

    //執行發貨
    this.executeLogistics = function (logisticsData, controllerScope, successCallBack) {
        //11
        var logisticsUrl = ecAdapterUrl + '/api/taobao/logistics/logisticsOfflineSend'

        return $http.post(logisticsUrl, logisticsData).success(function (response, status) {
            if (status == 200) {
                successCallBack(response);
            } else {
                controllerScope.showError('執行失敗');
            }
        }).error(function (response) {
            if (response == null) {
                controllerScope.showError("[" + (response.status + '') + "]Connect Server Fail");
            } else {
                controllerScope.showError("[" + (response.status + '') + "]" + response.message);
            }
        });
    };


    this.queryChannel = function(){
        var url = ecAdapterUrl + '/ec/config/common/list/ocm/chan';
        return $http.get(url);
    };

    this.queryMall = function(){
        var url = ecAdapterUrl + '/ec/config/common/list/ocm/mall';
        return $http.get(url);
    };

});