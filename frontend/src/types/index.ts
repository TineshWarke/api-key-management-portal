export interface Admin {
  id: number;
  email: string;
  name: string;
}

export interface Client {
  id: number;
  name: string;
  email: string;
  organization: string;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
  api_key_count?: number;
  active_keys?: number;
}

export interface ApiKey {
  id: number;
  key_prefix: string;
  status: "active" | "inactive" | "expired";
  start_date: string;
  expiry_date: string;
  created_at: string;
}

export interface DashboardMetrics {
  totalClients: number;
  activeKeys: number;
  inactiveKeys: number;
}

export interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
