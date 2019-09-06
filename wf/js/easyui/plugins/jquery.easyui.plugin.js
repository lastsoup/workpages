/*(function ($) {
    $.easyui = $.easyui || {};
    $.easyui.helper = $.easyui.helper || {};
    $.extend($.easyui.helper, {
        transformTreeData: function (source, options) {
            var result = [];
            $.each(source, function (i, item) {
                transformSingleData(result, item);
            });

            function transformSingleData(container, data) {
                var resultData = {
                    id: data[options.valueField],
                    text: data[options.textField],
                    attributes: data,
                    children: []
                }

                container.push(resultData);
                $.each(data.children, function (i, item) {
                    transformSingleData(resultData.children, item);
                });
            }

            return result;
        },
        selectFromOptions: function (value, element, param) {
            if (!param) {
                return true;
            }

            var target = $(element);
            if (this.settings.onfocusout) {
                target.unbind(".validate-selectFromOptions").bind("blur.validate-selectFromOptions", function () {
                    $(element).valid();
                });
            }

            var commonCombobox = target.parent().prev();
            var data = commonCombobox.commonCombobox("getData");
            var opts = commonCombobox.commonCombobox("options");

            var isValid = true;
            if (!!value && opts.valueInOptions) {
                isValid = false;
                $.each(data, function (i, item) {
                    if (item[opts.valueField] == value) {
                        isValid = true;
                        return false;
                    }
                });
            }

            return isValid;
        },
        formatComplexTypeProperty: function (value, row, index, fieldName) {// 使easyui的datagrid支持复杂类型属性的递归查询 chenguoxiong 2015-07-31
            var fields = fieldName.split('.');
            var currentData = row;
            $.each(fields, function (i, field) {
                if (currentData) {
                    currentData = currentData[field];
                }
                else {
                    return false;
                }
            });

            return currentData || "";
        }
    });

    if ($.validator) {
        $.validator.addMethod("selectFromOptions", $.easyui.helper.selectFromOptions, "必须从选项中选择");
    }
})(jQuery);

(function ($) {
    $.deptAndUserSelector = function (deptControl, userControl, deptOptions, userOptions) {
        var deptCurrentOption = $.extend({}, $.fn.departmentSelector.defaults, deptOptions || {}, { multiple: false });
        var userCurrentOption = $.extend({}, $.fn.userSelector.defaults, userOptions || {}, { departmentID: "-1" });
        var onClick = deptCurrentOption.onClick;
        var onSelect = deptCurrentOption.onSelect;
        deptCurrentOption.onSelect = function (node) {
            var departmentID = node ? node.attributes.ID : "-1";
            users = GetUsersByDepartmentID(node.attributes.ID, userCurrentOption.includeChildDeptUsers);
            $(userControl).userSelector("setValue", "");
            $(userControl).userSelector("loadData", users);

            if ($.isFunction(onSelect)) {
                onSelect(node);
            }
        }

        $(userControl).userSelector(userCurrentOption);
        $(deptControl).departmentSelector(deptCurrentOption);
    }
})(jQuery);
(function($){
	$.fn.departmentSelector = function(options, param){
        if (typeof options == "string") {
            return $(this).commonCombotree(options, param);
        }

		var currentOptions = $.extend({}, $.fn.departmentSelector.defaults, options || {});
		var departments = generateDepartments(currentOptions);
		currentOptions.data = departments;
		$(this).commonCombotree(currentOptions);

        function generateDepartments(options){
	        var departments = [];
            if (currentOptions.canClear){
                departments.push({
                    id: "",
                    text: "未选择",
                    attributes: {
                        clear: true
                    }
                });
            }
	        for (var d in authResources.Departments){
		        var dept = authResources.Departments[d];
		        if (!dept.ParentDepartment){
			        departments.push(generateChild(dept, options));
		        }
	        }

	        function generateChild(dept, options){
		        var department = {
			        id: dept[options.valueField],
			        text: dept[options.textField],
			        attributes: dept,
			        children: []
		        }

		        for (var i = 0; i < dept.ChildDepartment.length; i++){
			        department.children.push(generateChild(authResources.Departments[dept.ChildDepartment[i]], options));
		        }

		        return department;
	        }

	        return departments;
        }
	};

	$.fn.departmentSelector.defaults = {
		textField: "Name",
		valueField: "ID",
        canClear: false
	}
})(jQuery);
(function ($) {
    $.fn.projectDepartmentSelector = function (options, param) {
        if (typeof options == "string") {
            if (options == "reload") {
                var url = $(this).data("hostUrl");
                if (typeof param == "object") {
                    for (var p in param) {
                        url = url.replace("{" + p + "}", param[p]);
                    }
                }
                var data = generateDepartments(url);
                return $(this).commonCombobox("loadData", data);
            }
            else {
                return $(this).commonCombobox(options, param);
            }
        }

        $(this).data("hostUrl", options.url);
        var currentOptions = $.extend({}, $.fn.projectDepartmentSelector.defaults, options || {});
        currentOptions.data = [];
        currentOptions.url = null;
        $(this).commonCombobox(currentOptions);

        function generateDepartments(url){
            var departments = [];
            if (url){
                $.ajax({
                    url: url,
                    method: "GET",
                    async: false,
                    success: function(data){
                        if (data && !data.State){
                            $.each(data.BizObject, function(i, d){
                                var dept = authResources.Departments[d[currentOptions.retrieveDataKey]];
                                departments.push($.extend({ DisplayName: dept["Name"] + "（" + GetTrueNameByUserName(dept.Supervisor) + "）" }, dept));
                            });
                        }
                    }
                });
            }

            return departments;
        }
    };

    $.fn.projectDepartmentSelector.defaults = {
        textField: "DisplayName",
        valueField: "ID",
        retrieveDataKey: "ID"
    }
})(jQuery);
(function($){
    $.fn.resourceSelector = function(options, param){
        if (typeof options == "string") {
            return $(this).commonCombobox(options, param);
        }

        var currentOptions = $.extend({}, $.fn.resourceSelector.defaults, options || {});
        if (!currentOptions.data){
            currentOptions.data = ironman3.resources.getResourcesByType(options.resourceType, options.parentID);
        }
        $(this).commonCombobox(currentOptions);
    };

    $.fn.resourceSelector.defaults = {
        textField: "Name",
        valueField: "ID"
    }

    $.fn.resourceTreeSelector = function(options, param){
        if (typeof options == "string") {
            if (options == "reload"){
                var opts = $(this).commonCombotree("options");
                var data = ironman3.resources.getAllResourcesByType(opts.resourceType, true);
                data = $.easyui.helper.transformTreeData(data, { valueField: opts.valueField, textField: opts.textField });
                $(this).commonCombotree("loadData", data);
                return $(this);
            }
            else {
                return $(this).commonCombotree(options, param);
            }
        }

        var currentOptions = $.extend({}, $.fn.resourceTreeSelector.defaults, options || {});
        if (!currentOptions.data){
            var treeData = ironman3.resources.getAllResourcesByType(options.resourceType);
            currentOptions.data = $.easyui.helper.transformTreeData(treeData, { valueField: currentOptions.valueField, textField: currentOptions.textField });
        }
        $(this).commonCombotree(currentOptions);
    }

    $.fn.resourceTreeSelector.defaults = {
        textField: "Name",
        valueField: "ID"
    }
})(jQuery);
(function ($) {
    $.fn.userSelector = function (options, param) {
        if (typeof options == "string") {
            return $(this).commonCombobox(options, param);
        }

        var currentOptions = $.extend({}, $.fn.userSelector.defaults, options || {});
        var users = [];
        if (currentOptions.departmentID){
            users = GetUsersByDepartmentID(currentOptions.departmentID, currentOptions.includeChildDeptUsers);
        }
        else {
            for (var u in authResources.Users){
                users.push(authResources.Users[u]);
            }
        }

        currentOptions.data = users;
        $(this).commonCombobox(currentOptions);
    };

    $.fn.userSelector.defaults = {
        textField: "TrueName",
        valueField: "UserName",
        departmentID: null,
        includeChildDeptUsers: true
    }
})(jQuery);
(function ($) {
    $.fn.commonCombobox = function (options, param) {
        if (typeof options == "string") {
            return $(this).combobox(options, param);
        }

        var currentOptions = $.extend({}, $.fn.commonCombobox.defaults, options || {});
        var oriName = $(this).attr("name");
        var combobox = $(this);
        var onSelect = currentOptions.onSelect;
        currentOptions.onSelect = function(record){
            if (!record){
                return;
            }

            if (record[currentOptions.valueField] && !!record[currentOptions.valueField]){
                if (combobox.closest("form").length > 0 && $.isFunction(combobox.closest("form").validate)){
                    var validator = combobox.closest("form").validate();
                    if (validator){
                        validator.element($("input[name=" + oriName + "]", combobox.parent()))
                    }
                }
            }

            if ($.isFunction(onSelect)){
                onSelect(record);
            }
        };
        currentOptions.loadFilter = currentOptions.loadFilter || function(data){
            if (data && data.State == 0){
                return data.BizObject;
            }
            else{
                return data;
            }
        };
        currentOptions.filter = currentOptions.filter || function(q, row) {
            if (!currentOptions.filterFields || !currentOptions.filterFields.length){
                return true;
            }

            var isFound = false;
            $.each(currentOptions.filterFields, function(i, f){
                if (row[f] && row[f].indexOf(q) >= 0){
                    isFound = true;
                    return false;
                }
            });

            return isFound;
        };
        $(this).combobox(currentOptions);
    };

    $.fn.commonCombobox.defaults = {
        multiple: false,
        editable: false,
        value: "",
        width: "100%",
        height: 38,
        panelHeight: "auto",
        panelMaxHeight: 250,
        valueField: "ID",
        textField: "Name",
        filterFields: ["Name"],
        comboCls: "zzp-shouqi-combo"
    }
})(jQuery);
(function ($) {
    $.fn.commonCombotree = function (options, param) {
        if (typeof options == "string") {
            return $(this).combotree(options, param);
        }

        var currentOptions = $.extend({}, $.fn.commonCombotree.defaults, options || {});
        var oriName = $(this).attr("name");
        var comtree = $(this);
        var onClick = currentOptions.onClick;
        currentOptions.onClick = function(node){
            if (!node){
                return;
            }

            if (node.id && !!node.id){
                if ($.isFunction(comtree.closest("form").validate)){
                    var validator = comtree.closest("form").validate();
                    if (validator){
                        validator.element($("input[name=" + oriName + "]", comtree.parent()))
                    }
                }
            }

            if ($.isFunction(onClick)){
                onClick(node);
            }
        };
        currentOptions.loadFilter = currentOptions.loadFilter || function(data, parent){
            if (data && data.State == 0){
                return data.BizObject;
            }
            else{
                return data;
            }
        };
        $(this).combotree(currentOptions);
    };

    $.fn.commonCombotree.defaults = {
        multiple: false,
        editable: false,
        value: "",
        width: "100%",
        height: 38,
        panelHeight: "auto",
        panelMaxHeight: 250,
        valueField: "ID",
        textField: "Name"
    }
})(jQuery);*/
(function($){
    $.fn.commonDatagrid = function (options, param) {
        var grid = $(this);
        if (typeof options == "string") {
            switch (options) {
                case "refreshButtons":
                    return refreshButtons(param);
                case "changeButtonEnable":
                    return changeButtonEnable(param);
                default:
                    return grid.datagrid(options, param);
            }
        }

        var currentOptions = $.extend({}, $.fn.commonDatagrid.defaults, options || {});
        if (!currentOptions.container){
            currentOptions.container = grid.parent();
        }
        if (currentOptions.width == "100%" || currentOptions.width == "auto"){
            currentOptions.autoWidth = true;
            var paddingLeft = parseFloat((currentOptions.container.css("padding-left") || "").replace("px", "")) || 0;
            var paddingRight = parseFloat((currentOptions.container.css("padding-right") || "").replace("px", "")) || 0;
            currentOptions.width = currentOptions.container.innerWidth() - paddingLeft - paddingRight;
        }
        if (currentOptions.height == "100%"){
            currentOptions.autoHeight = true;
            var paddingTop = parseFloat((currentOptions.container.css("padding-top") || "").replace("px", "")) || 0;
            var paddingBottom = parseFloat((currentOptions.container.css("padding-bottom") || "").replace("px", "")) || 0;
            currentOptions.height = currentOptions.container.innerHeight() - paddingTop - paddingBottom;
        }

        if (options.onLoadSuccess) {
            currentOptions.onLoadSuccess = function (data){
                options.onLoadSuccess(data);
                if (data.total && currentOptions.defaultSelectFirstRow){
                    $(this).commonDatagrid("selectRow", 0);
                }
            }
        }

        var title = currentOptions.title;
        if (currentOptions.isMasterPagination) {
            currentOptions.title = null;
        }
        grid.datagrid(currentOptions);
        //设置分页控建显示
        if (currentOptions.pagination){
            var pagerOptions = $.extend({}, $.fn.commonDatagrid.pagerDefault, currentOptions.pagerOptions, {
                pageSize: currentOptions.pageSize,
                isMasterPagination: currentOptions.isMasterPagination,
                buttons: generateButtons(currentOptions.pagerOptions ? currentOptions.pagerOptions.buttons : null),
                title: currentOptions.isMasterPagination ? title : null
            });
            grid.datagrid('getPager').pagination(pagerOptions);
            if (pagerOptions.search){
                grid.datagrid("getPager").find("#keyWord").focus();
            }
        }
        if (currentOptions.resizable && (currentOptions.autoWidth || currentOptions.autoHeight)){
            $(window).bind("resize", function (e) {
                var currentWidth = currentOptions.width;
                var currentHeight = currentOptions.height;

                if (currentOptions.autoWidth) {
                    paddingLeft = parseFloat((currentOptions.container.css("padding-left") || "").replace("px", "")) || 0;
                    paddingRight = parseFloat((currentOptions.container.css("padding-right") || "").replace("px", "")) || 0;
                    currentWidth = currentOptions.container.innerWidth() - paddingLeft - paddingRight;
                }
                if (currentOptions.autoHeight) {
                    paddingTop = parseFloat((currentOptions.container.css("padding-top") || "").replace("px", "")) || 0;
                    paddingBottom = parseFloat((currentOptions.container.css("padding-bottom") || "").replace("px", "")) || 0;
                    currentHeight = currentOptions.container.innerHeight() - paddingTop - paddingBottom;
                }

                grid.datagrid("resize", { 
                    width: currentWidth,
                    height: currentHeight
                });
            })
        }

        function refreshButtons(buttons){
            var bb = generateButtons(buttons);
            return grid.datagrid('getPager').pagination({ buttons: bb });
        }

        function generateButtons(buttons) {
            var buttonControls = null;
            if (buttons && buttons.length) {
                buttonControls = $("<div class=\"zzp-selState\"></div>");
                $.each(buttons, function (i, button) {
                    var btn = $("<input type=\"button\" class=\"b-btn\" value=\"" + button.text + "\" />").unbind().bind("click", function (e){
                        if (button.handler) {
                            button.handler.call(this);
                        }
                    }).attr("buttonKey", button.iconCls).appendTo(buttonControls);
                });
            }

            return buttonControls;
        }

        function changeButtonEnable(enableOptions) {
            var buttons = grid.datagrid("getPager").pagination("options").buttons;
            if (buttons) {
                $.each(buttons.find("input:button"), function(i, button) {
                    var buttonKey = $(button).attr("buttonKey");
                    if (buttonKey && typeof enableOptions[buttonKey] != 'undefined') {
                        if (enableOptions[buttonKey]) {
                            $(button).removeClass("b-disable").removeAttr("disabled");
                        }
                        else {
                            $(button).addClass("b-disable").attr("disabled", "disabled");
                        }
                    }
                });
            }

            return grid;
        }
    }

    $.fn.commonDatagrid.defaults = {
        loadFilter: function(data){
            var gridData = null;
            if (data){
                if (data.State == 0){
                    gridData = data.BizObject;
                    gridData.originalRows = gridData.rows;
                }
                else if (data.rows){
                    gridData = data;
                    gridData.originalRows = gridData.rows;
                }
                else if (typeof data.length == 'number' && typeof data.splice == 'function') {
                    gridData = { rows: data, originalRows: data, total: data.length };
                }
                else {
                    gridData = { total: 0, rows: [], originalRows: [] };
                }
            }
            else {
                gridData = { total: 0, rows: [], originalRows: [] };
            }

            gridData.originalRows = gridData.originalRows || [];
            gridData.rows = gridData.rows || [];
            gridData.footer = gridData.footer || [];

            var showRows = $.map(gridData.originalRows, function (n) {
                return n.operationState != ironman3.operationState.deleted ? n : null;
            });
            gridData.rows = showRows;
            gridData.total += gridData.rows.length - gridData.originalRows.length;

            return gridData;
        },
        isMasterPagination: true,
        pagination: true, //分页控件 
        idField: 'ID',
        singleSelect: true, //是否单选
        rownumbers: true,
        fitColumns: true, //列宽可以按数值比例自适应
        autoRowHeight: true,
        striped: false,
        nowrap: false,
        resizable: true,
        pageSize: 20,
        pageList: [10, 15, 20, 25, 30],
        pagePosition: "top",
        width: "100%",
        height: "100%",
        loadMsg: "数据加载中，请稍后...",
        defaultSelectFirstRow: true,
        onLoadSuccess: function (data) {
            var option = $(this).commonDatagrid("options");
            if (data.total && option.defaultSelectFirstRow) {
                $(this).commonDatagrid("selectRow", 0);
            }
        }
    }

    $.fn.commonDatagrid.pagerDefault = {
        beforePageText: "",
        afterPageText: "/{pages} 页",
        displayMsg: "",
        loading: true,
        pageList: [10, 15, 20, 25, 30],
        pageSize: 20,
        showPageList: false,
        showFirstButton: false,
        showLastButton: false,
        showRefresh: true,
        showJumpto: true,
        pagerClass: "zzp-page-title",
        showPage: true
    }
})(jQuery);
/*(function($){
    $.fn.commonTreegrid = function (options, param) {
        var treegrid = $(this);
        if (typeof options == "string") {
            return treegrid.treegrid(options, param);
        }

        var currentOptions = $.extend({}, $.fn.commonTreegrid.defaults, options || {});
        if (!currentOptions.container){
            currentOptions.container = treegrid.parent();
        }
        if (currentOptions.width == "100%"){
            currentOptions.autoWidth = true;
            currentOptions.width = currentOptions.container.width();
        }
        if (currentOptions.height == "100%"){
            currentOptions.autoHeight = true;
            currentOptions.height = currentOptions.container.height();
        }

        treegrid.treegrid(currentOptions);
        //设置分页控建显示
        if (currentOptions.pagination){
            treegrid.treegrid('getPager').pagination({
                beforePageText: '第', //页数文本框前显示的汉字  
                afterPageText: '页    共 {pages} 页',
                loading: true,
                displayMsg: '当前显示 {from} - {to} 条记录   共 {total} 条记录',
                pageList: [10, 15, 20, 25, 30],
                pageSize: 15
            });
        }
        if (currentOptions.resizable && (currentOptions.autoWidth || currentOptions.autoHeight)){
            $(window).bind("resize", function (e) {
                treegrid.treegrid("resize", { 
                    width: currentOptions.autoWidth ? currentOptions.container.width() : currentOptions.width,
                    height: currentOptions.autoHeight ? currentOptions.container.height() : currentOptions.height
                });
            })
        }
    }

    $.fn.commonTreegrid.defaults = {
        loadFilter: function(data, parentId){
            var gridData = null;
            if (data.State == 0){
                gridData = data.BizObject;
            }
            else {
                gridData = { total: 0, rows: [] };
            }

            return gridData;
        },
        pagination: false, //分页控件 
        idField: 'ID',
        singleSelect: true, //是否单选
        rownumbers: true,
        fitColumns: true, //列宽可以按数值比例自适应
        autoRowHeight: true,
        striped: false,
        nowrap: true,
        resizable: true,
        pageSize: 15,
        pageList: [10, 15, 20, 25, 30],
        width: "100%",
        height: "100%",
        loadMsg: "数据加载中，请稍后..."
    }
})(jQuery);
(function ($) {
    $.fn.moneybox = function (options, param) {
        if (typeof options == "string") {
            return $(this).numberbox(options, param);
        }

        var currentOptions = $.extend({}, $.fn.moneybox.defaults, options || {});
        $(this).numberbox(currentOptions);
    };

    $.fn.moneybox.defaults = {
        min: 0.01,
        max: 1000000000000000.00,
        precision: 2,
        groupSeparator: ','
    }
})(jQuery);


(function ($) {
    $.extend($.messager.defaults, {
        ok: "确定",
        cancel: "取消",
        title: '系统提示',
        msg: '暂无内容信息',
        showType: 'show',
        alertType:"success",
        timeout: 0,
        style: {
            right: '',
            bottom: ''
        }
    });

    $.alert = function (options) {
        var currentOptions = $.extend({}, $.messager.defaults, options || {});
        $.messager.alert(currentOptions.title, currentOptions.msg, currentOptions.alertType);
         hideRightIcon();
    };


    $.show = function(options) {
        var currentOptions = $.extend({}, $.messager.defaults, options || {});
        $.messager.show(
            {
                title: currentOptions.title,
                msg: currentOptions.msg,
                timeout: currentOptions.timeout,
                showType: currentOptions.showType,
                style: {
                    right: currentOptions.style.right,
                    bottom: currentOptions.style.bottom
                }
            }
        );
         hideRightIcon();
    };

     $.progress = function (options, param) {
        if (typeof options == "string") {
            return $.messager.progress(options);
        }

        var currentOptions = $.extend({}, $.fn.messager.defaults, options || {});
         $.messager.progress(
             {
                 title: currentOptions.title,
                 msg: currentOptions.msg
             }
         );
          hideRightIcon();
     };



    $.confirm = function (options,confirmEvent,cancleEvent) {
        var currentOptions = $.extend({}, $.messager.defaults, options || {});
        $.messager.confirm(currentOptions.title, currentOptions.msg, function(para) {
            if (para) {
                if (confirmEvent) {
                    confirmEvent();
                }
            } else {
                if (cancleEvent) {
                    cancleEvent();
                }
            }
        });
          hideRightIcon();
    };

    $.prompt = function (options,event) {
        var currentOptions = $.extend({}, $.messager.defaults, options || {});
        $.messager.prompt(currentOptions.title, currentOptions.msg, function(para) {
            if (para) {
                event();
            }
        });
         hideRightIcon();
    };
    

    function hideRightIcon() {
        $(".panel-tool-close").css("display", "none");
    }
})(jQuery);*/


