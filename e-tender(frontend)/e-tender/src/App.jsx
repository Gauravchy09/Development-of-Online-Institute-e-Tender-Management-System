import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import Features from "./components/Features";
import About from "./components/About";
import HowItWorks from "./components/HowItWorks";
import Testimonials from "./components/Testimonials";
import CallToAction from "./components/CallToAction";

import Login from "./pages/Login";
import Signup from "./pages/Signup";

// Dashboards
import VendorDashboard from "./pages/vendor/VendorDashboard";
import InstituteDashboard from "./pages/institute/InstituteDashboard";
import DepartmentDashboard from "./pages/department/dashboard";

// Department Pages
import DepartmentHome from "./pages/department/DepartmentHome";
import InstituteInfo from "./pages/department/InstituteInfo";
import TendersPage from "./pages/department/TendersPage";
import NotificationsPage from "./pages/department/NotificationsPage";
import ProfilePage from "./pages/department/ProfilePage";

// Vendor Pages (optional: you can create separate pages for nested routes if needed)
import VendorHome from "./pages/vendor/VendorHome";
import VendorTenders from "./pages/vendor/VendorTenders";
import VendorBids from "./pages/vendor/VendorBids";
import VendorNotifications from "./pages/vendor/VendorNotifications";
import VendorAccount from "./pages/vendor/VendorAccount";

function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");
  const roles = JSON.parse(localStorage.getItem("roles") || "[]");

  if (!token || !roles.some((role) => allowedRoles.includes(role))) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <Router>
      <div className="app-container flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            {/* Public routes */}
            <Route
              path="/"
              element={
                <>
                  <Hero />
                  <Features />
                  {/* <About /> */}
                  {/* <HowItWorks /> */}
                  {/* <Testimonials /> */}
                  {/* <CallToAction /> */}
                </>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Vendor Dashboard */}
            <Route
              path="/vendor/dashboard/*"
              element={
                <ProtectedRoute allowedRoles={["VENDOR"]}>
                  <VendorDashboard />
                </ProtectedRoute>
              }
            >
              {/* Nested routes for Vendor */}
              <Route index element={<VendorHome />} />
              <Route path="tenders" element={<VendorTenders />} />
              <Route path="bids" element={<VendorBids />} />
              <Route path="notifications" element={<VendorNotifications />} />
              <Route path="account" element={<VendorAccount />} />
            </Route>

            {/* Institute Dashboard */}
            <Route
              path="/institute/dashboard/*"
              element={
                <ProtectedRoute allowedRoles={["INSTITUTE_ADMIN"]}>
                  <InstituteDashboard />
                </ProtectedRoute>
              }
            />

            {/* Department Dashboard with nested routes */}
            <Route
              path="/department/dashboard/*"
              element={
                <ProtectedRoute allowedRoles={["DEPARTMENT"]}>
                  <DepartmentDashboard />
                </ProtectedRoute>
              }
            >
              <Route index element={<DepartmentHome />} />
              <Route path="institute-info" element={<InstituteInfo />} />
              <Route path="tenders" element={<TendersPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
