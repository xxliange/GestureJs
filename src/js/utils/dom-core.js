// 创建对象
class DomElement {
    constructor(selector){
    }
    isTarget(obj, selector){
        while(obj != undefined && obj != null && obj.tagName.toUpperCase() != 'BODY'){
            if(obj.matches(selector)){
                return obj;
            }
            obj = obj.parentNode;
        }
        return null;
    }
}

// new一个对象
function $ (selector){
    return new DomElement(selector);
}
export default $;