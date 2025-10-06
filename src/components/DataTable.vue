<!-- 数据表格组件 -->
<template>
  <div class="data-table-container">
    <div class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>邮箱</th>
            <th>会员类型</th>
            <th>系统类型</th>
            <th>Token 状态</th>
            <th>试用剩余</th>
            <th>注册时间</th>
            <th>使用情况</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(user, index) in users" :key="index">
            <td class="email-cell">
              <div class="email-wrapper">
                <svg class="user-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span class="email-text">{{ user.email }}</span>
              </div>
            </td>
            <td>
              <span class="badge" :class="'badge-' + (user.membershipType || 'free')">
                {{ user.membershipType || 'free' }}
              </span>
            </td>
            <td>
              <span class="system-type">{{ user.system_type || 'N/A' }}</span>
            </td>
            <td>
              <span class="status-badge" :class="user.tokenValidity ? 'status-valid' : 'status-invalid'">
                {{ user.tokenValidity ? '✓ 有效' : '✗ 无效' }}
              </span>
            </td>
            <td>
              <span v-if="user.daysRemainingOnTrial !== null" class="trial-days">
                {{ user.daysRemainingOnTrial }} 天
              </span>
              <span v-else class="text-muted">-</span>
            </td>
            <td class="register-time">
              {{ formatDate(user.register_time) }}
            </td>
            <td>
              <div class="usage-info">
                <div class="usage-bar">
                  <div 
                    class="usage-fill" 
                    :style="{ width: getUsagePercent(user) + '%' }"
                  ></div>
                </div>
                <span class="usage-text">
                  {{ user.modelUsage?.used || 0 }} / {{ user.modelUsage?.total || 0 }}
                </span>
              </div>
            </td>
            <td>
              <button class="btn-action" @click="viewDetails(user)">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 详情对话框 -->
    <div v-if="selectedUser" class="modal-overlay" @click="selectedUser = null">
      <div class="modal-content modal-large" @click.stop>
        <div class="modal-header">
          <h3>用户详细信息</h3>
          <button class="close-btn" @click="selectedUser = null">×</button>
        </div>
        <div class="modal-body">
          <div class="detail-section">
            <h4>基本信息</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">邮箱：</span>
                <span class="detail-value">{{ selectedUser.email }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">会员类型：</span>
                <span class="detail-value">{{ selectedUser.membershipType }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">系统类型：</span>
                <span class="detail-value">{{ selectedUser.system_type }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">注册时间：</span>
                <span class="detail-value">{{ selectedUser.register_time }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h4>认证信息</h4>
            <div class="token-display">
              <div class="token-item">
                <span class="token-label">Access Token:</span>
                <code class="token-value">{{ selectedUser.auth_info?.['cursorAuth/accessToken']?.substring(0, 50) }}...</code>
              </div>
              <div class="token-item">
                <span class="token-label">Refresh Token:</span>
                <code class="token-value">{{ selectedUser.auth_info?.['cursorAuth/refreshToken']?.substring(0, 50) }}...</code>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h4>设备信息</h4>
            <div class="detail-grid">
              <div class="detail-item" v-for="(value, key) in selectedUser.machine_info" :key="key">
                <span class="detail-label">{{ key }}：</span>
                <span class="detail-value small">{{ value }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  users: {
    type: Array,
    required: true
  }
})

const selectedUser = ref(null)

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A'
  return dateStr.split(' ')[0]
}

const getUsagePercent = (user) => {
  if (!user.modelUsage) return 0
  const { used, total } = user.modelUsage
  return total > 0 ? (used / total) * 100 : 0
}

const viewDetails = (user) => {
  selectedUser.value = user
}
</script>

<style scoped>
.data-table-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.table-wrapper {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table thead {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.data-table th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  font-size: 0.875rem;
  white-space: nowrap;
}

.data-table tbody tr {
  border-bottom: 1px solid #e2e8f0;
  transition: background-color 0.2s;
}

.data-table tbody tr:hover {
  background-color: #f7fafc;
}

.data-table td {
  padding: 1rem;
  color: #2d3748;
  font-size: 0.875rem;
}

.email-cell {
  max-width: 250px;
}

.email-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.user-icon {
  width: 20px;
  height: 20px;
  color: #718096;
  flex-shrink: 0;
}

.email-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.badge-pro {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.badge-free {
  background: #e2e8f0;
  color: #2d3748;
}

.system-type {
  font-family: 'Courier New', monospace;
  font-size: 0.8rem;
  color: #4a5568;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-valid {
  background: #c6f6d5;
  color: #22543d;
}

.status-invalid {
  background: #fed7d7;
  color: #742a2a;
}

.trial-days {
  color: #dd6b20;
  font-weight: 600;
}

.text-muted {
  color: #a0aec0;
}

.register-time {
  font-size: 0.8rem;
  color: #718096;
}

.usage-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.usage-bar {
  width: 100px;
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
}

.usage-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s;
}

.usage-text {
  font-size: 0.75rem;
  color: #718096;
}

.btn-action {
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  color: #718096;
  border-radius: 8px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-action:hover {
  background: #f7fafc;
  color: #667eea;
}

.btn-action svg {
  width: 20px;
  height: 20px;
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
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.modal-large {
  max-width: 900px;
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

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.detail-section {
  margin-bottom: 2rem;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.detail-section h4 {
  font-size: 1rem;
  color: #2d3748;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #667eea;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-label {
  font-size: 0.75rem;
  color: #718096;
  font-weight: 600;
  text-transform: uppercase;
}

.detail-value {
  font-size: 0.9rem;
  color: #2d3748;
  word-break: break-word;
}

.detail-value.small {
  font-size: 0.75rem;
  font-family: 'Courier New', monospace;
}

.token-display {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.token-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.token-label {
  font-size: 0.75rem;
  color: #718096;
  font-weight: 600;
}

.token-value {
  background: #f7fafc;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 0.8rem;
  color: #2d3748;
  word-break: break-all;
  border: 1px solid #e2e8f0;
}
</style>

