import vue from '@vitejs/plugin-vue'
import viteSvgIcons from 'vite-plugin-svg-icons'
import path from 'path'
import vitePluginCompression from 'vite-plugin-compression'
import ViteComponents from 'unplugin-vue-components/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'
import { loadEnv } from "vite"


import vueJsx from '@vitejs/plugin-vue-jsx'

export default ({ command, mode }) => {
  const root = process.cwd()
  const env = loadEnv(mode, root, '')
  
  return {
    base: './',
    plugins: [
      vue(),
      viteSvgIcons({
        iconDirs: [path.resolve(process.cwd(), 'src/icons')],
        symbolId: 'icon-[dir]-[name]',
      }),
      vitePluginCompression({
        threshold: 1024 * 10,
      }),
      ViteComponents({
        resolvers: [NaiveUiResolver()],
      }),
      vueJsx(),
    ],
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "./src/styles/variables.scss" as *;',
        },
      },
    },
    resolve: {
      alias: [
        {
          find: '@/',
          replacement: path.resolve(process.cwd(), 'src') + '/',
        },
      ],
    },
    server: {
      open: true,
      port: 9999,
      /*本地代理 配置跨域*/
      proxy: {
        // 登录模块
        '/authorization-server': {
          target: env.VITE_BASE_API, //API服务地址
          changeOrigin: true,  //开启跨域
          pathRewrite: {
            '/^authorization-server':'authorization-server/'
          }
        },
        // 权限模块
        '/ums-server': {
          target: env.VITE_BASE_API, //API服务地址
          changeOrigin: true,  //开启跨域
          pathRewrite: {
            '/^ums-server':'ums-server/'
          }
        },
        // 文件服务模块
        '/file-server': {
          target: env.VITE_BASE_API, //API服务地址
          changeOrigin: false,  //开启跨域
          pathRewrite: {
            '/^file-server':'file-server/'
          }
        },
        // order模块
        '/order-server': {
          target: env.VITE_BASE_API, //API服务地址
          changeOrigin: true,  //开启跨域
          pathRewrite: {
            '/^order-server':'order-server/'
          }
        },
        // 工作流服务模块
        '/workflow-server': {
          target: env.VITE_BASE_API, //API服务地址
          changeOrigin: true,  //开启跨域
          pathRewrite: {
            '/^workflow-server':'workflow-server/'
          }
        },
      }
    },
  }
}
