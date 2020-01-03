class HandlerAdmin {
    constructor(el){
        this.handlers = [];
        this.el = el;
    }

    add(handler){
        // 添加回调函数
        this.handlers.push(handler);
    }

    del(handler){
        // 删除回调函数
        if(!handler) this.handlers = [];
        for(let i = this.handlers.length;i>=0;i--){
            if(this.handlers[i] === handler){
                this.handlers.splice(i, 1);
            }
        };
    }

    dispatch(){
        // 执行回调函数
        for(let i=0, len = this.handlers.length; i<len; i++){
            const handler = this.handlers[i];
            if(typeof handler === 'function') handler.apply(this.el, arguments);
        }
    }
};

export default HandlerAdmin;