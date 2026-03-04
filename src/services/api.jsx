import axios from "axios";

const api = axios.create({
  baseURL: "https://electric-bill-backend.page.gd/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-API-KEY": import.meta.env.VITE_API_KEY, 
  },
});
export default api;
