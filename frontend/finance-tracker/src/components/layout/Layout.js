import React, { useEffect, useState } from 'react';
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
  Moon,
  Search,
  Settings,
  Sun,
  Wallet,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AiChatbot from '../ai/AiChatbot';
import './Layout.css';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('financeTheme') || 'light');
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Weekly review ready',
      body: 'Open Analytics to review your spending trend.',
      unread: true
    },
    {
      id: 2,
      title: 'Set a monthly goal',
      body: 'Use Set Goals on the dashboard to track savings.',
      unread: true
    },
    {
      id: 3,
      title: 'Keep transactions fresh',
      body: 'Add recent expenses so your reports stay accurate.',
      unread: true
    }
  ]);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const unreadCount = notifications.filter(notification => notification.unread).length;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('financeTheme', theme);
  }, [theme]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const markNotificationsRead = () => {
    setNotifications(prev => prev.map(notification => ({
      ...notification,
      unread: false
    })));
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
              <span className="search-icon" aria-hidden="true"><Search size={16} /></span>
              <input
                type="text"
                placeholder="Search transactions..."
                className="search-input"
              />
            </div>

            <div className="header-buttons">
              <button
                className="theme-toggle-btn"
                type="button"
                onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              <div className="notification-menu">
                <button
                  className="notification-btn"
                  aria-label="Notifications"
                  aria-expanded={notificationsOpen}
                  onClick={() => setNotificationsOpen(prev => !prev)}
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount}</span>
                  )}
                </button>

                {notificationsOpen && (
                  <div className="notification-panel">
                    <div className="notification-panel-header">
                      <h3>Notifications</h3>
                      <button type="button" onClick={markNotificationsRead}>
                        Mark read
                      </button>
                    </div>
                    <div className="notification-list">
                      {notifications.map(notification => (
                        <button
                          type="button"
                          key={notification.id}
                          className={`notification-item ${notification.unread ? 'unread' : ''}`}
                          onClick={() => {
                            setNotifications(prev => prev.map(item =>
                              item.id === notification.id ? { ...item, unread: false } : item
                            ));
                            if (notification.id === 1) navigate('/analytics');
                            if (notification.id === 2) navigate('/dashboard');
                            setNotificationsOpen(false);
                          }}
                        >
                          <span className="notification-dot" />
                          <span>
                            <strong>{notification.title}</strong>
                            <small>{notification.body}</small>
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

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

      <AiChatbot />
    </div>
  );
};

export default Layout;
