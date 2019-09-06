// Nifty-demo.js
// ====================================================================
// Set user options for current page.
// This file is only used for demonstration purposes.
// ====================================================================
// - ThemeOn.net -


$(document).ready(function () {


    // SETTINGS WINDOW
    // =================================================================

    var demoSetBody         = $('#demo-set'),
        demoSetIcon         = $('#demo-set-icon'),
        demoSetBtnGo        = $('#demo-set-btngo'),
        niftyContainer      = $('#container'),
        niftyMainNav        = $('#mainnav-container'),
        niftyAside          = $('#aside-container');

    if (demoSetBody.length) {
        function InitializeSettingWindow(){
            // BOXED LAYOUT
            // =================================================================
            var boxedLayoutCheckbox     = document.getElementById('demo-box-lay'),
                boxedLayoutImgBox       = $('#demo-bg-boxed'),
                boxedLayoutBtnClose     = document.getElementById('demo-close-boxed-img'),
                blurredBgList           = $('#demo-blurred-bg'),
                polygonBgList           = $('#demo-polygon-bg'),
                abstractBgList          = $('#demo-abstract-bg');


            // Initialize
            // =================================================================
            if(niftyContainer.hasClass('boxed-layout')){
                boxedLayoutCheckbox.checked = true;
            }else{
                boxedLayoutCheckbox.checked = false;
            }

            function bg_thumb_template(cat){
                var list = '';
                for (var i = 1; i < 17; i++) {
                    list += '<a href="#" class="thumbnail box-inline"><img class="img-responsive" src="./premium/boxed-bg/'+cat+'/thumbs/'+i+'.jpg" alt="Background Image"></a>';
                }
                return list;
            }
            function add_bg_thumbs(){
                blurredBgList.append(bg_thumb_template('blurred'));
                polygonBgList.append(bg_thumb_template('polygon'));
                abstractBgList.append(bg_thumb_template('abstract'));

                var boxedBgthumb = boxedLayoutImgBox.find('.thumbnail');
                boxedBgthumb.on('click', function(){
                    boxedBgthumb.removeClass('selected');
                    var url = $(this).children('img').prop('src').replace('thumbs','bg');
                    $(this).addClass('selected');
                    niftyContainer.css({
                        'background-image': 'url('+url+')',
                        'background-repeat': 'no-repeat',
                        'background-size': 'cover'
                    })
                });
            }



            // Boxed Layout Checkbox
            // =================================================================
            boxedLayoutCheckbox.onchange = function(){
                if (boxedLayoutCheckbox.checked) {
                    niftyContainer.addClass('boxed-layout');
                } else {
                    niftyContainer.removeClass('boxed-layout').removeAttr( 'style' );;
                    boxedLayoutImgBox.removeClass('open').find('.thumbnail').removeClass('selected');
                }
                var setting= $.fn.dataHander.getItem("setting");
                setting["boxed-layout"]=boxedLayoutCheckbox.checked;
                $.fn.dataHander.setItem("setting",setting);
                $(window).trigger('resize');
            };



            // Close Button
            // =================================================================
            boxedLayoutBtnClose.onclick = function(){
                boxedLayoutImgBox.removeClass('open');
            }






            // TRANSITION EFFECTS
            // =================================================================
            // =================================================================
            var effectList = 'easeInQuart easeOutQuart easeInBack easeOutBack easeInOutBack steps jumping rubber',
                animCheckbox = document.getElementById('demo-anim'),
                transitionVal = document.getElementById('demo-ease');


            // Initialize
            // =================================================================
            if(niftyContainer.hasClass('effect')){
                animCheckbox.checked = true;
                transitionVal.disabled = false;
            }else{
                animCheckbox.checked = false;
                transitionVal.disabled = true;
            }

            // Animations checkbox
            animCheckbox.onchange = function(){
                if (animCheckbox.checked) {
                    niftyContainer.addClass('effect');
                    transitionVal.disabled = false;
                    transitionVal.value = 'effect';
                } else {
                    niftyContainer.removeClass('effect ' + effectList);
                    transitionVal.disabled = true;
                }

                var setting= $.fn.dataHander.getItem("setting");
                setting["effect"]=animCheckbox.checked;
                $.fn.dataHander.setItem("setting",setting);
            };


            // Transition selectbox
            var effectArray = effectList.split(" ");
            for (i = 0; i < effectArray.length; i++) {
                if (niftyContainer.hasClass(effectArray[i])){
                    transitionVal.value = effectArray[i];
                    break;
                }
            }
            transitionVal.onchange = function(){
                var optionSelected = $("option:selected", this);
                var valueSelected = this.options[this.selectedIndex].value;
                if (valueSelected) {
                    niftyContainer.removeClass(effectList).addClass(valueSelected);
                }
            };





            // NAVBAR
            // =================================================================
            // =================================================================
            var navbarFixedCheckbox = document.getElementById('demo-navbar-fixed');

            // Initialize
            // =================================================================
            if(niftyContainer.hasClass('navbar-fixed')){
                navbarFixedCheckbox.checked = true;
            }else{
                navbarFixedCheckbox.checked = false;
            }

            // Fixed Position
            // =================================================================
            navbarFixedCheckbox.onchange = function(){
                if (navbarFixedCheckbox.checked) {
                    niftyContainer.addClass('navbar-fixed');
                } else {
                    niftyContainer.removeClass('navbar-fixed');
                }

                // Refresh the aside, to enable or disable the "Bootstrap Affix" when the navbar in a "static position".
                niftyMainNav.niftyAffix('update');
                niftyAside.niftyAffix('update');
                var setting= $.fn.dataHander.getItem("setting");
                setting["navbar-fixed"]=navbarFixedCheckbox.checked;
                $.fn.dataHander.setItem("setting",setting);
            };



            // FOOTER
            // =================================================================
            // =================================================================
            var footerFixedCheckbox = document.getElementById('demo-footer-fixed');


            // Initialize
            // =================================================================
            if(niftyContainer.hasClass('footer-fixed')){
                footerFixedCheckbox.checked = true;
            }else{
                footerFixedCheckbox.checked = false;
            }

            // Fixed Position
            // =================================================================
            footerFixedCheckbox.onchange = function(){
                if (footerFixedCheckbox.checked) {
                    niftyContainer.addClass('footer-fixed');
                } else {
                    niftyContainer.removeClass('footer-fixed');
                }

                var setting= $.fn.dataHander.getItem("setting");
                setting["footer-fixed"]=footerFixedCheckbox.checked;
                $.fn.dataHander.setItem("setting",setting);
            };




            // NAVIGATION
            // =================================================================
            // =================================================================
            var collapsedCheckbox   = document.getElementById('demo-nav-coll'),
                navFixedCheckbox    = document.getElementById('demo-nav-fixed'),
                navShortcutCheckbox = document.getElementById('demo-nav-shortcut'),
                navProfile          = $('#mainnav-profile'),
                navShortcut         = $('#mainnav-shortcut');

            // Initialize
            // =================================================================
            if(niftyContainer.hasClass('mainnav-fixed')){
                navFixedCheckbox.checked = true;
            }else{
                navFixedCheckbox.checked = false;
            }


            // Fixed Position
            // =================================================================
            if(niftyContainer.hasClass('mainnav-fixed')){
                navFixedCheckbox.checked = true;
            } else{
                navFixedCheckbox.checked = false;
            }
            navFixedCheckbox.onchange = function(){
                if (navFixedCheckbox.checked) {
                    $.niftyNav('fixedPosition');
                } else {
                    $.niftyNav('staticPosition');
                }

                var setting= $.fn.dataHander.getItem("setting");
                setting["mainnav-fixed"]=navFixedCheckbox.checked;
                $.fn.dataHander.setItem("setting",setting);
            };




            // Shortcut Buttons
            // =================================================================
            if(navShortcut.hasClass('hidden')){
                navShortcutCheckbox.checked = false;
            } else{
                navShortcutCheckbox.checked = true;
            }
            navShortcutCheckbox.onchange = function(){
                navShortcut.toggleClass('hidden');
            };



            // Collapsing/Expanding Navigation
            // =================================================================
            if(niftyContainer.hasClass('mainnav-sm')){
                collapsedCheckbox.checked = true;
            }else{
                collapsedCheckbox.checked = false;
            }
            collapsedCheckbox.onchange = function(){
                if (collapsedCheckbox.checked) {
                    $.niftyNav('collapse');
                } else {
                    $.niftyNav('expand');
                }
                var setting= $.fn.dataHander.getItem("setting");
                setting["mainnav-sm"]=collapsedCheckbox.checked;
                $.fn.dataHander.setItem("setting",setting);
            };











            // ASIDE
            // =================================================================
            // =================================================================
            var asdVisCheckbox      = document.getElementById('demo-asd-vis'),
                asdFixedCheckbox    = document.getElementById('demo-asd-fixed'),
                asdFloatCheckbox    = document.getElementById('demo-asd-float'),
                asdThemeCheckbox    = document.getElementById('demo-asd-themes');





            // Visible
            // =================================================================
            if(niftyContainer.hasClass('aside-in')){
                asdVisCheckbox.checked = true;
            } else{
                asdVisCheckbox.checked = false;
            }
            asdVisCheckbox.onchange = function() {
                if (asdVisCheckbox.checked) {
                    $.niftyAside('show');
                } else {
                    $.niftyAside('hide');
                }

                var setting= $.fn.dataHander.getItem("setting");
                setting["aside-in"]=asdVisCheckbox.checked;
                $.fn.dataHander.setItem("setting",setting);
            };



            // Fixed Position
            // =================================================================
            if(niftyContainer.hasClass('aside-fixed')){
                asdFixedCheckbox.checked = true;
            } else{
                asdFixedCheckbox.checked = false;
            }
            asdFixedCheckbox.onchange = function() {
                if (asdFixedCheckbox.checked) {
                    $.niftyAside('fixedPosition');
                } else {
                    $.niftyAside('staticPosition');
                };

                var setting= $.fn.dataHander.getItem("setting");
                setting["aside-fixed"]=asdFixedCheckbox.checked;
                $.fn.dataHander.setItem("setting",setting);
            };


            // Floating Aside
            // =================================================================
            if(niftyContainer.hasClass('aside-float')){
                asdFloatCheckbox.checked = true;
            } else{
                asdFloatCheckbox.checked = false;
            }
            asdFloatCheckbox.onchange = function() {
                if (asdFloatCheckbox.checked) {
                    niftyContainer.addClass('aside-float');
                } else {
                    niftyContainer.removeClass('aside-float');
                };
                $(window).trigger('resize');
                var setting= $.fn.dataHander.getItem("setting");
                setting["aside-float"]=asdFloatCheckbox.checked;
                $.fn.dataHander.setItem("setting",setting);
            };

            // Themes
            // =================================================================
            if(niftyContainer.hasClass('aside-bright')){
                asdThemeCheckbox.checked = false;
            } else{
                asdThemeCheckbox.checked = true;
            }
            asdThemeCheckbox.onchange = function() {
                if (asdThemeCheckbox.checked) {
                    $.niftyAside('darkTheme');
                } else {
                    $.niftyAside('brightTheme');
                };
                var setting= $.fn.dataHander.getItem("setting");
                setting["aside-bright"]=asdThemeCheckbox.checked;
                $.fn.dataHander.setItem("setting",setting);
            };



            // COLOR SCHEMES
            // =================================================================
            var themeBtn = $('.demo-theme'),
            changeTheme = function (themeName, type) {
                var themeCSS = $('#theme'),
                    fileext = '.min.css',
                    filename = '/css/themes/type-' + type + '/' + themeName + fileext;
                $.fn.dataHander.setItem("theme",filename);
                if (themeCSS.length) {
                    themeCSS.prop('href', filename);
                } else {
                    themeCSS = '<link id="theme" href="' + filename + '" rel="stylesheet">';
                    $('head').append(themeCSS);
                }
            };

            $('#demo-theme').on('click', '.demo-theme', function (e) {
                e.preventDefault();
                var el = $(this);
                if (el.hasClass('disabled')) {
                    return false;
                }
                changeTheme(el.attr('data-theme'), el.attr('data-type'));
                themeBtn.removeClass('disabled');
                el.addClass('disabled');
                return false;
            });
        }
        var nav_mode = function(){
            var query = window.location.search.substring(1);
            var vars = query.split("&");
            for (var i=0;i<vars.length;i++) {
                   var pair = vars[i].split("=");
                   if(pair[0] == "offcanvas"){return pair[1];}
            }
            return(false);
        }();
        if(nav_mode == "push" || nav_mode == "slide" ||nav_mode == "reveal"){
            $('.mainnav-toggle').removeClass('push slide reveal').addClass(nav_mode);
            niftyContainer.removeClass('mainnav-lg mainnav-sm').addClass('mainnav-out '+nav_mode);
        }
        var demoSetBody = $('#demo-set-body'), demoSetBtn = $('#demo-set-btn');
        $('html').on('click', function (e) {
            if (demoSetBody.hasClass('in')) {
                if (!$(e.target).closest('#demo-set').length) {
                    demoSetBtn.trigger('click')
                }
            }
        });

        demoSetBtn.one('click', InitializeSettingWindow);
        $('#demo-btn-close-settings').on('click', function () {
            demoSetBtn.trigger('click')
        });
    };
});
