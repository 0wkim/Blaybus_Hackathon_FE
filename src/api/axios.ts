import axios from 'axios';

// const baseURL = import.meta.env.

const api = axios.create({
  baseURL: 'https://server.coreio.site', 
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, 
});


export default api;



