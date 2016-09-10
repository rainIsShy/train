angular.module('IOne-Production').config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/api-config', {
        controller: 'ApiConfigController',
        templateUrl: 'app/src/app/taobao_data/api_config/apiConfig.html'
    })
}]);

angular.module('IOne-Production').controller('ApiConfigController', function($scope, Constant, $mdDialog, $timeout){
    $scope.listTabSelected = function() {
        //$scope.refreshAllApiConfig();
        $scope.changeViewStatus(Constant.UI_STATUS.VIEW_UI_STATUS, 0);
    };
});
