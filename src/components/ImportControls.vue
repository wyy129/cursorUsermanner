<!-- 导入控制组件 -->
<template>
  <div class="import-controls">
    <div class="control-card">
      <div class="control-header">
        <h3>数据导入</h3>
        <p>支持 JSON 格式的用户数据导入</p>
      </div>
      
      <div class="control-actions">
        <label class="btn btn-primary">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M17 8L12 3L7 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 3V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          从文件导入
          <input type="file" accept=".json" @change="handleFileUpload" style="display: none;">
        </label>
        
        <button class="btn btn-secondary" @click="handleTextImport">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M16 13H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M16 17H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M10 9H9H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          粘贴 JSON
        </button>
      </div>
    </div>

    <!-- 文本导入对话框 -->
    <div v-if="showTextModal" class="modal-overlay" @click="showTextModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>粘贴 JSON 数据</h3>
          <button class="close-btn" @click="showTextModal = false">×</button>
        </div>
        <textarea 
          v-model="jsonText" 
          class="json-input" 
          placeholder="请粘贴 JSON 数组数据..."
        ></textarea>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="showTextModal = false">取消</button>
          <button class="btn btn-primary" @click="handleTextSubmit">导入</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['import'])
const showTextModal = ref(false)
const jsonText = ref('')

const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result)
      emit('import', data)
    } catch (error) {
      alert('JSON 解析失败：' + error.message)
    }
  }
  reader.readAsText(file)
  event.target.value = ''
}

const handleTextImport = () => {
  showTextModal.value = true
}

const handleTextSubmit = () => {
  try {
    const data = JSON.parse(jsonText.value)
    emit('import', data)
    showTextModal.value = false
    jsonText.value = ''
  } catch (error) {
    alert('JSON 解析失败：' + error.message)
  }
}
</script>

<style scoped>
.import-controls {
  margin-bottom: 2rem;
}

.control-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.control-header h3 {
  font-size: 1.25rem;
  color: #1a202c;
  margin-bottom: 0.25rem;
}

.control-header p {
  font-size: 0.9rem;
  color: #718096;
  margin-bottom: 1rem;
}

.control-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn svg {
  width: 20px;
  height: 20px;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: #e2e8f0;
  color: #2d3748;
}

.btn-secondary:hover {
  background: #cbd5e0;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 600px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h3 {
  font-size: 1.25rem;
  color: #1a202c;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  color: #718096;
  cursor: pointer;
  line-height: 1;
  padding: 0;
  width: 32px;
  height: 32px;
}

.close-btn:hover {
  color: #2d3748;
}

.json-input {
  flex: 1;
  padding: 1rem;
  border: none;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  resize: none;
  outline: none;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
}
</style>

