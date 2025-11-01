import React, { useEffect, useState } from "react";
import api from "../api/axios";
import ClientRow from "../components/ClientRow";
import "../styles/clients.css";
import Layout from "../components/Layout";

interface Client {
  id: number;
  name: string;
  email: string;
  organization?: string;
  api_status?: string;
  start_date?: string;
  expiry_date?: string;
}

const Clients: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    organization: "",
    validityDays: 30,
  });
  const [newKey, setNewKey] = useState<string | null>(null);

  const loadClients = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(
        `/api/clients?search=${search}&page=${page}&limit=${limit}`
      );
      setClients(res.data.clients);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to fetch clients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, [page, search]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post("/api/clients", form);
      setShowModal(false);
      setForm({ name: "", email: "", organization: "", validityDays: 30 });
      setNewKey(res.data.apiKey);
      await loadClients();
    } catch (err: any) {
      alert(err?.response?.data?.error || "Failed to create client");
    }
  };

  const toggleStatus = async (id: number) => {
    await api.patch(`/api/clients/${id}/toggle`);
    loadClients();
  };

  const regenerateKey = async (id: number) => {
    const res = await api.post(`/api/clients/${id}/regenerate`);
    setNewKey(res.data.apiKey);
    loadClients();
  };

  const [editing, setEditing] = useState<Client | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    organization: "",
  });

  const openEditModal = (client: Client) => {
    setEditing(client);
    setEditForm({
      name: client.name,
      email: client.email,
      organization: client.organization || "",
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    try {
      await api.put(`/api/clients/${editing.id}`, editForm);
      setEditing(null);
      await loadClients();
    } catch (err: any) {
      alert(err?.response?.data?.error || "Failed to update client");
    }
  };

  return (
    <Layout>
      <div className="clients-root">
        <header className="clients-header">
          <h2>Clients</h2>
          <div className="clients-actions">
            <input
              type="text"
              placeholder="Search clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              className="btn btn-primary"
              onClick={() => setShowModal(true)}
            >
              + Add Client
            </button>
          </div>
        </header>

        {loading && <div className="status">Loading clients...</div>}
        {error && <div className="status error">{error}</div>}

        <div className="table-wrapper">
          <table className="clients-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Organization</th>
                <th>Status</th>
                <th>Expiry</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <ClientRow
                  key={c.id}
                  client={c}
                  onToggle={() => toggleStatus(c.id)}
                  onRegenerate={() => regenerateKey(c.id)}
                  onEdit={() => openEditModal(c)}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="pagination">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Prev
          </button>
          <span>Page {page}</span>
          <button onClick={() => setPage((p) => p + 1)}>Next</button>
        </div>

        {/* Add Client Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <h3>Create Client</h3>
              <form onSubmit={handleCreate}>
                <label>
                  Name
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Email
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    required
                  />
                </label>
                <label>
                  Organization
                  <input
                    type="text"
                    value={form.organization}
                    onChange={(e) =>
                      setForm({ ...form, organization: e.target.value })
                    }
                  />
                </label>
                <label>
                  Validity (days)
                  <input
                    type="number"
                    value={form.validityDays}
                    onChange={(e) =>
                      setForm({ ...form, validityDays: Number(e.target.value) })
                    }
                  />
                </label>
                <div className="modal-actions">
                  <button type="submit" className="btn btn-primary">
                    Create
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {editing && (
          <div className="modal-overlay" onClick={() => setEditing(null)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <h3>Edit Client</h3>
              <form onSubmit={handleUpdate}>
                <label>
                  Name
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    required
                  />
                </label>
                <label>
                  Email
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) =>
                      setEditForm({ ...editForm, email: e.target.value })
                    }
                    required
                  />
                </label>
                <label>
                  Organization
                  <input
                    type="text"
                    value={editForm.organization}
                    onChange={(e) =>
                      setEditForm({ ...editForm, organization: e.target.value })
                    }
                  />
                </label>
                <div className="modal-actions">
                  <button type="submit" className="btn btn-primary">
                    Update
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setEditing(null)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Show New Key */}
        {newKey && (
          <div className="api-key-banner">
            <p>
              <strong>New API Key:</strong> {newKey}
            </p>
            <button onClick={() => setNewKey(null)}>Close</button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Clients;
