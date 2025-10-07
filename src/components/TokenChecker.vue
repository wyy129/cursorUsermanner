<!-- Token 查询组件 - 精简版 -->
<template>
  <div class="token-checker">
    <div class="checker-card">
      <div class="checker-header">
        <h3>🔍 账号信息查询</h3>
        <p>输入 WorkosCursorSessionToken 查询订阅状态和用量详情</p>
      </div>
      
      <div class="checker-body">
        <div class="input-group">
          <textarea
            v-model="sessionToken"
            placeholder="请输入 WorkosCursorSessionToken（例如：user_xxx）..."
            rows="3"
            :disabled="loading"
          ></textarea>
        </div>
        
        <button 
          class="btn-check"
          @click="checkToken"
          :disabled="!sessionToken.trim() || loading"
        >
          <span v-if="loading" class="spinner"></span>
          {{ loading ? '查询中...' : '🚀 查询信息' }}
        </button>
      </div>
      
      <!-- 查询结果 -->
      <div v-if="result" class="result-section">
        <div v-if="result.success" class="result-success">
          <h4>✅ 查询成功</h4>
          
          <div class="info-grid">
            <div class="info-item">
              <span class="label">会员类型</span>
              <span class="value" :class="getMembershipClass(result.subscription)">
                {{ formatMembershipType(result.subscription?.membershipType) }}
              </span>
            </div>
            
            <div class="info-item" v-if="result.subscription?.daysRemainingOnTrial !== undefined">
              <span class="label">剩余试用天数</span>
              <span class="value">{{ result.subscription.daysRemainingOnTrial }} 天</span>
            </div>
            
            <div class="info-item" v-if="result.usage?.totalCostCents !== undefined">
              <span class="label">用量费用</span>
              <span class="value">${{ (result.usage.totalCostCents / 100).toFixed(2) }}</span>
            </div>
          </div>
          
          <details class="details">
            <summary>📄 查看完整数据</summary>
            <pre>{{ JSON.stringify(result, null, 2) }}</pre>
          </details>
        </div>
        
        <div v-else class="result-error">
          <h4>❌ 查询失败</h4>
          <p>{{ result.error }}</p>
          <p class="hint">💡 请确保 Token 有效且后端服务已启动</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { checkAll } from '../utils/api.js'

const sessionToken = ref('')
const loading = ref(false)
const result = ref(null)

const checkToken = async () => {
  if (!sessionToken.value.trim()) return
  
  loading.value = true
  result.value = null
  
  try {
    result.value = await checkAll(sessionToken.value.trim())
  } catch (error) {
    result.value = {
      success: false,
      error: error.message || '请求失败'
    }
  } finally {
    loading.value = false
  }
}

const getMembershipClass = (data) => {
  const type = data?.membershipType || ''
  if (type.includes('pro')) return 'pro'
  if (type.includes('trial')) return 'trial'
  return 'free'
}

const formatMembershipType = (type) => {
  const map = {
    'free_trial': '免费试用',
    'pro': 'Pro 会员',
    'free': '免费版'
  }
  return map[type] || type || 'N/A'
}
</script>

<style scoped>
.token-checker {
  margin-bottom: 2rem;
}

.checker-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.checker-header h3 {
  font-size: 1.5rem;
  color: #1a202c;
  margin: 0 0 0.5rem 0;
}

.checker-header p {
  font-size: 0.9rem;
  color: #718096;
  margin: 0 0 1.5rem 0;
}

.checker-body {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
}

.input-group {
  flex: 1;
}

.input-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  font-family: 'Courier New', monospace;
  resize: vertical;
  transition: all 0.2s;
}

.input-group textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.input-group textarea:disabled {
  background: #f7fafc;
  cursor: not-allowed;
}

.btn-check {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-check:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.btn-check:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  margin-right: 0.5rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.result-section {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 2px solid #e2e8f0;
}

.result-success {
  padding: 1.5rem;
  background: linear-gradient(135deg, #f0fff4 0%, #e6fffa 100%);
  border-radius: 12px;
  border: 2px solid #9ae6b4;
}

.result-success h4 {
  margin: 0 0 1rem 0;
  color: #22543d;
  font-size: 1.2rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.info-item {
  padding: 0.75rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.info-item .label {
  display: block;
  font-size: 0.75rem;
  color: #718096;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 0.25rem;
}

.info-item .value {
  display: block;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a202c;
}

.value.pro { color: #667eea; }
.value.trial { color: #ed8936; }
.value.free { color: #718096; }

.details {
  margin-top: 1rem;
  cursor: pointer;
}

.details summary {
  padding: 0.5rem;
  color: #667eea;
  font-weight: 600;
  font-size: 0.9rem;
  border-radius: 6px;
  transition: background 0.2s;
}

.details summary:hover {
  background: rgba(102, 126, 234, 0.1);
}

.details pre {
  margin-top: 0.5rem;
  padding: 1rem;
  background: #2d3748;
  color: #e2e8f0;
  border-radius: 8px;
  font-size: 0.8rem;
  overflow-x: auto;
  font-family: 'Courier New', monospace;
}

.result-error {
  padding: 1.5rem;
  background: #fff5f5;
  border-radius: 12px;
  border: 2px solid #fc8181;
}

.result-error h4 {
  margin: 0 0 0.5rem 0;
  color: #742a2a;
  font-size: 1.2rem;
}

.result-error p {
  margin: 0.5rem 0;
  color: #c53030;
}

.result-error .hint {
  font-size: 0.85rem;
  color: #744210;
  background: #fefcbf;
  padding: 0.5rem;
  border-radius: 6px;
  margin-top: 0.75rem;
}

@media (max-width: 768px) {
  .checker-body {
    flex-direction: column;
  }
  
  .btn-check {
    width: 100%;
  }
}
</style>

