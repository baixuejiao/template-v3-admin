<template>
  <n-card :bordered="false" :content-style="{ padding: 0 }" class="table-footer-container">
    <div class="flex justify-center">
      <n-pagination
        :page="pagination?.page"
        :page-size="pagination?.pageSize"
        :item-count="pagination?.itemCount"
        :show-size-picker="pagination?.showSizePicker"
        :show-quick-jumper="pagination?.showQuickJumper"
        :page-sizes="pagination?.pageSizes"
        @update:page="onChange"
        @update:page-size="onPageSizeChange"
      >
      <!-- :page-count="pagination?.pageCount" -->

        <template #prefix="{ itemCount }">
            共 {{ itemCount }} 项
        </template>
      </n-pagination>
      <!--  -->
      <n-button
        v-if="showRefresh"
        circle
        style="margin-left: 10px"
        size="small"
        type="primary"
        @click="refresh"
      >
        <template #icon>
          <n-icon>
            <RefreshIcon />
          </n-icon>
        </template>
      </n-button>
    </div>
  </n-card>
</template>

<script lang="ts">
  import { defineComponent, toRef } from 'vue'
  import { Refresh as RefreshIcon } from '@vicons/ionicons5'

  export default defineComponent({
    name: 'TableFooter',
    components: { RefreshIcon },
    props: {
      pagination: {
        type: Object,
        require: true,
      },
      showRefresh: {
        type: Boolean,
        default: true,
      },
    },
    setup(props) {
      const pagination = toRef(props, 'pagination')
      function onChange(page: number) {
        ;(pagination as any).value.page = page
        ;(pagination as any).value.onChange()
      }
      function onPageSizeChange(pageSize: number) {
        ;(pagination as any).value.page = 1
        ;(pagination as any).value.pageSize = pageSize
        ;(pagination as any).value.onPageSizeChange()
      }
      function refresh() {
        ;(pagination as any).value.onChange()
      }
      return {
        onChange,
        onPageSizeChange,
        refresh,
      }
    },
  })
</script>
<style lang="scss" scoped>
  .table-footer-container {
    height: 45px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
  }
</style>
