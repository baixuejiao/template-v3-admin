// 系统部门管理模块api

import { baseURL } from '../utils/axios.config'

export const baseAddress = baseURL

// 获取部门列表
export const getDepartmentList = '/ums-server/org/getList'

// 获取上级部门列表
export const getParentDepartment = '/ums-server/org/getTree'

// 创建部门
export const createDepartment = '/ums-server/org/create'

// 修改部门
export const updateDepartment = '/ums-server/org/update'

// 查询部门
export const getDepartmentById = '/ums-server/org/getById'

// 删除
export const delDepartmentById = '/ums-server/org/del'
