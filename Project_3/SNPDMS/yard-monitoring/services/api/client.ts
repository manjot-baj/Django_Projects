import { ACCESS_TOKEN_KEY, useAuthStore } from "@/store/authStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Constants from "expo-constants";

const { apiUrl } =
  (Constants.expoConfig?.extra as {
    apiUrl: string;
    env: string;
  }) ?? {};
const API_BASE = apiUrl;
const { logout ,setNetWorkError} = useAuthStore.getState();

const clientAxios = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
});

clientAxios.interceptors.request.use(async (config) => {
  console.log("Request Payload:", config.data);
  const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

clientAxios.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;
    if (err.message === "Network Error" || err.code === "ECONNABORTED") {
      console.log("🌐 No Internet / Network Error");
      // You can show toast or popup here
      setNetWorkError(true)
      return Promise.reject({
        message: "Network Error: Please check your internet connection.",
        original: err,
      });
    }

    if (err.response?.status === 401 && !originalRequest._retry) {
      logout();
    }
    return Promise.reject(err);
  }
);

export default clientAxios;
