angular.module('IOne-Production').service('DataBanService', function(Constant, $http) {
    this.getAll = function(type, ctrlSourceUuid, cptUuid) {
        if(type == undefined) type = 3;
        if(ctrlSourceUuid == undefined) ctrlSourceUuid = '';
        if(cptUuid == undefined) cptUuid = '';

        return $http.get(Constant.BACKEND_BASE + '/dataBans?type=' + type + '&ctrlSourceUuid=' + ctrlSourceUuid + '&sysCptUuid=' + cptUuid);
    };

    this.getAllValues = function(type, uuid, sysCptUuid, sysResUuid) {
        if(type == undefined) type = 0;
        if(uuid == undefined) uuid = '';
        if(sysCptUuid == undefined) sysCptUuid = '';
        if(sysResUuid == undefined) sysResUuid = '';

        return $http.get(Constant.BACKEND_BASE + '/dataBans/data?type=' + type
            + '&uuid=' + uuid
            + '&sysCptUuid=' + sysCptUuid
            + '&sysResUuid=' + sysResUuid);
    };

    this.add = function(type, ctrlSourceUuid, value, sysCptUuid) {
        return $http.post(Constant.BACKEND_BASE + '/dataBans', {
            type: type,
            ctrlSourceUuid : ctrlSourceUuid,
            no: Math.random().toString(36).substring(10),
            valueUuid: value,
            sysCptUuid: sysCptUuid
        });
    };

    this.delete = function(uuid, type, ctrlSourceUuid, value, sysCptUuid) {
        if(uuid) {
            return $http.delete(Constant.BACKEND_BASE + '/dataBans/' + uuid);
        } else {
            return $http.delete(Constant.BACKEND_BASE + '/dataBans?type=' + type + '&ctrlSourceUuid=' + ctrlSourceUuid + '&value=' + value + '&sysCptUuid=' + sysCptUuid);
        }
    };
});

angular.module('IOne-Production').service('DataPermitService', function(Constant, $http) {
    this.getAll = function(type, ctrlSourceUuid, cptUuid) {
        if(type == undefined) type = 3;
        if(ctrlSourceUuid == undefined) ctrlSourceUuid = '';
        if(cptUuid == undefined) cptUuid = '';

        return $http.get(Constant.BACKEND_BASE + '/dataPermits?type=' + type + '&ctrlSourceUuid=' + ctrlSourceUuid + '&sysCptUuid=' + cptUuid);
    };


    this.getAllValues = function(type, uuid, sysCptUuid, sysResUuid) {
        if(type == undefined) type = 0;
        if(uuid == undefined) uuid = '';
        if(sysCptUuid == undefined) sysCptUuid = '';
        if(sysResUuid == undefined) sysResUuid = '';

        return $http.get(Constant.BACKEND_BASE + '/dataPermits/data?type=' + type
            + '&uuid=' + uuid
            + '&sysCptUuid=' + sysCptUuid
            + '&sysResUuid=' + sysResUuid);
    };

    this.add = function(type, ctrlSourceUuid, value, sysCptUuid) {
        return $http.post(Constant.BACKEND_BASE + '/dataPermits', {
            type: type,
            ctrlSourceUuid : ctrlSourceUuid,
            no: Math.random().toString(36).substring(10),
            valueUuid: value,
            sysCptUuid: sysCptUuid
        });
    };

    this.delete = function(uuid, type, ctrlSourceUuid, value, sysCptUuid) {
        if(uuid) {
            return $http.delete(Constant.BACKEND_BASE + '/dataPermits/' + uuid);
        } else {
            return $http.delete(Constant.BACKEND_BASE + '/dataPermits?type=' + type + '&ctrlSourceUuid=' + ctrlSourceUuid + '&value=' + value + '&sysCptUuid=' + sysCptUuid);
        }
    };
});

