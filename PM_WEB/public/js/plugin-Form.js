/*----------------------------------------
* Copyright (c) 2017 菠萝工作室
* 网站：http://www.0non0.com
* Date: 2017-5-18
* Creater:Cqy
----------------------------------------*/

/*------通用的Form控件库 by:cqy 2017-11-23-----*/
/*------集中处理Form------*/
var FormApply=function(settings){
    var defaultSettings = {
        action:{
            add:"/ProjectSPProgress/Apply_Add",
            approval:"/ProjectSPProgress/Apply_SP",
            edit:"/ProjectSPProgress/Apply_Add",
            back:"/ProjectSPProgress/Apply_SP_Back"
        },
        ajax:{
            GetModelUrl:"/Project/GetModelByID",
            uploadFileUrl:"/UpLoad/UpLoadBiddingPlanApplyFile",
            deleteFileUrl:"/Attach/DelAttachFile"
        },
        //form验证的配置
        formfieldsMove:[],
        formfields:{
            ProjectName: {
                validators: {
                    notEmpty: {message: '项目名称不能为空'}
                }
            },
            ProjectNum: {
                validators: {
                    notEmpty: {message: '项目编号不能为空'}
                }
            },
            ProjectProvinceName: {
                validators: {
                    notEmpty: {message: '请选择项目省份'}
                }
            },
            ProjectCityName:{
                validators: {
                    notEmpty: {message: '请选择项目所属城市'}
                }
            },
            ProjectAddress: {
                validators: {
                    notEmpty: {message: '详细地址不能为空'}
                }
            },
            PartACompanyName: {
                validators: {
                    notEmpty: {message: '甲方公司名称不能为空'}
                }
            },
            PartACompanyContactTele: {
                validators: {
                    notEmpty: {message: '甲方联系方式不能为空'},
                    digits: {message: '请输入数字'}
                }
            },
            PartACompanyContactName: {
                validators: {
                    notEmpty: {message: '甲方联系人姓名不能为空'}
                }
            },
            ProjectHeaderName: {
                validators: {
                    notEmpty: {message: '项目负责人不能为空'}
                }
            },
            ProjectHeaderTele: {
                validators: {
                    notEmpty: {message: '项目负责人联系方式不能为空'},
                    digits: {message: '请输入数字'}
                }
            },
            PartAPayInfo: {
                validators: {
                    notEmpty: {message: '甲方付款情况不能为空'}
                }
            },
            BudgetAmount: {
                validators: {
                    notEmpty: {message: '预算金额不能为空'},
                    digits: {message: '请输入数字'}
                }
            },
            BudgetTax: {
                validators: {
                    notEmpty: {message: '预算税不能为空'}
                }
            },
            BudgetCost: {
                validators: {
                    notEmpty: {message: '预算成本金额不能为空'},
                    digits: {message: '请输入数字'}
                }
            },
            TenderMoney: {
                validators: {
                    notEmpty: {message: '投标金额不能为空'},
                    digits: {message: '请输入数字'}
                }
            },
            TenderPerson: {
                validators: {
                    notEmpty: {message: '投标人不能为空'}
                }
            },
            TenderTime: {
                validators: {
                    notEmpty: {message: '投标时间不能为空'}
                }
            }
        },
        //弹出框验证的配置
        modelfields:{
            ProgressAdvice:{
                validators: {notEmpty: {message: '审核意见不能为空'}}
            },
            RoleUserValidator: {
                validators: {notEmpty: {message: '审核人员不能为空'}}
            }
        },
        backfields:{
            ProgressAdvice:{
                validators: {notEmpty: {message: '审核意见不能为空'}}
            }
        },
        disableArry:[],
        dateEl:$('#txt-TenderTime'),
        customCallback:function(){

        }

    }
    window.form=this;
    this.options = $.extend(true, defaultSettings, settings);
    //获取页面参数传递的类型
    this.type=$.fn.getUrlParam("type");
    this.ProjectGuid=$.fn.getUrlParam("id");
    $("#hidden_ProjectGuid").val(this.ProjectGuid);
    $("#container").addClass("mainnav-sm");
    this.uploadFilesObj=[];
    this.Dropzone=null;
    //判断页面类型
    if(this.type=="approval")this.approval();
    else if(this.type=="edit")this.edit();
    else if(this.type=="view")this.view();
    else this.add();
    //重新获取验证配置
    $.each(this.options.formfieldsMove,function(n,item){
        delete form.options.formfields[item];
    });
}

