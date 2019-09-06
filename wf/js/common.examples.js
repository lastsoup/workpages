﻿
var main={
    init:function(){
        this.initDropDown();
        this.initIframe();

        $('#tabs').tabs('addIframeTab',{
            tab:{title:"欢迎使用",closable:false},
            iframe:{src:"iframe/home.html"}
        });
        tabClose();
        tabCloseEven();
        $('.cs-navi-tab').click(function() {
            var $this = $(this);
            var href = $this.attr('src');
            var title = $this.text();
            addTab(title, href);
        });
        window.onresize= function(){
            main.initIframe();
        };
    },
    initIframe:function()
    {
        if ($.browser.msie && ($.browser.version == "7.0"||$.browser.version == "6.0")) {
            $(".floor2").height($("body").height()-72);
            var width=$("body").width();
            if(width<=550)
                $("html").css({"overflow-x":"auto"});
            else
                $("html").css({"overflow-x":"hidden"});
        }

    },
    initDropDown:function(){
        $("#btnsetting").click(function(){
            $(this).find("ul").slideDown("fast");
        });
        $("#btnsetting").mouseleave(function(){
            $(this).find("ul").slideUp("fast");;
        });
    }
}

function addTab(title, url){
    if ($('#tabs').tabs('exists', title)){
        $('#tabs').tabs('select', title);//选中并刷新
        var currTab = $('#tabs').tabs('getSelected');
        var url = currTab.find("iframe").attr("src");
        var title=currTab.panel('options').title;
        if(url != undefined) {
            $('#tabs').tabs('updateIframeTab',{'which':title,iframe:{src:url}});
        }
    } else {
        $('#tabs').tabs('addIframeTab',{
            tab:{title:title,closable:true},
            iframe:{src:url}
        });
    }
    tabClose();
}

function tabClose() {
    /*双击关闭TAB选项卡*/
    $(".tabs-inner").dblclick(function(){
        var subtitle = $(this).children(".tabs-closable").text();
        $('#tabs').tabs('close',subtitle);
    });

    /*为选项卡绑定右键*/
    $(".tabs-inner").bind('contextmenu',function(e){
        $('#mm').menu('show', {
            left: e.pageX,
            top: e.pageY
        });

        var subtitle =$(this).children(".tabs-closable").text();

        $('#mm').data("currtab",subtitle);
        $('#tabs').tabs('select',subtitle);
        return false;
    });
}

//绑定右键菜单事件
function tabCloseEven() {
    //刷新
    $('#mm-tabupdate').click(function(){
        var currTab = $('#tabs').tabs('getSelected');
        var url = currTab.find("iframe").attr("src");
        var title=currTab.panel('options').title;
        if(url != undefined) {
            $('#tabs').tabs('updateIframeTab',{'which':title,iframe:{src:url}});
        }
    })
    //关闭当前
    $('#mm-tabclose').click(function(){
        var currtab_title = $('#mm').data("currtab");
        $('#tabs').tabs('close',currtab_title);
    });

    //全部关闭
    $('#mm-tabcloseall').click(function(){
        $('.tabs-inner span').each(function(i,n){
            var t = $(n).text();
            var tab=$('#tabs').tabs('getTab',t);
            var index = $('#tabs').tabs('getTabIndex',tab);
            if(index != 0) {
                $('#tabs').tabs('close',t);
            }
        });
    });

    //关闭除当前之外的TAB
    $('#mm-tabcloseother').click(function(){
        var prevall = $('.tabs-selected').prevAll();
        var nextall = $('.tabs-selected').nextAll();
        if(prevall.length>0){
            prevall.each(function(i,n){
                var t=$('a:eq(0) span',$(n)).text();
                var tab=$('#tabs').tabs('getTab',t);
                var index = $('#tabs').tabs('getTabIndex',tab);
                if(index != 0) {
                    $('#tabs').tabs('close',t);
                }
            });
        }
        if(nextall.length>0) {
            nextall.each(function(i,n){
                var t=$('a:eq(0) span',$(n)).text();
                var tab=$('#tabs').tabs('getTab',t);
                var index = $('#tabs').tabs('getTabIndex',tab);
                if(index != 0) {
                    $('#tabs').tabs('close',t);
                }
            });
        }
        return false;
    });
    //关闭当前右侧的TAB
    $('#mm-tabcloseright').click(function(){
        var nextall = $('.tabs-selected').nextAll();
        if(nextall.length==0){
            //msgShow('系统提示','后边没有啦~~','error');
            alert('后边没有啦~~');
            return false;
        }
        nextall.each(function(i,n){
            var t=$('a:eq(0) span',$(n)).text();
            $('#tabs').tabs('close',t);
        });
        return false;
    });

    //关闭当前左侧的TAB
    $('#mm-tabcloseleft').click(function(){
        var prevall = $('.tabs-selected').prevAll();
        if(prevall.length==0){
            alert('到头了，前边没有啦~~');
            return false;
        }
        prevall.each(function(i,n){
            var t=$('a:eq(0) span',$(n)).text();
            $('#tabs').tabs('close',t);
        });
        return false;
    });

    //退出
    $("#mm-exit").click(function(){
        $('#mm').menu('hide');
    })
}

