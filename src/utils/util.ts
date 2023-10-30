/**
 * 页面滚动
 * @param binding 绑定指令的参数
 */
function scrollCall(binding: any): void {
  // 底部预留距离
  const height = Number(binding.arg) || 50 
  // 滚动部分高度兼容 IE Chrome
  const windowTop = document.body.scrollTop || document.documentElement.scrollTop; 
  // 浏览器所有内容高度 - 滚动部分高度
  const contentHeight = document.documentElement.scrollHeight - windowTop;
  // 可见区域高度 + 预留距离
  const seeHeight = document.documentElement.clientHeight + height;
  // 是否触底
  const isBottom = contentHeight <= seeHeight;
  // 绑定回调函数参数值
  isBottom ? binding.value(true) : binding.value(false);
}

/**
* 节流
* @param fn 方法
* @param wait 延时时间
* @returns 
*/
function throttle(fn: Function, wait: number) {
  let timer: Object| null = null;
  return function(this: any) {
      const context = this;
      const args = arguments;
      if(!timer) {
          timer = setTimeout(function() {
              fn.apply(context, args);
              timer = null;
          }, wait);
      }
  }
}

export {
  throttle,
  scrollCall
}