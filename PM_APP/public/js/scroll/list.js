/*----------------------------------------
* Copyright (c) 2014 菠萝工作室
* 网站：http://www.0non0.com
* Date: 2014-11-28
* Creater:Cqy
----------------------------------------*/

/*------通用的方法库 by:cqy 2015-2-28------*/

(function () {
  /*  *//*------as()调用方法和属性-----------*//*
    *//*------使用as()调用方法，处理传递参数比较少的控件*//*
    window.as = function (q) {
        return new _ananas(q);
    };

    //_ananas对象
    var _ananas = function (q) {
        this.el=x$(q);
    };

    *//*---封装start-------*//*
    _ananas.prototype.InitIscroll= function (iscroll) {
        var wrapper=this.el[0];
        if(typeof(configure.scroll[iscroll])=="undefined")
            return;
        if (configure.scroll[iscroll] != null) {
            configure.scroll[iscroll].destroy();
            configure.scroll[iscroll] =  new iScroll(wrapper);
        } else{
            configure.scroll[iscroll] =  new iScroll(wrapper);
        }
    };

    _ananas.prototype.formatDateString=function(value,flag, showtime) {
        if(typeof (value)=="undefined")
        return "";
        value=value.replace(/-/g, '/').replace('T', ' ');
        var index=value.lastIndexOf('.')
        if (index > -1) {
            value = value.substring(0,index);
        }
        var mydate = new Date(value);
        if (!isNaN(mydate.getTime()))
            var newDate = as().formatDate(mydate, flag, showtime);
        return newDate;
    }

    _ananas.prototype.formatDate=function(mydate, flag, showtime) {
        var year = mydate.getFullYear();
        var month = (mydate.getMonth() + 1) < 10 ? ("0" + (mydate.getMonth() + 1)) : (mydate.getMonth() + 1);
        var day = mydate.getDate() < 10 ? ("0" + mydate.getDate()) : mydate.getDate();
        var time = "";
        if (typeof (showtime) != "undefined" && showtime == true) {
            var hours = mydate.getHours() < 10 ? "0" + mydate.getHours() : mydate.getHours();
            var minutes = mydate.getMinutes() < 10 ? "0" + mydate.getMinutes() : mydate.getMinutes();
            var seconds = mydate.getSeconds() < 10 ? "0" + mydate.getSeconds() : mydate.getSeconds();
            time = "  " + hours + ":" + minutes + ":" + seconds;
        }
        value = year + flag + month + flag + day+time;
        return value;

    }

    _ananas.prototype.showAlert= function (alertinfo, alertok, isSystem, title) {
        alertinfo = alertinfo == null ? "数据不存在" : alertinfo.toString();
        title = typeof (title) == "undefined" ? '提示' : title;
        if (typeof (isSystem) != "undefined" && isSystem) {
            if (isPhoneApp) {
                navigator.notification.alert(
                    alertinfo.toString(),  // 显示信息
                    null,// 警告被忽视的回调函数
                    title,// 标题
                    '确定'// 按钮名称
                );
            } else {
                alert(alertinfo);
            }
            return;
        }

        if (typeof (alertok) == "undefined") {
            setTimeout(function () { x$().closeDiv(); }, 1000);
        } else {
            setTimeout(function () { x$().closeDiv(); alertok(); }, 1000);
        }
        x$().showDiv("divAlert", { background: "rgba(0,0,0,0.5)" });
        x$("#divDialog").find("[name=alertText]").html(alertinfo);
    };

    _ananas.prototype.guidGenerator=function(){
        var S4 = function () {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        };
        return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
    };*/

    /*------ListScroll的实现-----------*/
    window.ListScroll=function(id,options) {
        this.el=x$(id);
        this.id=id;
        this.listName="listScroll";
        this.options=options;
        this.url=options.url;
        this.data=options.data;
        this.dataextend=typeof(options.dataextend)=="undefined"?"":options.dataextend;
        this.ajax=options.ajax;
        this.skin=options.skin;
        this.CreateDetail=options.CreateDetail;
        var pagecount=typeof (options.pageCount)=="undefined"?15:options.pageCount;
        this.pageCount=pagecount;
        this._init();
    }

    _ananas.prototype.iscroll={
        _iscroll_RefreshTip:function(tip){
            this.wrapper.find(".scroller").css({ "-webkit-transform": "translate(0px, 0px) scale(1) translateZ(0px)" });
            var pullDownEl = this.wrapper.find(".pullDown")[0];
            pullDownEl.setAttribute("name", '');
            pullDownEl.querySelector('.pullDownLabel').innerHTML = '下拉刷新';
            pullDownEl.childNodes[0].className = "pullDownIcon_xia";
            as().showAlert(tip);
        },
        _iscroll_MoreTip:function(tip){
            var pullUpEl = this.wrapper.find(".pullUp")[0];
            pullUpEl.setAttribute("name", '');
            pullUpEl.querySelector('.pullUpLabel').innerHTML = '上拉加载';
            pullUpEl.childNodes[0].className = "iconfont pullUpIcon_shang";
            as().showAlert(tip);
        },
        _iscroll_jsoncallback:function(rows,total){
            this.container.html('');
            //没有数据
            if (total == 0||rows.length==0) {
                x$( this.container[0].parentNode).find(".listmask").remove();
                x$( this.container[0].parentNode).bottom('<div class="listmask" style="height:' + (window.document.body.clientHeight - 47) + 'px"> <i class="iconfont icon-zanwushuju1"></i></div>');
            } else {
                x$( this.container[0].parentNode).find(".listmask").remove();
                this.lscroll._createListData(rows);
            }
            configure.scroll[this.lscroll.listName].refresh();
        },
        _iscroll_jsoncallbackMore:function(rows,total){
            if (total == 0||rows.length==0) {
                this.container.html('');
                x$( this.container[0].parentNode).find(".listmask").remove();
                x$( this.container[0].parentNode).bottom('<div class="listmask" style="height:' + (window.document.body.clientHeight - 47) + 'px"> <i class="iconfont icon-zanwushuju1"></i></div>');
            } else {
                x$( this.container[0].parentNode).find(".listmask").remove();
                //加载数据
                var childcount=this.container.find("li").length;
                var lastcount = childcount % this.lscroll.pageCount;
                if (childcount==total) {
                    as().showAlert("已经是最后一页");
                }else {
                    this.lscroll._createListData(rows);
                }
            }
            configure.scroll[this.lscroll.listName].refresh();
        },
        _getPage:function(){
            var pageCount = this.lscroll.pageCount;
            var count = this.container.find("li").length;
            var page = Math.floor(count / pageCount);
            return page;
        },
        _iscroll_pullDownAction:function(myScroll)
        {
            //刷新数据
            var owner=this;
            configure.scroll[owner.lscroll.listName] = myScroll
            var url=owner.lscroll.url;
            if(owner.lscroll.ajax) {
                $.ajax({
                    type : "post",
                    async:false,
                    url : url,
                    data: owner.lscroll.data,
                    success : function(data){
                        if(data.success) {
                            owner._iscroll_jsoncallback(data.obj.rows,data.obj.total);
                        }else
                        {
                            as().showAlert(data.msg);
                        }
                    },
                    timeout:function(){
                        owner._iscroll_RefreshTip("连接超时，请重试！");
                    },
                    error:function(){
                        owner._iscroll_RefreshTip("连接无法获取,请检查网络后重试！");
                    }
                });
            }else {
                //加载数据
                x$().xhrjsonp(url + "&page=1", { callback: function (data) {
                    data.State = 0;
                    if (data.State != 0) {
                        as().showAlert(data.Message);
                        return;
                    }
                    owner._iscroll_jsoncallback(data.BizObject.rows, data.BizObject.total);

                }, timeout: function () {
                    owner._iscroll_RefreshTip("连接超时，请重试！");
                }, error: function () {
                    owner._iscroll_RefreshTip("连接无法获取,请检查网络后重试！");
                }
                });
            }
        },
        _iscroll_pullUpAction:function(myScroll, wrapper,container)
        {
            //加载更多
            var owner=this;
            configure.scroll[owner.lscroll.listName] = myScroll
            var url=owner.lscroll.url;
            //加载数据
            {
                //地址处理
                var pageCount = owner.lscroll.pageCount;
                var count = owner.container.find("li").length;
                var page = Math.floor(count / pageCount) + 1;

            }
            if(owner.lscroll.ajax) {
                $.ajax({
                    type : "post",
                    async:false,
                    url : url,
                    data: {"PageRequestData":'{"Token":"123456789",'+owner.lscroll.dataextend+'Page:"'+(owner._getPage()+1)+'",Rows:"'+owner.lscroll.pageCount+'",IsValid:"1"}'},
                    success : function(data){
                        if(data.success)
                            owner._iscroll_jsoncallbackMore(data.obj.rows,data.obj.total);
                        else
                            as().showAlert(data.msg);
                    },
                    timeout:function(){
                        owner._iscroll_RefreshTip("连接超时，请重试！");
                    },
                    error:function(){
                        owner._iscroll_RefreshTip("连接无法获取,请检查网络后重试！");
                    }
                });
            }else {
                url = url + "&page=" + owner._getPage()+1;
                x$().xhrjsonp(url, { callback: function (data) {
                    if (data.State != 0) {
                        as().showAlert(data.Message);
                        return;
                    }
                    owner._iscroll_jsoncallbackMore(data.BizObject.rows, data.BizObject.total);
                }, timeout: function () {
                    owner._iscroll_MoreTip("连接超时，请重试！");
                }, error: function () {
                    owner._iscroll_MoreTip("连接无法获取,请检查网络后重试！");
                }
                });
            }
        },
        lscroll:null,
        wrapper:null,
        container:null,
        init:function(obj){
            this.lscroll=obj;
            var owner=this;
            x$("#" + obj.id + "_wrapper").iscroll({
                pullDownAction: function (myScroll, wrapper,container) {
                    owner.wrapper=wrapper;
                    owner.container=container;
                    owner._iscroll_pullDownAction(myScroll);
                },
                pullUpAction: function (myScroll, wrapper,container) {
                    owner.wrapper=wrapper;
                    owner.container=container;
                    owner._iscroll_pullUpAction(myScroll);
                }
            });
        }
    }

    ListScroll.prototype = {
        wrapper:null,
        container:null,
        _init: function () {
            var lscroll=this;
            x$("#" + this.id + "_wrapper").html("");
            x$("#" + this.id + "_wrapper").list({
                skin:lscroll.skin,
                beforePullAction: function (wrapper,container) {
                    lscroll.wrapper=wrapper;
                    lscroll.container=container;
                    lscroll._ibeforePullAction();
                }
            });
        },
        _ibeforePullAction:function()
        {
            var lscroll=this;
            if(this.ajax) {
                $.ajax({
                    type : "post",
                    async:false,
                    url : this.url,
                    data: this.data,
                    success : function(data){
                        if(data.success) {
                            lscroll._jsonpCallback(data.obj.rows,data.obj.total);
                        }else
                        {
                            as().showAlert(data.msg);
                        }
                    },
                    timeout:function(){
                        lscroll._itimeout();
                    },
                    error:function(){
                        lscroll._ierror();
                    }
                });
            }
            else
            {
                x$().xhrjsonp(this.url + "&page=1", { callback: function (data) {
                    lscroll._jsonpCallback(data.BizObject.rows,data.BizObject.total);
                }, error: function () {
                    lscroll._ierror()
                }, timeout: function () {
                    lscroll._itimeout()
                }
                });
            }
        },
        _shownodata:function()
        {
            var nodataicon='<i class="iconfont icon-zanwushuju2"></i>';
            x$(this.container[0].parentNode).bottom('<div class="listmask">'+nodataicon+'</div>');
        },
        _createListData:function(rows){
            var lastcount = (this.container.find("li").length) % this.pageCount;
            this._ListDetail(lastcount,rows);
        },
        _ListDetail:function(lastcount, objectdata){
            for (var i = lastcount; i < objectdata.length; i++) {
                //var guid = as().guidGenerator();
                if(typeof (this.CreateDetail)!="undefined") {
                    var rowdata=this.CreateDetail(objectdata[i]);
                    this.container.bottom(rowdata)
                }else {
                    var li = '<li class="hr">'
                        + '<a href="/project/detail"  class="item-content">'
                        + '<div class="item-inner">'
                        + '<div class="progress-radial progress-29"><b></b></div>'
                        + '<div class="content-right"><div class="list-content"><span class="code">[200312323]</span>&nbsp;<span class="name">南京地铁项目</span></div>'
                        + '<div class="list-info"><span>陈清元</span><span class="date">2016-6-1</span></div>'
                        + '<i class="iconfont icon-arrow"></i>'
                        + '</div></div></a></li>';
                    this.container.bottom(li);
                }
                //x$("#" + guid).data("row", row);
            }
        },
        _jsonpCallback:function(rows,total){
            try {
                if (total == 0||rows.length==0) {
                   this._shownodata();
                }else {
                    this._createListData(rows);
                }
                //结束进度条
                x$().hideloading();
                 as().iscroll.init(this);
                //this._iscroll(this);
            }
            catch (e) {

            }
        },
        _ierror:function()
        {
            as().showAlert("连接无法获取,请检查网络后重试！");

        },
        _itimeout:function()
        {
            as().showAlert("连接超时，请重试！");
        }
    }

} ());




