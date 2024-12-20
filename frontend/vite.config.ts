import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server:{
    proxy:{
      '/token': 'http://0.0.0.0:8081',
      '/users': 'http://0.0.0.0:8081',
      '/templates': 'http://0.0.0.0:8081',
      '/jobs': 'http://0.0.0.0:8081'
    }
  }
})
