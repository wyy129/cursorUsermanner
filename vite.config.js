// {{RIPER-6:
//   Action: "Added"
//   Task_ID: "#VUE-001"
//   Timestamp: "2025-10-05T14:00:00Z"
//   Authoring_Role: "PM"
//   Principle_Applied: "跨域配置最佳实践"
//   Quality_Check: "支持开发环境代理和生产环境构建"
//   MCP_Tools_Used: ["write"]
// }}

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  
  server: {
    port: 3000,
    open: true,
    
    // 跨域代理配置 - 代理到Cursor官方API
    proxy: {
      '/api': {
        target: 'https://www.cursor.com',
        changeOrigin: true,
        secure: false,
        // /api/auth/stripe -> https://www.cursor.com/api/auth/stripe
        // 不需要rewrite，保持完整路径
      }
    }
  },
  
  // 构建配置
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    // 使用esbuild进行压缩（Vite默认，速度快）
    minify: 'esbuild',
    // 生产环境移除console和debugger
    esbuild: {
      drop: ['console', 'debugger']
    }
  },
  
  // 路径别名
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})

