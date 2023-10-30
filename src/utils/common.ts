import { useMessage,useDialog  } from 'naive-ui'

const message = useMessage()
const dialog = useDialog()


export const filePath =  function(path: string) {
  let date = new Date()
  let filedir = `${path}/${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`
  return filedir
}

/**
 * 
 * @param {*} data 下载接口返回的数据
 * @param {*} filename 下载保存到本地的文件名
 */
export const exportFile = function(data: any, filename: string) {
  let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  // let blob = new Blob([data], { type: 'application/octet-stream;charset=utf-8' });
  let downloadElement = document.createElement('a');
  let href = window.URL.createObjectURL(blob); // 创建下载的链接
  downloadElement.href = href;
  downloadElement.download = filename; // 下载后文件名
  document.body.appendChild(downloadElement);
  downloadElement.click(); // 点击下载
  document.body.removeChild(downloadElement); // 下载完成移除元素
  window.URL.revokeObjectURL(href); // 释放掉blob对象

}

