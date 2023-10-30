<!-- 
  page: 分配角色
 -->
<template>
  <div class="main-container">
    <TableBody>
      <template #header>
        <TableHeader :show-filter="false" title="角色列表">
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
        />
      </template>
      <template #footer>
        <TableFooter ref="tableFooterRef" :pagination="pagination" />
      </template>
    </TableBody>

    <!-- 添加dialog -->
    <ModalDialog ref="modalDialogRef" @confirm="onDataFormConfirm" :title="isEdit ? '编辑角色' : '添加角色'">
      <template #content>
        <DataForm ref="dataFormRef" :options="formItems" />
      </template>
    </ModalDialog>

    <!-- 分配菜单权限dialog -->
    <ModalDialog ref="menuModalDialogRef" title="菜单权限" contentHeight="40vh" @confirm="onSavePermision">
      <template #content>
        <n-tree
          ref="myTree"
          :data="menuData"
          checkable
          block-line
          cascade
          :default-expand-all="true"
          :default-checked-keys="defaultCheckedKeys"
        />
      </template>
    </ModalDialog>

     <!-- 分配数据权限1.0 -->
     <ModalDialog ref="dataModalDialogRef" title="数据权限" contentHeight="40vh" @confirm="onSaveDataPermision">
      <template #content>
        <DataForm ref="perDataFormRef" :options="dataFormItems" />
      </template>
    </ModalDialog>
  </div>
</template>

