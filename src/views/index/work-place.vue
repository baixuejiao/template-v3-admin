<template>
  <div class="main-container">
    <n-card title="工作台" :content-style="{ padding: '10px' }" :header-style="{ padding: '10px' }">
      <n-grid :cols="4" :y-gap="15" item-responsive responsive="screen">
        <n-grid-item class="flex" span="4 s:2 m:2 l:2 xl:2 2xl:2">
          <div class="avatar-wrapper">
            <img :src="avatar" />
          </div>
          <div class="flex flex-col justify-around ml-3.5 flex-1">
            <div class="text-lg">{{ hellotext || '' }} {{userStore.nickName}} ，青春只有一次，别让自己过得不精彩</div>
            <div v-if="todayWeather" class="text-sm text-gray-500">
              <i :class="`qi-${todayWeather?.iconDay}`"></i>
              <span v-if="todayWeather && todayWeather.textDay">今日白天{{ todayWeather.textDay }}</span>
              最高气温{{ todayWeather?.tempMax }} °C
              最低气温{{ todayWeather?.tempMin }} °C
            </div>
          </div>
        </n-grid-item>
        <n-grid-item class="flex justify-end" span="4 s:2 m:2 l:2 xl:2 2xl:2">
          <!-- <div class="flex flex-col justify-around align-end item-action">
            <div class="text-gray">项目数</div>
            <div class="text-xl">12</div>
          </div>
          <div class="flex flex-col justify-around align-end item-action">
            <div class="text-gray">待办项</div>
            <div class="text-xl">3/20</div>
          </div> -->
          <div class="flex flex-col justify-around align-end item-action">
            <div class="text-gray">当前日期</div>
            <div class="text-xl">{{ currentDate }}</div>
          </div>
        </n-grid-item>
      </n-grid>
    </n-card>
    <n-grid
      class="mt-4 mb-4"
      :y-gap="15"
      :x-gap="15"
      cols="2 s:2 m:3 l:6 xl:6 2xl:6"
      responsive="screen"
    >
      <n-grid-item v-for="(item, index) of fastActions" :key="index">
        <n-card class="ouline-link" @click="handleGoLink(item)" :hoverable="true">
          <div class="flex flex-col items-center justify-center">
            <span
              :class="[item.icon, 'iconfont']"
              :style="{ color: item.color, fontSize: '30px' }"
            ></span>
            <span class="mt-1">{{ item.title }}</span>
          </div>
        </n-card>
      </n-grid-item>
    </n-grid>

    <!-- <n-grid
      class="mt-4 mb-4"
      :y-gap="15"
      :x-gap="15"
      cols="2 s:2 m:3 l:6 xl:6 2xl:6"
      responsive="screen"
    >
      <n-grid-item v-for="(item, index) of dataItems" :key="index">
        <ProjectItem :item="item" />
      </n-grid-item>
    </n-grid> -->

    <!-- <n-grid cols="1 s:1 m:2 l:2 xl:2 2xl:2" :y-gap="15" :x-gap="15" responsive="screen">
      <n-grid-item>
        <n-card
          title="项目进度"
          :content-style="{ padding: '5px' }"
          :header-style="{ padding: '10px' }"
        >
          <n-data-table :columns="columns" :data="dataSource" :pagination="false" />
        </n-card>
      </n-grid-item>
      <n-grid-item>
        <n-card
          title="项目动态"
          :content-style="{ padding: '5px' }"
          :header-style="{ padding: '10px' }"
        >
          <TodoItem v-for="(item, index) of waitingItmes" :key="index" :item="item" />
        </n-card>
      </n-grid-item>
    </n-grid> -->
  </div>
</template>

