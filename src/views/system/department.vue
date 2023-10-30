<!-- 
  page: 部门管理
-->
<template>
  <div class="main-container">
    <TableBody>
      <template #header>
        <TableHeader :show-filter="false" title="部门列表">
          <template #top-right>
            <AddButton @add="onAddItem" />
          </template>
        </TableHeader>
      </template>
      <template #default>
        <n-data-table
          :loading="tableLoading"
          :data="dataList"
          :row-key="rowKey"
          :columns="tableColumns"
        />
      </template>
    </TableBody>
    <!-- 添加dialog -->
    <ModalDialog ref="modalDialog" @confirm="onConfirm" content-height="50vh">
      <template #content>
        <DataForm ref="dataForm" :options="itemFormOptions" />
      </template>
    </ModalDialog>
  </div>
</template>

<script lang="ts">
  import { defineComponent, h, onMounted, ref, unref } from 'vue'

  import { post, get } from '@/api/utils/http'
  import { createDepartment, updateDepartment, getParentDepartment, delDepartmentById } from '@/api/url/department'

  import { TableActionModel, useRenderAction, useRowKey, useTable, useTableColumn } from '@/hooks/table'
  import { DataFormType, ModalDialogType, FormItem } from '@/types/components'
  import { renderInput, renderTreeSelect } from '@/hooks/form'
  import { transformTreeSelect } from '@/utils'

  import { useDialog, useMessage } from 'naive-ui'
  import { TableColumn } from 'naive-ui/lib/data-table/src/interface'
  
  export default defineComponent({
    name: 'Department',
    setup() {
      let actionModel = 'add'
      let tempItem: any = null
      const table = useTable()
      const naiveDialog = useDialog()
      const message = useMessage()
      const modalDialog = ref<ModalDialogType | null>(null)
      const dataForm = ref<DataFormType | null>(null)
      const rowKey = useRowKey('id')
      
      // 表头
      const tableColumns = useTableColumn(
        [
          {
            title: '部门名称',
            key: 'name',
            align: 'left',
            
          },
          {
            title: '部门编号',
            key: 'code',
          },
          {
            title: '操作',
            key: 'actions',
            render: (rowData) => {
              return useRenderAction([
                {
                  label: '编辑',
                  onClick: onUpdateItem.bind(null, rowData),
                },
                {
                  label: '删除',
                  type: 'error',
                  onClick: onDeleteItem.bind(null, rowData),
                },
              ] as TableActionModel[])
            },
          },
        ],
        {
          align: 'center',
        } as TableColumn
      )
      
      // form表单
      const itemFormOptions = [
        {
          label: '父级部门',
          key: 'pid',
          value: ref(null),
          optionItems: [],
          required: true,
          validator: (formItem, message) => {
            if (!formItem.value.value && typeof(formItem.value.value) != "undefined" && formItem.value.value != 0) {
              message.error('请选择父级部门')
              return false
            }
            return true
          },
          render: (formItem) =>
            renderTreeSelect(
              formItem.value,
              [
                {label: '无上级', key: -1},
                ...transformTreeSelect(unref(table.dataList)!, 'name', 'id')
              ],
              {
                showPath: true,
              }
            ),
        },
        {
          label: '部门名称',
          key: 'name',
          required: true,
          value: ref(null),
          render: (formItem) =>
            renderInput(formItem.value, {
              placeholder: '请输入部门名称',
              maxlength: 100,
            }),
        },
        {
          label: '部门编号',
          key: 'code',
          required: true,
          value: ref(null),
          disabled: ref(false),
          render: (formItem) =>
            renderInput(formItem.value, {
              placeholder: '请输入部门编号',
              maxlength: 100,
            }),
        },
      ] as Array<FormItem>
      
      // 获取列表
      function doRefresh(){
        post({
          url: `${getParentDepartment}` ,
        }).then((res: any) => {
          table.handleSuccess({
            list: res.data
          })
        }).catch(console.log)
      }

      // 点击添加按钮
      function onAddItem() {
        actionModel = 'add'
        modalDialog.value?.show().then(() => {
          dataForm.value?.reset()
        })
      }
      
      // 点击编辑按钮
      const onUpdateItem = (item: any) => {
        actionModel = 'edit'
        tempItem = item
        itemFormOptions.forEach((it) => {
          if(it.key === 'pid') { // 一级菜单pid为-1 需单独处理
            it.value.value = item[it.key] || -1
          } else {
            it.value.value = item[it.key]
          }
        })
        modalDialog.value?.show()
      }

      // 点击提交按钮
      const onConfirm = () => {
        if (actionModel === 'add') {
          if (dataForm.value?.validator()) {
            handleSubmit()
          }
        } else {
          if (dataForm.value?.validator()) {
            handleUpdate()
          }
        }
      }

      // 添加
      const handleSubmit = () => {
        let _params = dataForm.value?.generatorParams()
        post({
          url: `${createDepartment}?name=${_params.name}&code=${_params.code}&pid=${_params.pid}`,
        }).then((res:any) => {
          if (res.code * 1 === 200) {
            modalDialog.value?.toggle()
            message.success('添加成功', {
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
      }

      // 修改
      const handleUpdate = () => {
        let _params = dataForm.value?.generatorParams()
        post({
          url: `${updateDepartment}?id=${tempItem.id}&name=${_params.name}&code=${_params.code}&pid=${_params.pid}`,
        }).then((res: any) => {
          if (res.code * 1 === 200) {
            modalDialog.value?.toggle()
            message.success('修改成功', {
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
      }

      // 点击删除按钮
      const onDeleteItem = (item: any) => {
        naiveDialog.warning({
          title: '提示',
          content: '删除后不可恢复，确认要删除吗？',
          positiveText: '删除',
          onPositiveClick: () => {
            handleDel(item.id)
          },
        })
      }

      // 删除
      const handleDel = (id: number) => {
        post({
          url: `${delDepartmentById}?id=${id}`
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
      }
     
      onMounted(async () => {
        doRefresh()
      })

      return {
        rowKey,
        modalDialog,
        dataForm,
        ...table,
        itemFormOptions,
        tableColumns,
        onAddItem,
        onDeleteItem,
        onConfirm,
      }
    },
  })
</script>
<style lang="scss" scoped>

</style>
