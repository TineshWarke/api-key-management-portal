import React, { useEffect, useState } from "react";
import api from "../api/axios";
import MetricCard from "../components/MetricCard";
import "../styles/dashboard.css";
import Layout from "../components/Layout";

interface Metrics {
  totalClients: number;
  activeKeys: number;
  inactiveKeys: number;
}

const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/api/dashboard/metrics");
      setMetrics(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to load metrics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return (
    <Layout>
      <div className="dashboard-root">
        <header className="dashboard-header">
          <h2 className="dashboard-title">Dashboard Overview</h2>
          <button onClick={fetchMetrics} className="refresh-btn">
            Refresh
          </button>
        </header>

        {loading && <div className="status">Loading metrics...</div>}
        {error && <div className="status error">{error}</div>}

        {metrics && (
          <div className="metrics-grid">
            <MetricCard
              title="Total Clients"
              value={metrics.totalClients}
              accent="#2563eb"
            />
            <MetricCard
              title="Active API Keys"
              value={metrics.activeKeys}
              accent="#16a34a"
            />
            <MetricCard
              title="Inactive API Keys"
              value={metrics.inactiveKeys}
              accent="#dc2626"
            />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
