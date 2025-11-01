import React from "react";

interface Client {
  id: number;
  name: string;
  email: string;
  organization?: string;
  api_status?: string;
  expiry_date?: string;
}

interface Props {
  client: Client;
  onToggle: () => void;
  onRegenerate: () => void;
  onEdit: () => void;  // <-- new
}

const ClientRow: React.FC<Props> = ({ client, onToggle, onRegenerate, onEdit }) => {
  const expired =
    client.expiry_date && new Date(client.expiry_date) < new Date()
      ? "expired"
      : "";
  const statusClass =
    client.api_status === "active"
      ? "status-active"
      : client.api_status === "inactive"
      ? "status-inactive"
      : expired
      ? "status-expired"
      : "";

  return (
    <tr>
      <td>{client.id}</td>
      <td>{client.name}</td>
      <td>{client.email}</td>
      <td>{client.organization || "-"}</td>
      <td>
        <span className={`badge ${statusClass}`}>
          {expired ? "Expired" : client.api_status || "—"}
        </span>
      </td>
      <td>{client.expiry_date ? new Date(client.expiry_date).toLocaleDateString() : "—"}</td>
      <td>
        <button className="btn-small btn-ghost" onClick={onEdit}>Edit</button>
        <button className="btn-small btn-ghost" onClick={onToggle}>Toggle</button>
        <button className="btn-small btn-primary" onClick={onRegenerate}>Regenerate</button>
      </td>
    </tr>
  );
};

export default ClientRow;
