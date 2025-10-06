<!-- Token 查询组件 -->
<template>
  <div class="token-checker">
    <div class="checker-card">
      <div class="checker-header">
        <h3>账号信息查询</h3>
        <p>通过 WorkosCursorSessionToken 查询账号订阅状态</p>
      </div>
      
      <div class="checker-body">
        <div class="input-group">
          <label for="token-input">WorkosCursorSessionToken</label>
          <textarea
            id="token-input"
            v-model="sessionToken"
            placeholder="请输入 WorkosCursorSessionToken..."
            rows="3"
            :disabled="loading"
          ></textarea>
        </div>
        
        <button 
          class="btn btn-primary btn-check"
          @click="checkToken"
          :disabled="!sessionToken.trim() || loading"
        >
          <svg v-if="!loading" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 21L15 15L21 21ZM17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span v-if="loading" class="loading-spinner"></span>
          {{ loading ? '查询中...' : '查询账号信息' }}
        </button>
      </div>
      
      <!-- 查询结果 -->
      <div v-if="result" class="result-section">
        <div v-if="result.success" class="result-success">
          <div class="result-header">
            <svg class="success-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.7088 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <h4>查询成功</h4>
          </div>
          
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">会员类型</span>
              <span class="info-value" :class="'membership-' + getMembershipType(result.data)">
                {{ formatMembershipType(result.data.membershipType) }}
              </span>
            </div>
            
            <div class="info-item" v-if="result.data.daysRemainingOnTrial !== undefined && result.data.daysRemainingOnTrial !== null">
              <span class="info-label">试用剩余天数</span>
              <span class="info-value trial-days">
                {{ result.data.daysRemainingOnTrial }} 天
              </span>
            </div>
            
            <div class="info-item" v-if="result.data.subscriptionStatus">
              <span class="info-label">订阅状态</span>
              <span class="info-value">
                {{ formatSubscriptionStatus(result.data.subscriptionStatus) }}
              </span>
            </div>
            
            <div class="info-item" v-if="result.data.individualMembershipType">
              <span class="info-label">个人会员类型</span>
              <span class="info-value">
                {{ formatMembershipType(result.data.individualMembershipType) }}
              </span>
            </div>
          </div>
          
          <!-- 额外信息 -->
          <div class="extra-info">
            <details>
              <summary>查看完整响应</summary>
              <pre class="json-display">{{ JSON.stringify(result.data, null, 2) }}</pre>
            </details>
          </div>
        </div>
        
        <div v-else class="result-error">
          <div class="result-header">
            <svg class="error-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M15 9L9 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M9 9L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <h4>查询失败</h4>
          </div>
          <p class="error-message">{{ result.error }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { fetchStripeInfo } from '../utils/api.js'

const sessionToken = ref('')
const loading = ref(false)
const result = ref(null)

const checkToken = async () => {
  if (!sessionToken.value.trim()) return
  
  loading.value = true
  result.value = null
  
  try {
    const response = await fetchStripeInfo(sessionToken.value.trim())
    result.value = response
  } catch (error) {
    result.value = {
      success: false,
      error: error.message
    }
  } finally {
    loading.value = false
  }
}

const getMembershipType = (data) => {
  const type = data.membershipType || 'free'
  if (type.includes('pro')) return 'pro'
  if (type.includes('trial')) return 'trial'
  return 'free'
}

const formatMembershipType = (type) => {
  const typeMap = {
    'free_trial': '免费试用',
    'pro': 'Pro 会员',
    'free': '免费版',
    'trialing': '试用中'
  }
  return typeMap[type] || type
}

const formatSubscriptionStatus = (status) => {
  const statusMap = {
    'trialing': '试用中',
    'active': '激活',
    'canceled': '已取消',
    'past_due': '逾期',
    'unpaid': '未支付'
  }
  return statusMap[status] || status
}
</script>

<style scoped>
.token-checker {
  margin-bottom: 2rem;
}

.checker-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.checker-header h3 {
  font-size: 1.25rem;
  color: #1a202c;
  margin-bottom: 0.25rem;
}

.checker-header p {
  font-size: 0.9rem;
  color: #718096;
  margin-bottom: 1rem;
}

.checker-body {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
  flex-wrap: wrap;
}

.input-group {
  flex: 1;
  min-width: 300px;
}

.input-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.input-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  font-family: 'Courier New', monospace;
  resize: vertical;
  transition: border-color 0.2s;
}

.input-group textarea:focus {
  outline: none;
  border-color: #667eea;
}

.input-group textarea:disabled {
  background: #f7fafc;
  cursor: not-allowed;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
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

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-check {
  min-width: 160px;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.result-section {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 2px solid #e2e8f0;
}

.result-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.result-header h4 {
  font-size: 1.1rem;
  color: #1a202c;
  margin: 0;
}

.success-icon {
  width: 32px;
  height: 32px;
  color: #48bb78;
}

.error-icon {
  width: 32px;
  height: 32px;
  color: #f56565;
}

.result-success {
  padding: 1rem;
  background: #f0fff4;
  border-radius: 12px;
  border: 2px solid #c6f6d5;
}

.result-error {
  padding: 1rem;
  background: #fff5f5;
  border-radius: 12px;
  border: 2px solid #fed7d7;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-label {
  font-size: 0.75rem;
  color: #718096;
  font-weight: 600;
  text-transform: uppercase;
}

.info-value {
  font-size: 1.1rem;
  color: #1a202c;
  font-weight: 600;
}

.membership-pro {
  color: #667eea;
}

.membership-trial {
  color: #ed8936;
}

.membership-free {
  color: #718096;
}

.trial-days {
  color: #dd6b20;
}

.extra-info {
  margin-top: 1rem;
}

.extra-info details {
  cursor: pointer;
}

.extra-info summary {
  font-size: 0.875rem;
  color: #667eea;
  font-weight: 600;
  padding: 0.5rem;
  border-radius: 6px;
  transition: background 0.2s;
}

.extra-info summary:hover {
  background: #f7fafc;
}

.json-display {
  margin-top: 0.5rem;
  padding: 1rem;
  background: #2d3748;
  color: #e2e8f0;
  border-radius: 8px;
  font-size: 0.8rem;
  overflow-x: auto;
  font-family: 'Courier New', monospace;
}

.error-message {
  color: #c53030;
  font-size: 0.9rem;
  margin: 0;
}

@media (max-width: 768px) {
  .checker-body {
    flex-direction: column;
  }
  
  .input-group {
    min-width: 100%;
  }
  
  .btn-check {
    width: 100%;
  }
}
</style>

