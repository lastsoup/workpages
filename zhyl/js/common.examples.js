
var main={
    init:function(){
        this.initDropDown();
        this.initMenuHover();
        this.initIframe();
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
            $(this).find("ul").slideUp("fast");
        });
    },
    initMenuHover:function(){
        var selectTop=$("#menu-select .selected-item")[0].offsetTop+"px";
        $("#hover_bg").css({"top":selectTop});

        var meunlis=$("#menu-select li")
        meunlis.click(function(){
            meunlis.removeClass("selected-item");
            $(this).addClass("selected-item");
            var selectTop=$(this)[0].offsetTop+"px";
            $("#hover_bg").css({"top":selectTop});
        });

        var depth2_bg = document.getElementById("hover_bg");

        function start_move(oDiv, target) {
            clearInterval(oDiv.timer);

            oDiv.timer = setInterval(function (){
                var top = parseInt(oDiv.style.top);
                var speed=(target-top)/5;

                speed=speed>0?Math.ceil(speed):Math.floor(speed);

                if (Math.abs(target - top) < 2) {
                    oDiv.style.top=target+'px';
                    clearInterval(oDiv.timer);
                } else {
                    oDiv.style.top=top+speed+'px';
                }
            }, 15);
        }

        $("#menu-select li").mouseover(function(){
            var index = $("#menu-select li").index(this);
            var targetTop = index * 55;
            start_move(depth2_bg, targetTop);
        });

        $("#menu-select").mouseout(function(){
            var selectTop=$("#menu-select .selected-item")[0].offsetTop;
            start_move(depth2_bg, selectTop);
        });
    }
}