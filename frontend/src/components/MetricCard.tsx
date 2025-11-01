import React from "react";

interface Props {
  title: string;
  value: number;
  accent?: string;
}

const MetricCard: React.FC<Props> = ({ title, value, accent = "#2563eb" }) => {
  return (
    <div className="metric-card" style={{ borderTopColor: accent }}>
      <h3 className="metric-title">{title}</h3>
      <p className="metric-value">{value}</p>
    </div>
  );
};

export default MetricCard;
