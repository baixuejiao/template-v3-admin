<!-- 
  page: 使用帮助列表
  author: 
  date: 
 -->
<template>
  <div class="main-container">
    <TableBody ref="tableBody">
      <template #header>
        <TableHeader title="使用帮助列表" >
          <template #top-right>
            <AddButton @add="onAddItem" />
          </template>
        </TableHeader>
      </template>
      <template #default>
        <n-data-table
          :loading="tableLoading"
          :data="dataList"
          :columns="tableColumns"
          :row-key="rowKey"
          :style="{ height: `${tableHeight}px` }"
          :flex-height="true"
        />
      </template>
      <template #footer>
        <TableFooter :pagination="pagination" />
      </template>
    </TableBody>

  </div>
</template>

<script lang="ts">

  import { defineComponent, h, onMounted, ref} from 'vue'
  import { useRouter } from 'vue-router'

  import { post } from '@/api/utils/http'

  import { getMyHelpInfoList, delMyHelpInfo } from '@/api/url/instructions'
  
  import { usePagination, useRowKey, useTable, useTableColumn, useTableHeight, useRenderAction, TableActionModel } from '@/hooks/table'
  import { DataFormType, ModalDialogType, FormItem } from '@/types/components'

  import { DataTableColumn, NInput, useMessage, useDialog } from 'naive-ui'
  
  export default defineComponent({
    name: 'InstructionsList',
    setup() {
      const router = useRouter()
      const searchForm = ref<DataFormType | null>(null) // 搜索表单
      const modalDialogRef = ref<ModalDialogType | null>(null)
      const dataFormRef = ref<DataFormType | null>(null) // 添加/编辑弹窗表单
     
      const table = useTable() // 表格
      const rowKey = useRowKey('id')
      const pagination = usePagination(doRefresh) // 分页信息
      pagination.pageSize = 10

      const message = useMessage() // 消息提示
      const naiveDialog = useDialog() //提示框
      
      // 表格表头
      const tableColumns = useTableColumn(
        [
          {
            title: 'ID',
            key: 'id',
          },
          {
            title: '标题',
            key: 'title',
            ellipsis: {
              tooltip: true
            }
          },
          {
            title: '更新时间',
            key: 'updateTime',
          },
          {
            title: '发布人',
            key: 'createByName',
          },
          {
            title: '显示',
            key: 'displayFlag',
            render: (rowData: any) => {
              if(rowData.displayFlag * 1 === 0) {
                return '否'
              } else {
                return '是'
              }
            }
          },
          {
            title: '操作',
            key: 'actions',
            render: (rowData: any) => {
              return useRenderAction([
                {
                  label: '编辑',
                  type: 'info',
                  onClick: handleEdit.bind(null, rowData),
                },
                {
                  label: '删除',
                  type: 'error',
                  onClick: handleDel.bind(null, rowData),
                },
              ] as TableActionModel[])
              
            },
          },
        ],
        {
          align: 'center',
        } as DataTableColumn
      )
      
      // 获取列表数据
      function doRefresh() {
        post({
          url: `${getMyHelpInfoList}?pageNum=${pagination.page}&pageSize=${pagination.pageSize}`,
        }).then((res: any) => {
          table.handleSuccess(res.data)
          pagination.setTotalSize(res.data.total)
        }).catch(err => {
          message.error(err.message)
        })
      }

      // 搜索
      function onSearch() {
        pagination.page =  1
        doRefresh()
      }

      // 点击添加按钮
      const onAddItem = () => {
        router.push(`/system/instructions/create`)
      }

      // 点击修改信息
      const handleEdit = (item: any) => {
        router.push(`/system/instructions/create?id=${item.id}`)
      }

      // 删除
      const handleDel = (item:any) => {
        naiveDialog.warning({
          title: '提示',
          content: '删除后不可恢复，确认要删除吗？',
          positiveText: '是的',
          onPositiveClick: () => {
            post({
              url: `${delMyHelpInfo}?id=${item.id}`
            }).then((res: any) => {
              if (res.code * 1 === 200) {
                message.success('删除成功', {
                  duration: 1500,
                  onAfterLeave: () => {
                    doRefresh()
                  }
                })
              } else {
                message.error(res.message)
              }
            }).catch(err => {
              message.error(err.message)
            })
          },
        })
      }
      
      onMounted(async () => {
        table.tableHeight.value = await useTableHeight()
        doRefresh()
      })

      return {
        ...table,
        rowKey,
        pagination,
        searchForm,
        tableColumns,
        onSearch,
        handleEdit,
        onAddItem,
        modalDialogRef,
        dataFormRef,
      }
    },
  })
</script>
