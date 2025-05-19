const API_URL: string = import.meta.env.VITE_API_URL || "http://localhost:5000";

// define the types for fetchConfig
interface FetchConfig {
  headers: {
    [key: string]: string;
  };
}

// define the types for endpoints
interface Endpoints {
  scientists: string;
  login: string;
  logout: string;
  bugs: string;
  currentUser: string;
  register: string;
}

// fetch configuration
const fetchConfig: FetchConfig = {
  headers: {
    "Content-Type": "application/json",
  },
};

export const endpoints: Endpoints = {
  scientists: `${API_URL}/scientists`,
  bugs: `${API_URL}/bugs`,
  login: `${API_URL}/auth/login`,
  logout: `${API_URL}/auth/logout`,
  currentUser: `${API_URL}/auth/me`, register: `${API_URL}/auth/register`
};

export const apiFetch = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const config: RequestInit = {
    ...fetchConfig,
    ...options,
    headers: {
      ...fetchConfig.headers,
      ...options.headers,
    },
  };

  try {
    const response: Response = await fetch(endpoint, config);
    if (!response.ok) {
      const errorBody = await response.json().catch((err: unknown) => {
        console.error("Failed to parse error response as JSON:", err);
        return { message: response.statusText };
      });
      throw new Error(
        errorBody.message || `Request failed with status ${response.status}`
      );
    }
    const data: T = await response.json();
    return data;
  } catch (error) {
    console.error(`API request failed to ${endpoint}:`, error);

    // Re-throw the error after logging so the caller can handle it
    throw error;
  }
};
