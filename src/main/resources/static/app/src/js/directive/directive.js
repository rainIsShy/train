angular.module('IOne-directives').directive('imageSlider', function() {
    return {
        scope: {
            photos: '=',
            index: '='
        },
        templateUrl: 'app/src/js/directive/slider.html',
        link: function($scope) {
            // initial image index
            $scope._Index = 0;

            // if a current image is the same as requested image
            $scope.isActive = function (index) {
                return $scope._Index === index;
            };

            // show prev image
            $scope.showPrev = function () {
                $scope._Index = ($scope._Index > 0) ? --$scope._Index : $scope.photos.length - 1;
            };

            // show next image
            $scope.showNext = function () {
                $scope._Index = ($scope._Index < $scope.photos.length - 1) ? ++$scope._Index : 0;
            };

            // show a certain image
            $scope.showPhoto = function (index) {
                $scope._Index = index;
            };

            $scope.$watch('_Index', function() {
                $scope.index.value = $scope._Index;
            });

        }
    }
});

angular.module('IOne-directives').directive('datePicker', function() {
    return {
        restrict: 'A',
        scope: {
            object: "=",
            field: '@',
            viewField: '@',
            initValue : '@'
        },
        link : function (scope, element) {

            var getDateString = function(longValue) {
                var date = new Date(longValue);
                return date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate();
            };

            $(function(){
                element.datepicker({
                    dateFormat:'yy/mm/dd',
                    onSelect:function (date) {
                        scope.$apply(function () {
                            scope.object[scope.viewField] = date;
                            scope.object[scope.field] = new Date(date).getTime();
                        });
                    }
                });
                if(scope.initValue) {
                    scope.object[scope.viewField] = getDateString(scope.object[scope.field]);
                } else {
                    scope.object[scope.viewField] = getDateString(new Date().getTime());
                    scope.object[scope.field] = new Date().getTime();
                }
            });
        }
    }
});

angular.module('IOne-directives').directive('pagination', function() {
    return {
        scope:{
            option: '=',
            callback: '&'
        },
        templateUrl: 'app/src/js/directive/pagination.html',
        link: function($scope) {
            $scope.prePage = function() {
                if($scope.option.currentPage > 0) {
                    $scope.option.currentPage = $scope.option.currentPage-1;
                    $scope.callback();
                }
            };

            $scope.nextPage = function() {
                if($scope.option.currentPage < $scope.option.totalPage - 1) {
                    $scope.option.currentPage = $scope.option.currentPage+1;
                    $scope.callback();
                }
            };

            $scope.firstPage = function() {
                if($scope.option.currentPage != 0) {
                    $scope.option.currentPage = 0;
                    $scope.callback();
                }
            };

            $scope.lastPage = function() {
                if($scope.option.currentPage != $scope.option.totalPage - 1) {
                    $scope.option.currentPage = $scope.option.totalPage - 1;
                    $scope.callback();
                }
            }
        }
    }
});

angular.module('IOne-directives').directive('productionList', function(Production, Constant, $mdDialog) {
    return {
        scope:{
            buttonName: '@',
            buttonCallback: '&',
            selectItemCallback: '&',
            param: '='
        },
        templateUrl: 'app/src/js/directive/productionList.html',
        link: function($scope) {
            $scope.PROD_TYPE = Constant.PROD_TYPE;

            $scope.pageOption = {
                sizePerPage: 16,
                currentPage: 0,
                totalPage: 100,
                totalElements: 100
            };

            $scope.searchQuery = {
                type: 0,
                no: '',
                name: ''
            };

            $scope.param = $scope.param || {
                confirm: 0,
                release: 0,
                status: 0,
                eshopType: 0,
                assemblingFlag: ''
            };
            //按钮重新刷新时，回到第一页
            $scope.queryAction = function () {
                $scope.pageOption.currentPage = 0;
                $scope.refreshProduction();
            };
            //回车键响应
            $scope.queryEnter = function (e) {
                if (e.keyCode === 13) {
                    $scope.queryAction();
                }
            };
            $scope.refreshProduction = function() {
                Production.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, $scope.param.confirm, $scope.param.release, $scope.param.status,
                    $scope.searchQuery.type, 0, $scope.searchQuery.no, $scope.searchQuery.name, '', $scope.param.eshopType, $scope.param.assemblingFlag, '1', '1').success(function (data) {
                    $scope.allProductionsData = data;
                    $scope.pageOption.totalPage = data.totalPages;
                    $scope.pageOption.totalElements = data.totalElements;
                });
            };

            $scope.refreshProduction();

            $scope.getImageFullPath = function(path) {
                if(path == null) {
                    return Constant.BACKEND_BASE + '/app/img/item.jpeg';
                } else {
                    return Constant.BACKEND_BASE + '/app/assets/IMAGE/' + path;
                }
            };

            $scope.buttonCallbackHandler = function(production) {
                $scope.buttonCallback({production: production});
            };

            $scope.selectItemCallbackHandler = function(production) {
                $scope.selectItemCallback({production: production});
            };

            $scope.openQuickView = function($event, production) {
                $mdDialog.show({
                    controller: 'QuickViewController',
                    templateUrl: 'app/src/app/production/production/quick_view.html',
                    parent: angular.element(document.body),
                    targetEvent: event,
                    locals: {
                        productionUuid: production.uuid
                    }
                }).then(function(data) {

                });

                $event.stopPropagation();
                $event.preventDefault();
            };
        }
    }
});

