<!-- 新增/编辑使用帮助 -->
<template>
  <div class="main-container main-form">
    <n-card title="新增/编辑使用帮助">
      <n-form ref="formRef" label-placement="left" require-mark-placement="left" :label-width="100" :model="formData" :rules="rules">
        <n-form-item label="文章标题：" path="title">
          <n-input v-model:value="formData.title" placeholder="请输入" maxlength="100" />
        </n-form-item>
        <n-form-item label="跳转链接：">
          <n-input v-model:value="formData.appletLink" placeholder="请输入" maxlength="100" />
        </n-form-item>
        <n-form-item label="详细内容：">
          <n-card>
            <quill-editor class="quill-container"  v-model:content="formData.info" :options="myOptions" contentType="html"></quill-editor>
          </n-card>
        </n-form-item>
        <n-form-item label="显示：" path="displayFlag">
          <n-space>
            <n-radio-group v-model:value="formData.displayFlag" name="formData.displayFlag">
              <n-radio :value="1">是</n-radio>
              <n-radio :value="0">否</n-radio>
            </n-radio-group>
            <span class="form-tips">选择“否”则该信息暂时不显示在前台</span>
          </n-space>
        </n-form-item>
        <n-form-item>
          <div class="form-btn">
            <n-button attr-type="button" @click="handleBack">
              返回
            </n-button>
          </div>
          <div class="form-btn">
            <n-button type="info" attr-type="button" @click="handleSubmit">
              提交
            </n-button>
          </div>
        </n-form-item>
      </n-form>
    </n-card>
  </div>
</template>
<script lang="ts">
import { QuillEditor, Quill } from '@vueup/vue-quill'
import Compressor from 'compressorjs'
import ImageUploader from "quill-image-uploader"
import '@vueup/vue-quill/dist/vue-quill.snow.css'
Quill.register("modules/imageUploader", ImageUploader)

import { defineComponent, h, onMounted, ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'

import { post, get } from '@/api/utils/http'

import { modMyHelpInfo, createMyHelpInfo, getMyHelpInfo } from '@/api/url/instructions'
import { uploadApi, showUrl } from '@/api/url/file'
import { filePath } from '@/utils/common'

import { FormInst, useMessage} from 'naive-ui'

export default defineComponent({
  name: 'InstructionsCreate',
  components: { QuillEditor },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const { query: { id } } = route

    const formRef = ref<FormInst | null>(null)
    const message = useMessage()
    const isEdit = ref<boolean>(false)

    const dir = filePath('xxx/xxx')

    const rules = {
      title: {
        required: true,
        message: '请输入文章标题',
        trigger: ['blur', 'input']
      },
    }

    // 表单数据
    const formData = ref<any>({
      title: null,
      appletLink: null,
      info: null,
      displayFlag: 1,
    })

    const typeOption = ref<any>([])

    // 表单验证
    const handleSubmit = (e: MouseEvent) => {
      e.preventDefault()
      formRef.value?.validate((errors: any) => {
        if (!errors) {
          if (isEdit.value) { // 修改信息
            handleUpdate()
          } else { // 添加
            handleCreate()
          }
        } else {
          message.error('请核对填写内容')
        }
      })
    }

    // 图片压缩事件回调
    const compressImage = (file: any) => {
      return new Promise((resolve, reject) => {
        new Compressor(file, {
          quality: 0.8, // 设置压缩质量
          maxWidth: 400, // 设置图片最大宽度
          maxHeight: 400, // 设置图片最大高度
          success(result) {
            resolve(result)
          },
          error(error) {
            reject(error)
          }
        })
      })
    }

    //富文本配置项，将模块功能一起写入到配置项内，也可以单独配置Modules
    const myOptions = reactive({
      modules: {
        toolbar: [ //自定义toolbar，或者可以通过essential ,minimal ,full ,以及"" 使用默认选项
          ["bold", "italic", "underline", "strike"],
          ["blockquote", "code-block"],
          ['image'],
          [{ 'align': [] }],
          [{ 'list': 'ordered' }, { 'list': 'bullet' }],
          [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
          [{ 'size': ['small', false, 'large', 'huge'] }],
          [{ 'direction': 'rtl' }],
          [{ 'color': [] }, { 'background': [] }],
          ['clean']
        ],
        // 上传图片
        imageUploader: {
          upload: async (file: any) => {
            try {
              const compressedFile: any = await compressImage(file); // 压缩图片
              return new Promise((resolve, reject) => {
                const formData = new FormData()
                formData.append("file", compressedFile)
                console.log(compressedFile)
                console.log(formData)
                post({
                  url: `${uploadApi}?dir=${dir}`,
                  data: formData,
                  headers: {
                    'Content-Type': 'multipart/form-data' 
                   }
                }).then( (res: any) => {
                  resolve(`${showUrl}/${res.data}`)
                })
              })
            } catch (error) {
              console.error('压缩和上传图像时出错:', error);
            }
          }
        },
      },
      placeholder: '请输入内容...'
    })

    // 返回
    const handleBack = () => {
      router.back()
    }

    // 创建
    const handleCreate = () => {
      post({
        url: createMyHelpInfo,
        data: {
          ...formData.value,
        }
      }).then((res: any) => {
        if (res.code * 1 === 200) {
          message.success('添加成功', {
            duration: 1500,
            onAfterLeave: () => {
              router.push('/system/instructions/list')
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
      post({
        url: `${modMyHelpInfo}`,
        data: {
          id: id,
          ...formData.value
        }
      }).then((res: any) => {
        if (res.code * 1 === 200) {
          message.success('修改成功', {
            duration: 1500,
            onAfterLeave: () => {
              router.push('/system/instructions/list')
            }
          })
        } else {
          message.error(res.message)
        }
      }).catch(err => {
        message.error(err.message)
      })
    }

    // 获取数据
    const getData = () => {
      get({
        url: `${getMyHelpInfo}?id=${id}`,
      }).then((res: any) => {
        if (res.code * 1 === 200) {
          formData.value = res.data
        } else {
          message.error(res.message)
        }
      }).catch(err => {
        message.error(err.message)
      })
    }

    onMounted(async () => {
      isEdit.value = id ? true : false
      if (id) {
        getData()
      }
    })

    return {
      formRef,
      formData,
      rules,
      typeOption,
      handleSubmit,
      handleBack,
      myOptions
    }
  }
})

</script>

<style lang="scss" scoped>
.form-btn {
  margin-right: 50px;
}
.form-tips{
  color: #999999;
}
</style>

<style>
  .ql-editor {
    height: 400px;
  }
</style>