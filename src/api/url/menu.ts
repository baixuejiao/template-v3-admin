import { baseURL } from '../utils/axios.config'

export const baseAddress = baseURL

// 添加菜单
export const createMenu = '/ums-server/menu/createMenu'
// 分页查询后台菜单
export const getMenuPageList = '/ums-server/menu/getMenuPageList'
// 修改菜单
export const updateMenu = '/ums-server/menu/updateMenu'
// 根据ID删除菜单
export const deleteMenu = '/ums-server/menu/deleteMenu'
