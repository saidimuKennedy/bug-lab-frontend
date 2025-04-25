const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// fetch configuration
const fetchConfig = {
	headers: {
		"Content-Type": "application/json",
	},
};

export const endpoints = {
	scientists: `${API_URL}/scientists`,
	bugs: `${API_URL}/bugs`,
};

export const apiFetch = async (endpoint, options = {}) => {
	const config = {
		...fetchConfig,
		...options,
		headers: {
			...fetchConfig.headers,
			...options.headers,
		},
	};

	try {
		const response = await fetch(endpoint, config);
		if (!response.ok) {
			const error = await response.json().catch(() => ({
				message: response.statusText,
			}));
			throw new Error(error.message || "Request failed");
		}
		return response.json();
	} catch (error) {
		console.error("API request failed:", error);
		throw error;
	}
};
