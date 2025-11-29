// import React, { useEffect, useState } from "react";
// import { NavLink, useNavigate, useLocation } from 'react-router-dom';
// import { FiMenu, FiX } from 'react-icons/fi';

// export default function Navbar() {
//   // State for token to easily check authentication status
//   const [token, setToken] = React.useState(localStorage.getItem('token'));
//   const [roles, setRoles] = React.useState(
//     JSON.parse(localStorage.getItem('roles') || '[]')
//   );
//   const [menuOpen, setMenuOpen] = React.useState(false);
//   const navigate = useNavigate();
//   const location = useLocation();

//   // This effect listens for localStorage changes from other tabs
//   React.useEffect(() => {
//     const handleStorageChange = () => {
//       setToken(localStorage.getItem('token'));
//       setRoles(JSON.parse(localStorage.getItem('roles') || '[]'));
//     };

//     window.addEventListener('storage', handleStorageChange);

//     // Cleanup listener on component unmount
//     return () => {
//       window.removeEventListener('storage', handleStorageChange);
//     };
//   }, []);

//   // This effect ensures state is correct on navigation and closes mobile menu
//   React.useEffect(() => {
//     setToken(localStorage.getItem('token'));
//     setRoles(JSON.parse(localStorage.getItem('roles') || '[]'));
//     setMenuOpen(false); // close mobile menu on route change
//   }, [location]);

//   const handleLogout = () => {
//     localStorage.clear(); // Clears token, roles, etc.
//     setToken(null);
//     setRoles([]);
//     navigate('/login');
//   };

//   // --- Simplified Link Logic ---
//   const getDashboardPath = () => {
//     if (roles.includes('VENDOR')) return '/vendor/dashboard';
//     if (roles.includes('INSTITUTE_ADMIN')) return '/institute/dashboard';
//     if (roles.includes('DEPARTMENT')) return '/department/dashboard';
//     return '/dashboard'; // A fallback
//   };

//   // Determine which links to show based on the presence of a token
//   const navLinks = token
//     ? [{ name: 'Dashboard', href: getDashboardPath() }]
//     : [
//         { name: 'Home', href: '/' },
//         { name: 'Login', href: '/login' },
//         { name: 'Signup', href: '/signup' },
//       ];

//   return (
//     <nav className="navbar">
//       <div className="navbar-container">
//         <NavLink to="/" className="logo">
//           Tenderly
//         </NavLink>

//         <div className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
//           {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
//         </div>

//         <ul className={`nav-links ${menuOpen ? 'open' : ''}`}>
//           {navLinks.map((item) => (
//             <li key={item.name}>
//               <NavLink
//                 to={item.href}
//                 className={({ isActive }) => (isActive ? 'active' : '')}
//               >
//                 {item.name}
//               </NavLink>
//             </li>
//           ))}
//           {/* Show logout button only when logged in */}
//           {token && (
//             <li>
//               <button className="logout-btn" onClick={handleLogout}>
//                 Logout
//               </button>
//             </li>
//           )}
//         </ul>
//       </div>

//       {/* --- Styles with CSS Fix --- */}
//       <style>{`
//         .navbar {
//           background: linear-gradient(to right, #111827, #3b82f6);
//           color: white;
//           position: sticky;
//           top: 0;
//           z-index: 50;
//           box-shadow: 0 2px 4px rgba(0,0,0,0.1);
//         }
//         .navbar-container {
//           max-width: 1200px;
//           margin: 0 auto;
//           padding: 0.5rem 1rem;
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           height: 60px;
//         }
//         .logo {
//           font-size: 1.5rem;
//           font-weight: bold;
//           color: white;
//           text-decoration: none;
//         }
//         .nav-links {
//           list-style: none;
//           padding: 0;
//           margin: 0;
//           display: flex;
//           gap: 1.5rem;
//           align-items: center;
//         }
//         /* CORRECTED RULE: Only applies to <a> tags */
//         .nav-links li a {
//           text-decoration: none;
//           color: white;
//           font-weight: 500;
//           transition: color 0.2s;
//         }
//         .nav-links li a:hover,
//         .nav-links li a.active {
//           color: #facc15;
//         }
//         /* This rule now works as intended */
//         .logout-btn {
//           background: white;
//           color: #3b82f6; /* This blue color is now visible */
//           font-size: 1rem;
//           font-weight: 600;
//           padding: 0.25rem 1rem;
//           border: none;
//           border-radius: 5px;
//           cursor: pointer;
//           transition: all 0.2s;
//         }
//         .logout-btn:hover {
//           background: #facc15;
//           color: #111827;
//         }
//         .mobile-menu-btn {
//           display: none;
//           cursor: pointer;
//         }
//         @media (max-width: 768px) {
//           .nav-links {
//             display: none;
//             flex-direction: column;
//             gap: 1.5rem;
//             background: #111827;
//             position: absolute;
//             top: 60px;
//             left: 0;
//             width: 100%;
//             padding: 2rem 0;
//             align-items: center;
//             box-shadow: 0 4px 6px rgba(0,0,0,0.1);
//           }
//           .nav-links.open {
//             display: flex;
//           }
//           .mobile-menu-btn {
//             display: block;
//             z-index: 100;
//           }
//         }
//       `}</style>
//     </nav>
//   );
// }

