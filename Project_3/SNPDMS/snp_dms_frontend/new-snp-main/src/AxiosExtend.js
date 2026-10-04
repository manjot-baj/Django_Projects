import { axiosInstance } from "./Axios";

axiosInstance.interceptors.response.use(
  (response) => response, // Pass through successful responses
  (error) => {
    // This interceptor acts as a global error callback
    if (error.response) {
      if (error.response.status === 401) {
        console.error("Unauthorized: Redirect to login or refresh token");
      } else if (error.response.status === 404) {
        console.error("Not Found: The requested resource does not exist");
      } else if (error.response.status === 403) {
        if (localStorage.getItem("userInfo")) {
          let user = JSON.parse(localStorage.getItem("userInfo"));
          if (user?.role === "Admin") {
            return Promise.reject(error);
          } else {
            window.history.replaceState(
              {
                errorData: `Axios Response  Error 403 ${error.response.config?.method} ->  ${error.response.config?.baseURL}/${error.response.config?.url}`,
              },
              `Axios Response  Error 403 ${error.response.config?.method} ->  ${error.response.config?.baseURL}/${error.response.config?.url}`,
              `/AccessDenied?api=${error.response.config?.baseURL}/${error.response.config?.url}&method=${error.response.config?.method}`
            );
            window.location.reload();
          }
        }
      }
      // You can also throw a custom error or display a notification
      // throw new Error('API Error: ' + error.response.status);
    } else if (error.request) {
      console.error("No response received from server:", error.request);
    } else {
      console.error("Error in request setup:", error.message);
    }
    return Promise.reject(error); // Re-throw the error to be caught by subsequent .catch() blocks
  }
);

export default  axiosInstance;