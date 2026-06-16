import axios from 'axios';

const api = axios.create({
  baseURL: 'https://quick-park-june-26.onrender.com',
});

export default api;
