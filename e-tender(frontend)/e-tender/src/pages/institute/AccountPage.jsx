import React, { useEffect, useState } from "react";

export default function AccountPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchAccountData = async () => {
      setLoading(true);
      setError(null);

      if (!token) {
        setError("No authentication token found");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("https://792hpzm4-8000.inc1.devtunnels.ms/api/v1/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch account data");
        }

        const data = await response.json();
        setUser(data);
      } catch (err) {
        console.error("Error fetching account:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAccountData();
  }, [token]);

  if (loading) {
    return (
      <div className="account-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your account details...</p>
        </div>
        <style>{styles}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="account-page">
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

  const isVendor = user?.company_name || user?.gst_number;
  const isInstitute = user?.institute_name || user?.registration_number;
  const accountType = isVendor ? "Vendor" : isInstitute ? "Institute" : "User";

  return (
    <div className="account-page">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="welcome-content">
          <h1>My Account 👤</h1>
          <p>Manage your profile and account information</p>
        </div>
        <div className="account-type-badge">
          {accountType === "Vendor" && "💼"}
          {accountType === "Institute" && "🏛️"}
          {accountType === "User" && "👤"}
          <span>{accountType} Account</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="content-container">
        {/* Basic Information Card */}
        <div className="info-card primary-card">
          <div className="card-header">
            <div className="card-icon">📋</div>
            <div>
              <h2>Account Information</h2>
              <p>Your basic account details</p>
            </div>
          </div>
          
          <div className="card-body">
            <div className="info-row">
              <div className="info-icon">👤</div>
              <div className="info-content">
                <label>Username</label>
                <p>{user?.username || "N/A"}</p>
              </div>
            </div>

            <div className="info-row">
              <div className="info-icon">📧</div>
              <div className="info-content">
                <label>Email Address</label>
                <p>{user?.email || "N/A"}</p>
              </div>
            </div>

            {user?.roles && user.roles.length > 0 && (
              <div className="info-row">
                <div className="info-icon">🏅</div>
                <div className="info-content">
                  <label>Roles & Permissions</label>
                  <div className="roles-list">
                    {user.roles.map((role, index) => (
                      <span key={index} className="role-badge">
                        {typeof role === 'string' ? role : role.role_name || role}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {user?.user_id && (
              <div className="info-row">
                <div className="info-icon">🆔</div>
                <div className="info-content">
                  <label>User ID</label>
                  <p className="user-id">{user.user_id}</p>
                </div>
              </div>
            )}
          </div>

          <div className="card-footer">
            <button className="action-btn primary">
              ✏️ Edit Profile
            </button>
            <button className="action-btn secondary">
              🔒 Change Password
            </button>
          </div>
        </div>

        {/* Vendor Details Card */}
        {isVendor && (
          <div className="info-card vendor-card">
            <div className="card-header">
              <div className="card-icon vendor">💼</div>
              <div>
                <h2>Vendor Details</h2>
                <p>Company and business information</p>
              </div>
            </div>
            
            <div className="card-body">
              {user?.company_name && (
                <div className="info-row">
                  <div className="info-icon">🏢</div>
                  <div className="info-content">
                    <label>Company Name</label>
                    <p>{user.company_name}</p>
                  </div>
                </div>
              )}

              {user?.gst_number && (
                <div className="info-row">
                  <div className="info-icon">📄</div>
                  <div className="info-content">
                    <label>GST Number</label>
                    <p className="code-text">{user.gst_number}</p>
                  </div>
                </div>
              )}

              {user?.pan_number && (
                <div className="info-row">
                  <div className="info-icon">🪪</div>
                  <div className="info-content">
                    <label>PAN Number</label>
                    <p className="code-text">{user.pan_number}</p>
                  </div>
                </div>
              )}

              {user?.contact_number && (
                <div className="info-row">
                  <div className="info-icon">📱</div>
                  <div className="info-content">
                    <label>Contact Number</label>
                    <p>{user.contact_number}</p>
                  </div>
                </div>
              )}

              {user?.address && (
                <div className="info-row">
                  <div className="info-icon">📍</div>
                  <div className="info-content">
                    <label>Address</label>
                    <p>{user.address}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Institute Details Card */}
        {isInstitute && (
          <div className="info-card institute-card">
            <div className="card-header">
              <div className="card-icon institute">🏛️</div>
              <div>
                <h2>Institute Details</h2>
                <p>Institutional information</p>
              </div>
            </div>
            
            <div className="card-body">
              {user?.institute_name && (
                <div className="info-row">
                  <div className="info-icon">🏫</div>
                  <div className="info-content">
                    <label>Institute Name</label>
                    <p>{user.institute_name}</p>
                  </div>
                </div>
              )}

              {user?.registration_number && (
                <div className="info-row">
                  <div className="info-icon">📋</div>
                  <div className="info-content">
                    <label>Registration Number</label>
                    <p className="code-text">{user.registration_number}</p>
                  </div>
                </div>
              )}

              {user?.contact_email && (
                <div className="info-row">
                  <div className="info-icon">✉️</div>
                  <div className="info-content">
                    <label>Contact Email</label>
                    <p>{user.contact_email}</p>
                  </div>
                </div>
              )}

              {user?.phone_number && (
                <div className="info-row">
                  <div className="info-icon">☎️</div>
                  <div className="info-content">
                    <label>Phone Number</label>
                    <p>{user.phone_number}</p>
                  </div>
                </div>
              )}

              {user?.address && (
                <div className="info-row">
                  <div className="info-icon">🗺️</div>
                  <div className="info-content">
                    <label>Address</label>
                    <p>{user.address}</p>
                  </div>
                </div>
              )}

              {user?.established_date && (
                <div className="info-row">
                  <div className="info-icon">📅</div>
                  <div className="info-content">
                    <label>Established Date</label>
                    <p>{new Date(user.established_date).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Account Actions Card */}
        <div className="info-card actions-card">
          <div className="card-header">
            <div className="card-icon">⚙️</div>
            <div>
              <h2>Quick Actions</h2>
              <p>Manage your account settings</p>
            </div>
          </div>
          
          <div className="card-body actions-grid">
            <button className="quick-action-btn">
              <span className="action-icon">🔔</span>
              <span>Notifications</span>
            </button>
            <button className="quick-action-btn">
              <span className="action-icon">🔐</span>
              <span>Security</span>
            </button>
            <button className="quick-action-btn">
              <span className="action-icon">💳</span>
              <span>Billing</span>
            </button>
            <button className="quick-action-btn">
              <span className="action-icon">📊</span>
              <span>Analytics</span>
            </button>
          </div>
        </div>
      </div>

      <style>{styles}</style>
    </div>
  );
}

const styles = `
  .account-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    padding: 2rem;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
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
    box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
  }

  .welcome-content h1 {
    font-size: 2.2rem;
    font-weight: 800;
    margin-bottom: 0.5rem;
  }

  .welcome-content p {
    font-size: 1.1rem;
    opacity: 0.9;
    margin: 0;
  }

  .account-type-badge {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    padding: 1rem 1.5rem;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    font-size: 1.5rem;
    font-weight: 600;
  }

  /* Content Container */
  .content-container {
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
    gap: 2rem;
  }

  /* Info Cards */
  .info-card {
    background: white;
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    overflow: hidden;
    transition: all 0.3s ease;
  }

  .info-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.5rem;
    border-bottom: 1px solid #e2e8f0;
  }

  .card-icon {
    width: 56px;
    height: 56px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.8rem;
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    flex-shrink: 0;
  }

  .card-icon.vendor {
    background: linear-gradient(135deg, #10b981, #059669);
  }

  .card-icon.institute {
    background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  }

  .card-header h2 {
    font-size: 1.25rem;
    font-weight: 700;
    color: #1e293b;
    margin: 0 0 0.25rem 0;
  }

  .card-header p {
    font-size: 0.9rem;
    color: #64748b;
    margin: 0;
  }

  .card-body {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  /* Info Rows */
  .info-row {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem;
    background: #f8fafc;
    border-radius: 10px;
    transition: all 0.3s ease;
  }

  .info-row:hover {
    background: #f1f5f9;
    transform: translateX(4px);
  }

  .info-icon {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    background: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    flex-shrink: 0;
  }

  .info-content {
    flex: 1;
    min-width: 0;
  }

  .info-content label {
    display: block;
    font-size: 0.8rem;
    color: #64748b;
    font-weight: 600;
    text-transform: uppercase;
    margin-bottom: 0.25rem;
    letter-spacing: 0.5px;
  }

  .info-content p {
    font-size: 1rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0;
    word-break: break-word;
  }

  .user-id, .code-text {
    font-family: 'Courier New', monospace;
    font-size: 0.9rem;
    color: #64748b;
    background: #f1f5f9;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    display: inline-block;
  }

  /* Roles List */
  .roles-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }

  .role-badge {
    background: linear-gradient(135deg, #dbeafe, #bfdbfe);
    color: #1e40af;
    padding: 0.4rem 0.8rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
    border: 1px solid #93c5fd;
  }

  /* Card Footer */
  .card-footer {
    padding: 1.5rem;
    border-top: 1px solid #e2e8f0;
    display: flex;
    gap: 1rem;
  }

  .action-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 0.9rem;
    border: none;
  }

  .action-btn.primary {
    background: #3b82f6;
    color: white;
  }

  .action-btn.secondary {
    background: #f1f5f9;
    color: #475569;
  }

  .action-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .action-btn.primary:hover {
    background: #2563eb;
  }

  .action-btn.secondary:hover {
    background: #e2e8f0;
  }

  /* Actions Card */
  .actions-card {
    grid-column: 1 / -1;
  }

  .actions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
  }

  .quick-action-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    padding: 1.5rem;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 600;
    color: #1e293b;
  }

  .quick-action-btn:hover {
    background: white;
    border-color: #3b82f6;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
  }

  .action-icon {
    font-size: 2rem;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .account-page {
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

    .account-type-badge {
      margin-top: 1rem;
    }

    .content-container {
      grid-template-columns: 1fr;
    }

    .card-footer {
      flex-direction: column;
    }

    .actions-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 480px) {
    .welcome-content h1 {
      font-size: 1.5rem;
    }

    .card-header {
      flex-direction: column;
      text-align: center;
    }

    .info-row {
      flex-direction: column;
      text-align: center;
    }

    .info-icon {
      align-self: center;
    }

    .actions-grid {
      grid-template-columns: 1fr;
    }
  }
`;