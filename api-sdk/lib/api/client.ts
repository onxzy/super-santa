import { AuthContext } from "./auth_context";

export class ApiError extends Error {
  constructor(public status: number, public message: string) {
    super(message);
    this.name = "ApiError";
  }
}

export class ApiClient {
  constructor(private baseUrl: string, private authContext: AuthContext) {
    this.baseUrl = baseUrl;
  }

  getAuthContext() {
    return this.authContext;
  }

  async fetch<Res = null>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<Res> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        Accept: "application/json",
        ...(this.authContext.getAuthHeader() && {
          Authorization: this.authContext.getAuthHeader(),
        }),
        ...(options.headers || {}),
      },
    });

    if (!response.ok) {
      throw new ApiError(response.status, response.statusText);
    }

    try {
      return await response.json();
    } catch (error) {
      return null as Res;
    }
  }

  get<Res>(endpoint: string, headers: HeadersInit = {}): Promise<Res> {
    return this.fetch<Res>(endpoint, {
      method: "GET",
      headers,
    });
  }

  post<Req, Res>(
    endpoint: string,
    body: Req,
    headers: HeadersInit = {}
  ): Promise<Res> {
    return this.fetch<Res>(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
    });
  }

  put<Req, Res>(
    endpoint: string,
    body: Req,
    headers: HeadersInit = {}
  ): Promise<Res> {
    return this.fetch<Res>(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
    });
  }

  delete<Res>(endpoint: string, headers: HeadersInit = {}): Promise<Res> {
    return this.fetch<Res>(endpoint, {
      method: "DELETE",
      headers,
    });
  }
}
