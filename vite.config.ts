import { defineConfig } from 'vite'
import react from '@vitejs/react-swc'

export default defineConfig({
  plugins: [react()],
  base: '/vanmusicapp-2.1/', // Tambahkan baris ini!
})