/**
 * @author {CaoGuangHui}
 */
$.extend($.fn.tabs.methods, {
    /**
     * 加载iframe内容
     * @param  {jq Object} jq     [description]
     * @param  {Object} params    params.which:tab的标题或者index;params.iframe:iframe的相关参数
     * @return {jq Object}        [description]
     */
    loadTabIframe:function(jq,params){
        return jq.each(function(){
            var $tab = $(this).tabs('getTab',params.which);
            if($tab==null) return;

            var $tabBody = $tab.panel('body');

            //销毁已有的iframe
            var $frame=$('iframe', $tabBody);
            if($frame.length>0){
                try{//跨域会拒绝访问，这里处理掉该异常
                    $frame[0].contentWindow.document.write('');
                    $frame[0].contentWindow.close();
                }catch(e){
                    //Do nothing
                }
                $frame.remove();
                if($.browser.msie){
                    CollectGarbage();
                }
            }
            $tabBody.html('');

            $tabBody.css({'overflow':'hidden','position':'relative'});
            var $mask = $('<div style="position:absolute;z-index:2;width:100%;height:100%;background:#ccc;z-index:1000;opacity:0.3;filter:alpha(opacity=30);"><div>').appendTo($tabBody);
            var $maskMessage = $('<div class="mask-message">' + (params.iframe.message || '正在加载,请稍候 ...') + '</div>').appendTo($tabBody);
            var $containterMask = $('<div style="position:absolute;width:100%;height:100%;z-index:1;background:#fff;"></div>').appendTo($tabBody);
            var $containter = $('<div style="position:absolute;width:100%;height:100%;z-index:0;"></div>').appendTo($tabBody);

            var iframe = document.createElement("iframe");
            iframe.src = params.iframe.src;
            iframe.frameBorder = params.iframe.frameBorder || 0;
            iframe.height = params.iframe.height || '100%';
            iframe.width = params.iframe.width || '100%';
            if (iframe.attachEvent){
                iframe.attachEvent("onload", function(){
                    $([$mask[0],$maskMessage[0]]).fadeOut(params.iframe.delay || 'slow',function(){
                        $(this).remove();
                        if($(this).hasClass('mask-message')){
                            $containterMask.fadeOut(params.iframe.delay || 'slow',function(){
                                $(this).remove();
                            });
                        }
                    });
                });
            } else {
                iframe.onload = function(){
                    $([$mask[0],$maskMessage[0]]).fadeOut(params.iframe.delay || 'slow',function(){
                        $(this).remove();
                        if($(this).hasClass('mask-message')){
                            $containterMask.fadeOut(params.iframe.delay || 'slow',function(){
                                $(this).remove();
                            });
                        }
                    });
                };
            }
            $containter[0].appendChild(iframe);
        });
    },
    /**
     * 增加iframe模式的标签页
     * @param {[type]} jq     [description]
     * @param {[type]} params [description]
     */
    addIframeTab:function(jq,params){
        return jq.each(function(){
            if(params.tab.href){
                delete params.tab.href;
            }
            $(this).tabs('add',params.tab);
            $(this).tabs('loadTabIframe',{'which':params.tab.title,'iframe':params.iframe});
        });
    },
    /**
     * 更新tab的iframe内容
     * @param  {jq Object} jq     [description]
     * @param  {Object} params [description]
     * @return {jq Object}        [description]
     */
    updateIframeTab:function(jq,params){
        return jq.each(function(){
            params.iframe = params.iframe || {};
            if(!params.iframe.src){
                var $tab = $(this).tabs('getTab',params.which);
                if($tab==null) return;
                var $tabBody = $tab.panel('body');
                var $iframe = $tabBody.find('iframe');
                if($iframe.length===0) return;
                $.extend(params.iframe,{'src':$iframe.attr('src')});
            }
            $(this).tabs('loadTabIframe',params);
        });
    }
});

