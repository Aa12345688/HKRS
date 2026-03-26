// src/lib/api.ts
// Standardized fetch utility for Supabase PostgREST (Zero-Dependency)

export interface SyncConfig {
  url: string;
  key: string;
}

export const createApiClient = (config: SyncConfig) => {
  const { url, key } = config;

  const request = async (path: string, options: RequestInit = {}) => {
    const baseUrl = url.endsWith('/') ? url.slice(0, -1) : url;
    const fullUrl = `${baseUrl}/rest/v1/${path}`;

    const headers = {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
      ...options.headers,
    };

    const response = await fetch(fullUrl, { ...options, headers });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || 'API Request Failed');
    }

    return response.json();
  };

  return {
    get: (table: string, select = '*') => request(`${table}?select=${select}`),
    
    upsert: (table: string, data: any, onConflict: string) => 
      request(table, {
        method: 'POST',
        headers: {
          'Prefer': `resolution=merge-duplicates,return=representation`
        },
        body: JSON.stringify(data)
      }),

    insert: (table: string, data: any) =>
      request(table, {
        method: 'POST',
        body: JSON.stringify(data)
      }),

    rpc: (name: string, params: any) =>
      request(`rpc/${name}`, {
        method: 'POST',
        body: JSON.stringify(params)
      })
  };
};
