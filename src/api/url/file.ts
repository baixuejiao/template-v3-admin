// 文件

import { baseURL } from "../utils/axios.config";

export const baseAddress = baseURL

// 文件服务器路径
export const uploadApi = `${import.meta.env.VITE_FILE_API}file-server/file/single`

// 获取上传文件的信息
export const fileDetails = '/file-server/hlfile/createFile'

// 文件下载路径
export const showUrl = `${import.meta.env.VITE_FILE_SHOW}file-server`