angular.module('IOne-Production').service('SysCptService', function(Constant, $http) {
    this.getAll = function(sysResUuid) {
        if(sysResUuid == undefined) {
            sysResUuid = '';
        }
        return $http.get(Constant.BACKEND_BASE + '/sysCpts?sysResUuid=' + sysResUuid);
    };

    this.getAllAvailableNames = function() {
        return $http.get(Constant.BACKEND_BASE + '/sysCpts/data');
    };

    this.add = function(name, value, sysResUuid, objectFlag) {
        return $http.post(Constant.BACKEND_BASE + '/sysCpts', {
            no: Math.random().toString(36).substring(10),
            name: name,
            value: value,
            sysResUuid: sysResUuid,
            objectFlag: objectFlag
        });
    };

    this.delete = function(uuid) {
        return $http.delete(Constant.BACKEND_BASE + '/sysCpts/' + uuid);
    };
});

angular.module('IOne-Production').service('CptService', function(Constant, $http) {
    this.getAll = function(type, ctrlSourceUuid, sysCptUuid, sysResUuid) {
        if(type == undefined) type = 3;
        if(ctrlSourceUuid == undefined) ctrlSourceUuid = '';
        if(sysCptUuid == undefined) sysCptUuid = '';
        if(sysResUuid == undefined) sysResUuid = '';

        return $http.get(Constant.BACKEND_BASE + '/cpts?type=' + type + '&ctrlSourceUuid=' + ctrlSourceUuid + '&sysCptUuid=' + sysCptUuid + '&syResUuid=' + sysResUuid);
    };

    this.add = function(type, ctrlSourceUuid, sysCptUuid, displayFlag) {
        return $http.post(Constant.BACKEND_BASE + '/cpts', {
            type: type,
            ctrlSourceUuid: ctrlSourceUuid,
            sysCptUuid: sysCptUuid,
            displayFlag: displayFlag
        });
    };

    this.modify = function(cpt) {
        return $http.patch(Constant.BACKEND_BASE + '/cpts/' + cpt.uuid, cpt);
    };

    this.delete = function(cptUuid) {
        return $http.delete(Constant.BACKEND_BASE + '/cpts/' + cptUuid);
    };
});

angular.module('IOne-Production').service('SysMenusService', function(Constant, $http) {
    this.getAll = function(sysResUuid) {
        if(sysResUuid == undefined) sysResUuid = '';

        return $http.get(Constant.BACKEND_BASE + '/sysMenus?sysResUuid=' + sysResUuid);
    };
});

angular.module('IOne-Production').service('MenuService', function(Constant, $http) {
    this.getAll = function(type, ctrlSourceUuid, sysBaseMenuFileUuid, sysResUuid, includingAll) {
        if(type == undefined) type = 3;
        if(ctrlSourceUuid == undefined) ctrlSourceUuid = '';
        if(sysBaseMenuFileUuid == undefined) sysBaseMenuFileUuid = '';
        if(sysResUuid == undefined) sysResUuid = '';
        if(includingAll == undefined) includingAll = false;

        return $http.get(Constant.BACKEND_BASE + '/menus?type=' + type
                + '&ctrlSourceUuid=' + ctrlSourceUuid
                + '&sysBaseMenuFileUuid=' + sysBaseMenuFileUuid
                + '&menuResUuid=' + sysResUuid
                + '&allMenu=' + includingAll);
    };

    this.add = function(type, ctrlSourceUuid, sysMenuUuid) {
        return $http.post(Constant.BACKEND_BASE + '/menus', {
            type: type,
            ctrlSourceUuid: ctrlSourceUuid,
            sysBaseMenuFileUuid: sysMenuUuid
        })
    };

    this.delete = function(menuUuid) {
        return $http.delete(Constant.BACKEND_BASE + '/menus/' + menuUuid);
    };
});

angular.module('IOne-Production').service('ResService', function(Constant, $http) {
    this.getAll = function(type, ctrlSourceUuid, includingAll) {
        if(type == undefined) type = 3;
        if(ctrlSourceUuid == undefined) ctrlSourceUuid = '';
        if(includingAll == undefined) includingAll = false;

        return $http.get(Constant.BACKEND_BASE + '/ress?type=' + type + '&ctrlSourceUuid=' + ctrlSourceUuid + '&allRes=' + includingAll);
    };

    this.add = function(type, ctrlSourceUuid, sysResUuid) {
        return $http.post(Constant.BACKEND_BASE + '/ress', {
            type: type,
            ctrlSourceUuid: ctrlSourceUuid,
            sysResUuid: sysResUuid
        })
    };

    this.delete = function(resUuid) {
        return $http.delete(Constant.BACKEND_BASE + '/ress/' + resUuid);
    };
});

