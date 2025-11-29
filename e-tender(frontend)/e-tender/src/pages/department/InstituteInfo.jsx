import React, { useEffect, useState } from "react";
import { FiHome, FiMail, FiPhone, FiMapPin, FiCheckCircle, FiClock, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';

export default function InstituteInfo() {
  const [institute, setInstitute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchInstituteData = async () => {
      setLoading(true);
      setError(null);

      if (!token) {
        setError("No authentication token found");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("http://127.0.0.1:8000/api/v1/departments/my-institute", {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch institute data");
        }

        const data = await response.json();
        setInstitute(data);
      } catch (err) {
        console.error("Error fetching institute:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInstituteData();
  }, [token]);

  const handleRetry = () => {
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="institute-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading institute information...</p>
        </div>
        <style>{styles}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="institute-page">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h2>Error Loading Institute Information</h2>
          <p>{error}</p>
          <button className="retry-btn" onClick={handleRetry}>
            <FiRefreshCw size={16} />
            Retry
          </button>
        </div>
        <style>{styles}</style>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'verified':
      case 'active':
        return '#10b981';
      case 'pending':
      case 'processing':
        return '#f59e0b';
      case 'rejected':
      case 'inactive':
        return '#ef4444';
      default:
        return '#64748b';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'verified':
      case 'active':
        return <FiCheckCircle size={20} />;
      case 'pending':
        return <FiClock size={20} />;
      case 'rejected':
        return <FiAlertCircle size={20} />;
      default:
        return <FiHome size={20} />;
    }
  };

  return (
    <div className="institute-page">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="welcome-content">
          <h1>Institute Information 🏛️</h1>
          <p>Complete details about your registered institute</p>
        </div>
        <div className="institute-id-badge">
          <FiHome size={20} />
          <span>ID: {institute?.institute_id || 'N/A'}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="content-container">
        {/* Basic Institute Information Card */}
        <div className="info-card primary-card">
          <div className="card-header">
            <div className="card-icon institute">🏛️</div>
            <div>
              <h2>Institute Details</h2>
              <p>Basic institutional information</p>
            </div>
          </div>
          
          <div className="card-body">
            <div className="info-row">
              <div className="info-icon">
                <FiHome size={20} />
              </div>
              <div className="info-content">
                <label>Institute Name</label>
                <p>{institute?.institute_name || "N/A"}</p>
              </div>
            </div>

            <div className="info-row">
              <div className="info-icon">
                {getStatusIcon(institute?.verification_status)}
              </div>
              <div className="info-content">
                <label>Verification Status</label>
                <p style={{ color: getStatusColor(institute?.verification_status) }}>
                  {institute?.verification_status || "N/A"}
                </p>
              </div>
            </div>

            {institute?.registration_number && (
              <div className="info-row">
                <div className="info-icon">📋</div>
                <div className="info-content">
                  <label>Registration Number</label>
                  <p className="code-text">{institute.registration_number}</p>
                </div>
              </div>
            )}

            {institute?.institute_type && (
              <div className="info-row">
                <div className="info-icon">🎓</div>
                <div className="info-content">
                  <label>Institute Type</label>
                  <p>{institute.institute_type}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contact Information Card */}
        <div className="info-card contact-card">
          <div className="card-header">
            <div className="card-icon contact">📞</div>
            <div>
              <h2>Contact Information</h2>
              <p>How to reach the institute</p>
            </div>
          </div>
          
          <div className="card-body">
            {institute?.contact_email && (
              <div className="info-row">
                <div className="info-icon">
                  <FiMail size={20} />
                </div>
                <div className="info-content">
                  <label>Contact Email</label>
                  <p>{institute.contact_email}</p>
                </div>
              </div>
            )}

            {institute?.phone_number && (
              <div className="info-row">
                <div className="info-icon">
                  <FiPhone size={20} />
                </div>
                <div className="info-content">
                  <label>Phone Number</label>
                  <p>{institute.phone_number}</p>
                </div>
              </div>
            )}

            {institute?.address && (
              <div className="info-row">
                <div className="info-icon">
                  <FiMapPin size={20} />
                </div>
                <div className="info-content">
                  <label>Address</label>
                  <p>{institute.address}</p>
                </div>
              </div>
            )}
          </div>

          <div className="card-footer">
            <button className="action-btn primary">
              ✏️ Update Information
            </button>
            <button className="action-btn secondary">
              📧 Contact Support
            </button>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="info-card actions-card">
          <div className="card-header">
            <div className="card-icon">⚙️</div>
            <div>
              <h2>Institute Actions</h2>
              <p>Quick actions for institute management</p>
            </div>
          </div>
          
          <div className="card-body actions-grid">
            <button className="quick-action-btn">
              <span className="action-icon">📄</span>
              <span>View Tenders</span>
            </button>
            <button className="quick-action-btn">
              <span className="action-icon">👥</span>
              <span>Manage Blocks</span>
            </button>
            <button className="quick-action-btn">
              <span className="action-icon">📊</span>
              <span>Reports</span>
            </button>
            <button className="quick-action-btn">
              <span className="action-icon">🔧</span>
              <span>Settings</span>
            </button>
          </div>
        </div>
      </div>

      <style>{styles}</style>
    </div>
  );
}

const styles = `
  .institute-page {
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
    display: flex;
    align-items: center;
    gap: 0.5rem;
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

  .institute-id-badge {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    padding: 1rem 1.5rem;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    font-size: 1.1rem;
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

  .card-icon.institute {
    background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  }

  .card-icon.contact {
    background: linear-gradient(135deg, #10b981, #059669);
  }

  .card-icon.details {
    background: linear-gradient(135deg, #f59e0b, #d97706);
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
    color: #64748b;
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

  .code-text {
    font-family: 'Courier New', monospace;
    font-size: 0.9rem;
    color: #64748b;
    background: #f1f5f9;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    display: inline-block;
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
    .institute-page {
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

    .institute-id-badge {
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