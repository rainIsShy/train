angular.module('IOne-Auth', []);
angular.module('IOne-login', ['ngRoute', 'ngResource', 'ngCookies', 'ngMaterial', 'IOne-Auth', 'IOne-Constant']);

angular.module('IOne-login').controller('LoginController', function ($scope, $http, $window, AuthenticationService) {
    $scope.password = '';

    $scope.login = function () {
        $scope.logining = true;

        AuthenticationService.Login($scope.username, $scope.password)
            .success(function (result, status, headers) {
                $scope.info = '登录成功， 正在转向首页...';

                $scope.logining = false;

                AuthenticationService.SetCredentials($scope.username, $scope.password, result);

                $window.location.href = '/';
            }).error(function() {
                $scope.info = '用户名或密码不正确， 请重新登录。';

                $scope.logining = false;
        });
    };
});
