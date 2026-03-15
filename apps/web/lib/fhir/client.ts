import type { FhirBundle, FhirResource } from './types';

export class FhirClient {
  private baseUrl: string;
  private accessToken: string;

  constructor(baseUrl: string, accessToken: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.accessToken = accessToken;
  }

  async getResource<T extends FhirResource>(path: string): Promise<T> {
    const res = await fetch(`${this.baseUrl}/${path}`, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        Accept: 'application/fhir+json',
      },
    });

    if (!res.ok) {
      throw new FhirError(
        `FHIR request failed: ${res.status} ${res.statusText}`,
        res.status,
        path,
      );
    }

    return res.json() as Promise<T>;
  }

  async searchResources<T extends FhirResource>(
    resourceType: string,
    params: Record<string, string>,
  ): Promise<T[]> {
    const query = new URLSearchParams(params).toString();
    const path = `${resourceType}?${query}`;
    const bundle = await this.getResource<FhirBundle<T>>(path);
    const results = bundle.entry?.map(e => e.resource) ?? [];

    // Follow pagination links if present
    let nextUrl = bundle.link?.find(l => l.relation === 'next')?.url;
    while (nextUrl) {
      const nextRes = await fetch(nextUrl, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          Accept: 'application/fhir+json',
        },
      });
      if (!nextRes.ok) break;
      const nextBundle = (await nextRes.json()) as FhirBundle<T>;
      results.push(...(nextBundle.entry?.map(e => e.resource) ?? []));
      nextUrl = nextBundle.link?.find(l => l.relation === 'next')?.url;
    }

    return results;
  }
}

export class FhirError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public path: string,
  ) {
    super(message);
    this.name = 'FhirError';
  }
}