angular.module('IOne-Production').service('UserService', function(Constant, $http) {
    this.getAll = function(size, page, status, type, userUuid, keyword) {
        if(status == undefined || status == 0) status = '';
        if(type == undefined) type = '1';
        if(userUuid == undefined) userUuid = '';
        if(keyword == undefined) keyword = '';

        return $http.get(Constant.BACKEND_BASE + '/users?page=' + page + '&size=' + size + '&status=' + status + '&userUuid=' + userUuid + '&type=' + type + '&keyword=' + keyword);
    };

    this.getUser = function(userUuid, type) {
        return $http.get(Constant.BACKEND_BASE + '/users?status=&userUuid=' + userUuid + '&type=' + type);
    };

    this.add = function(user) {
        return $http.post(Constant.BACKEND_BASE + '/users', user);
    };

    this.modify = function(user) {
        return $http.patch(Constant.BACKEND_BASE + '/users/' + user.uuid, user);
    };

    this.modifyPassword = function(userPassword) {
        return $http.patch(Constant.BACKEND_BASE + '/users/resetPassword/', userPassword);
    };

    this.get = function(uuid) {
        return $http.get(Constant.BACKEND_BASE + '/users/' + uuid);
    };

    this.delete = function(uuid) {
        return $http.delete(Constant.BACKEND_BASE + '/users/' + uuid);
    };
});

angular.module('IOne-Production').service('RoleService', function(Constant, $http) {
    this.getAll = function(size, page, status, keyword) {
        if(status == 0 || status == undefined) status = '';
        if(keyword == undefined) keyword = '';

        return $http.get(Constant.BACKEND_BASE + '/roles?page=' + page + '&size=' + size + '&status=' + status + '&keyword=' + keyword);
    };

    this.add = function(role) {
        return $http.post(Constant.BACKEND_BASE + '/roles', role);
    };

    this.modify = function(role) {
        return $http.patch(Constant.BACKEND_BASE + '/roles/' + role.uuid, role);
    };

    this.get = function(uuid) {
        return $http.get(Constant.BACKEND_BASE + '/roles/' + uuid);
    };

    this.delete = function(uuid) {
        return $http.delete(Constant.BACKEND_BASE + '/roles/' + uuid);
    };
});

angular.module('IOne-Production').service('FunctionService', function(Constant, $http) {
    this.getAll = function(size, page, status, keyword) {
        if(status == 0 || status == undefined) status = '';
        if(keyword == undefined) keyword = '';

        return $http.get(Constant.BACKEND_BASE + '/functions?page=' + page + '&size=' + size + '&status=' + status + '&keyword=' + keyword);
    };

    this.add = function(func) {
        return $http.post(Constant.BACKEND_BASE + '/functions', func);
    };

    this.modify = function(func) {
        return $http.patch(Constant.BACKEND_BASE + '/functions/' + func.uuid, func);
    };

    this.get = function(uuid) {
        return $http.get(Constant.BACKEND_BASE + '/functions/' + uuid);
    };

    this.delete = function(uuid) {
        return $http.delete(Constant.BACKEND_BASE + '/functions/' + uuid);
    };
});

angular.module('IOne-Production').service('GroupService', function(Constant, $http) {
    this.getAll = function(size, page, status, keyword) {
        if(status == 0 || status == undefined) status = '';
        if(keyword == undefined) keyword = '';

        return $http.get(Constant.BACKEND_BASE + '/groups?page=' + page + '&size=' + size + '&status=' + status + '&keyword=' + keyword);
    };

    this.add = function(group) {
        return $http.post(Constant.BACKEND_BASE + '/groups', group);
    };

    this.modify = function(group) {
        return $http.patch(Constant.BACKEND_BASE + '/groups/' + group.uuid, group);
    };

    this.get = function(uuid) {
        return $http.get(Constant.BACKEND_BASE + '/groups/' + uuid);
    };

    this.delete = function(uuid) {
        return $http.delete(Constant.BACKEND_BASE + '/groups/' + uuid);
    };
});

