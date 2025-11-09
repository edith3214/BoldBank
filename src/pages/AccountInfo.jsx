// src/pages/AccountInfo.jsx
import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../AccountSettings.css";
import { useProfile } from "../context/ProfileContext";

export default function AccountInfo() {
  const { profile } = useProfile();
  return (
    <div className="account-page d-flex min-vh-100">
      {/* Sidebar (hidden on small screens like original) */}
      <aside className="sidebar d-none d-lg-flex flex-column justify-between p-4">
        <div>
          <div className="brand d-flex align-items-center gap-3 mb-4">
            <span className="material-icons-outlined brand-icon">account_balance</span>
            <h1 className="brand-title mb-0">TrustBank</h1>
          </div>

          <nav className="nav flex-column gap-2">
            <a href="#" className="nav-item d-flex align-items-center gap-3 px-3 py-2 rounded-lg">
              <span className="material-icons-outlined">home</span>
              <span>Dashboard</span>
            </a>
            <a href="#" className="nav-item d-flex align-items-center gap-3 px-3 py-2 rounded-lg">
              <span className="material-icons-outlined">swap_horiz</span>
              <span>Transactions</span>
            </a>
            <a href="#" className="nav-item d-flex align-items-center gap-3 px-3 py-2 rounded-lg">
              <span className="material-icons-outlined">credit_card</span>
              <span>Cards</span>
            </a>
            <a href="#" className="nav-item nav-item-active d-flex align-items-center gap-3 px-3 py-2 rounded-lg">
              <span className="material-icons-outlined">person</span>
              <span>Profile</span>
            </a>
            <a href="#" className="nav-item d-flex align-items-center gap-3 px-3 py-2 rounded-lg">
              <span className="material-icons-outlined">settings</span>
              <span>Settings</span>
            </a>
          </nav>
        </div>

        <div>
          <a href="#" className="nav-item d-flex align-items-center gap-3 px-3 py-2 rounded-lg">
            <span className="material-icons-outlined">logout</span>
            <span>Logout</span>
          </a>
        </div>
      </aside>

      {/* Main content */}
      <main className="content flex-grow-1 p-4 p-sm-5 p-md-6 overflow-auto">
        <div className="container-xl px-0">
          {/* Header */}
          <header className="d-flex align-items-center justify-content-between mb-4">
            <h2 className="h3 mb-0">My Profile</h2>
            <div className="d-flex align-items-center gap-2">
              <button className="btn btn-icon" aria-label="notifications">
                <span className="material-icons-outlined">notifications</span>
              </button>
              <button className="btn btn-icon" aria-label="settings">
                <span className="material-icons-outlined">settings</span>
              </button>
            </div>
          </header>

          <div className="stack vstack gap-4">
            {/* Account Holder Information */}
            <section>
              <h3 className="section-title">Account Holder Information</h3>

              <div className="card surface p-3 d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-3">
                  <img
                    src={profile?.avatarUrl || "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAflBMVEX///8AAAD8/PxTU1Pp6emDg4Pz8/NNTU3Hx8fAwMDv7+92dnYxMTH09PT39/fMzMxYWFjd3d1HR0djY2PW1tYLCwsbGxuhoaG6urqurq7Jyck+Pj5/f38jIyPCwsJubm6UlJSoqKg3NzcuLi6NjY1BQUFwcHAUFBSRkZEdHR0W9z0ZAAAFc0lEQVR4nO2d2ZLiMAxFs7OkIWwNJNAQAr39/w8OGWqGAFnsWJGUKp1nHnzLsSRrMZYlCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCAI6zjjZ+MdBlmWDo79Jxg71gmAJhv7OfmTnJwH1ssBY7T/sMj72K+qlgXBwS+XdcIfUyzNmtajRl7Po9z4GXw36csIen8fRt4JA216PqBfaEsdX0pfj99J3jAfKAm17MKZerj7eWUPg1XPMqResy+pdS6Btv/fMpq409eX0SuJcdwdzvnv0oY7Lo7QmPnpjbpzPVgKvFpV65aqELQVe/SL10tWIWwu07S314lXwDATa6z4cxaWJQjukXn4zIyOBth1RC2jCeTNUyN6empiZGwdqCQ2sjRUuqCXUczAWyD0+nQEoZG1OxwACbXtKLaOGLYhCzrbmCKKQ82dq6gxvnKllVGMUkhbgexWOgBTyTfWbBzQ3NtRCKkmBFPI1NXsghTNqIZWo1GFU4Hu/gHGHnINvqD38ZFuoaZ9ke4TvHl6AFLrUQio5ASlcUgupBOL+m8PXH7apOJXBN6bx1Or2jfCNS60MRiHfuwWQQ3yjllEDzOViTy2jhjmIQs55GusXQiHbmC1HvUmoGr7eMAfCI/LOeVt6fUJl8A27b5hbU8bu/i+O6SbyvVf8wzSxz74GbFl1Tc/N8DakN4y8/m8fejGsjYHCnnQLty+T9qQnypq0a9zj7wrvtDyK/elNtKxhK4WML76vtPGKzOPRZ7QlfvfA1T+i2d/20bMdzNHq1t951Mttg9c01HUn5NxCU4PyWFBMvVItglPhg4tU7lLLghv0ThP8JeuRXOOZn/s356RNp3FXyKxNf64mJyFYtQa3qDsrWH7vpy6GG2wLibXoljLnW7W47tj/EumlsPBgeyzfyO/9qvAz53/1MWSbTpwULr+LB/M/WaXPDe6fl+ThyHmFYT6X6WF8msd7GZ0Iou3msg9DPz1t58/b9BgDnVm6x5dUqcZ87+u8MMMQp6Sn7Vd1AmZbUgxgF6aWh6Guyjqj8twVs4RG5VVi1qQxqsx5sJqBqrtIZKfq8xic6qrGjHaxqQdjFpfZRi9uSlmxKSSqFJzewk3kBdPcSTjTwIs2oUrHNBOLqtH7/LZwXXeh0Q3Owi8GQA0YpWQcohuzecMmGDSAQXU+V5FSC2yXGdWBuGIamE/jNbGmfb4Gqu+5DtKjaDr0qwZhbDPt/hvNWdPlGiH6g1QgKyvCdLGpQFWV6tbXFyEyNlCTairQ3PjxtpBoE6Ha1tWguEdhbiHJJkJNxKqCf1OEmgBS5YIt0EEWiN8bjRORFsFOLkI8gKEH8ugstp3JwbU1UHPpOuBW+/E/UuTP1GvzLqIp75ifKb4lzcG860ONNOuB2AM+7TLNXU2Gl83Au9w/gnfVN+lVNwGv0wb34nQH7Qo1JRKI9wpY97WKKrBqGFhp0lewEqdUxxDvIAYUUWnODK0MNaXZxSVm/QKjqvbMEVGfRRGZok8mYhtUgvoTbjoRPZmY03UXRpGUQiBmAE7W3H5CEniiEgj15mwTpI2mw+5TUu/ELUNzmGdnqzmTT5aOuw1SXQ6zwV06RiYPKnWXPWXTzO6ZvYVRxYD8CBbowvmnvAa85jr/sqbCjkkXewHYbUyp5ZQxhrsWz1j06JewgvlUPzk/FTVq+3dddzI2LqIcZ6s+hV/GLuY/mu8c2sdx7oiXh6hk3u5x9pCfg6jG2eqGOW7ck+2748Wu6qO76/LxvR7gHfbNdmfgDznckFrjeEn6VSVzkQ8lUq8QBGfiJXHqh7PBLsuy3WD55adx4k16d/IEQRAEQRAEQRAEQRAEQRAEQRAEQRAEQRAEoe/8ATcAUDkmKZUPAAAAAElFTkSuQmCC"}
                    alt="Profile"
                    className="rounded-circle profile-pic"
                  />
                  <div>
                    <h4 className="mb-1">{profile?.name}</h4>
                    <p className="muted mb-0">{profile?.accountNumber}</p>
                  </div>
                </div>

                <button className="btn btn-outline-secondary d-flex align-items-center gap-2">
                  <span className="material-icons-outlined">edit</span>
                  <span>Edit</span>
                </button>
              </div>
            </section>

            {/* Premium Access Banner */}
            <section>
              <div className="premium-banner p-4 rounded-lg position-relative overflow-hidden d-flex align-items-center justify-content-between">
                <div className="z-10 text-white">
                  <h4 className="h5 d-flex align-items-center gap-2 mb-2">
                    <span className="material-icons-outlined text-danger">payments</span>
                    Premium Access
                  </h4>
                  <p className="text-white-60 mb-2 max-w-50">Upgrade to Premium to unlock exclusive benefits, higher transaction limits, and personalized support.</p>
                  <button className="btn btn-premium mt-2">Unlock Access</button>
                </div>

                <div className="decor position-absolute top-0 end-0 text-white-10">
                  <span className="material-icons-outlined" style={{ fontSize: 200 }}>lock</span>
                </div>
              </div>
            </section>

            {/* Account Summary */}
            <section>
              <h3 className="section-title">Account Summary</h3>

              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <div className="card surface p-3">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h5 className="mb-0 muted">Card Balance</h5>
                      <span className="muted small">...9874</span>
                    </div>
                    <p className="display-amount mb-0">*****</p>
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <div className="card surface p-3">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h5 className="mb-0 muted">Card Balance</h5>
                      <span className="muted small">...5697</span>
                    </div>
                    <p className="display-amount mb-0">*****</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Settings Links */}
            <section>
              <h3 className="section-title">Settings</h3>

              <div className="settings-list d-grid gap-2">
                <a href="#" className="setting-row d-flex align-items-center justify-content-between p-3 rounded-lg">
                  <div className="d-flex align-items-center gap-3">
                    <div className="icon-circle bg-surface p-2 rounded-circle">
                      <span className="material-icons-outlined">person_outline</span>
                    </div>
                    <span>Edit Profile</span>
                  </div>
                  <span className="material-icons-outlined muted">chevron_right</span>
                </a>

                <a href="#" className="setting-row d-flex align-items-center justify-content-between p-3 rounded-lg">
                  <div className="d-flex align-items-center gap-3">
                    <div className="icon-circle bg-surface p-2 rounded-circle">
                      <span className="material-icons-outlined">badge</span>
                    </div>
                    <span>Personal Documents</span>
                  </div>
                  <span className="material-icons-outlined muted">chevron_right</span>
                </a>

                <a href="#" className="setting-row d-flex align-items-center justify-content-between p-3 rounded-lg">
                  <div className="d-flex align-items-center gap-3">
                    <div className="icon-circle bg-surface p-2 rounded-circle">
                      <span className="material-icons-outlined">mail_outline</span>
                    </div>
                    <span>Email &amp; Alerts</span>
                  </div>
                  <span className="material-icons-outlined muted">chevron_right</span>
                </a>

                <a href="#" className="setting-row d-flex align-items-center justify-content-between p-3 rounded-lg">
                  <div className="d-flex align-items-center gap-3">
                    <div className="icon-circle bg-surface p-2 rounded-circle">
                      <span className="material-icons-outlined">security</span>
                    </div>
                    <span>Security &amp; Password</span>
                  </div>
                  <span className="material-icons-outlined muted">chevron_right</span>
                </a>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
