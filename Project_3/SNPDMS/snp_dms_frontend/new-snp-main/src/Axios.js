import Axios from "axios";

const AUTH_TOKEN = localStorage.getItem("accessToken");
const domain = window.location.host;
const appLayerProtocol = window.location.protocol.split(":")[0];

export const getToken = () => {
  return `Bearer ${AUTH_TOKEN}`;
};

Axios.defaults.baseURL =
  domain === "localhost:3000"
    ? "https://newstag-api.decomans.com"
    : `${appLayerProtocol}://${domain.split(".")[0]}-api.decomans.com`;


// Axios.defaults.headers.common['Authorization'] = getToken();
Axios.defaults.headers.post["Content-Type"] =
  "application/json";

export const axiosInstance = Axios.create({});

axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = "Bearer " + token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
