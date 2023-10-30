<!-- 
  page: 系统用户列表
-->
<template>
  <div>
    <TableBody>
      <template #header>
        <TableHeader 
          ref="tableHeaderRef" 
          title="用户列表" 
          :show-filter="true"
          @search="onSearch"
          @reset-search="onResetSearch"
        >
          <template #top-right>
            <AddButton @add="onAddItem" />
          </template>
          <template #search-content>
            <DataForm ref="searchForm" :form-config="{ labelWidth: 80 }" :options="conditionItems" preset="grid-item" />
          </template>
        </TableHeader>
      </template>
      <template #default>
        <n-data-table
          :loading="tableLoading"
          :data="dataList"
          :row-key="rowKey"
          :columns="tableColumns"
          :scroll-x="1000"
          :style="{ height: `${tableHeight}px` }"
          :flex-height="true"
        />
      </template>
      <template #footer>
        <TableFooter ref="tableFooterRef" :pagination="pagination" />
      </template>
    </TableBody>

    <!-- 添加dialog -->
    <ModalDialog ref="modalDialogRef" :title="isEdit ? '编辑用户' : '添加用户'" @confirm="onDataFormConfirm">
      <template #content>
        <n-alert title="说明" type="warning">
          手机号将作为本系统的登录账号
        </n-alert>
        <DataForm class="mt-4" ref="dataFormRef" :options="dialogFormItems"  :form-config="{ labelWidth: 80 }"  />
      </template>
    </ModalDialog>

    <!-- 分配角色弹窗 -->
    <ModalDialog ref="assignRolesDialog" title="分配角色" @confirm="onUpdateRole">
      <template #content>
        <DataForm ref="assignRolesFormRef" :options="assignRolesOptions" />
      </template>
    </ModalDialog>

    <!-- 修改密码dialog -->
    <ModalDialog ref="modalPwdDialogRef" title="密码重置" @confirm="handleResetPwd">
      <template #content>
        <DataForm ref="pwdFormRef" :options="dialogPwdFormItems" :form-config="{ labelWidth: 100 }" />
      </template>
    </ModalDialog>
  </div>
</template>

