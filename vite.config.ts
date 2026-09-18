import { defineConfig } from 'vite'
import react from '@vitejs/react-swc'

// https://vitejs.dev
export default defineConfig({
  plugins: [react()],
  base: '/vanvanmusicapp-2.1/', 
})
