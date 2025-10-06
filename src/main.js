// {{RIPER-6:
//   Action: "Added"
//   Task_ID: "#VUE-002"
//   Timestamp: "2025-10-05T14:00:00Z"
//   Authoring_Role: "PM"
//   Principle_Applied: "Vue 3 应用初始化最佳实践"
//   Quality_Check: "标准Vue 3 + Vite项目入口"
//   MCP_Tools_Used: ["write"]
// }}

import { createApp } from 'vue'
import App from './App.vue'
import './assets/style.css'

const app = createApp(App)

app.mount('#app')


