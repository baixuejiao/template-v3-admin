// 系统用户模块api

import { baseURL } from '../utils/axios.config'

export const baseAddress = baseURL

// 获取用户列表
export const getUserList = '/ums-server/admin/list'
// 获取用户信息
export const getUserInfo = '/ums-server/admin'
// 添加用户
export const createUser = '/ums-server/admin/register'
// 修改用户
export const updateUser = '/ums-server/admin/update'
// 删除用户
export const deleteUser = '/ums-server/admin/delete'
// 给用户分配角色
export const updateUserRole = '/ums-server/admin/role/update'
// 获取用户角色
export const getUserRole = '/ums-server/admin/role'
// 修改帐号状态
export const updateStatus = '/ums-server/admin/updateStatus'
// 修改账号密码
export const updatePassword = '/ums-server/admin/updatePassword'


