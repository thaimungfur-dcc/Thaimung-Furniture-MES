import { ApiRequest, ApiResponse } from '../types';

/**
 * API Service for communicating with Google Apps Script.
 * Uses text/plain to avoid CORS preflight issues.
 */
export const apiService = {
  async request<T = any>(url: string, payload: ApiRequest): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(url, {
        method: 'POST',
        redirect: 'follow',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result as ApiResponse<T>;
    } catch (error) {
      console.error('API Request Error:', error);
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  },

  /**
   * Special request for Master Registry to get Client API URL
   */
  async getClientConfig(licenseKey: string): Promise<ApiResponse<{ apiUrl: string; clientName: string }>> {
    const masterUrl = process.env.MASTER_REGISTRY_URL;
    if (!masterUrl) {
      return {
        status: 'error',
        message: 'Master Registry URL is not configured.',
      };
    }

    return this.request(masterUrl, {
      action: 'read',
      sheet: 'Registry',
      data: { licenseKey },
    });
  },
};
