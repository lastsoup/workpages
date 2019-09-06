// QQ表情插件
(function($){  
	$.fn.qqFace = function(options){
		var defaults = {
			id : 'defaultfacebox',
			path : 'face/',
			assign : 'content',
			tip : 'em_',
            count:75,
            extension:".gif",
            prefix:"",
            parentel:null,
            rowcount:15
		};
		var option = $.extend(defaults, options);
		var assign = $('#'+option.assign);
		var id = option.id;
		var path = option.path;
		var tip = option.tip;
        var count=option.count;
        var rowcount=option.rowcount;
        var colcount=option.colcount;
        var extension=option.extension;
        var prefix=option.prefix;
        var parentel=option.parentel;
        var mode=option.mode;
		if(assign.length<=0){
			alert('缺少表情赋值对象。');
			return false;
		}
		var el=$(this);
		el.click(function(e){
			var strFace, labFace,destel,strdiff;
            var facepageClass=mode==0?"":"pagination-wrap"
            if(parentel!=null)
            {
                destel=parentel.find("." + id);
                strdiff='<div style="position:absolute;display:none;z-index:1000;" class="qqFace ' + id + ' '+facepageClass+'">';
            }else
            {
                destel=$('#'+id);
                strdiff='<div id="'+id+'" style="position:absolute;display:none;z-index:1000;" class="qqFace'+facepageClass+'">';
            }
            if (destel.length <= 0) {
                if(mode==0) {
                    strFace = strdiff + '<table border="0" cellspacing="0" cellpadding="0"><tr>';
                    for (var i = 1; i <= count; i++) {
                        labFace = '[' + tip + i + ']';
                        strFace += '<td><img src="' + path + prefix + i + extension + '" onclick="$(\'#' + option.assign + '\').setCaret();$(\'#' + option.assign + '\').insertAtCaret(\'' + labFace + '\',\'' + id + '\');" /></td>';
                        if (i % rowcount == 0) strFace += '</tr><tr>';
                    }
                    strFace += '</tr></table></div>';

                }else
                {
                    var pagenumber='<div class="paging_full_numbers"> <a class="paginate_button first disabled">&nbsp;</a><a class="paginate_button previous disabled">&nbsp;</a>'+
                        '<span></span><a class="paginate_button next">&nbsp;</a><a class="paginate_button last">&nbsp;</a></div>';
                    strFace = strdiff + '<table border="0" cellspacing="0" cellpadding="0"></table>'+pagenumber+'</div>';
                }
            }
            el.parent().append(strFace);
            if(parentel!=null)
                destel=parentel.find("." + id);
            else
                destel=$('#'+id);
            //分页表情
            if(mode!=0)
            {
                var arrayface=[];
                var child=[];
                var totalrow=Math.ceil(count/colcount);
                for(var i =0; i < totalrow; i++)
                {
                    child=[];
                    for(var j=1;j<=colcount;j++)
                    {
                        var index=i*colcount+j;
                        if(index>count)
                        break;
                        child.push(index);
                    }
                    arrayface.push(child);
                }
                destel.find("table").pagination({
                    data: arrayface,
                    ellipsislenght:5,
                    onepagehide:true,
                    createDetail:function (el, item, index) {
                        var tr = '<tr>';
                        for (var index = 0; index < item.length; index++) {
                            var i=item[index];
                            labFace = '[' + tip + i + ']';
                            tr += '<td><img src="' + path + prefix + i + extension + '" onclick="$(\'#' + option.assign + '\').setCaret();$(\'#' + option.assign + '\').insertAtCaret(\'' + labFace + '\',\'' + id + '\');" /></td>';

                        }
                        tr+='</tr>';
                        el.append(tr);
                    },
                    pageSize: rowcount
                });
            }
            //定位
			var offset = el.position();
			var top = offset.top + el.outerHeight();
            destel.css('top',top).css('left',offset.left).show();
			e.stopPropagation();
		});
		/*$(document).click(function(e){
                $('#' + id).hide();
                $('#' + id).remove();
		});*/
	};

})(jQuery);

jQuery.extend({ 
unselectContents: function(){ 
	if(window.getSelection) 
		window.getSelection().removeAllRanges(); 
	else if(document.selection) 
		document.selection.empty(); 
	} 
}); 
jQuery.fn.extend({ 
	selectContents: function(){ 
		$(this).each(function(i){ 
			var node = this; 
			var selection, range, doc, win; 
			if ((doc = node.ownerDocument) && (win = doc.defaultView) && typeof win.getSelection != 'undefined' && typeof doc.createRange != 'undefined' && (selection = window.getSelection()) && typeof selection.removeAllRanges != 'undefined'){ 
				range = doc.createRange(); 
				range.selectNode(node); 
				if(i == 0){ 
					selection.removeAllRanges(); 
				} 
				selection.addRange(range); 
			} else if (document.body && typeof document.body.createTextRange != 'undefined' && (range = document.body.createTextRange())){ 
				range.moveToElementText(node); 
				range.select(); 
			} 
		}); 
	}, 

	setCaret: function(){ 
		if(!$.browser.msie) return; 
		var initSetCaret = function(){ 
			var textObj = $(this).get(0); 
			textObj.caretPos = document.selection.createRange().duplicate(); 
		}; 
		$(this).click(initSetCaret).select(initSetCaret).keyup(initSetCaret);
	}, 

	insertAtCaret: function(textFeildValue,id){
		var textObj = $(this).get(0); 
		if(document.all && textObj.createTextRange && textObj.caretPos){ 
			var caretPos=textObj.caretPos; 
			caretPos.text = caretPos.text.charAt(caretPos.text.length-1) == '' ? 
			textFeildValue+'' : textFeildValue; 
		} else if(textObj.setSelectionRange){ 
			var rangeStart=textObj.selectionStart; 
			var rangeEnd=textObj.selectionEnd; 
			var tempStr1=textObj.value.substring(0,rangeStart); 
			var tempStr2=textObj.value.substring(rangeEnd); 
			textObj.value=tempStr1+textFeildValue+tempStr2; 
			textObj.focus(); 
			var len=textFeildValue.length; 
			textObj.setSelectionRange(rangeStart+len,rangeStart+len); 
			textObj.blur(); 
		}else{ 
			textObj.value+=textFeildValue; 
		}
        $('#' + id).hide();
        $('#' + id).remove();
        $('.emotiontab').hide();
	} 
});