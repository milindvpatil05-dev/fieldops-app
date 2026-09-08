import axios from "axios";

export const baseUrl = "http://10.233.156.119:5000"; //"http://localhost:5000";

export const api = axios.create({
  baseURL: baseUrl,
});
