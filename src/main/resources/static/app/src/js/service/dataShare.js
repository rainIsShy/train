angular.module('IOne-Production').factory('SysTable', function($resource) {
    return $resource('/sysTables/:uuid', {}, {
        update: {
            method: 'PATCH'
        }
    });
});

angular.module('IOne-Production').factory('ShareTreeMaster', function($resource) {
    return $resource('/shareTreeMasters/:uuid', {}, {
        update: {
            method: 'PATCH'
        }
    });
});

angular.module('IOne-Production').factory('ShareTreeDetail', function($resource) {
    return $resource('/shareTrees/:shareTreeUuid/details/:uuid', {}, {
        update: {
            method: 'PATCH'
        }
    });
});