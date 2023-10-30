/**
 * 导出 request
 */
import axios from 'axios'
import qs from "qs"
import useUserStore from '@/store/modules/user'
import { getToken } from '@/utils/auth'

import { baseURL } from '@/api/utils/axios.config'

// 创建axios实例
const service = axios.create({
  baseURL: baseURL, // api的base_url
  timeout: 600000 // 请求超时时间
})

const userStore = useUserStore()

// request拦截器
service.interceptors.request.use(config => {
  if (userStore.$state.token) {
    config.headers['Authorization'] = getToken() // 让每个请求携带自定义token 请根据实际情况自行修改
  }
  if(config.headers&&config.method == "post"){
    config.data = qs.stringify(config.data)
    config.responseType = 'blob'
  }
  return config
}, error => {
  // Do something with request error
  console.log(error) // for debug
  Promise.reject(error)
})

// respone拦截器
service.interceptors.response.use(
  response => {
  /**
  * 根据导出逻辑 目前将返回内容全部return
  */
    return response.data

  },
  error => {
    console.log('err' + error)// for debug
    // Message({
    //   message: error.message,
    //   type: 'error',
    //   duration: 3 * 1000
    // })
    return Promise.reject(error)
  }
)

export default service
