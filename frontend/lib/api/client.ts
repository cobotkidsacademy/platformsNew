import axios from "axios";

// Hardcode the API URL to avoid env issues - change this for production
const API_BASE_URL = "http://localhost:3001";

// Log for debugging
if (typeof window !== "undefined") {
  console.log("=== API CLIENT INIT ===");
  console.log("NEXT_PUBLIC_API_URL env:", process.env.NEXT_PUBLIC_API_URL);
  console.log("Using API URL:", API_BASE_URL);
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    // Check for student token first, then tutor token, then admin token
    const studentToken = localStorage.getItem("student_token");
    const tutorToken = localStorage.getItem("tutor_token");
    const adminToken = localStorage.getItem("auth_token");
    const token = studentToken || tutorToken || adminToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status}`, response.data);
    return response;
  },
  (error) => {
    console.error("API Error:", error.message);
    console.error("Error details:", error.response?.data || error);
    
    if (error.response?.status === 401) {
      // Handle unauthorized - clear token and redirect to login
      if (typeof window !== "undefined") {
        const isStudent = window.location.pathname.includes("/student");
        const isTutor = window.location.pathname.includes("/tutor");
        localStorage.removeItem("auth_token");
        localStorage.removeItem("student_token");
        localStorage.removeItem("student_user");
        localStorage.removeItem("tutor_token");
        localStorage.removeItem("tutor_user");
        // Don't redirect if already on login page
        if (!window.location.pathname.includes("/login")) {
          if (isStudent) {
            window.location.href = "/student/login";
          } else if (isTutor) {
            window.location.href = "/tutor/login";
          } else {
            window.location.href = "/admin/login";
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

// Default export for convenience
export default apiClient;



