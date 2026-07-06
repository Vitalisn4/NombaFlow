export interface NombaTokenData {
  access_token: string;
  refresh_token: string;
  expiresAt: string;
}

interface NombaResponse<T> {
  code: string;
  description: string;
  data: T;
}

export class NombaApiError extends Error {
  constructor(
    public readonly nombaCode: string,
    public readonly description: string,
  ) {
    super(`Nomba API error [${nombaCode}]: ${description}`);
    this.name = 'NombaApiError';
  }
}

export class NombaClient {
  constructor(private readonly baseUrl: string) {}

  async issueToken(
    clientId: string,
    clientSecret: string,
    accountId: string,
  ): Promise<NombaTokenData> {
    const response = await fetch(`${this.baseUrl}/auth/token/issue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        accountId,
      },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    const result = (await response.json()) as NombaResponse<NombaTokenData>;

    if (result.code !== '00') {
      throw new NombaApiError(result.code, result.description);
    }

    return result.data;
  }

  /**
   * Refreshes an access token using a refresh token.
   */
  async refreshToken(
    accessToken: string,
    refreshToken: string,
    accountId: string,
  ): Promise<NombaTokenData> {
    const response = await fetch(`${this.baseUrl}/auth/token/refresh`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        accountId,
      },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    });

    const result = (await response.json()) as NombaResponse<NombaTokenData>;

    if (result.code !== '00') {
      throw new NombaApiError(result.code, result.description);
    }

    return result.data;
  }
}