// {{RIPER-6:
//   Action: "Added"
//   Task_ID: "#VUE-003"
//   Timestamp: "2025-10-05T14:00:00Z"
//   Authoring_Role: "PM"
//   Principle_Applied: "可复用工具函数"
//   Quality_Check: "统一的消息提示机制"
//   MCP_Tools_Used: ["write"]
// }}

/**
 * 显示消息提示
 * @param {string} message - 消息内容
 * @param {string} type - 消息类型: success, error, warning, info
 */
export function showMessage(message, type = 'info') {
  const colors = {
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6'
  }

  const messageEl = document.createElement('div')
  messageEl.style.cssText = `
    position: fixed;
    top: 2rem;
    right: 2rem;
    background: ${colors[type]};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    z-index: 10000;
    animation: slideIn 0.3s ease;
    font-weight: 500;
    max-width: 400px;
    word-wrap: break-word;
  `
  messageEl.textContent = message

  document.body.appendChild(messageEl)

  setTimeout(() => {
    messageEl.style.animation = 'slideOut 0.3s ease'
    setTimeout(() => {
      document.body.removeChild(messageEl)
    }, 300)
  }, 3000)
}


