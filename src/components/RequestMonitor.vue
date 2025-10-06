<template>
  <div class="request-monitor">
    <div class="monitor-header">
      <h3>📡 实时请求监控</h3>
      <div class="header-actions">
        <button class="btn btn-small" @click="clearLogs">🗑️ 清空</button>
        <button class="btn btn-small" @click="generateCurlCommand">📋 生成 cURL 命令</button>
      </div>
    </div>
    
    <!-- 请求日志列表 -->
    <div class="logs-container">
      <div v-if="requestLogs.length === 0" class="empty-logs">
        <p>💤 暂无请求记录</p>
        <p class="hint">点击"查询Stripe"或使用Token测试工具后，这里会显示完整的请求详情</p>
      </div>
      
      <div v-else class="logs-list">
        <div 
          v-for="(log, index) in requestLogs" 
          :key="index"
          class="log-item"
          :class="{ 'log-success': log.success, 'log-error': !log.success }"
        >
          <div class="log-header" @click="log.expanded = !log.expanded">
            <div class="log-title">
              <span class="status-icon">{{ log.success ? '✅' : '❌' }}</span>
              <span class="timestamp">{{ log.timestamp }}</span>
              <span class="method">{{ log.method }}</span>
              <span class="status-code">{{ log.statusCode }}</span>
            </div>
            <span class="expand-icon">{{ log.expanded ? '▼' : '▶' }}</span>
          </div>
          
          <div v-if="log.expanded" class="log-details">
            <!-- 第一步：前端 → Vercel -->
            <div class="request-step">
              <h4>1️⃣ 前端 → Vercel Function</h4>
              <div class="request-info">
                <div class="info-row">
                  <strong>URL:</strong>
                  <code>{{ log.frontendRequest.url }}</code>
                </div>
                <div class="info-row">
                  <strong>方法:</strong>
                  <code>{{ log.frontendRequest.method }}</code>
                </div>
                <div class="info-row headers-row">
                  <strong>请求头:</strong>
                  <pre>{{ formatHeaders(log.frontendRequest.headers) }}</pre>
                </div>
              </div>
            </div>
            
            <!-- 第二步：Vercel → Cursor -->
            <div class="request-step highlight">
              <h4>2️⃣ Vercel Function → Cursor API</h4>
              <p class="step-note">👇 这是实际发送给 Cursor 的请求</p>
              <div class="request-info">
                <div class="info-row">
                  <strong>URL:</strong>
                  <code>{{ log.cursorRequest.url }}</code>
                </div>
                <div class="info-row">
                  <strong>方法:</strong>
                  <code>{{ log.cursorRequest.method }}</code>
                </div>
                <div class="info-row headers-row">
                  <strong>请求头:</strong>
                  <pre>{{ formatHeaders(log.cursorRequest.headers) }}</pre>
                </div>
                
                <!-- Cookie 特别显示 -->
                <div class="cookie-highlight">
                  <strong>🍪 Cookie 头部:</strong>
                  <div class="cookie-value">
                    {{ log.cursorRequest.headers.Cookie }}
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 响应信息 -->
            <div class="request-step">
              <h4>📨 Cursor API 响应</h4>
              <div class="request-info">
                <div class="info-row">
                  <strong>状态码:</strong>
                  <code :class="log.success ? 'success-code' : 'error-code'">
                    {{ log.statusCode }} {{ log.statusText }}
                  </code>
                </div>
                <div class="info-row" v-if="log.responseData">
                  <strong>响应数据:</strong>
                  <pre class="response-data">{{ JSON.stringify(log.responseData, null, 2) }}</pre>
                </div>
              </div>
            </div>
            
            <!-- Token 信息 -->
            <div class="request-step">
              <h4>📝 Token 信息</h4>
              <div class="request-info">
                <div class="info-row">
                  <strong>长度:</strong>
                  <code>{{ log.tokenInfo.length }} 字符</code>
                </div>
                <div class="info-row">
                  <strong>前缀:</strong>
                  <code>{{ log.tokenInfo.prefix }}</code>
                </div>
                <div class="info-row">
                  <strong>格式:</strong>
                  <code :class="log.tokenInfo.valid ? 'success-code' : 'error-code'">
                    {{ log.tokenInfo.valid ? '✅ 正确（以user_开头）' : '❌ 错误' }}
                  </code>
                </div>
              </div>
            </div>
            
            <!-- cURL 命令 -->
            <div class="curl-section">
              <button class="btn btn-small" @click="copyCurlCommand(log)">
                📋 复制等效的 cURL 命令
              </button>
              <pre v-if="log.showCurl" class="curl-command">{{ generateCurl(log) }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- cURL 命令生成器 -->
    <div v-if="showCurlGenerator" class="curl-generator-modal" @click.self="showCurlGenerator = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>🔧 cURL 命令生成器</h3>
          <span class="close" @click="showCurlGenerator = false">&times;</span>
        </div>
        <div class="modal-body">
          <p>粘贴您的 Token，生成可直接在终端运行的 cURL 命令：</p>
          <textarea 
            v-model="curlToken" 
            placeholder="user_2XXXXXXXXXXXXXXXXXXXXXXXXXX"
            rows="2"
          ></textarea>
          <button class="btn btn-primary" @click="generateAndCopyCurl">
            生成并复制命令
          </button>
          <div v-if="generatedCurl" class="generated-curl">
            <p><strong>生成的命令：</strong></p>
            <pre>{{ generatedCurl }}</pre>
            <p class="hint">在终端运行此命令，直接测试 Token 是否有效</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { showMessage } from '../utils/message'

const requestLogs = ref([])
const showCurlGenerator = ref(false)
const curlToken = ref('')
const generatedCurl = ref('')

// 监听全局请求事件
onMounted(() => {
  window.addEventListener('stripe-api-call', handleApiCall)
})

const handleApiCall = (event) => {
  const { detail } = event
  
  const log = {
    timestamp: new Date().toLocaleString('zh-CN'),
    success: detail.success,
    method: 'GET',
    statusCode: detail.statusCode || (detail.success ? 200 : 401),
    statusText: detail.statusText || (detail.success ? 'OK' : 'Unauthorized'),
    frontendRequest: {
      url: detail.apiUrl,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Cursor-Token': detail.token.substring(0, 20) + '...',
        'Origin': window.location.origin
      }
    },
    cursorRequest: {
      url: 'https://www.cursor.com/api/auth/stripe',
      method: 'GET',
      headers: {
        'Cookie': `WorkosCursorSessionToken=${detail.token}`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Origin': 'https://www.cursor.com',
        'Referer': 'https://www.cursor.com/'
      }
    },
    responseData: detail.data,
    tokenInfo: {
      length: detail.token.length,
      prefix: detail.token.substring(0, 20) + '...',
      valid: detail.token.startsWith('user_')
    },
    expanded: true,
    showCurl: false
  }
  
  requestLogs.value.unshift(log)
  
  // 最多保留 20 条记录
  if (requestLogs.value.length > 20) {
    requestLogs.value.pop()
  }
}

