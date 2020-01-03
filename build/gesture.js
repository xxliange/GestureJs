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

  var HandlerAdmin = function () {
      function HandlerAdmin(el) {
          classCallCheck(this, HandlerAdmin);

          this.handlers = [];
          this.el = el;
      }

      createClass(HandlerAdmin, [{
          key: 'add',
          value: function add(handler) {
              // 添加回调函数
              this.handlers.push(handler);
          }
      }, {
          key: 'del',
          value: function del(handler) {
              // 删除回调函数
              if (!handler) this.handlers = [];
              for (var i = this.handlers.length; i >= 0; i--) {
                  if (this.handlers[i] === handler) {
                      this.handlers.splice(i, 1);
                  }
              }        }
      }, {
          key: 'dispatch',
          value: function dispatch() {
              // 执行回调函数
              for (var i = 0, len = this.handlers.length; i < len; i++) {
                  var handler = this.handlers[i];
                  if (typeof handler === 'function') handler.apply(this.el, arguments);
              }
          }
      }]);
      return HandlerAdmin;
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
      }, {
          key: 'wrapFunc',
          value: function wrapFunc(el, handler) {
              var handlerAdmin = new HandlerAdmin(el);
              handlerAdmin.add(handler);
              return handlerAdmin;
          }
      }]);
      return DomElement;
  }();

  // new一个对象


  function $(selector) {
      return new DomElement(selector);
  }

  var Gesture = function () {
      function Gesture(target, option) {
          classCallCheck(this, Gesture);

          this.target = target instanceof HTMLElement ? target : typeof target === 'string' ? document.querySelector(target) : null;
          if (!this.target) {
              throw new Error('请绑定元素!');
          }        this._init();
          this._touch = this._touch.bind(this);
          this._move = this._move.bind(this);
          this._end = this._end.bind(this);
          this._cancel = this._cancel.bind(this);
          this.target.addEventListener('touchstart', this._touch.bind(this), false);
          this.target.addEventListener('touchmove', this._move.bind(this), false);
          this.target.addEventListener('touchend', this._end.bind(this), false);
          this.target.addEventListener('touchcancel', this._cancel.bind(this), false);

          this.preV = { x: null, y: null };
          this.isDoubleTap = false;

          this.params = {};
          this.touch = {
              startX: null,
              startY: null,
              moveX: null,
              moveY: null,
              startTime: null,
              deltaTime: null,
              lastTime: null
          }; //记录刚触摸的手指
          this.movetouch = {}; //记录移动过程中变化的手指参数
          this.pretouch = {}; //由于会触及到双击, 需要一个记录上一次触摸的对象
          this.longTapTimeout = this.singleTapTimeout = null; //用于触发长按的定时器
          this.tapTimeout = null; //用于触发点击的定时器
          this.handles = {}; //用于存放回调函数的对象
          this.preTapPostion = { x: null, y: null };

          var noop = function noop() {};

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
              this.touch.startTime = now;
              this.touch.deltaTime = this.touch.startTime - (this.touch.lastTime || this.touch.startTime);
              this.touchStart.dispatch(e, this.target);

              // 双击
              if (this.preTapPostion.x !== null) {
                  /**
                   * 判断是否是双击
                   * 
                   * 1,点击的时间必须是大于0秒 小于 250秒
                   * 
                   * 2,移动的距离 x 小于 30 y 小于 30
                   * 
                   */
                  this.isDoubleTap = this.touch.deltaTime > 0 && this.touch.deltaTime < 250 && Math.abs(this.preTapPostion.x - this.touch.startX) < 30 && Math.abs(this.preTapPostion.y - this.touch.startY) < 30;
                  // 如果是双击
                  if (this.isDoubleTap) {
                      // 取消单击
                      this._cancelSingleTap();
                  }
              }

              // 移动的距离
              this.preTapPostion.x = this.touch.startX;
              this.preTapPostion.y = this.touch.startY;
              this.touch.lastTime = this.touch.startTime;
              var preV = this.preV,
                  len = e.touches.length;
              if (len > 1) {
                  this._cancelLongTap();
                  this._cancelSingleTap();
                  var v = { x: e.touches[1].pageX - this.touch.startX, y: e.touches[1].pageY - this.touch.startY };
                  console.log(v);
              }
              this._preventTap = false;

              // 长按逻辑
              this.longTapTimeout = setTimeout(function () {
                  _this.longTap.dispatch(e, _this.target);
                  _this._preventTap = true;
              }, 750);
          }
      }, {
          key: '_move',
          value: function _move(e) {
              if (!e.touches) return;
              var preV = this.preV,
                  len = e.touches.length,
                  currentX = e.touches[0].pageX,
                  currentY = e.touches[0].pageY;
              this.isDoubleTap = false;
              if (this.touch.moveX !== null) {
                  e.deltaX = currentX - this.touch.moveX;
                  e.deltaY = currentY - this.touch.moveY;

                  var movedX = Math.abs(this.touch.startX - this.touch.moveX),
                      movedY = Math.abs(this.touch.startY - this.touch.moveY);
                  if (movedX > 10 || movedY > 10) {
                      this._preventTap = true;
                  }
              } else {
                  e.deltaX = 0;
                  e.deltaY = 0;
              }

              this.pressMove.dispatch(e, this.target);
              this.touchMove.dispatch(e, this.target);
              this._cancelLongTap();
              this.touch.moveX = currentX;
              this.touch.moveY = currentY;

              if (len > 1) {
                  e.preventDefault();
              }
          }
      }, {
          key: '_end',
          value: function _end(e) {
              var _this2 = this;

              if (!e.changedTouches) return;
              this._cancelLongTap();
              // 多指操作
              if (e.touches.length < 2) {
                  this.sx2 = this.sy2 = null;
              }

              // 如果移动的距离超过了30
              if (this.touch.moveX && Math.abs(this.touch.startX - this.touch.moveX) > 30 || this.touch.moveY && Math.abs(this.touch.startY - this.touch.moveY) > 30) {
                  var deltaX = ~~((this.touch.moveX || 0) - this.touch.startX),
                      deltaY = ~~((this.touch.moveY || 0) - this.touch.startY);
                  if (Math.abs(deltaX) < Math.abs(deltaY)) {
                      if (deltaY < 0) {
                          this.pressUp.dispatch(e, this.target);
                      } else {
                          this.pressDown.dispatch(e, this.target);
                      }
                  } else {
                      if (deltaX < 0) {
                          this.pressLeft.dispatch(e, this.target);
                      } else {
                          this.pressRight.dispatch(e, this.target);
                      }
                  }
              } else {
                  // 如果移动的距离没有超过30 则判断是单击 双击
                  this.tapTimeout = setTimeout(function () {
                      if (!_this2._preventTap) {
                          // 单次点击
                          _this2.tap.dispatch(e, _this2.target);
                      }
                      // 双击
                      if (_this2.isDoubleTap) {
                          _this2.doubleTap.dispatch(e, _this2.target);
                          _this2.isDoubleTap = false;
                      }
                  }, 0);

                  if (!this.isDoubleTap) {
                      this.singleTapTimeout = setTimeout(function () {
                          _this2.singleTap.dispatch(e, _this2.target);
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
      }, {
          key: '_cancelLongTap',
          value: function _cancelLongTap() {
              clearTimeout(this.longTapTimeout);
          }
      }, {
          key: '_cancelSingleTap',
          value: function _cancelSingleTap() {
              clearTimeout(this.singleTapTimeout);
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
                      // 如果回调的是函数类型 则执行回调函数
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
      }, {
          key: 'destroy',
          value: function destroy() {
              // 清空定时器
              if (this.singleTapTimeout) clearTimeout(this.singleTapTimeout);
              if (this.longTapTimeout) clearTimeout(this.longTapTimeout);
              if (this.tapTimeout) clearTimeout(this.tapTimeout);

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
