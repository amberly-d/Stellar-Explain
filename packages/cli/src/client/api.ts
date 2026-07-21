export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  async get<T>(endpoint: string): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const body = (await response.json()) as ApiResponse<T>;
    return body.data;
  }

  async health(): Promise<{ status: string; horizon_reachable: boolean; version: string }> {
    return this.get('/health');
  }

  async explainTx(hash: string): Promise<unknown> {
    return this.get(`/tx/${hash}`);
  }

  async explainAccount(address: string): Promise<unknown> {
    return this.get(`/account/${address}`);
  }
}
