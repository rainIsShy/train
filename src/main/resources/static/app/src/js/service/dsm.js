angular.module('IOne-Production').factory('DsmRuleService', function(Constant, $resource) {
    return $resource('/rules/:uuid', {}, {update: { method: 'PATCH' }});
});

angular.module('IOne-Production').factory('DsmScheduleService', function(Constant, $resource) {
    return $resource('/schedules/:uuid', {}, {update: { method: 'PATCH' }});
});

angular.module('IOne-Production').service('DsmAdaptorsService', function(Constant, $http) {
    this.getAdaptors = function() {
        return $http.get('/adaptors/');
    };

    this.getObjectFromAdaptor = function(adaptor) {
        return $http.get('/adaptors/' + adaptor + '/objects');
    };

    this.getFieldsFromObject = function(adaptor, object) {
        return $http.get('/adaptors/' + adaptor + '/objects/' + object + '/fields');
    };
});