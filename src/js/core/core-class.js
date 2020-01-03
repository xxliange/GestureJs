import $ from './../utils/dom-core.js';
const ABS = Math.abs;

class Gesture{
    constructor(target, selector){
        this.target = target instanceof HTMLElement ? target : typeof target === 'string' ? document.querySelector(target) : null;
        if(!this.target) {
            throw new Error('请绑定元素!');
        };
        this._init();
        this.selector = selector;
        this.target.addEventListener('touchstart', this._touch.bind(this), false);
        this.target.addEventListener('touchmove', this._move.bind(this), false);
        this.target.addEventListener('touchend', this._end.bind(this), false);
        this.target.addEventListener('touchcancel', this._cancel.bind(this), false);

        this.params = {};
        this.touch = {}; //记录刚触摸的手指
        this.movetouch = {}; //记录移动过程中变化的手指参数
        this.pretouch = {}; //由于会触及到双击, 需要一个记录上一次触摸的对象
        this.longTapTimeout = null; //用于触发长按的定时器
        this.tapTimeout = null ; //用于触发点击的定时器
        this.doubleTap = false; //用于记录是否执行双击的定时器
        this.handles = {}; //用于存放回调函数的对象

    }
    _touch(e){
        this.e = e.target;
        const point  = e.touches ? e.touches[0] : e;
        const now = Date.now();

        // 记录手指位置等参数
        this.touch.startX = point.pageX;
        this.touch.startY = point.pageY;
        this.touch.starTime = now;

        // 由于会有多次触摸的情况, 单击事件和双击针对单次触摸 故先清空定时器
        this.longTapTimeout && clearTimeout(this.longTapTimeout);
        this.tapTimeout && clearTimeout(this.tapTimeout);
        this.doubleTap = false;
        this._emit('touch', e); //执行原生的touchstart回调 _emit为执行的方法 后面定义
        if(e.touches.length > 1){
            // 处理多个手指触摸的情况
        }else{
            this.longTapTimeout = setTimeout(() => {
                this._emit('longtap'); //执行长按回调
                this.doubleTap = false;
                e.preventDefault();
            }, 800);
            this.doubleTap = this.pretouch.time && now - this.pretouch.time < 300 && ABS(this.touch.startX -this.pretouch.startX) < 30  && ABS(this.touch.startY - this.pretouch.startY) < 30 && ABS(this.touch.startTime - this.pretouch.time) < 300; 
            this.pretouch = {
                startX:this.touch.startX,
                startY:this.touch.startY,
                time : this.touch.startTime
            };
        }
    }

    _move(){
        
    }

    _end(){
        this.longTapTimeout && clearTimeout(this.longTapTimeout);

    }

    _cancel(){
        console.log('cancle')
    }

    _emit(type, e){
        !this.handles[type] && (this.handles[type] = []);
        const currentTarget = $().isTarget(this.e, this.selector);
        if(currentTarget || !this.selector){
            this.selector && (this.params.selector = currentTarget);
            for(let i = 0 , len = this.handles[type].length ; i<len;i++){
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
}

export default Gesture;