import React, { useEffect, useState } from "react";
import { Link, useLocation, Routes, Route, useNavigate } from "react-router-dom";
import { FiMenu, FiX, FiLogOut, FiBell, FiUser, FiHome, FiFileText, FiClock, FiAward, FiUsers, FiTrendingUp } from "react-icons/fi";

// Pages
import DepartmentsPage from "../institute/DepartmentsPage";
import TendersPage from "../institute/TendersPage";
import HistoryPage from "../institute/HistoryPage";
import NotificationsPage from "../institute/NotificationPage";
import AccountPage from "../institute/AccountPage";

export default function InstituteDashboard() {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    activeTenders: 0,
    totalDepartments: 0,
    bidsReceived: 0,
    completedTenders: 0
  });
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    fetch("https://792hpzm4-8000.inc1.devtunnels.ms/api/v1/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setUser(data))
      .catch(() => setUser({ username: "Unknown" }));

    // Fetch notifications and stats
    fetchNotifications();
    fetchDashboardStats();
  }, [navigate]);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("https://792hpzm4-8000.inc1.devtunnels.ms/api/v1/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.slice(0, 5)); // Show only latest 5
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("https://792hpzm4-8000.inc1.devtunnels.ms/api/v1/institute/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setDashboardStats({
          activeTenders: data.active_tenders || 0,
          totalDepartments: data.total_departments || 0,
          bidsReceived: data.bids_received || 0,
          completedTenders: data.completed_tenders || 0
        });
      }
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const sidebarLinks = [
    { 
      name: "Dashboard", 
      href: "/institute/dashboard", 
      icon: <FiHome size={20} />, 
      description: "Overview & Analytics" 
    },
    { 
      name: "Blocks", 
      href: "/institute/dashboard/departments", 
      icon: <FiUsers size={20} />, 
      description: "Manage Blocks" 
    },
    { 
      name: "Tenders", 
      href: "/institute/dashboard/tenders", 
      icon: <FiFileText size={20} />, 
      description: "Create & Manage" 
    },
    { 
      name: "History", 
      href: "/institute/dashboard/history", 
      icon: <FiClock size={20} />, 
      description: "Past Activities" 
    },
    { 
      name: "Notifications", 
      href: "/institute/dashboard/notifications", 
      icon: <FiBell size={20} />, 
      description: "Alerts & Updates" 
    },
    { 
      name: "Account", 
      href: "/institute/dashboard/account", 
      icon: <FiUser size={20} />, 
      description: "Profile & Settings" 
    },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="institute-dashboard">
      {/* Background Elements */}
      <div className="dashboard-background">
        <div className="bg-shape shape-1"></div>
        <div className="bg-shape shape-2"></div>
        <div className="bg-shape shape-3"></div>
      </div>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="brand-section">
            <div className="user-badge">
              <div className="user-avatar">
                <FiHome size={20} />
              </div>
              <div className="user-info">
                <div className="username">{user?.username || "Institute"}</div>
                <div className="user-role">Institute Dashboard</div>
              </div>
            </div>
          </div>
          <button className="close-btn" onClick={() => setSidebarOpen(false)}>
            <FiX size={24} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul>
            {sidebarLinks.map((link) => (
              <li key={link.name}>
                <Link
                  to={link.href}
                  className={`nav-link ${location.pathname === link.href ? "active" : ""}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="nav-icon">{link.icon}</span>
                  <div className="nav-content">
                    <div className="nav-title">{link.name}</div>
                    <div className="nav-description">{link.description}</div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <FiLogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile toggle button */}
      <button className="mobile-toggle" onClick={() => setSidebarOpen(true)}>
        <FiMenu size={20} />
      </button>

      {/* Main content */}
      <div className="main-content">
        <header className="dashboard-header">
          <div className="header-content">
            <div className="welcome-section">
              <h1>{getGreeting()}, {user?.username || "Institute"}! 👋</h1>
              <p>Manage your institute's tenders, blocks, and vendor activities</p>
            </div>
            
            <div className="header-actions">
              <Link to="/institute/dashboard/notifications" className="notification-bell">
                <FiBell size={20} />
                {notifications.length > 0 && (
                  <span className="notification-badge">{notifications.length}</span>
                )}
              </Link>
              
              <div className="quick-stats">
                <Link to="/institute/dashboard/tenders" className="stat-item">
                  <div className="stat-value">{dashboardStats.activeTenders}</div>
                  <div className="stat-label">Active Tenders</div>
                </Link>
                <Link to="/institute/dashboard/departments" className="stat-item">
                  <div className="stat-value">{dashboardStats.totalDepartments}</div>
                  <div className="stat-label">Blocks</div>
                </Link>
                <Link to="/institute/dashboard/tenders" className="stat-item">
                  <div className="stat-value">{dashboardStats.bidsReceived}</div>
                  <div className="stat-label">Bids Received</div>
                </Link>
                <Link to="/institute/dashboard/history" className="stat-item">
                  <div className="stat-value">{dashboardStats.completedTenders}</div>
                  <div className="stat-label">Completed</div>
                </Link>
              </div>
            </div>
          </div>
        </header>

        <div className="content-area">
          <Routes>
            {/* Dashboard Home */}
            <Route
              index
              element={
                <div className="dashboard-overview">
                  <div className="welcome-card">
                    <h2>Institute Management Portal</h2>
                    <p>Welcome to your institute dashboard. Manage Blocks, create tenders, and track vendor submissions all in one place.</p>
                    
                    {user && (
                      <div className="user-info-grid">
                        <div className="info-item">
                          <label>Institute Name</label>
                          <p>{user.username}</p>
                        </div>
                        <div className="info-item">
                          <label>Email</label>
                          <p>{user.email}</p>
                        </div>
                        <div className="info-item">
                          <label>Account Type</label>
                          <p>Institute Account</p>
                        </div>
                        <div className="info-item">
                          <label>Roles</label>
                          <div className="roles-list">
                            {user.roles && user.roles.map((role, index) => (
                              <span key={index} className="role-badge">
                                {typeof role === 'object' ? role.role_name : role}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="quick-actions-grid">
                    <h3>Quick Actions</h3>
                    <div className="actions-grid">
                      <Link to="/institute/dashboard/tenders" className="action-card">
                        <div className="action-icon create">
                          <FiFileText size={24} />
                        </div>
                        <div className="action-content">
                          <h4>Create Tender</h4>
                          <p>Publish new tender opportunities</p>
                        </div>
                      </Link>
                      
                      <Link to="/institute/dashboard/departments" className="action-card">
                        <div className="action-icon manage">
                          <FiUsers size={24} />
                        </div>
                        <div className="action-content">
                          <h4>Manage Blocks</h4>
                          <p>Add or edit blocks</p>
                        </div>
                      </Link>
                      
                      <Link to="/institute/dashboard/tenders" className="action-card">
                        <div className="action-icon view">
                          <FiTrendingUp size={24} />
                        </div>
                        <div className="action-content">
                          <h4>View Submissions</h4>
                          <p>Check vendor bids</p>
                        </div>
                      </Link>
                      
                      <Link to="/institute/dashboard/history" className="action-card">
                        <div className="action-icon history">
                          <FiClock size={24} />
                        </div>
                        <div className="action-content">
                          <h4>Tender History</h4>
                          <p>Past activities & results</p>
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              }
            />
            <Route path="departments" element={<DepartmentsPage />} />
            <Route path="tenders" element={<TendersPage />} />
            <Route path="history" element={<HistoryPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="account" element={<AccountPage />} />
          </Routes>
        </div>
      </div>

      <style>{`
        .institute-dashboard {
          display: flex;
          min-height: 100vh;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          position: relative;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
        }

        .dashboard-background {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          z-index: 0;
        }

        .bg-shape {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 70%);
          animation: float 20s ease-in-out infinite;
        }

        .shape-1 { width: 300px; height: 300px; top: 10%; left: 5%; animation-delay: 0s; }
        .shape-2 { width: 200px; height: 200px; bottom: 20%; right: 10%; animation-delay: 7s; }
        .shape-3 { width: 150px; height: 150px; top: 60%; left: 80%; animation-delay: 14s; }

        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.3; }
          33% { transform: translate(30px, -30px) scale(1.1); opacity: 0.5; }
          66% { transform: translate(-20px, 20px) scale(0.9); opacity: 0.4; }
        }

        /* Sidebar */
        .sidebar {
          width: 280px;
          background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
          color: white;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          position: relative;
          z-index: 10;
          box-shadow: 4px 0 20px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .sidebar-header {
          padding: 2rem 1.5rem 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .brand-section {
          margin-bottom: 1.5rem;
        }

        .user-badge {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          backdrop-filter: blur(10px);
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .user-info .username {
          font-weight: 600;
          font-size: 0.95rem;
        }

        .user-info .user-role {
          font-size: 0.8rem;
          color: #cbd5e1;
        }

        .close-btn {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: white;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .close-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .sidebar-nav {
          flex: 1;
          padding: 1rem 0;
        }

        .sidebar-nav ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .sidebar-nav li {
          margin-bottom: 0.5rem;
        }

        .nav-link {
          display: flex;
          align-items: center;
          padding: 1rem 1.5rem;
          text-decoration: none;
          color: #cbd5e1;
          transition: all 0.3s ease;
          position: relative;
          border-left: 3px solid transparent;
        }

        .nav-link:hover {
          background: rgba(255, 255, 255, 0.05);
          color: white;
          border-left-color: #3b82f6;
        }

        .nav-link.active {
          background: rgba(59, 130, 246, 0.1);
          color: white;
          border-left-color: #3b82f6;
        }

        .nav-link.active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background: #3b82f6;
        }

        .nav-icon {
          margin-right: 1rem;
          width: 24px;
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .nav-content {
          flex: 1;
        }

        .nav-title {
          font-weight: 600;
          font-size: 0.95rem;
          margin-bottom: 2px;
        }

        .nav-description {
          font-size: 0.75rem;
          color: #94a3b8;
          opacity: 0.8;
        }

        .sidebar-footer {
          padding: 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .logout-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
          background: rgba(239, 68, 68, 0.1);
          color: #fecaca;
          border: 1px solid rgba(239, 68, 68, 0.2);
          padding: 0.75rem 1rem;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .logout-btn:hover {
          background: rgba(239, 68, 68, 0.2);
          color: #fca5a5;
          transform: translateY(-1px);
        }

        /* Mobile toggle */
        .mobile-toggle {
          display: none;
          position: fixed;
          top: 1rem;
          left: 1rem;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          border: none;
          padding: 0.75rem;
          border-radius: 10px;
          cursor: pointer;
          z-index: 100;
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
          transition: all 0.3s ease;
        }

        .mobile-toggle:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
        }

        /* Main content */
        .main-content {
          flex: 1;
          position: relative;
          z-index: 1;
          padding: 0;
          display: flex;
          flex-direction: column;
        }

        .dashboard-header {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(226, 232, 240, 0.8);
          padding: 2rem 2.5rem;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1.5rem;
        }

        .welcome-section h1 {
          font-size: 2.2rem;
          font-weight: 800;
          color: #1e293b;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, #1e293b, #334155);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .welcome-section p {
          color: #64748b;
          font-size: 1.1rem;
          margin: 0;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .notification-bell {
          position: relative;
          background: white;
          border: 1px solid #e2e8f0;
          padding: 0.75rem;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #64748b;
          text-decoration: none;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .notification-bell:hover {
          color: #1e293b;
          border-color: #cbd5e0;
          transform: translateY(-2px);
        }

        .notification-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background: #ef4444;
          color: white;
          font-size: 0.7rem;
          padding: 2px 6px;
          border-radius: 10px;
          font-weight: 600;
        }

        .quick-stats {
          display: flex;
          gap: 1.5rem;
        }

        .stat-item {
          text-align: center;
          padding: 0.75rem 1rem;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          min-width: 80px;
          text-decoration: none;
          color: inherit;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .stat-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          border-color: #cbd5e0;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 800;
          color: #3b82f6;
          margin-bottom: 0.25rem;
        }

        .stat-label {
          font-size: 0.8rem;
          color: #64748b;
          font-weight: 500;
        }

        .content-area {
          flex: 1;
          padding: 2rem 2.5rem;
          overflow-y: auto;
        }

        /* Dashboard Overview Styles */
        .dashboard-overview {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .welcome-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .welcome-card h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 1rem;
        }

        .welcome-card p {
          color: #64748b;
          margin-bottom: 2rem;
          line-height: 1.6;
        }

        .user-info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          padding: 1.5rem;
          background: #f8fafc;
          border-radius: 12px;
        }

        .info-item label {
          display: block;
          font-size: 0.8rem;
          color: #64748b;
          font-weight: 600;
          text-transform: uppercase;
          margin-bottom: 0.5rem;
        }

        .info-item p {
          font-size: 1rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0;
        }

        .roles-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .role-badge {
          background: #dbeafe;
          color: #1e40af;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .quick-actions-grid {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .quick-actions-grid h3 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 1.5rem;
        }

        .actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .action-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          text-decoration: none;
          color: inherit;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .action-card:hover {
          background: white;
          border-color: #3b82f6;
          transform: translateY(-2px);
          box-shadow: 0 8px 15px rgba(59, 130, 246, 0.1);
        }

        .action-icon {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }

        .action-icon.create { background: linear-gradient(135deg, #10b981, #059669); }
        .action-icon.manage { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }
        .action-icon.view { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }
        .action-icon.history { background: linear-gradient(135deg, #f59e0b, #d97706); }

        .action-content h4 {
          font-size: 1rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 0.25rem 0;
        }

        .action-content p {
          font-size: 0.85rem;
          color: #64748b;
          margin: 0;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .sidebar {
            width: 260px;
          }
          
          .header-content {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .header-actions {
            width: 100%;
            justify-content: space-between;
          }
        }

        @media (max-width: 768px) {
          .sidebar {
            position: fixed;
            top: 0;
            left: 0;
            height: 100%;
            transform: translateX(-100%);
            z-index: 100;
          }
          
          .sidebar.open {
            transform: translateX(0);
          }
          
          .mobile-toggle {
            display: block;
          }
          
          .dashboard-header {
            padding: 1.5rem;
          }
          
          .content-area {
            padding: 1.5rem;
          }
          
          .welcome-section h1 {
            font-size: 1.8rem;
          }
          
          .quick-stats {
            gap: 1rem;
          }
          
          .stat-item {
            min-width: 70px;
            padding: 0.5rem 0.75rem;
          }

          .actions-grid {
            grid-template-columns: 1fr;
          }

          .user-info-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .dashboard-header {
            padding: 1rem;
          }
          
          .content-area {
            padding: 1rem;
          }
          
          .welcome-section h1 {
            font-size: 1.5rem;
          }
          
          .header-actions {
            flex-direction: column;
            gap: 1rem;
          }
          
          .quick-stats {
            width: 100%;
            justify-content: space-between;
          }
        }
      `}</style>
    </div>
  );
}