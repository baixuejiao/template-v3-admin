<!-- 商家端账号管理 -->
<!-- 
  page: 
  auth: 
  date: 
 -->
<template>
  <div class="main-container">
    <TableBody ref="tableBody">
      <template #header>
        <TableHeader
          :show-filter="true"
          title="商家端账号管理"
          @search="onSearch"
          @reset-search="onResetSearch"
        >
          <template #top-right>
            <AddButton @add="onAddItem" />
            <DownloadButton @download="handleDownload" buttonText="导出列表" />
          </template>
          <template #search-content>
            <DataForm
              ref="searchForm"
              :form-config="{
                labelWidth: 125,
              }"
              :options="conditionItems"
              preset="grid-item"
            />
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

    <!-- 添加账户dialog -->
    <ModalDialog ref="modalDialogRef" :title="isEdit ? '编辑' : '添加'" @confirm="onDataFormConfirm">
      <template #content>
        <DataForm 
          ref="dataFormRef" 
          :options="dialogFormItems" 
          :form-config="{
          labelWidth: 100,
          }" 
        />
      </template>
    </ModalDialog>

    <!-- 修改密码dialog -->
    <ModalDialog ref="modalPwdDialogRef" title="密码重置" @confirm="handleResetPwd">
      <template #content>
        <DataForm 
          ref="pwdFormRef" 
          :options="dialogPwdFormItems" 
          :form-config="{
          labelWidth: 100,
          }" 
        />
      </template>
    </ModalDialog>
  </div>
</template>

