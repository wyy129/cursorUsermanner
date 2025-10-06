<template>
  <div class="modal" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Token详细信息</h2>
        <span class="close" @click="$emit('close')">&times;</span>
      </div>
      <div class="modal-body">
        <div class="token-details">
          <div class="detail-item">
            <strong>Email:</strong>
            <span>{{ userData?.email || 'N/A' }}</span>
          </div>
          <div class="detail-item">
            <strong>WorkosCursorSessionToken:</strong>
            <div class="token-value">
              {{ userData?.auth_info?.WorkosCursorSessionToken || '无Token' }}
            </div>
          </div>
          <div class="detail-item">
            <strong>AccessToken:</strong>
            <div class="token-value">
              {{ userData?.auth_info?.['cursorAuth/accessToken'] || '无AccessToken' }}
            </div>
          </div>
          <div class="detail-item">
            <strong>RefreshToken:</strong>
            <div class="token-value">
              {{ userData?.auth_info?.['cursorAuth/refreshToken'] || '无RefreshToken' }}
            </div>
          </div>
          <div class="detail-item">
            <strong>会员类型:</strong>
            <span>{{ userData?.membershipType || 'unknown' }}</span>
          </div>
          <div class="detail-item">
            <strong>剩余试用天数:</strong>
            <span>{{ trialDaysDisplay }}</span>
          </div>
        </div>
                <div class="modal-actions">
          <button class="btn btn-primary" @click="handleCopyToken">
            {{ copyButtonText }}
          </button>
          <button 
            v-if="userData?.auth_info?.WorkosCursorSessionToken"
            class="btn btn-success" 
            @click="handleQueryStripe"
          >
            🔍 查询Stripe信息
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { showMessage } from '../utils/message'

const props = defineProps({
  userData: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'query-stripe'])

const copyButtonText = ref('📋 复制WorkosCursorSessionToken')

const trialDaysDisplay = computed(() => {
  if (props.userData?.daysRemainingOnTrial != null) {
    return `${props.userData.daysRemainingOnTrial} 天`
  } else if (props.userData?.membershipType === 'pro') {
    return '∞ 无限制'
  }
  return 'N/A'
})

const handleCopyToken = async () => {
  const token = props.userData?.auth_info?.WorkosCursorSessionToken
  if (!token) {
    showMessage('没有可复制的Token', 'warning')
    return
  }

  try {
    await navigator.clipboard.writeText(token)
    showMessage('Token已复制到剪贴板！', 'success')
    copyButtonText.value = '✅ 已复制'
    setTimeout(() => {
      copyButtonText.value = '📋 复制WorkosCursorSessionToken'
    }, 2000)
  } catch (err) {
    console.error('复制失败:', err)
    showMessage('复制失败，请手动复制', 'error')
  }
}

const handleQueryStripe = () => {
  const token = props.userData?.auth_info?.WorkosCursorSessionToken
  if (!token) {
    showMessage('没有可查询的Token', 'warning')
    return
  }
  
  emit('query-stripe', token)
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

.token-details {
  margin-bottom: 1.5rem;
}

.detail-item {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-item strong {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
  font-size: 0.95rem;
}

.token-value {
  background: var(--bg-color);
  padding: 1rem;
  border-radius: 8px;
  word-break: break-all;
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  color: var(--text-secondary);
  max-height: 150px;
  overflow-y: auto;
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

.btn-success {
  background: var(--success-color);
  color: white;
}

.btn-success:hover {
  background: #059669;
  transform: translateY(-2px);
  box-shadow: var(--shadow);
}

.modal-actions {
  margin-top: 1.5rem;
  display: flex;
  gap: 1rem;
}

.modal-actions .btn {
  flex: 1;
  justify-content: center;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
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

