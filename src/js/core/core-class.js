import $ from './../utils/dom-core.js';

class Gesture{
    constructor(target, option){
        this.target = target instanceof HTMLElement ? target : typeof target === 'string' ? document.querySelector(target) : null;
        if(!this.target) {
            throw new Error('请绑定元素!');
        };
        this._touch = this._touch.bind(this);
        this._move = this._move.bind(this);
        this._end = this._end.bind(this);
        this._cancel = this._cancel.bind(this);
        this.target.addEventListener('touchstart', this._touch.bind(this), false);
        this.target.addEventListener('touchmove', this._move.bind(this), false);
        this.target.addEventListener('touchend', this._end.bind(this), false);
        this.target.addEventListener('touchcancel', this._cancel.bind(this), false);

        this.preV = {x:null, y:null};
        this.isDoubleTap = false;
        this.isLongTap = false;

        this.params = {};
        this.touch = {
            startX:null,
            startY:null,
            moveX:null,
            moveY:null,
            diffX:null,
            startTime:null,
            deltaTime:null,
            lastTime:null,
        }; //记录刚触摸的手指
        this.movetouch = {}; //记录移动过程中变化的手指参数
        this.pretouch = {}; //由于会触及到双击, 需要一个记录上一次触摸的对象
        this.longTapTimeout = this.singleTapTimeout = null; //用于触发长按的定时器
        this.tapTimeout = null ; //用于触发点击的定时器
        this.handles = {}; //用于存放回调函数的对象
        this.preTapPostion = {x:null, y:null};

        const noop = () =>{};

        this.touchStart = $().wrapFunc(this.target, option.touchStart || noop);
        this.touchMove = $().wrapFunc(this.target, option.touchMove || noop);
        this.touchCancel = $().wrapFunc(this.target, option.touchCancel || noop);
        this.touchEnd = $().wrapFunc(this.target, option.touchEnd || noop);
        this.singleTap = $().wrapFunc(this.target, option.singleTap || noop);
        this.longTap = $().wrapFunc(this.target, option.longTap || noop);
        this.doubleTap = $().wrapFunc(this.target, option.doubleTap || noop);
        this.tap = $().wrapFunc(this.target, option.tap || noop);
        this.pressMove = $().wrapFunc(this.target, option.pressMove || noop);
        this.pressUp = $().wrapFunc(this.target, option.pressUp || noop);
        this.pressDown = $().wrapFunc(this.target, option.pressDown || noop);
        this.pressLeft = $().wrapFunc(this.target, option.pressLeft || noop);
        this.pressRight = $().wrapFunc(this.target, option.pressRight || noop);

    }
    _touch(e){
        this.e = e.target;
        const point  = e.touches ? e.touches[0] : e;
        const now = Date.now();

        // 记录手指位置等参数
        this.touch.startX = point.pageX;
        this.touch.startY = point.pageY;
        this.touch.startTime = now;
        this.touch.deltaTime = this.touch.startTime - (this.touch.lastTime || this.touch.startTime);
        this.touchStart.dispatch(e, this.target);

        // 双击
        if(this.preTapPostion.x !== null){
            /**
             * 判断是否是双击
             * 
             * 1,点击的时间必须是大于0秒 小于 250秒
             * 
             * 2,移动的距离 x 小于 30 y 小于 30
             * 
             */
            this.isDoubleTap = (this.touch.deltaTime > 0 && this.touch.deltaTime < 250 && Math.abs(this.preTapPostion.x - this.touch.startX) < 30 && Math.abs(this.preTapPostion.y - this.touch.startY) < 30);
            // 如果是双击
            if(this.isDoubleTap){
                // 取消单击
                this._cancelSingleTap();
            }
        }

        // 移动的距离
        this.preTapPostion.x = this.touch.startX;
        this.preTapPostion.y = this.touch.startY;
        this.touch.lastTime = this.touch.startTime;
        let preV = this.preV,
            len = e.touches.length;
        if(len > 1){
            this._cancelLongTap();
            this._cancelSingleTap();
            const v = {x: e.touches[1].pageX - this.touch.startX, y:e.touches[1].pageY - this.touch.startY};
            console.log(v);
        }
        this._preventTap = false;

        // 长按逻辑
        this.isLongTap = false;
        this.longTapTimeout = setTimeout(() => {
            this.longTap.dispatch(e, this.target);
            this._preventTap = true;
            this.isLongTap = true;
        }, 750);
    }

