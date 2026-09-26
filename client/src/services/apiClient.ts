const getBaseUrl = () => {
  return (import.meta.env.VITE_API_URL as string) || 'http://localhost:5000/api';
};

const getHeaders = (hasBody: boolean) => {
  const headers: HeadersInit = {};
  
  if (hasBody) {
    headers['Content-Type'] = 'application/json';
  }

  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

const handleResponse = async (response: Response) => {
  let data;
  try {
    data = await response.json();
  } catch (error) {
    // If not JSON, return empty or throw
    if (!response.ok) {
      if (response.status === 403) throw new Error("You are not authorized to perform this action.");
      throw new Error(response.statusText || 'An error occurred');
    }
    return null;
  }

  if (!response.ok) {
    if (response.status === 403) throw new Error("You are not authorized to perform this action.");
    const errorMsg = data.message || data.error || response.statusText || 'API Request Failed';
    throw new Error(errorMsg);
  }

  return data;
};

export const apiClient = {
  get: async <T = any>(endpoint: string): Promise<T> => {
    const response = await fetch(`${getBaseUrl()}${endpoint}`, {
      method: 'GET',
      headers: getHeaders(false),
    });
    return handleResponse(response);
  },

  post: async <T = any>(endpoint: string, body?: any): Promise<T> => {
    const response = await fetch(`${getBaseUrl()}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(!!body),
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse(response);
  },

  put: async <T = any>(endpoint: string, body?: any): Promise<T> => {
    const response = await fetch(`${getBaseUrl()}${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(!!body),
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse(response);
  },

  delete: async <T = any>(endpoint: string): Promise<T> => {
    const response = await fetch(`${getBaseUrl()}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders(false),
    });
    return handleResponse(response);
  },
};
