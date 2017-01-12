//CatalogueTemplate
angular.module('IOne-Production').service('CatalogueTemplate', function($http, Constant) {
    this.getAll = function(sizePerPage, page, status, confirm, release, includeEmpty) {
        confirm = confirm == 0 ? '' : confirm;
        release = release == 0 ? '' : release;
        status = status == 0 ? '' : status;

        if(includeEmpty == undefined) {
            includeEmpty = true;
        }

        return $http.get(Constant.BACKEND_BASE + '/catalogueTemplates?status=' + status + '&confirm=' + confirm + '&release=' + release + '&page=' + page + '&size=' + sizePerPage + '&includeEmpty=' + includeEmpty);
    };

    this.getAll2 = function() {
        return $http.get(Constant.BACKEND_BASE + '/catalogueTemplates?status=&confirm=&release=');
    };

    this.get = function(uuid) {
        return $http.get(Constant.BACKEND_BASE + '/catalogueTemplates/' + uuid);
    };

    this.add = function(template) {
        return $http.post(Constant.BACKEND_BASE + '/catalogueTemplates/', template);
    };

    this.copy = function(template, body) {
        return $http.post(Constant.BACKEND_BASE + '/catalogueTemplates?from=' + template.uuid, body);
    };

    this.modify = function(template) {
        return $http.patch(Constant.BACKEND_BASE + '/catalogueTemplates/' + template.uuid, template);
    };

    this.delete = function(uuid) {
        return $http.delete(Constant.BACKEND_BASE + '/catalogueTemplates/' + uuid);
    };

    this.addNode = function(uuid, node) {
        return $http.post(Constant.BACKEND_BASE + '/catalogueTemplates/' + uuid + '/details', node);
    };

    this.modifyNode = function(uuid, node) {
        return $http.patch(Constant.BACKEND_BASE + '/catalogueTemplates/' + uuid + '/details/' + node.uuid, node);
    };

    this.deleteNode = function(templateUuid, uuid) {
        return $http.delete(Constant.BACKEND_BASE + '/catalogueTemplates/' + templateUuid + '/details/' + uuid);
    };

    this.clearData = function(templateUuid) {
        return $http.delete(Constant.BACKEND_BASE + '/catalogueTemplates/' + templateUuid + '?catalogueOnly');
    };

    this.createDefault = function() {
        return template = {
            "terminalType" : null,
            "terminalMac" : null,
            "terminalIp" : null,
            "createUserUuid" : null,
            "createDate" : null,
            "modiUserUuid" : null,
            "modiDate" : null,
            "release" : "1",
            "status" : "1",
            "confirm" : "1",
            "no" : "",
            "name" : "",
            "dataStatus" : null,
            "dataConfirm" : null,
            "dataRelease" : null,
            "details" : [ ]
        }
    };

    this.createDefaultTemplateNode = function() {
        return {
            "terminalType" : null,
            "terminalMac" : null,
            "terminalIp" : null,
            "createUserUuid" : null,
            "createDate" : null,
            "modiUserUuid" : null,
            "modiDate" : null,
            "no" : null,
            "name" : null,
            "parentUuid" : null,
            "defaultFlag" : "Y",
            "type" : "1"
        }
    };
});

angular.module('IOne-Production').service('Catalogue', function($http, Constant) {

    this.getForRoot = function(templateDetailUuid) {
        return $http.get(Constant.BACKEND_BASE + '/catalogues?templateDetailUuid=' + templateDetailUuid);
    };

    this.getForRootWithFilter = function(templateDetailUuid,resUuid) {
       var url = '/catalogues?templateDetailUuid=' + templateDetailUuid;
       if(resUuid !== undefined && resUuid !== null) {
           url = url + '&resUuid=' + resUuid;
       }
        return $http.get(Constant.BACKEND_BASE + url);
    };


    this.getWithFilter = function(templateDetailUuid, parentUuid,resUuid) {
       var url = '/catalogues?templateDetailUuid=' + templateDetailUuid + '&parentUuid=' + parentUuid;
       if(resUuid !== undefined && resUuid !== null) {
           url = url + '&resUuid=' + resUuid;
       }
       return $http.get(Constant.BACKEND_BASE + url);
    };

//    this.get = function(templateDetailUuid, parentUuid) {
//        return $http.get(Constant.BACKEND_BASE + '/catalogues?templateDetailUuid=' + templateDetailUuid + '&parentUuid=' + parentUuid);

    this.get = function(templateDetailUuid, parentUuid, resUuid) {
        if(resUuid == undefined) resUuid = '';
        return $http.get(Constant.BACKEND_BASE + '/catalogues?templateDetailUuid=' + templateDetailUuid
            + '&parentUuid=' + parentUuid
            + '&resUuid=' + resUuid);

    };

    this.getAppCatalogue = function (endModifyDate) {

        return $http.get(Constant.BACKEND_BASE + '/catalogues?endModifyDate=' + endModifyDate
            + '&endModifyDateCondition=lte&page=0&release=2&size=10000');

    };

    this.add = function(templateNodeData) {
        return $http.post(Constant.BACKEND_BASE + '/catalogues', templateNodeData);
    };

    this.modify = function(templateNodeData) {
        return $http.patch(Constant.BACKEND_BASE + '/catalogues/' + templateNodeData.uuid, templateNodeData);
    };

    this.delete = function(templateNodeUuid) {
        return $http.delete(Constant.BACKEND_BASE + '/catalogues/' + templateNodeUuid);
    };

    this.backup = function(templateNodeData) {
        return {
            no: templateNodeData.no,
            name: templateNodeData.name,
            confirm: templateNodeData.confirm,
            release: templateNodeData.release,
            status: templateNodeData.status
        }
    };

    this.recover = function(templateNodeData, backup) {
        if(templateNodeData && backup) {
            templateNodeData.no = backup.no;
            templateNodeData.name = backup.name;
            templateNodeData.confirm = backup.confirm;
            templateNodeData.release = backup.release;
            templateNodeData.status = backup.status;
        }
        return templateNodeData;
    };

    this.addImage = function(templateNodeDataUuid, fileUuid) {
        return $http.post(Constant.BACKEND_BASE + '/catalogues/' + templateNodeDataUuid + '/images',
            {imageFileUuid: fileUuid});
    }
});
