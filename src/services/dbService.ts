export interface DBStatus {
  connected: boolean;
  spreadsheetId: string;
  configured: boolean;
}

export const dbService = {
  async getStatus(): Promise<DBStatus> {
    const response = await fetch('/api/db-status');
    return response.json();
  },

  async getMasterCodes(): Promise<any[]> {
    const response = await fetch('/api/master-codes');
    if (!response.ok) return [];
    return response.json();
  },

  async saveMasterCode(data: any): Promise<void> {
    const response = await fetch('/api/master-codes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to save master code');
  },

  async getItemMaster(): Promise<any[]> {
    const response = await fetch('/api/item-master');
    if (!response.ok) return [];
    return response.json();
  },

  async saveItem(data: any): Promise<void> {
    const response = await fetch('/api/item-master', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to save item');
  },

  async getPlanning(): Promise<any[]> {
    const response = await fetch('/api/planning');
    if (!response.ok) return [];
    return response.json();
  },

  async savePlanning(data: any): Promise<void> {
    const response = await fetch('/api/planning', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to save planning');
  },

  async getProduction(): Promise<any[]> {
    const response = await fetch('/api/production');
    if (!response.ok) return [];
    return response.json();
  },

  async saveProduction(data: any): Promise<void> {
    const response = await fetch('/api/production', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to save production');
  },

  async getUserPermissions(): Promise<any[]> {
    const response = await fetch('/api/user-permissions');
    if (!response.ok) return [];
    return response.json();
  },

  async saveUserPermission(data: any): Promise<void> {
    const response = await fetch('/api/user-permissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to save user permission');
  }
};
