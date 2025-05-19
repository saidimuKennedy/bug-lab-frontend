export const API_URL: string =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

interface FetchConfig {
  headers: {
    [key: string]: string;
  };
  credentials?: "include" | "same-origin" | "omit";
}

interface Endpoints {
  scientists: string;
  login: string;
  logout: string;
  bugs: string;
  currentUser: string;
  register: string;
}

const fetchConfig: FetchConfig = {
  headers: {
    "Content-Type": "application/json",
  },
  credentials: "include",
};

export const endpoints: Endpoints = {
  scientists: `${API_URL}/scientists`,
  bugs: `${API_URL}/bugs`,
  login: `${API_URL}/auth/login`,
  logout: `${API_URL}/auth/logout`,
  currentUser: `${API_URL}/auth/me`,
  register: `${API_URL}/auth/register`,
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
      ...(options.headers as Record<string, string>),
      ...(options.body &&
      typeof options.body === "string" &&
      options.headers &&
      !(options.headers as Record<string, string>)["Content-Type"]
        ? { "Content-Type": "application/json" }
        : {}),
    },
  };

  console.log(`Workspaceing: ${endpoint}`, config);

  try {
    const response: Response = await fetch(endpoint, config);
    console.log(`Response for ${endpoint}: Status ${response.status}`);

    if (!response.ok) {
      const errorBody = await response.json().catch((err: unknown) => {
        console.error(
          `Failed to parse error response from ${endpoint} as JSON:`,
          err
        );
        return response.text().catch((textErr: unknown) => {
          console.error(
            `Failed to parse error response from ${endpoint} as text:`,
            textErr
          );
          return response.statusText;
        });
      });

      const errorMessage =
        typeof errorBody === "object" &&
        errorBody !== null &&
        "message" in errorBody &&
        typeof errorBody.message === "string"
          ? errorBody.message
          : typeof errorBody === "string"
          ? errorBody
          : `Request failed with status ${response.status}`;

      throw new Error(errorMessage);
    }
    const data: T = await response.json();
    return data;
  } catch (error) {
    console.error(`API request failed to ${endpoint}:`, error);
    throw error;
  }
};
