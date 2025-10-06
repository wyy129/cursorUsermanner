// {{RIPER-6:
//   Action: "Added"
//   Task_ID: "#1"
//   Timestamp: "2025-10-07T00:02:59+08:00"
//   Authoring_Role: "frontend-expert"
//   Principle_Applied: "现代化构建工具配置"
//   MCP_Tools_Used: ["mcp.server_time"]
// }}

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})