//cqy 2014-04-30
/*通用方法实现*/
(function ($) {
    /*工程名称绑定方法*/
    $.fn.BindGridBox = function (settings) {
        var defaultSettings = {
         readonly:true,
         value:null,
         valueField: "ID",
         textField: "Name",
         url:null,
         sName:"Name",
         filterUrl:null,
         title:"选择工程",
         width:"500",
         height:"350",
         loadFilter:function (data) { return data.BizObject; },
         isServer:false,
         pagination:false,
         column:[[
                    { field: 'Name', title: '名称', width: 25, sortable: false}
                ]],
         loadDataAfterClick:false,
         dgContainer:null,
         dialogContainer:null,
         onSelect: null,
         onBeforeSelect:function(record){return true;},
         dbClickHandler:null
        }
        return gridbox.init(this, settings, defaultSettings);
    }

    var gridbox = {};
    gridbox.init = function (element, settings, defaultSettings) {
        $.extend(true, defaultSettings, settings);
        var options = defaultSettings;
        var newcombo = '<input type="text" name="show" readonly="readonly" />';
        element.after(newcombo);
        //添加弹出框元素
        var dialogContainer=options.dialogContainer;
        var dgContainer=options.dgContainer;
        if(dialogContainer==null){
            var projectform='<div id="projectDialog" style="display: none;"><form id="projectForm" action="" method="get">'+
                        '<div style="height: 25px; padding-left: 10px; line-height: 20px; padding-top: 5px;font-weight: bold;">'+
                        '<span style="float: right; display: block; padding-right: 15px;">'+
                         '<input type="text" name="NameValue" value="" style="height: 20px; border: solid 1px #B3AFAF;" />'+
                         '<input type="button" name="btnSearch" value="搜索" class="button01" style="padding: 0px 5px;"></span></div>'+
                         '<div id="dgProject"></div></form></div>';
           if($("#projectDialog").length==0)
           {
               $("body").append(projectform);
               dialogContainer=$("#projectForm");
           }
        }
         //列表设置
        if(dgContainer==null){
            dgContainer=$("#dgProject");
        }

        if(!options.loadDataAfterClick)
        {
            if(options.isServer){
               gridbox.LoadServerGridData(element,options,dialogContainer,dgContainer);
            }else{
               gridbox.LoadGridData(element,options,dialogContainer,dgContainer);
            }
        }else
        {
            
        }
    }

    gridbox.InitSetting=function(element,dialogContainer,dgContainer,options)
    {
        //弹出框设置
        dialogContainer.dialog({ width:options.width,modal: true,closed: true,
                title: options.title, buttons:[
                { 
                text: "确定",
                handler: function () {
                    var record=dgContainer.datagrid('getSelected');
                    if(record==null)
                    { 
                       $.messager.alert('提示',"没有选择工程！");
                       return;
                    }
                    element.attr("value",record[options.valueField]);
                    element.next().attr("value",record[options.textField]);
                    //验证
                    if (element.closest("form").length > 0 && $.isFunction(element.closest("form").validate)){
                        var validator = element.closest("form").validate();
                        var oriName=element.attr("name");
                        if (validator){
                            validator.element(element);
                        }
                     }
                    if(options.onSelect!=null){
                        if(options.onBeforeSelect(record)){
                           options.onSelect(record);
                        }
                     }
                        dialogContainer.dialog("close");
                   }
                },
                { 
                text: "取消",
                handler: function () {
                    dialogContainer.dialog("close");
                }
                }
                ]
         });
    }

    gridbox.EventSetting=function(element,dialogContainer,dgContainer,options,data,selectIndex)
    { 
        //点击
        element.next().click(function(){
            dialogContainer.dialog("open");
            dgContainer.datagrid('scrollTo',selectIndex);
        })
        //搜索
        dialogContainer.find("[name='btnSearch']").click(function(){
            var txtSearch = dialogContainer.find("[name='NameValue']").val();
            if(txtSearch=="")
            var newdata=data;
            else
            {
                var newdata=$.map(data, function(n){
                    return n[options.sName].indexOf(txtSearch)>-1?n:null;
                });
            }
            dgContainer.datagrid('loadData',newdata);
        });
   }

   gridbox.ServerEventSetting=function(element,options,dialogContainer,dgContainer){
        //点击
        element.next().click(function(){
            dialogContainer.dialog("open");
        })
         //搜索
        dialogContainer.find("[name='btnSearch']").click(function(){
            var txtSearch = dialogContainer.find("[name='NameValue']").val();
            dgContainer.datagrid('load',{"sname":options.sName,"svalue":txtSearch});
        });
    }

    gridbox.LoadServerGridData=function(element,options,dialogContainer,dgContainer){
       //获取数据
         var events = {
            success: function (item) {
                //根据设置绑定选中值
                if(item!=null)
                {
                    element.attr("value",item[options.valueField]);
                    element.next().attr("value",item[options.textField]);
                }
                //绑定打开选择窗口
                if(!options.readonly)
                {  
                    gridbox.LoadServerGrid(dgContainer,options);
                    gridbox.InitSetting(element,dialogContainer,dgContainer,options);
                    gridbox.ServerEventSetting(element,options,dialogContainer,dgContainer);
                }
            },
            failed: function (result) {
                alert(result.state + result.error);
            }
        };
        var ajaxoption = {
            ajaxSetting: { url:options.filterUrl}
        };
        $.getFromServer(ajaxoption, events);
    }

    gridbox.LoadGridData=function(element,options,dialogContainer,dgContainer){
         //获取数据
         var events = {
            success: function (data) {
                //根据设置绑定选中值
                var selectIndex=null;
                $.each(data, function (n, item) {
                 if (item[options.valueField] == options.value) {
                     selectIndex=n;
                     element.attr("value",item[options.valueField]);
                     element.next().attr("value",item[options.textField]);
                     return false;
                  }
                });
                //绑定打开选择窗口
                if(!options.readonly)
                {  
                    gridbox.LoadGrid(dgContainer,options,data,selectIndex);
                    gridbox.InitSetting(element,dialogContainer,dgContainer,options);
                    gridbox.EventSetting(element,dialogContainer,dgContainer,options,data,selectIndex);  
                }
            },
            failed: function (result) {
                alert(result.state + result.error);
            }
        };

        var ajaxoption = {
            ajaxSetting: { url:options.url }
        };
        $.getFromServer(ajaxoption, events);
    }

    gridbox.LoadGrid = function (dgContainer,options,data,selectIndex) {
           //初始化列表界面
           $(dgContainer).datagrid({
                width: "100%",
                height: options.height,
                pagination: false, //分页控件 
                idField: 'ID',
                singleSelect: true, //是否单选
                rownumbers: false,
                fitColumns: true, //列宽可以按数值比例自适应
                autoRowHeight: false,
                striped: false,
                nowrap: true,
                loadMsg: "数据加载中，请稍后...",
                columns:options.column,
                onDblClickRow: options.dbClickHandler
            });
            $(dgContainer).datagrid('loading');
            $(dgContainer).datagrid('loadData', data || []);
            $(dgContainer).datagrid('loaded');
            if(selectIndex!=null)
            {
                $(dgContainer).datagrid('selectRow',selectIndex);
            }
    }

    gridbox.LoadServerGrid=function (dgContainer,options)
    {
        //初始化列表分页
        var newUrl = typeof (options.url) == "function" ? options.url() : options.url;
        $(dgContainer).datagrid({
            url: newUrl,
            loadFilter: options.loadFilter,
            width: "100%",
            height:options.height,
            pageSize:2, //每页显示的记录条数，默认为10  
            pageList: [2, 5, 10, 15, 20, 25, 40], //可以设置每页记录条数的列表  
            pagination: options.pagination, //分页控件 
            idField: 'ID',
            singleSelect: true, //是否单选
            rownumbers: true,
            fitColumns: true, //列宽可以按数值比例自适应
            autoRowHeight: false,
            striped: false,
            nowrap: true,
            loadMsg: "数据加载中，请稍后...",
            columns: options.column,
            onDblClickRow: options.dbClickHandler
        });

        //设置分页控建显示
        $(dgContainer).datagrid('getPager').pagination({
            beforePageText: '第', //页数文本框前显示的汉字  
            afterPageText: '页    共 {pages} 页',
            loading:true,
            displayMsg: '当前显示 {from} - {to} 条记录   共 {total} 条记录'
        });

    }

})($);


