<template>
  <n-button type="primary" size="small" @click="onUpload">
    <template #icon>
      <n-icon>
        <CloudUpload />
      </n-icon>
    </template>
    导入
  </n-button>
</template>

<script lang="ts">
  import { defineComponent } from 'vue'
  import { CloudUpload } from '@vicons/ionicons5'

  export default defineComponent({
    name: 'UploadButton',
    components: {
      CloudUpload,
    },
    emits: ['upload'],
    setup(props, { emit }) {
      function onUpload() {
        emit('upload')
      }
      return {
        onUpload,
      }
    },
  })
</script>
