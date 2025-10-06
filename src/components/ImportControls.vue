<template>
  <div class="import-buttons">
    <label for="fileInput" class="btn btn-primary">
      📁 导入JSON文件
      <input 
        ref="fileInputRef"
        type="file" 
        id="fileInput" 
        accept=".json" 
        style="display: none;"
        @change="handleFileChange"
      >
    </label>
    <button class="btn btn-primary" @click="$emit('import-text')">
      📝 粘贴JSON文本
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const fileInputRef = ref(null)

const emit = defineEmits(['import-file', 'import-text'])

const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    emit('import-file', file)
    // 重置文件选择，允许重复选择同一文件
    event.target.value = ''
  }
}
</script>

<style scoped>
.import-buttons {
  flex: 0 0 auto;
  display: flex;
  gap: 0.5rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow);
}
</style>