angular.module('IOne-directives').directive('orgChart', function($compile) {
    return {
        scope:{
            sourceUpdateFlag: '=',
            source: '=',
            callback: '&',
            selectCallback: '&'
        },
        templateUrl: 'app/src/js/directive/orgChart.html',
        link: function($scope, $element) {
            $scope.opts = {
                chartElement : '#chart',
                dragAndDrop  : true,
                control		 : false,
                rowcolor     : false,
                callback     : function(sourceId, targetId) {
                    $scope.callback({source: sourceId, dest: targetId});
                    setInterval(function() {
                        $scope.bindClick();
                    }, 1000);
                }
            };

            $scope.sourceChangeHandler = function() {
                $("#in").empty();
                $("#chart").empty();

                $scope.loadjson();
                $scope.init_tree();
                $compile($element.contents())($scope);
            };

            $scope.$watch('source.length', function() {
                $scope.sourceChangeHandler();
            });

            $scope.$watch('sourceUpdateFlag', function() {
                $scope.sourceChangeHandler();
            });

            $scope.bindClick = function() {
                $(".node").off('click').on('click', function(event) {
                    $(".node").removeClass('highlight-node');
                    $(event.currentTarget).addClass('highlight-node');

                    var allClass = $(event.currentTarget).attr('class').split(/\s+/);
                    $scope.selectCallback({uuid: allClass[1]});
                });

                $(".label_node").off('click').on('click', function(event) {
                    $(".node").removeClass('highlight-node');
                    $(event.currentTarget.parentNode).addClass('highlight-node');

                    var allClass = $(event.currentTarget.parentNode).attr('class').split(/\s+/);
                    $scope.selectCallback({uuid: allClass[1]});
                    event.stopPropagation();
                    event.preventDefault();
                });
            };

            $scope.init_tree = function() {
                $("#org").jOrgChart($scope.opts);
                $scope.bindClick();
            };

            $scope.loadjson = function() {
                var items = [];
                var data = TAFFY($scope.source);

                data({
                    "parent": ""
                }).each(function(record) {
                    loops(record);
                });
                //start loop the json and form the html
                function loops(root) {
                    if (root.parent == "") {
                        if(root.aamFlag == '1') {
                            items.push("<li class='" + root.uuid + " green unic" + root.id + " root' id='" + root.uuid + "'><span class='label_node'>" + root.name + "</br></span><span class='label_node'>" + root.channel + "</span>");
                        } else if(root.aamFlag == '2') {
                            items.push("<li class='" + root.uuid + " red unic" + root.id + " root' id='" + root.uuid + "'><span class='label_node'>" + root.name + "</br></span><span class='label_node'>" + root.channel + "</span>");
                        }
                    } else {
                        if(root.aamFlag == '1') {
                            items.push("<li class='" + root.uuid + " green child unic" + root.id + "' id='" + root.uuid + "'><span class='label_node'>" + root.name + "</br></span><span class='label_node'>" + root.channel + "</span>");
                        } else if(root.aamFlag == '2') {
                            items.push("<li class='" + root.uuid + " red child unic" + root.id + "' id='" + root.uuid + "'><span class='label_node'>" + root.name + "</br></span><span class='label_node'>" + root.channel + "</span>");
                        }

                    }
                    var c = data({
                        "parent": root.id
                    }).count();
                    if (c != 0) {
                        items.push("<ul>");
                        data({
                            "parent": root.id
                        }).each(function(record, recordnumber) {
                            loops(record);
                        });
                        items.push("</ul></li>");
                    } else {
                        items.push("</li>");
                    }
                } // End the generate html code

                //push to html code
                $("<ul/>", {
                    "id": "org",
                    "style": "float:right;",
                    html: items.join("")
                }).appendTo("#in");
            };
        }
    }
});


angular.module('IOne-directives').directive('objectEditor', function($http, Constant, $mdDialog) {
    return {
        scope: {
            status: '=',
            source: '=',
            domain: "="
        },
        templateUrl: 'app/src/js/directive/objectEditor.html',
        link: function($scope) {
            $scope.$watch('source', function() {
                if($scope.status == 'add') {

                } else if($scope.status == 'edit') {

                }
                if($scope.source) {
                    $http.get(Constant.BACKEND_BASE + '/objectInfo/' + $scope.domain).success(function(data) {
                        $scope.objectInfo = data;

                        angular.forEach(Object.keys($scope.objectInfo), function(key) {
                            if($scope.objectInfo[key].type == 'DATE' && angular.isDefined($scope.source[key]) && $scope.source[key]!= null) {
                                $scope.source[key] = new Date($scope.source[key]);
                            }
                        })
                    });
                }
            });

            $scope.openDlg = function(key, fieldInfo) {
                $mdDialog.show({
                    controller: 'SearchController',
                    templateUrl: 'app/src/app/search.html',
                    parent: angular.element(document.body),
                    targetEvent: event,
                    locals: {
                        source: $scope.source,
                        key: key,
                        objectInfo: $scope.objectInfo,
                        fieldInfo: fieldInfo,
                        queryInfo: $scope.source.queryInfo
                    }
                }).then(function(data) {
                    $scope.source[key] = data;
                    $scope.source[key + 'Uuid'] = data.uuid;
                });
            }
        }
    }

});


