<template>
  <n-button type="primary" size="small" @click="onAdd">
    <template #icon>
      <n-icon>
        <AddIcon />
      </n-icon>
    </template>
    {{ buttonText || '添加' }}
  </n-button>
</template>

<script lang="ts">
  import { defineComponent } from 'vue'
  import { Add as AddIcon } from '@vicons/ionicons5'

  export default defineComponent({
    name: 'AddButton',
    components: {
      AddIcon,
    },
    props: ['buttonText'],
    emits: ['add'],
    setup(props, { emit }) {
      const buttonText = props.buttonText
      function onAdd() {
        emit('add')
      }
      return {
        buttonText,
        onAdd
      }
    },
  })
</script>
