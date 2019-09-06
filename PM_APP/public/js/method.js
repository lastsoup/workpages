var host="http://182.254.130.14:9001";
var dataHander={
    setItem:function(name,data){
        var dataString = JSON.stringify(data);
        window.localStorage.setItem(name, dataString);
    },
    getItem:function(name){
        var dataObj = JSON.parse(window.localStorage.getItem(name));
        return dataObj;
    },
    removeItem:function(name){
        window.localStorage.removeItem(name);
    }
}

var loginHander={
    AllPage:function(){
        //判断是否有上一页
        if(history.length==0||window.location.pathname=="/index"){
            $("#btnback").remove();
        }
        var isremember=dataHander.getItem("isremember");
        var userinfo=dataHander.getItem("userinfo");
        var userrole=dataHander.getItem("role");
        // if((isremember==null&&userinfo==null)||(!isremember&&userinfo==null))
        // {
        //     window.location.href="/";
        // }else {

        //     var roleval=$.map(userrole, function(n){
        //         return n.ShowRoleName;
        //     });
        //     $("#userRole").html(roleval.join(","));
        //     $("#userName").html(userinfo.PMUserNickName);

        // }
        $("#loading_login").hide();
    },
    LoginPage:function(){
        var isremember=dataHander.getItem("isremember");
        var userinfo=dataHander.getItem("userinfo");
        if(isremember&&userinfo!=null)
        {
            window.location.href="/index";
        }else
        {
            $("#loading_login").hide();
        }
        if(userinfo)
        $("#username").val(userinfo.PMUserNum);

    },
    LoginButtonClick:function(){
        var username=$("#username").val();
        var password=$("#password").val();
        var isremember=$('#isremember').is(':checked');
        $("#usererror,#passworderror").removeClass("has-error");
        if(username=="")
        {
            $("#usererror").addClass("has-error");
            $("#usererror .text").text("用户名不能为空！");
            return;
        }
        if(password=="")
        {
            $("#passworderror").addClass("has-error");
            $("#passworderror .text").text("密码不能为空！");
            return;
        }
       dataHander.setItem("isremember",true);
       dataHander.setItem("userinfo","test");
       dataHander.setItem("role","管理员");
       window.location.href="/index";
      // $.ajax({
      //  type : "post",
      //  async:false,
      //  url : host+"/PFServiceAPI.asmx/Login",
      //  data: {"RequestData":'{"Token":"123456789",Sn:"",Obj:{PMUserNum:"'+username+'",PMUserPsd:"'+password+'"}}'},
      //  //dataType : "jsonp",//数据类型为jsonp
      //  //jsonp: "jsoncallback",//服务端用于接收callback调用的function名的参数
      //  success : function(data){
      //  if(data.success)
      //  {
      //  dataHander.setItem("isremember",isremember);
      //  dataHander.setItem("userinfo",data.obj.user);
      //  dataHander.setItem("role",data.obj.role);
      //  window.location.href="/index";
      //  }else
      //  {
      //  var errorid=data.obj==1?"usererror":"passworderror";
      //  $("#"+errorid).addClass("has-error");
      //  $("#"+errorid+" .text").text(data.msg);
      //  }

      //  },
      //  timeout:1000,
      //  error:function(e){
      //      as().showAlert("连接出错！");
      //  }
      // });
    },
    LoginOut:function(){
        dataHander.removeItem("isremember");
        dataHander.removeItem("userinfo");
        dataHander.removeItem("role");
        window.location.href="/";
    }
}

var configure= {
    //全局的iscroll
    "scroll": {
        "listScroll": null
    }
}



    /*----------------------------------------
     * Copyright (c) 2014
     * 网站：http://www.0non0.com
     * Date: 2014-11-28
     * Creater:Cqy
     ----------------------------------------*/

    /*------通用的方法库 by:cqy 2015-2-28------*/

    /*------as()调用方法和属性-----------*/
    /*------使用as()调用方法，处理传递参数比较少的控件*/
    window.as = function (q) {
        return new _ananas(q);
    };

    //_ananas对象
    var _ananas = function (q) {
        this.el=$(q);
    };

    /*---封装start-------*/
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
    };

_ananas.prototype.getPastDate=function(){
    var nowdate = new Date();
    var y = nowdate.getFullYear();
    var m = nowdate.getMonth()+1;
    var d = nowdate.getDate();
    var formatnowdate = y+'-'+m+'-'+d;
    //获取系统前一年的时间
    var formatydate=(y-1)+'-'+m+'-'+d;
    //获取系统前一周的时间
    var oneweekdate = new Date(nowdate-7*24*3600*1000);
    var y = oneweekdate.getFullYear();
    var m = oneweekdate.getMonth()+1;
    var d = oneweekdate.getDate();
    var formatwdate = y+'-'+m+'-'+d;
    //获取系统前一个月的时间
    nowdate.setMonth(nowdate.getMonth()-1);
    var y = nowdate.getFullYear();
    var m = nowdate.getMonth()+1;
    var d = nowdate.getDate();
    var formatmdate = y+'-'+m+'-'+d;
    var date={now:formatnowdate,week:formatwdate,month:formatmdate,year:formatydate}
    return date;
};






