// src/pages/LoginPage.jsx
import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../TrustBankLogin.css"; // Optional for exact Tailwind colors
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <div className="container-fluid d-flex align-items-center justify-content-center" style={{ minHeight: "100vh", background: "#fff" }}>
      {/* Constrain width for large screens but be full-width on mobile */}
      <div className="w-100" style={{ maxWidth: 1100, padding: 16, boxSizing: "border-box" }}>
        {/* Keep your existing two-column layout inside this row */}
        <div className="row g-0 shadow-sm rounded overflow-hidden">
          {/* Left image column (unchanged) */}
          <div className="d-none d-lg-flex col-lg-6 flex-column justify-content-center align-items-center p-5 bg-light">
            <div className="w-100" style={{ maxWidth: "400px" }}>
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBuj1Yf4yyham9vfRAsGjJ5uVsN_o5WRPe8J3X4g9BYmb_DYxLlXovGAnAr_2SxSY66db2QL22Uhym2mkEqKlKtWWKb2T3EX8z0eLA1PwC6yYmOybPvlJJL8EVuYONhHLtL6KjY_WH5k5q7t6sgCwEGmRI7gzPMVRbWjv_mQ3pMLVa6R4k1d5WPhfV_hFZNCFJ8D4un8fPz1L2Q7F8bOD4oZLE1E-7hvgUIyW4ajmqYwVuFI6sZ8fuGiz2PrwTw9tJ7fRagnGuU11s0"
                alt="Abstract blue and white geometric shapes"
                className="img-fluid rounded-4 shadow-lg"
              />
            </div>
          </div>

          {/* Right form column (unchanged) */}
          <div className="col-12 col-lg-6 d-flex flex-column justify-content-center align-items-center p-4 p-sm-5">
            <div className="w-100" style={{ maxWidth: "400px" }}>
              {/* Header */}
              <header className="d-flex align-items-center gap-3 mb-4">
                <div className="text-primary" style={{ width: "32px", height: "32px" }}>
                  <svg
                    fill="currentColor"
                    viewBox="0 0 48 48"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g clipPath="url(#clip0_6_319)">
                      <path d="M8.57829 8.57829C5.52816 11.6284 3.451 15.5145 2.60947 19.7452C1.76794 23.9758 2.19984 28.361 3.85056 32.3462C5.50128 36.3314 8.29667 39.7376 11.8832 42.134C15.4698 44.5305 19.6865 45.8096 24 45.8096C28.3135 45.8096 32.5302 44.5305 36.1168 42.134C39.7033 39.7375 42.4987 36.3314 44.1494 32.3462C45.8002 28.361 46.2321 23.9758 45.3905 19.7452C44.549 15.5145 42.4718 11.6284 39.4217 8.57829L24 24L8.57829 8.57829Z" />
                    </g>
                    <defs>
                      <clipPath id="clip0_6_319">
                        <rect fill="white" width="48" height="48" />
                      </clipPath>
                    </defs>
                  </svg>
                </div>
                <h1 className="fw-bold fs-4 mb-0 text-primary">Trust Bank</h1>
              </header>

              {/* Page Title */}
              <div className="mb-4">
                <h2 className="fw-black fs-1 text-dark">Secure Log In</h2>
                <p className="text-muted mt-2">
                  Welcome back! Please enter your details.
                </p>
              </div>

              {/* Form */}
              <form className="mb-4" onSubmit={handleSubmit}>
                {/* Email Field */}
                <div className="mb-3">
                  <label htmlFor="email" className="form-label fw-semibold">
                    Email Address
                  </label>
                  <div className="position-relative">
                    <span
                      className="material-symbols-outlined position-absolute text-secondary"
                      style={{ left: "12px", top: "50%", transform: "translateY(-50%)" }}
                    >
                      mail
                    </span>
                    <input
                      id="email"
                      type="email"
                      className="form-control ps-5 py-3 rounded-3 bg-light border"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="mb-2">
                  <label htmlFor="password" className="form-label fw-semibold">
                    Password
                  </label>
                  <div className="position-relative">
                    <span
                      className="material-symbols-outlined position-absolute text-secondary"
                      style={{ left: "12px", top: "50%", transform: "translateY(-50%)" }}
                    >
                      lock
                    </span>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      className="form-control ps-5 pe-5 py-3 rounded-3 bg-light border"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="btn position-absolute end-0 top-50 translate-middle-y me-2 p-0 text-secondary"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label="toggle password visibility"
                    >
                      <span className="material-symbols-outlined">
                        {showPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Forgot Password */}
                <div className="text-end mb-3">
                  <a href="#" className="text-primary text-decoration-none small">
                    Forgot Password?
                  </a>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  className="btn btn-primary w-100 py-3 fw-semibold shadow-sm"
                >
                  Log In
                </button>

                {/* Sign Up Link */}
                <p className="text-center mt-3 text-muted small">
                  Don’t have an account?{" "}
                  <a href="#" className="fw-semibold text-primary text-decoration-none">
                    Sign Up
                  </a>
                </p>
              </form>

              {/* Footer */}
              <footer className="text-center text-muted small mt-5">
                <div className="d-flex justify-content-center align-items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-success fs-6">lock</span>
                  <span>Your connection is secure</span>
                </div>
                <div className="d-flex justify-content-center gap-2">
                  <a href="#" className="text-muted text-decoration-none">
                    Security Center
                  </a>
                  <span>•</span>
                  <a href="#" className="text-muted text-decoration-none">
                    Privacy Policy
                  </a>
                  <span>•</span>
                  <a href="#" className="text-muted text-decoration-none">
                    Contact Us
                  </a>
                </div>
                <p className="mt-3 mb-0">© 2024 Trust Bank. All Rights Reserved.</p>
              </footer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
