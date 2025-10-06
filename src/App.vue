<template>
  <div class="app-container">
    <AppHeader />
    
    <div class="controls">
      <ImportControls 
        @import-file="handleFileImport"
        @import-text="handleTextImport"
      />
      
      <SearchBox 
        v-model="searchTerm"
        @search="handleSearch"
      />
      
      <StatsDisplay 
        :total-count="filteredData.length"
        :valid-token-count="validTokenCount"
      />
    </div>

    <DataTable 
      v-if="filteredData.length > 0"
      :data="filteredData"
      @show-details="handleShowDetails"
      @query-stripe="handleQueryStripe"
    />
    
    <EmptyState v-else />

    <!-- Token详情模态框 -->
    <TokenModal 
      v-if="showModal"
      :user-data="selectedUser"
      @close="showModal = false"
      @query-stripe="handleQueryStripeForUser"
    />
    
    <!-- 文本导入模态框 -->
    <TextImportModal 
      v-if="showTextImportModal"
      @import="handleTextDataImport"
      @close="showTextImportModal = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AppHeader from './components/AppHeader.vue'
import ImportControls from './components/ImportControls.vue'
import SearchBox from './components/SearchBox.vue'
import StatsDisplay from './components/StatsDisplay.vue'
import DataTable from './components/DataTable.vue'
import EmptyState from './components/EmptyState.vue'
import TokenModal from './components/TokenModal.vue'
import TextImportModal from './components/TextImportModal.vue'
import { showMessage } from './utils/message'
import { queryUserStripeInfo } from './utils/api'

// 数据状态
const userData = ref([])
const filteredData = ref([])
const searchTerm = ref('')
const showModal = ref(false)
const showTextImportModal = ref(false)
const selectedUser = ref(null)

// 计算属性：有效Token数量
const validTokenCount = computed(() => {
  return filteredData.value.filter(item => 
    item.auth_info?.WorkosCursorSessionToken && item.tokenValidity !== false
  ).length
})

// 处理文件导入
const handleFileImport = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result)
      loadData(data)
    } catch (error) {
      showMessage('JSON解析失败：' + error.message, 'error')
      console.error('解析错误:', error)
    }
  }
  reader.readAsText(file)
}

// 处理文本导入按钮点击
const handleTextImport = () => {
  showTextImportModal.value = true
}

// 处理文本数据导入
const handleTextDataImport = (jsonText) => {
  try {
    const data = JSON.parse(jsonText)
    loadData(data)
    showTextImportModal.value = false
  } catch (error) {
    showMessage('JSON格式错误：' + error.message, 'error')
    console.error('解析错误:', error)
  }
}

// 加载数据
const loadData = (data) => {
  if (!Array.isArray(data)) {
    throw new Error('数据格式不正确，应为数组格式')
  }
  
  userData.value = data
  filteredData.value = [...data]
  showMessage(`数据加载成功！共 ${data.length} 条记录`, 'success')
}

// 搜索功能
const handleSearch = () => {
  const term = searchTerm.value.toLowerCase().trim()
  
  if (!term) {
    filteredData.value = [...userData.value]
  } else {
    filteredData.value = userData.value.filter(item => {
      const email = (item.email || '').toLowerCase()
      return email.includes(term)
    })
  }
}

// 显示详情
const handleShowDetails = (user) => {
  selectedUser.value = user
  showModal.value = true
}

// 查询Stripe信息（从表格）
const handleQueryStripe = async (user) => {
  const token = user.auth_info?.WorkosCursorSessionToken
  
  if (!token) {
    showMessage('该用户没有WorkosCursorSessionToken', 'warning')
    return
  }
  
  // 验证Token格式
  if (!token.startsWith('user_')) {
    showMessage('⚠️ Token格式可能不正确（应以user_开头）', 'warning')
  }
  
  console.log('发送Token到API:', token.substring(0, 15) + '...')
  showMessage('正在查询Cursor Stripe信息...', 'info')
  
  try {
    const result = await queryUserStripeInfo(token)
    
    if (result.success) {
      showMessage('✅ 查询成功！', 'success')
      console.log('Stripe信息:', result.data)
      
      // 格式化显示查询结果
      const info = result.data
      const formatted = JSON.stringify(info, null, 2)
      
      // 创建一个更好的显示方式
      const message = `📊 Cursor Stripe 信息\n\n用户: ${user.email}\n\n${formatted}`
      alert(message)
    } else {
      showMessage('❌ 查询失败: ' + result.error, 'error')
      console.error('查询失败详情:', result)
      
      // 如果是401错误，给出更具体的提示
      if (result.error.includes('401')) {
        alert('Token验证失败 (401):\n\n可能原因：\n1. Token已过期\n2. Token格式不正确\n3. 该Token已被撤销\n\n建议：从Cursor应用重新获取Token')
      }
    }
  } catch (error) {
    showMessage('查询出错: ' + error.message, 'error')
    console.error('查询异常:', error)
  }
}

// 查询Stripe信息（从详情页）
const handleQueryStripeForUser = async (token) => {
  if (!token) {
    showMessage('没有可查询的Token', 'warning')
    return
  }
  
  showMessage('正在查询Cursor Stripe信息...', 'info')
  
  try {
    const result = await queryUserStripeInfo(token)
    
    if (result.success) {
      showMessage('✅ 查询成功！', 'success')
      console.log('Stripe信息:', result.data)
      
      // 格式化显示查询结果
      const info = result.data
      const formatted = JSON.stringify(info, null, 2)
      
      const message = `📊 Cursor Stripe 信息\n\n${formatted}`
      alert(message)
    } else {
      showMessage('❌ 查询失败: ' + result.error, 'error')
      console.error('查询失败详情:', result)
    }
  } catch (error) {
    showMessage('查询出错: ' + error.message, 'error')
    console.error('查询异常:', error)
  }
}
</script>

<style scoped>
.app-container {
  max-width: 1400px;
  margin: 0 auto;
  background: var(--card-bg);
  border-radius: 16px;
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

.controls {
  padding: 1.5rem 2rem;
  background: var(--bg-color);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
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
  white-space: nowrap;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-success {
  background: var(--success-color);
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: #059669;
  transform: translateY(-2px);
  box-shadow: var(--shadow);
}

.btn-secondary {
  background: #94a3b8;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #64748b;
  transform: translateY(-2px);
  box-shadow: var(--shadow);
}

.btn-small {
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
}

@media (max-width: 768px) {
  .controls {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>

