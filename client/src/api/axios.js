// src/api/axios.js
import axios from "axios";

const instance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:5000",
  withCredentials: true, // optional: set true if you're using cookies
});

export default instance;
