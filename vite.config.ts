// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react-swc'
// import path from 'path' // 추가

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   resolve: {
//     alias: {
//       '@': path.resolve(__dirname, './src'), // @를 src 폴더로 매핑
//     },
//   },
// })

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl' // 추가

export default defineConfig({
  plugins: [
    react(),
    basicSsl() // 추가
  ],
  server: {
    https: true, // 추가
    // 이제 직접 실제 서버로 요청을 보내기로 했으니 proxy 설정은 필요 없습니다.
  },
})