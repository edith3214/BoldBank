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
              <h2 className="mb-0 site-title">BankName</h2>
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
                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDtn4nXND747YcU6rdEkz24de3P4gH-mt631Er4f_65NRGAh_EjfCon_Hy-9T5jqEzzb5kiip3Vuap1a4W8dUGkjcvIngY138BhAx5acuIOdeG49SdhasFp-A6h9TvBWo8CfOxTT2bjifJkSw-WpaUK4lM-ILXkKChHxWUvENhqgnr1achfKWnZEnfW5mIyH3cnXvqobmBwDi1exoI1ghnKJ7S9uC3BOks8SPC8tdPjkRg4PFEc9wsCIXznp5SqnnAGtsNrhwaR_Lqi")'
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
                          'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDFnKKNdG_6d8ImQvVPEKB3zrN4qCx9i8DyoJZJ0SvTWPJEoVmVbqahkcgjsgDDga89QlVRkKFlWDgiaGugQwjhBNrV0JXTcoA4-oS5GyjVEW0E89kDvCKQf_eXeCBFXqGeH1wWz9Pwjt5ZRofasV5wbDCr54JdBybLRHY7qpl3TCzH2fzWjAfY-9uwGYDZiSBOThEPKDEOSQTEAae9zeFU9cPO8JdBZbY0nCjyXPzXRIL3p2u-VmxAqIAgxPxHhGS4woqWIE5zd_5z")',
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
