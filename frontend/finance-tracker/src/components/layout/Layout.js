import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Bell,
  ChartNoAxesCombined,
  ChevronDown,
  CreditCard,
  FolderTree,
  LogOut,
  Menu,
  Search,
  Settings,
  Wallet,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Layout.css';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    {
      path: '/dashboard',
      icon: BarChart3,
      label: 'Dashboard',
      description: 'Overview & Analytics'
    },
    {
      path: '/transactions',
      icon: CreditCard,
      label: 'Transactions',
      description: 'Manage your money'
    },
    {
      path: '/analytics',
      icon: ChartNoAxesCombined,
      label: 'Analytics',
      description: 'Insights & Reports'
    },
    {
      path: '/categories',
      icon: FolderTree,
      label: 'Categories',
      description: 'Organize expenses'
    },
    {
      path: '/profile',
      icon: Settings,
      label: 'Profile',
      description: 'Account settings'
    }
  ];

  return (
    <div className="layout">
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon"><Wallet size={22} /></span>
            <span className="logo-text">FinanceTracker</span>
          </div>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle navigation"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul className="nav-list">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path} className="nav-item">
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `nav-link ${isActive ? 'nav-link-active' : ''}`
                    }
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="nav-icon"><Icon size={20} /></span>
                    <div className="nav-content">
                      <span className="nav-label">{item.label}</span>
                      <span className="nav-description">{item.description}</span>
                    </div>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="user-details">
              <span className="user-name">{user?.username || 'User'}</span>
              <span className="user-role">Personal Account</span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="top-header">
          <button
            className="mobile-menu-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Open navigation"
          >
            <Menu size={22} />
          </button>

          <div className="header-actions">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search transactions..."
                className="search-input"
              />
              <span className="search-icon"><Search size={16} /></span>
            </div>

            <div className="header-buttons">
              <button className="notification-btn" aria-label="Notifications">
                <Bell size={18} />
                <span className="notification-badge">3</span>
              </button>

              <div className="user-menu">
                <button className="user-menu-btn">
                  <div className="user-avatar-small">
                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="user-name-header">{user?.username || 'User'}</span>
                  <span className="dropdown-arrow"><ChevronDown size={14} /></span>
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="page-content">
          <Outlet />
        </div>
      </main>

      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