<script lang="ts">

  import { defineComponent, h, onMounted, ref, nextTick} from 'vue'

  import { post, postExport } from '@/api/utils/http'
  import { getMerchantList, createUser, updateUser, updateStatus, getParentList, exportMemberList } from '@/api/url/account'
  // import { getShopList } from '@/api/url/shop'
  import { exportFile } from '@/utils/common'
  
  import { usePagination, useRowKey, useTable, useTableColumn, useTableHeight, useRenderAction, TableActionModel } from '@/hooks/table'
  import { DataFormType, ModalDialogType, FormItem } from '@/types/components'

  import {
    DataTableColumn,
    NInput,
    NSelect,
    SelectOption,
    NCascader,
    CascaderOption,
    NSwitch,
    useMessage,
    useDialog
  } from 'naive-ui'

  import pcaCode from '@/assets/data/pca-code.json'
  

  
  export default defineComponent({
    name: 'MerchantAccount',
    setup() {
      const searchForm = ref<DataFormType | null>(null) // 搜索表单
      const modalDialogRef = ref<ModalDialogType | null>(null)
      const dataFormRef = ref<DataFormType | null>(null) // 添加/编辑弹窗表单
      const modalPwdDialogRef = ref<ModalDialogType | null>(null)
      const pwdFormRef = ref<DataFormType | null>(null) // 重置密码表单
     
      const table = useTable() // 表格
      const rowKey = useRowKey('id')
      const pagination = usePagination(doRefresh) // 分页信息
      pagination.pageSize = 10

      const message = useMessage() // 消息提示
      const naiveDialog = useDialog() //提示框

      const isEdit = ref<boolean>(false)
      let currentId = ref<number>()
      let organize = ''
      
      // 表格表头
      const tableColumns = useTableColumn(
        [
          {
            title: '店铺负责人',
            key: 'name',
          },
          {
            title: '店铺账号',
            key: 'username',
          },
          {
            title: '所属店铺',
            key: 'parentMerchant',
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
            render: (rowData: any) => {
              return useRenderAction([
                {
                  label: '修改信息',
                  type: 'info',
                  onClick: handleEdit.bind(null, rowData),
                },
                {
                  label: '重置密码',
                  type: 'warning',
                  onClick: handleEditPwd.bind(null, rowData),
                },
              ] as TableActionModel[])
              
            },
          },
        ],
        {
          align: 'center',
        } as DataTableColumn
      )
      
        // 筛选区域表单配置
      const conditionItems: Array<FormItem> = [
        {
          key: 'username',
          label: '商户账号：',
          value: ref(null),
          render: (formItem) => {
            return h(NInput, {
              value: formItem.value.value,
              maxlength: 20,
              placeholder: '请输入',
              onUpdateValue: (val) => {
                formItem.value.value = val
              },
            })
          },
        }, 
        {
          key: 'organize',
          label: '商户名称：',
          value: ref(null),
          render: (formItem) => {
            return h(NInput, {
              value: formItem.value.value,
              maxlength: 20,
              placeholder: '请输入',
              onUpdateValue: (val) => {
                formItem.value.value = val
              },
            })
          },
        }
      ]
      // 添加/编辑弹窗表单
      const dialogFormItems = [
        {
          label: '店铺账号',
          type: 'input',
          key: 'username',
          value: ref(null),
          required: true,
          validator: (formItem, message) => {
            if (!formItem.value.value) {
              message.error('请输入店铺账号')
              return false
            }
            return true
          },
          render: (formItem) => {
            return h(NInput, {
              value: formItem.value.value,
              maxlength: 20,
              onUpdateValue: (val) => {
                formItem.value.value = val
              },
              placeholder: '请输入',
            })
          },
        },
        {
          label: '店铺负责人',
          type: 'input',
          key: 'name',
          value: ref(null),
          required: true,
          validator: (formItem, message) => {
            if (!formItem.value.value) {
              message.error('请输入店铺负责人')
              return false
            }
            return true
          },
          render: (formItem) => {
            return h(NInput, {
              value: formItem.value.value,
              maxlength: 20,
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
          inputType: 'password',
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
            return h(NInput, {
              value: formItem.value.value,
              type: 'password',
              maxlength: 20,
              minlength: 10,
              disabled: isEdit.value,
              onUpdateValue: (val) => {
                formItem.value.value = val
              },
              placeholder: '请输入',
            })
          },
        },
        {
          key: 'orgId',
          label: '所属店铺',
          value: ref([]),
          required: true,
          optionItems: [],
          validator: (formItem, message) => {
            if (!formItem.value.value) {
              message.error('请选择所属店铺')
              return false
            }
            return true
          },
          render: (formItem) => {
            return h(NSelect, {
              options: formItem.optionItems as Array<SelectOption>,
              value: formItem.value.value,
              labelField: 'name',
              valueField: 'id',
              placeholder: '请选择',
              onUpdateValue: (val, option:any) => {
                console.log(val, option)
                formItem.value.value = val
                organize = option.name
              },
            })
          },
        },
      ] as Array<FormItem>

      const dialogPwdFormItems = [
        {
          label: '密码',
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
            return h(NInput, {
              value: formItem.value.value,
              type: 'password',
              maxlength: 20,
              minlength: 10,
              onUpdateValue: (val) => {
                formItem.value.value = val
              },
              placeholder: '请输入',
            })
          },
        },
      ] as Array<FormItem>
      
      // 获取列表数据
      function doRefresh() {
        post({
          url: getMerchantList,
          data: {
            pageNum: pagination.page,
            pageSize: pagination.pageSize,
            ...searchForm.value?.generatorParams() // 查询条件
          }
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

      // 重置搜索
      function onResetSearch() {
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

      // 点击编辑用户
      const handleEdit = (item: any) => {
        currentId.value = item.adminId
        isEdit.value = true
        organize = item.organize
        modalDialogRef.value?.toggle()
        nextTick(() => {
          dialogFormItems.forEach((it) => {
            const key = it.key
            const propName = item[key]
            if (key == 'orgId') {
              it.value.value = item.organizeId
            } else {
              it.value.value = propName
            }
          })
        })
      }

      // 点击重置密码
      const handleEditPwd = (item: any) => {
        currentId.value = item.adminId
        isEdit.value = true
        modalPwdDialogRef.value?.toggle()
      }

      // dialog点击确认
      const onDataFormConfirm = () => {
        if(dataFormRef.value?.validator()){
          if(isEdit.value) { // 修改账号信息
            handleUpdateUser()
          } else { // 添加账号
            handleCreateUser()
          }
        } else {
          return false
        }
      }

      // 添加账号

      const handleCreateUser = () => {
        post({
          url: createUser,
          data: {
            userType: 1,
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

      // 修改信息
      const handleUpdateUser = () => {
        let _params = dataFormRef.value?.generatorParams()
        post({
          url: `${updateUser}`,
          data: {
            id: currentId.value,
            userType: 1,
            organize: organize,
            username: _params.username,
            name: _params.name,
            orgId: _params.orgId
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

      // 修改信息
      const handleResetPwd = () => {
        post({
          url: `${updateUser}`,
          data: {
            id: currentId.value,
            userType: 1,
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
      
      // 修改启用状态
      const updateUserStatus = (data: any, status: number) => {
        post({
          url: `${updateStatus}/${data.adminId}?status=${status*1}`,
        }).then(() => {
          doRefresh()
        })
      }

      // 获取店铺列表
      const getSuperiorsList = () => {
        // post({
        //   url: `${getShopList}?pageNum=1&pageSize=9999`,
        // }).then( res => {
        //   dialogFormItems[3].optionItems = [...res.data.list]
        // })
      }

      // 测试下载功能封装导
      const handleDownload = () => {
        let time = new Date()
        let filedir = `${time.getTime()}`
        postExport({
          url: exportMemberList,
          responseType: 'blob'
        }).then(res => {
          exportFile(res, `会员用户列表${filedir}.xlsx`)
        }).catch(err => {
          message.error(err.message)
        })
      }
      
      onMounted(async () => {
        // getSuperiorsList()
        table.tableHeight.value = await useTableHeight()
        doRefresh()
      })

      return {
        ...table,
        rowKey,
        pagination,
        searchForm,
        tableColumns,
        conditionItems,
        onSearch,
        onResetSearch,
        handleEdit,
        onAddItem,
        onDataFormConfirm,
        isEdit,
        dialogFormItems,
        modalDialogRef,
        dataFormRef,
        modalPwdDialogRef,
        pwdFormRef,
        dialogPwdFormItems,
        handleResetPwd,
        handleDownload
      }
    },
  })
</script>
