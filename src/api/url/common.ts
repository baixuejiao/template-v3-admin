// 公共api 
import { baseURL } from '../utils/axios.config'
export const baseAddress = baseURL

/**
 * 字典项
 * tms任务类型            tms_task_type
 * tms达人等级要求        tms_level_ask
 * tms素材类型            tms_material_type
 * tms直播类型            tms_live_type
 * tms抖音带货等级        tms_cargo_class
 * tms排序               tms_sort_type
 * tms任务状态           tms_task_status
 * tms任务奖励           tms_task_award
 * tms数据边界           tms_pc_role_permission
 */
export const getDictDataByType = '/ums-server/dict/getDictDataByType'

// 获取省份
export const getProvinceInfo = '/ums-server/area/getProvinceInfo'

// 根据父级区划代码、级别获取市县镇村
export const getAreaCodeInfo = '/ums-server/area/getAreaCodeInfo'