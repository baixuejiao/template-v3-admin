import { baseURL } from '../utils/axios.config'

export const baseAddress = baseURL

// 添加角色信息
export const addRole = '/ums-server/role/saveRoleInfo'
// 分页获取角色列
export const getRoleList = '/ums-server/role/getPageRoleList'
// 编辑角色信息
export const updateRole = '/ums-server/role/modRoleInfoById'
// 删除角色信息
export const delRole = '/ums-server/role/delRoleInfoById'
// 获取所有角色集合
export const getAllRole = '/ums-server/role/getRoleList'
// 获取角色菜单集合权限
export const getRoleMenuList = '/ums-server/role/getAllMenusByRoleIds'
// 获取角色菜单权
export const getMenuPermission = '/ums-server/role/getMenuPermission'
// 修改角色菜单权限
export const updateMenuPermission = '/ums-server/role/modMenuPermission/update'
// 非自定义数据权限创建
export const dataPermission = '/ums-server/role/dataPermission'
