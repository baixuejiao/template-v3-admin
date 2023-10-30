// 使用帮助

import { baseURL } from '../utils/axios.config'

export const baseAddress = baseURL


// 查看使用帮助列表
export const getMyHelpInfoList = '/ums-server/help/getMyHelpInfoList'

// 删除帮助列表
export const delMyHelpInfo = '/ums-server/help/delMyHelpInfo'

// 编辑使用帮助
export const modMyHelpInfo = '/ums-server/help/modMyHelpInfo'

// 新增使用帮助
export const createMyHelpInfo = '/ums-server/help/createMyHelpInfo'

// 根据id查询使用帮助详情
export const getMyHelpInfo = '/ums-server/help/getMyHelpInfo'