import axios from 'axios';

// const baseURL = import.meta.env.

const api = axios.create({
  baseURL: 'https://server.coreio.site', 
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, 
});

// axios 설정 파일 (api/axios.ts 등)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 서버에서 401(미인증) 에러를 던지면 로컬 로그인 정보도 삭제
    if (error.response?.status === 401) {
      localStorage.removeItem("isLoggedIn");
      window.location.href = "/login"; 
    }
    return Promise.reject(error);
  }
);

export default api;



