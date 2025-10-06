<template>
  <div class="table-container">
    <table>
      <thead>
        <tr>
          <th>序号</th>
          <th>Email</th>
          <th>WorkosCursorSessionToken</th>
          <th>会员类型</th>
          <th>剩余天数</th>
          <th>Token状态</th>
          <th>注册时间</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr 
          v-for="(item, index) in data" 
          :key="index"
          :class="getRowClass(item)"
        >
          <td>{{ index + 1 }}</td>
          <td><strong>{{ item.email || 'N/A' }}</strong></td>
          <td>
            <span 
              v-if="item.auth_info?.WorkosCursorSessionToken" 
              class="token-cell-collapsed"
              :title="item.auth_info.WorkosCursorSessionToken"
            >
              {{ truncateToken(item.auth_info.WorkosCursorSessionToken) }}
            </span>
            <span v-else style="color: #94a3b8;">无Token</span>
          </td>
          <td>
            <span :class="getMembershipBadgeClass(item.membershipType)">
              {{ getMembershipLabel(item.membershipType) }}
            </span>
          </td>
          <td>
            <span v-if="item.daysRemainingOnTrial != null" class="days-badge">
              {{ item.daysRemainingOnTrial }} 天
            </span>
            <span v-else-if="item.membershipType === 'pro'" style="color: #10b981;">
              ∞ 无限制
            </span>
            <span v-else>-</span>
          </td>
          <td>
            <span :class="getTokenStatusClass(item)">
              {{ getTokenStatus(item) }}
            </span>
          </td>
          <td>{{ item.register_time || 'N/A' }}</td>
          <td>
            <div class="action-buttons">
              <button 
                class="btn btn-primary btn-small" 
                @click="$emit('show-details', item)"
              >
                👁️ 查看详情
              </button>
              <button 
                v-if="item.auth_info?.WorkosCursorSessionToken"
                class="btn btn-success btn-small" 
                @click="$emit('query-stripe', item)"
                title="查询Cursor Stripe信息"
              >
                🔍 查询Stripe
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
defineProps({
  data: {
    type: Array,
    default: () => []
  }
})

defineEmits(['show-details', 'query-stripe'])

// 折叠Token显示
const truncateToken = (token) => {
  if (!token) return ''
  if (token.length <= 20) return token
  
  const start = token.substring(0, 10)
  const end = token.substring(token.length - 6)
  return `${start}...${end}`
}

// 获取行样式类
const getRowClass = (item) => {
  if (!item.auth_info?.WorkosCursorSessionToken) {
    return 'row-no-token'
  } else if (item.tokenValidity === false) {
    return 'row-invalid-token'
  }
  return ''
}

// 获取会员类型徽章类
const getMembershipBadgeClass = (type) => {
  const classes = {
    'pro': 'badge badge-pro',
    'free': 'badge',
    'free_trial': 'badge badge-warning',
    'trial': 'badge badge-warning',
    'unknown': 'badge'
  }
  return classes[type] || classes['unknown']
}

// 获取会员类型标签
const getMembershipLabel = (type) => {
  const labels = {
    'pro': 'PRO',
    'free': 'Free',
    'free_trial': '免费试用',
    'trial': '试用',
    'unknown': '未知'
  }
  return labels[type] || labels['unknown']
}

// 获取Token状态
const getTokenStatus = (item) => {
  if (!item.auth_info?.WorkosCursorSessionToken) {
    return '无Token'
  }
  if (item.tokenValidity === false) {
    return 'Token失效'
  }
  return '有效'
}

// 获取Token状态类
const getTokenStatusClass = (item) => {
  if (!item.auth_info?.WorkosCursorSessionToken) {
    return 'badge badge-danger'
  }
  if (item.tokenValidity === false) {
    return 'badge badge-warning'
  }
  return 'badge badge-success'
}
</script>

<style scoped>
.table-container {
  overflow-x: auto;
  padding: 2rem;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

thead {
  background: var(--bg-color);
}

th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: var(--text-primary);
  border-bottom: 2px solid var(--border-color);
}

td {
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-secondary);
}

tbody tr {
  transition: all 0.2s ease;
}

tbody tr:hover {
  background: var(--bg-color);
}

.row-no-token {
  opacity: 0.6;
  background: #fef2f2;
}

.row-invalid-token {
  background: #fff7ed;
}

.token-cell-collapsed {
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  color: var(--text-secondary);
  cursor: help;
  padding: 0.25rem 0.5rem;
  background: var(--bg-color);
  border-radius: 4px;
  display: inline-block;
  transition: all 0.2s ease;
}

.token-cell-collapsed:hover {
  background: var(--border-color);
  color: var(--text-primary);
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.badge-success {
  background: #d1fae5;
  color: #065f46;
}

.badge-warning {
  background: #fed7aa;
  color: #92400e;
}

.badge-danger {
  background: #fee2e2;
  color: #991b1b;
}

.badge-pro {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.days-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
  background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
  color: white;
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

.btn-small {
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
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

.action-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  table {
    font-size: 0.85rem;
  }

  th, td {
    padding: 0.75rem 0.5rem;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
</style>

