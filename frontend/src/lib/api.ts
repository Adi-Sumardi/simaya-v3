const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

  const headers = new Headers(options.headers || {});
  
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }
  
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Check if body is FormData
  const isMultipart = options.body instanceof FormData;
  if (!headers.has("Content-Type") && !isMultipart) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      
      const isPublicPath = 
        window.location.pathname.startsWith("/login") ||
        window.location.pathname.startsWith("/guest-detail-asset") ||
        window.location.pathname.startsWith("/guest-data-asset-ruangan") ||
        window.location.pathname.startsWith("/guest-data-asset-lokasi");

      // Redirect to login if not already on a public page
      if (!isPublicPath) {
        window.location.href = "/login";
      }
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API Error: ${response.status} ${response.statusText}`);
  }

  if (response.status === 204) {
    return {};
  }

  return response.json();
}

export const api = {
  get: (endpoint: string, options?: RequestInit) => apiRequest(endpoint, { ...options, method: "GET" }),
  post: (endpoint: string, data?: any, options?: RequestInit) => {
    const isMultipart = data instanceof FormData;
    const body = isMultipart ? data : JSON.stringify(data);
    return apiRequest(endpoint, { ...options, method: "POST", body });
  },
  put: (endpoint: string, data?: any, options?: RequestInit) => {
    const isMultipart = data instanceof FormData;
    const body = isMultipart ? data : JSON.stringify(data);
    return apiRequest(endpoint, { ...options, method: "PUT", body });
  },
  delete: (endpoint: string, options?: RequestInit) => apiRequest(endpoint, { ...options, method: "DELETE" }),
};
