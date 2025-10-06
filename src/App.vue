<!-- {{RIPER-6:
  Action: "Added"
  Task_ID: "#2"
  Timestamp: "2025-10-07T00:02:59+08:00"
  Authoring_Role: "frontend-expert"
  Principle_Applied: "组件化设计，职责清晰分离"
  MCP_Tools_Used: ["mcp.server_time"]
}} -->

<template>
  <div class="app-container">
    <AppHeader />
    
    <main class="main-content">
      <div class="container">
        <!-- 统计面板 -->
        <StatsDisplay :stats="stats" />
        
        <!-- 导入控制区 -->
        <ImportControls @import="handleImport" />
        
        <!-- Token 查询工具 -->
        <TokenChecker />
        
        <!-- 搜索框 -->
        <SearchBox v-model="searchQuery" />
        
        <!-- 数据表格 -->
        <DataTable 
          v-if="filteredUsers.length > 0"
          :users="filteredUsers" 
        />
        
        <!-- 空状态 -->
        <EmptyState v-else :hasData="users.length > 0" />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import AppHeader from './components/AppHeader.vue'
import StatsDisplay from './components/StatsDisplay.vue'
import ImportControls from './components/ImportControls.vue'
import TokenChecker from './components/TokenChecker.vue'
import SearchBox from './components/SearchBox.vue'
import DataTable from './components/DataTable.vue'
import EmptyState from './components/EmptyState.vue'

// 数据状态
const users = ref([])
const searchQuery = ref('')

// 统计数据
const stats = computed(() => ({
  total: users.value.length,
  pro: users.value.filter(u => u.membershipType === 'pro').length,
  valid: users.value.filter(u => u.tokenValidity).length,
  trial: users.value.filter(u => u.daysRemainingOnTrial !== null && u.daysRemainingOnTrial > 0).length
}))

// 过滤后的用户
const filteredUsers = computed(() => {
  if (!searchQuery.value.trim()) return users.value
  
  const query = searchQuery.value.toLowerCase()
  return users.value.filter(user => 
    user.email?.toLowerCase().includes(query) ||
    user.membershipType?.toLowerCase().includes(query) ||
    user.system_type?.toLowerCase().includes(query)
  )
})

// 导入数据
const handleImport = (data) => {
  try {
    if (Array.isArray(data)) {
      users.value = data
    } else {
      alert('导入数据格式错误，请确保是 JSON 数组格式')
    }
  } catch (error) {
    alert('导入失败：' + error.message)
  }
}
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.main-content {
  padding: 2rem 0;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1rem;
}
</style>