const clearLogs = () => {
  requestLogs.value = []
  showMessage('日志已清空', 'success')
}

const formatHeaders = (headers) => {
  return Object.entries(headers)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n')
}

const generateCurl = (log) => {
  const token = log.cursorRequest.headers.Cookie.replace('WorkosCursorSessionToken=', '')
  return `curl -X GET \\
  -H "Cookie: WorkosCursorSessionToken=${token}" \\
  -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" \\
  -H "Accept: application/json, text/plain, */*" \\
  -H "Accept-Language: en-US,en;q=0.9" \\
  -H "Origin: https://www.cursor.com" \\
  -H "Referer: https://www.cursor.com/" \\
  https://www.cursor.com/api/auth/stripe`
}

const copyCurlCommand = async (log) => {
  const curl = generateCurl(log)
  try {
    await navigator.clipboard.writeText(curl)
    showMessage('cURL 命令已复制！', 'success')
    log.showCurl = true
  } catch (err) {
    showMessage('复制失败', 'error')
  }
}

const generateCurlCommand = () => {
  showCurlGenerator.value = true
}

const generateAndCopyCurl = async () => {
  if (!curlToken.value.trim()) {
    showMessage('请先输入 Token', 'warning')
    return
  }
  
  const token = curlToken.value.trim()
  generatedCurl.value = `curl -X GET \\
  -H "Cookie: WorkosCursorSessionToken=${token}" \\
  -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" \\
  -H "Accept: application/json, text/plain, */*" \\
  -H "Accept-Language: en-US,en;q=0.9" \\
  -H "Origin: https://www.cursor.com" \\
  -H "Referer: https://www.cursor.com/" \\
  https://www.cursor.com/api/auth/stripe`
  
  try {
    await navigator.clipboard.writeText(generatedCurl.value)
    showMessage('cURL 命令已复制到剪贴板！', 'success')
  } catch (err) {
    showMessage('命令已生成，请手动复制', 'warning')
  }
}
</script>

<style scoped>
.request-monitor {
  background: white;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  overflow: hidden;
  margin: 1.5rem 0;
}

