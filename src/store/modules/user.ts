import { defineStore } from 'pinia'
import { UserState } from '../types'
import { setToken, removeToken } from '../../utils/auth'

import { post } from '@/api/utils/http'
import { systemLogout } from '@/api/url/login'

import { useDialog } from 'naive-ui'

import store from '../pinia'

import Avatar from '@/assets/images/avatar_default.png'

const defaultAvatar = Avatar

const naiveDialog = useDialog() 

const useUserStore = defineStore('user-info', {
  state: () => {
    return {
      userId: 0,
      clientId: '',
      roleId: '',
      token: '',
      userName: '',
      nickName: '',
      avatar: defaultAvatar,
      // menus: [],
    }
  },
  actions: {
    saveToken(token: string) {
      return new Promise<void>((resolve: any) => {
        // 存储token
        const tokenStr = `Bearer ${token}`
        setToken(tokenStr)
        this.token = tokenStr
        resolve()
      })
    },
    saveUser(info: any) {
      return new Promise<void>((resolve: any) => {
        let _roles = JSON.parse(JSON.stringify(info.roles))
        this.userId = info.uinfo.id
        this.clientId = info.uinfo.clientId
        this.roleId = _roles.toString()
        this.userName = info.uinfo.username
        this.nickName = info.uinfo.nickName
        this.avatar = info.avatar || defaultAvatar
        resolve(info)
      })
    },
    isTokenExpire() {
      return !this.token
    },
    changeNickName(newNickName: string) {
      this.nickName = newNickName
    },
    // 退出登录
    logout() {
      return new Promise<void>((resolve) => {
        post({
          url: systemLogout
        }).then(() => {
          this.$reset()
          localStorage.clear()
          sessionStorage.clear()
          removeToken()
          resolve()
        })
      })
    },
    // 前端登出
    FedLogOut() {
      return new Promise<void>((resolve) => {
        this.token = ''
        removeToken()
        resolve()
      })
    }
  },
  presist: {
    enable: true,
    resetToState: true,
    option: {
      exclude: ['userName'],
    },
  },
})

export default useUserStore

export function useUserStoreContext() {
  return useUserStore(store)
}