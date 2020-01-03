import Gesture from './core/core-class';

try{
    document
}catch(ex){
    throw new Error('请在浏览器环境下运行');
}

const inlinecss = '__INLINE_CSS__';
let style = document.createElement('style');
style.type = 'text/css';
style.innerHTML = inlinecss;
document.getElementsByTagName('HEAD').item(0).appendChild(style);

export default (window.Gesture || Gesture);