const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api/v1';

interface ApiError {
  message: string;
  status: number;
}

class ApiRequestError extends Error {
  status: number;

  constructor({ message, status }: ApiError) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
  }
}

async function request<T>(
  method: string,
  path: string,
  body?: Record<string, unknown>,
  headers?: Record<string, string>,
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const reqHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  const options: RequestInit = { method, headers: reqHeaders };
  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    let message: string;
    try {
      const data: unknown = await response.json();
      if (typeof data === 'object' && data !== null && 'error' in data) {
        const errValue = (data as { error: unknown }).error;
        message = typeof errValue === 'string' ? errValue : JSON.stringify(errValue);
      } else if (typeof data === 'string') {
        message = data;
      } else {
        message = JSON.stringify(data);
      }
    } catch {
      message = await response.text();
    }
    throw new ApiRequestError({ message, status: response.status });
  }

  return response.json() as Promise<T>;
}

export { request, ApiRequestError };