import React, { useEffect, useState } from "react";
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { FiMenu, FiX, FiLogOut, FiUser, FiBell, FiChevronDown } from 'react-icons/fi';

export default function Navbar() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [roles, setRoles] = useState(JSON.parse(localStorage.getItem('roles') || '[]'));
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem('token'));
      setRoles(JSON.parse(localStorage.getItem('roles') || '[]'));
    };
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    setToken(localStorage.getItem('token'));
    setRoles(JSON.parse(localStorage.getItem('roles') || '[]'));
    setMenuOpen(false);
    setUserMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    localStorage.clear();
    setToken(null);
    setRoles([]);
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (roles.includes('VENDOR')) return '/vendor/dashboard';
    if (roles.includes('INSTITUTE_ADMIN')) return '/institute/dashboard';
    if (roles.includes('DEPARTMENT')) return '/department/dashboard';
    return '/dashboard';
  };

  const getUserRoleText = () => {
    if (roles.includes('VENDOR')) return 'Vendor';
    if (roles.includes('INSTITUTE_ADMIN')) return 'Institute Admin';
    if (roles.includes('DEPARTMENT')) return 'Department';
    return 'User';
  };

  const navLinks = token
    ? [
        { name: 'Dashboard', href: getDashboardPath(), icon: '📊' },
        { name: 'Tenders', href: '/tenders', icon: '📋' },
        { name: 'Bids', href: '/bids', icon: '💰' },
        { name: 'Analytics', href: '/analytics', icon: '📈' },
      ]
    : [
        { name: 'Home', href: '/', icon: '🏠' },
        { name: 'Features', href: '/#features', icon: '✨' },
        { name: 'Solutions', href: '/solutions', icon: '🎯' },
        { name: 'Pricing', href: '/pricing', icon: '💎' },
        { name: 'About', href: '/about', icon: '👥' },
      ];

  return (
    <>
      {/* Announcement Bar
      <div className="announcement-bar">
        <div className="announcement-content">
          <span className="announcement-badge">🎉 New</span>
          <span>Save 50% on your first 3 months - Limited time offer!</span>
          <a href="/pricing" className="announcement-cta">
            Claim Offer <span>→</span>
          </a>
        </div>
      </div> */}

      {/* Main Navbar */}
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="navbar-container">
          {/* Logo Section */}
          <NavLink to="/" className="logo-section">
            <div className="logo-icon">🏛️</div>
            <div className="logo-text">
              <span className="logo-primary">Tender</span>
              <span className="logo-accent">Pro</span>
            </div>
          </NavLink>

          {/* Navigation Links */}
          <ul className={`nav-menu ${menuOpen ? 'open' : ''}`}>
            {navLinks.map((link) => (
              <li key={link.name}>
                <NavLink
                  to={link.href}
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  onClick={() => link.href.startsWith('/#') && setMenuOpen(false)}
                >
                  <span className="nav-icon">{link.icon}</span>
                  {link.name}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Right Section */}
          <div className="nav-right">
            {token ? (
              <>
                {/* Notification Bell */}
                <button className="notification-btn" aria-label="Notifications">
                  <FiBell size={20} />
                  <span className="notification-dot"></span>
                </button>

                {/* User Profile */}
                <div className="user-menu-container">
                  <button 
                    className="user-profile-btn"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                  >
                    <div className="user-avatar">
                      <FiUser size={16} />
                    </div>
                    <span className="user-name">Welcome back!</span>
                    <FiChevronDown size={16} className={`chevron ${userMenuOpen ? 'rotate' : ''}`} />
                  </button>

                  {/* User Dropdown Menu */}
                  {userMenuOpen && (
                    <div className="user-dropdown">
                      <div className="user-info">
                        <div className="user-role">{getUserRoleText()}</div>
                        <div className="user-email">{localStorage.getItem('email') || 'user@example.com'}</div>
                      </div>
                      <div className="dropdown-divider"></div>
                      <NavLink to="/profile" className="dropdown-item">
                        <span className="dropdown-icon">👤</span>
                        My Profile
                      </NavLink>
                      <NavLink to="/settings" className="dropdown-item">
                        <span className="dropdown-icon">⚙️</span>
                        Settings
                      </NavLink>
                      <button className="dropdown-item logout-item" onClick={handleLogout}>
                        <FiLogOut size={18} />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="auth-buttons">
                <NavLink to="/login" className="login-btn">
                  Sign In
                </NavLink>
                <NavLink to="/signup" className="signup-btn">
                  <span className="btn-text">Get Started Free</span>
                  <span className="btn-subtext">No credit card</span>
                </NavLink>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="mobile-menu-btn"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {menuOpen && <div className="mobile-overlay" onClick={() => setMenuOpen(false)} />}
      </nav>

      <style jsx>{`
        /* Announcement Bar */
        .announcement-bar {
          background: linear-gradient(135deg, #facc15, #eab308);
          color: #1e293b;
          padding: 10px 0;
          position: relative;
          font-size: 0.9rem;
          font-weight: 600;
          text-align: center;
          border-bottom: 1px solid rgba(30, 41, 59, 0.1);
        }

        .announcement-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .announcement-badge {
          background: #1e293b;
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 700;
        }

        .announcement-cta {
          color: #1e293b;
          font-weight: 700;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 4px;
          transition: all 0.3s ease;
        }

        .announcement-cta:hover {
          transform: translateX(4px);
        }

        /* Main Navbar */
        .navbar {
          position: sticky;
          top: 0;
          z-index: 1000;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(96, 165, 250, 0.15);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .navbar.scrolled {
          background: rgba(15, 23, 42, 0.98);
          border-bottom-color: rgba(96, 165, 250, 0.25);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        }

        .navbar-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        /* Logo Section */
        .logo-section {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .logo-section:hover {
          transform: translateY(-2px);
        }

        .logo-icon {
          font-size: 2rem;
          filter: grayscale(0.2);
        }

        .logo-text {
          display: flex;
          flex-direction: column;
          line-height: 1;
        }

        .logo-primary {
          font-size: 1.8rem;
          font-weight: 900;
          background: linear-gradient(to right, #ffffff, #e0e7ff);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          letter-spacing: -0.5px;
        }

        .logo-accent {
          font-size: 1rem;
          font-weight: 700;
          background: linear-gradient(to right, #facc15, #fde047);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          margin-top: -2px;
        }

        /* Navigation Menu */
        .nav-menu {
          display: flex;
          align-items: center;
          gap: 2rem;
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #cbd5e1;
          text-decoration: none;
          font-weight: 500;
          font-size: 1rem;
          padding: 0.8rem 1.2rem;
          border-radius: 12px;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .nav-link::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(96, 165, 250, 0.1), transparent);
          transition: left 0.6s;
        }

        .nav-link:hover::before {
          left: 100%;
        }

        .nav-link:hover,
        .nav-link.active {
          color: #facc15;
          background: rgba(250, 204, 21, 0.1);
          transform: translateY(-2px);
        }

        .nav-icon {
          font-size: 1.1rem;
          transition: transform 0.3s ease;
        }

        .nav-link:hover .nav-icon {
          transform: scale(1.2);
        }

        /* Right Section */
        .nav-right {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        /* Notification Button */
        .notification-btn {
          position: relative;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: #cbd5e1;
          padding: 10px;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .notification-btn:hover {
          color: #facc15;
          background: rgba(250, 204, 21, 0.1);
          transform: translateY(-2px);
        }

        .notification-dot {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 8px;
          height: 8px;
          background: #ef4444;
          border-radius: 50%;
          border: 2px solid #0f172a;
        }

        /* User Menu */
        .user-menu-container {
          position: relative;
        }

        .user-profile-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(96, 165, 250, 0.2);
          color: #cbd5e1;
          padding: 8px 16px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .user-profile-btn:hover {
          background: rgba(96, 165, 250, 0.1);
          border-color: rgba(96, 165, 250, 0.4);
          transform: translateY(-2px);
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #60a5fa, #a78bfa);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .user-name {
          font-weight: 500;
          font-size: 0.9rem;
        }

        .chevron {
          transition: transform 0.3s ease;
        }

        .chevron.rotate {
          transform: rotate(180deg);
        }

        /* User Dropdown */
        .user-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 8px;
          background: rgba(30, 41, 59, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(96, 165, 250, 0.2);
          border-radius: 16px;
          padding: 1rem;
          min-width: 220px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          animation: dropdownSlide 0.3s ease;
        }

        @keyframes dropdownSlide {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .user-info {
          padding: 0.5rem 0;
          border-bottom: 1px solid rgba(96, 165, 250, 0.2);
          margin-bottom: 0.5rem;
        }

        .user-role {
          color: #facc15;
          font-weight: 700;
          font-size: 0.9rem;
        }

        .user-email {
          color: #94a3b8;
          font-size: 0.8rem;
          margin-top: 2px;
        }

        .dropdown-divider {
          height: 1px;
          background: rgba(96, 165, 250, 0.2);
          margin: 0.5rem 0;
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 0.8rem 1rem;
          color: #cbd5e1;
          text-decoration: none;
          border: none;
          background: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.9rem;
        }

        .dropdown-item:hover {
          background: rgba(96, 165, 250, 0.1);
          color: #facc15;
          transform: translateX(4px);
        }

        .logout-item {
          color: #ef4444;
          margin-top: 0.5rem;
        }

        .logout-item:hover {
          color: #dc2626;
          background: rgba(239, 68, 68, 0.1);
        }

        /* Auth Buttons */
        .auth-buttons {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .login-btn {
          color: #cbd5e1;
          text-decoration: none;
          font-weight: 500;
          padding: 0.8rem 1.5rem;
          border-radius: 10px;
          transition: all 0.3s ease;
        }

        .login-btn:hover {
          color: #facc15;
          background: rgba(250, 204, 21, 0.1);
        }

        .signup-btn {
          background: linear-gradient(135deg, #facc15, #eab308);
          color: #1e293b;
          text-decoration: none;
          padding: 0.8rem 1.5rem;
          border-radius: 12px;
          font-weight: 700;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          box-shadow: 0 4px 15px rgba(250, 204, 21, 0.3);
        }

        .signup-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(250, 204, 21, 0.4);
        }

        .btn-text {
          font-size: 0.9rem;
          font-weight: 700;
        }

        .btn-subtext {
          font-size: 0.7rem;
          opacity: 0.8;
          font-weight: 500;
        }

        /* Mobile Menu Button */
        .mobile-menu-btn {
          display: none;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(96, 165, 250, 0.2);
          color: white;
          cursor: pointer;
          padding: 8px;
          border-radius: 10px;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .mobile-menu-btn:hover {
          background: rgba(96, 165, 250, 0.1);
          transform: scale(1.1);
        }

        .mobile-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 999;
        }

        /* Mobile Styles */
        @media (max-width: 992px) {
          .announcement-content span:not(.announcement-badge) {
            display: none;
          }

          .nav-menu {
            position: fixed;
            top: 130px;
            left: 0;
            width: 100%;
            background: rgba(15, 23, 42, 0.98);
            backdrop-filter: blur(30px);
            flex-direction: column;
            padding: 2rem;
            gap: 1rem;
            transform: translateX(-100%);
            transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            z-index: 1001;
            border-top: 1px solid rgba(96, 165, 250, 0.2);
          }

          .nav-menu.open {
            transform: translateX(0);
          }

          .nav-link {
            justify-content: center;
            font-size: 1.2rem;
            padding: 1rem 1.5rem;
            border-radius: 16px;
          }

          .auth-buttons {
            display: none;
          }

          .user-menu-container {
            display: none;
          }

          .notification-btn {
            display: none;
          }

          .mobile-menu-btn {
            display: block;
          }

          .navbar-container {
            padding: 0 1.5rem;
            height: 70px;
          }
        }

        @media (max-width: 480px) {
          .logo-primary {
            font-size: 1.5rem;
          }
          
          .logo-accent {
            font-size: 0.8rem;
          }
          
          .logo-icon {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </>
  );
}