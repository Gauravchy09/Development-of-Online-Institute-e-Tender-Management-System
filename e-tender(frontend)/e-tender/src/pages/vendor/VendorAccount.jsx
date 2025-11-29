import React, { useState, useEffect } from "react";

export default function VendorAccount({ user: initialUser }) {
  const [user, setUser] = useState(initialUser);
  const [stats, setStats] = useState({
    activeBids: 0,
    submittedBids: 0,
    wonTenders: 0
  });
  const [loading, setLoading] = useState(!initialUser);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchAccountData = async () => {
      // If user is already provided, just fetch stats
      if (initialUser) {
        setUser(initialUser);
        setLoading(false);
      } else {
        setLoading(true);
      }
      
      setError(null);
      
      try {
        // If no initial user, fetch user profile
        if (!initialUser) {
          const userRes = await fetch("http://127.0.0.1:8000/api/v1/users/me", {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (!userRes.ok) {
            throw new Error("Failed to fetch user data");
          }

          const userData = await userRes.json();
          setUser(userData);
        }

        // Fetch bids to calculate stats
        const bidsRes = await fetch("http://127.0.0.1:8000/api/v1/bids/", {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (bidsRes.ok) {
          const bidsData = await bidsRes.json();
          
          const submittedBids = bidsData.length;
          const wonBids = bidsData.filter(bid => bid.status === 'awarded').length;
          const activeBids = bidsData.filter(bid => 
            bid.status === 'submitted' || bid.status === 'under_review'
          ).length;

          setStats({
            activeBids,
            submittedBids,
            wonTenders: wonBids
          });
        }

      } catch (err) {
        console.error("Error fetching account data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAccountData();
  }, [token, initialUser]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="account-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your account information...</p>
        </div>
        <style>{styles}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="account-container">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h2>Error Loading Account</h2>
          <p>{error}</p>
          <button className="retry-btn" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
        <style>{styles}</style>
      </div>
    );
  }

  return (
    <div className="account-container">
      {/* Welcome Section */}
      <div className="welcome-banner">
        <div className="welcome-content">
          <h1>Account Settings ⚙️</h1>
          <p>Manage your profile and account preferences</p>
        </div>
        <div className="welcome-graphic">
          <div className="graphic-item">👤</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="content-grid">
        {/* Profile Information */}
        <div className="section-card profile-section">
          <div className="section-header">
            <h3>Profile Information</h3>
            <p>Your personal and account details</p>
          </div>
          
          <div className="profile-details">
            <div className="profile-item">
              <div className="profile-icon user">
                👤
              </div>
              <div className="profile-content">
                <label>Username</label>
                <p>{user?.username || "N/A"}</p>
              </div>
            </div>
            
            <div className="profile-item">
              <div className="profile-icon email">
                📧
              </div>
              <div className="profile-content">
                <label>Email Address</label>
                <p>{user?.email || "N/A"}</p>
              </div>
            </div>

            {user?.phone && (
              <div className="profile-item">
                <div className="profile-icon phone">
                  📱
                </div>
                <div className="profile-content">
                  <label>Phone Number</label>
                  <p>{user.phone}</p>
                </div>
              </div>
            )}
            
            <div className="profile-item">
              <div className="profile-icon shield">
                🛡️
              </div>
              <div className="profile-content">
                <label>Account Type</label>
                <p>Vendor Account</p>
              </div>
            </div>

            <div className="profile-item">
              <div className="profile-icon calendar">
                📅
              </div>
              <div className="profile-content">
                <label>Member Since</label>
                <p>{formatDate(user?.created_at)}</p>
              </div>
            </div>
            
            {user?.roles && user.roles.length > 0 && (
              <div className="profile-item">
                <div className="profile-icon badge">
                  🏅
                </div>
                <div className="profile-content">
                  <label>Roles & Permissions</label>
                  <div className="roles-list">
                    {user.roles.map((role, index) => (
                      <span key={index} className="role-badge">
                        {role.role_name || role}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {user?.user_id && (
              <div className="profile-item">
                <div className="profile-icon id">
                  🆔
                </div>
                <div className="profile-content">
                  <label>User ID</label>
                  <p className="user-id">{user.user_id}</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="profile-actions">
            <button className="action-btn primary">
              ✏️ Edit Profile
            </button>
            <button className="action-btn secondary">
              🔒 Change Password
            </button>
          </div>
        </div>

        {/* Quick Settings Sidebar */}
        <div className="section-card quick-settings-sidebar">
          <div className="section-header">
            <h3>Quick Settings</h3>
            <p>Manage your preferences</p>
          </div>
          
          <div className="settings-list">
            <div className="setting-card">
              <div className="setting-icon blue">
                🔔
              </div>
              <div className="setting-content">
                <h4>Notifications</h4>
                <p>Manage email and push notifications</p>
                <span className="setting-status blue">
                  Enabled
                </span>
              </div>
            </div>

            <div className="setting-card">
              <div className="setting-icon green">
                💳
              </div>
              <div className="setting-content">
                <h4>Billing</h4>
                <p>View payment methods and invoices</p>
                <span className="setting-status green">
                  Active
                </span>
              </div>
            </div>

            <div className="setting-card">
              <div className="setting-icon purple">
                ⚙️
              </div>
              <div className="setting-content">
                <h4>Preferences</h4>
                <p>Customize your dashboard</p>
                <span className="setting-status purple">
                  Custom
                </span>
              </div>
            </div>

            <div className="setting-card">
              <div className="setting-icon orange">
                🔐
              </div>
              <div className="setting-content">
                <h4>Security</h4>
                <p>Two-factor authentication and security</p>
                <span className="setting-status orange">
                  Recommended
                </span>
              </div>
            </div>
          </div>

          {/* Account Stats */}
          <div className="account-stats">
            <h4>📊 Account Overview</h4>
            <div className="stats-grid">
              <div className="stat">
                <span className="stat-value">{stats.activeBids}</span>
                <span className="stat-label">Active Bids</span>
              </div>
              <div className="stat">
                <span className="stat-value">{stats.submittedBids}</span>
                <span className="stat-label">Total Bids</span>
              </div>
              <div className="stat">
                <span className="stat-value">{stats.wonTenders}</span>
                <span className="stat-label">Won Tenders</span>
              </div>
            </div>
          </div>

          {/* Account Status */}
          <div className="account-status">
            <h4>✅ Account Status</h4>
            <div className="status-items">
              <div className="status-item">
                <div className="status-indicator active"></div>
                <div className="status-text">
                  <span className="status-label">Account Status</span>
                  <span className="status-value">Active</span>
                </div>
              </div>
              <div className="status-item">
                <div className="status-indicator verified"></div>
                <div className="status-text">
                  <span className="status-label">Email Verification</span>
                  <span className="status-value">Verified</span>
                </div>
              </div>
              <div className="status-item">
                <div className="status-indicator success"></div>
                <div className="status-text">
                  <span className="status-label">Success Rate</span>
                  <span className="status-value">
                    {stats.submittedBids > 0 
                      ? `${Math.round((stats.wonTenders / stats.submittedBids) * 100)}%`
                      : '0%'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{styles}</style>
    </div>
  );
}

const styles = `
  .account-container {
    padding: 1.5rem;
    background: #f9fafc;
    min-height: 80vh;
    max-width: 1400px;
    margin: 0 auto;
  }

  /* Loading State */
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    gap: 1rem;
  }

  .loading-spinner {
    width: 50px;
    height: 50px;
    border: 4px solid #e2e8f0;
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .loading-container p {
    color: #64748b;
    font-size: 1rem;
  }

  /* Error State */
  .error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    gap: 1rem;
    text-align: center;
  }

  .error-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  .error-container h2 {
    color: #1e293b;
    margin: 0;
  }

  .error-container p {
    color: #64748b;
    margin: 0;
  }

  .retry-btn {
    background: #3b82f6;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-top: 1rem;
  }

  .retry-btn:hover {
    background: #2563eb;
    transform: translateY(-1px);
  }

  /* Welcome Banner */
  .welcome-banner {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 20px;
    padding: 2.5rem;
    margin-bottom: 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: white;
    position: relative;
    overflow: hidden;
  }

  .welcome-content h1 {
    font-size: 2.2rem;
    font-weight: 800;
    margin-bottom: 0.5rem;
    background: linear-gradient(to right, #ffffff, #e0e7ff);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  .welcome-content p {
    font-size: 1.1rem;
    color: #e2e8f0;
    margin: 0;
  }

  .welcome-graphic {
    flex-shrink: 0;
  }

  .graphic-item {
    font-size: 4rem;
    animation: bounce 2s infinite;
  }

  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }

  /* Content Grid */
  .content-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 1.5rem;
  }

  @media (max-width: 1024px) {
    .content-grid {
      grid-template-columns: 1fr;
    }
  }

  .section-card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    padding: 1.5rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .section-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  }

  .section-header {
    margin-bottom: 1.5rem;
  }

  .section-header h3 {
    font-size: 1.25rem;
    font-weight: 700;
    color: #1e293b;
    margin: 0 0 0.25rem 0;
  }

  .section-header p {
    color: #64748b;
    margin: 0;
    font-size: 0.9rem;
  }

  /* Profile Details */
  .profile-details {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .profile-item {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem;
    background: #f8fafc;
    border-radius: 12px;
    transition: all 0.3s ease;
  }

  .profile-item:hover {
    background: #f1f5f9;
    transform: translateY(-1px);
  }

  .profile-icon {
    width: 48px;
    height: 48px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    flex-shrink: 0;
  }

  .profile-icon.user { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }
  .profile-icon.email { background: linear-gradient(135deg, #10b981, #059669); }
  .profile-icon.phone { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }
  .profile-icon.shield { background: linear-gradient(135deg, #f59e0b, #d97706); }
  .profile-icon.calendar { background: linear-gradient(135deg, #ef4444, #dc2626); }
  .profile-icon.badge { background: linear-gradient(135deg, #06b6d4, #0891b2); }
  .profile-icon.id { background: linear-gradient(135deg, #6366f1, #4f46e5); }

  .profile-content {
    flex: 1;
  }

  .profile-content label {
    display: block;
    font-size: 0.8rem;
    color: #64748b;
    font-weight: 600;
    text-transform: uppercase;
    margin-bottom: 0.25rem;
  }

  .profile-content p {
    font-size: 1rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0;
    word-break: break-word;
  }

  .user-id {
    font-family: 'Courier New', monospace;
    font-size: 0.9rem;
    color: #64748b;
  }

  .roles-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }

  .role-badge {
    background: #dbeafe;
    color: #1e40af;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
  }

  /* Profile Actions */
  .profile-actions {
    display: flex;
    gap: 1rem;
    padding-top: 1.5rem;
    border-top: 1px solid #e2e8f0;
  }

  .action-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    background: white;
    color: #374151;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 0.9rem;
  }

  .action-btn.primary {
    background: #3b82f6;
    color: white;
    border-color: #3b82f6;
  }

  .action-btn.secondary {
    background: white;
    color: #374151;
    border-color: #e2e8f0;
  }

  .action-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  .action-btn.primary:hover {
    background: #2563eb;
  }

  .action-btn.secondary:hover {
    background: #f8fafc;
  }

  /* Quick Settings */
  .settings-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .setting-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    transition: all 0.3s ease;
    cursor: pointer;
  }

  .setting-card:hover {
    background: white;
    border-color: #3b82f6;
    transform: translateY(-2px);
    box-shadow: 0 8px 15px rgba(59, 130, 246, 0.1);
  }

  .setting-icon {
    width: 48px;
    height: 48px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.3rem;
    flex-shrink: 0;
  }

  .setting-icon.blue { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }
  .setting-icon.green { background: linear-gradient(135deg, #10b981, #059669); }
  .setting-icon.purple { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }
  .setting-icon.orange { background: linear-gradient(135deg, #f59e0b, #d97706); }

  .setting-content {
    flex: 1;
  }

  .setting-content h4 {
    font-size: 0.95rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0 0 0.25rem 0;
  }

  .setting-content p {
    font-size: 0.8rem;
    color: #64748b;
    margin: 0 0 0.25rem 0;
  }

  .setting-status {
    font-size: 0.7rem;
    font-weight: 600;
    padding: 0.2rem 0.6rem;
    border-radius: 12px;
    text-transform: uppercase;
  }

  .setting-status.blue { background: #dbeafe; color: #1e40af; }
  .setting-status.green { background: #d1fae5; color: #065f46; }
  .setting-status.purple { background: #ede9fe; color: #5b21b6; }
  .setting-status.orange { background: #fef3c7; color: #92400e; }

  /* Account Stats */
  .account-stats {
    background: #f0f9ff;
    border: 1px solid #e0f2fe;
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .account-stats h4 {
    font-size: 1rem;
    font-weight: 600;
    color: #0369a1;
    margin: 0 0 1rem 0;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }

  .stat {
    text-align: center;
    padding: 0.75rem;
    background: white;
    border-radius: 8px;
    border: 1px solid #e0f2fe;
  }

  .stat-value {
    display: block;
    font-size: 1.5rem;
    font-weight: 700;
    color: #0369a1;
    margin-bottom: 0.25rem;
  }

  .stat-label {
    display: block;
    font-size: 0.7rem;
    color: #0c4a6e;
    font-weight: 500;
    text-transform: uppercase;
  }

  /* Account Status */
  .account-status {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 1.5rem;
  }

  .account-status h4 {
    font-size: 1rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0 0 1rem 0;
  }

  .status-items {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .status-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .status-indicator {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .status-indicator.active {
    background: #10b981;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
  }

  .status-indicator.verified {
    background: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
  }

  .status-indicator.success {
    background: #8b5cf6;
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.2);
  }

  .status-text {
    display: flex;
    flex-direction: column;
  }

  .status-label {
    font-size: 0.8rem;
    color: #64748b;
    font-weight: 500;
  }

  .status-value {
    font-size: 0.9rem;
    color: #1e293b;
    font-weight: 600;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .account-container {
      padding: 1rem;
    }

    .welcome-banner {
      flex-direction: column;
      text-align: center;
      padding: 2rem 1.5rem;
    }

    .welcome-content h1 {
      font-size: 1.8rem;
    }

    .profile-actions {
      flex-direction: column;
    }

    .stats-grid {
      grid-template-columns: 1fr;
    }

    .profile-item {
      flex-direction: column;
      text-align: center;
    }

    .profile-icon {
      align-self: center;
    }
  }

  @media (max-width: 480px) {
    .content-grid {
      grid-template-columns: 1fr;
    }

    .profile-actions {
      flex-direction: column;
    }

    .setting-card {
      flex-direction: column;
      text-align: center;
    }

    .setting-icon {
      align-self: center;
    }
  }
`;