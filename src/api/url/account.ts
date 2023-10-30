// 账户管理api - demo
import { baseURL } from '../utils/axios.config'

export const baseAddress = baseURL

// 获取账号列表-商家
export const getMerchantList = '/ums-server/admin/getMerchantAdminList'

// 获取账号列表-估价师
export const getValuerList = '/ums-server/admin/getValuerAdminList'

// 添加账号
export const createUser = '/ums-server/admin/register'

// 修改账号
export const updateUser = '/ums-server/admin/updateUserInfo'

// 修改启用状态
export const updateStatus = '/ums-server/admin/updateStatus'

// 获取上级列表
export const getParentList = '/ums-server'

// 导出列表
export const exportMemberList = '/ums-server/smember/exportPlateSmembers'

