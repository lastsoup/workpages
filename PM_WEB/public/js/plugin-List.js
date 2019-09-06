/*----------------------------------------
* Copyright (c) 2017 菠萝工作室
* 网站：http://www.0non0.com
* Date: 2017-5-18
* Creater:Cqy
----------------------------------------*/

/*------通用的List控件库 by:cqy 2017-11-23-----*/
/*------集中处理List------*/
var ListForm=function(settings){
    var defaultSettings = {
        Els: {
            validEl:$("#config-form"),
            modelEl:$("#config-modal"),
            validSaveEl:$("#btn-submit")
        },
        ajax:{
            uploadFileUrl:"/UpLoad/UpLoadBiddingPlanApplyFile",
            deleteFileUrl:"/Attach/DelAttachFile"
        },
        validfields:null,
        dataTable:null,
        customCallback:function(){},
        saveSuccess:function(){}
    }
    window.list=this;
    this.options = $.extend(true, defaultSettings, settings);
    this.uploadFilesObj=[];
    this.DropzoneObj=null;
    this.options.customCallback();
}


ListForm.prototype.init=function(){
    this.select();
    this.validator();
    this.datepicker();
    this.dialog();
    this.list();
}

ListForm.prototype.list=function(){
    this.tableManage=$('#table-dt-addrow').xDataTable(this.options.dataTable);
}

ListForm.prototype.datepicker=function(){
    list.options.Els.dateEl.xdatepicker({format: "yyyy-mm-dd",validator:true});
}

ListForm.prototype.validator=function(){
    this.CommonHander.ValidatorModel();
}

ListForm.prototype.dialog=function(){
    list.options.Els.modelEl.on('hide.bs.modal',function(){
        $(this).find("input,textarea").val("");
        var select= $(this).find("select");
        if(select.length!=0) {
            select.val("-1");
            select.selectpicker('refresh');
        }
        list.options.Els.validEl.data('bootstrapValidator').resetForm();
    });
}

ListForm.prototype.select=function(){
    var options=list.options.select;
    var fnSucess = function (data) {
        $("#"+options.elId).empty();
        $("#"+options.elId).append("<option value='" + -1 + "'>----请选择----</option>");
        $.each(data.MainData, function (i, n) {
            var node = "<option value='" + n[options.val] + "'>" + n[options.text] + "</option>";
            $("#"+options.elId).append(node);
        });
        $("#"+options.elId).selectpicker('refresh').on('changed.bs.select', function (e) {
            var val= e.target.value;
            if(val==-1)
            {
                $("#"+options.elId+"_validator").val("");
                list.options.Els.validEl.data('bootstrapValidator').updateStatus(options.elId, 'NOT_VALIDATED').validateField(options.elId);
            }else {
                var text = $(e.target).find("option:selected").text();
                $("#"+options.elId+"_validator").val(text);
                list.options.Els.validEl.data('bootstrapValidator').updateStatus(options.elId, 'NOT_VALIDATED').validateField(options.elId);
            }
        });
    }
    $.fn.ajaxHandler({ url: options.url }).done(fnSucess);
}

ListForm.prototype.upload=function(disable){
    disable=typeof(disable)=="undefined"?true:disable;
    //Dropzone的初始化
    var dzoptions= {
        //指定上传图片的路径
        url: list.options.ajax.uploadFileUrl,
        //添加上传取消和删除预览图片的链接，默认不添加
        addRemoveLinks: disable,
        clickable: disable,
        //关闭自动上传功能，默认会true会自动上传
        //也就是添加一张图片向服务器发送一次请求
        autoProcessQueue: true,
        //允许上传多个照片
        uploadMultiple: true,
        //每次上传的最多文件数，经测试默认为2，坑啊
        //记得修改web.config 限制上传文件大小的节
        parallelUploads: 5,
        dictResponseError: '文件上传失败!',
        dictRemoveFile:"删除",
        dictCancelUpload:"取消上传",
        dictCancelUploadConfirmation:"你确定想要取消这个上传？",
        layer:true,
        success: function(file, data,e,i) {
            var item = data.fileState[i];
            if (item.upload_State) {
                var newitem = {AttachName: item.file_Name, AttachPath: item.file_Path,AttachSize:file.size+";"+file.type};
                list.uploadFilesObj=list.uploadFilesObj?list.uploadFilesObj:[];
                list.uploadFilesObj.push(newitem);
                $(file.previewElement).find(".dz-download").attr("href",item.file_Path);
                $(file.previewElement).data("file_Path", item.file_Path);
            }
        },
        removedfile: function(file) {
            //删除服务器的文件
            //var form=this.options.form;
            var filepath=$(file.previewElement).data("file_Path");
            var fileid=$(file.previewElement).data("file_ID");
            var deleteUrl=list.options.ajax.deleteFileUrl;
            if(typeof(filepath)!="undefined") {
                var deleteSucess = function (data) {
                    var index=$(file.previewElement).index()-2;
                    list.uploadFilesObj.splice(index, 1);
                    file.previewElement.remove();
                    $.fn.xLayer().msg("删除成功");
                }
                $.fn.ajaxHandler({url: deleteUrl, data: {file_Path: filepath,AttachGuid:fileid}}).done(deleteSucess);

            }else
            {
                file.previewElement.remove();
            }
        },
        init: function () {
            var mydropzone=this;
            $.each(list.uploadFilesObj,function(n,item){
                var arrySize=item.AttachSize?item.AttachSize.split(";"):[0,"未知"];
                var file={id:item.AttachGuid,name:item.AttachName,size:arrySize[0],status:"success",type:arrySize[1],url:item.AttachPath,showfirst:true};
                mydropzone.files.push(file);
                mydropzone.emit("addedfile", file);
            });

        }
    };

    list.DropzoneObj=new Dropzone("#my-dropzone",dzoptions);
}

ListForm.prototype.CommonHander={
    getformparam:function(){
        return list.getformparam();
    },
    DropzoneClear:function()
    {
        if(list.DropzoneObj)
        {
            $(list.DropzoneObj.previewsContainer).find(".dz-preview").remove();
            list.DropzoneObj.files=[];
            list.DropzoneObj.destroy();
            list.DropzoneObj.emit("reset");
        }
    },
    ValidatorModel:function(){
        var SubmitHander=function(){
            list.options.Els.validEl.bootstrapValidator('validate');
            var isValid=list.options.Els.validEl.data("bootstrapValidator").isValid();
            return isValid;
        }
        list.options.Els.validEl.xValidator({fields:list.options.validfields,issubmit:false});
        list.options.Els.validSaveEl.on("click",function(){
            var isValid=SubmitHander();
            if(isValid) {
              list.options.saveSuccess();
            }
        });
    }
}



