/**
*  Version 2.1
*      -Contributors: "mindinquiring" : filter to exclude any stylesheet other than print.
*  Tested ONLY in IE 8 and FF 3.6. No official support for other browsers, but will
*      TRY to accomodate challenges in other browsers.
*  Example:
*      Print Button: <div id="print_button">Print</div>
*      Print Area  : <div class="PrintArea"> ... html ... </div>
*      Javascript  : <script>
*                       $("div#print_button").click(function(){
*                           $("div.PrintArea").printArea( [OPTIONS] );
*                       });
*                     </script>
*  options are passed as json (json example: {mode: "popup", popClose: false})
*
*  {OPTIONS} | [type]    | (default), values           | Explanation
*  --------- | --------- | --------------------------- | -----------
*  @mode     | [string]  | ("iframe"),"popup"          | printable window is either iframe or browser popup
*  @direction| [string]  | ("vertical"),"horizontal"   | printable window is either vertical or horizontal
*  @popHt    | [number]  | (500)                       | popup window height, calculated by window.screen.availHeight
*  @popWd    | [number]  | (400)                       | popup window width, always be 1123(the A4 horizontal pixel size)
*  @popX     | [number]  | (200)                       | popup window screen X position, calculated by window.screen.availWidth and popHt
*  @popY     | [number]  | (0)                         | popup window screen Y position, always be zero
*  @popTitle | [string]  | ('')                        | popup window title element
*  @popClose | [boolean] | (false),true                | popup window close after printing
*  @strict   | [boolean] | (undefined),true,false      | strict or loose(Transitional) html 4.01 document standard or undefined to not include at all (only for popup option)
*
*  Remark: this script file depend on jquery.js, JsonConvert.js and ironman3.global.js.
*/

/*处理js对象,序列化为json格式*/
function Serialize(obj, ignoreProperties) {
    if (obj == null || typeof (obj) == 'undefined')
        return "null";
    ignoreProperties = ignoreProperties || {};
    switch (obj.constructor) {
        case Object:
            var str = "{";
            for (var o in obj) {
                if (typeof (ignoreProperties[o]) == 'undefined'){
                    str += o + ":" + Serialize(obj[o]) + ",";
                }
            }
            if (str.substr(str.length - 1) == ",")
                str = str.substr(0, str.length - 1);
            return str + "}";
            break;
        case Array:
            var str = "[";
            for (var o in obj) {
                str += Serialize(obj[o]) + ",";
            }
            if (str.substr(str.length - 1) == ",")
                str = str.substr(0, str.length - 1);
            return str + "]";
            break;
        case Boolean:
            return "\"" + obj.toString() + "\"";
            break;
        case Date:
            return "\"" + obj.toString() + "\"";
            break;
        case Function:
            break;
        case Number:
            return "\"" + obj.toString() + "\"";
            break;
        case String:
            return "\"" + encodeJsonSpecialChar(obj.toString()) + "\"";
            break;
        default:
            return "null";
    }
    return "null";
}

function encodeJsonSpecialChar(value) {
    value = value || "";
    value = value.replace(/\\/g, "\\\\");
    value = value.replace(/"/g, "\\\"")
    return value;
}

