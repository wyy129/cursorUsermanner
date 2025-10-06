<template>
  <div class="token-tester">
    <div class="tester-header">
      <h3>🔍 Token 快速测试</h3>
      <p>测试您的 WorkosCursorSessionToken 是否有效</p>
    </div>
    
    <div class="tester-body">
      <div class="input-group">
        <label>粘贴 Token：</label>
        <textarea 
          v-model="testToken" 
          placeholder="user_2XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
          rows="3"
        ></textarea>
      </div>
      
      <div class="button-group">
        <button 
          class="btn btn-primary" 
          @click="testTokenValidity(false)"
          :disabled="!testToken || testing"
        >
          {{ testing ? '⏳ 测试中...' : '🧪 测试 Token' }}
        </button>
        <button 
          class="btn btn-debug" 
          @click="testTokenValidity(true)"
          :disabled="!testToken || testing"
          title="调试模式：显示完整的请求和响应详情"
        >
          {{ testing ? '⏳ 测试中...' : '🔍 调试模式测试' }}
        </button>
      </div>
      
      <!-- 测试结果 -->
      <div v-if="testResult" class="test-result" :class="testResult.success ? 'success' : 'error'">
        <div class="result-header">
          <span class="icon">{{ testResult.success ? '✅' : '❌' }}</span>
          <span class="title">{{ testResult.success ? 'Token 有效！' : 'Token 无效或已过期' }}</span>
        </div>
        
        <div class="result-body">
          <!-- 成功信息 -->
          <div v-if="testResult.success && testResult.data">
            <div class="info-item">
              <strong>会员类型：</strong>
              <span>{{ testResult.data.membershipType || 'N/A' }}</span>
            </div>
            <div class="info-item" v-if="testResult.data.daysRemainingOnTrial != null">
              <strong>剩余天数：</strong>
              <span>{{ testResult.data.daysRemainingOnTrial }} 天</span>
            </div>
            <div class="info-item">
              <strong>订阅状态：</strong>
              <span>{{ testResult.data.subscriptionStatus || 'N/A' }}</span>
            </div>
            <p class="success-tip">✅ 此 Token 可以正常使用！</p>
            
            <!-- 调试模式的额外信息 -->
            <div v-if="testResult.debugMode && testResult.data._debug" class="debug-info-box">
              <h4>🔍 请求详情（调试模式）</h4>
              
              <div class="debug-section">
                <p><strong>1️⃣ 前端 → Vercel Function</strong></p>
                <pre>{{ JSON.stringify(testResult.data._debug.requestToVercel, null, 2) }}</pre>
              </div>
              
              <div class="debug-section highlight">
                <p><strong>2️⃣ Vercel Function → Cursor API</strong></p>
                <p class="note">👇 这就是实际发送给 Cursor 的请求！</p>
                <pre>{{ JSON.stringify(testResult.data._debug.requestToCursor, null, 2) }}</pre>
                <div class="cookie-display">
                  <p><strong>Cookie 头部内容：</strong></p>
                  <code>{{ testResult.data._debug.requestToCursor.headers.Cookie }}</code>
                </div>
              </div>
              
              <div class="debug-section">
                <p><strong>📝 Token 信息</strong></p>
                <pre>{{ JSON.stringify(testResult.data._debug.tokenInfo, null, 2) }}</pre>
              </div>
            </div>
          </div>
          
          <!-- 错误信息 -->
          <div v-else>
            <div class="error-details">
              <p><strong>错误信息：</strong></p>
              <pre>{{ testResult.error }}</pre>
              
              <div v-if="testResult.details">
                <p><strong>详细信息：</strong></p>
                <pre>{{ JSON.stringify(testResult.details, null, 2) }}</pre>
              </div>
            </div>
            
            <div class="error-tips">
              <p><strong>💡 可能的原因：</strong></p>
              <ul>
                <li>Token 已过期（Cursor Token 有时效性）</li>
                <li>Token 格式不正确（应以 <code>user_</code> 开头）</li>
                <li>复制时包含了多余的空格或换行符</li>
                <li>账号登出后 Token 失效</li>
              </ul>
              
              <p><strong>🔧 解决方法：</strong></p>
              <ol>
                <li>打开 Cursor 应用</li>
                <li>按 <kbd>F12</kbd> 打开开发者工具</li>
                <li>进入 <code>Application</code> → <code>Cookies</code></li>
                <li>找到 <code>WorkosCursorSessionToken</code></li>
                <li>复制完整的值（确保没有空格）</li>
                <li>粘贴到上方输入框重新测试</li>
              </ol>
            </div>
          </div>
        </div>
        
        <!-- 调试信息 -->
        <details class="debug-details">
          <summary>查看详细调试信息</summary>
          <div class="debug-content">
            <div class="debug-item">
              <strong>Token 长度：</strong>
              <span>{{ testToken.trim().length }} 字符</span>
            </div>
            <div class="debug-item">
              <strong>Token 前缀：</strong>
              <span>{{ testToken.trim().substring(0, 20) }}...</span>
            </div>
            <div class="debug-item">
              <strong>格式检查：</strong>
              <span>{{ testToken.trim().startsWith('user_') ? '✅ 正确' : '❌ 错误（应以user_开头）' }}</span>
            </div>
            <div class="debug-item">
              <strong>响应状态：</strong>
              <span>{{ testResult.status || 'N/A' }}</span>
            </div>
          </div>
        </details>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { queryUserStripeInfo } from '../utils/api'

