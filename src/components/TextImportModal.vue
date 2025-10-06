<template>
  <div class="modal" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2>📝 粘贴JSON文本</h2>
        <span class="close" @click="$emit('close')">&times;</span>
      </div>
      <div class="modal-body">
        <p style="margin-bottom: 1rem; color: #64748b;">
          请将JSON数据粘贴到下方文本框中：
        </p>
        <textarea 
          v-model="jsonText"
          placeholder='请粘贴JSON数据，例如：
[
  {
    "email": "example@example.com",
    "auth_info": {
      "WorkosCursorSessionToken": "..."
    },
    ...
  }
]'
          rows="15"
        ></textarea>
        <div class="modal-actions">
          <button class="btn btn-primary" @click="handleImport">
            ✅ 导入数据
          </button>
          <button class="btn btn-secondary" @click="$emit('close')">
            取消
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { showMessage } from '../utils/message'

const jsonText = ref('')

const emit = defineEmits(['import', 'close'])

const handleImport = () => {
  const text = jsonText.value.trim()
  
  if (!text) {
    showMessage('请输入JSON数据', 'warning')
    return
  }
  
  emit('import', text)
}
</script>

<style scoped>
.modal {
  display: flex;
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  animation: fadeIn 0.3s ease;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease;
  box-shadow: var(--shadow-lg);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h2 {
  font-size: 1.5rem;
  color: var(--text-primary);
}

.close {
  font-size: 2rem;
  font-weight: 300;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.close:hover {
  color: var(--danger-color);
}

.modal-body {
  padding: 2rem;
}

textarea {
  width: 100%;
  padding: 1rem;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  resize: vertical;
  min-height: 300px;
  transition: all 0.3s ease;
}

textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.modal-actions {
  margin-top: 1.5rem;
  display: flex;
  gap: 1rem;
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
  flex: 1;
  justify-content: center;
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

.btn-secondary {
  background: #94a3b8;
  color: white;
}

.btn-secondary:hover {
  background: #64748b;
  transform: translateY(-2px);
  box-shadow: var(--shadow);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    transform: translateY(50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>

