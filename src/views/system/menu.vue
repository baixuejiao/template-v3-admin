<!-- 
  page: 菜单管理
 -->
<template>
  <div class="main-container">
    <TableBody>
      <template #header>
        <TableHeader :show-filter="false" title="菜单列表">
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
      <template #footer>
        <TableFooter ref="tableFooterRef" :pagination="pagination" />
      </template>
    </TableBody>

    <!-- 添加dialog -->
    <ModalDialog ref="modalDialog" @confirm="onConfirm" content-height="50vh">
      <template #content>
        <DataForm :key="Math.random()" ref="dataForm" :options="itemFormOptions" />
      </template>
    </ModalDialog>
  </div>
</template>

<script lang="ts">
  import { defineComponent, h, onMounted, ref, Ref, unref } from 'vue'

  import { post, get } from '@/api/utils/http'
  import { getMenuPageList, createMenu, updateMenu, deleteMenu } from '@/api/url/menu'

  import { isExternal, transformTreeSelect } from '@/utils'
  import { findRouteByUrl } from '@/store/help'
  import usePermissionStore from '@/store/modules/permission'

  import { renderInput, renderSwitch, renderTreeSelect } from '@/hooks/form'
  import { TableActionModel, useRenderAction, useRowKey, useTable, useTableColumn, usePagination } from '@/hooks/table'
  import SvgIcon from '@/components/svg-icon/index.vue'
  import IconSelector from '@/components/common/IconSelector.vue'
  import { DataFormType, ModalDialogType, FormItem } from '@/types/components'
  
  import { NIcon, useDialog, useMessage } from 'naive-ui'
  import { TableColumn } from 'naive-ui/lib/data-table/src/interface'

  export default defineComponent({
    name: 'Menu',
    setup() {
      let actionModel = 'add'
      let tempItem: any = null

      const table = useTable()
      const rowKey = useRowKey('id')
      const pagination = usePagination(doRefresh)
      pagination.pageSize = 10
      
      const modalDialog = ref<ModalDialogType | null>(null)
      const dataForm = ref<DataFormType | null>(null)
      const permissionStore = usePermissionStore()
      
      const naiveDialog = useDialog()
      const message = useMessage()

      const tableColumns = useTableColumn(
        [
          // table.indexColumn,
          {
            title: '菜单名称',
            key: 'menuName',
          },
          {
            title: '菜单地址',
            key: 'menuUrl',
          },
          {
            title: '菜单图标',
            key: 'icon',
            render: (rowData) => {
              return h(SvgIcon, {
                    prefix: rowData.iconPrefix ? (rowData.iconPrefix as string) : 'iconfont',
                    name: rowData.icon ? (rowData.icon as string) : 'unorderedlist',
              })
            },
          },
          {
            title: '是否缓存',
            key: 'cacheable',
            render: (rowData) => {
              return h('div', null, { default: () => (rowData.cacheable ? '是' : '否') })
            },
          },
          {
            title: '是否隐藏',
            key: 'hidden',
            render: (rowData) => {
              return h('div', null, { default: () => (rowData.hidden ? '是' : '否') })
            },
          },
          {
            title: '是否固定标题栏',
            key: 'affix',
            render: (rowData) => {
              return h('div', null, { default: () => (rowData.affix ? '是' : '否') })
            },
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
      
      const itemFormOptions = [
        {
          label: '上级菜单',
          key: 'parentId',
          value: ref(null),
          required: true,
          validator: (formItem, message) => {
            if (!formItem.value.value && typeof(formItem.value.value) != "undefined" && formItem.value.value != 0) {
              message.error('请选择上级菜单')
              return false
            }
            return true
          },
          render: (formItem) =>
            renderTreeSelect(
              formItem.value,
              [
                {label: '无上级', key: 0},
                ...transformTreeSelect(unref(table.dataList)!, 'menuName', 'id')
              ],
              {
                showPath: true,
              }
            ),
        },
        {
          label: '菜单名称',
          key: 'menuName',
          required: true,
          value: ref(null),
          render: (formItem) =>
            renderInput(formItem.value, {
              placeholder: '请输入菜单名称',
              maxlength: 10,
            }),
        },
        {
          label: '菜单地址',
          key: 'menuUrl',
          required: true,
          value: ref(null),
          disabled: ref(false),
          render: (formItem) =>
            renderInput(formItem.value, {
              placeholder: '请输入菜单地址',
            }),
        },
        {
          label: '外链地址',
          key: 'outLink',
          value: ref(null),
          render: (formItem) =>
            renderInput(formItem.value, {
              placeholder: '请输入外链地址',
            }),
        },
        {
          label: '菜单图标',
          key: 'icon',
          value: ref(null),
          render: (formItem) => {
            return h(IconSelector, {
              defaultIcon: actionModel == 'edit' ? formItem.value.value : false,
              onUpdateIcon: (newIcon: any) => {
                formItem.value.value = newIcon.name
              },
            })
          },
        },
        {
          label: '是否缓存',
          key: 'cacheable',
          value: ref(0),
          render: (formItem) => renderSwitch(formItem.value, {
            uncheckedValue: 0,
            checkedValue: 1,
          }),
        },
        {
          label: '是否隐藏',
          key: 'hidden',
          value: ref(0),
          render: (formItem) => renderSwitch(formItem.value, {
            uncheckedValue: 0,
            checkedValue: 1,
          }),
        },
        {
          label: '是否固定',
          key: 'affix',
          value: ref(0),
          render: (formItem) => renderSwitch(formItem.value, {
            uncheckedValue: 0,
            checkedValue: 1,
          }),
        },
      ] as Array<FormItem>
      
      // 获取菜单列表
      function doRefresh(){
        get({
          url: getMenuPageList,
          data: {
            pageNum: pagination.page,
            pageSize: pagination.pageSize,
          },
        }).then((res: any) => {
          table.handleSuccess(res.data)
          pagination.setTotalSize((res as any).data.total)
        }).catch(console.log)
      }

      function onAddItem() {
        actionModel = 'add'
        modalDialog.value?.show().then(() => {
          console.log(dataForm.value)
          dataForm.value?.reset()
        })
      }
      
      // 点击编辑按钮
      const onUpdateItem = (item: any) => {
        actionModel = 'edit'
        tempItem = item
        console.log('item:',item)
        itemFormOptions.forEach((it) => {
          if(it.key === 'parentId') { // 一级菜单parentId为0 需单独处理
            it.value.value = item[it.key] || 0
          } else {
            it.value.value = item[it.key]
          }
          if (it.key === 'menuUrl' && it.disabled) {
            if (isExternal(item.menuUrl)) {
              it.value.value = ''
            }
            ;(it.disabled as Ref<boolean>).value = true
          }
        })
        const external = itemFormOptions.find((it) => it.key === 'redirect')
        if (isExternal(item.menuUrl)) {
          external!.value.value = item.menuUrl
        }
        modalDialog.value?.show()
      }

      // 点击提交按钮
      const onConfirm = () => {
        if (actionModel === 'add') {
          const params = dataForm.value?.generatorParams()
          console.log(params)
          if (dataForm.value?.validator()) {
            handleSubmit()
          }
        } else {
          if (dataForm.value?.validator()) {
            const params = dataForm.value?.generatorParams()
            if (tempItem) {
              const tempRoute = findRouteByUrl(
                permissionStore.getPermissionSideBar,
                tempItem.menuUrl
              )
              if (tempRoute && tempRoute.meta && tempRoute.meta.badge) {
                ;(tempRoute.meta as any).badge = (params as any).badge || ''
              }
            }
            handleUpdate()
          }
        }
      }

      // 添加菜单
      const handleSubmit = () => {
        post({
          url: createMenu,
          data: dataForm.value?.generatorParams()
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

      // 修改菜单
      const handleUpdate = () => {
        post({
          url: `${updateMenu}/${tempItem.id}`,
          data: dataForm.value?.generatorParams()
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
          content: '是否要删除此数据？',
          positiveText: '删除',
          onPositiveClick: () => {
            handleDel(item.id)
          },
        })
      }

      // 删除菜单
      const handleDel = (id: number) => {
        post({
          url: `${deleteMenu}/${id}`
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

      onMounted(doRefresh)

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
        pagination
      }
    },
  })
</script>
<style lang="scss" scoped>
  .icon-wrapper {
    list-style: none;
    border: 1px solid #f5f5f5;
    overflow: hidden;
    padding: 0;
    .icon-item {
      float: left;
      width: 25%;
      font-size: 26px;
      border-right: 1px solid #f5f5f5;
      border-bottom: 1px solid #f5f5f5;
      text-align: center;
      cursor: pointer;
      & > div {
        font-size: 12px;
      }
      &:hover {
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
      }
    }
  }
</style>
