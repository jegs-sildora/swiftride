import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const gatewayHost = process.env.GATEWAY_HOST || 'localhost:8000';
  const isLocal = gatewayHost.includes('localhost') || gatewayHost.includes('127.0.0.1');
  const computedApiUrl = isLocal 
    ? `http://${gatewayHost}/api` 
    : `https://${gatewayHost}.onrender.com/api`;

  return {
    plugins: [react()],
    define: {
      'import.meta.env.VITE_API_GATEWAY_URL': JSON.stringify(process.env.VITE_API_GATEWAY_URL || computedApiUrl)
    },
    server: {}
  }
})