<script lang="ts">
  import { defineComponent, h, nextTick, onMounted, ref, shallowReactive } from 'vue'

  import { post, get } from '@/api/utils/http'
  import { addRole, getRoleList, updateRole, delRole, getRoleMenuList, updateMenuPermission, dataPermission } from '@/api/url/role'
  import { getDictDataByType } from '@/api/url/common'
  
  import { TableActionModel, useRenderAction, useRowKey, useTable, useTableColumn, usePagination } from '@/hooks/table'
  import { DataFormType, ModalDialogType, FormItem, TreeType } from '@/types/components'

  import { DataTableColumn, NInput, TreeOption, useDialog, useMessage, NSelect, SelectOption } from 'naive-ui'


  interface RoleModeType {
    roleName: string
    roleCode: string
    description: string
  }
  const ROLE_CODE_FLAG = 'ROLE_'
  const formItems = [
    {
      label: '角色名称',
      type: 'input',
      key: 'name',
      value: ref(null),
      validator: (formItem, message) => {
        if (!formItem.value.value) {
          message.error('请输入角色名称')
          return false
        }
        return true
      },
      render: (formItem) => {
        return h(NInput, {
          value: formItem.value.value,
          maxlength: 100,
          onUpdateValue: (val) => {
            formItem.value.value = val
          },
          placeholder: '请输入',
        })
      },
    },
    {
      label: '角色编号',
      key: 'roleCode',
      value: ref(null),
      validator: (formItem, message) => {
        if (!formItem.value.value) {
          message.error('请输入角色编号')
          return false
        }
        return true
      },
      render: (formItem) => {
        return h(
          NInput,
          {
            value: formItem.value.value,
            maxlength: 100,
            onUpdateValue: (val) => {
              formItem.value.value = val
            },
            placeholder: '请输入',
          },
          {
            prefix: () => h('div', ROLE_CODE_FLAG),
          }
        )
      },
    },
    {
      label: '角色描述',
      key: 'description',
      value: ref(null),
      inputType: 'text',
      validator: (formItem, message) => {
        if (!formItem.value.value) {
          message.error('请输入角色描述')
          return false
        }
        return true
      },
      render: (formItem) => {
        return h(NInput, {
          value: formItem.value.value,
          maxlength: 255,
          showCount: true,
          onUpdateValue: (val) => {
            formItem.value.value = val
          },
          placeholder: '请输入角色描述',
          type: 'textarea',
          rows: 3,
        })
      },
    },
  ] as FormItem[]

  // 数据权限表单
  const dataFormItems = [
    {
      label: '角色名称',
      type: 'input',
      key: 'name',
      value: ref(null),
      render: (formItem) => {
        return h(NInput, {
          value: formItem.value.value,
          disabled: true
        })
      },
    },
    {
      label: '角色编号',
      key: 'roleCode',
      value: ref(null),
      render: (formItem) => {
        return h(
          NInput,
          {
            value: formItem.value.value,
            disabled: true
          },
          {
            prefix: () => h('div', ROLE_CODE_FLAG),
          }
        )
      },
    },
    {
      label: '数据边界',
      key: 'type',
      value: ref(null),
      optionItems: [],
      render: (formItem) => {
        return h(NSelect, {
          options: formItem.optionItems as Array<SelectOption>,
          value: formItem.value.value,
          labelField: 'dictLabel',
          valueField: 'dictValue',
          placeholder: '请选择',
          onUpdateValue: (val) => {
            formItem.value.value = val
          },
        })
      },
    },
  ] as FormItem[]
  
  function handleMenuData(
    menuData: Array<any>,
    defaultCheckedKeys: Array<string>,
    defaultExpandedKeys: Array<string>
  ) {
    const tempMenus = [] as Array<TreeOption>
    menuData.forEach((it) => {
      const tempMenu = {} as TreeOption
      tempMenu.key = it.id
      tempMenu.label = it.menuName
      if(it.isBlank * 1 === 1) {
        defaultCheckedKeys.push(tempMenu.key as string)
      }
      if (it.children) {
        defaultExpandedKeys.push(tempMenu.key as string)
        tempMenu.children = handleMenuData(it.children, defaultCheckedKeys, defaultExpandedKeys)
      }
      tempMenus.push(tempMenu)
    })
    return tempMenus
  }


  export default defineComponent({
    name: 'Role',
    setup() {
      const myTree = ref<TreeType | null>(null)
      const modalDialogRef = ref<ModalDialogType | null>(null)
      const dataFormRef = ref<DataFormType | null>(null)
      const perDataFormRef = ref<DataFormType | null>(null)

      const menuModalDialogRef = ref<ModalDialogType | null>(null)
      const dataModalDialogRef = ref<ModalDialogType | null>(null)

      const menuData = shallowReactive([] as Array<TreeOption>)
      const table = useTable<RoleModeType>()
      const rowKey = useRowKey('id')
      const pagination = usePagination(doRefresh)
      const naiveDialog = useDialog()
      const message = useMessage()

      let defaultCheckedKeys = shallowReactive([] as Array<string>)
      const defaultExpandedKeys = shallowReactive([] as Array<string>)

      let isEdit = ref<boolean>(false)
      let _id = ref<number>()

      const tableColumns = useTableColumn(
        [
          // table.indexColumn,
          {
            title: '角色ID',
            key: 'id',
          },
          {
            title: '角色名称',
            key: 'name',
          },
          {
            title: '角色编号',
            key: 'roleCode',
          },
          {
            title: '角色描述',
            key: 'description',
            ellipsis: {
              tooltip: true
            }
          },
          {
            title: '创建时间',
            key: 'createTime',
          },
          {
            title: '操作',
            key: 'actions',
            width: 280,
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
                {
                  label: '菜单权限',
                  type: 'success',
                  onClick: onShowMenu.bind(null, rowData),
                },
                {
                  label: '数据权限',
                  type: 'warning',
                  onClick: onShowDataPer.bind(null, rowData),
                },
              ] as TableActionModel[])
            },
          },
        ],
        {
          align: 'center',
        } as DataTableColumn
      )

      // 获取列表
      function doRefresh() {
        get<Array<RoleModeType>>({
          url: getRoleList,
          data: {
            pageNum: pagination.page,
            pageSize: pagination.pageSize,
          },
        }).then((res: any) => {
          table.handleSuccess(res.data)
          pagination.setTotalSize((res as any).data.total)
        }).catch(console.log)
      }

      // 点击添加按钮
      const onAddItem = () => {
        isEdit.value = false
        modalDialogRef.value?.toggle()
        nextTick(() => {
          dataFormRef.value?.reset()
        })
      }

      // 点击编辑按钮
      function onUpdateItem(item: any) {
        isEdit.value = true
        _id.value = item.id
        modalDialogRef.value?.toggle()
        nextTick(() => {
          formItems.forEach((it) => {
            const key = it.key
            const propName = item[key]
            if (propName) {
              if (it.key === 'roleCode') {
                it.value.value = propName.replace(ROLE_CODE_FLAG, '')
              } else {
                it.value.value = propName
              }
            }
          })
        })
      }

      // 点击删除按钮
      const onDeleteItem = (data: any) => {
        naiveDialog.warning({
          title: '提示',
          content: '是否要删除此数据？',
          positiveText: '删除',
          onPositiveClick: () => {
            handleDel(data)
          },
        })
      }

      // 提交角色信息
      const onDataFormConfirm = () => {
        if (dataFormRef.value?.validator()) {
          if (isEdit.value) {
            handleUpdate()
          } else {
            handleSubmit()
          }
        }
      }

      // 提交 信息
      const handleSubmit = () => {
        post({
          url: addRole,
          data: dataFormRef.value?.generatorParams()
        }).then((res: any) => {
          if (res.code * 1 === 200) {
            modalDialogRef.value?.toggle()
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

      // 编辑信息
      const handleUpdate = () => {
        post({
          url: `${updateRole}/${_id.value}`,
          data: dataFormRef.value?.generatorParams()
        }).then((res: any) => {
          if (res.code * 1 === 200) {
            modalDialogRef.value?.toggle()
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

      // 删除角色
      const handleDel = (data: any) => {
        post({
          url: `${delRole}/${data.id}`
        }).then( (res: any) => {
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

      // 点击菜单权限按钮
      function onShowMenu(item: any) {
        _id.value = item.id
        get({
          url: getRoleMenuList,
          data: {
            roleIds: item.id,
          },
        }).then((res) => {
          menuData.length = 0
          defaultCheckedKeys.length = 0
          menuData.push(...handleMenuData(res.data, defaultCheckedKeys, defaultExpandedKeys))
          menuModalDialogRef.value?.toggle()
        }).catch(err => {
          message.error(err.message)
        })
      }

      // 保存菜单权限
      const onSavePermision = () => {
        let _select = myTree.value?.getCheckedData() || []
        post({
          url: `${updateMenuPermission}?id=${_id.value}&menuPermissionIds=${_select.keys.toString()}`
        }).then((res: any) => {
          if (res.code * 1 === 200) {
            menuModalDialogRef.value?.toggle()
            message.success('分配成功', {
                duration: 1500,
                onAfterLeave: () => {
                  doRefresh()
                }
              }
            )
          } else {
            message.error(res.message)
          }
          console.log(res)
        }).catch(err => {
          message.error(err.message)
        })
      }

      // 数据权限列表数据
      const getDict = () => {
        post({
          url: `${getDictDataByType}/tms_pc_role_permission`
        }).then((res:any) => {
          dataFormItems[2].optionItems = res.data.tms_pc_role_permission
        })
      }

      // 点击分配数据权限
      const onShowDataPer = (item: any) => {
        _id.value = item.id
        dataModalDialogRef.value?.toggle()
        nextTick(() => {
          dataFormItems.forEach((it) => {
            const key = it.key
            const propName = item[key]
            if (propName) {
              if (it.key === 'roleCode') {
                it.value.value = propName.replace(ROLE_CODE_FLAG, '')
              } else if(it.key === 'type') {
                it.value.value = propName.toString()
              } else {
                it.value.value = propName
              }
            }
          })
        })
      }

      // 保存数据权限
      const onSaveDataPermision = () => {
        get({
          url: dataPermission,
          data: {
            permissionIds: -1, // 非自定义
            roleId: _id.value,
            type: perDataFormRef.value?.generatorParams().type
          }
        }).then((res: any) => {
          if (res.code * 1 === 200) {
            dataModalDialogRef.value?.toggle()
            message.success('分配成功', {
                duration: 1500,
                onAfterLeave: () => {
                  doRefresh()
                }
              }
            )
          } else {
            message.error(res.message)
          }
          console.log(res)
        }).catch(err => {
          message.error(err.message)
        })
      }

      onMounted(() => {
        doRefresh()
        getDict()
      })

      return {
        modalDialogRef,
        menuModalDialogRef,
        dataFormRef,
        rowKey,
        menuData,
        tableColumns,
        formItems,
        defaultCheckedKeys,
        defaultExpandedKeys,
        ...table,
        onAddItem,
        onDataFormConfirm,
        pagination,
        isEdit,
        onSavePermision,
        myTree,
        perDataFormRef,
        onShowDataPer,
        onSaveDataPermision,
        dataFormItems,
        dataModalDialogRef
      }
    },
  })
</script>
