import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
  plugins: [
    react(),
    basicSsl()
  ],
  server: {
    https: true,
    proxy: {
      '/api': {
        target: 'https://server.coreio.site',
        changeOrigin: true,
        secure: false,
      }
    }
  },
})

// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import basicSsl from '@vitejs/plugin-basic-ssl' // 추가

// export default defineConfig({
//   plugins: [
//     react(),
//     basicSsl() // 추가
//   ],
//   server: {
//     https: true, // 추가
//     // 이제 직접 실제 서버로 요청을 보내기로 했으니 proxy 설정은 필요 없습니다.
//   },
// })