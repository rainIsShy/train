angular.module('IOne-Production').factory('SysTable', function($resource, Constant) {
    return $resource(Constant.BACKEND_BASE + '/sysTables/:uuid', {}, {
        update: {
            method: 'PATCH'
        }
    });
});

angular.module('IOne-Production').factory('ShareTreeMaster', function($resource, Constant) {
    return $resource(Constant.BACKEND_BASE + '/shareTreeMasters/:uuid', {}, {
        update: {
            method: 'PATCH'
        }
    });
});

angular.module('IOne-Production').factory('ShareTreeDetail', function($resource, Constant) {
    return $resource(Constant.BACKEND_BASE + '/shareTrees/:shareTreeUuid/details/:uuid', {}, {
        update: {
            method: 'PATCH'
        }
    });
});