//<!-- 表单初始化 -->
FormApply.prototype.init=function(){
    this.select();
    this.validator();
    this.datepicker();
    this.mask();
    this.options.customCallback();
}

//页面新增处理
FormApply.prototype.add=function(){
    this.upload();
    $("#config-form").attr("action",this.options.action.add);
    $("#config-form").addClass("edit");
    $("#AdviceDiv").remove();
    $("#form-back").remove();
    $("#btn-area").show();
    var isSpan = $("#txt-BudgetTax").parent().next().next().html().indexOf('span');
    if (isSpan > 0) {
        $("#lab_TenderMoney").remove();
        $("#span_TenderMoney").remove();
        $("#txt-BudgetTax").parent().attr("colspan", 5);
    }
}

//页面查看处理
FormApply.prototype.view=function(){
    $("#config-form").addClass("view");
    $("#form-save").remove();
    $("#form-submit").remove();
    $("#form-back").remove();
    $("#formTitle").html("项目信息");
    $("#hidden_Txt").show();
    this.CommonHander.LoadViewFormData(this);
}
//页面审批处理
FormApply.prototype.approval=function(){
    $("#config-form").attr("action",this.options.action.approval);
    $("#config-form").addClass("view");
    $("#form-save").remove();
    this.CommonHander.LoadViewFormData();
    $("#btn-area").show();
    var isSpan = $("#txt-BudgetTax").parent().next().next().html().indexOf('span');
    if (isSpan > 0) {
        $("#lab_TenderMoney").remove();
        $("#span_TenderMoney").remove();
        $("#txt-BudgetTax").parent().attr("colspan", 5);
    }
}
//页面修改处理
FormApply.prototype.edit=function(){
    $("#config-form").attr("action",this.options.action.edit);
    $("#config-form").addClass("edit");
    $("#AdviceDiv").remove();
    $("#form-back").remove();
    this.CommonHander.LoadEditFormData();
    $("#btn-area").show();
    var isSpan = $("#txt-BudgetTax").parent().next().next().html().indexOf('span');
    if (isSpan > 0) {
        $("#lab_TenderMoney").remove();
        $("#span_TenderMoney").remove();
        $("#txt-BudgetTax").parent().attr("colspan", 5);
    }
}


//<!-- 表单验证 -->
FormApply.prototype.validator=function(){
    this.CommonHander.ValidatorForm();
    this.CommonHander.ValidatorModel();
}

//<!-- 表单的时间控件 -->
FormApply.prototype.datepicker=function(){
   form.options.dateEl.xdatepicker({format: "yyyy-mm-dd",validator:true});
}

//<!-- 表单的上传附件 -->
FormApply.prototype.upload=function(disable){
    disable=typeof(disable)=="undefined"?true:disable;
    //Dropzone的初始化
    var dzoptions= {
        //指定上传图片的路径
        url: form.options.ajax.uploadFileUrl,
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
                form.uploadFilesObj=form.uploadFilesObj?form.uploadFilesObj:[];
                form.uploadFilesObj.push(newitem);
                $(file.previewElement).find(".dz-download").attr("href",item.file_Path);
                $(file.previewElement).data("file_Path", item.file_Path);
            }
        },
        removedfile: function(file) {
            //删除服务器的文件
            //var form=this.options.form;
            var filepath=$(file.previewElement).data("file_Path");
            var fileid=$(file.previewElement).data("file_ID");
            var deleteUrl=form.options.ajax.deleteFileUrl;
            if(typeof(filepath)!="undefined") {
                var deleteSucess = function (data) {
                    var index=$(file.previewElement).index()-2;
                    form.uploadFilesObj.splice(index, 1);
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
            var dropzone=this;
            $.each(form.uploadFilesObj,function(n,item){
                var arrySize=item.AttachSize?item.AttachSize.split(";"):[0,"未知"];
                var file={id:item.AttachGuid,name:item.AttachName,size:arrySize[0],status:"success",type:arrySize[1],url:item.AttachPath,showfirst:true};
                dropzone.files.push(file);
                dropzone.emit("addedfile", file);
            });

        }
    };

    form.Dropzone=new Dropzone("#my-dropzone",dzoptions);
}