(function ($) {
    var counter = 0;
    var xlglobal={
        jquerylink:"../../js/jquery-1.8.3.min.js",
        printlink:"../../js/components/jquery.printArea.js",
        prinkcss:"../../css/printArea.css",
        printimage:"../../images/b_print.png"
    };
    var a4Pixels = {
        dpis: {
            "72": { width: 595, height: 842 },
            "96": { width: 794, height: 1123 },
            "150": { width: 1487, height: 2105 },
            "120": { width: 1240, height: 1754 },
            "300": { width: 2480, height: 3508 }
        },
        pageZoom: 1,
        getA4Size: function () {
            var iDpi = a4Pixels.getScreenDPI()[0];
            var size = null;
            if (isNaN(iDpi) || iDpi < 96) {
                size = a4Pixels.dpis["72"];
            }
            else if (iDpi >= 96 && iDpi < 120) {
                size = a4Pixels.dpis["96"];
            }
            else if (iDpi >= 120 && iDpi < 150) {
                size = a4Pixels.dpis["120"];
            }
            else if (iDpi >= 150 && iDpi < 300) {
                size = a4Pixels.dpis["150"];
            }
            else {
                size = a4Pixels.dpis["300"];
            }

            return { width: parseInt(size.width * a4Pixels.pageZoom), height: parseInt(size.height * a4Pixels.pageZoom) };
        },
        getScreenDPI: function () {
            var arrDPI = new Array();
            if (window.screen.deviceXDPI != undefined) {
                arrDPI[0] = window.screen.deviceXDPI;
                arrDPI[1] = window.screen.deviceYDPI;
            }
            else {
                var tmpNode = document.createElement("DIV");
                tmpNode.style.cssText = "width:1in;height:1in;position:absolute;left:0px;top:0px;z-index:99;visibility:hidden";
                document.body.appendChild(tmpNode);
                arrDPI[0] = parseInt(tmpNode.offsetWidth);
                arrDPI[1] = parseInt(tmpNode.offsetHeight);
                tmpNode.parentNode.removeChild(tmpNode);
            }
            return arrDPI;
        }
    };
    var fontSizes = {
        "Largest": 4,
        "Large": 2,
        "Normal": 0,
        "Small": -2,
        "Smallest": -4
    };

    var modes = { iframe: "iframe", popup: "popup" };
    var directions = { vertical: "vertical", horizontal: "horizontal" }; // 打印方向
    var paginationHtml = "<div class=\"printPagination\"></div>";
    var splitHtml = "<div class=\"pageSplit\">------------------------------------------------------------打印分页---------------------------------------------------------------------------</div>";
    var defaults = {
        mode: modes.popup,
        direction: directions.vertical,
        //        popHt: 794,
        //        popWd: 1123,
        //        popX: 200,
        //        popY: 0,
        popTitle: '',
        popClose: false,
        changeDirection: true,
        fontSize: "Normal",
        needZoom: true,
        onPrintDOMComplete: null
    };

    $(document).ready(function () {
        if ($(".printContent") && $(".printContent").length) {
            var options = eval("[" + $("#hdnDirection").val() + "]");
            //$(".printToolbar :button").unbind().bind("click", function(e){
            $(".printContent").printContainer(options[0]);
            //});
        }
    });

    $.fn.printArea = function (options) {
        var settings = {}; //global settings
        var $this = $(this);
        $.extend(settings, defaults, options);

        var size = a4Pixels.getA4Size();
        // set position and size of popup window. add by chenguoxiong on 2014-08-12
        if (settings.mode == modes.popup) {
            $.extend(settings, {
                a4Size: size,
                popHt: window.screen.availHeight - 80,
                popWd: size.height + 50,
                popX: (window.screen.availWidth - size.height - 50) / 2,
                popY: 0
            });
        }

        counter++;
        var idPrefix = "printArea_";
        $("[id^=" + idPrefix + "]").remove();
        var ele = getFormData($this);

        settings.id = idPrefix + counter;

        var writeDoc;
        var printWindow;

        switch (settings.mode) {
            case modes.iframe:
                var f = new Iframe();
                writeDoc = f.doc;
                printWindow = f.contentWindow || f;
                break;
            case modes.popup:
                printWindow = new Popup();
                writeDoc = printWindow.doc;
        }

        writeDoc.open();
        writeDoc.write(docType() + "<html>" + getHead() + getBody(ele, settings) + "</html>");

        writeDoc.close();

        if (settings.onPrintDOMComplete) {
            settings.onPrintDOMComplete(writeDoc);
        }

        printWindow.focus();

        function docType() {
            if (settings.mode == modes.iframe || !settings.strict) return "";

            var standard = settings.strict == false ? " Trasitional" : "";
            var dtd = settings.strict == false ? "loose" : "strict";

            return '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01' + standard + '//EN" "http://www.w3.org/TR/html4/' + dtd + '.dtd">';
        }

        function getHead() {
            var head = "<head><title>" + settings.popTitle + "</title>";
            head += '<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />';
            head += '<link type="text/css" rel="stylesheet" href="' + xlglobal.prinkcss + '" />' +
                    '<script type="text/javascript" src="' + xlglobal.jquerylink + '"></script>' +
                    '<script type="text/javascript" src="' + xlglobal.printlink + '"></script>' +
                    '<style type="text/css" media="print">' +
                        'div.printToolbar { display: none; }' +
                        'div.printContent { margin-top: 0px; margin-bottom: 0px; }' +
                        'div.pageSplit { display: none; }' +
                        'tr.b_none { diplay: none; }' +
                    '</style>';
            $(document).find("link")
                .filter(function () {
                    return $(this).attr("rel").toLowerCase() == "stylesheet";
                })
                .filter(function () { // this filter contributed by "mindinquiring"
                    var media = $(this).attr("media");
                    return (media && media.toLowerCase() == "print");
                })
                .each(function () {
                    head += '<link type="text/css" rel="stylesheet" href="' + $(this).attr("href") + '" >';
                });
            head += "</head>";
            return head;
        }

        function getBody(printElement, settings) {
            var bodyHtml = '<body>' +
                               "<div class=\"printArea\" id=\"printArea\">" +
                                   "<div class='printToolbar'>" +
            // "<label>字体大小：</label>" +
            // "<select id=\"ddlFontSize\">" +
            //     "<option value=\"Largest\">最大</option>" +
            //     "<option value=\"Large\">较大</option>" +
            //     "<option value=\"Normal\">正常</option>" +
            //     "<option value=\"Small\">较小</option>" +
            //     "<option value=\"Smallest\">最小</option>" +
            // "</select>" +
                                        "<label>内容显示方向：</label>" +
                                        "<span name='divVertical'><input type='radio' name='printMode' value='vertical' /><label for='vertical'>竖向</label></span>" +
                                        "<span name='divHorizontal'><input type='radio' name='printMode' value='horizontal' /><label for='horizontal'>横向</label></span>" +
                                        '<span name="btnPrint"><img src="' + xlglobal.printimage+ '" align="absmiddle">打印</span>' +
            //"<input type='button' value='初始化' />" +
                                   "</div>" +
                                   "<div class='printContent'>";
            var p = $("<p/>");
            //            $("*[print='true']", printElement).each(function (i, ele) {
            //                if (ele instanceof jQuery) {
            //                    bodyHtml += p.empty().append(ele.clone());
            //                } else if (ele instanceof Object) {
            //                    bodyHtml += p.empty().append($(ele).clone());
            //                }
            //bodyHtml += p.empty().append($(ele).clone()).html();
            //            });
             bodyHtml+= fillContent(printElement).toString();
           
            delete (p);
            bodyHtml += "</div></div>";
            bodyHtml += "<input type='hidden' id='hdnDirection' value='" + Serialize(settings) + "' />";
            //bodyHtml += '<script type="text/javascript">' +
            //                'if (jQuery) {' +
            //                    'jQuery(document).ready(function(){' +
            //                        'var options = eval("[" + $("#hdnDirection").val() + "]");' +
            //                         //'$(".printToolbar :button").unbind().bind("click", function(e) {' +
            //                            '$(".printContent").printContainer(options[0]); ' +
            //                         //'});' +
            //                    '});' +
            //                '}'
            //            '</script>';
            bodyHtml += "</body>";

            return bodyHtml;
            //        return '<body><div class="' + $(printElement).attr("class") + '">' + $(printElement).html() + '</div></body>';
        }
        function fillContent(printElement, writeDoc) {
            var p = "";

            $("*[print='true']", printElement).each(function (i, ele) {
               var _tempStr = ele.outerHTML;
                p += _tempStr;
            });

            //content.append("<p>测试11111111</p>");
            return p;
        }
        function getFormData(ele) {
            $("input,select,textarea", ele).each(function () {
                // In cases where radio, checkboxes and select elements are selected and deselected, and the print
                // button is pressed between select/deselect, the print screen shows incorrectly selected elements.
                // To ensure that the correct inputs are selected, when eventually printed, we must inspect each dom element
                var tagName = $(this).prop("tagName").toLowerCase();
                if (tagName == "input") {
                    var type = $(this).attr("type");
                    if (type == "radio" || type == "checkbox") {
                        if ($(this).is(":not(:checked)")) this.removeAttribute("checked");
                        else this.setAttribute("checked", true);
                    }
                    else if (type == "text") {
                        this.setAttribute("value", $(this).val());
                    }
                }
                else if (tagName == "select")
                    $(this).find("option").each(function () {
                        if ($(this).is(":not(:selected)")) this.removeAttribute("selected");
                        else this.setAttribute("selected", true);
                    });
                else if (tagName == "textarea") {
                    var v = $(this).attr("value");
                    if ($.browser.mozilla) {
                        if (this.firstChild) this.firstChild.textContent = v;
                        else this.textContent = v;
                    }
                    else this.innerHTML = v;
                }
            });
            return ele;
        }

        function Iframe() {
            var frameId = settings.id;
            var iframeStyle = 'border:0;position:absolute;width:0px;height:0px;left:0px;top:0px;';
            var iframe;

            try {
                iframe = document.createElement('iframe');
                document.body.appendChild(iframe);
                $(iframe).attr({ style: iframeStyle, id: frameId, src: "" });
                iframe.doc = null;
                iframe.doc = iframe.contentDocument ? iframe.contentDocument : (iframe.contentWindow ? iframe.contentWindow.document : iframe.document);
            }
            catch (e) { throw e + ". iframes may not be supported in this browser."; }

            if (iframe.doc == null) throw "Cannot find document.";

            return iframe;
        }

        function Popup() {
            var windowAttr = "location=no,statusbar=no,directories=no,menubar=no,titlebar=no,toolbar=no,dependent=no";
            windowAttr += ",width=" + settings.popWd + ",height=" + settings.popHt;
            windowAttr += ",resizable=no,screenX=" + settings.popX + ",screenY=" + settings.popY + ",personalbar=no,scrollbars=yes";

            var newWin = window.open("", "_blank", windowAttr);

            newWin.doc = newWin.document;

            return newWin;
        }

        function getDPI() {
            var arrDPI = new Array();
            if (window.screen.deviceXDPI != undefined) {
                arrDPI[0] = window.screen.deviceXDPI;
                arrDPI[1] = window.screen.deviceYDPI;
            }
            else {
                var tmpNode = document.createElement("DIV");
                tmpNode.style.cssText = "width:1in;height:1in;position:absolute;left:0px;top:0px;z-index:99;visibility:hidden";
                document.body.appendChild(tmpNode);
                arrDPI[0] = parseInt(tmpNode.offsetWidth);
                arrDPI[1] = parseInt(tmpNode.offsetHeight);
                tmpNode.parentNode.removeChild(tmpNode);
            }
            return arrDPI;
        }
    };

    $.fn.printContainer = function (options, params) {
        if (typeof options == "string") {
            return $.fn.printContainer.methods[options](this, params);
        }

        options = options || {};
        return this.each(function () {
            var data = $.data(this, "printContainer");
            if (data) {
                // $.extend(data.options, options);
                return;
            } else {
                options.a4Size.width = parseFloat(options.a4Size.width);
                options.a4Size.height = parseFloat(options.a4Size.height);
                options.popClose = options.popClose.toString().toLowerCase() == "true";
                options.changeDirection = options.changeDirection.toString().toLowerCase() == "true";
                options.needZoom = options.needZoom.toString().toLowerCase() == "true";
                options.zoom = getPageZoom($(this));
                $.data(this, "printContainer", { options: options });
            }

            initialPrint($(this));
            replaceControl($(this));
            $(this).data("original", $(this).html());
            replaceStyle($(this));
            splitPages($(this));
            // changeFont($(this), options.fontSize);
            $(this).data(options.direction, $(this).html());
        });

        /*
        * replace input controls in the print docuemnt.
        */
        function replaceControl(container) {
            $(":text:visible", container).each(function () {
                $(this).after("<span>" + $(this).val() + "</span>");
                $(this).remove();
            });
            $(":radio, :checkbox", container).attr("disabled", "disabled");
            $("textarea:visible", container).each(function () {
                var text = $(this).val();
                var parent = $(this).parent();
                var paragragh;
                if (!text) {
                    parent.append("&nbsp;");
                }
                else {
                    var parts = text.split("\r\n");
                    $(parts).each(function (i, p) {
                        if (p.indexOf("\r") != -1) {
                            var rParts = p.split("\r");
                            $(rParts).each(function (j, rp) {
                                paragragh = $("<p class='textareaRow'></p>").html(rp);
                                paragragh.appendTo(parent);
                            });
                        }
                        else if (p.indexOf("\n") != -1) {
                            var nParts = p.split("\n");
                            $(nParts).each(function (k, np) {
                                paragragh = $("<p class='textareaRow'></p>").html(np);
                                paragragh.appendTo(parent);
                            });
                        }
                        else {
                            paragragh = $("<p class='textareaRow'></p>").html(p);
                            paragragh.appendTo(parent);
                        }
                    });
                }
                $(this).remove();
            });
            $("select:visible", container).each(function () {
                var displayText = "";
                $(":selected", $(this)).each(function (i, opt) {
                    displayText = $(opt).text();
                    return false;
                });
                $(this).parent().append(displayText);
                $(this).remove();
            });
            $("a", container).not(".processPic").each(function () {
                $(this).parent().append($(this).text());
                $(this).remove();
            });
            $(":hidden", container).not("#hdnDirection, col, colgroup, br").remove();
            $(".divContractPic", container).closest("tr").remove();
        }

        function replaceStyle(container) {
            var data = $(container).data("printContainer");
            var options = data.options;
            var zoom = options.direction == directions.horizontal ? options.zoom.horizontal : options.zoom.vertical;
            zoomPage(container, zoom);

            $("table", $(container)).each(function () {
                if ($(this).css("float") == "none") {
                    $(this).removeAttr("width").css("width", "100%");
                }
            });
            $("p div", $(container)).each(function () {
                if ($(this).css("float") == "none") {
                    $(this).removeAttr("width");
                }
            });

            //var printArea = $("#printArea");
            //var margin = printArea.parent().width() - printArea.outerWidth();
            //printArea.parent().css({ "padding-left": margin / 2, "padding-right": margin / 2 });
            //$(window).bind("resize", function () {
            //    margin = printArea.parent().width() - printArea.outerWidth();
            //    printArea.parent().css({ "padding-left": margin / 2, "padding-right": margin / 2 });
            //});
        }

        function zoomPage(container, zoom) {
            var data = $(container).data("printContainer");
            var options = data.options;

            if (zoom < 1 && options.needZoom) {
                $("table", $(container)).each(function () {
                    replaceTableColgroup($(this), zoom);
                    var oSize = $(this).css("font-size").replace("px", "");
                    $(this).css("font-size", oSize * zoom);
                });
                $(document.body).each(function () {
                    var oSize = $(this).css("font-size").replace("px", "");
                    $(this).css("font-size", oSize * zoom);
                });
            }

            function replaceTableColgroup(table, zoom) {
                var columns = [];
                var thead = table.children().filter("thead");
                if (thead && thead.length && thead.children().length) {
                    var startCells = {};
                    var firstRow = thead.children().first();
                    columns = getColumnsFromHead(0, firstRow, startCells, firstRow.children().length);
                }
                else {
                    columns = getColumnsFromBody(table);
                }

                var cols = [];
                var pageWidth = options.direction == directions.horizontal ? options.a4Size.height : options.a4Size.width;
                for (var i = 0; i < columns.length; i++) {
                    cols.push($("<col width=\"" + (columns[i].outerWidth() * zoom / pageWidth * 100) + "%\" />"));
                }
                table.children().filter("colgroup").remove();
                var colgroup = $("<colgroup></colgroup>").prependTo(table);
                for (var j = 0; j < cols.length; j++) {
                    colgroup.append(cols[j]);
                }
            }

            function getColumnsFromHead(level, tr, startCells, colspan) {
                var columns = [];
                startCells[level.toString()] = startCells[level] || 0;
                var currentAddColCount = 0;
                tr.children().slice(startCells[level.toString()]).each(function () {
                    if (currentAddColCount == colspan) {
                        return false;
                    }

                    if ($(this).attr("colspan") && parseInt($(this).attr("colspan")) > 1) {
                        var childColumns = getColumnsFromHead(level + 1, tr.next(), startCells, parseInt($(this).attr("colspan")));
                        columns.slice(columns.length, 0, childColumns);
                    }
                    else {
                        columns.push($(this));
                    }

                    startCells[level.toString()]++;
                    currentAddColCount++;
                });

                return columns;
            }

            function getColumnsFromBody(table) {
                var columns = [];

                table.children().filter("tbody").children().each(function () {
                    if ($(this).children().filter("[colspan]").length == 0) {
                        firstRow = $(this);
                        return false;
                    }
                });

                $(this).children().each(function () {
                    columns.push($(this));
                });

                return columns;
            }
        }

        function getPageZoom(container) {
            var maxWidth = 0;
            $("table", $(container)).each(function () {
                if ($(this).outerWidth() > maxWidth) {
                    maxWidth = $(this).outerWidth();
                }
            });

            if (maxWidth == 0) {
                return { horizontal: 1, vertical: 1 };
            }
            else {
                return { horizontal: options.a4Size.height / maxWidth, vertical: options.a4Size.width / maxWidth };
            }
        }

        /*
        * initialize handlers for user operations in the page.
        * for example: change the print direction or click the print button.
        */
        function initialPrint(container) {
            var data = $(container).data("printContainer");
            var options = data.options;
            var printToolbar = $(".printToolbar", $("#printArea"));
            // $(document.body).addClass(options.direction);
            $("#printArea").css("width", options.direction == directions.vertical ? options.a4Size.width : options.a4Size.height);
            $("*[print='true']", container).each(function () {
                $(this).show();
            });
            $("#ddlFontSize", printToolbar).val(options.fontSize);
            $("#ddlFontSize", printToolbar).unbind().bind("change", function () {
                changeFont($(container), $(this).val());
            });
            $("span[name='btnPrint']", printToolbar).unbind().bind("click", function (e) {
                window.print();

                if (options.mode == modes.popup && options.popClose) {
                    window.close();
                }
            });

            $(":radio[value='" + options.direction + "']", printToolbar).attr("checked", "checked");
            if (!options.changeDirection) {
                $(":radio", printToolbar).attr("disabled", "disabled");
            }
            else {
                $("span[name='divVertical']", printToolbar).unbind().bind("click", function (e) {
                    // $(document.body).removeClass("horizontal");
                    // $(document.body).addClass("vertical");
                    $("#printArea").css("width", options.a4Size.width);
                    options.direction = directions.vertical;
                    $(container).data("printContainer", data);
                    $(":radio[value='vertical']", printToolbar).attr("checked", "checked");
                    $(":radio[value='horizontal']", printToolbar).removeAttr("checked");
                    // $("table[for='datagrid']").datagrid("resize");
                    if (container.data(directions.vertical)) {
                        container.html(container.data(directions.vertical));
                    }
                    else {
                        container.html(container.data("original"));
                        replaceStyle(container);
                        splitPages(container);
                        // changeFont(container, options.fontSize);
                        container.data(directions.vertical, container.html());
                    }
                });
                $("span[name='divHorizontal']", printToolbar).unbind().bind("click", function (e) {
                    // $(document.body).removeClass("vertical");
                    // $(document.body).addClass("horizontal");
                    $("#printArea").css("width", options.a4Size.height);
                    options.direction = directions.horizontal;
                    $(container).data("printContainer", data);
                    $(":radio[value='horizontal']", printToolbar).attr("checked", "checked");
                    $(":radio[value='vertical']", printToolbar).removeAttr("checked");
                    // $("table[for='datagrid']").datagrid("resize");
                    if (container.data(directions.horizontal)) {
                        container.html(container.data(directions.horizontal));
                    }
                    else {
                        container.html(container.data("original"));
                        replaceStyle(container);
                        splitPages(container);
                        // changeFont(container, options.fontSize);
                        container.data(directions.horizontal, container.html());
                    }
                });
            }
        }

        /*
        * 分页处理
        */
        function splitPages(container) {
            var data = $(container).data("printContainer");
            var direction = data.options.direction;
            var pageHeight = direction == directions.vertical ? data.options.a4Size.height : data.options.a4Size.width;
            pageHeight -= 60;
            var lastPageTop = calculateTop(container);
            $("table", container).each(function (i, t) {
                splitTable(t);
            });

            function calculateBottom(element) {
                var top = $(element).offset().top;
                var scrollTop = $(element).scrollTop();
                var height = $(element).outerHeight(true);

                return (top + scrollTop + height);
            }

            function calculateTop(element) {
                var top = $(element).offset().top;
                var scrollTop = $(element).scrollTop();
                return top + scrollTop;
            }

            function needSplitPage(table, element) {
                var bottom = calculateBottom(element);
                var top = calculateTop(table);
                var spanPage = parseInt((top - lastPageTop) / pageHeight);
                var heightSpan = (bottom - lastPageTop) - pageHeight * spanPage;
                return heightSpan > pageHeight;
            }

            function splitTable(table) {
                var needSplit = needSplitPage(table, table);
                if (!needSplit) {
                    return;
                }

                // var firstChild = $(table).children().first();
                if ($(table).children().length == 0) {
                    return;
                }

                var colgroup = $(table).children().filter("colgroup");
                var thead = $(table).children().filter("thead");
                var tbody = $(table).children().filter("tbody");
                // if (firstChild.prop("tagName").toLowerCase() == "thead") {
                //     thead = firstChild;
                //     tbody = firstChild.next("tbody");
                // }
                // else if (firstChild.prop("tagName").toLowerCase() == "tbody") {
                //     tbody = firstChild;
                // }

                if (tbody == null) {
                    return;
                }

                var cloneTable = $(table).clone(false, false).empty();
                if (colgroup.length) {
                    cloneTable.append(colgroup.clone());
                }
                if (thead.length) {
                    cloneTable.append(thead.clone());
                }
                var cloneTBody = $("<tbody></tbody>").appendTo(cloneTable);

                var currentRow = tbody.children("tr").first();
                var currentRowIndex = 0;
                while (currentRow && currentRow.length) {
                    if (currentRow.attr("repeatPerPage") == "true") {// 每页都需要重复显示的行
                        cloneTBody.append(currentRow.clone());
                    }
                    needSplit = needSplitPage(table, currentRow);
                    if (needSplit) {// 如果需要分页，则将该行移入下一页的表格中显示。
                        break;
                    }

                    currentRow = currentRow.next("tr");
                    currentRowIndex++;
                }

                if (currentRowIndex == 0) {
                    $(splitHtml).insertBefore($(table));
                    var pagination = $(paginationHtml).insertBefore($(table));
                    lastPageTop = calculateBottom(pagination);
                    splitTable($(table));
                }
                else if (currentRow && currentRow.length) {
                    while (currentRow && currentRow.length) {
                        cloneTBody.append(currentRow.clone());
                        var nextRow = currentRow.next("tr");
                        currentRow.remove();
                        currentRow = nextRow;
                    }

                    var pagination = $(paginationHtml).insertAfter($(table));
                    $(splitHtml).insertBefore(pagination);
                    cloneTable.insertAfter(pagination);
                    lastPageTop = calculateBottom(pagination);

                    splitTable(cloneTable);
                }
            }
        }

        function changeFont(jq, fontSize) {
            var data = $(jq).data("printContainer");
            var options = data.options;
            options.fontSize = fontSize;
            $(jq).data("printContainer", data);

            changeElementFont($(document.body), fontSize);
            $("table", $(jq)).each(function () {
                changeElementFont($(this), fontSize);
            });

            function changeElementFont(elem, fontSize) {
                var increateSize = fontSizes[fontSize];
                var originalsize = $(elem).data("originalsize");
                if (typeof originalsize == "undefined") {
                    originalsize = parseFloat($(elem).css("font-size").replace("px", ""));
                    $(elem).data("originalsize", originalsize);
                }
                $(elem).css("font-size", originalsize + increateSize);
            }
        }

        $.fn.printContainer.methods = {
            changeFont: function (jq, fontSize) {
                return jq.each(function () {
                    changeFont(jq, fontSize);
                });
            }
        };
    };
})(jQuery);