<script lang="ts">
  import ProjectItem from './components/ProjectItem.vue'
  import TodoItem from './components/TodoItem.vue'
  import { computed, defineComponent, onMounted, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { random } from 'lodash-es'
  import useUserStore from '@/store/modules/user'
  import { DeviceType } from '@/store/types'
  import useAppConfigStore from '@/store/modules/app-config'

  const COLORS = ['#67C23A', '#E6A23C', '#F56C6C', '#409EFF']
  const date = new Date()
  export default defineComponent({
    name: 'WorkPlace',
    components: {
      ProjectItem,
      TodoItem,
    },
    setup() {
      const appConfigStore = useAppConfigStore()
      const waitingItmes = [
        {
          name: 'lyj',
          content: '哎哟，不错哟，加油',
          time: '04-04',
        },
        {
          name: '王总',
          content: '给经理打印文件',
          time: '04-04',
        },
        {
          name: '老李',
          content: '等到周末的时候和同事一起去逛街，买新衣服，买新手机，买包包，各种买买买',
          time: '04-02',
        },
        {
          name: '花哥',
          content: '新同事入职培训工作',
          time: '04-01',
        },
        {
          name: '清清玄',
          content: '给领导安排机票，酒店住宿等问题',
          time: '03-31',
        },
      ]
      const isMobileScreen = computed(() => {
        return appConfigStore.deviceType === DeviceType.MOBILE
      })
      const dataSource = [
        {
          key: '1',
          projectName: 'Arco Admin 开发',
          beginTime: '2021-12-01',
          endTime: '2021-12-31',
          progress: 100,
          status: '完成',
        },
        {
          key: '2',
          projectName: '官网开发',
          beginTime: '2021-12-01',
          endTime: '2021-12-31',
          progress: 90,
          status: '进行中',
        },
        {
          key: '3',
          projectName: '文档编写',
          beginTime: '2021-12-01',
          endTime: '2021-12-31',
          progress: 80,
          status: '进行中',
        },
        {
          key: '4',
          projectName: '各版本升级工作',
          beginTime: '2021-12-01',
          endTime: '2025-12-31',
          progress: 50,
          status: '进行中',
        },
        {
          key: '5',
          projectName: '软文编写',
          beginTime: '2021-12-01',
          endTime: '2025-12-31',
          progress: 50,
          status: '进行中',
        },
        {
          key: '5',
          projectName: '工具编写',
          beginTime: '2021-12-01',
          endTime: '2025-12-31',
          progress: 50,
          status: '进行中',
        },
      ]
      const userStore = useUserStore()
      const avatar = computed(() => userStore.avatar)
      const router = useRouter()
      const todayWeather = ref(null)
      const fastActionClick = ({ path = '/' }) => {
        router.push(path)
      }
      const handleGoLink = (item: any) => {
        window.open(item.path)
      }

      const helloStr = () => {
        let hour = new Date().getHours()
        let hello = ''
        if (hour < 6) hello='凌晨好，'
        else if(hour < 9)hello='早上好，'
        else if(hour < 12)hello='上午好，'
        else if(hour < 14)hello='中午好，'
        else if(hour < 17)hello='下午好，'
        else if(hour < 19)hello='傍晚好，'
        else if(hour < 22)hello='晚上好，'
        else {hello='夜深了，'}
        return hello
      }

      // 获取天气信息
      const getTodayWeather = async() => {
        // https://id.qweather.com/#/homepage
        fetch('https://devapi.qweather.com/v7/weather/3d?location=101050101&key=6df6d23be9904c309153ed86430a10ab').then(response=>{
            console.log(response);
            return response.json()
        })
        .then(res=>{
          if(res.code * 1 === 200) {
            todayWeather.value = res.daily[0]
          } else {
            todayWeather.value = null
          }
        })
        .catch(error=>{
            console.log(error);
        })
      }

      onMounted(() => {
        getTodayWeather()
      })

      return {
        hellotext: helloStr(),
        todayWeather,
        isMobileScreen,
        waitingItmes,
        userStore,
        avatar,
        currentDate: date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate(),
        // dataItems: [
        //   {
        //     title: 'Vue Admin Work',
        //     target: 'http://qingqingxuan.gitee.io/vue-admin-work',
        //     gitee: 'http://www.vueadminwork.com',
        //     ui: 'Element UI',
        //   },
        //   {
        //     title: 'Vue Admin Work X',
        //     target: 'http://qingqingxuan.gitee.io/vue-admin-work-x',
        //     gitee: 'http://www.vueadminwork.com',
        //     ui: 'Element Plus',
        //   },
        //   {
        //     title: 'Admin Work Pro',
        //     target: 'http://qingqingxuan.gitee.io/admin-work',
        //     gitee: 'http://www.vueadminwork.com',
        //     ui: 'NaiveUI',
        //   },
        //   {
        //     title: 'Arco Work',
        //     target: 'http://qingqingxuan.gitee.io/admin-work',
        //     gitee: 'http://www.vueadminwork.com',
        //     ui: 'ArcoDesign',
        //   },
        //   {
        //     title: 'Vue Admin Work A',
        //     target: 'http://qingqingxuan.gitee.io/vue-admin-work-x',
        //     gitee: 'http://www.vueadminwork.com',
        //     ui: 'Antd',
        //   },
        //   {
        //     title: 'Admin Work',
        //     target: 'http://qingqingxuan.gitee.io/admin-work',
        //     gitee: 'http://www.vueadminwork.com',
        //     ui: 'NaiveUI',
        //   },
        // ],
        fastActions: [
          {
            title: 'GITLab',
            icon: 'icon-Gitlab-fill',
            path: 'http://192.168.18.29:3333/',
            color: '#ff8907',
          },
          {
            title: '禅道',
            path: 'http://192.168.1.26/zentao/my.html',
            icon: 'icon-bug-fill',
            color: 'rgb(103, 194, 58)',
          },
          {
            title: 'NAS',
            path: 'https://192.168.1.12:5001/',
            icon: 'icon-detail-fill',
            color: 'rgb(64, 158, 255)',
          },
          {
            title: 'Jenkins',
            path: 'http://192.168.18.29:8088/',
            icon: 'icon-robot',
            color: '#a200ff80',
          }
        ],
        fastActionClick,
        handleGoLink,
        dataSource,
        columns: [
          {
            title: '项目名',
            key: 'projectName',
          },
          {
            title: '开始时间',
            key: 'beginTime',
          },
          {
            title: '结束时间',
            key: 'endTime',
          },
          {
            title: '进度',
            key: 'progress',
          },
          {
            title: '状态',
            key: 'status',
          },
        ],
      }
    },
  })
</script>

<style lang="scss" scoped>
  .avatar-wrapper {
    width: 3rem;
    height: 3rem;
    max-width: 3rem;
    max-height: 3rem;
    min-width: 3rem;
    min-height: 3rem;
    & > img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      border: 2px solid var(--primary-color);
    }
  }
  .item-action {
    position: relative;
    padding: 0 30px;
  }
  .item-action::after {
    position: absolute;
    top: 20%;
    right: 0;
    height: 60%;
    content: '';
    display: block;
    width: 1px;
    background-color: #e0e0e0;
  }
  div.item-action:last-child::after {
    width: 0;
  }
  .ouline-link{
    cursor: pointer;
  }
  .fast-item-wrapper {
    border-right: 1px solid #f7f7f7;
    border-bottom: 1px solid #f7f7f7;
    height: 80px;
  }
  .fast-item-wrapper:hover {
    cursor: pointer;
    box-shadow: 0px 0px 10px #ddd;
  }
  .el-link + .el-link {
    margin-bottom: 10px;
  }
</style>
