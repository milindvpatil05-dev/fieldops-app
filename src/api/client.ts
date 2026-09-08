import axios from "axios";

export const baseUrl = "http://localhost:5000";

export const api = axios.create({
  baseURL: baseUrl,
});