angular.module('IOne-directives').controller('SearchController', function ($scope, $http, $mdDialog, Constant, source, key, objectInfo, fieldInfo, queryInfo) {
    $scope.source = source;
    $scope.key = key;
    $scope.objectInfo = objectInfo;
    $scope.fieldInfo = fieldInfo;
    $scope.queryInfo = queryInfo;

    $scope.pageOption = {
        sizePerPage: 10,
        currentPage: 0,
        totalPage: 100,
        totalElements: 100
    };

    $scope.$watch('searchKeyword', function () {
        $scope.pageOption.currentPage = 0;
        $scope.pageOption.totalPage = 0;
        $scope.pageOption.totalElements = 0;
        $scope.searchInfo = {
            keyWord: $scope.searchKeyword,
            searchKeyWord: $scope.searchKeyword
        };        
    }, true);
    $scope.queryAction = function () {
        if (!jQuery.isEmptyObject($scope.source.url)) {
            $scope.fieldInfo.url = $scope.source.url[$scope.fieldInfo.name];
        }
        var param = '';
        if (!jQuery.isEmptyObject($scope.queryInfo)) {
            angular.forEach(Object.keys($scope.queryInfo), function (key) {
                param += "&" + key + "=" + $scope.queryInfo[key];
            })
        }
        if (!jQuery.isEmptyObject($scope.searchInfo) && !jQuery.isEmptyObject($scope.searchKeyword)) {
            angular.forEach(Object.keys($scope.searchInfo), function (key) {
                param += "&" + key + "=" + $scope.searchInfo[key];
            })
        }
        var url = Constant.BACKEND_BASE + '/' + $scope.fieldInfo.url + '?page=' + $scope.pageOption.currentPage + '&size=' + $scope.pageOption.sizePerPage + param;
        $http.get(url).success(function(data) {
            if(data) {
                if(data.content) {
                    $scope.dataList = data.content;
                    $scope.pageOption.totalPage = data.totalPages;
                    $scope.pageOption.totalElements = data.totalElements;
                } else {
                    $scope.dataList = data;
                }
            }
        })
    };
    $scope.queryAction();

    $scope.select = function (selectedObject) {
        $scope.selectedObject = selectedObject;
        $mdDialog.hide($scope.selectedObject);
    };

    $scope.hideDlg = function () {
        $mdDialog.hide($scope.selectedObject);
    };

    $scope.cancelDlg = function () {
        $mdDialog.cancel();
    };
});

angular.module('IOne-directives').directive('customerAddressList', function (CustomerAddress, Constant, $mdDialog) {
    return {
        scope: {
            buttonName: '@',
            buttonCallback: '&',
            selectItemCallback: '&',
            param: '='
        },
        templateUrl: 'app/src/js/directive/customerAddressList.html',
        link: function ($scope) {
            $scope.PROD_TYPE = Constant.PROD_TYPE;

            $scope.pageOption = {
                sizePerPage: 16,
                currentPage: 0,
                totalPage: 100,
                totalElements: 100
            };

            $scope.param = $scope.param || {customerUuid: ""};

            $scope.refreshCustomerAddress = function () {
                CustomerAddress.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, $scope.param.customerUuid).success(function (data) {
                    $scope.customerAddressList = data.content;
                    $scope.pageOption.totalPage = data.totalPages;
                    $scope.pageOption.totalElements = data.totalElements;
                });
            };

            $scope.refreshCustomerAddress();

            $scope.selectAddressCallbackHandler = function (customerAddress) {
                $scope.selectItemCallback({customerAddress: customerAddress});
            };
        }
    }
});

angular.module('IOne-directives').directive("nextFocus", nextFocus);
/** Usage:
 <input next-focus id="field1">
 <input next-focus id="field2">
 <input id="field3">
 Upon pressing ENTER key the directive will switch focus to
 the next field id e.g field2
 The last field should not have next-focus directive to avoid
 focusing on non-existing element.
 Works for Web, iOS (Go button) & Android (Next button) browsers,
 **/
function nextFocus() {
    var directive = {
        restrict: 'A',
        link: function(scope, elem, attrs) {
            elem.bind('keydown', function(e) {
                var partsId = attrs.id.match(/field(\d{1})/);
                var currentId = parseInt(partsId[1]);
                var code = e.keyCode || e.which;
                if (code === 13) {
                    e.preventDefault();
                    document.querySelector('#field' + (currentId + 1)).focus();
                }
            });
        }
    };
    return directive;
};