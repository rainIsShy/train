angular.module('IOne-Production').service('Area', function ($http, Constant) {

    this.getAll = function () {
        return $http.get(Constant.BACKEND_BASE + '/areas');
    };

    this.getOne = function (areaUuid) {
            return $http.get(Constant.BACKEND_BASE + '/areas/' + areaUuid);
        };

    this.getForParent = function (parentUuid) {
        return $http.get(Constant.BACKEND_BASE + '/areas?parentUuid=' + parentUuid);
    };

    this.getForGrade = function (grade) {
        var url = '/areas?grade=' + grade;
        return $http.get(Constant.BACKEND_BASE + url);
    };

    this.getGradeAndParentUuid = function (grade, parentUuid) {
        return $http.get(Constant.BACKEND_BASE + '/areas?parentUuid=' + parentUuid + '&grade=' + grade);
    };

    this.getForChannelRelation = function () {
        var url = '/areas?type=channelRelation';
        return $http.get(Constant.BACKEND_BASE + url);
    };

    this.add = function (areaInput) {
        return $http.post(Constant.BACKEND_BASE + '/areas', areaInput);
    };

    this.modify = function (areaInput) {
        return $http.patch(Constant.BACKEND_BASE + '/areas/' + areaInput.uuid, areaInput);
    };

    this.delete = function (areaUuid) {
        return $http.delete(Constant.BACKEND_BASE + '/areas/' + areaUuid);
    };


    /*this.getWithFilter = function(templateDetailUuid, parentUuid,resUuid) {
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
     }*/
});