import React from "react";
import { FiFacebook, FiTwitter, FiLinkedin, FiMail, FiMapPin, FiPhone, FiArrowUp } from "react-icons/fi";
import { Link } from "react-router-dom";

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer">
      {/* Main Footer Content */}
      <div className="footer-main">
        <div className="footer-container">
          
          {/* Compact Footer Grid */}
          <div className="footer-grid">
            
            {/* Brand Column */}
            <div className="brand-column">
              <Link to="/" className="footer-logo">
                <span className="logo-icon">🏛️</span>
                <div className="logo-text">
                  <span className="logo-primary">Tender</span>
                  <span className="logo-accent">Pro</span>
                </div>
              </Link>
              <p className="brand-desc">
                Revolutionizing e-tendering with cutting-edge technology and unmatched security.
              </p>

              <div className="social-links">
                <a href="#" className="social-link" aria-label="Facebook">
                  <FiFacebook />
                </a>
                <a href="#" className="social-link" aria-label="Twitter">
                  <FiTwitter />
                </a>
                <a href="#" className="social-link" aria-label="LinkedIn">
                  <FiLinkedin />
                </a>
                <a href="mailto:support@tenderpro.com" className="social-link" aria-label="Email">
                  <FiMail />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="link-column">
              <h3 className="column-title">Platform</h3>
              <ul>
                <li><Link to="/features">Features</Link></li>
                <li><Link to="/pricing">Pricing</Link></li>
                <li><Link to="/security">Security</Link></li>
                <li><Link to="/api-docs">API</Link></li>
              </ul>
            </div>

            {/* Solutions */}
            <div className="link-column">
              <h3 className="column-title">Solutions</h3>
              <ul>
                <li><Link to="/solutions/institutes">Institutes</Link></li>
                <li><Link to="/solutions/vendors">Vendors</Link></li>
                <li><Link to="/solutions/government">Government</Link></li>
                <li><Link to="/integrations">Integrations</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div className="contact-column">
              <h3 className="column-title">Contact</h3>
              <div className="contact-info">
                <div className="contact-item">
                  <FiMail className="contact-icon" />
                  <a href="mailto:support@tenderpro.com">support@tenderpro.com</a>
                </div>
                
                <div className="contact-item">
                  <FiPhone className="contact-icon" />
                  <a href="tel:+918340459246">+91 83404 59246</a>
                </div>
                
                <div className="contact-item">
                  <FiMapPin className="contact-icon" />
                  <span>Namchi, Sikkim</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="footer-container">
          <div className="bottom-content">
            <div className="copyright">
              <p>© 2025 <strong>TenderPro</strong>. All rights reserved.</p>
              <div className="legal-links">
                <Link to="/privacy">Privacy</Link>
                <Link to="/terms">Terms</Link>
                <Link to="/cookies">Cookies</Link>
              </div>
            </div>
            
            <div className="bottom-right">
              <div className="made-with">
                <span>Made with</span>
                <span className="heart">❤️</span>
                <span>in India</span>
              </div>
              <button className="scroll-top" onClick={scrollToTop} aria-label="Scroll to top">
                <FiArrowUp />
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .footer {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          color: #e2e8f0;
          position: relative;
          overflow: hidden;
          border-top: 1px solid rgba(99, 102, 241, 0.3);
        }

        .footer::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: 
            radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.05) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(99, 102, 241, 0.03) 0%, transparent 50%);
          pointer-events: none;
        }

        .footer-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
          position: relative;
          z-index: 2;
        }

        /* Footer Grid */
        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1.2fr;
          gap: 2rem;
          padding: 3rem 0 2rem;
        }

        /* Brand Column */
        .brand-column {
          display: flex;
          flex-direction: column;
        }

        .footer-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          margin-bottom: 1rem;
        }

        .logo-icon {
          font-size: 2rem;
        }

        .logo-text {
          display: flex;
          flex-direction: column;
          line-height: 1;
        }

        .logo-primary {
          font-size: 1.5rem;
          font-weight: 800;
          background: linear-gradient(to right, #ffffff, #e0e7ff);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .logo-accent {
          font-size: 0.9rem;
          font-weight: 700;
          background: linear-gradient(to right, #6366f1, #8b5cf6);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          margin-top: -2px;
        }

        .brand-desc {
          margin: 0 0 1.5rem 0;
          line-height: 1.6;
          color: #94a3b8;
          font-size: 0.9rem;
          max-width: 300px;
        }

        .social-links {
          display: flex;
          gap: 0.8rem;
        }

        .social-link {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: rgba(99, 102, 241, 0.1);
          border: 1px solid rgba(99, 102, 241, 0.2);
          color: #6366f1;
          border-radius: 10px;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .social-link:hover {
          background: #6366f1;
          color: white;
          transform: translateY(-2px);
        }

        /* Link Columns */
        .column-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: white;
          margin-bottom: 1rem;
        }

        .link-column ul {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        .link-column a {
          color: #cbd5e1;
          text-decoration: none;
          font-size: 0.9rem;
          transition: all 0.3s ease;
        }

        .link-column a:hover {
          color: #6366f1;
        }

        /* Contact Column */
        .contact-info {
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
        }

        .contact-item {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          color: #cbd5e1;
          font-size: 0.9rem;
        }

        .contact-icon {
          color: #6366f1;
          flex-shrink: 0;
        }

        .contact-item a {
          color: #cbd5e1;
          text-decoration: none;
          transition: color 0.3s ease;
        }

        .contact-item a:hover {
          color: #6366f1;
        }

        /* Footer Bottom */
        .footer-bottom {
          border-top: 1px solid rgba(99, 102, 241, 0.2);
          padding: 1.5rem 0;
          background: rgba(15, 23, 42, 0.8);
        }

        .bottom-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .copyright p {
          margin: 0 0 0.5rem 0;
          color: #94a3b8;
          font-size: 0.85rem;
        }

        .copyright strong {
          color: #6366f1;
        }

        .legal-links {
          display: flex;
          gap: 1.2rem;
        }

        .legal-links a {
          color: #64748b;
          text-decoration: none;
          font-size: 0.8rem;
          transition: color 0.3s ease;
        }

        .legal-links a:hover {
          color: #6366f1;
        }

        .bottom-right {
          display: flex;
          align-items: center;
          gap: 1.2rem;
        }

        .made-with {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          color: #94a3b8;
          font-size: 0.8rem;
        }

        .heart {
          color: #ef4444;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        .scroll-top {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          border: none;
          border-radius: 8px;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .scroll-top:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 15px rgba(99, 102, 241, 0.4);
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
          }
          .brand-column {
            grid-column: span 2;
          }
        }

        @media (max-width: 768px) {
          .footer-container {
            padding: 0 1.5rem;
          }

          .footer-grid {
            grid-template-columns: 1fr;
            text-align: center;
            gap: 2rem;
            padding: 2rem 0 1.5rem;
          }

          .brand-column {
            grid-column: span 1;
          }

          .social-links {
            justify-content: center;
          }

          .bottom-content {
            flex-direction: column;
            text-align: center;
            gap: 1rem;
          }

          .legal-links {
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .footer-grid {
            gap: 1.5rem;
          }

          .brand-desc {
            font-size: 0.85rem;
          }

          .social-links {
            gap: 0.5rem;
          }

          .social-link {
            width: 36px;
            height: 36px;
          }
        }
      `}</style>
    </footer>
  );
}