<script lang="ts">
  import { defineComponent, h, onMounted, ref, nextTick, unref } from 'vue'

  import { post, get } from '@/api/utils/http'
  import { getUserList, deleteUser, createUser, updateUser, updateUserRole, getUserRole, updateStatus, updatePassword, getUserInfo } from '@/api/url/adminuser'
  import { getAllRole } from '@/api/url/role'
  import { getParentDepartment } from '@/api/url/department'
  
  import { transformTreeSelect } from '@/utils'
  import { renderTag, renderRadioButtonGroup, renderTreeSelect } from '@/hooks/form'
  import { TableActionModel, usePagination, useRenderAction, useRowKey, useTable, useTableColumn, useTableHeight } from '@/hooks/table'
  import { DataFormType, ModalDialogType, FormItem } from '@/types/components'

  import { DataTableColumn, useDialog, useMessage, NInput, NSwitch, NSelect, SelectOption, NInputGroup, NInputGroupLabel } from 'naive-ui'

  export default defineComponent({
    name: 'AdminUserList',
    setup() {
      const searchForm = ref<DataFormType | null>(null) // 搜索表单

      const modalDialogRef = ref<ModalDialogType | null>(null) // 添加dialog
      const assignRolesDialog = ref<ModalDialogType | null>(null) // 分配角色dialog
      const modalPwdDialogRef = ref<ModalDialogType | null>(null) // 重置密码dialog
      
      const dataFormRef = ref<DataFormType | null>(null) // 添加/编辑弹窗表单
      const assignRolesFormRef = ref<DataFormType | null>(null) // 分配角色表单
      const pwdFormRef = ref<DataFormType | null>(null) // 重置密码表单

      const table = useTable()
      const rowKey = useRowKey('id')
      const pagination = usePagination(doRefresh)
      pagination.pageSize = 10

      const naiveDialog = useDialog()
      const message = useMessage()

      let isEdit = ref<boolean>(false)
      let currentId = ref<number>()
      let organize = ''

      // 表格表头
      const tableColumns = useTableColumn(
        [
          // table.indexColumn,
          {
            title: '用户ID',
            key: 'id',
          },
          {
            title: '账号',
            key: 'username',
          },
          {
            title: '姓名',
            key: 'nickName',
          },
          {
            title: '所属部门',
            key: 'organize',
          },
          {
            title: '角色',
            key: 'roleName',
          },
          {
            title: '邮箱',
            key: 'email',
          },
          {
            title: '状态',
            key: 'status',
            render: (rowData:any) =>
              renderTag(!!rowData.status ? '正常' : '禁用', {
                type: !!rowData.status ? 'success' : 'error',
                size: 'small',
              }),
          },
          {
            title: '是否启用',
            key: 'status',
            render: (rowData) => {
              return h (NSwitch, {
                value: !!rowData.status,
                onUpdateValue: (newVal: number) => {
                  updateUserStatus(rowData, newVal)
                },
              })
            }
          },
          {
            title: '操作',
            key: 'actions',
            fixed: 'right',
            width: 300,
            render: (rowData) => {
              return useRenderAction([
                {
                  label: '分配角色',
                  type: 'success',
                  onClick: onAssignRoles.bind(null, rowData),
                },
                {
                  label: '修改密码',
                  type: 'warning',
                  onClick: handleReset.bind(null, rowData),
                },
                {
                  label: '编辑',
                  type: 'info',
                  onClick: handleEdit.bind(null, rowData),
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
        } as DataTableColumn
      )
      
      // 筛选搜索表单
      const conditionItems: Array<FormItem> = [
        {
          key: 'keyword',
          label: '搜索内容',
          value: ref(null),
          render: (formItem) => {
            return h(NInput, {
              value: formItem.value.value,
              placeholder: '请输入姓名/手机号',
              onUpdateValue: (val) => {
                formItem.value.value = val
              },
            })
          },
        },
      ]
      
      // 添加/编辑弹窗表单
      const dialogFormItems = [
      {
          label: '所属部门',
          key: 'orgId',
          value: ref(null),
          required: true,
          optionItems: [],
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
                ...transformTreeSelect(unref(formItem.optionItems)!, 'name', 'id')
              ],
              {
                disabled: isEdit.value,
                showPath: true,
                onUpdateValue: (val:any, option:any) => {
                  formItem.value.value = val
                  organize = option.label
                }
              },
            ),
        },
        {
          label: '姓名',
          type: 'input',
          key: 'name',
          value: ref(null),
          required: true,
          validator: (formItem, message) => {
            if (!formItem.value.value) {
              message.error('请输入姓名')
              return false
            }
            return true
          },
          render: (formItem) => {
            return h(NInput, {
              value: formItem.value.value,
              onUpdateValue: (val) => {
                formItem.value.value = val
              },
              placeholder: '请输入',
            })
          },
        },
        {
          label: '手机号',
          type: 'input',
          key: 'username',
          value: ref(null),
          required: true,
          validator: (formItem, message) => {
            let regExp = /^1[3456789]\d{9}$/
            if (!formItem.value.value) {
              message.error('请输入手机号')
              return false
            } else if(!regExp.test(formItem.value.value)) {
              message.error('手机号码格式错误')
              return false
            }
            return true
          },
          render: (formItem) => {
            return h(NInput, {
              value: formItem.value.value,
              maxlength: 11,
              onUpdateValue: (val) => {
                formItem.value.value = val
              },
              placeholder: '请输入',
            })
          },
        },
        
        {
          label: '邮箱',
          type: 'input',
          key: 'email',
          value: ref(null),
          render: (formItem) => {
            return h(NInput, {
              value: formItem.value.value,
              onUpdateValue: (val) => {
                formItem.value.value = val
              },
              placeholder: '请输入',
            })
          },
        },
        {
          label: '密码',
          type: 'input',
          key: 'password',
          value: ref(null),
          required: true,
          validator: (formItem, message) => {
            if (!formItem.value.value) {
              message.error('请输入密码')
              return false
            }
            return true
          },
          render: (formItem) => {
            return h(
              NInputGroup,
              [
                h(
                  NInput,
                  {
                    value: formItem.value.value,
                    type: 'password',
                    minlength: 6,
                    maxlength: 16,
                    disabled: isEdit.value,
                    onUpdateValue: (val:any) => {
                      formItem.value.value = val
                    },
                    placeholder: '请输入',
                  },
                ),
                h(
                  NInputGroupLabel,{
                    style: { color: '#F50810' },
                  },
                  '6-16个字符组成，区分大小写'
                ),
              ] 
            )
          },
        },
        {
          label: '是否启用',
          key: 'status',
          value: ref(null),
          required: true,
          validator: (formItem, message) => {
            if (formItem.value.value == undefined || null) {
              message.error('请选择是否启用')
              return false
            }
            return true
          },
          render: (formItem) => {
            return renderRadioButtonGroup(formItem.value, [
              {
                label: '是',
                value: 1,
              },
              {
                label: '否',
                value: 0,
              }
            ])
          },
        },
        {
          label: '备注',
          key: 'note',
          value: ref(null),
          inputType: 'text',
          validator: (formItem, message) => {
            if (!formItem.value.value) {
              message.error('请输入备注')
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
              placeholder: '请输入备注',
              type: 'textarea',
              rows: 3,
            })
          },
        },
      ] as Array<FormItem>
      
      // 修改密码form表单 
      const dialogPwdFormItems = [
        {
          label: '旧密码',
          type: 'password',
          key: 'oldPassword',
          value: ref(null),
          required: true,
          validator: (formItem, message) => {
            if (!formItem.value.value) {
              message.error('请输入旧密码')
              return false
            }
            return true
          },
          render: (formItem) => {
            return h(NInput, {
              value: formItem.value.value,
              onUpdateValue: (val) => {
                formItem.value.value = val
              },
              placeholder: '请输入',
            })
          },
        },
        {
          label: '新密码',
          key: 'newPassword',
          value: ref(null),
          required: true,
          validator: (formItem, message) => {
            if (!formItem.value.value) {
              message.error('请输入新密码')
              return false
            }
            return true
          },
          render: (formItem) => {
            return h(
              NInputGroup,
              [
                h(
                  NInput,
                  {
                    value: formItem.value.value,
                    type: 'password',
                    minlength: 6,
                    maxlength: 16,
                    onUpdateValue: (val:any) => {
                      formItem.value.value = val
                    },
                    placeholder: '请输入',
                  },
                ),
                h(
                  NInputGroupLabel,{
                    style: { color: '#F50810' },
                  },
                  '6-16个字符组成，区分大小写'
                ),
              ] 
            )
          },
        },
      ] as Array<FormItem>
      
      // 分配角色弹窗表单
      const assignRolesOptions: FormItem[] = [
        {
          key: 'roleIds',
          label: '用户角色',
          value: ref([]),
          optionItems: [],
          render: (formItem) => {
            return h(NSelect, {
              options: formItem.optionItems as Array<SelectOption>,
              value: formItem.value.value,
              labelField: 'name',
              valueField: 'id',
              placeholder: '请选择用户角色',
              multiple: true,
              onUpdateValue: (val) => {
                formItem.value.value = val
              },
            })
          },
        },
      ]

      // 获取列表数据
      function doRefresh() {
        get({
          url: getUserList,
          data: () => {
            return {
              pageNum: pagination.page,
              pageSize: pagination.pageSize,
              ...searchForm.value?.generatorParams() // 查询条件
            }
          },
        }).then((res) => {
          table.handleSuccess(res.data)
          pagination.setTotalSize((res as any).data.total )
        }).catch(console.log)
      }

      // 搜索
      const onSearch = () => {
        pagination.page =  1
        doRefresh()
      }

      // 重制搜索内容
      const onResetSearch = () => {
        searchForm.value?.reset()
      }

      // 点击添加按钮
      const onAddItem = () => {
        isEdit.value = false
        modalDialogRef.value?.toggle()
        nextTick(() => {
          dataFormRef.value?.reset()
        })
      }

      // 删除用户
      function onDeleteItem(item: any) {
        naiveDialog.warning({
          title: '提示',
          content: '确定要删除此数据吗？',
          positiveText: '确定',
          onPositiveClick: () => {
            post({
              url: `${deleteUser}/${item.id}`
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
      
      // 点击编辑用户
      const handleEdit = (item: any) => {
        currentId.value = item.id
        isEdit.value = true
        get({
          url: `${getUserInfo}/${item.id}`
        }).then( (res:any ) => {
          let _data = res.data
          modalDialogRef.value?.toggle()
          nextTick(() => {
            organize = _data.organize

            dialogFormItems.forEach((it) => {
              const key = it.key
              const propName = _data[key]
              it.value.value = propName
            })
          })
        })
      }

      // dialog点击确认
      const onDataFormConfirm = () => {
        if(dataFormRef.value?.validator()){
          if(isEdit.value) { // 修改用户信息
            handleUpdateUser()
          } else { // 添加用户
            handleCreateUser()
          }
        } else {
          return false
        }
      }

      // 点击重置密码
      const handleReset = (item: any) => {
        currentId.value = item.username
        isEdit.value = true
        modalPwdDialogRef.value?.toggle()
      }

      // 修改密码
      const handleResetPwd = () => {
        post({
          url: `${updatePassword}`,
          data: {
            username: currentId.value,
            ...pwdFormRef.value?.generatorParams()
          }
        }).then((res: any) => {
          if (res.code * 1 === 200) {
            modalPwdDialogRef.value?.toggle()
            currentId.value = -1
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

      // 创建用户
      const handleCreateUser = () => {
        post({
          url: createUser,
          data: {
            organize: organize,
            ...dataFormRef.value?.generatorParams()
          }
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

      // 修改用户信息
      const handleUpdateUser = () => {
        post({
          url: `${updateUser}/${currentId.value}`,
          data: {
            organize: organize,
            ...dataFormRef.value?.generatorParams()
          }
        }).then((res: any) => {
          if (res.code * 1 === 200) {
            modalDialogRef.value?.toggle()
            currentId.value = -1
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

      // 点击分配角色
      const onAssignRoles = (item:any) => {
        assignRolesOptions[0].value.value = []
        currentId.value = item.id
        get({
          url: `${getUserRole}/${item.id}`
        }).then(res => {
          let _arr:any = []
          if(res.data.length > 0) {
            res.data.forEach((item: any) => {
              _arr.push(item.id)
            })
            assignRolesOptions[0].value.value.push(..._arr)
          }
        }).catch(err => {
          message.error(err.message)
        })
        assignRolesDialog.value?.toggle()
      }

      // 分配角色
      const onUpdateRole = () => {
        let _arr = assignRolesFormRef.value?.generatorParams().roleIds
        post({
          url: `${updateUserRole}?adminId=${currentId.value}&roleIds=${_arr}`
        }).then((res: any) => {
          if (res.code * 1 === 200) {
            assignRolesDialog.value?.toggle()
            currentId.value = -1
            message.success('分配成功', {
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

      // 修改账号状态
      const updateUserStatus = (data: any, status: number) => {
        post({
          url: `${updateStatus}/${data.id}?status=${status*1}`,
        }).then(() => {
          doRefresh()
        })
      }

      // 获取角色列表
      const handleGetRoles = () => {
        get({
          url: getAllRole,
        }).then(res => {
          assignRolesOptions[0].optionItems = [...res.data]
        })
      }

       // 获取上级(部门)
       const getDepartmentList = () => {
        post({
          url: getParentDepartment
        }).then( (res:any) => {
          dialogFormItems[0].optionItems = res.data
        })
      }
   
      onMounted(async () => {
        table.tableHeight.value = await useTableHeight()
        doRefresh()
        handleGetRoles()
        getDepartmentList()
       
      })
      
      return {
        ...table,
        rowKey,
        pattern: ref(''),
        tableColumns,
        pagination,
        onDeleteItem,
        onAddItem,
        onDataFormConfirm,
        searchForm,
        modalDialogRef,
        dialogFormItems,
        handleEdit,
        dataFormRef,
        isEdit,
        currentId,
        onSearch,
        onResetSearch,
        conditionItems,
        assignRolesDialog,
        assignRolesFormRef,
        assignRolesOptions,
        onAssignRoles,
        onUpdateRole,
        modalPwdDialogRef,
        pwdFormRef,
        dialogPwdFormItems,
        handleResetPwd
      }
    },
  })
</script>

<style lang="scss" scoped>
  .avatar-container {
    position: relative;
    width: 30px;
    margin: 0 auto;
    vertical-align: middle;
    .avatar {
      width: 100%;
      border-radius: 50%;
    }
    .avatar-vip {
      border: 2px solid #cece1e;
    }
    .vip {
      position: absolute;
      top: 0;
      right: -9px;
      width: 15px;
      transform: rotate(60deg);
    }
  }
  .gender-container {
    .gender-icon {
      width: 20px;
    }
  }
</style>