var demo={
    init:function(){
        $("#tt").tree(
            {
                animate:true,
                onBeforeSelect:function(node)
                {
                    if(node.flag=="parent")
                        return false;
                },
                onSelect:function(node)
                {
                    demo.loadIframe($(".iframecontent"),{iframe:{src:node.src}});
                },
                formatter:function(node){
                    var s = node.text;
                    if (node.children){
                        s += '&nbsp;<span style=\'color:blue\'>(' + node.children.length + ')</span>';
                    }
                    return s;
                },
                data:[{
                    "text":"默认分类",
                    "flag":"parent",
                    "children":[{
                        "text":"测试1",
                        "src":"../sub/project-sub.html"
                    },{
                        "text":"测试2",
                        "src":"../sub/dome-sub.html"
                    }]
                },{
                    "text":"测试",
                    "state":"closed",
                    "flag":"parent",
                    "children":[{
                        "text":"测试1",
                        "src":"../sub/dome-sub2.html"
                    },{
                        "text":"测试2",
                        "src":"../sub/dome-sub3.html"
                    }]
                }]
            }
        );


        var firstnode=$("#tt").tree("getRoot").children[0];
        $("#tt").tree("select",$("#"+firstnode.domId));
        $(".btn-refresh").click(function(){
            demo.refresh();
        });
        $(".btn-expand").click(function(){
            demo.expandAll();
        });
        $(".btn-collapse").click(function(){
            demo.collapseAll();
        });
        this.loadIframe($(".iframecontent"),{iframe:{src:firstnode.src}})
    },
    loadIframe:function(el,params){
        var $tabBody = el;
        //销毁已有的iframe
        var $frame=$('iframe', $tabBody);
        if($frame.length>0){
            try{//跨域会拒绝访问，这里处理掉该异常
                $frame[0].contentWindow.document.write('');
                $frame[0].contentWindow.close();
            }catch(e){
                //Do nothing
            }
            $frame.remove();
            if($.browser.msie){
                CollectGarbage();
            }
        }
        $tabBody.html('');

        $tabBody.css({'overflow':'hidden','position':'relative'});
        var $mask = $('<div style="position:absolute;z-index:2;width:100%;height:100%;background:#ccc;z-index:1000;opacity:0.3;filter:alpha(opacity=30);"><div>').appendTo($tabBody);
        var $maskMessage = $('<div class="mask-message">' + (params.iframe.message || '正在加载,请稍候 ...') + '</div>').appendTo($tabBody);
        var $containterMask = $('<div style="position:absolute;width:100%;height:100%;z-index:1;background:#fff;"></div>').appendTo($tabBody);
        var $containter = $('<div style="position:absolute;width:100%;height:100%;z-index:0;"></div>').appendTo($tabBody);

        var iframe = document.createElement("iframe");
        iframe.src = params.iframe.src;
        iframe.frameBorder = params.iframe.frameBorder || 0;
        iframe.height = params.iframe.height || '100%';
        iframe.width = params.iframe.width || '100%';
        if (iframe.attachEvent){
            iframe.attachEvent("onload", function(){
                $([$mask[0],$maskMessage[0]]).fadeOut(params.iframe.delay || 'slow',function(){
                    $(this).remove();
                    if($(this).hasClass('mask-message')){
                        $containterMask.fadeOut(params.iframe.delay || 'slow',function(){
                            $(this).remove();
                        });
                    }
                });
            });
        } else {
            iframe.onload = function(){
                $([$mask[0],$maskMessage[0]]).fadeOut(params.iframe.delay || 'slow',function(){
                    $(this).remove();
                    if($(this).hasClass('mask-message')){
                        $containterMask.fadeOut(params.iframe.delay || 'slow',function(){
                            $(this).remove();
                        });
                    }
                });
            };
        }
        $containter[0].appendChild(iframe);
    },
    collapseAll:function(){
        $('#tt').tree('collapseAll');
    },
    expandAll:function(){
        $('#tt').tree('expandAll');
    },
    refresh:function()
    {
        var node= $('#tt').tree('getSelected');
        this.loadIframe($(".iframecontent"),{iframe:{src:node.src}});
    }
}

var subdemo={
    init:function(){
        $('#dg').datagrid({
            data:this.getData(),
            pageSize: 15, //每页显示的记录条数，默认为10
            pageList: [2, 5, 10, 15, 20, 25, 40] //可以设置每页记录条数的列表
        }).datagrid('clientPaging').resize();
        //设置分页控建显示
        var p = $('#dg').datagrid('getPager');
        $(p).pagination({
            beforePageText: '第', //页数文本框前显示的汉字
            afterPageText: '页    共 {pages} 页',
            displayMsg: '当前显示 {from} - {to} 条记录   共 {total} 条记录'
        });
    },
    getData:function(){
        var rows = [];
        for(var i=1; i<=800; i++){
            var amount = Math.floor(Math.random()*1000);
            var price = Math.floor(Math.random()*1000);
            rows.push({
                inv: 'Inv No '+i,
                date: $.fn.datebox.defaults.formatter(new Date()),
                name: 'Name '+i,
                amount: amount,
                price: price,
                cost: amount*price,
                note: 'Note '+i
            });
        }
        return rows;
    }
}