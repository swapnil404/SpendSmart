// API client for non-auth endpoints (expenses, etc.)
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/$/, "");

interface FetchOptions extends RequestInit {
  body?: any;
}

interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
}

/**
 * Fetch wrapper for API calls that includes credentials for cookie-based auth
 */
export async function apiFetch<T = any>(endpoint: string, options: FetchOptions = {}): Promise<ApiResponse<T>> {
  try {
    const url = `${API_URL}${endpoint}`;
    
    const fetchOptions: RequestInit = {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    // If body is an object, stringify it
    if (options.body && typeof options.body === 'object') {
      fetchOptions.body = JSON.stringify(options.body);
    }

    const response = await fetch(url, fetchOptions);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error(`API fetch error for ${endpoint}:`, error);
    return { data: null, error: error as Error };
  }
}