//<!-- 表单的下拉选择 -->
FormApply.prototype.select=function(){
    //表单的行政区下拉选择联动
    $.fn.areaSelect();
    //审核人员下来
    this.CommonHander.selectRoleUser();
}

//<!-- 表单的格式输入处理 -->
FormApply.prototype.mask=function(){
    $("#demo-msk-date").mask('9999-99-99');
}

//<!-- 选择框处理 -->
FormApply.prototype.chosen=function(){
    var fnSucess = function (data) {
        $("#ProjectGuidSelect").empty();
        if(form.ProjectGuid) {
            var node = "<option selected='selected'  value='" + form.ProjectGuid + "'>" + $("#hidden_ProjectName").val() + "</option>";
            $("#ProjectGuidSelect").append(node);
        }else
        {
            $("#ProjectGuidSelect").append("<option selected='selected' value='-1'>----请选择----</option>");
        }
        $.each(data.MainData, function (i, n) {
            var node = "<option value='" + n.ProjectGuid + "'>" + n.ProjectName + "</option>";
            $("#ProjectGuidSelect").append(node);
        });
        $('#ProjectGuidSelect').chosen({
            //allow_single_deselect:true,
            //show_text_single:$("#hidden_ProjectName").val(),
            no_results_text:"没有匹配的结果",
            search_contains:true,
            width:'100%'
        }).on('change', function(e,res){
            res.chosen.selected_item.text(res.text);
            if(res.selected!="-1")
            {
                form.CommonHander.LoadNewFormData(res.selected);
                $("#hidden_ProjectGuidSelect").val(res.selected);
                $("#hidden_ProjectName").val(res.text);
            }else
            {
                $("#hidden_ProjectGuidSelect").val("");
                $("#hidden_ProjectName").val("");
                form.CommonHander.LoadNewFormData("");
                $.fn.areaSelect().setSelect("", "", "");
            }
            $("#config-form").data('bootstrapValidator').updateStatus("ProjectName", 'NOT_VALIDATED').validateField("ProjectName");
        }).on('chosen:no_results',function(e,res){
        }).on('chosen:hiding_dropdown',function(e,res){
            var searchText=res.chosen.search_container.find("input").val();
            if(searchText!="") {
                $("#hidden_ProjectName").val(searchText);
                res.chosen.selected_item.text(searchText);
            }
            $("#config-form").data('bootstrapValidator').updateStatus("ProjectName", 'NOT_VALIDATED').validateField("ProjectName");

        });

    }
    $.fn.ajaxHandler({url: '/ProjectSPState/GetProjectSPStateByOperateTypeAndSPState', data: { ProjectName:""} }).done(fnSucess);
}

