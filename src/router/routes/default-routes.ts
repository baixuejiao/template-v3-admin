/**
 * 这里的 defaultRoutes 是为了在一开始对接项目的时候，后端人员还没有准备好菜单接口，导致前端开发者不能进入主页面。
 * 所以这里返回默认的菜单数据，同时也向大家说明菜单数据的数据结构。后端的菜单接口一定要按这个格式去返回json数据，否则会解析菜单失败
 */
export default [
  {
    menuUrl: '/index',
    menuName: 'Dashborad',
    routeName: 'dashborad',
    icon: 'icon-dashboard',
    parentPath: '',
    children: [
      {
        parentPath: '/index',
        menuUrl: '/index/home',
        menuName: '主控台',
        routeName: 'home',
        cacheable: false
      },
      {
        parentPath: '/index',
        menuUrl: '/index/work-place',
        menuName: '工作台',
        routeName: 'workPlace',
        cacheable: false,
        isRootPath: true,
      },
    ],
  },
  {
    menuUrl: '/system',
    menuName: '系统管理',
    iconPrefix: 'iconfont',
    icon: 'setting',
    parentPath: '',
    routeName: 'system',
    children: [
      {
        parentPath: '/system',
        menuUrl: '/system/department',
        menuName: '部门管理',
        routeName: 'user',
        cacheable: false
      },
      {
        parentPath: '/system',
        menuUrl: '/system/user',
        menuName: '用户管理',
        routeName: 'user',
        cacheable: false
      },
      {
        parentPath: '/system',
        menuUrl: '/system/role',
        menuName: '角色管理',
        cacheable: false
      },
      {
        parentPath: '/system',
        menuUrl: '/system/menu',
        menuName: '菜单管理',
      },
      {
        parentPath: '/system',
        menuUrl: '/system/instructions/list',
        menuName: '使用帮助',
        cacheable: false
      },
      {
        parentPath: '/system',
        menuUrl: '/system/instructions/create',
        menuName: '新增使用帮助',
        cacheable: false,
        hidden: true
      },
    ],
  },
  {
    menuUrl: '/account',
    menuName: '账户管理',
    iconPrefix: 'iconfont',
    icon: 'detail',
    parentPath: '',
    children: [
      {
        parentPath: '/account',
        menuUrl: '/account/merchant',
        menuName: '商家端账号管理',
      },
      {
        parentPath: '/account',
        menuUrl: '/account/valuer',
        menuName: '估价师账号管理',
      },
    ],
  }
]
