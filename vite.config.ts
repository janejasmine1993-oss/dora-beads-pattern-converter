import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// DEPLOY_BASE 用于 Gitee Pages / GitHub Pages 等有子路径的部署平台
// 本地开发时不设置，构建时通过环境变量传入：
//   Gitee Pages:  VITE_BASE=/dora-beads-pattern-converter/ npm run build
//   Vercel/CF:    直接 npm run build（base 默认 /）
const base = process.env.VITE_BASE ?? '/'

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
})
