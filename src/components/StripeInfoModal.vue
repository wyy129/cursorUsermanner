<template>
  <div class="modal" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2>🔍 Cursor 订阅信息</h2>
        <span class="close" @click="$emit('close')">&times;</span>
      </div>
      <div class="modal-body">
        <!-- 用户信息 -->
        <div class="user-info">
          <div class="info-badge">
            <span class="label">用户邮箱</span>
            <span class="value">{{ email }}</span>
          </div>
        </div>

        <!-- 订阅状态卡片 -->
        <div class="subscription-card">
          <div class="card-header">
            <div class="membership-badge" :class="membershipClass">
              {{ membershipTypeDisplay }}
            </div>
            <div class="status-badge" :class="statusClass">
              {{ subscriptionStatusDisplay }}
            </div>
          </div>

          <div class="card-body">
            <!-- 会员类型 -->
            <div class="info-row">
              <div class="info-label">
                <span class="icon">👤</span>
                <span>会员类型</span>
              </div>
              <div class="info-value">{{ membershipTypeDisplay }}</div>
            </div>

            <!-- 试用天数 -->
            <div class="info-row" v-if="stripeData.daysRemainingOnTrial != null">
              <div class="info-label">
                <span class="icon">📅</span>
                <span>剩余试用天数</span>
              </div>
              <div class="info-value highlight">
                {{ stripeData.daysRemainingOnTrial }} 天
              </div>
            </div>

            <!-- 订阅状态 -->
            <div class="info-row">
              <div class="info-label">
                <span class="icon">📊</span>
                <span>订阅状态</span>
              </div>
              <div class="info-value">{{ subscriptionStatusDisplay }}</div>
            </div>

            <!-- 支付ID -->
            <div class="info-row" v-if="stripeData.paymentId">
              <div class="info-label">
                <span class="icon">💳</span>
                <span>支付ID</span>
              </div>
              <div class="info-value small">{{ stripeData.paymentId }}</div>
            </div>

            <!-- 其他信息 -->
            <div class="additional-info">
              <div class="info-item" v-if="stripeData.verifiedStudent !== undefined">
                <span class="item-label">学生认证：</span>
                <span class="item-value">{{ stripeData.verifiedStudent ? '✅ 是' : '❌ 否' }}</span>
              </div>
              <div class="info-item" v-if="stripeData.trialEligible !== undefined">
                <span class="item-label">试用资格：</span>
                <span class="item-value">{{ stripeData.trialEligible ? '✅ 有' : '❌ 无' }}</span>
              </div>
              <div class="info-item" v-if="stripeData.isTeamMember !== undefined">
                <span class="item-label">团队成员：</span>
                <span class="item-value">{{ stripeData.isTeamMember ? '✅ 是' : '❌ 否' }}</span>
              </div>
              <div class="info-item" v-if="stripeData.trialWasCancelled !== undefined">
                <span class="item-label">试用取消：</span>
                <span class="item-value">{{ stripeData.trialWasCancelled ? '⚠️ 是' : '✅ 否' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 原始数据（可折叠） -->
        <details class="raw-data">
          <summary>查看原始JSON数据</summary>
          <pre>{{ JSON.stringify(stripeData, null, 2) }}</pre>
        </details>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  stripeData: {
    type: Object,
    required: true
  },
  email: {
    type: String,
    default: 'N/A'
  }
})

defineEmits(['close'])

// 会员类型显示
const membershipTypeDisplay = computed(() => {
  const type = props.stripeData.membershipType || props.stripeData.individualMembershipType
  const typeMap = {
    'free_trial': '🆓 免费试用',
    'pro': '⭐ Pro会员',
    'free': '🆓 免费版',
    'business': '💼 企业版',
    'team': '👥 团队版'
  }
  return typeMap[type] || type || 'unknown'
})

// 会员类型样式类
const membershipClass = computed(() => {
  const type = props.stripeData.membershipType || props.stripeData.individualMembershipType
  if (type === 'pro' || type === 'business') return 'membership-pro'
  if (type === 'free_trial') return 'membership-trial'
  return 'membership-free'
})

// 订阅状态显示
const subscriptionStatusDisplay = computed(() => {
  const status = props.stripeData.subscriptionStatus
  const statusMap = {
    'trialing': '试用中',
    'active': '激活',
    'canceled': '已取消',
    'incomplete': '未完成',
    'incomplete_expired': '已过期',
    'past_due': '逾期',
    'unpaid': '未支付'
  }
  return statusMap[status] || status || 'unknown'
})

// 状态样式类
const statusClass = computed(() => {
  const status = props.stripeData.subscriptionStatus
  if (status === 'active') return 'status-active'
  if (status === 'trialing') return 'status-trialing'
  if (status === 'canceled') return 'status-canceled'
  return 'status-default'
})
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
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e2e8f0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 16px 16px 0 0;
}

.modal-header h2 {
  font-size: 1.5rem;
  margin: 0;
}

.close {
  font-size: 2rem;
  font-weight: 300;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  opacity: 0.8;
}

.close:hover {
  opacity: 1;
  transform: scale(1.1);
}

.modal-body {
  padding: 2rem;
}

/* 用户信息 */
.user-info {
  margin-bottom: 1.5rem;
}

.info-badge {
  background: #f1f5f9;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-badge .label {
  color: #64748b;
  font-size: 0.85rem;
  font-weight: 500;
}

.info-badge .value {
  color: #334155;
  font-weight: 600;
}

/* 订阅卡片 */
.subscription-card {
  background: linear-gradient(135deg, #f6f8fb 0%, #ffffff 100%);
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 1.5rem;
}

.card-header {
  background: white;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.membership-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
}

.membership-pro {
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  color: #7c2d12;
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
}

.membership-trial {
  background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
  color: white;
}

.membership-free {
  background: #e2e8f0;
  color: #475569;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

.status-active {
  background: #dcfce7;
  color: #166534;
}

.status-trialing {
  background: #dbeafe;
  color: #1e40af;
}

.status-canceled {
  background: #fee2e2;
  color: #991b1b;
}

.status-default {
  background: #f1f5f9;
  color: #475569;
}

.card-body {
  padding: 1.5rem;
}

/* 信息行 */
.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #f1f5f9;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #64748b;
  font-size: 0.95rem;
}

.info-label .icon {
  font-size: 1.2rem;
}

.info-value {
  color: #1e293b;
  font-weight: 600;
  font-size: 1rem;
}

.info-value.highlight {
  color: #10b981;
  font-size: 1.2rem;
}

.info-value.small {
  font-size: 0.85rem;
  color: #64748b;
  font-family: 'Courier New', monospace;
}

/* 附加信息 */
.additional-info {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.info-item {
  font-size: 0.85rem;
}

.item-label {
  color: #64748b;
}

.item-value {
  color: #334155;
  font-weight: 500;
  margin-left: 0.25rem;
}

/* 原始数据 */
.raw-data {
  margin-top: 1.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.raw-data summary {
  padding: 0.75rem 1rem;
  background: #f8fafc;
  cursor: pointer;
  font-size: 0.9rem;
  color: #64748b;
  font-weight: 500;
  user-select: none;
}

.raw-data summary:hover {
  background: #f1f5f9;
}

.raw-data pre {
  padding: 1rem;
  margin: 0;
  background: #1e293b;
  color: #e2e8f0;
  font-size: 0.8rem;
  overflow-x: auto;
  font-family: 'Courier New', monospace;
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

@media (max-width: 768px) {
  .additional-info {
    grid-template-columns: 1fr;
  }
}
</style>

