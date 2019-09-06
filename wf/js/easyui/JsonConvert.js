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