import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/layout.css";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="layout-root">
      <aside className="sidebar">
        <h2 className="sidebar-title">API Portal</h2>
        <nav className="sidebar-nav">
          <NavLink to="/dashboard" className="nav-link">
            Dashboard
          </NavLink>
          <NavLink to="/clients" className="nav-link">
            Clients
          </NavLink>
        </nav>
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      <main className="layout-content">
        <header className="layout-header">
          <button className="logout-header-btn" onClick={handleLogout}>
            Logout
          </button>
        </header>
        <section className="layout-body">{children}</section>
      </main>
    </div>
  );
};

export default Layout;