//<!-- 表单的处理方法汇总 -->
FormApply.prototype.CommonHander={
    //审核人员下拉框加载
    selectRoleUser:function(){
        var fnSucess = function (data) {
            var msg=data.Message;
            //判断流程是否结束或者没有流程
            if(msg=="-1"||msg=="-2")
            {
                var tip=msg=="-1"?"未找到流程不能提交该申请单！":"您没有权限提交该申请单！";
                var id=$("#hidden_ProjectGuid").val();
                if(id=="")
                {
                    $.fn.xLayer().msg(tip);
                    $("#form-save").remove();
                    $("#form-submit").remove();
                    $("#my-dropzone").remove();
                    return;
                }
                $("#RoleUserValidatorDiv").remove();
                $("#hidden_NextItemCode").val(-1);
                return;
            }
            $("#RoleUser").empty();
            $("#RoleUser").append("<option value='" + -1 + "'>----请选择----</option>");
            $.each(data.MainData, function (i, n) {
                var node = "<option value='" + n.RoleGuid + "' username-data='"+ n.PMUserNum +"'>" + n.PMUserNickName + "</option>";
                $("#RoleUser").append(node);
            });
            $("#RoleUser").selectpicker('refresh').on('changed.bs.select', function (e) {
                var val= e.target.value;
                if(val==-1)
                {
                    $("#hidden_RoleUserValidator").val("");
                    $("#form-verify").data('bootstrapValidator').updateStatus("RoleUserValidator", 'NOT_VALIDATED').validateField("RoleUserValidator");
                }else {
                    var text = $(e.target).find("option:selected").attr("username-data");
                    $("#hidden_RoleUserValidator").val(text);
                    $("#form-verify").data('bootstrapValidator').updateStatus("RoleUserValidator", 'NOT_VALIDATED').validateField("RoleUserValidator");
                    $("#hidden_ReceiveRoleGuid").val(val);
                    $("#hidden_ReceiveUserNum").val(text);
                }

            });
        }
        var txtOperateType=$("#hidden_OperateType").val();
        $.fn.ajaxHandler({async: false, url: '/SystemSetting/GetUserBySystemSettingUserRole', data:{ProjectGuid:form.ProjectGuid,OperateType:txtOperateType} }).done(fnSucess);
    },
    DropzoneClear:function()
    {
        if(form.Dropzone)
        {
            $(form.Dropzone.previewsContainer).find(".dz-preview").remove();
            form.Dropzone.files=[];
            form.Dropzone.destroy();
            form.Dropzone.emit("reset");
        }
    },
    LoadNewFormData:function(id){
        form.CommonHander.DropzoneClear();
        form.CommonHander.ClearValidatorForm();
        form.uploadFilesObj=null;
        if(id) {
            var onSucess = function (data) {
                var detail = data.MainData;
                $("#hidden_ProjectGuid").val(detail.ProjectGuid);
                form.uploadFilesObj = data.HashData.PmAttachOperates;
                var editValEls=$("#config-form table").find("input[name],textarea[name]");
                if(id==form.ProjectGuid)
                {
                    $.fn.areaSelect().disbaleSelect(false);
                    $.fn.areaSelect().setSelect(detail.ProjectProvinceName, detail.ProjectCityName, detail.ProjectAreaName);
                    editValEls.each(function () {
                        var editEl = $(this);
                        var name = editEl.attr("name");
                        var text = detail[name];
                        editEl.attr("readonly",false);
                        editEl.val(text);
                    });
                }else
                {
                    $.fn.areaSelect().disbaleSelect(true);
                    $.fn.areaSelect().setSelect(detail.ProjectProvinceName, detail.ProjectCityName, detail.ProjectAreaName);
                    editValEls.each(function () {
                        var editEl = $(this);
                        var name = editEl.attr("name");
                        var index = $.inArray(name, form.options.disableArry);
                        if (index == -1) editEl.attr("readonly", true);
                        var text = detail[name];
                        editEl.val(text);
                    });
                }
                form.upload(false);
            }
            $.fn.ajaxHandler({url: "/Project/GetModelByID", data: {"id": id}}).done(onSucess);
        }else
        {
            $("#hidden_ProjectGuid").val("");
            editValEls.each(function () {
                var editEl = $(this);
                editEl.val("");
                editEl.attr("readonly",false);
            });
            form.upload();
        }
    },
    LoadViewFormData:function(){
        var onSucess=function(data){
            var detail=data.MainData;
            form.uploadFilesObj=data.HashData.PmAttachOperates;
             $(".td-data[name!='show']").each(function(){
                var name=$(this).find("input,textarea,span").attr("name");
                var text=detail[name];
                $(this).empty();
                $(this).html(text);
            });
            form.upload(false);
        }
        $.fn.ajaxHandler({url: form.options.ajax.GetModelUrl,data: {"id":form.ProjectGuid}}).done(onSucess);
    },
    LoadEditFormData:function(){
        var onSucess=function(data){
            var detail=data.MainData;
            form.uploadFilesObj=data.HashData.PmAttachOperates;
            $.fn.areaSelect().setSelect(detail.ProjectProvinceName, detail.ProjectCityName, detail.ProjectAreaName);
            var editValEls=$("#config-form table").find("input[name],textarea[name]");
            editValEls.each(function(){
                var name=$(this).attr("name");
                var text=detail[name];
                $(this).val(text);
            });
            form.upload();
        }
        $.fn.ajaxHandler({url:form.options.ajax.GetModelUrl,data: {"id":form.ProjectGuid}}).done(onSucess);
    },
    ClearValidatorForm:function(){
        //$("#config-form").data('bootstrapValidator').destroy();
        //$('#config-form').data('bootstrapValidator', null);
        $("#config-form").data('bootstrapValidator').resetForm();
       //this.ValidatorForm();
    },
    destroyValidatorForm:function(){
        var va = $('#form-verify').data('bootstrapValidator');
        $("#txt_ProgressAdvice").val("");
        $("#RoleUser").val("-1");
        $("#RoleUser").selectpicker('refresh');
        $("#hidden_RoleUserValidator").val("");
        if(typeof (va)!="undefined") {
            $('#form-verify').data('bootstrapValidator').destroy();
            $('#form-verify').data('bootstrapValidator', null);
        }
    },
    //验证form
    ValidatorForm:function(){
        var SubmitHander=function(){
            $('#config-form').bootstrapValidator('validate');
            var isValid=$('#config-form').data("bootstrapValidator").isValid();
            if(isValid) {
                var jsonstr=form.uploadFilesObj?JSON.stringify(form.uploadFilesObj):null;
                $("#hidden_attachList").val(jsonstr);
                return true;
            }
            else {
                $(".form-group.has-error:eq(0) input").focus();
            }
        }
        $('#config-form').xValidator({fields:form.options.formfields,issubmit:false});
        var defaultaction=$("#config-form").attr("action");
        $("#form-save").click(function(){
            var isValid=SubmitHander();
            if(isValid){
                $("#config-form").attr("action", defaultaction);
                $("#hidden_ReceiveRoleGuid").val("");
                $("#hidden_ReceiveUserNum").val("");
                document.getElementById('config-form').submit();
            }
        });

        $("#form-submit").click(function(){
            form.CommonHander.destroyValidatorForm();
            $("#RoleUserValidatorDiv").show();
            $('#form-verify').xValidator({fields:form.options.modelfields,issubmit:false});
            $('#form-verify').data("action",defaultaction);
            if(form.type=="approval"){
                $('#config-modal').modal('show');
                return;
            }
            var isValid=SubmitHander();
            if(isValid){
                $('#config-modal').modal('show');
            }
        });

        $("#form-back").click(function(){
            form.CommonHander.destroyValidatorForm();
            $("#RoleUserValidatorDiv").hide();
            $('#form-verify').xValidator({fields:form.options.backfields,issubmit:false});
            $('#form-verify').data("action",form.options.action.back);
            $('#config-modal').modal('show');
        });

    },
    ValidatorModel:function(){
        var SubmitHander=function(){
            $('#form-verify').bootstrapValidator('validate');
            var isValid=$('#form-verify').data("bootstrapValidator").isValid();
            return isValid;
        }
        //提交审核
        $("#btn-submit").click(function(){
            var isValid = SubmitHander();
            if (isValid) {
                var action=$('#form-verify').data("action");
                $("#config-form").attr("action", action);
                var advice = $("#txt_ProgressAdvice").val();
                $("#hidden_ProgressAdvice").val(advice);
                document.getElementById('config-form').submit();
            }
        });

    }
}


