//cache对象结构像这样{"uuid1":{"name1":value1,"name2":value2},"uuid2":{"name1":value1,"name2":value2}}，每个uuid对应一个elem缓存数据，每个缓存对象是可以由多个name/value对组成的，而value是可以是任何数据类型的，比如可以像这样在elem下存一个JSON片段:$(elem).data('JSON':{"name":"Tom","age":23})
var cache = {};
//expando作为elem一个新加属性，为了防止与用户自己定义的产生冲突，这里采用可变后缀
//navigator.userAgent.indexOf("MSIE")ie浏览器
var expando = 'jQuery' + new Date().getTime();


var uuid = 0;
xui.extend({
    first: function () { return this[0]; },
    last: function () { return this[this.length - 1]; },
    /*解决跨域问题 
    example:
    前端
    x$().xhrjsonp("http://auth.hengyongmis.com/Interface/ValidateUser.ashx?UserName=sl&Possword=123456", { callback: function (data) { } });
    服务器端：
    传递jsoncallback参数的方法
    */
    xhrjsonp: function (url, options) {
        var jsonp = typeof (options.jsonp) != "undefined" ? options.jsonp : "jsoncallback";
        var data = typeof (options.data) != "undefined" ? options.data : {};
        var fun = typeof (options.callback) != "undefined" ? options.callback : function () { };
        var error = typeof (options.error) != "undefined" ? options.error : function () {
            x$().hideloading();
            //            var currentid = x$('#main').find(".currentpage").attr("id").toString();
            //            if (currentid != "home_page" && currentid != "login_page" && currentid != "account_page") {
            //                x$('#main').pre({}); 
            //            }
            showAlert("连接无法获取,请检查网络后重试！");
        };
        var timeout = typeof (options.timeout) != "undefined" ? options.timeout : function () {
            //            var currentid = x$('#main').find(".currentpage").attr("id").toString();
            //            if (currentid != "home_page" && currentid != "login_page") {
            //                x$('#main').pre({}); 
            //            }
            showAlert("连接超时，请重试！");
        };
        //生成随机函数名，避免命名冲突
        var value = Math.random().toString();
        var callbackScriptName = "script_" + value.replace('.', '');
        var callbackfunctionvalue = 'jsonp_' + value.replace('.', '');
        var head = document.getElementsByTagName("head").item(0);

        //参数处理
        var list = new Array();
        for (var i in data) {
            list.push(i + '=' + data[i]);
        }
        var param = list.join('&');
        var oScript = document.createElement('script');
        oScript.setAttribute("id", callbackScriptName);
        var handerError = function (e) {
            clearTimeout(netTimeOut);
            head.removeChild(oScript);
            oScript.onerror = null;
            error && error(e);
        };

        var timeoutError = function () {
            oScript.onerror = null;
            timeout && timeout();
            head.removeChild(oScript);
        };

        oScript.onerror = handerError;
        //ie浏览器
        var netTimeOut = setTimeout(timeoutError, 10000);
        var lastparam = jsonp + '=' + callbackfunctionvalue + '&' + param + "&t=" + new Date().getTime();
        if (url.indexOf('?') != -1) {
            oScript.src = url + '&' + lastparam
        }
        else {
            oScript.src = url + '?' + lastparam;
        }

        head.appendChild(oScript);
        //放在里面才好用
        window[callbackfunctionvalue] = function (response) {
            fun && fun(response);
            clearTimeout(netTimeOut);
            head.removeChild(oScript);
        }
    },
    dynamicScript: function (id, src) {
        var script = document.getElementById(id);
        if (script != null) {
            x$(script).remove();
        }
        var head = document.getElementsByTagName("head").item(0);
        var oScript = document.createElement("script");
        oScript.href = src;
        oScript.id = id;
        oScript.type = "text/javascript";
        oScript.language = "javascript";
        head.appendChild(oScript);
    },
    /*元素的显示与隐藏*/
    show: function () {
        this.setStyle("display", "block");
    },
    hide: function () {
        this.setStyle("display", "none");
    },
    /*页面切换*/
    //上一页(返回)
    pre: function (options) {
        x$().closeDiv();
        var currentdom = this.find(".currentpage");
        var predom = "#" + currentdom.attr("pre");
        currentdom.hide();
        x$(predom).show();
        currentdom.removeClass("currentpage");
        x$(predom).addClass("currentpage");
    },
    //下一页
    next: function (nextdom, options) {
        var currentdom = this.find(".currentpage");
        var id = currentdom.attr("id").toString();
        var callback = options.callback;
        var em = this;
        var html = typeof (options.html) != "undefined" ? options.html : null;
        currentdom.hide();
        //加载首页
        if (x$(nextdom).length == 0) {
            em.xhr('top', html);
            x$(nextdom).attr("isclick", "true");
            if (typeof (callback) == 'function') {
                callback();
            }
        }
        else {
            currentdom.hide();
            x$(nextdom).show();
        }
        var isclick = x$(nextdom).attr("isclick").toString();
        if (isclick == "") {
            x$(nextdom).attr("isclick", "true");
            if (typeof (callback) == 'function') {
                callback();
            }
        }
        currentdom.removeClass("currentpage");
        x$(nextdom).addClass("currentpage");
        x$(nextdom).attr("pre", id);
    },
    //存储页面
    storenext: function (nextdom, options) {
        var callback = options.callback;
        var em = this;
        var html = typeof (options.html) != "undefined" ? options.html : null;
        if (x$(nextdom).length == 0) {
            em.xhr('bottom', html);
            x$(nextdom).attr("isclick", "");
            x$(nextdom).hide();
            if (typeof (callback) == 'function') {
                callback();
            }
        }
    },
    list: function (options) {
        //获取上拉下拉元素
        var el = this;
        var skin=typeof (options.skin)=="undefined"?"":options.skin;
        //添加元素
        el.addClass("listwrapper");
        el.addClass(skin);
        var divPullDown = '<div class="pullDown" name="pullDown"><span class="iconfont pullDownIcon_xia"></span><span class="pullDownLabel">下拉刷新</span></div>';
        var divPullUp = '<div class="pullUp" name="pullUp"><span class="iconfont pullUpIcon_shang"></span><span class="pullUpLabel">上拉加载</span></div>';
        var ul = '<ul ismove="false" class="list-container"></ul>';
        var scrollhtml = '<div class="scroller">' + divPullDown + ul + divPullUp + '</div>';
        //加载进度条
        el.showloading(0);
        el.top(scrollhtml);
        //回调方法
        var beforePullAction = options.beforePullAction;
        var container=el.find(".list-container");
        if (typeof (beforePullAction) == 'function') {
            beforePullAction(el,container);
        }
    },
    iscroll: function (options) {
        //获取上拉下拉元素
        var el = this;
        //回调方法
        var pullDownAction = options.pullDownAction;
        var pullUpAction = options.pullUpAction;
        var ispullDown = typeof (options.ispullDown) != "undefined" ? options.ispullDown : true;
        var ispullUp = typeof (options.ispullUp) != "undefined" ? options.ispullUp : false;
        //上下拉元素
        var pullDownEl = el.find(".pullDown")[0];
        var pullUpEl = el.find(".pullUp")[0];
        var pullUpOffset = pullUpEl.offsetHeight;
        var pullDownOffset = pullDownEl.offsetHeight;
        var scrollid = el.attr("id").toString();
        //上下滚动刷新
        var myScroll = new iScroll(scrollid, {
            UpTop:80,
            vScrollbar: true,
            hideScrollbar:false,
            bottomload:false,
            onRefresh: function () {
                if (pullDownEl.getAttribute("name").match('loading')) {
                    //页面刷新结束
                    pullDownEl.setAttribute("name", '');
                    pullDownEl.querySelector('.pullDownLabel').innerHTML = "下拉刷新";
                    pullDownEl.childNodes[0].className = "iconfont pullDownIcon_xia";
                }
                else if (pullUpEl.getAttribute("name").match('loading')) {
                    //数据加载结束
                    pullUpEl.setAttribute("name", '');
                    pullUpEl.querySelector('.pullUpLabel').innerHTML = "上拉加载";
                    pullUpEl.childNodes[0].className = "iconfont pullUpIcon_shang";
                }
            },
            onScrollMove: function () {
                var ispulldown = el.find(".pullDown").attr("name");
                var ispullup = el.find(".pullUp").attr("name");
                var uptop=this.options.UpTop;
                if (ispulldown == "loading" || ispullup == "loading")
                    return;
                //超过80开始刷新
                if (this.y > uptop && !pullDownEl.getAttribute("name").match('flip')) {
                    pullDownEl.setAttribute("name", 'flip');
                    pullDownEl.querySelector('.pullDownLabel').innerHTML = '松开立即刷新';
                    pullDownEl.childNodes[0].className = "iconfont pullDownIcon_shang";
                } else if (this.y < 0 && this.y < (this.maxScrollY - uptop) && !pullUpEl.getAttribute("name").match('flip')) {
                    pullUpEl.setAttribute("name", 'flip');
                    pullUpEl.querySelector('.pullUpLabel').innerHTML = "松开立即加载";
                    pullUpEl.childNodes[0].className = "iconfont pullUpIcon_xia";
                }
            },
            onScrollEnd: function () {
                //滚动加载数据
                if(this.options.bottomload)
                {
                    if((this.y == this.maxScrollY)&&(!pullUpEl.getAttribute("name").match('loading'))) {
                        pullUpEl.setAttribute("name", 'loading');
                        pullUpEl.querySelector('.pullUpLabel').innerHTML = '正在加载...';
                        pullUpEl.childNodes[0].className = "iconfont pullUpIcon_loading";
                        if (typeof (pullUpAction) == 'function') {
                            var container=el.find(".list-container");
                            pullUpAction(myScroll, el,container);
                        }
                    }

                }
                //判断是否结束动作(开始执行加载动作)
                if (pullDownEl.getAttribute("name").match('flip')) {
                    pullDownEl.setAttribute("name", 'loading');
                    pullDownEl.querySelector('.pullDownLabel').innerHTML = '正在刷新...';
                    pullDownEl.childNodes[0].className = "iconfont pullDownIcon_loading";
                    if (typeof (pullDownAction) == 'function') {
                        var container=el.find(".list-container");
                        pullDownAction(myScroll, el,container);
                    }
                }
                else if (pullUpEl.getAttribute("name").match('flip')) {
                    pullUpEl.setAttribute("name", 'loading');
                    pullUpEl.querySelector('.pullUpLabel').innerHTML = '正在加载...';
                    pullUpEl.childNodes[0].className = "iconfont pullUpIcon_loading";
                    if (typeof (pullUpAction) == 'function') {
                        var container=el.find(".list-container");
                        pullUpAction(myScroll, el,container);
                    }
                }

            }

        });

        //点击加载更多
        $(pullUpEl).on("click", function (e) {
            pullUpEl.setAttribute("name", 'loading');
            pullUpEl.querySelector('.pullUpLabel').innerHTML = '加载中...';
            pullUpEl.childNodes[0].className = "iconfont pullUpIcon_loading";
            if (typeof (pullUpAction) == 'function') {
                var container=el.find(".list-container");
                pullUpAction(myScroll, el,container);
            }
        });
    },
    showDiv: function (name, options) {
        //var div = x$(id)[0].innerHTML;
        var div = x$("#TipsDialog").find("[name=" + name + "]")[0].innerHTML;
        x$("#divDialog").remove();
        if (typeof (options) == "undefined") {
            var html = '<div id="divDialog" class="page" style="background-color:rgba(0,0,0,0.8);z-index:1001;"><div>' + div + '</div></div>';
        } else {
            var background = typeof (options.background) != "undefined" ? options.background : "rgba(0,0,0,0.8)";
            var html = '<div id="divDialog" class="page" style="background-color:' + background + ';z-index:1001;"><div>' + div + '</div></div>';
        }
        x$("body").top(html);
    },
    closeDiv: function () {
        x$("#divDialog").remove();
    },
    showloading: function (type) {
        if (x$("#loading_page").length == 1) {
            x$("#loading_page").remove();
        }
        var loadClass;
        var pageStyle;
        switch (type) {
            case 0:
                {
                    pageStyle = "background-color:#F2F2F2;z-index:1001;";
                    loadClass = "iconfont icon-loading";
                }
                break;
            default:
                {
                    pageStyle = "background-color:transparent;z-index:1001;";
                    loadClass = "iconfont icon-loading";
                }
                break;
        }
        var html = '<div id="loading_page" class="loading_page" style="' + pageStyle + '"><div class="' + loadClass + '"></div></div>';
        this.top(html);
        return this;
    },
    hideloading: function () {
        if (x$("#loading_page").length == 1) {
            x$("#loading_page").remove();
        }
    },
    closest: function (tag, parents) {
        var curel = this[0];
        var ret;
        var havetag = parents.find(tag).length > 0 ? true : false;
        while (havetag) {
            if (curel.nodeName.toLowerCase() == tag.toLowerCase()) {
                ret = curel;
                break;
            } else {
                curel = curel.parentElement;
            }
        }
        return curel;
    },
    data: function (name, data) {
        var elem = this[0];
        //至少保证要有elem和name两个参数才能进行取缓存或设置缓存操作
        if (elem && name) {
            //尝试取elem标签expando属性
            var id = elem[expando];
            if (typeof (data) != "undefined") {
                //设置缓存数据
                if (!id)
                    id = elem[expando] = ++uuid;
                //如果cache中id键对象不存在（即这个elem没有设置过数据缓存），先创建一个空对象
                if (!cache[id])
                    cache[id] = {};
                cache[id][name] = data;
            }
            else {
                //获取缓存数据
                if (!id)
                    return 'Not set cache!';
                else
                    return cache[id][name];
            }
        }

    },
    //功能: 用函数 funName 对数组 objArray 中的每个值进行处理一次，
    foreach: function (objArray, funName) {
        for (var i = 0; i < objArray.length; i++) {
            if (funName(objArray[i], i) == false)
                break;
        }
    },
    GetQueryString:function(name)
    {
        var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if(r!=null)return  unescape(r[2]); return null;
    }
});

