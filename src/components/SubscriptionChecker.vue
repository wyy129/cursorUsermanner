<template>
  <div class="subscription-checker">
    <div class="checker-header">
      <h3>📊 订阅状态查询</h3>
      <div class="server-status">
        <span class="status-dot" :class="serverOnline ? 'online' : 'offline'"></span>
        <span class="status-text">{{ serverOnline ? '服务在线' : '服务离线' }}</span>
      </div>
    </div>

    <div v-if="!serverOnline" class="warning-box">
      ⚠️ 后端服务未启动，请先运行 <code>npm run server</code> 或 <code>npm start</code>
    </div>

    <div v-if="user" class="user-info">
      <div class="info-item">
        <span class="label">邮箱:</span>
        <span class="value">{{ user.email }}</span>
      </div>
      <div class="info-item">
        <span class="label">Token:</span>
        <span class="value token-preview">
          {{ tokenPreview }}
        </span>
      </div>
    </div>

    <div class="action-buttons">
      <button 
        @click="handleCheckSubscription" 
        :disabled="loading || !serverOnline || !hasToken"
        class="btn btn-check"
      >
        <span v-if="loading">🔄 查询中...</span>
        <span v-else>🔍 查询订阅状态</span>
      </button>
      <button @click="$emit('close')" class="btn btn-cancel">
        关闭
      </button>
    </div>

    <!-- 查询结果 -->
    <div v-if="result" class="result-container">
      <div class="result-header">
        <h4>✅ 查询结果</h4>
      </div>
      
      <div class="result-grid">
        <div class="result-item highlight">
          <span class="result-label">会员类型 (membershipType)</span>
          <span class="result-value">
            <span class="badge" :class="membershipClass(result.data.membershipType)">
              {{ formatMembershipType(result.data.membershipType) }}
            </span>
          </span>
        </div>

        <div class="result-item highlight" v-if="result.data.daysRemainingOnTrial !== null && result.data.daysRemainingOnTrial !== undefined">
          <span class="result-label">试用剩余天数 (daysRemainingOnTrial)</span>
          <span class="result-value trial-days">
            {{ result.data.daysRemainingOnTrial }} 天
          </span>
        </div>

        <div class="result-item">
          <span class="result-label">个人会员类型</span>
          <span class="result-value">
            <span class="badge" :class="membershipClass(result.data.individualMembershipType)">
              {{ formatMembershipType(result.data.individualMembershipType) }}
            </span>
          </span>
        </div>

        <div class="result-item">
          <span class="result-label">订阅状态</span>
          <span class="result-value">
            <span class="status-badge" :class="statusClass(result.data.subscriptionStatus)">
              {{ formatSubscriptionStatus(result.data.subscriptionStatus) }}
            </span>
          </span>
        </div>

        <div class="result-item">
          <span class="result-label">试用资格</span>
          <span class="result-value">
            {{ result.data.trialEligible ? '✅ 有资格' : '❌ 无资格' }}
          </span>
        </div>

        <div class="result-item">
          <span class="result-label">学生认证</span>
          <span class="result-value">
            {{ result.data.verifiedStudent ? '✅ 已认证' : '❌ 未认证' }}
          </span>
        </div>

        <div class="result-item">
          <span class="result-label">学生计划</span>
          <span class="result-value">
            {{ result.data.isOnStudentPlan ? '✅ 是' : '❌ 否' }}
          </span>
        </div>

        <div class="result-item">
          <span class="result-label">团队成员</span>
          <span class="result-value">
            {{ result.data.isTeamMember ? '✅ 是' : '❌ 否' }}
          </span>
        </div>

        <div class="result-item" v-if="result.data.teamMembershipType">
          <span class="result-label">团队会员类型</span>
          <span class="result-value">
            {{ result.data.teamMembershipType }}
          </span>
        </div>

        <div class="result-item">
          <span class="result-label">试用取消状态</span>
          <span class="result-value">
            {{ result.data.trialWasCancelled ? '⚠️ 已取消' : '✅ 正常' }}
          </span>
        </div>

        <div class="result-item">
          <span class="result-label">自动计费</span>
          <span class="result-value">
            {{ result.data.isOnBillableAuto ? '✅ 开启' : '❌ 关闭' }}
          </span>
        </div>

        <div class="result-item">
          <span class="result-label">账户余额</span>
          <span class="result-value">
            ${{ ((result.data.customerBalance || 0) / 100).toFixed(2) }}
          </span>
        </div>
      </div>
    </div>

    <!-- 错误信息 -->
    <div v-if="error" class="error-box">
      ❌ {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { checkSubscription, checkServerHealth } from '../utils/api.js'

const props = defineProps({
  user: Object
})

const emit = defineEmits(['close', 'result'])

const loading = ref(false)
const result = ref(null)
const error = ref('')
const serverOnline = ref(false)

// Token预览
const tokenPreview = computed(() => {
  const token = props.user?.auth_info?.WorkosCursorSessionToken
  if (!token) return '无Token'
  if (token.length > 50) {
    return token.substring(0, 50) + '...'
  }
  return token
})

// 是否有Token
const hasToken = computed(() => {
  return !!props.user?.auth_info?.WorkosCursorSessionToken
})

// 检查服务器状态
onMounted(async () => {
  serverOnline.value = await checkServerHealth()
})

// 查询订阅状态
const handleCheckSubscription = async () => {
  if (!hasToken.value) {
    error.value = '该账户没有WorkosCursorSessionToken'
    return
  }

  loading.value = true
  error.value = ''
  result.value = null

  try {
    const token = props.user.auth_info.WorkosCursorSessionToken
    const response = await checkSubscription(token)
    result.value = response
    emit('result', response.data)
  } catch (err) {
    error.value = err.message || '查询失败，请检查Token是否有效或后端服务是否正常运行'
    console.error('查询错误:', err)
  } finally {
    loading.value = false
  }
}

// 会员类型样式
const membershipClass = (type) => {
  if (!type) return 'badge-default'
  if (type.includes('pro')) return 'badge-pro'
  if (type.includes('trial')) return 'badge-trial'
  if (type.includes('free')) return 'badge-free'
  return 'badge-default'
}

// 格式化会员类型
const formatMembershipType = (type) => {
  if (!type) return '-'
  const types = {
    'pro': 'Pro会员',
    'free_trial': '免费试用',
    'free': '免费版',
    'student': '学生版'
  }
  return types[type] || type
}

// 订阅状态样式
const statusClass = (status) => {
  if (!status) return 'status-default'
  if (status === 'active') return 'status-active'
  if (status === 'trialing') return 'status-trial'
  if (status === 'canceled') return 'status-canceled'
  return 'status-default'
}

// 格式化订阅状态
const formatSubscriptionStatus = (status) => {
  if (!status) return '-'
  const statuses = {
    'active': '活跃',
    'trialing': '试用中',
    'canceled': '已取消',
    'past_due': '逾期',
    'unpaid': '未支付'
  }
  return statuses[status] || status
}
</script>

<style scoped>
.subscription-checker {
  padding: 1.5rem;
  max-height: 80vh;
  overflow-y: auto;
}

.checker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.checker-header h3 {
  margin: 0;
  color: #1f2937;
}

.server-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-dot.online {
  background: #10b981;
  box-shadow: 0 0 8px #10b981;
  animation: pulse 2s infinite;
}

.status-dot.offline {
  background: #ef4444;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.status-text {
  color: #6b7280;
}

.warning-box {
  background: #fef3c7;
  border-left: 4px solid #f59e0b;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  color: #92400e;
}

.warning-box code {
  background: rgba(0,0,0,0.1);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-family: monospace;
}

.user-info {
  background: #f9fafb;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.info-item {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-item .label {
  color: #6b7280;
  font-weight: 500;
  min-width: 60px;
}

.info-item .value {
  color: #1f2937;
  word-break: break-all;
}

.token-preview {
  font-family: monospace;
  font-size: 0.85rem;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.btn {
  flex: 1;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-check {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-check:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-cancel {
  background: #e5e7eb;
  color: #4b5563;
}

.btn-cancel:hover {
  background: #d1d5db;
}

.result-container {
  background: #f9fafb;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.result-header h4 {
  margin: 0 0 1rem 0;
  color: #1f2937;
}

.result-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.result-item {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.result-item.highlight {
  border: 2px solid #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
}

.result-label {
  display: block;
  color: #6b7280;
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
}

.result-value {
  display: block;
  color: #1f2937;
  font-weight: 600;
  font-size: 1rem;
}

.trial-days {
  color: #f59e0b;
  font-size: 1.5rem;
}

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;
  display: inline-block;
}

.badge-pro {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.badge-trial {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.badge-free {
  background: #e5e7eb;
  color: #4b5563;
}

.badge-default {
  background: #f3f4f6;
  color: #6b7280;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;
  display: inline-block;
}

.status-active {
  background: #d1fae5;
  color: #065f46;
}

.status-trial {
  background: #fef3c7;
  color: #92400e;
}

.status-canceled {
  background: #fee2e2;
  color: #991b1b;
}

.status-default {
  background: #f3f4f6;
  color: #6b7280;
}

.error-box {
  background: #fef2f2;
  border-left: 4px solid #ef4444;
  padding: 1rem;
  border-radius: 4px;
  color: #991b1b;
}
</style>

