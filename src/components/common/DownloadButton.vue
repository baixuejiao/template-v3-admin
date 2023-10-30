<template>
  <n-button type="primary" size="small" @click="onDownload">
    <template #icon>
      <n-icon>
        <CloudDownload />
      </n-icon>
    </template>
    {{ buttonText || '下载导入模版' }}
  </n-button>
</template>

<script lang="ts">
  import { defineComponent } from 'vue'
  import { CloudDownload } from '@vicons/ionicons5'

  export default defineComponent({
    name: 'DownloadButton',
    components: {
      CloudDownload,
    },
    props: ['buttonText'],
    emits: ['download'],
    setup(props, { emit }) {
      const buttonText = props.buttonText
      function onDownload() {
        emit('download')
      }
      return {
        buttonText,
        onDownload,
      }
    },
  })
</script>