    _move(e){
        if(!e.touches) return;
        let preV = this.preV,
            len = e.touches.length,
            currentX = e.touches[0].pageX,
            currentY = e.touches[0].pageY;
        this.isDoubleTap = false;
        if(this.touch.moveX !== null){
            e.deltaX = currentX - this.touch.moveX;
            e.deltaY = currentY - this.touch.moveY;
            this.touch.diffX = e.deltaX;
            const movedX = Math.abs(this.touch.startX - this.touch.moveX),
                movedY = Math.abs(this.touch.startY - this.touch.moveY);
                if(movedX > 10 || movedY > 10){
                    this._preventTap = true;
                }
        }else {
            e.deltaX = 0;
            e.deltaY = 0;
        }

        this.pressMove.dispatch(e, this.target);
        this.touchMove.dispatch(e, this.target);
        this._cancelLongTap();
        this.touch.moveX = currentX;
        this.touch.moveY = currentY;

        if(len > 1){
            e.preventDefault();
        }
    }

    _end(e){
        e.preventDefault();
        if(!e.changedTouches) return;
        this._cancelLongTap();
        // 多指操作
        if(e.touches.length < 2){
            this.sx2 = this.sy2 = null;
        }


        // 如果移动的距离超过了30
        if((this.touch.moveX && Math.abs(this.touch.startX - this.touch.moveX) > 30) || (this.touch.moveY && Math.abs(this.touch.startY - this.touch.moveY) > 30)){
            const deltaX = ~~((this.touch.moveX || 0) - this.touch.startX),
                deltaY = ~~((this.touch.moveY || 0) - this.touch.startY);
            if(Math.abs(deltaX) < Math.abs(deltaY)){
                if(deltaY < 0){
                    this.pressUp.dispatch(e, this.target);
                }else{
                    this.pressDown.dispatch(e, this.target);
                }
            }else{
                const {diffX} = this.touch;
                e.diffX = diffX;
                if(deltaX < 0){
                    this.pressLeft.dispatch(e, this.target);
                }else{
                    this.pressRight.dispatch(e, this.target);
                }
                
            }
        }else{
            // 如果移动的距离没有超过30 则判断是单击 双击
            this.tapTimeout = setTimeout(() => {
                if(!this._preventTap){
                    // 单次点击
                    this.tap.dispatch(e, this.target);
                }
                // 双击
                if(this.isDoubleTap){
                    this.doubleTap.dispatch(e, this.target);
                    this.isDoubleTap = false;
                }
            }, 0);
    
            if(!this.isDoubleTap && !this.isLongTap){
                this.singleTapTimeout = setTimeout(() => {
                    this.singleTap.dispatch(e, this.target);
                }, 250);
            }
        }


        this.touchEnd.dispatch(e, this.target);
        this.preV.x = 0;
        this.preV.y = 0;
        this.touch.startX = null;
        this.touch.startY = null;
        this.touch.moveX = null;
        this.touch.moveY = null;

    }

    _cancelLongTap(){
        clearTimeout(this.longTapTimeout);
    }

    _cancelSingleTap(){
        clearTimeout(this.singleTapTimeout);
    }


    _emit(type, e){
        !this.handles[type] && (this.handles[type] = []);
        const currentTarget = $().isTarget(this.e, this.selector);
        if(currentTarget || !this.selector){
            this.selector && (this.params.selector = currentTarget);
            for(let i = 0 , len = this.handles[type].length ; i<len;i++){
                // 如果回调的是函数类型 则执行回调函数
                typeof this.handles[type][i] === 'function' && this.handles[type][i](e, this.params);
            }
        }
        return true;
    }

    on(type, callback){
        !this.handles[type] && (this.handles[type] = [])
        this.handles[type].push(callback);
        return this; 
        
    }

    _init(){
        this.touch = {};
        this.movetouch = {};
        this.params = {zoom:1, deltaX:0, deltaY:0, diffX:0, diffY:0, angle:0, direction:''};
    }

    cancelAll(){
        this._preventTap = true;
        clearTimeout(this.singleTapTimeout);
        clearTimeout(this.longTapTimeout);
        clearTimeout(this.tapTimeout);
    }

    _cancel(e){
        this.cancelAll();
        this.touchCancel.dispatch(e, this.target);
    }

    destroy(){
        // 清空定时器
        if(this.singleTapTimeout) clearTimeout(this.singleTapTimeout);
        if(this.longTapTimeout) clearTimeout(this.longTapTimeout);
        if(this.tapTimeout) clearTimeout(this.tapTimeout);

        this.target.removeEventListener('touchstart', this._touch);
        this.target.removeEventListener('touchmove', this._move);
        this.target.removeEventListener('touchend', this._end);
        this.target.removeEventListener('touchcancel', this._cancel);

        this.touchStart.del();
        this.touchMove.del();
        this.touchCancel.del();
        this.touchEnd.del();
        this.singleTap.del();
        this.longTap.del();
        this.doubleTap.del();
        this.tap.del();

        return null;



    }
}

export default Gesture;