.monitor-header {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.monitor-header h3 {
  margin: 0;
  font-size: 1.3rem;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-small {
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
  background: white;
  color: #10b981;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-small:hover {
  background: #f0fdf4;
  transform: translateY(-1px);
}

.logs-container {
  max-height: 600px;
  overflow-y: auto;
}

.empty-logs {
  text-align: center;
  padding: 3rem 2rem;
  color: #64748b;
}

.empty-logs p {
  margin: 0.5rem 0;
}

.empty-logs .hint {
  font-size: 0.9rem;
  color: #94a3b8;
}

.logs-list {
  padding: 1rem;
}

.log-item {
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  margin-bottom: 1rem;
  overflow: hidden;
  transition: all 0.3s;
}

.log-item.log-success {
  border-color: #10b981;
}

.log-item.log-error {
  border-color: #ef4444;
}

.log-header {
  padding: 1rem 1.5rem;
  background: #f8fafc;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background 0.2s;
}

.log-header:hover {
  background: #f1f5f9;
}

.log-title {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.status-icon {
  font-size: 1.2rem;
}

.timestamp {
  color: #64748b;
  font-size: 0.9rem;
}

.method {
  background: #3b82f6;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 600;
}

.status-code {
  font-family: 'Courier New', monospace;
  font-weight: 600;
}

.log-success .status-code {
  color: #10b981;
}

.log-error .status-code {
  color: #ef4444;
}

.expand-icon {
  color: #64748b;
  font-size: 1.2rem;
}

.log-details {
  padding: 1.5rem;
  background: white;
}

.request-step {
  margin-bottom: 1.5rem;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fafafa;
}

.request-step.highlight {
  border: 2px solid #f59e0b;
  background: #fffbeb;
}

.request-step h4 {
  margin: 0 0 1rem 0;
  color: #1e293b;
  font-size: 1.1rem;
}

.step-note {
  color: #f59e0b;
  font-weight: 500;
  margin: -0.5rem 0 1rem 0;
  font-size: 0.9rem;
}

.request-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.info-row {
  display: flex;
  gap: 0.75rem;
}

.info-row strong {
  min-width: 80px;
  color: #475569;
  font-size: 0.9rem;
}

.info-row code {
  background: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  color: #1e293b;
}

.success-code {
  color: #10b981 !important;
  font-weight: 600;
}

.error-code {
  color: #ef4444 !important;
  font-weight: 600;
}

.headers-row {
  flex-direction: column;
}

.headers-row pre {
  background: #1e293b;
  color: #e2e8f0;
  padding: 0.75rem;
  border-radius: 4px;
  font-size: 0.8rem;
  overflow-x: auto;
  margin: 0;
}

.cookie-highlight {
  margin-top: 1rem;
  padding: 1rem;
  background: #fef3c7;
  border: 2px solid #fbbf24;
  border-radius: 6px;
}

.cookie-highlight strong {
  color: #78350f;
  font-size: 1rem;
  display: block;
  margin-bottom: 0.5rem;
}

.cookie-value {
  background: white;
  padding: 0.75rem;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  word-break: break-all;
  color: #1e293b;
  border: 1px solid #fbbf24;
}

.response-data {
  background: #1e293b;
  color: #e2e8f0;
  padding: 1rem;
  border-radius: 4px;
  font-size: 0.8rem;
  overflow-x: auto;
  margin: 0;
  max-height: 300px;
  overflow-y: auto;
}

.curl-section {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.curl-command {
  margin-top: 1rem;
  background: #1e293b;
  color: #10b981;
  padding: 1rem;
  border-radius: 4px;
  font-size: 0.85rem;
  overflow-x: auto;
}

/* Modal */
.curl-generator-modal {
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.curl-generator-modal .modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 700px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.curl-generator-modal .modal-header {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 12px 12px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.curl-generator-modal .modal-header h3 {
  margin: 0;
  font-size: 1.3rem;
}

.close {
  font-size: 2rem;
  color: white;
  cursor: pointer;
  opacity: 0.8;
  transition: opacity 0.2s;
}

.close:hover {
  opacity: 1;
}

.modal-body {
  padding: 2rem;
}

.modal-body textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 6px;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  margin: 1rem 0;
  resize: vertical;
}

.modal-body textarea:focus {
  outline: none;
  border-color: #10b981;
}

.btn-primary {
  width: 100%;
  padding: 0.75rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover {
  background: #059669;
  transform: translateY(-2px);
}

.generated-curl {
  margin-top: 1.5rem;
  padding: 1rem;
  background: #f0fdf4;
  border: 1px solid #10b981;
  border-radius: 6px;
}

.generated-curl p {
  margin: 0.5rem 0;
  color: #065f46;
}

.generated-curl pre {
  background: #1e293b;
  color: #10b981;
  padding: 1rem;
  border-radius: 4px;
  font-size: 0.85rem;
  overflow-x: auto;
  margin: 0.75rem 0;
}

.generated-curl .hint {
  font-size: 0.9rem;
  color: #059669;
}
</style>