angular.module('IOne-Production').service('UserRoleService', function(Constant, $http) {
    this.get = function(userUuid, roleUuid) {
        if(userUuid == undefined) userUuid = '';
        if(roleUuid == undefined) roleUuid = '';
        return $http.get(Constant.BACKEND_BASE + '/userRoles?userUuid=' + userUuid + '&roleUuid=' + roleUuid);
    };

    this.delete = function(userRoleUuid) {
        return $http.delete(Constant.BACKEND_BASE + '/userRoles/' + userRoleUuid);
    };

    this.add = function(userUuid, roleUuid) {
        return $http.post(Constant.BACKEND_BASE + '/userRoles', {
            userUuid: userUuid,
            roleUuid: roleUuid
        });
    };
});

angular.module('IOne-Production').service('FunctionRoleService', function(Constant, $http) {
    this.get = function(roleUuid, functionUuid) {
        if(functionUuid == undefined) functionUuid = '';
        if(roleUuid == undefined) roleUuid = '';
        return $http.get(Constant.BACKEND_BASE + '/functionRoles?roleUuid=' + roleUuid + '&functionUuid=' + functionUuid);
    };

    this.delete = function(uuid) {
        return $http.delete(Constant.BACKEND_BASE + '/functionRoles/' + uuid);
    };

    this.add = function(roleUuid, functionUuid) {
        return $http.post(Constant.BACKEND_BASE + '/functionRoles', {
            functionUuid: functionUuid,
            roleUuid: roleUuid
        });
    };
});

angular.module('IOne-Production').service('GroupFunctionService', function(Constant, $http) {
    this.get = function (functionfUuid, groupUuid) {
        if(functionUuid == undefined) functionUuid = '';
        if(groupUuid == undefined) groupUuid = '';
        return $http.get(Constant.BACKEND_BASE + '/groupFunctions?groupUuid=' + groupUuid + '&functionUuid=' + functionUuid);
    };

    this.delete = function(uuid) {
        return $http.delete(Constant.BACKEND_BASE + '/groupFunctions/' + uuid);
    };

    this.add = function(functionUuid, groupUuid) {
        return $http.post(Constant.BACKEND_BASE + '/groupFunctions', {
            functionUuid: functionUuid,
            groupUuid: groupUuid
        });
    };

    this.getByStatus = function () {
        return $http.get(Constant.BACKEND_BASE + '/groupFunctions?status=1&groupStatus=1&functionStatus=1');
    };

    this.getByUuid = function (uuid) {
        return $http.get(Constant.BACKEND_BASE + '/groupFunctions/' + uuid);
    };
});

angular.module('IOne-Production').service('GroupUserService', function(Constant, $http) {
    this.promise = null;
    this.query = function(size, page, status, keyword) {
        if(this.promise) {
            return this.promise;
        }
        if(status == undefined || status == 0) status = '';
        if(keyword == undefined) keyword = '';

        var that = this;
        return this.promise = $http.get(Constant.BACKEND_BASE + '/groupUsers?page=' + page + '&size=' + size + '&status=' + status + '&keyWord=' + keyword).success(function() {
            that.promise = null;
        });
    };

    this.get = function(uuid) {
        return $http.get(Constant.BACKEND_BASE + '/groupUsers/' + uuid);
    };

    this.add = function(groupUser) {
        return $http.post(Constant.BACKEND_BASE + '/groupUsers', groupUser);
    };

    this.modify = function(groupUser) {
        return $http.patch(Constant.BACKEND_BASE + '/groupUsers/' + groupUser.uuid, groupUser);
    };

    this.delete = function(uuid) {
        return $http.delete(Constant.BACKEND_BASE + '/groupUsers/' + uuid);
    }
});