//列表编辑方法
(function ($) {
    $.fn.datagridEdit = function (settings,mode) {
      var isView = mode=="View"? true:false;
      if(isView){
        //查看状态下
        var toolbaropt=[];
        var extendSettings = {
            toolbar:toolbaropt
        }
      }else{
        //新增
        var btnDgAdd = {
            iconCls: 'icon-add',
            text: "新增",
            handler: function (e) {
              editDetail=$($(e.currentTarget).parents(".datagrid-toolbar").next().children()[2]);
              addEditRow();
            }
        };
        //编辑
        var btnDgEdit = {
            iconCls: 'icon-edit',
            text: "编辑",
            handler: function (e) {
              editDetail=$($(e.currentTarget).parents(".datagrid-toolbar").next().children()[2]);
              EditRow();
            }
        };
        //删除
        var btnDgDelete = {
            iconCls:'icon-no',
            text: "删除",
            handler: function (e) {
               editDetail=$($(e.currentTarget).parents(".datagrid-toolbar").next().children()[2]);
               DeleteRow();
            }
        };
        var toolbaropt=[btnDgAdd,'-',btnDgEdit,'-',btnDgDelete];
        
        var extendSettings = {
            toolbar:toolbaropt,
            editInRow:true,
            onClickRow: onClickRow,
            onClickCell:onClickCell
        }
      }
      $.extend(true,extendSettings, settings);
      var options = extendSettings;
      $(this).data("editIndex","undefined");
      $(this).datagrid(options);
    }

    var editDetail="undefined";

    //cqy datagrid edit start

    //新增行
    function addEditRow(){
        var rowCount=editDetail.datagrid('getRows').length;
        editDetail.datagrid('scrollTo',rowCount-1);
        if(getEditIndex() == "undefined"){
            editDetail.datagrid('appendRow',{operationState:ironman3.operationState.added});
            beginEditing(editDetail.datagrid('getRows').length-1);

        }else{
            if (!editDetail.datagrid('validateRow',getEditIndex()))
            return;
            editDetail.datagrid('appendRow',{operationState:ironman3.operationState.added});
            beginEditing(editDetail.datagrid('getRows').length-1);
        }
        //设置第一列为焦点
        SetFirstEditCell();
    }

    //编辑行
    function EditRow(){
       var row = editDetail.datagrid('getSelected');
       if(row==null)
       return;
       var index = editDetail.datagrid('getRowIndex',row);
       beginEditing(index);
    }

    //删除行
    function DeleteRow(){
       var row = editDetail.datagrid('getSelected');
       if(row==null)
       return;
       var index = editDetail.datagrid('getRowIndex',row);
       if(index==getEditIndex())
       {   
          editDetail.datagrid('getPanel').find("input").blur();
          setEditIndex("undefined");
       }
        //设置原始数据删除状态
        var data=editDetail.datagrid('getData');
        if(data.rows[index].operationState!= ironman3.operationState.added){
            data.rows[index].operationState=ironman3.operationState.deleted;
            data.originalRows.operationState=ironman3.operationState.deleted;
        }
        editDetail.datagrid('deleteRow',index);
    }

    //保存改变
    function SaveEdit(){
          var data=editDetail.datagrid('getData');
          //保存新增和修改的数据
          var originalRows=data.originalRows||{};
          var deleteRows = $.map(originalRows, function (n) {
              return n.operationState == ironman3.operationState.deleted ? n : null;
          });

          var newrows=data.rows.concat(deleteRows);
          data.originalRows=newrows;
          editDetail.datagrid('loadData', data);
    }


    //保存编辑行号
    function setEditIndex(index){
      editDetail.data("editIndex",index);
    }

    //获取编辑行号
    function getEditIndex(){
       return editDetail.data("editIndex");
    }

     //结束编辑
    function endEditing(){
        if (editDetail.datagrid('validateRow',getEditIndex())){
            editDetail.datagrid('endEdit', getEditIndex());
            setEditIndex("undefined");
            return true;
        } else {
            return false;
        }
    }

    //开始编辑
    function beginEditing(index){
        if (getEditIndex() != index||getEditIndex()=="undefined"){
            if (endEditing()){
                editDetail.datagrid('selectRow', index);
                //设置原始数据编辑状态
                var data=editDetail.datagrid('getData');
                if(data.rows[index].operationState!= ironman3.operationState.added){
                   data.rows[index].operationState=ironman3.operationState.modified;
                }
                editDetail.datagrid('beginEdit', index);
                setEditIndex(index);
                if(editDetail.datagrid("options").onEditSuccess){
                   editDetail.datagrid("options").onEditSuccess(editDetail,getEditIndex(),data.rows[index]);
                }
                return true;
            }else {
                editDetail.datagrid('selectRow',getEditIndex());
                return false;
            }         
        }
    }

    //单击单元格
    function onClickCell(rowIndex, field, value){
        beginEditing(rowIndex);
        var editor=editDetail.datagrid('getEditor', {index:getEditIndex(),field:field});
        if(editor!=null)
        {
          setFocus(editor.target[0]);
        }
    }

    //单击行
    function onClickRow(index){
       if (!editDetail.datagrid('validateRow',getEditIndex())){
          editDetail.datagrid('selectRow', getEditIndex());
       }
    }

    //获取编辑单元格并设置焦点或者选中操作
    function SetEditCellFocus(fieldEditor){  
        if(fieldEditor.type=="selectbox"){
            fieldEditor.target.combobox("textbox").focus();
           
        }else if(fieldEditor.type=="selectboxtree"){
            fieldEditor.target.combotree("textbox").focus();
        }else{
            setFocus(fieldEditor.target[0]);
        }
    }

    //失去当前焦点
     function SetEditCellUnFocus(fieldEditor){  
        if(fieldEditor.type=="selectbox"){
            fieldEditor.target.combobox("hidePanel");
            fieldEditor.target.combobox("textbox").blur();

        }else if(fieldEditor.type=="selectboxtree"){
            fieldEditor.target.combotree("hidePanel");
            fieldEditor.target.combotree("textbox").blur();

        }else{
            fieldEditor.target.blur();
        }
    }

    //设置第一列为焦点
    function SetFirstEditCell(){
        //设置第一列为焦点
        var editors=$.grep(editDetail.datagrid('getEditors',getEditIndex()),function(object){
          return object.type!="changetext";
        });
        SetEditCellFocus(editors[0]);
    }

    //设置下一个焦点
    function SetNextEditCell(activeEl,index){
        //设置下一个焦点
        var editors=$.grep(editDetail.datagrid('getEditors',getEditIndex()),function(object){
          return object.type!="changetext";
        });
        var focusfield=$(activeEl).parents("td[field]").attr("field");
        var fieldIndex=-1;
        $.each(editors,function(i, n){
            if(n.field==focusfield){
                fieldIndex=i;
                return false;
            }
        });
        var nextfieldIndex=fieldIndex+1;
        if(nextfieldIndex==editors.length)
        { 
            if(typeof(index)!="undefined")
            MoveDown(index);
        }
        else{
            SetEditCellUnFocus(editors[fieldIndex]);
            SetEditCellFocus(editors[nextfieldIndex]); 
        }
    }

    //设置上一个焦点
    function SetPreEditCell(activeEl){
        //设置上一个焦点
        var editors=$.grep(editDetail.datagrid('getEditors',getEditIndex()),function(value){
          return value.type!="changetext";
        });
        var focusfield=$(activeEl).parents("td[field]").attr("field");
        var fieldIndex=-1;
        $.each(editors,function(i, n){
            if(n.field==focusfield){
                fieldIndex=i;
                return false;
            }
        });
        var prefieldIndex=fieldIndex-1;
        if(prefieldIndex!=-1){
           SetEditCellUnFocus(editors[fieldIndex]);
           SetEditCellFocus(editors[prefieldIndex]);
        }
    }


    //上移
    function MoveUp(index) {
        var newIndex= index-1;
        if(newIndex==-1)
        return;
        if(getEditIndex() == "undefined"){
           editDetail.datagrid('selectRow',newIndex);
           return;
        }
        if(beginEditing(newIndex)){
            //设置第一列为焦点
            SetFirstEditCell();
        }
    }

    //下移
    function MoveDown(index) {
        var rowscount=editDetail.datagrid('getRows').length;
        var newIndex= index+1;
        if(newIndex==rowscount)
        return;
        if(getEditIndex() == "undefined"){
           editDetail.datagrid('selectRow',newIndex);
           return;
        }
        if(beginEditing(newIndex)){
            //设置第一列为焦点
            SetFirstEditCell();
        }
    }

    //左移
    function MoveLeft(){
        var activeEl=document.activeElement;
        //判断获取焦点的input
        if(activeEl.tagName== "undefined"||activeEl.tagName.toLowerCase()!="input")
        return;
        //设置上一个焦点
        SetPreEditCell(activeEl);
    }

    //右移
    function MoveRight(){
        var activeEl=document.activeElement;
        //判断获取焦点的input
        if(activeEl.tagName== "undefined"||activeEl.tagName.toLowerCase()!="input")
        return;
        //设置下一个焦点
        SetNextEditCell(activeEl);
    }

    //Enter编辑并转移焦点
    function EnterEditing(index){
        var activeEl=document.activeElement;
        //判断获取焦点的input
        if(getEditIndex() == "undefined"||activeEl.tagName== "undefined"||activeEl.tagName.toLowerCase()!="input")
        {
            beginEditing(index);
            //设置第一列为焦点
            SetFirstEditCell();
        }else{
            //设置下一个焦点
            SetNextEditCell(activeEl,index);
        }
    }

    //列表编辑事件绑定
    //列表失去焦点事件
    $(document).mousedown(function (e) { 
        $("a").not($(".datagrid-toolbar a")).unmask();
        var el = e.srcElement || e.target;
        if($(el).parents("div.datagrid-view").has(el).length>0||$(el).parents("div.datagrid-view").is(el))
        {
            editDetail=$($(el).parents("div.datagrid-view").children()[2]);
        }
        if(editDetail=="undefined")
        return;
        if(!editDetail.datagrid("options").editInRow)
        return;
        //列表正在编辑(焦点在列表里,有下拉选择或弹出框)
        //编辑框内
        if(editDetail.datagrid('getPanel').find("div.datagrid-cell").is(el)||editDetail.datagrid('getPanel').find("div.datagrid-cell").has(el).length>0||$(editDetail.datagrid('getPanel').find("table.datagrid-btable")[1]).find("td").is(el))
        return;
        //下拉面板内
        var iscombobox=false;
        editDetail.datagrid('getPanel').find("input.combo-f").each(function (index, domEle) {
            var comboboxpanel=$(domEle).combobox("panel");
            if(comboboxpanel.is(el)||comboboxpanel.has(el).length>0)
            { 
              iscombobox=true;
              return false;
            }
        });
        if(iscombobox)
        return;

        if (getEditIndex() != "undefined"){
            if (!editDetail.datagrid('validateRow',getEditIndex())){
                $("a").not($(".datagrid-toolbar a")).mask();
                return false;
            }
            editDetail.datagrid('getPanel').find("input").blur();
            editDetail.datagrid('endEdit',getEditIndex());
            SaveEdit();
            editDetail.datagrid('selectRow',getEditIndex());
            setEditIndex("undefined");
        }
       
    });

    //列表键盘事件
    $(document).keydown(function (e) {
        if(editDetail=="undefined")
        return;
        if(!editDetail.datagrid("options").editInRow)
        return;
       //判断焦点是否在除列表以外的元素上(且焦点不在body上)
       var activeEl=document.activeElement;
       if(!editDetail.datagrid('getPanel').find("div.datagrid-cell").has(activeEl).length>0&&activeEl.tagName.toLowerCase()!="body")
       return;
       //正在选择下拉面板
       var iscombobox=false;
       if($(activeEl).hasClass("combo-text"))
       {
          if(!$(activeEl).parent().prev().combobox("panel").is(":hidden")){
             iscombobox=true;
          }
       }
       //列表键盘事件
       var row = editDetail.datagrid('getSelected');
       if(row==null)
       return;
       var index = editDetail.datagrid('getRowIndex',row); 

       //Enter编辑并转移焦点
       if(e.keyCode ==13){
          EnterEditing(index); 
          e.preventDefault();
          return false; 
       }

       //上移
       if (e.keyCode == 38&&!iscombobox) {
         //判断当前焦点是否是在selectbox中选择
         MoveUp(index);
         e.preventDefault();
         return false;
       }

       //下移
       if (e.keyCode == 40&&!iscombobox) {
          MoveDown(index);
          e.preventDefault();
          return false;
       }

       //左移
       if(e.ctrlKey&&e.keyCode == 37){
          MoveLeft();
          e.preventDefault();
          return false;
       }

        //右移
       if(e.ctrlKey&&e.keyCode == 39){
          MoveRight();
          e.preventDefault();
          return false;
       }

       //esc退出编辑
       if(e.keyCode ==27){
            if (getEditIndex() != "undefined"){
                if (!editDetail.datagrid('validateRow', getEditIndex())){
                     e.preventDefault();
                     return false;
                }
                editDetail.datagrid('getPanel').find("input").blur();
                editDetail.datagrid('endEdit', getEditIndex());
                editDetail.datagrid('selectRow',getEditIndex());
                setEditIndex("undefined");
           }
       }

       //Delete删除
       if(e.keyCode ==46){
          DeleteRow();
          e.preventDefault();
          return false;
       }

    });

    //自定义通用方法
    //验证数字
    function checknum(obj) {
        if (obj.value == "-")
            return;
        var re = /^-?\d+\.?\d*$/;
        var value = obj.value.substring(0, obj.value.length - 1);
        if (!re.test(obj.value)) {
            obj.value = value;
            obj.focus();
        } else {
            //限制01和-01输入
            var firstvalue = obj.value.substr(0, 1);
            var minus_firstvalue = obj.value.substr(0, 2);
            var isNum = /^\d+$/.test(obj.value.substr(1, 1));
            var minus_isNum = /^\d+$/.test(obj.value.substr(2, 1));
            if ((firstvalue == "0" && isNum) || (minus_firstvalue == "-0" && minus_isNum)) {
                obj.value = value;
                obj.focus();
            }
        }
    }

     //设置焦点选中且光标移到末尾
     function setFocus (sel) {
         length=$(sel).val().length;
         var start=length;
         var end=length;
          if (sel.setSelectionRange) {
             sel.focus();
             sel.setSelectionRange(start,end);
        }else if (sel.createTextRange) {
             var range = sel.createTextRange();
             range.collapse(true);
             range.moveEnd('character', end);
             range.moveStart('character', start);
             range.select();
         }
     }

    //自定义验证单元格
    //数字验证
    $.extend($.fn.datagrid.defaults.editors, {
        numberbox: {
            init: function(container, options){
                var input = $('<input type="text" class="datagrid-editable-input">').appendTo(container);
                //限制输入数字
                input.bind('input propertychange', function () {
                    checknum(this);
                    if(options.onTextChange){
                           options.onTextChange(editDetail,getEditIndex(),$(this).val());
                    }
                });
                input.validatebox(options);
                return input;
            },
            destroy: function(target){
                $(target).remove();
            },
            getValue: function(target){
                return $(target).val();
            },
            setValue: function(target, value){
                $(target).val(value);
            },
           resize: function(target, width){
                $(target)._outerWidth(width);
           }
      }
    });

     $.extend($.fn.datagrid.defaults.editors, {
        changetext: {
            init: function(container, options){
                var text = $('<div class="datagrid-cell datagrid-editable-changetext">').appendTo(container);
                return text;
            },
            destroy: function(target){
                $(target).remove();
            },
            getValue: function(target){
                return $(target).text();
            },
            setValue: function(target, value){
                $(target).text(value);
            },
           resize: function(target, width){
                $(target)._outerWidth(width);
           }
      }
    });

    //工作内容验证单元格
    $.extend($.fn.datagrid.defaults.editors, {
        selectbox: {
            init: function(container, options){
                var input = $('<input type="text">').appendTo(container);
                input.data("isValid",false);
                var queryable=typeof(options.queryable)=="undefined"?false:options.queryable;
                //var queryMessage=typeof(options.queryMessage)=="undefined"?"没有该下拉选项":options.queryMessage;
                var extendSettings={
                    editable:queryable,
                    validType:!queryable?null:'queryMessage',
                    queryable:false,
                    querybegin:function(){$(this).data("isValid",false);},
                    queryend:function(){
                         var isValid=$(this).data("isValid");
                         if(isValid)
                         $(this).combobox("disableValidation");
                         else
                         $(this).combobox("enableValidation");
                    },
                    filter:!queryable?null:function(q, row){  
                      var filterFields=typeof(options.filterFields)=="undefined"?null:options.filterFields;
                      if (!filterFields || !filterFields.length){
                          return true;
                      }

                      var isFound = false;
                      var isValid = false;
                      $.each(filterFields, function(i, f){
                          if(row[f]==q){
                            isValid=true;
                          }
                          if (row[f].indexOf(q) >= 0){
                              isFound = true;
                              return false;
                          }
                      });
                      if(isValid&&q!=""){
                        input.data("isValid",true);
                      }
                      return isFound;
                    },
                    loadFilter:function(data,parent){
                      if(data.BizObject)
                      data=data.BizObject;
                      return data;
                    },
                    onSelect: function (record) {
                        if(editDetail=="undefined")
                        return;
                        if(queryable){
                           input.combobox("disableValidation");
                        }

                        if(options.onItemSelect){
                           options.onItemSelect(editDetail,getEditIndex(),record);
                        }
                    }
                };
                $.extend(true,extendSettings,options);
                if(options.dataObject){
                      var arrydata=options.dataObject.data("data")||{};
                      $.extend(true,extendSettings,{data:arrydata});
                }
                input.combobox(extendSettings||{});
                return input;
            },
            destroy: function(target){ 
                $(target).combobox("destroy");
            },
            getValue: function(target){
                 return $(target).combobox("getText");
            },
            setValue: function(target, value){
                 var queryable=$(target).combobox("options").queryable;
                 if(queryable){
                    if(value!=""&&typeof(value)!="undefined")
                    $(target).combobox("disableValidation");
                 }

                 $(target).combobox("setValue",value);
            },
           resize: function(target, width){
                $(target).combobox("resize", width);
           }
      }
    });

       
    $.extend($.fn.datagrid.defaults.editors, {
        selectboxtree: {
            init: function(container, options){
                var input = $('<input type="text">').appendTo(container);
                var extendSettings={
                    editable:false,
                    onlyLeafSelect:true,
                    //panelHeight: 'auto',
                    loadFilter:function(data,parent){
                      if(data.BizObject)
                      data=data.BizObject;
                      return data;
                    },
                    onSelect: function (record) {
                        if(editDetail=="undefined")
                        return;
                        if(options.onItemSelect){
                           options.onItemSelect(editDetail,getEditIndex(),record);
                        }
                    }
                };
                $.extend(true,extendSettings,options);
                if(options.dataObject){
                      var arrydata=options.dataObject.data("data")||{};
                      $.extend(true,extendSettings,{data:arrydata});
                }
                input.combotree(extendSettings||{}); 
                return input;
            },
            destroy: function(target){ 
                $(target).combotree("destroy");
            },
            getValue: function(target){
                 return $(target).combotree("getText");
            },
            setValue: function(target, value){
                 $(target).combotree("setValue",value);
            },
           resize: function(target, width){
                $(target).combotree("resize", width);
           }
      }
    });

    //添加验证validType:'minLength[5]'
   /* $.extend($.fn.validatebox.defaults.rules, {
        queryMessage:{
            validator: function(value, param){
                return false;
            },
            message:"没有该下拉选项"
        },
        minLength: {
            validator: function(value, param){
                return value.length <= param[0];
            },
            message:"最小长度为{0}"
        },
        isNumber:{
            validator: function(value, param){
                return value.length >= param[0];
            },
            message:"请输入数字"
        }
    });*/

    //cqy datagrid edit end

})($);

// 下面的插件部分建议放在js文件中，　方便调用 
//-------------- 插件 begin ------------------ 
(function ($) { 
//屏蔽，适合单个元素. 
$.fn.mask = function () { 
    if($(this).parent().find(".divMask").length==0)
    {
        var divHtml = '<div class="divMask" style="z-index:1000;position: absolute; width:'+$(this).width()+'px; height:'+$(this).height()+'px; left: 0px; top: 0px; background: #fff; opacity: 0; filter: alpha(opacity=0)"> </div>'; 
        $(this).wrap('<span style="position: relative"></span>'); 
        $(this).parent().append(divHtml);
    }
} 
//取消屏蔽 
$.fn.unmask = function () { 
    if($(this).parent().find(".divMask").length>0)
    {
        $(this).parent().find(".divMask").remove(); 
        $(this).unwrap();
    }
} 

})(jQuery); 
//-------------- 插件 end ------------------ 
 

