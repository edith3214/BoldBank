import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../Profile.css"; // small stylesheet to restore exact colors/sizes

export default function ProfilePage() {
  return (
    <div className="userprofile-root d-flex min-vh-100">
      <div className="container-fluid p-0">
        <div className="d-flex flex-column min-vh-100">

          {/* Top Nav */}
          <header className="d-flex align-items-center justify-content-between border-bottom px-3 px-md-4 px-lg-5 py-2">
            <div className="d-flex align-items-center gap-3 text-primary">
              <div className="logo-svg" aria-hidden>
                <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="currentColor">
                  <path clipRule="evenodd" d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z" />
                  <path clipRule="evenodd" d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z" />
                </svg>
              </div>
              <h2 className="mb-0 site-title">Trust Bank</h2>
            </div>

            <div className="d-none d-md-flex flex-grow-1 justify-content-center">
              <div className="d-flex align-items-center gap-4 nav-links">
                <a href="#" className="nav-link-like">Dashboard</a>
                <a href="#" className="nav-link-like">Transfers</a>
                <a href="#" className="nav-link-like">Accounts</a>
                <a href="#" className="nav-link-active">Profile</a>
              </div>
            </div>

            <div className="d-flex align-items-center gap-2">
              <button className="btn icon-btn" type="button" aria-label="notifications">
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <button className="btn icon-btn" type="button" aria-label="settings">
                <span className="material-symbols-outlined">settings</span>
              </button>

              <div
                className="avatar-lg ms-2"
                role="img"
                aria-label="User profile picture for Roberto"
                style={{
                  backgroundImage:
                    'url("data:image/png;base64,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")'
                }}
              />
            </div>
          </header>

          {/* Main */}
          <main
            className="flex-grow-1 px-3 px-sm-4 px-lg-5 py-4 overflow-auto"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            <div className="mx-auto" style={{ maxWidth: 1150 }}>

              {/* Profile Header */}
              <div className="d-flex p-3 mb-4 align-items-start">
                <div className="d-flex w-100 flex-column flex-sm-row justify-content-between align-items-center gap-3">
                  <div className="d-flex align-items-center gap-4">
                    <div
                      className="profile-avatar-xl"
                      role="img"
                      aria-label="User profile picture for Roberto"
                      style={{
                        backgroundImage:
                          'url("data:image/png;base64,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")',
                      }}
                    />
                    <div>
                      <p className="display-name mb-1">Roberto</p>
                      <p className="account-info mb-0">Account: 77990250980</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Accordions (details/summary preserve same interaction) */}
              <div className="accordions">

                {/* Personal Info */}
                <details className="accordion-item" open>
                  <summary className="accordion-summary d-flex align-items-center justify-content-between px-2 py-3">
                    <p className="accordion-title mb-0">Personal Info</p>
                    <span className="material-symbols-outlined">expand_more</span>
                  </summary>
                  <div className="accordion-body px-2 pb-3 pt-2">
                    <div className="info-row d-flex align-items-center justify-content-between px-3 py-2 border-bottom">
                      <div className="d-flex align-items-center gap-3">
                        <div className="icon-circle"><span className="material-symbols-outlined">person</span></div>
                        <div>
                          <div className="muted-label">Full Name</div>
                          <div className="info-value">Roberto</div>
                        </div>
                      </div>
                      <button className="btn btn-link text-primary">Edit</button>
                    </div>

                    <div className="info-row d-flex align-items-center justify-content-between px-3 py-2 border-bottom">
                      <div className="d-flex align-items-center gap-3">
                        <div className="icon-circle"><span className="material-symbols-outlined">cake</span></div>
                        <div>
                          <div className="muted-label">Date of Birth</div>
                          <div className="info-value">January 1, 1985</div>
                        </div>
                      </div>
                      <button className="btn btn-link text-primary">Edit</button>
                    </div>

                    <div className="info-row d-flex align-items-center justify-content-between px-3 py-2 border-bottom">
                      <div className="d-flex align-items-center gap-3">
                        <div className="icon-circle"><span className="material-symbols-outlined">call</span></div>
                        <div>
                          <div className="muted-label">Contact Number</div>
                          <div className="info-value">+1 (555) 123-4567</div>
                        </div>
                      </div>
                      <button className="btn btn-link text-primary">Edit</button>
                    </div>

                    <div className="info-row d-flex align-items-center justify-content-between px-3 py-2">
                      <div className="d-flex align-items-center gap-3">
                        <div className="icon-circle"><span className="material-symbols-outlined">mail</span></div>
                        <div>
                          <div className="muted-label">Email Address</div>
                          <div className="info-value">roberto@email.com</div>
                        </div>
                      </div>
                      <button className="btn btn-link text-primary">Edit</button>
                    </div>
                  </div>
                </details>

                {/* Residential Address */}
                <details className="accordion-item">
                  <summary className="accordion-summary d-flex align-items-center justify-content-between px-2 py-3">
                    <p className="accordion-title mb-0">Residential Address</p>
                    <span className="material-symbols-outlined">expand_more</span>
                  </summary>
                  <div className="accordion-body px-2 pb-3 pt-2">
                    <div className="info-row d-flex align-items-center justify-content-between px-3 py-2">
                      <div className="d-flex align-items-center gap-3">
                        <div className="icon-circle"><span className="material-symbols-outlined">home</span></div>
                        <div>
                          <div className="muted-label">Mailing Address</div>
                          <div className="info-value">123 Banking Lane, Finance City, 12345</div>
                        </div>
                      </div>
                      <button className="btn btn-link text-primary">Change</button>
                    </div>
                  </div>
                </details>

                {/* Security Settings */}
                <details className="accordion-item">
                  <summary className="accordion-summary d-flex align-items-center justify-content-between px-2 py-3">
                    <p className="accordion-title mb-0">Security Settings</p>
                    <span className="material-symbols-outlined">expand_more</span>
                  </summary>
                  <div className="accordion-body px-2 pb-3 pt-2">
                    <div className="info-row d-flex align-items-center justify-content-between px-3 py-2 border-bottom">
                      <div className="d-flex align-items-center gap-3">
                        <div className="icon-circle"><span className="material-symbols-outlined">password</span></div>
                        <div className="info-value">Change Password</div>
                      </div>
                      <button className="btn btn-link text-primary">Change</button>
                    </div>

                    <div className="info-row d-flex align-items-center justify-content-between px-3 py-2 border-bottom">
                      <div className="d-flex align-items-center gap-3">
                        <div className="icon-circle"><span className="material-symbols-outlined">phonelink_lock</span></div>
                        <div className="info-value">Manage Two-Factor Authentication</div>
                      </div>
                      <button className="btn btn-link text-primary">Manage</button>
                    </div>

                    <div className="info-row d-flex align-items-center justify-content-between px-3 py-2">
                      <div className="d-flex align-items-center gap-3">
                        <div className="icon-circle"><span className="material-symbols-outlined">history</span></div>
                        <div className="info-value">View Last Login Details</div>
                      </div>
                      <button className="btn btn-link text-primary">View</button>
                    </div>
                  </div>
                </details>

                {/* Account Preferences */}
                <details className="accordion-item">
                  <summary className="accordion-summary d-flex align-items-center justify-content-between px-2 py-3">
                    <p className="accordion-title mb-0">Account Preferences</p>
                    <span className="material-symbols-outlined">expand_more</span>
                  </summary>
                  <div className="accordion-body px-2 pb-3 pt-2">
                    <div className="info-row d-flex align-items-center justify-content-between px-3 py-2">
                      <div className="d-flex align-items-center gap-3">
                        <div className="icon-circle"><span className="material-symbols-outlined">drafts</span></div>
                        <div className="info-value">Paperless Statements</div>
                      </div>
                      <button className="btn btn-link text-primary">Manage</button>
                    </div>

                    <div className="info-row d-flex align-items-center justify-content-between px-3 py-2">
                      <div className="d-flex align-items-center gap-3">
                        <div className="icon-circle"><span className="material-symbols-outlined">notifications_active</span></div>
                        <div className="info-value">Notification Preferences</div>
                      </div>
                      <button className="btn btn-link text-primary">Manage</button>
                    </div>

                    <div className="info-row d-flex align-items-center justify-content-between px-3 py-2">
                      <div className="d-flex align-items-center gap-3">
                        <div className="icon-circle"><span className="material-symbols-outlined">privacy_tip</span></div>
                        <div className="info-value">Privacy Settings</div>
                      </div>
                      <button className="btn btn-link text-primary">Manage</button>
                    </div>
                  </div>
                </details>

              </div>

              {/* Actions */}
              <div className="d-flex justify-content-end gap-3 mt-4">
                <button className="btn cancel-btn">Cancel</button>
                <button className="btn save-btn">Save Changes</button>
              </div>

            </div>
          </main>

        </div>
      </div>
    </div>
  );
}
