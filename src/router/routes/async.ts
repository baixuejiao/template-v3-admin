import { LAYOUT } from '@/store/keys'

// 动态路由
export const asyncRoutes = [
  {
    path: '/index',
    component: LAYOUT,
    name: 'Index',
    meta: {
      title: 'Dashboard',
      iconPrefix: 'iconfont',
      icon: 'dashboard',
    },
    children: [
      {
        path: 'home',
        name: 'Home',
        component: () => import('@/views/index/main.vue'),
        meta: {
          title: '主控台',
          // affix: true,
          cacheable: false,
          iconPrefix: 'iconfont',
          icon: 'menu',
          hidden: true
        },
      },
      {
        path: 'work-place',
        name: 'WorkPlace',
        component: () => import('@/views/index/work-place.vue'),
        meta: {
          title: '工作台',
          // affix: true,
          iconPrefix: 'iconfont',
          icon: 'menu',
          isRootPath: true,
          cacheable: false
        },
      },
    ],
  },
  {
    path: '/system',
    component: LAYOUT,
    name: 'System',
    meta: {
      title: '系统管理',
      iconPrefix: 'iconfont',
      icon: 'setting',
    },
    children: [
      {
        path: 'department',
        name: 'Department',
        component: () => import('@/views/system/department.vue'),
        meta: {
          title: '部门管理',
          iconPrefix: 'iconfont',
          icon: 'apartment',
          cacheable: false
        },
      },
      {
        path: 'user',
        name: 'User',
        component: () => import('@/views/system/user.vue'),
        meta: {
          title: '用户管理',
          iconPrefix: 'iconfont',
          icon: 'team',
          cacheable: false
        },
      },
      {
        path: 'role',
        name: 'Role',
        component: () => import('@/views/system/role.vue'),
        meta: {
          title: '角色管理',
          iconPrefix: 'iconfont',
          icon: 'guanliyuan_jiaoseguanli',
          cacheable: false
        },
      },
      {
        path: 'menu',
        name: 'Menu',
        component: () => import('@/views/system/menu.vue'),
        meta: {
          title: '菜单管理',
          iconPrefix: 'iconfont',
          icon: 'menu',
          cacheable: false
        },
      },
      {
        path: 'instructions/list',
        name: 'InstructionsList',
        component: () => import('@/views/system/instructions/list.vue'),
        meta: {
          title: '使用帮助',
          iconPrefix: 'iconfont',
          icon: 'question-circle',
          cacheable: false
        },
      },
      {
        path: 'instructions/create',
        name: 'InstructionsCreate',
        component: () => import('@/views/system/instructions/create.vue'),
        meta: {
          title: '新增使用帮助',
          iconPrefix: 'iconfont',
          icon: 'chuangjian',
          cacheable: false,
          hidden: true,
          // noShowTabbar: true,
        },
      }
    ],
  },
  {
    path: '/account',
    component: LAYOUT,
    name: 'Account',
    meta: {
      title: '账户管理',
      iconPrefix: 'iconfont',
      icon: 'detail',
    },
    children: [
      {
        path: 'merchant',
        name: 'MerchantAccount',
        component: () => import('@/views/account/merchant.vue'),
        meta: {
          title: '商家端账号管理',
          iconPrefix: 'iconfont',
          icon: 'unorderedlist',
          cacheable: false
        },
      },
      {
        path: 'valuer',
        name: 'ValuerAccount',
        component: () => import('@/views/account/valuer.vue'),
        meta: {
          title: '估价师账号管理',
          iconPrefix: 'iconfont',
          icon: 'unorderedlist',
          cacheable: false
        },
      },
    ],
  }
]