const testToken = ref('')
const testing = ref(false)
const testResult = ref(null)

const testTokenValidity = async (debugMode = false) => {
  if (!testToken.value.trim()) {
    return
  }
  
  testing.value = true
  testResult.value = null
  
  try {
    const token = testToken.value.trim()
    const result = await queryUserStripeInfo(token, debugMode)
    
    testResult.value = {
      ...result,
      status: result.success ? 200 : (result.details?.debug?.status || 'unknown'),
      debugMode: debugMode
    }
    
    // 如果是调试模式，在控制台显示完整信息
    if (debugMode && result.success && result.data._debug) {
      console.group('🔍 Token 测试 - 调试模式')
      console.log('完整响应数据:', result.data)
      console.log('发送到 Cursor 的 Cookie:', result.data._debug.requestToCursor.headers.Cookie)
      console.groupEnd()
    }
  } catch (error) {
    testResult.value = {
      success: false,
      error: error.message,
      status: 'error'
    }
  } finally {
    testing.value = false
  }
}
</script>

<style scoped>
.token-tester {
  background: white;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  overflow: hidden;
  margin: 1.5rem 0;
}

.tester-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  text-align: center;
}

.tester-header h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.3rem;
}

.tester-header p {
  margin: 0;
  opacity: 0.9;
  font-size: 0.9rem;
}

.tester-body {
  padding: 1.5rem;
}

.input-group {
  margin-bottom: 1rem;
}

.input-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #334155;
  font-weight: 600;
}

.input-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  resize: vertical;
  transition: border-color 0.2s;
}

.input-group textarea:focus {
  outline: none;
  border-color: #667eea;
}

.btn {
  width: 100%;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #5568d3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.button-group {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.button-group .btn {
  flex: 1;
}

.btn-debug {
  background: #f59e0b;
  color: white;
}

.btn-debug:hover:not(:disabled) {
  background: #d97706;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.test-result {
  margin-top: 1.5rem;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid;
}

.test-result.success {
  border-color: #10b981;
  background: #f0fdf4;
}

.test-result.error {
  border-color: #ef4444;
  background: #fef2f2;
}

.result-header {
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border-bottom: 1px solid;
}

.test-result.success .result-header {
  background: #dcfce7;
  border-color: #bbf7d0;
}

.test-result.error .result-header {
  background: #fee2e2;
  border-color: #fecaca;
}

.result-header .icon {
  font-size: 1.5rem;
}

.result-header .title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
}

.result-body {
  padding: 1.5rem;
}

.info-item {
  margin-bottom: 0.75rem;
  display: flex;
  gap: 0.5rem;
}

.info-item strong {
  color: #475569;
  min-width: 80px;
}

.success-tip {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #dcfce7;
  border-radius: 6px;
  color: #166534;
  font-weight: 500;
}

.error-details {
  margin-bottom: 1.5rem;
}

.error-details pre {
  background: #1e293b;
  color: #e2e8f0;
  padding: 1rem;
  border-radius: 6px;
  overflow-x: auto;
  font-size: 0.85rem;
  margin: 0.5rem 0;
}

.error-tips {
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 6px;
  padding: 1rem;
  color: #78350f;
}

.error-tips p {
  margin: 0.75rem 0;
  font-weight: 600;
}

.error-tips ul,
.error-tips ol {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}

.error-tips li {
  margin: 0.25rem 0;
}

.error-tips code,
.error-tips kbd {
  background: #fef3c7;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
}

.error-tips kbd {
  border: 1px solid #fbbf24;
}

.debug-details {
  margin-top: 1rem;
  border-top: 1px solid #e2e8f0;
  padding-top: 1rem;
}

.debug-details summary {
  cursor: pointer;
  font-weight: 600;
  color: #64748b;
  padding: 0.5rem;
  user-select: none;
}

.debug-details summary:hover {
  color: #334155;
}

.debug-content {
  margin-top: 0.75rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 6px;
}

.debug-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.debug-item strong {
  color: #475569;
}

.debug-item span {
  color: #1e293b;
  font-family: 'Courier New', monospace;
}

.debug-info-box {
  margin-top: 1.5rem;
  padding: 1rem;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
}

.debug-info-box h4 {
  margin: 0 0 1rem 0;
  color: #1e293b;
  font-size: 1.1rem;
}

.debug-section {
  margin-bottom: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.debug-section.highlight {
  border: 2px solid #f59e0b;
  background: #fffbeb;
}

.debug-section p {
  margin: 0 0 0.5rem 0;
  font-weight: 600;
  color: #334155;
}

.debug-section p.note {
  color: #f59e0b;
  font-weight: 500;
  font-size: 0.9rem;
  margin-bottom: 0.75rem;
}

.debug-section pre {
  background: #1e293b;
  color: #e2e8f0;
  padding: 0.75rem;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 0.85rem;
  margin: 0;
}

.cookie-display {
  margin-top: 0.75rem;
  padding: 0.75rem;
  background: #fef3c7;
  border-radius: 4px;
  border: 1px solid #fbbf24;
}

.cookie-display p {
  margin: 0 0 0.5rem 0;
  color: #78350f;
  font-size: 0.9rem;
}

.cookie-display code {
  display: block;
  padding: 0.5rem;
  background: white;
  border-radius: 4px;
  color: #1e293b;
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  word-break: break-all;
}
</style>

