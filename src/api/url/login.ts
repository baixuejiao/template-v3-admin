import { baseURL } from '../utils/axios.config'

export const baseAddress = baseURL

// 用户登录
export const login = '/authorization-server/oauth/token?scope=read&grant_type=password'
// 获取用户信息
export const getInfo = '/ums-server/admin/info'
// 根据角色集合获取菜单集合权限
export const getMenuListByRoleId = '/ums-server/role/getRoleMenuListByIds'
// 退出登录
export const systemLogout = '/ums-server/sso/logout'