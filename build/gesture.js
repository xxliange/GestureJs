(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.GestureJs = factory());
}(this, (function () { 'use strict';

  var classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  var createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  // 创建对象
  var DomElement = function () {
      function DomElement(selector) {
          classCallCheck(this, DomElement);
      }

      createClass(DomElement, [{
          key: 'isTarget',
          value: function isTarget(obj, selector) {
              while (obj != undefined && obj != null && obj.tagName.toUpperCase() != 'BODY') {
                  if (obj.matches(selector)) {
                      return obj;
                  }
                  obj = obj.parentNode;
              }
              return null;
          }
      }]);
      return DomElement;
  }();

  // new一个对象


  function $(selector) {
      return new DomElement(selector);
  }

  var ABS = Math.abs;

  var Gesture = function () {
      function Gesture(target, selector) {
          classCallCheck(this, Gesture);

          this.target = target instanceof HTMLElement ? target : typeof target === 'string' ? document.querySelector(target) : null;
          if (!this.target) {
              throw new Error('请绑定元素!');
          }        this._init();
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
          this.tapTimeout = null; //用于触发点击的定时器
          this.doubleTap = false; //用于记录是否执行双击的定时器
          this.handles = {}; //用于存放回调函数的对象
      }

      createClass(Gesture, [{
          key: '_touch',
          value: function _touch(e) {
              var _this = this;

              this.e = e.target;
              var point = e.touches ? e.touches[0] : e;
              var now = Date.now();

              // 记录手指位置等参数
              this.touch.startX = point.pageX;
              this.touch.startY = point.pageY;
              this.touch.starTime = now;

              // 由于会有多次触摸的情况, 单击事件和双击针对单次触摸 故先清空定时器
              this.longTapTimeout && clearTimeout(this.longTapTimeout);
              this.tapTimeout && clearTimeout(this.tapTimeout);
              this.doubleTap = false;
              this._emit('touch', e); //执行原生的touchstart回调 _emit为执行的方法 后面定义
              if (e.touches.length > 1) ; else {
                  this.longTapTimeout = setTimeout(function () {
                      _this._emit('longtap'); //执行长按回调
                      _this.doubleTap = false;
                      e.preventDefault();
                  }, 800);
                  this.doubleTap = this.pretouch.time && now - this.pretouch.time < 300 && ABS(this.touch.startX - this.pretouch.startX) < 30 && ABS(this.touch.startY - this.pretouch.startY) < 30 && ABS(this.touch.startTime - this.pretouch.time) < 300;
                  this.pretouch = {
                      startX: this.touch.startX,
                      startY: this.touch.startY,
                      time: this.touch.startTime
                  };
              }
          }
      }, {
          key: '_move',
          value: function _move() {}
      }, {
          key: '_end',
          value: function _end() {
              this.longTapTimeout && clearTimeout(this.longTapTimeout);
          }
      }, {
          key: '_cancel',
          value: function _cancel() {
              console.log('cancle');
          }
      }, {
          key: '_emit',
          value: function _emit(type, e) {
              !this.handles[type] && (this.handles[type] = []);
              var currentTarget = $().isTarget(this.e, this.selector);
              if (currentTarget || !this.selector) {
                  this.selector && (this.params.selector = currentTarget);
                  for (var i = 0, len = this.handles[type].length; i < len; i++) {
                      typeof this.handles[type][i] === 'function' && this.handles[type][i](e, this.params);
                  }
              }
              return true;
          }
      }, {
          key: 'on',
          value: function on(type, callback) {
              !this.handles[type] && (this.handles[type] = []);
              this.handles[type].push(callback);
              return this;
          }
      }, {
          key: '_init',
          value: function _init() {
              this.touch = {};
              this.movetouch = {};
              this.params = { zoom: 1, deltaX: 0, deltaY: 0, diffX: 0, diffY: 0, angle: 0, direction: '' };
          }
      }]);
      return Gesture;
  }();

  try {
      document;
  } catch (ex) {
      throw new Error('请在浏览器环境下运行');
  }

  var inlinecss = 'body{    width: 100%;    height: 100vh;    background: #f7c695;}div{    width: 100px;    height: 100px;    border-radius: 100%;    background: #fff;}';
  var style = document.createElement('style');
  style.type = 'text/css';
  style.innerHTML = inlinecss;
  document.getElementsByTagName('HEAD').item(0).appendChild(style);

  var gesture = window.Gesture || Gesture;

  return gesture;

})));
