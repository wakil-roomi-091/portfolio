import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach the auth token (if any) to every request.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// On 401, clear stale credentials so the app falls back to the logged-out state.
// `userData` is a legacy key (it used to hold the name/email); removing it here
// cleans it out of browsers that still have it.
//
// Sign-in attempts are exempt: a rejected login is also a 401, and wiping the
// stored token there would log out a session that is still perfectly valid (for
// instance, signing in as someone else in another tab).
const CREDENTIAL_CHECK_PATHS = ["/auth/login", "/auth/register"];

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || "";
    const isCredentialCheck = CREDENTIAL_CHECK_PATHS.some((p) =>
      url.includes(p),
    );

    if (error.response?.status === 401 && !isCredentialCheck) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("userData");
      delete api.defaults.headers.common["Authorization"];
    }
    return Promise.reject(error);
  },
);

export default api;
