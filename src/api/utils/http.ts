import { AxiosResponse } from 'axios'
import { App } from 'vue'
import request from './axios.config'
import { removeToken } from '@/utils/auth'
export interface HttpOption {
  url: string
  data?: any
  method?: string
  headers?: any,
  auth?: any,
  responseType?: any,
  beforeRequest?: () => void
  afterRequest?: () => void
}

export interface Response<T = any> {
  totalSize: number | 0
  code?: number | string
  msg?: string
  data?: T,
  message: string,
  mesg?: string,
  token_type?: string
  access_token?: string
  refresh_token?: string,
}

function http<T = any>({ url, data, method, headers,  beforeRequest, afterRequest }: HttpOption) {
  const successHandler = (res: AxiosResponse<Response<T>>) => {
    if (res.data.code === 200) {
      return res.data
    } else if(res.data.code == '020001' || res.data.code == '020002' || res.data.code === '-1') { // token过期
      localStorage.clear()
      sessionStorage.clear()
      removeToken()
      location.reload()
    } else {
      throw new Error(res.data.message || '请求失败，未知异常')
      // return res.data
    }
    throw new Error(res.data.message || '请求失败，未知异常')
  }
  const failHandler = (error: Response<Error>) => {
    afterRequest && afterRequest()
    throw new Error(error.message || '请求失败，未知异常')
  }
  beforeRequest && beforeRequest()
  method = method || 'GET'
  const params = Object.assign(typeof data === 'function' ? data() : data || {}, {})
  return method === 'GET'
    ? request.get(url, { params }).then(successHandler, failHandler)
    : request.post(url, params, { headers: headers } ).then(successHandler, failHandler)
}

function Lhttp<T = any>({ url, data, method, headers, auth, beforeRequest, afterRequest }: HttpOption) {
  const successHandler = (res: AxiosResponse<Response<T>>) => {
    if (res.data) {
      if(res.data.code && res.data?.code == '020002') {
        throw new Error(res.data.mesg || '登录账号密码错误')
      } else if(res.data.code && res.data?.code == '020001'){
        throw new Error(res.data.mesg || '账号登录信息过期，请重新登录')
      } else {
        return res.data
      }
    }
    throw new Error('请求失败，未知异常')
  }
  const failHandler = (error: Response<Error>) => {
    afterRequest && afterRequest()
    throw new Error(error.msg || '请求失败，未知异常')
  }
  beforeRequest && beforeRequest()
  method = method || 'GET'
  const params = Object.assign(typeof data === 'function' ? data() : data || {}, {})
  return method === 'GET'
    ? request.get(url, { params }).then(successHandler, failHandler)
    : request.post(url, params, { headers: headers, auth: auth}).then(successHandler, failHandler)
}

function Ehttp<T = any>({ url, data, method, headers, responseType, beforeRequest, afterRequest }: HttpOption) {
  const successHandler = (res: AxiosResponse<Response<T>>) => {
    if (res.data ) {
      return res.data
    } else {
      console.log('no')
    }
    throw new Error('请求失败，未知异常')

  }
  const failHandler = (error: Response<Error>) => {
    afterRequest && afterRequest()
    throw new Error(error.msg || '请求失败，未知异常')
  }
  beforeRequest && beforeRequest()
  method = method || 'GET'
  const params = Object.assign(typeof data === 'function' ? data() : data || {}, {})
  return method === 'GET'
    ? request.get(url, { params, responseType: responseType }).then(successHandler, failHandler)
    : request.post(url, params, { headers: headers, responseType: responseType}).then(successHandler, failHandler)
}

export function get<T = any>({
  url,
  data,
  method = 'GET',
  beforeRequest,
  afterRequest,
}: HttpOption): Promise<Response<T>> {
  return http<T>({
    url,
    method,
    data,
    beforeRequest,
    afterRequest,
  })
}

export function post<T = any>({
  url,
  data,
  method = 'POST',
  headers,
  beforeRequest,
  afterRequest,
}: HttpOption): Promise<Response<T>> {
  return http<T>({
    url,
    method,
    data,
    headers,
    beforeRequest,
    afterRequest,
  })
}

export function postLogin<T = any>({
  url,
  data,
  method = 'POST',
  headers,
  auth,
  beforeRequest,
  afterRequest,
}: HttpOption): Promise<Response<T>> {
  return Lhttp<T>({
    url,
    method,
    data,
    headers,
    auth,
    beforeRequest,
    afterRequest,
  })
}

export function postExport<T = any>({
  url,
  data,
  method = 'POST',
  headers,
  responseType,
  beforeRequest,
  afterRequest,
}: HttpOption): Promise<Response<T>> {
  return Ehttp<T>({
    url,
    method,
    data,
    headers,
    responseType,
    beforeRequest,
    afterRequest,
  })
}

function install(app: App): void {
  app.config.globalProperties.$http = http

  app.config.globalProperties.$get = get

  app.config.globalProperties.$post = post

  app.config.globalProperties.$postLogin = postLogin

  app.config.globalProperties.$postExport = postExport

}

export default {
  install,
  get,
  post,
  postLogin,
  postExport
}
