angular.module('IOne-Auth', []);
angular.module('IOne-login', ['ngRoute', 'ngResource', 'ngCookies', 'ngMaterial', 'IOne-Auth', 'IOne-Constant']);

angular.module('IOne-login').controller('LoginController', function ($scope, $http, $window, AuthenticationService,Constant) {
    $scope.password = '';

    $scope.login = function () {
        $scope.logining = true;

        $http.get("http://localhost:8080/env").success(function(data){
            var serverName = data.profiles[0];
            var applicationConfig = data["applicationConfig: [classpath:/application.yaml]#"+serverName];
            Constant.BACKEND_BASE = applicationConfig["i1.i1-server.url"]==null?'':applicationConfig["i1.i1-server.url"];
            Constant.I1_ADAPTER_URL=applicationConfig["i1.adapter.url"]==null?'':applicationConfig["i1.adapter.url"];
            Constant.EC_ADAPTER_URL= applicationConfig["i1.ec-adapter.url"]==null?'':applicationConfig["i1.ec-adapter.url"];
            Constant.TIPTOP_ADAPTER_URL= applicationConfig["i1.tiptop-adapter.url"]==null?'':applicationConfig["i1.tiptop-adapter.url"];
            Constant.TMALL_ADAPTER_URL= applicationConfig["i1.tmall-adapter.url"]==null?'':applicationConfig["i1.tmall-adapter.url"];

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


        }).error(function(){});
    };
});
